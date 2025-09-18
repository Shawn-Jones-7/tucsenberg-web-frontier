/* eslint-disable security/detect-object-injection */
import { SITE_CONFIG, type Locale, type PageType } from '@/config/paths';
import { ONE } from "@/constants";
import {
  generateCanonicalURL,
  generateLanguageAlternates,
} from '@/services/url-generator';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// 重新导出类型以保持向后兼容
export type { Locale, PageType } from '@/config/paths';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

/**
 * 生成本地化元数据
 */
export async function generateLocalizedMetadata(
  locale: Locale,
  pageType: PageType,
  config: SEOConfig = {},
): Promise<Metadata> {
  // 使用原始的getTranslations，缓存已在底层实现
  const t = await getTranslations({ locale, namespace: 'seo' });

  const title =
    config.title || t('title', { defaultValue: SITE_CONFIG.seo.defaultTitle });
  const description =
    config.description ||
    t('description', {
      defaultValue: SITE_CONFIG.seo.defaultDescription,
    });
  const siteName = t('siteName', { defaultValue: SITE_CONFIG.name });

  const metadata: Metadata = {
    title,
    description,
    keywords: config.keywords,

    // Open Graph本地化
    openGraph: {
      title,
      description,
      siteName,
      locale,
      type: (config.type === 'product' ? 'website' : config.type) || 'website',
      images: config.image ? [{ url: config.image }] : undefined,
      publishedTime: config.publishedTime,
      modifiedTime: config.modifiedTime,
      authors: config.authors,
      section: config.section,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: config.image ? [config.image] : undefined,
    },

    // hreflang和canonical链接
    alternates: {
      canonical: generateCanonicalURL(pageType, locale),
      languages: generateLanguageAlternates(pageType),
    },

    // 其他元数据
    robots: {
      index: true,
      follow: true,
      googleBot: {
        'index': true,
        'follow': true,
        'max-video-preview': -ONE,
        'max-image-preview': 'large',
        'max-snippet': -ONE,
      },
    },

    // 验证标签
    verification: {
      google: process.env['GOOGLE_SITE_VERIFICATION'],
      yandex: process.env['YANDEX_VERIFICATION'],
    },
  };

  return metadata;
}

/**
 * 生成页面特定的SEO配置
 */
export function createPageSEOConfig(
  pageType: PageType,
  customConfig: Partial<SEOConfig> = {},
): SEOConfig {
  const baseConfigs: Record<PageType, SEOConfig> = {
    home: {
      type: 'website' as const,
      keywords: [
        ...SITE_CONFIG.seo.keywords,
        'shadcn/ui',
        'Radix UI',
        'Modern Web',
        'Enterprise Platform',
        'B2B Solution',
      ],
      image: '/images/og-image.jpg',
    },
    about: {
      type: 'website' as const,
      keywords: ['About', 'Company', 'Team', 'Enterprise'],
    },
    contact: {
      type: 'website' as const,
      keywords: ['Contact', 'Support', 'Business'],
    },
    blog: {
      type: 'article' as const,
      keywords: ['Blog', 'Articles', 'Technology', 'Insights'],
    },
    products: {
      type: 'website' as const,
      keywords: ['Products', 'Solutions', 'Enterprise', 'B2B'],
    },
    diagnostics: {
      type: 'website' as const,
      keywords: ['Diagnostics', 'Tools', 'Development', 'Debug'],
    },
    services: {
      type: 'website' as const,
      keywords: ['Services', 'Solutions', 'Enterprise', 'B2B'],
    },
    pricing: {
      type: 'website' as const,
      keywords: ['Pricing', 'Plans', 'Enterprise', 'B2B'],
    },
    support: {
      type: 'website' as const,
      keywords: ['Support', 'Help', 'Documentation', 'Service'],
    },
    privacy: {
      type: 'website' as const,
      keywords: ['Privacy', 'Policy', 'Data Protection'],
    },
    terms: {
      type: 'website' as const,
      keywords: ['Terms', 'Conditions', 'Legal'],
    },
  };

  const baseConfig = Object.prototype.hasOwnProperty.call(baseConfigs, pageType)
    ? baseConfigs[pageType]
    : baseConfigs.home;

  return {
    ...baseConfig,
    ...customConfig,
  };
}
