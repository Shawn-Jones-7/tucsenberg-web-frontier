import type { Metadata } from 'next';
import enCritical from '@messages/en/critical.json';
import zhCritical from '@messages/zh/critical.json';
import { SITE_CONFIG, type Locale, type PageType } from '@/config/paths';
import { ONE } from '@/constants';
import {
  generateCanonicalURL,
  generateLanguageAlternates,
} from '@/services/url-generator';

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

// SEO 翻译类型定义
type SEOPagesTranslations = Partial<
  Record<PageType, { title?: string; description?: string }>
>;

interface SEOMessages {
  title?: string;
  description?: string;
  siteName?: string;
  keywords?: string;
  pages?: SEOPagesTranslations;
}

const FALLBACK_LOCALE: Locale = 'en';

// 静态 SEO 翻译映射（同步访问，避免 async getTranslations）
const SEO_TRANSLATIONS: Record<Locale, SEOMessages> = {
  en: ((enCritical as { seo?: SEOMessages })?.seo ?? {}) as SEOMessages,
  zh: ((zhCritical as { seo?: SEOMessages })?.seo ?? {}) as SEOMessages,
};

function resolveLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'zh' : FALLBACK_LOCALE;
}

interface TranslationFieldOptions {
  translations: SEOMessages;
  pageType: PageType;
  key: 'title' | 'description';
  defaultValue: string;
  override?: string | undefined;
}

function getPageDataByType(
  pages: SEOPagesTranslations,
  pageType: PageType,
): { title?: string; description?: string } | undefined {
  switch (pageType) {
    case 'home':
      return pages.home;
    case 'about':
      return pages.about;
    case 'contact':
      return pages.contact;
    case 'blog':
      return pages.blog;
    case 'products':
      return pages.products;
    case 'services':
      return pages.services;
    case 'pricing':
      return pages.pricing;
    case 'support':
      return pages.support;
    case 'privacy':
      return pages.privacy;
    case 'terms':
      return pages.terms;
    default:
      return undefined;
  }
}

function getPageTranslation(
  pages: SEOPagesTranslations | undefined,
  pageType: PageType,
  key: 'title' | 'description',
): string | undefined {
  if (!pages) return undefined;
  const pageData = getPageDataByType(pages, pageType);
  if (!pageData) return undefined;
  return key === 'title' ? pageData.title : pageData.description;
}

function pickTranslatedField(options: TranslationFieldOptions): string {
  const { translations, pageType, key, defaultValue, override } = options;

  const pageValue = getPageTranslation(translations.pages, pageType, key);
  const rootValue =
    key === 'title' ? translations.title : translations.description;

  const candidate = override ?? pageValue ?? rootValue ?? defaultValue;

  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate
    : defaultValue;
}

/**
 * Apply base fields to merged config
 */
function applyBaseFields(target: SEOConfig, base: SEOConfig): void {
  if (base.type !== undefined) target.type = base.type;
  if (base.keywords !== undefined) target.keywords = base.keywords;
  if (base.image !== undefined) target.image = base.image;
}

/**
 * Apply custom fields to merged config
 */
function applyCustomFields(
  target: SEOConfig,
  custom: Partial<SEOConfig>,
): void {
  if (custom.type !== undefined) target.type = custom.type;
  if (custom.keywords !== undefined) target.keywords = custom.keywords;
  if (custom.image !== undefined) target.image = custom.image;
  if (custom.title !== undefined) target.title = custom.title;
  if (custom.description !== undefined) target.description = custom.description;
  if (custom.publishedTime !== undefined)
    target.publishedTime = custom.publishedTime;
  if (custom.modifiedTime !== undefined)
    target.modifiedTime = custom.modifiedTime;
  if (custom.authors !== undefined) target.authors = custom.authors;
  if (custom.section !== undefined) target.section = custom.section;
}

function mergeSEOConfig(
  baseConfig: SEOConfig,
  customConfig?: Partial<SEOConfig> | null,
): SEOConfig {
  const mergedConfig: SEOConfig = {};

  applyBaseFields(mergedConfig, baseConfig);

  if (customConfig === null || customConfig === undefined) {
    return mergedConfig;
  }

  applyCustomFields(mergedConfig, customConfig);

  return mergedConfig;
}

/**
 * 生成本地化元数据（同步版本）
 * 直接从静态 JSON 读取翻译，确保 metadata 嵌入初始 HTML
 */
function getTranslationsForLocale(locale: Locale): SEOMessages {
  return locale === 'zh' ? SEO_TRANSLATIONS.zh : SEO_TRANSLATIONS.en;
}

export function generateLocalizedMetadata(
  locale: Locale,
  pageType: PageType,
  config: SEOConfig = {},
): Metadata {
  const safeLocale = resolveLocale(locale);
  const translations = getTranslationsForLocale(safeLocale);

  const title = pickTranslatedField({
    translations,
    pageType,
    key: 'title',
    defaultValue: SITE_CONFIG.seo.defaultTitle,
    override: config.title,
  });
  const description = pickTranslatedField({
    translations,
    pageType,
    key: 'description',
    defaultValue: SITE_CONFIG.seo.defaultDescription,
    override: config.description,
  });
  const siteName =
    (translations.siteName?.trim()?.length ?? 0) > 0
      ? translations.siteName
      : SITE_CONFIG.name;

  const metadata: Metadata = {
    title,
    description,
    keywords:
      config.keywords ??
      (translations.keywords
        ? translations.keywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        : undefined),

    // Open Graph本地化
    openGraph: {
      title,
      description,
      siteName,
      locale: safeLocale,
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
      canonical: generateCanonicalURL(pageType, safeLocale),
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

  let baseConfig = baseConfigs.home;
  switch (pageType) {
    case 'home':
      baseConfig = baseConfigs.home;
      break;
    case 'about':
      baseConfig = baseConfigs.about;
      break;
    case 'contact':
      baseConfig = baseConfigs.contact;
      break;
    case 'blog':
      baseConfig = baseConfigs.blog;
      break;
    case 'products':
      baseConfig = baseConfigs.products;
      break;
    case 'services':
      baseConfig = baseConfigs.services;
      break;
    case 'pricing':
      baseConfig = baseConfigs.pricing;
      break;
    case 'support':
      baseConfig = baseConfigs.support;
      break;
    case 'privacy':
      baseConfig = baseConfigs.privacy;
      break;
    case 'terms':
      baseConfig = baseConfigs.terms;
      break;
    default:
      baseConfig = baseConfigs.home;
  }

  return mergeSEOConfig(baseConfig, customConfig);
}
