/**
 * Translation Message Loader
 *
 * This module provides functions to load externalized translation files
 * from the public directory using Next.js caching mechanisms.
 *
 * Key Features:
 * - Uses unstable_cache for server-side caching (1 hour revalidation)
 * - Fetches translation files as static assets from /messages/
 * - Provides fallback to file system reads during build time
 * - Supports both critical and deferred translation types
 * - CI/E2E environments bypass cache to prevent empty object caching
 * - Cache tags follow `domain:entity:identifier` convention for selective invalidation
 *
 * Architecture:
 * - Translation files are copied to public/messages/ during build (prebuild script)
 * - This keeps them out of the JS bundle, reducing First Load JS
 * - Server-side caching ensures fast subsequent requests
 *
 * @see scripts/copy-translations.js - Prebuild script that copies files
 * @see docs/i18n-optimization.md - Full architecture documentation
 * @see src/lib/cache/cache-tags.ts - Cache tag naming conventions
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { unstable_cache } from 'next/cache';
import { i18nTags } from '@/lib/cache/cache-tags';
import { logger } from '@/lib/logger';
import { mergeObjects } from '@/lib/merge-objects';
import { MONITORING_INTERVALS } from '@/constants/performance-constants';
import { routing } from '@/i18n/routing';

/**
 * Detect CI/E2E environment to bypass caching.
 * Prevents empty object {} from being cached when translation files are missing.
 */
const isCiLikeEnvironment =
  process.env.CI === 'true' || process.env.PLAYWRIGHT_TEST === 'true';

const I18N_CACHE_REVALIDATE_DEFAULT_SECONDS =
  MONITORING_INTERVALS.CACHE_CLEANUP;

function getRevalidateTime(): number {
  return process.env.NODE_ENV === 'development'
    ? 1
    : I18N_CACHE_REVALIDATE_DEFAULT_SECONDS;
}

/**
 * Supported locale types
 */
type Locale = 'en' | 'zh';

/**
 * Translation message structure
 */
type Messages = Record<string, unknown>;

type MessageType = 'critical' | 'deferred';

/**
 * Internal helper: load messages from the source /messages directory.
 * Used as final fallback and during build phase.
 */
async function loadMessagesFromSource(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  const filePath = join(process.cwd(), 'messages', locale, `${type}.json`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is sanitized
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as Messages;
}

/**
 * Internal helper: load messages from public/messages directory.
 */
async function loadMessagesFromPublic(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  const filePath = join(
    process.cwd(),
    'public',
    'messages',
    locale,
    `${type}.json`,
  );
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is sanitized
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as Messages;
}

/**
 * Runtime locale sanitizer to guard against unexpected values.
 * Falls back to routing.defaultLocale when input is not in the whitelist.
 */
function sanitizeLocale(input: string): Locale {
  const allowed = ['en', 'zh'] as const;
  return (allowed as readonly string[]).includes(input)
    ? (input as Locale)
    : (routing.defaultLocale as Locale);
}

/**
 * Get the base URL for fetching translation files
 * Used only in production runtime for HTTP fetch with CDN caching
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

/**
 * Load messages with fallback chain: public → source
 * Never returns empty object - throws on complete failure
 */
async function loadMessagesWithFallback(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  // Try public directory first
  try {
    return await loadMessagesFromPublic(locale, type);
  } catch (publicError) {
    logger.error(
      `Failed to read ${type} from public for ${locale}:`,
      publicError,
    );
  }

  // Fallback to source directory
  try {
    return await loadMessagesFromSource(locale, type);
  } catch (sourceError) {
    logger.error(
      `Failed to read ${type} from source for ${locale}:`,
      sourceError,
    );
    throw new Error(`Cannot load ${type} messages for ${locale}`);
  }
}

/**
 * Fetch messages via HTTP with fallback chain
 */
async function fetchMessagesWithFallback(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/messages/${locale}/${type}.json`;

  // Try HTTP fetch first (production runtime)
  try {
    const revalidate = getRevalidateTime();
    const response = await fetch(url, {
      next: { revalidate },
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as Messages;
  } catch (fetchError) {
    logger.error(`HTTP fetch of ${type} failed for ${locale}:`, fetchError);
  }

  // Fallback to file system
  return loadMessagesWithFallback(locale, type);
}

/**
 * Core loader for critical messages (no caching)
 */
async function loadCriticalMessagesCore(locale: Locale): Promise<Messages> {
  const safeLocale = sanitizeLocale(locale as string);
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Build/dev: direct file read, production: HTTP fetch with fallback
  const messages =
    isBuildTime || isDevelopment
      ? await loadMessagesWithFallback(safeLocale, 'critical')
      : await fetchMessagesWithFallback(safeLocale, 'critical');

  return messages;
}

/**
 * Core loader for deferred messages (no caching)
 */
async function loadDeferredMessagesCore(locale: Locale): Promise<Messages> {
  const safeLocale = sanitizeLocale(locale as string);
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Build/dev: direct file read, production: HTTP fetch with fallback
  const messages =
    isBuildTime || isDevelopment
      ? await loadMessagesWithFallback(safeLocale, 'deferred')
      : await fetchMessagesWithFallback(safeLocale, 'deferred');

  return messages;
}

/**
 * Cached version of critical messages loader.
 * Uses standardized cache tags for selective invalidation.
 * Tag format: `i18n:critical:{locale}` (e.g., 'i18n:critical:en')
 */
function createCriticalMessagesCached(locale: Locale) {
  return unstable_cache(
    () => loadCriticalMessagesCore(locale),
    ['i18n-critical', locale],
    {
      revalidate: getRevalidateTime(),
      tags: [i18nTags.critical(locale), i18nTags.all()],
    },
  );
}

/**
 * Cached version of deferred messages loader.
 * Uses standardized cache tags for selective invalidation.
 * Tag format: `i18n:deferred:{locale}` (e.g., 'i18n:deferred:en')
 */
function createDeferredMessagesCached(locale: Locale) {
  return unstable_cache(
    () => loadDeferredMessagesCore(locale),
    ['i18n-deferred', locale],
    {
      revalidate: getRevalidateTime(),
      tags: [i18nTags.deferred(locale), i18nTags.all()],
    },
  );
}

/**
 * Load critical translation messages (externalized)
 *
 * This function loads the critical translation file from the public directory
 * using fetch + unstable_cache for optimal performance.
 *
 * Cache tags enable selective invalidation:
 * - `i18n:critical:{locale}` - Invalidate specific locale's critical messages
 * - `i18n:all` - Invalidate all i18n caches
 *
 * CI/E2E environments bypass cache to prevent empty object caching issues.
 *
 * @param locale - The locale to load ('en' or 'zh')
 * @returns Promise resolving to the translation messages object
 */
export function loadCriticalMessages(locale: Locale): Promise<Messages> {
  if (isCiLikeEnvironment) {
    return loadCriticalMessagesCore(locale);
  }
  const cachedFn = createCriticalMessagesCached(locale);
  return cachedFn();
}

/**
 * Load deferred translation messages (externalized)
 *
 * This function loads the deferred translation file from the public directory
 * using fetch + unstable_cache for optimal performance.
 *
 * Cache tags enable selective invalidation:
 * - `i18n:deferred:{locale}` - Invalidate specific locale's deferred messages
 * - `i18n:all` - Invalidate all i18n caches
 *
 * CI/E2E environments bypass cache to prevent empty object caching issues.
 *
 * @param locale - The locale to load ('en' or 'zh')
 * @returns Promise resolving to the translation messages object
 */
export function loadDeferredMessages(locale: Locale): Promise<Messages> {
  if (isCiLikeEnvironment) {
    return loadDeferredMessagesCore(locale);
  }
  const cachedFn = createDeferredMessagesCached(locale);
  return cachedFn();
}

/**
 * Preload critical messages for a locale
 */
export function preloadCriticalMessages(locale: Locale): void {
  loadCriticalMessages(locale);
}

/**
 * Preload deferred messages for a locale
 */
export function preloadDeferredMessages(locale: Locale): void {
  loadDeferredMessages(locale);
}

/**
 * Load complete translation messages (critical + deferred combined)
 */
export async function loadCompleteMessages(locale: Locale): Promise<Messages> {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  const [critical, deferred] = await Promise.all([
    isBuildTime
      ? loadMessagesFromSource(locale, 'critical')
      : loadCriticalMessages(locale),
    isBuildTime
      ? loadMessagesFromSource(locale, 'deferred')
      : loadDeferredMessages(locale),
  ]);

  // Deep merge ensuring nested fields coexist
  const merged = mergeObjects(
    (critical ?? {}) as Record<string, unknown>,
    (deferred ?? {}) as Record<string, unknown>,
  ) as Messages;

  // Debug output during build (when I18N_DEBUG_BUILD=1)
  if (
    process.env.I18N_DEBUG_BUILD === '1' &&
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    const topLevelKeys = Object.keys(merged);
    // eslint-disable-next-line no-console -- intentional debug output
    console.error('[i18n-debug] loadCompleteMessages snapshot', {
      locale,
      topLevelKeys,
      criticalKeys: Object.keys(critical ?? {}),
      deferredKeys: Object.keys(deferred ?? {}),
    });
  }

  return merged;
}
