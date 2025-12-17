/**
 * Get locale from API request context
 *
 * This module provides utilities to detect the user's preferred locale
 * from API request headers and cookies for internationalized API responses.
 *
 * Priority order:
 * 1. NEXT_LOCALE cookie (user's explicit preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale fallback
 */

import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing-config';

type SupportedLocale = 'en' | 'zh';

const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'zh'] as const;
const DEFAULT_LOCALE: SupportedLocale =
  routing.defaultLocale as SupportedLocale;
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Check if a locale string is supported
 */
function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Parse Accept-Language header and return the best matching locale
 */
function parseAcceptLanguage(header: string | null): SupportedLocale | null {
  if (!header) return null;

  // Parse "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7" format
  const languages = header
    .split(',')
    .map((lang) => {
      const parts = lang.trim().split(';q=');
      const code = parts[0] ?? '';
      const qValue = parts[1];
      return {
        code: code.split('-')[0]?.toLowerCase() ?? '', // "en-US" → "en"
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .filter(({ code }) => code.length > 0)
    .sort((a, b) => b.quality - a.quality);

  // Find first supported locale
  for (const { code } of languages) {
    if (isSupportedLocale(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Get the user's preferred locale from the request
 *
 * @param request - Next.js API request
 * @returns The detected locale ('en' or 'zh')
 */
export function getRequestLocale(request: NextRequest): SupportedLocale {
  // 1. Check NEXT_LOCALE cookie (explicit user preference)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header (browser preference)
  const acceptLanguage = request.headers.get('accept-language');
  const headerLocale = parseAcceptLanguage(acceptLanguage);
  if (headerLocale) {
    return headerLocale;
  }

  // 3. Fallback to default locale
  return DEFAULT_LOCALE;
}

/**
 * API response messages with i18n support
 *
 * These messages are used across user-facing API endpoints.
 * Structure matches the apiMessages namespace in translation files.
 */
export interface ApiMessages {
  rateLimit: string;
  unauthorized: string;
  serverError: string;
  validationError: string;
  contact: {
    success: string;
    statsError: string;
  };
  inquiry: {
    success: string;
    processingError: string;
    securityRequired: string;
    securityFailed: string;
  };
  turnstile: {
    missingToken: string;
    verificationFailed: string;
    networkError: string;
    notConfigured: string;
    success: string;
  };
}

/**
 * Hardcoded API messages by locale
 *
 * These are kept in code (not in translation files) because:
 * 1. API routes run in Edge/Node runtime without next-intl context
 * 2. Messages are simple and rarely change
 * 3. Avoids async translation loading in API hot paths
 */
const API_MESSAGES: Record<SupportedLocale, ApiMessages> = {
  en: {
    rateLimit: 'Too many requests. Please try again later.',
    unauthorized: 'Unauthorized',
    serverError: 'An unexpected error occurred. Please try again later.',
    validationError: 'Please check your form inputs and try again.',
    contact: {
      success: 'Thank you for your message. We will get back to you soon.',
      statsError: 'Failed to fetch statistics',
    },
    inquiry: {
      success: 'Thank you for your inquiry. We will contact you shortly.',
      processingError:
        'An error occurred processing your inquiry. Please try again.',
      securityRequired: 'Security verification required',
      securityFailed: 'Security verification failed. Please try again.',
    },
    turnstile: {
      missingToken: 'Turnstile token is required',
      verificationFailed: 'Bot protection challenge failed',
      networkError: 'Failed to communicate with bot protection service',
      notConfigured: 'Bot protection is not properly configured on the server',
      success: 'Verification successful',
    },
  },
  zh: {
    rateLimit: '请求过于频繁，请稍后再试。',
    unauthorized: '未授权访问',
    serverError: '发生意外错误，请稍后再试。',
    validationError: '请检查您的表单输入后重试。',
    contact: {
      success: '感谢您的留言，我们会尽快与您联系。',
      statsError: '获取统计信息失败',
    },
    inquiry: {
      success: '感谢您的咨询，我们会尽快与您联系。',
      processingError: '处理您的咨询时发生错误，请重试。',
      securityRequired: '需要安全验证',
      securityFailed: '安全验证失败，请重试。',
    },
    turnstile: {
      missingToken: '缺少 Turnstile 令牌',
      verificationFailed: '机器人验证失败',
      networkError: '无法连接到验证服务',
      notConfigured: '服务器未正确配置机器人保护',
      success: '验证成功',
    },
  },
};

/**
 * Get localized API messages for the request's locale
 *
 * @param request - Next.js API request
 * @returns Localized API message strings
 */
export function getApiMessages(request: NextRequest): ApiMessages {
  const locale = getRequestLocale(request);
  // locale is type-safe (only 'en' | 'zh'), not user-controlled input
  // eslint-disable-next-line security/detect-object-injection -- locale validated by getRequestLocale
  return API_MESSAGES[locale];
}
