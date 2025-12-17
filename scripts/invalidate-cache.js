#!/usr/bin/env node

/**
 * Cache Invalidation Script
 *
 * Triggers cache invalidation after content updates.
 * Can be called standalone or integrated into build/sync scripts.
 *
 * Usage:
 *   node scripts/invalidate-cache.js [domain] [locale]
 *
 * Examples:
 *   node scripts/invalidate-cache.js i18n          # Invalidate all i18n
 *   node scripts/invalidate-cache.js i18n en       # Invalidate i18n for English
 *   node scripts/invalidate-cache.js content zh    # Invalidate content for Chinese
 *   node scripts/invalidate-cache.js all           # Invalidate everything
 *
 * Environment:
 *   CACHE_INVALIDATION_SECRET - API key for authentication (required in production)
 *   NEXT_PUBLIC_BASE_URL - Base URL for the API (defaults to http://localhost:3000)
 *
 * Note: revalidateTag() only works in production builds.
 * During development or SSG builds, this script logs the intended invalidation
 * but cache tags are not actually invalidated since there's no persistent cache.
 */

const args = process.argv.slice(2);
const strict =
  args.includes('--strict') || process.env.CACHE_INVALIDATION_STRICT === '1';
const filteredArgs = args.filter((arg) => arg !== '--strict');
const [domain = 'i18n', locale] = filteredArgs;

const VALID_DOMAINS = ['i18n', 'content', 'product', 'all'];
const VALID_LOCALES = ['en', 'zh'];

console.log('🔄 Cache Invalidation Script\n');

// Validate inputs
if (!VALID_DOMAINS.includes(domain)) {
  console.error(`❌ Invalid domain: ${domain}`);
  console.error(`   Valid domains: ${VALID_DOMAINS.join(', ')}`);
  process.exit(1);
}

if (locale && !VALID_LOCALES.includes(locale)) {
  console.error(`❌ Invalid locale: ${locale}`);
  console.error(`   Valid locales: ${VALID_LOCALES.join(', ')}`);
  process.exit(1);
}

// Check if we're in a build context where invalidation isn't meaningful
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
const isDevelopment = process.env.NODE_ENV === 'development';

if (isBuildTime) {
  console.log('ℹ️  Build-time context detected.');
  console.log(
    '   Cache tags will be invalidated on the first request after build.',
  );
  console.log(
    `   Would invalidate: domain=${domain}${locale ? `, locale=${locale}` : ''}`,
  );
  console.log('\n✅ Cache invalidation logged (no-op during build).\n');
  process.exit(0);
}

// Build request
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const apiUrl = `${baseUrl}/api/cache/invalidate`;
const secret = process.env.CACHE_INVALIDATION_SECRET;
const hasExplicitBaseUrl = Boolean(process.env.NEXT_PUBLIC_BASE_URL);

const requestBody = {
  domain,
  ...(locale && { locale }),
};

console.log(`📍 API Endpoint: ${apiUrl}`);
console.log(`📦 Payload: ${JSON.stringify(requestBody)}`);
console.log(`🔐 Authentication: ${secret ? 'Configured' : 'Not configured'}`);
console.log(`🧷 Strict mode: ${strict ? 'Enabled' : 'Disabled'}`);
console.log();

// Default behavior should be best-effort unless explicitly configured.
// Pre-commit hooks run without a dev server, so failing here blocks commits.
if (!hasExplicitBaseUrl && !secret && !strict) {
  console.log('ℹ️  No explicit NEXT_PUBLIC_BASE_URL and no secret configured.');
  console.log('   Skipping invalidation API call (best-effort mode).');
  console.log(
    `   Would invalidate: domain=${domain}${locale ? `, locale=${locale}` : ''}`,
  );
  console.log('\n✅ Cache invalidation skipped.\n');
  process.exit(0);
}

// In development without a running server, log and exit
if (isDevelopment && !process.env.NEXT_PUBLIC_BASE_URL) {
  console.log('ℹ️  Development mode without NEXT_PUBLIC_BASE_URL.');
  console.log('   To test invalidation:');
  console.log('   1. Start the dev server: pnpm dev');
  console.log('   2. Set NEXT_PUBLIC_BASE_URL=http://localhost:3000');
  console.log('   3. Run this script again');
  console.log();
  console.log(
    `   Would invalidate: domain=${domain}${locale ? `, locale=${locale}` : ''}`,
  );
  console.log('\n✅ Cache invalidation logged (server not running).\n');
  process.exit(0);
}

// Make the API call
async function invalidateCache() {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (secret) {
      headers['Authorization'] = `Bearer ${secret}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = `❌ API Error: ${response.status} ${response.statusText}`;
      if (strict || secret) {
        console.error(message);
        console.error(`   Response: ${JSON.stringify(data)}`);
        process.exit(1);
      }
      console.warn(message);
      console.warn(`   Response: ${JSON.stringify(data)}`);
      console.log('\n✅ Cache invalidation treated as best-effort.\n');
      process.exit(0);
    }

    console.log('✅ Cache invalidation successful!');
    console.log(
      `   Invalidated tags: ${data.invalidatedTags?.join(', ') || 'none'}`,
    );

    if (data.errors?.length > 0) {
      console.warn('⚠️  Some errors occurred:');
      data.errors.forEach((err) => console.warn(`   - ${err}`));
    }

    console.log();
  } catch (error) {
    const maybeCode = error?.code ?? error?.cause?.code;
    const isNetworkFailure =
      maybeCode === 'ECONNREFUSED' ||
      maybeCode === 'ENOTFOUND' ||
      maybeCode === 'EAI_AGAIN' ||
      error?.message === 'fetch failed';

    // If server is not running, handle gracefully
    if (isNetworkFailure && !strict) {
      console.log('ℹ️  Server not running or not reachable.');
      console.log(
        `   Would invalidate: domain=${domain}${locale ? `, locale=${locale}` : ''}`,
      );
      console.log('\n✅ Cache invalidation treated as best-effort.\n');
      process.exit(0);
    }

    console.error('❌ Failed to call invalidation API:', error.message);
    process.exit(1);
  }
}

invalidateCache();
