/**
 * 联系表单API工具函数
 * Contact form API utility functions
 */

import { NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  getAllowedTurnstileHosts,
  getExpectedTurnstileAction,
  isAllowedTurnstileAction,
  isAllowedTurnstileHostname,
} from '@/lib/security/turnstile-config';
import {
  COUNT_FIVE,
  COUNT_PAIR,
  MAGIC_9,
  MAGIC_36,
  ONE,
  ZERO,
} from '@/constants';
import { MINUTE_MS } from '@/constants/time';

// 常量定义
export const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: COUNT_FIVE,
  WINDOW_MS: MINUTE_MS,
} as const;

/**
 * 速率限制存储
 * Rate limiting storage (in production, use Redis or database)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface TurnstileVerificationResult {
  'success': boolean;
  'hostname'?: string;
  'action'?: string;
  'error-codes'?: string[];
}

function buildTurnstilePayload(
  token: string,
  ip: string,
  secretKey: string,
): URLSearchParams {
  const payload = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (ip && ip !== 'unknown') {
    payload.set('remoteip', ip);
  }

  return payload;
}

async function requestTurnstileVerification(
  payload: URLSearchParams,
): Promise<TurnstileVerificationResult> {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    },
  );

  return response.json();
}

function handleVerificationFailure(
  result: TurnstileVerificationResult,
  ip: string,
): false {
  logger.warn('Turnstile verification failed', {
    errorCodes: result['error-codes'],
    ip,
  });
  return false;
}

function validateTurnstileHostnameResponse(
  result: TurnstileVerificationResult,
  ip: string,
): boolean {
  if (isAllowedTurnstileHostname(result.hostname)) {
    return true;
  }

  logger.warn('Turnstile verification rejected due to unexpected hostname', {
    hostname: result.hostname,
    allowed: getAllowedTurnstileHosts(),
    ip,
  });
  return false;
}

function validateTurnstileActionResponse(
  result: TurnstileVerificationResult,
  ip: string,
): boolean {
  if (isAllowedTurnstileAction(result.action)) {
    return true;
  }

  const expectedAction = getExpectedTurnstileAction();
  logger.warn('Turnstile verification rejected due to mismatched action', {
    action: result.action,
    expectedAction,
    ip,
  });
  return false;
}

/**
 * 检查速率限制
 * Check rate limiting
 */
export function checkRateLimit(
  ip: string,
  maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS,
  windowMs = RATE_LIMIT_CONFIG.WINDOW_MS,
): boolean {
  const now = Date.now();
  const key = ip;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: ONE, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += ONE;
  rateLimitStore.set(key, current);
  return true;
}

/**
 * 验证Turnstile token
 * Verify Turnstile token
 */
export async function verifyTurnstile(
  token: string,
  ip: string,
): Promise<boolean> {
  try {
    const secretKey = env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      logger.warn('Turnstile secret key not configured');
      return false;
    }

    const payload = buildTurnstilePayload(token, ip, secretKey);
    const result = await requestTurnstileVerification(payload);

    if (!result.success) {
      return handleVerificationFailure(result, ip);
    }

    if (!validateTurnstileHostnameResponse(result, ip)) {
      return false;
    }

    if (!validateTurnstileActionResponse(result, ip)) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Turnstile verification error', { error, ip });
    return false;
  }
}

/**
 * 获取客户端IP地址
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    const first = forwarded.split(',').shift()?.trim();
    return first || 'unknown';
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * 清理过期的速率限制记录
 * Clean up expired rate limit records
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * 获取速率限制状态
 * Get rate limit status
 */
export function getRateLimitStatus(ip: string): {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
} {
  const current = rateLimitStore.get(ip);
  const now = Date.now();

  if (!current || now > current.resetTime) {
    return {
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - ONE,
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
      isLimited: false,
    };
  }

  const remaining = Math.max(
    ZERO,
    RATE_LIMIT_CONFIG.MAX_REQUESTS - current.count,
  );
  return {
    remaining,
    resetTime: current.resetTime,
    isLimited: remaining === ZERO,
  };
}

/**
 * 验证环境变量配置
 * Validate environment variables
 */
export function validateEnvironmentConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  // 使用受限白名单映射，避免对 process.env 的动态键访问
  const envMap = {
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  };

  const missingVars: string[] = [];
  if (!envMap.TURNSTILE_SECRET_KEY) missingVars.push('TURNSTILE_SECRET_KEY');
  if (!envMap.RESEND_API_KEY) missingVars.push('RESEND_API_KEY');
  if (!envMap.AIRTABLE_API_KEY) missingVars.push('AIRTABLE_API_KEY');
  if (!envMap.AIRTABLE_BASE_ID) missingVars.push('AIRTABLE_BASE_ID');

  return {
    isValid: missingVars.length === ZERO,
    missingVars,
  };
}

/**
 * 生成请求ID用于日志追踪
 * Generate request ID for log tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(MAGIC_36).substring(COUNT_PAIR, MAGIC_9)}`;
}

/**
 * 格式化错误响应
 * Format error response
 */
export function formatErrorResponse(
  message: string,
  statusCode: number,
  details?: Record<string, unknown>,
): {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, unknown>;
} {
  return {
    error: 'ContactFormError',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
}
