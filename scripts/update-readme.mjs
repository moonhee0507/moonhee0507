// Rewrites the STACK block in README.md from the owner's own GitHub repositories,
// merged with data/local-stack.json (see scan-local.mjs).
// Requires GH_TOKEN with read access to all owned repos (private included).
import { readFile, writeFile } from 'node:fs/promises';
import { CATEGORIES, darkIconPath, IGNORED_LANGUAGES, iconUrl, IGNORED_PATH, labelsFromManifest, labelsFromPaths, manifests, uniqueLabels } from './detect.mjs';

const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) throw new Error('GH_TOKEN is not set');

const README = new URL('../README.md', import.meta.url);
const LOCAL = new URL('../data/local-stack.json', import.meta.url);
const SINCE = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
const EXCLUDED_REPOS = new Set(['projectdefenso']);
const MAX_MANIFESTS_PER_REPO = 20;
const TOP = { languages: 5, perRow: 6 };

async function gh(path, { raw = false, allow = [] } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (allow.includes(res.status)) return null;
  if (!res.ok) throw new Error(`${res.status} ${path}: ${await res.text()}`);
  return raw ? res.text() : res.json();
}

async function listRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`/user/repos?affiliation=owner&sort=pushed&per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

async function scanGitHubRepo(repo) {
  const tree = await gh(`/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`, { allow: [404, 409] });
  const paths = (tree?.tree ?? [])
    .filter((n) => n.type === 'blob' && !IGNORED_PATH.test(n.path))
    .map((n) => n.path);

  const hits = labelsFromPaths(paths);
  for (const { path, kind } of manifests(paths, MAX_MANIFESTS_PER_REPO)) {
    const text = await gh(`/repos/${repo.full_name}/contents/${encodeURI(path)}?ref=${repo.default_branch}`, { raw: true, allow: [404] });
    if (text) hits.push(...labelsFromManifest(kind, text));
  }

  return {
    pushed: Date.parse(repo.pushed_at),
    languages: await gh(`/repos/${repo.full_name}/languages`),
    labels: uniqueLabels(hits),
  };
}

async function readLocal() {
  try {
    return JSON.parse(await readFile(LOCAL, 'utf8')).repos;
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Keep the most used labels (by repo count, then most recent use), shown in CATEGORIES order.
function rank(usage, labels, limit) {
  const top = new Set(labels
    .filter((label) => usage.has(label))
    .sort((a, b) => usage.get(b).repos - usage.get(a).repos || usage.get(b).lastPushed - usage.get(a).lastPushed)
    .slice(0, limit));
  return labels.filter((label) => top.has(label));
}

const all = await listRepos();
const owner = all[0]?.owner.login;
const ghRepos = all.filter(
  (r) => !r.fork && r.name !== owner && !EXCLUDED_REPOS.has(r.name) && Date.parse(r.pushed_at) >= SINCE,
);

const scanned = [];
for (const repo of ghRepos) scanned.push(await scanGitHubRepo(repo));
scanned.push(...(await readLocal()).filter((r) => r.pushed >= SINCE));

const languageBytes = new Map();
const usage = new Map();

for (const { pushed, languages, labels } of scanned) {
  for (const [lang, bytes] of Object.entries(languages)) {
    if (!IGNORED_LANGUAGES.has(lang)) languageBytes.set(lang, (languageBytes.get(lang) ?? 0) + bytes);
  }
  for (const [, label] of labels) {
    const entry = usage.get(label) ?? { repos: 0, lastPushed: 0 };
    usage.set(label, { repos: entry.repos + 1, lastPushed: Math.max(entry.lastPushed, pushed) });
  }
}

const totalBytes = [...languageBytes.values()].reduce((a, b) => a + b, 0);
const languages = [...languageBytes.entries()]
  .map(([lang, bytes]) => [lang, Math.round((bytes / totalBytes) * 100)])
  .filter(([, pct]) => pct >= 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP.languages);

// Icon followed by its name, joined with &nbsp; so a line never breaks inside one item.
// Labels without a Devicon icon fall back to text.
function item(label, text = label) {
  const name = text.replaceAll(' ', '&nbsp;');
  const url = iconUrl(label);
  if (!url) return name;
  const img = `<img src="${url}" width="20" height="20" align="top" alt="">`;
  const dark = darkIconPath(label);
  const icon = dark
    ? `<picture><source media="(prefers-color-scheme: dark)" srcset="${dark}">${img}</picture>`
    : img;
  return `${icon}&nbsp;${name}`;
}

// A header-less HTML table keeps label/value columns aligned on GitHub.
const rows = [
  ['Languages', languages.map(([lang, pct]) => item(lang, `${lang} ${pct}%`))],
  ...Object.entries(CATEGORIES).map(([category, labels]) => [category, rank(usage, labels, TOP.perRow).map((l) => item(l))]),
].filter(([, items]) => items.length > 0);
const updatedAt = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short',
}).format(new Date());
const block = [
  '<table>',
  `<tr><td colspan="2" align="right"><sub>Updated ${updatedAt} UTC</sub></td></tr>`,
  ...rows.map(([label, items]) => `<tr><td><b>${label}</b></td><td>${items.join(' &nbsp; ')}</td></tr>`),
  '</table>',
].join('\n');

const readme = await readFile(README, 'utf8');
if (!readme.includes('<!-- STACK:START -->')) throw new Error('STACK markers not found in README.md');
const next = readme.replace(
  /(<!-- STACK:START -->)[\s\S]*?(<!-- STACK:END -->)/,
  `$1\n${block}\n$2`,
);
if (next === readme) {
  console.log('README unchanged');
} else {
  await writeFile(README, next);
  console.log(block);
}
