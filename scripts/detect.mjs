// Stack detection rules shared by update-readme.mjs (GitHub) and scan-local.mjs (local clones).

export const IGNORED_LANGUAGES = new Set([
  'HTML', 'CSS', 'SCSS', 'Sass', 'Less', 'Shell', 'PowerShell', 'Batchfile',
  'Dockerfile', 'Makefile', 'Procfile', 'MDX', 'HCL', 'Nix', 'JavaScript', 'Java', 'Solidity',
]);

// Paths that never count toward languages or manifests: dependencies, build output,
// committed bundles under public/static, and Yarn PnP loaders.
export const IGNORED_PATH = /(^|\/)(node_modules|vendor|dist|build|out|public|static|Pods|\.yarn|\.next)\/|\.min\.js$|(^|\/)\.pnp\./;

// npm package (exact or "scope/*") -> [kind, label]
const NPM = {
  next: ['fw', 'Next.js'], react: ['fw', 'React'], vue: ['fw', 'Vue'], nuxt: ['fw', 'Nuxt'],
  svelte: ['fw', 'Svelte'], '@sveltejs/kit': ['fw', 'SvelteKit'], '@angular/core': ['fw', 'Angular'],
  'react-native': ['fw', 'React Native'], expo: ['fw', 'Expo'], '@remix-run/react': ['fw', 'Remix'],
  astro: ['fw', 'Astro'], vite: ['fw', 'Vite'], electron: ['fw', 'Electron'],
  tailwindcss: ['fw', 'Tailwind CSS'], 'styled-components': ['fw', 'styled-components'],
  '@emotion/react': ['fw', 'Emotion'], '@vanilla-extract/css': ['fw', 'vanilla-extract'],
  '@tanstack/react-query': ['fw', 'TanStack Query'], 'react-query': ['fw', 'TanStack Query'],
  mobx: ['fw', 'MobX'], redux: ['fw', 'Redux'], '@reduxjs/toolkit': ['fw', 'Redux'], zustand: ['fw', 'Zustand'],
  recoil: ['fw', 'Recoil'], jotai: ['fw', 'Jotai'], xstate: ['fw', 'XState'],
  express: ['fw', 'Express'], '@nestjs/core': ['fw', 'NestJS'], fastify: ['fw', 'Fastify'],
  hono: ['fw', 'Hono'], koa: ['fw', 'Koa'], 'socket.io': ['fw', 'Socket.IO'],
  graphql: ['fw', 'GraphQL'], '@apollo/client': ['fw', 'Apollo'], '@trpc/server': ['fw', 'tRPC'],
  prisma: ['fw', 'Prisma'], '@prisma/client': ['fw', 'Prisma'], 'drizzle-orm': ['fw', 'Drizzle'],
  viem: ['fw', 'viem'], wagmi: ['fw', 'wagmi'], ethers: ['fw', 'ethers.js'], web3: ['fw', 'web3.js'],
  hardhat: ['fw', 'Hardhat'], '@openzeppelin/contracts': ['fw', 'OpenZeppelin'],
  d3: ['fw', 'D3'], three: ['fw', 'Three.js'],
  jest: ['fw', 'Jest'], vitest: ['fw', 'Vitest'], '@playwright/test': ['fw', 'Playwright'],
  cypress: ['fw', 'Cypress'], '@storybook/*': ['fw', 'Storybook'],
  mongoose: ['infra', 'MongoDB'], mongodb: ['infra', 'MongoDB'], pg: ['infra', 'PostgreSQL'],
  mysql2: ['infra', 'MySQL'], redis: ['infra', 'Redis'], ioredis: ['infra', 'Redis'],
  '@supabase/supabase-js': ['infra', 'Supabase'], firebase: ['infra', 'Firebase'],
  'firebase-admin': ['infra', 'Firebase'], '@react-native-firebase/*': ['infra', 'Firebase'],
  'aws-sdk': ['infra', 'AWS'], '@aws-sdk/*': ['infra', 'AWS'], '@azure/*': ['infra', 'Azure'],
  '@google-cloud/*': ['infra', 'GCP'], '@vercel/*': ['infra', 'Vercel'],
};

// substring in go.mod / Python manifests / JVM build files -> [kind, label]
const TEXT_DEPS = {
  go: {
    'github.com/gin-gonic/gin': ['fw', 'Gin'], 'github.com/labstack/echo': ['fw', 'Echo'],
    'github.com/gofiber/fiber': ['fw', 'Fiber'], 'github.com/gorilla/mux': ['fw', 'gorilla/mux'],
    'github.com/ethereum/go-ethereum': ['fw', 'go-ethereum'], 'gorm.io/gorm': ['fw', 'GORM'],
    'github.com/spf13/cobra': ['fw', 'Cobra'], 'github.com/aws/aws-sdk-go': ['infra', 'AWS'],
    'github.com/redis/go-redis': ['infra', 'Redis'], 'github.com/go-redis/redis': ['infra', 'Redis'],
    'go.mongodb.org/mongo-driver': ['infra', 'MongoDB'], 'github.com/jackc/pgx': ['infra', 'PostgreSQL'],
    'github.com/lib/pq': ['infra', 'PostgreSQL'],
  },
  python: {
    django: ['fw', 'Django'], fastapi: ['fw', 'FastAPI'], flask: ['fw', 'Flask'],
    pandas: ['fw', 'pandas'], numpy: ['fw', 'NumPy'], torch: ['fw', 'PyTorch'],
    tensorflow: ['fw', 'TensorFlow'], langchain: ['fw', 'LangChain'], anthropic: ['fw', 'Anthropic SDK'],
    openai: ['fw', 'OpenAI SDK'], selenium: ['fw', 'Selenium'], playwright: ['fw', 'Playwright'],
    pytest: ['fw', 'pytest'], web3: ['fw', 'web3.py'], boto3: ['infra', 'AWS'],
    psycopg: ['infra', 'PostgreSQL'], pymongo: ['infra', 'MongoDB'], redis: ['infra', 'Redis'],
  },
  jvm: { 'spring-boot': ['fw', 'Spring Boot'], junit: ['fw', 'JUnit'] },
};

// path test -> [kind, label]
const FILES = [
  [/(^|\/)foundry\.toml$/, ['fw', 'Foundry']],
  [/(^|\/)hardhat\.config\.(js|ts|cjs|mjs)$/, ['fw', 'Hardhat']],
  [/(^|\/)([\w.-]+\.)?Dockerfile$|(^|\/)(docker-)?compose[\w.-]*\.ya?ml$/, ['infra', 'Docker']],
  [/(^|\/)vercel\.json$/, ['infra', 'Vercel']],
  [/(^|\/)netlify\.toml$/, ['infra', 'Netlify']],
  [/^\.github\/workflows\/.+\.ya?ml$/, ['infra', 'GitHub Actions']],
  [/(^|\/)azure-pipelines[\w.-]*\.ya?ml$/, ['infra', 'Azure Pipelines']],
  [/\.bicep$/, ['infra', 'Azure']],
  [/\.tf$/, ['infra', 'Terraform']],
  [/(^|\/)serverless\.ya?ml$/, ['infra', 'Serverless']],
  [/(^|\/)wrangler\.(toml|jsonc?)$/, ['infra', 'Cloudflare Workers']],
  [/(^|\/)firebase\.json$/, ['infra', 'Firebase']],
  [/(^|\/)fly\.toml$/, ['infra', 'Fly.io']],
  [/(^|\/)cdk\.json$/, ['infra', 'AWS']],
  [/(^|\/)Chart\.yaml$/, ['infra', 'Helm']],
  [/(^|\/)kustomization\.ya?ml$/, ['infra', 'Kubernetes']],
  [/(^|\/)supabase\/config\.toml$/, ['infra', 'Supabase']],
  [/(^|\/)render\.yaml$/, ['infra', 'Render']],
  [/(^|\/)railway\.json$/, ['infra', 'Railway']],
];

const MANIFESTS = [
  [/(^|\/)package\.json$/, 'npm'],
  [/(^|\/)go\.mod$/, 'go'],
  [/(^|\/)(requirements[^/]*\.txt|pyproject\.toml|Pipfile)$/, 'python'],
  [/(^|\/)(pom\.xml|build\.gradle(\.kts)?)$/, 'jvm'],
];

// README rows. Within a row, detected labels are shown in the order listed here.
// Detected labels not listed here are not shown.
export const CATEGORIES = {
  Frontend: ['React', 'Tailwind CSS', 'Next.js', 'TanStack Query', 'Vite', 'MobX', 'Vue', 'Nuxt', 'Svelte',
    'SvelteKit', 'Angular', 'Remix', 'Astro', 'styled-components', 'Emotion', 'vanilla-extract', 'Redux',
    'Recoil', 'Jotai', 'XState', 'Apollo', 'D3', 'Three.js', 'Storybook'],
  Mobile: ['React Native', 'Electron'],
  Backend: ['NestJS', 'Express', 'Fastify', 'Hono', 'Koa', 'GraphQL', 'tRPC', 'Prisma', 'Drizzle',
    'Gin', 'Echo', 'Fiber', 'gorilla/mux', 'GORM', 'Cobra', 'Django', 'FastAPI', 'Flask', 'Spring Boot'],
  'Data / AI': ['pandas', 'NumPy', 'PyTorch', 'TensorFlow', 'LangChain', 'Anthropic SDK', 'OpenAI SDK'],
  Testing: ['Jest', 'Vitest', 'Playwright', 'Cypress', 'pytest', 'JUnit', 'Selenium'],
  Database: ['PostgreSQL', 'MySQL', 'Redis', 'Supabase', 'MongoDB'],
  'Cloud / DevOps': ['Azure', 'Firebase', 'AWS', 'GCP', 'Vercel', 'Netlify', 'Cloudflare Workers', 'Fly.io',
    'Render', 'Railway', 'Serverless', 'GitHub Actions', 'Docker', 'Kubernetes', 'Helm', 'Terraform',
    'Azure Pipelines'],
};

// Label -> Devicon icon path (pinned version, served by jsDelivr). Labels without an icon render as text only.
const DEVICON = 'https://cdn.jsdelivr.net/npm/devicon@2.18.0/icons';
const ICONS = {
  TypeScript: 'typescript/typescript-original', JavaScript: 'javascript/javascript-original',
  Python: 'python/python-original', Go: 'go/go-original-wordmark', Java: 'java/java-original',
  Kotlin: 'kotlin/kotlin-original', Swift: 'swift/swift-original', Solidity: 'solidity/solidity-original',
  Rust: 'rust/rust-original', 'C#': 'csharp/csharp-original', Dart: 'dart/dart-original',
  React: 'react/react-original', 'Next.js': 'nextjs/nextjs-original', Vue: 'vuejs/vuejs-original',
  Nuxt: 'nuxtjs/nuxtjs-original', Svelte: 'svelte/svelte-original', Angular: 'angular/angular-original',
  Astro: 'astro/astro-original', Vite: 'vitejs/vitejs-original', 'Tailwind CSS': 'tailwindcss/tailwindcss-original',
  Redux: 'redux/redux-original', MobX: 'mobx/mobx-original',
  Apollo: 'apollographql/apollographql-original', D3: 'd3js/d3js-original', 'Three.js': 'threejs/threejs-original',
  Storybook: 'storybook/storybook-original', 'React Native': 'reactnative/reactnative-original',
  Expo: 'expo/expo-original', Electron: 'electron/electron-original',
  Express: 'express/express-original', NestJS: 'nestjs/nestjs-original', Fastify: 'fastify/fastify-original',
  'Socket.IO': 'socketio/socketio-original', GraphQL: 'graphql/graphql-plain', tRPC: 'trpc/trpc-original',
  Prisma: 'prisma/prisma-original', Django: 'django/django-plain', FastAPI: 'fastapi/fastapi-original',
  Flask: 'flask/flask-original', 'Spring Boot': 'spring/spring-original', Hardhat: 'hardhat/hardhat-original',
  pandas: 'pandas/pandas-original', NumPy: 'numpy/numpy-original', PyTorch: 'pytorch/pytorch-original',
  TensorFlow: 'tensorflow/tensorflow-original', Jest: 'jest/jest-plain', Vitest: 'vitest/vitest-original',
  Playwright: 'playwright/playwright-original', Cypress: 'cypressio/cypressio-original',
  pytest: 'pytest/pytest-original', JUnit: 'junit/junit-original', Selenium: 'selenium/selenium-original',
  MongoDB: 'mongodb/mongodb-original', PostgreSQL: 'postgresql/postgresql-original', MySQL: 'mysql/mysql-original',
  Redis: 'redis/redis-original', Supabase: 'supabase/supabase-original',
  AWS: 'amazonwebservices/amazonwebservices-original', Azure: 'azure/azure-original',
  GCP: 'googlecloud/googlecloud-original', Firebase: 'firebase/firebase-original', Vercel: 'vercel/vercel-original',
  Netlify: 'netlify/netlify-original', 'Cloudflare Workers': 'cloudflareworkers/cloudflareworkers-original',
  Docker: 'docker/docker-original', Kubernetes: 'kubernetes/kubernetes-original', Helm: 'helm/helm-original',
  Terraform: 'terraform/terraform-original', 'GitHub Actions': 'githubactions/githubactions-original',
  'Azure Pipelines': 'azuredevops/azuredevops-original',
};

export function iconUrl(label) {
  return ICONS[label] && `${DEVICON}/${ICONS[label]}.svg`;
}

// White copies (in icons/dark/) of Devicon icons that are black and vanish on GitHub's dark theme.
const DARK_ICONS = { Express: 'express', 'Socket.IO': 'socketio', Solidity: 'solidity', Prisma: 'prisma' };

export function darkIconPath(label) {
  return DARK_ICONS[label] && `icons/dark/${DARK_ICONS[label]}.svg`;
}

// Rough stand-in for GitHub Linguist, used only for local clones.
const EXTENSIONS = {
  ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', cts: 'TypeScript',
  js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
  py: 'Python', go: 'Go', java: 'Java', kt: 'Kotlin', swift: 'Swift', m: 'Objective-C',
  sol: 'Solidity', rs: 'Rust', cs: 'C#', dart: 'Dart', vue: 'Vue', svelte: 'Svelte',
  rb: 'Ruby', php: 'PHP', c: 'C', cc: 'C++', cpp: 'C++', scala: 'Scala',
};

export function languageOf(path) {
  return EXTENSIONS[path.split('.').pop()];
}

export function labelsFromPaths(paths) {
  return paths.flatMap((path) => FILES.filter(([re]) => re.test(path)).map(([, hit]) => hit));
}

export function manifests(paths, limit) {
  return paths
    .flatMap((path) => MANIFESTS.filter(([re]) => re.test(path)).map(([, kind]) => ({ path, kind })))
    .slice(0, limit);
}

export function labelsFromManifest(kind, text) {
  if (kind !== 'npm') {
    const lower = text.toLowerCase();
    return Object.entries(TEXT_DEPS[kind])
      .filter(([needle]) => lower.includes(needle.toLowerCase()))
      .map(([, hit]) => hit);
  }
  let pkg;
  try { pkg = JSON.parse(text); } catch { return []; }
  const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies });
  return names.flatMap((name) => {
    const hit = NPM[name] ?? NPM[`${name.split('/')[0]}/*`];
    return hit ? [hit] : [];
  });
}

// Deduplicate [kind, label] pairs within one repo.
export function uniqueLabels(hits) {
  return [...new Map(hits.map(([kind, label]) => [`${kind}:${label}`, [kind, label]])).values()];
}
