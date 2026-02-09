import fs from 'node:fs';
import path from 'node:path';

/**
 * Migration verification / CI guard
 *
 * Scans ONLY service-layer folders and fails if it finds forbidden HTTP patterns:
 * - fetch(
 * - response.json(
 * - axios usage
 * - apiService.*
 * - legacy envelope parsing logic
 *
 * This is complementary to ESLint:
 * - ESLint blocks authors during development/CI linting
 * - This script provides a fast, grep-like guard for CI/build pipelines
 */

const CLIENT_ROOT = path.resolve(process.cwd());

const SCAN_DIRS = ['src/services', 'src/hooks', 'src/api']
  .map((p) => path.join(CLIENT_ROOT, p))
  .filter((p) => fs.existsSync(p));

const EXCLUDE_FILE_ABS = new Set([
  path.join(CLIENT_ROOT, 'src/services/http/envelopedFetch.ts'),
  path.join(CLIENT_ROOT, 'src/services/api/gerente.api.ts'),
]);

const EXCLUDE_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.git',
]);

/** @type {{ id: string; description: string; regex: RegExp; severity: 'error' | 'warn' }[]} */
const PATTERNS = [
  {
    id: 'direct-fetch',
    description: 'Direct fetch() usage',
    regex: /\bfetch\s*\(/g,
    severity: 'error',
  },
  {
    id: 'response-json',
    description: 'response.json() usage',
    regex: /\.json\s*\(\s*\)/g,
    severity: 'error',
  },
  {
    id: 'axios-import',
    description: 'axios import/require usage',
    regex: /\b(from\s+['"]axios['"]|require\(\s*['"]axios['"]\s*\))/g,
    severity: 'error',
  },
  {
    id: 'axios-identifier',
    description: 'axios identifier usage',
    regex: /\baxios\b/g,
    severity: 'warn',
  },
  {
    id: 'apiService',
    description: 'apiService.* usage',
    regex: /\bapiService\s*\./g,
    severity: 'error',
  },
  {
    id: 'legacy-envelope-detection',
    description: 'Legacy envelope detection logic (success/data/error probing)',
    // Common anti-patterns seen during migrations: checking `success`/`data` shape manually.
    regex:
      /\b(success\s*===\s*(true|false)|'success'\s+in\s+|typeof\s+\w+\s*===\s*['"]object['"]\s*&&\s*\w+\.success|response\.data\.(success|error)\b)/g,
    severity: 'warn',
  },
  {
    id: 'bypass-unwrap',
    description: 'Bypass unwrap (returning envelope instead of response.data.data)',
    // Flag returning the envelope object, but do NOT flag the correct pattern `return response.data.data ...`
    regex: /\breturn\s+response\.data\b(?!\s*\.data\b)/g,
    severity: 'error',
  },
];

function isTextFile(filename) {
  return (
    filename.endsWith('.ts') ||
    filename.endsWith('.tsx') ||
    filename.endsWith('.js') ||
    filename.endsWith('.jsx')
  );
}

function listFilesRecursive(dirAbs) {
  /** @type {string[]} */
  const out = [];
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIR_NAMES.has(e.name)) continue;
    const abs = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      out.push(...listFilesRecursive(abs));
      continue;
    }
    if (!e.isFile()) continue;
    if (EXCLUDE_FILE_ABS.has(abs)) continue;
    if (!isTextFile(e.name)) continue;
    out.push(abs);
  }
  return out;
}

function relative(p) {
  return path.relative(CLIENT_ROOT, p);
}

/** @type {{ file: string; patternId: string; description: string; count: number; severity: 'error' | 'warn' }[]} */
const findings = [];

for (const dir of SCAN_DIRS) {
  for (const fileAbs of listFilesRecursive(dir)) {
    const raw = fs.readFileSync(fileAbs, 'utf8');
    // Strip comments to avoid false positives from TODO/commented-out code.
    const content = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

    for (const p of PATTERNS) {
      p.regex.lastIndex = 0;
      const matches = content.match(p.regex);
      if (!matches || matches.length === 0) continue;

      // Special-case: allow mentioning "fetch(" in comments/docs? Keep strict: we don't want it at all in services.
      findings.push({
        file: relative(fileAbs),
        patternId: p.id,
        description: p.description,
        count: matches.length,
        severity: p.severity,
      });
    }
  }
}

const errors = findings.filter((f) => f.severity === 'error');
const warns = findings.filter((f) => f.severity === 'warn');

if (findings.length === 0) {
  console.log('[verify:http] OK — no forbidden HTTP patterns found.');
  process.exit(0);
}

console.log('[verify:http] Forbidden/legacy HTTP patterns detected:\n');
for (const f of findings) {
  console.log(
    `- [${f.severity.toUpperCase()}] ${f.file} :: ${f.patternId} (${f.count}) — ${f.description}`,
  );
}

console.log(
  `\nSummary: ${errors.length} error finding(s), ${warns.length} warning finding(s).`,
);

if (errors.length > 0) {
  process.exit(1);
}

// Warnings do not fail the build by default, but are printed for visibility.
process.exit(0);

