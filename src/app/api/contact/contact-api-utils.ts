/**
 * 联系表单API工具函数
 * Contact form API utility functions
 */

import { NextRequest } from 'next/server';
import { MAGIC_36, COUNT_PAIR, MAGIC_9 } from '@/constants/magic-numbers';

import { logger } from '@/lib/logger';

// 常量定义
export const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 5,
  WINDOW_MS: 60000,
} as const;

/**
 * 速率限制存储
 * Rate limiting storage (in production, use Redis or database)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
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
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      logger.warn('Turnstile secret key not configured');
      return false;
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: ip,
        }),
      },
    );

    const result = await response.json();

    if (!result.success) {
      logger.warn('Turnstile verification failed', {
        errorCodes: result['error-codes'],
        ip,
      });
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
    return forwarded.split(',')[0]?.trim() || 'unknown';
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
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
      isLimited: false,
    };
  }

  const remaining = Math.max(0, RATE_LIMIT_CONFIG.MAX_REQUESTS - current.count);
  return {
    remaining,
    resetTime: current.resetTime,
    isLimited: remaining === 0,
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
  const requiredVars = [
    'TURNSTILE_SECRET_KEY',
    'RESEND_API_KEY',
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
  ];

  const missingVars = requiredVars.filter((varName) => {
    // 安全的环境变量访问，避免对象注入
    const envValue = process.env[varName as keyof typeof process.env];
    return !envValue;
  });

  return {
    isValid: missingVars.length === 0,
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
