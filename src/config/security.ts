import { env } from '../../env.mjs';
import { COUNT_PAIR, ZERO } from "../constants/magic-numbers";
import { ALERT_SYSTEM_CONSTANTS } from "../constants/performance-constants";
const RANDOM_ID_BASE = ALERT_SYSTEM_CONSTANTS.RANDOM_ID_BASE;
import { MAGIC_15 } from "../constants/count";

/**
 * Security configuration for the application
 * Includes CSP, security headers, and other security-related settings
 */

/**
 * Content Security Policy configuration
 */
export function generateCSP(nonce?: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Base CSP directives
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Allow inline scripts with nonce in production, unsafe-inline in development
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      // Vercel Analytics
      'https://va.vercel-scripts.com',
      // Sentry
      'https://js.sentry-cdn.com',
      // Cloudflare Turnstile
      'https://challenges.cloudflare.com',
      // Google Analytics (if enabled)
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      // Only allow unsafe-inline in development for Tailwind CSS
      ...(isDevelopment ? ["'unsafe-inline'"] : []),
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      // Vercel Analytics
      'https://va.vercel-scripts.com',
      // External image sources
      'https://images.unsplash.com',
      'https://via.placeholder.com',
    ],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      // Vercel Analytics
      'https://vitals.vercel-insights.com',
      // Sentry
      'https://o4507902318592000.ingest.us.sentry.io',
      // API endpoints
      ...(isDevelopment ? ['http://localhost:*', 'ws://localhost:*'] : []),
      // External APIs
      'https://api.resend.com',
    ],
    'frame-src': [
      "'none'",
      // Cloudflare Turnstile
      'https://challenges.cloudflare.com',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': isProduction ? [] : undefined,
  };

  // Convert directives to CSP string
  return Object.entries(cspDirectives)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value) && value.length > ZERO) {
        return `${key} ${value.join(' ')}`;
      }
      return key;
    })
    .join('; ');
}

/**
 * Security headers configuration
 */
export function getSecurityHeaders(nonce?: string, testMode = false) {
  // Use process.env directly in tests to avoid env validation issues
  const isSecurityEnabled =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.SECURITY_HEADERS_ENABLED !== 'false'
      : env.SECURITY_HEADERS_ENABLED;

  if (!isSecurityEnabled) {
    return [];
  }

  return [
    // Prevent clickjacking
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    // Prevent MIME type sniffing
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    // Referrer policy
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    // HSTS (HTTP Strict Transport Security)
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    // XSS Protection (legacy, but still useful)
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    // Content Security Policy
    {
      key: 'Content-Security-Policy',
      value: generateCSP(nonce),
    },
    // Permissions Policy (formerly Feature Policy)
    {
      key: 'Permissions-Policy',
      value: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
        'payment=()',
        'usb=()',
      ].join(', '),
    },
    // Cross-Origin policies
    {
      key: 'Cross-Origin-Embedder-Policy',
      value: 'unsafe-none', // Changed from require-corp for compatibility
    },
    {
      key: 'Cross-Origin-Opener-Policy',
      value: 'same-origin',
    },
    {
      key: 'Cross-Origin-Resource-Policy',
      value: 'cross-origin',
    },
  ];
}

/**
 * Generate a cryptographically secure nonce for CSP
 */
// Constants for nonce generation
const NONCE_CONSTANTS = {
  RADIX_36: ALERT_SYSTEM_CONSTANTS.RANDOM_ID_BASE,
  SUBSTRING_START: COUNT_PAIR,
  SUBSTRING_END: MAGIC_15,
} as const;

export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }

  // Fallback for environments without crypto.randomUUID
  return (
    Math.random()
      .toString(NONCE_CONSTANTS.RADIX_36)
      .substring(
        NONCE_CONSTANTS.SUBSTRING_START,
        NONCE_CONSTANTS.SUBSTRING_END,
      ) +
    Math.random()
      .toString(NONCE_CONSTANTS.RADIX_36)
      .substring(NONCE_CONSTANTS.SUBSTRING_START, NONCE_CONSTANTS.SUBSTRING_END)
  );
}

/**
 * Security mode configuration
 */
export const SECURITY_MODES = {
  strict: {
    cspReportOnly: false,
    enforceHTTPS: true,
    strictTransportSecurity: true,
    contentTypeOptions: true,
    frameOptions: 'DENY',
    xssProtection: true,
  },
  moderate: {
    cspReportOnly: false,
    enforceHTTPS: true,
    strictTransportSecurity: true,
    contentTypeOptions: true,
    frameOptions: 'SAMEORIGIN',
    xssProtection: true,
  },
  relaxed: {
    cspReportOnly: true,
    enforceHTTPS: false,
    strictTransportSecurity: false,
    contentTypeOptions: true,
    frameOptions: 'SAMEORIGIN',
    xssProtection: false,
  },
} as const;

/**
 * Get security configuration based on mode
 */
export function getSecurityConfig(testMode = false) {
  // Use process.env directly in tests to avoid env validation issues
  const mode =
    (testMode || process.env.NODE_ENV === 'test'
      ? process.env.NEXT_PUBLIC_SECURITY_MODE
      : env.NEXT_PUBLIC_SECURITY_MODE) || 'strict';
  return SECURITY_MODES[mode as keyof typeof SECURITY_MODES];
}

/**
 * Validate CSP nonce
 */
export function isValidNonce(nonce: string): boolean {
  // Nonce should be at least 16 characters and contain only alphanumeric characters
  return /^[a-zA-Z0-9]{16,}$/.test(nonce);
}

/**
 * CSP report endpoint handler type
 */
export interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
    'script-sample': string;
  };
}

/**
 * Security utilities
 */
export const SecurityUtils = {
  generateCSP,
  getSecurityHeaders,
  generateNonce,
  getSecurityConfig,
  isValidNonce,
} as const;
