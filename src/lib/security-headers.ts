/**
 * 安全头部和配置工具
 * Security headers and configuration utilities
 */

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { getSecurityHeaders, type SecurityHeader } from '@/config/security';
import { ZERO } from '@/constants';

// nosemgrep: object-injection-sink-dynamic-property -- 本文件的 header 键均来自常量或受控白名单，未直接使用外部输入作为属性名
const HEADER_KEYS = {
  contentSecurityPolicy: 'Content-Security-Policy',
  strictTransportSecurity: 'Strict-Transport-Security',
  xssProtection: 'X-XSS-Protection',
  frameOptions: 'X-Frame-Options',
  contentTypeOptions: 'X-Content-Type-Options',
  referrerPolicy: 'Referrer-Policy',
  permissionsPolicy: 'Permissions-Policy',
} as const;

function toHeaderRecord(headers: SecurityHeader[]): Record<string, string> {
  return Object.fromEntries(headers.map(({ key, value }) => [key, value]));
}

/**
 * Security headers for API responses (legacy helper)
 */
export function getApiSecurityHeaders(nonce?: string): Record<string, string> {
  return toHeaderRecord(getSecurityHeaders(nonce));
}

export function getWebSecurityHeaders(nonce?: string): Record<string, string> {
  return toHeaderRecord(getSecurityHeaders(nonce));
}

/**
 * CORS headers configuration
 *
 * Production origins should be configured via NEXT_PUBLIC_SITE_URL env var.
 */
export function getCORSHeaders(origin?: string): Record<string, string> {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://example.com';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    siteUrl,
    siteUrl.replace('https://', 'https://www.'),
  ];

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  if (origin && allowedOrigins.includes(origin)) {
    // nosemgrep: object-injection-sink-dynamic-property -- origin 已在白名单校验后使用
    headers['Access-Control-Allow-Origin'] = origin;
    // nosemgrep: object-injection-sink-dynamic-property -- origin 已在白名单校验后使用
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (process.env.NODE_ENV === 'development') {
    // nosemgrep: object-injection-sink-dynamic-property -- 开发环境允许通配符
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
  frameOptionsValue?: 'DENY' | 'SAMEORIGIN';
}

const resolveSecurityMiddlewareConfig = (
  config: Partial<SecurityMiddlewareConfig>,
  defaults: SecurityMiddlewareConfig,
): SecurityMiddlewareConfig => {
  const frameOptionsValue: NonNullable<
    SecurityMiddlewareConfig['frameOptionsValue']
  > = (config.frameOptionsValue ?? defaults.frameOptionsValue)!;

  return {
    enableCSP: config.enableCSP ?? defaults.enableCSP,
    enableHSTS: config.enableHSTS ?? defaults.enableHSTS,
    enableXSSProtection:
      config.enableXSSProtection ?? defaults.enableXSSProtection,
    enableFrameOptions:
      config.enableFrameOptions ?? defaults.enableFrameOptions,
    enableContentTypeOptions:
      config.enableContentTypeOptions ?? defaults.enableContentTypeOptions,
    enableReferrerPolicy:
      config.enableReferrerPolicy ?? defaults.enableReferrerPolicy,
    enablePermissionsPolicy:
      config.enablePermissionsPolicy ?? defaults.enablePermissionsPolicy,
    frameOptionsValue,
  };
};

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
    frameOptionsValue: 'DENY',
  };
  const finalConfig = resolveSecurityMiddlewareConfig(config, defaultConfig);
  const headers = toHeaderRecord(getSecurityHeaders(nonce));

  if (!finalConfig.enableCSP) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.contentSecurityPolicy];
  }

  if (!finalConfig.enableHSTS) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.strictTransportSecurity];
  }

  if (!finalConfig.enableXSSProtection) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.xssProtection];
  }

  if (!finalConfig.enableFrameOptions) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.frameOptions];
  } else if (finalConfig.frameOptionsValue) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，值来源受控配置
    headers[HEADER_KEYS.frameOptions] = finalConfig.frameOptionsValue;
  }

  if (!finalConfig.enableContentTypeOptions) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.contentTypeOptions];
  }

  if (!finalConfig.enableReferrerPolicy) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.referrerPolicy];
  }

  if (!finalConfig.enablePermissionsPolicy) {
    // nosemgrep: object-injection-sink-dynamic-property -- 访问常量键，非外部输入
    delete headers[HEADER_KEYS.permissionsPolicy];
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
    HEADER_KEYS.contentTypeOptions,
    HEADER_KEYS.frameOptions,
    HEADER_KEYS.xssProtection,
    HEADER_KEYS.referrerPolicy,
  ];

  const recommendedHeaders = [
    HEADER_KEYS.contentSecurityPolicy,
    HEADER_KEYS.strictTransportSecurity,
    HEADER_KEYS.permissionsPolicy,
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
