/**
 * 安全头部和配置工具
 * Security headers and configuration utilities
 */

import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import { ZERO } from '@/constants';

/**
 * Security headers for API responses
 */
export function getApiSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Security headers for web pages
 */
export function getWebSecurityHeaders(nonce?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // Add CSP header with nonce if provided
  if (nonce) {
    headers['Content-Security-Policy'] = generateCSP(nonce);
  }

  return headers;
}

/**
 * Generate Content Security Policy
 */
export function generateCSP(nonce?: string): string {
  const scriptPolicy = nonce
    ? `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com";

  const policies = [
    "default-src 'self'",
    scriptPolicy,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.resend.com https://api.airtable.com https://challenges.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ];

  return policies.join('; ');
}

/**
 * Generate strict CSP for production
 */
export function generateStrictCSP(nonce: string): string {
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.resend.com https://api.airtable.com https://challenges.cloudflare.com",
    'frame-src https://challenges.cloudflare.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/**
 * CORS headers configuration
 */
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://tucsenberg.com',
    'https://www.tucsenberg.com',
  ];

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

/**
 * Verify Turnstile token
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, remoteip }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    logger.error('Error verifying Turnstile token', { error: error as Error });
    return false;
  }
}

/**
 * Security configuration check
 */
export function checkSecurityConfig(testMode = false): {
  configured: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Use process.env directly in tests to avoid env validation issues
  const nodeEnv = process.env.NODE_ENV;
  const turnstileKey =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.TURNSTILE_SECRET_KEY
      : env.TURNSTILE_SECRET_KEY;
  const sentryDsn =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.SENTRY_DSN
      : env.SENTRY_DSN;
  const securityMode =
    testMode || process.env.NODE_ENV === 'test'
      ? process.env.NEXT_PUBLIC_SECURITY_MODE
      : env.NEXT_PUBLIC_SECURITY_MODE;

  // Check environment variables
  if (!turnstileKey && nodeEnv === 'production') {
    issues.push('Turnstile secret key not configured in production');
  }

  if (!sentryDsn && nodeEnv === 'production') {
    recommendations.push('Consider configuring Sentry for error monitoring');
  }

  if (securityMode === 'relaxed' && nodeEnv === 'production') {
    issues.push('Security mode is set to relaxed in production');
  }

  return {
    configured: issues.length === ZERO,
    issues,
    recommendations,
  };
}

/**
 * Security middleware configuration
 */
export interface SecurityMiddlewareConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableFrameOptions: boolean;
  enableContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
}

/**
 * Get security middleware headers
 */
export function getSecurityMiddlewareHeaders(
  config: Partial<SecurityMiddlewareConfig> = {},
  nonce?: string,
): Record<string, string> {
  const defaultConfig: SecurityMiddlewareConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableFrameOptions: true,
    enableContentTypeOptions: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true,
  };

  const finalConfig = { ...defaultConfig, ...config };
  const headers: Record<string, string> = {};

  if (finalConfig.enableCSP) {
    headers['Content-Security-Policy'] = generateCSP(nonce);
  }

  if (finalConfig.enableHSTS) {
    headers['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains; preload';
  }

  if (finalConfig.enableXSSProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  if (finalConfig.enableFrameOptions) {
    headers['X-Frame-Options'] = 'SAMEORIGIN';
  }

  if (finalConfig.enableContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  if (finalConfig.enableReferrerPolicy) {
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  }

  if (finalConfig.enablePermissionsPolicy) {
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
  }

  return headers;
}

/**
 * Validate security headers in response
 */
export function validateSecurityHeaders(headers: Record<string, string>): {
  valid: boolean;
  missing: string[];
  recommendations: string[];
} {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
  ];

  const recommendedHeaders = [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'Permissions-Policy',
  ];

  const headerKeys = new Set(Object.keys(headers));
  const missing = requiredHeaders.filter((header) => !headerKeys.has(header));
  const recommendations = recommendedHeaders.filter(
    (header) => !headerKeys.has(header),
  );

  return {
    valid: missing.length === ZERO,
    missing,
    recommendations,
  };
}

/**
 * Generate security report
 */
export function generateSecurityReport(): {
  timestamp: string;
  environment: string;
  config: ReturnType<typeof checkSecurityConfig>;
  headers: ReturnType<typeof validateSecurityHeaders>;
} {
  const mockHeaders = getSecurityMiddlewareHeaders();

  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    config: checkSecurityConfig(),
    headers: validateSecurityHeaders(mockHeaders),
  };
}
