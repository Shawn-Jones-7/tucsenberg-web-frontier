import { defineRouting } from 'next-intl/routing';

/**
 * Core routing configuration for next-intl.
 * This file contains only the routing definition without navigation exports,
 * making it safe to import in Edge Runtime (middleware).
 *
 * For navigation components (Link, redirect, usePathname, useRouter),
 * import from '@/i18n/routing' instead.
 */
export const routing = defineRouting({
  // 支持的语言
  locales: ['en', 'zh'],

  // 默认语言
  defaultLocale: 'en',

  // 使用 'always' 模式 - next-intl 3.0 官方推荐，避免边缘情况
  localePrefix: 'always',

  // Shared Pathnames - 所有语言使用相同路径，简单可靠
  // 注意：仅包含已实现的页面路径，避免 404 错误
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/contact': '/contact',
    '/products': '/products',
    '/products/[slug]': '/products/[slug]',
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/faq': '/faq',
    '/privacy': '/privacy',
    '/terms': '/terms',
  },

  // 启用hreflang链接
  alternateLinks: true,

  // 启用智能语言检测
  localeDetection: true,

  // 配置locale cookie - 持久化用户语言偏好
  localeCookie: {
    name: 'NEXT_LOCALE',
    // 1年过期时间 (符合GDPR要求)
    maxAge: 60 * 60 * 24 * 365,
  },
});

// 导出类型，使用统一配置
export type Locale = (typeof routing.locales)[number];
