/**
 * 站点配置
 *
 * Template placeholders: Replace 'Company Name' and 'example.com' with actual values.
 * Business data should use siteFacts from '@/config/site-facts'.
 */

import { siteFacts } from '@/config/site-facts';

// 站点配置
export const SITE_CONFIG = {
  baseUrl:
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    'https://example.com',
  name: siteFacts.company.name,
  description: 'Modern B2B Enterprise Web Platform',

  // SEO配置
  seo: {
    titleTemplate: `%s | ${siteFacts.company.name}`,
    defaultTitle: siteFacts.company.name,
    defaultDescription: 'Modern B2B Enterprise Web Platform',
    keywords: ['Next.js', 'React', 'TypeScript', 'B2B', 'Enterprise'],
  },

  // 社交媒体链接 - use siteFacts.social with fallback placeholders
  social: {
    twitter: siteFacts.social.twitter ?? 'https://twitter.com/company',
    linkedin:
      siteFacts.social.linkedin ?? 'https://linkedin.com/company/example',
    github: 'https://github.com/company',
  },

  // 联系信息 - use siteFacts.contact
  contact: {
    phone: siteFacts.contact.phone,
    email: siteFacts.contact.email,
    whatsappNumber:
      process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ??
      siteFacts.contact.whatsapp ??
      '+1-555-0123',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
