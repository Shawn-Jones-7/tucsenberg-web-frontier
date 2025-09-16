/**
 * 测试环境专用的i18n配置
 * 解决E2E测试中页面标题为空的问题
 */

import { getRequestConfig } from 'next-intl/server';
import { logger } from '@/lib/logger';
import { routing } from '@/i18n/routing';

// 测试环境的简化翻译加载器
async function loadTestMessages(locale: string) {
  try {
    // 直接导入翻译文件，避免缓存复杂性
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return messages;
  } catch (_error) {
    // 忽略错误变量
    logger.error(
      `Failed to load test messages for locale ${locale}`,
      {
        locale,
      },
      _error instanceof Error ? _error : new Error(String(_error)),
    );
    // 返回基本的翻译数据确保测试能运行
    return {
      seo: {
        title: 'Tucsenberg Web Frontier',
        description:
          'Modern B2B Enterprise Web Platform with Next.js 15, React 19, and TypeScript',
        siteName: 'Tucsenberg Web Frontier',
      },
      hero: {
        version: 'v1.0.0',
        title: {
          line1: 'Tucsenberg',
          line2: 'Web Frontier',
        },
        subtitle: 'Modern B2B Enterprise Web Platform',
      },
    };
  }
}

// 测试环境的请求配置
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // 确保locale有效
  if (!locale || !routing.locales.includes(locale as 'en' | 'zh')) {
    locale = routing.defaultLocale;
  }

  const messages = await loadTestMessages(locale);

  return {
    locale,
    messages,
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric' as const,
          month: 'short' as const,
          year: 'numeric' as const,
        },
      },
      number: {
        currency: {
          style: 'currency' as const,
          currency: locale === 'zh' ? 'CNY' : 'USD',
        },
      },
    },
    // 测试环境禁用严格类型检查以提高兼容性
    strictMessageTypeSafety: false,
  };
});
