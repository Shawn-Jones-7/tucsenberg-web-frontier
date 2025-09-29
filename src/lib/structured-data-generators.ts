import { getTranslations } from 'next-intl/server';
import type {
  ArticleData,
  BreadcrumbData,
  Locale,
  OrganizationData,
  ProductData,
  WebSiteData,
} from '@/lib/structured-data-types';
import { routing } from '@/i18n/routing';

/**
 * 生成组织结构化数据
 */
export function generateOrganizationData(
  t: Awaited<ReturnType<typeof getTranslations>>,
  data: OrganizationData = {},
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name':
      data.name ||
      t('organization.name', { defaultValue: 'Tucsenberg Web Frontier' }),
    'description':
      data.description ||
      t('organization.description', {
        defaultValue: 'Modern B2B Enterprise Web Platform',
      }),
    'url':
      data.url ||
      process.env['NEXT_PUBLIC_BASE_URL'] ||
      process.env['NEXT_PUBLIC_SITE_URL'] ||
      'https://tucsenberg.com',
    'logo':
      data.logo ||
      `${process.env['NEXT_PUBLIC_BASE_URL'] || process.env['NEXT_PUBLIC_SITE_URL'] || 'https://tucsenberg.com'}/logo.png`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone':
        data.phone || t('organization.phone', { defaultValue: '+1-555-0123' }),
      'contactType': 'customer service',
      'availableLanguage': routing.locales,
    },
    'sameAs': [
      t('organization.social.twitter', {
        defaultValue: 'https://twitter.com/tucsenberg',
      }),
      t('organization.social.linkedin', {
        defaultValue: 'https://linkedin.com/company/tucsenberg',
      }),
      t('organization.social.github', {
        defaultValue: 'https://github.com/tucsenberg',
      }),
    ],
    // 移除 ...data 扩展运算符，只使用已验证的属性
  };
}

/**
 * 生成网站结构化数据
 */
export function generateWebSiteData(
  t: Awaited<ReturnType<typeof getTranslations>>,
  data: WebSiteData = {},
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name':
      data.name ||
      t('website.name', { defaultValue: 'Tucsenberg Web Frontier' }),
    'description':
      data.description ||
      t('website.description', {
        defaultValue: 'Modern B2B Enterprise Web Platform with Next.js 15',
      }),
    'url':
      data.url ||
      process.env['NEXT_PUBLIC_BASE_URL'] ||
      process.env['NEXT_PUBLIC_SITE_URL'] ||
      'https://tucsenberg.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target':
        data.searchUrl ||
        `${process.env['NEXT_PUBLIC_BASE_URL'] || process.env['NEXT_PUBLIC_SITE_URL'] || 'https://tucsenberg.com'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    'inLanguage': routing.locales,
    // 移除 ...data 扩展运算符，只使用已验证的属性
  };
}

/**
 * 生成文章结构化数据
 */
export function generateArticleData(
  t: Awaited<ReturnType<typeof getTranslations>>,
  locale: Locale,
  data: ArticleData,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': data.title,
    'description': data.description,
    'author': {
      '@type': 'Person',
      'name':
        data.author ||
        t('article.defaultAuthor', { defaultValue: 'Tucsenberg Team' }),
    },
    'publisher': {
      '@type': 'Organization',
      'name': t('organization.name', {
        defaultValue: 'Tucsenberg Web Frontier',
      }),
      'logo': {
        '@type': 'ImageObject',
        'url': `${process.env['NEXT_PUBLIC_BASE_URL'] || process.env['NEXT_PUBLIC_SITE_URL'] || 'https://tucsenberg.com'}/logo.png`,
      },
    },
    'datePublished': data.publishedTime,
    'dateModified': data.modifiedTime || data.publishedTime,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': data.url,
    },
    'image': data.image
      ? {
          '@type': 'ImageObject',
          'url': data.image,
        }
      : undefined,
    'inLanguage': locale,
    'section': data.section,
    // 移除 ...data 扩展运算符，只使用已验证的属性
  };
}

/**
 * 生成产品结构化数据
 */
export function generateProductData(
  t: Awaited<ReturnType<typeof getTranslations>>,
  data: ProductData,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': data.name,
    'description': data.description,
    'brand': {
      '@type': 'Brand',
      'name':
        data.brand ||
        t('organization.name', {
          defaultValue: 'Tucsenberg Web Frontier',
        }),
    },
    'manufacturer': {
      '@type': 'Organization',
      'name':
        data.manufacturer ||
        t('organization.name', {
          defaultValue: 'Tucsenberg Web Frontier',
        }),
    },
    'image': data.image ? [data.image] : undefined,
    'offers': data.price
      ? {
          '@type': 'Offer',
          'price': data.price,
          'priceCurrency': data.currency || 'USD',
          'availability': data.availability || 'https://schema.org/InStock',
        }
      : undefined,
    'sku': data.sku,
    // 移除 ...data 扩展运算符，只使用已验证的属性
  };
}

/**
 * 生成面包屑结构化数据
 */
export function generateBreadcrumbData(data: BreadcrumbData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement':
      data.items?.map((item, index) => ({
        '@type': 'ListItem',
        'position': item.position || index + 1,
        'name': item.name,
        'item': item.url,
      })) || [],
    // 移除 ...data 扩展运算符，只使用已验证的属性
  };
}
