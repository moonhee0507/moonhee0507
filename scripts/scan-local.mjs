// Scans local git clones (e.g. company Azure Repos) and writes anonymous aggregates
// to data/local-stack.json. No repo names, paths, or code leave the machine.
// Usage: node scripts/scan-local.mjs <repo-dir>...
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { IGNORED_PATH, labelsFromManifest, labelsFromPaths, languageOf, manifests, uniqueLabels } from './detect.mjs';

const MAX_MANIFESTS_PER_REPO = 20;
const OUT = new URL('../data/local-stack.json', import.meta.url);

const dirs = process.argv.slice(2);
if (dirs.length === 0) throw new Error('Usage: node scripts/scan-local.mjs <repo-dir>...');

const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });

const repos = [];
for (const dir of dirs) {
  const paths = git(dir, 'ls-files').split('\n').filter((p) => p && !IGNORED_PATH.test(p));

  const languages = {};
  for (const path of paths) {
    const lang = languageOf(path);
    if (!lang) continue;
    const { size } = await stat(join(dir, path)).catch(() => ({ size: 0 }));
    languages[lang] = (languages[lang] ?? 0) + size;
  }

  const hits = labelsFromPaths(paths);
  for (const { path, kind } of manifests(paths, MAX_MANIFESTS_PER_REPO)) {
    hits.push(...labelsFromManifest(kind, await readFile(join(dir, path), 'utf8')));
  }

  repos.push({
    pushed: Number(git(dir, 'log', '-1', '--format=%ct').trim()) * 1000,
    languages,
    labels: uniqueLabels(hits),
  });
}

await mkdir(new URL('.', OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ repos }, null, 2)}\n`);
console.log(`Scanned ${repos.length} repos -> data/local-stack.json`);
