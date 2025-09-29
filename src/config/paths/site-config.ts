/**
 * 站点配置
 */

// 站点配置
export const SITE_CONFIG = {
  baseUrl:
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    'https://tucsenberg.com',
  name: 'Tucsenberg Web Frontier',
  description: 'Modern B2B Enterprise Web Platform with Next.js 15',

  // SEO配置
  seo: {
    titleTemplate: '%s | Tucsenberg Web Frontier',
    defaultTitle: 'Tucsenberg Web Frontier',
    defaultDescription: 'Modern B2B Enterprise Web Platform with Next.js 15',
    keywords: ['Next.js', 'React', 'TypeScript', 'B2B', 'Enterprise'],
  },

  // 社交媒体链接
  social: {
    twitter: 'https://twitter.com/tucsenberg',
    linkedin: 'https://linkedin.com/company/tucsenberg',
    github: 'https://github.com/tucsenberg',
  },

  // 联系信息
  contact: {
    phone: '+1-555-0123',
    email: 'contact@tucsenberg.com',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
