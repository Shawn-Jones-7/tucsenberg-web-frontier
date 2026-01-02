import { COUNT_PAIR, MAGIC_16 } from '../constants/count';
import { ZERO } from '../constants/magic-numbers';

export type SecurityHeader = {
  key: string;
  value: string;
};

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
      // React Grab (development only)
      ...(isDevelopment ? ['https://unpkg.com'] : []),
      // Vercel Analytics
      'https://va.vercel-scripts.com',
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
      // Allow Next.js inline styles (for CSS-in-JS and dynamic styles)
      // This fixes the "Refused to execute script from _next/static/css" warning
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
      // Google Analytics
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
    ],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      // Vercel Analytics
      'https://vitals.vercel-insights.com',
      // API endpoints
      ...(isDevelopment ? ['http://localhost:*', 'ws://localhost:*'] : []),
      // External APIs
      'https://api.resend.com',
      // Google Analytics
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://region1.google-analytics.com',
    ],
    'frame-src': [
      // Cloudflare Turnstile (removed 'none' - conflicts with allowlist)
      'https://challenges.cloudflare.com',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'report-uri': ['/api/csp-report'],
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
const SECURITY_HEADERS_DISABLED_FLAG = 'false';

export function isSecurityHeadersEnabled(testMode = false): boolean {
  if (testMode) {
    return (
      process.env.SECURITY_HEADERS_ENABLED !== SECURITY_HEADERS_DISABLED_FLAG
    );
  }

  if (process.env.NODE_ENV === 'test') {
    return (
      process.env.SECURITY_HEADERS_ENABLED !== SECURITY_HEADERS_DISABLED_FLAG
    );
  }

  return (
    process.env.SECURITY_HEADERS_ENABLED !== SECURITY_HEADERS_DISABLED_FLAG
  );
}

export function getSecurityHeaders(
  nonce?: string,
  testMode = false,
): SecurityHeader[] {
  // Use process.env here to keep this module safe for Next config evaluation.
  // Runtime env validation lives in env.mjs, but importing it here would break next.config load.
  if (!isSecurityHeadersEnabled(testMode)) {
    return [];
  }

  const securityConfig = getSecurityConfig(testMode);
  const cspHeaderKey = securityConfig.cspReportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

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
    // Content Security Policy (enforced or report-only based on security mode)
    {
      key: cspHeaderKey,
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
 *
 * Requirements:
 * - Minimum 128 bits (16 bytes) entropy per OWASP best practices
 * - 32 hex characters output for CSP compatibility
 * - Must pass isValidNonce validation
 */
const NONCE_BYTE_LENGTH = MAGIC_16; // 16 bytes = 128 bits = 32 hex characters
const NONCE_HEX_PAD = COUNT_PAIR;

export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // randomUUID returns 36 chars with hyphens, removing hyphens gives 32 hex chars
    // Use full 32 chars for 128-bit entropy
    return crypto.randomUUID().replace(/-/g, '');
  }

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    // Convert to hex: 16 bytes = 32 hex characters = 128 bits
    return Array.from(bytes, (value) =>
      value.toString(MAGIC_16).padStart(NONCE_HEX_PAD, '0'),
    ).join('');
  }

  throw new Error('Secure nonce generation unavailable');
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
  const rawMode =
    (testMode || process.env.NODE_ENV === 'test'
      ? process.env.NEXT_PUBLIC_SECURITY_MODE
      : process.env.NEXT_PUBLIC_SECURITY_MODE) || 'strict';

  const mode =
    rawMode === 'moderate' || rawMode === 'relaxed' ? rawMode : 'strict';

  switch (mode) {
    case 'moderate':
      return SECURITY_MODES.moderate;
    case 'relaxed':
      return SECURITY_MODES.relaxed;
    case 'strict':
    default:
      return SECURITY_MODES.strict;
  }
}

/**
 * Validate CSP nonce (128-bit minimum entropy)
 */
export function isValidNonce(nonce: string): boolean {
  // Nonce should be at least 32 characters (128 bits) and contain only alphanumeric characters
  return /^[a-zA-Z0-9]{32,}$/.test(nonce);
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
