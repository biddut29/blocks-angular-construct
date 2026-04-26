/* eslint-disable no-console */
/**
 * Writes `src/environments/environment.config.ts` from **process.env** only
 * (and optionally a local, gitignored `.env` that dotenv loads into `process.env`).
 * Do not put secrets in the repository — set VITE_* (or un-prefixed / NG_*) in CI, the shell, or a local .env.
 *
 * Usage: node scripts/apply-angular-env.cjs [profile]
 *   default — loads `.env` if present, then writes from process.env
 *   e.g. iat, dev, stg, prod — loads `.env.<profile>` if present, then writes
 * Override file path: set ANGULAR_ENV_FILE=./.env.iat
 */
const path = require('node:path');
const fs = require('node:fs');
const { config: loadEnv } = require('dotenv');

const root = path.join(__dirname, '..');
const outFile = path.join(root, 'src', 'environments', 'environment.config.ts');
const exampleFile = path.join(root, 'src', 'environments', 'environment.config.ts.example');

function ensureOutFile() {
  if (fs.existsSync(outFile)) return;
  if (fs.existsSync(exampleFile)) {
    fs.copyFileSync(exampleFile, outFile);
  } else {
    fs.writeFileSync(
      outFile,
      [
        'export const appConfig = {',
        "  blocksApiUrl: '',",
        "  apiBaseUrl: '',",
        "  xBlocksKey: '',",
        "  projectSlug: '',",
        "  captchaSiteKey: '',",
        "  captchaType: '',",
        '} as const;',
        '',
      ].join('\n'),
      'utf8',
    );
  }
}

function getEnv(...keys) {
  for (const k of keys) {
    const o = process.env[k];
    if (o != null && o !== '') return String(o);
  }
  for (const k of keys) {
    if (process.env[k] != null) return String(process.env[k]);
  }
  return '';
}

ensureOutFile();

const customFile = process.env.ANGULAR_ENV_FILE;
const profile = (process.argv[2] || 'default').toLowerCase();
let loadedFrom = '';

if (customFile) {
  const abs = path.isAbsolute(customFile) ? customFile : path.join(root, customFile);
  if (fs.existsSync(abs)) {
    loadEnv({ path: abs, override: true });
    loadedFrom = path.relative(root, abs).split(path.sep).join('/');
  } else {
    console.warn(`ANGULAR_ENV_FILE not found (skipped): ${path.relative(root, abs)}`);
  }
} else {
  const envPath =
    profile === 'default' ? path.join(root, '.env') : path.join(root, `.env.${profile}`);
  if (fs.existsSync(envPath)) {
    loadEnv({ path: envPath, override: true });
    loadedFrom = path.relative(root, envPath).split(path.sep).join('/');
  } else {
    if (profile !== 'default' || process.argv[2]) {
      console.warn(`No env file at ${path.basename(envPath)} (skipped) — using process.env only`);
    }
  }
}

const apiBase = getEnv('VITE_API_BASE_URL', 'API_BASE_URL', 'NG_API_BASE_URL');
const blocks = getEnv('VITE_BLOCKS_API_URL', 'BLOCKS_API_URL', 'NG_BLOCKS_API_URL') || apiBase;
const xKey = getEnv('VITE_X_BLOCKS_KEY', 'X_BLOCKS_KEY', 'NG_X_BLOCKS_KEY');
const slug = getEnv('VITE_PROJECT_SLUG', 'PROJECT_SLUG', 'NG_PROJECT_SLUG');
const capSite = getEnv('VITE_CAPTCHA_SITE_KEY', 'CAPTCHA_SITE_KEY', 'NG_CAPTCHA_SITE_KEY');
const capType = getEnv('VITE_CAPTCHA_TYPE', 'CAPTCHA_TYPE', 'NG_CAPTCHA_TYPE');

const allEmpty = !apiBase && !xKey && !slug && !blocks;
if (allEmpty) {
  console.warn(
    'No API env vars in process.env. Set VITE_API_BASE_URL, VITE_X_BLOCKS_KEY, etc. (e.g. in CI or a local .env).',
  );
}

const sourceNote = loadedFrom ? `Optional file merged into process.env: ${loadedFrom}. ` : '';
const lines = [
  '/**',
  ' * Auto-generated — do not commit. Values come from process.env at build/serve time.',
  ` * ${sourceNote}Regenerate: npm run env:apply`,
  ' */',
  'export const appConfig = {',
  `  blocksApiUrl: ${JSON.stringify(blocks || apiBase)},`,
  `  apiBaseUrl: ${JSON.stringify(apiBase || blocks)},`,
  `  xBlocksKey: ${JSON.stringify(xKey)},`,
  `  projectSlug: ${JSON.stringify(slug)},`,
  `  captchaSiteKey: ${JSON.stringify(capSite)},`,
  `  captchaType: ${JSON.stringify(capType)},`,
  '} as const;',
  '',
];

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
const rel = path.relative(root, outFile);
console.log(`Wrote ${rel} from process.env${loadedFrom ? ` (after ${loadedFrom})` : ''}`);
