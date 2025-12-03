import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Shared Pathnames 配置 - next-intl 3.0 推荐方案
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
    '/blog': '/blog',
    '/faq': '/faq',
    '/privacy': '/privacy',
    // 以下页面尚未实现，暂时移除以避免 404 错误
    // '/pricing': '/pricing',
    // '/support': '/support',
    // '/terms': '/terms',
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

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

// 导出类型，使用统一配置
export type Locale = (typeof routing.locales)[number];

// 导出配置验证函数，供其他模块使用
export { validatePathsConfig } from '@/config/paths';
