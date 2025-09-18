// Simple alias consistency checker for @/* across tsconfig, next.config, and ESLint resolver
// Usage: node scripts/check-config-consistency.js

/* eslint-disable no-console */
const fs = require('fs');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

try {
  const ts = readJSON('tsconfig.json');
  const tsAlias = ts?.compilerOptions?.paths?.['@/*']?.[0];

  const nextConfigSrc = fs.readFileSync('next.config.ts', 'utf8');
  const hasNextAlias = /resolve\.alias[\s\S]*['"]@['"]:\s*path\.resolve\(__dirname,\s*['"]src['"]\)/.test(
    nextConfigSrc,
  );

  const eslintSrc = fs.readFileSync('eslint.config.mjs', 'utf8');
  const hasTsResolver = /['"]import\/resolver['"]:\s*\{[\s\S]*typescript/.test(
    eslintSrc,
  );

  const ok = tsAlias === './src/*' && hasNextAlias && hasTsResolver;
  if (!ok) {
    console.error('Alias consistency failed:', {
      tsAlias,
      hasNextAlias,
      hasTsResolver,
    });
    process.exit(1);
  }

  console.log('Alias consistency OK');
} catch (err) {
  console.error('config:check error', err);
  process.exit(1);
}

