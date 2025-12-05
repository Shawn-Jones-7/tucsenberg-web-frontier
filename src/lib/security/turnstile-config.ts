import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

/**
 * Parse the configured Turnstile allowed hostnames.
 */
function parseConfiguredHosts(): string[] {
  const hosts = env.TURNSTILE_ALLOWED_HOSTS as string | undefined;
  if (!hosts) return [];

  return hosts
    .split(',')
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Derive sensible fallback hostnames when TURNSTILE_ALLOWED_HOSTS is not set.
 */
function deriveFallbackHosts(): string[] {
  const hosts = new Set<string>();

  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      hosts.add(new URL(baseUrl).hostname.toLowerCase());
    } catch (error) {
      logger.warn(
        'Failed to parse NEXT_PUBLIC_BASE_URL for Turnstile host validation',
        {
          baseUrl,
          error,
        },
      );
    }
  }

  if (env.VERCEL_URL) {
    hosts.add(env.VERCEL_URL.toLowerCase());
  }

  hosts.add('localhost');

  return Array.from(hosts);
}

const allowedHostsMemo = (() => {
  const configured = parseConfiguredHosts();
  return configured.length > 0 ? configured : deriveFallbackHosts();
})();

/**
 * Return the list of hostnames that are allowed to appear in Turnstile verification responses.
 */
export function getAllowedTurnstileHosts(): string[] {
  return allowedHostsMemo;
}

/**
 * Check whether the verification response originates from an allowed hostname.
 */
export function isAllowedTurnstileHostname(hostname?: string | null): boolean {
  if (!hostname) return false;

  const normalized = hostname.toLowerCase();
  return getAllowedTurnstileHosts().includes(normalized);
}

/**
 * Default allowed actions for Turnstile verification.
 * Can be extended via TURNSTILE_ALLOWED_ACTIONS env variable (comma-separated).
 */
const DEFAULT_ALLOWED_ACTIONS = [
  'contact_form',
  'newsletter_subscribe',
  'product_inquiry',
];

const allowedActionsMemo = (() => {
  const envActions = process.env.TURNSTILE_ALLOWED_ACTIONS;
  if (envActions) {
    return envActions
      .split(',')
      .map((a: string) => a.trim())
      .filter(Boolean);
  }
  return DEFAULT_ALLOWED_ACTIONS;
})();

const expectedActionMemo = (
  (env.TURNSTILE_EXPECTED_ACTION as string | undefined) || 'contact_form'
).trim();

/**
 * Return the expected Turnstile action identifier (primary action).
 */
export function getExpectedTurnstileAction(): string {
  return expectedActionMemo;
}

/**
 * Return all allowed Turnstile action identifiers.
 */
export function getAllowedTurnstileActions(): string[] {
  return allowedActionsMemo;
}

/**
 * Determine whether the verification response action matches expectations.
 * Supports multiple allowed actions for different form types.
 */
export function isAllowedTurnstileAction(action?: string | null): boolean {
  if (!action) return false;
  return getAllowedTurnstileActions().includes(action);
}
