import { getTranslations } from 'next-intl/server';
import type {
  ArticleData,
  BreadcrumbData,
  Locale,
  OrganizationData,
  ProductData,
  WebSiteData,
} from '@/lib/structured-data-types';
import { siteFacts } from '@/config/site-facts';
import { routing } from '@/i18n/routing';

const BASE_URL_FALLBACK = 'https://example.com';

/**
 * 生成组织结构化数据
 */
export function generateOrganizationData(
  t: Awaited<ReturnType<typeof getTranslations>>,
  data: OrganizationData = {},
) {
  const baseUrl =
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    BASE_URL_FALLBACK;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name':
      data.name ||
      t('organization.name', { defaultValue: siteFacts.company.name }),
    'description':
      data.description ||
      t('organization.description', {
        defaultValue: 'Modern B2B Enterprise Web Platform',
      }),
    'url': data.url || baseUrl,
    'logo': data.logo || `${baseUrl}/logo.png`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone':
        data.phone ||
        t('organization.phone', { defaultValue: siteFacts.contact.phone }),
      'contactType': 'customer service',
      'availableLanguage': routing.locales,
    },
    'sameAs': [
      t('organization.social.twitter', {
        defaultValue: siteFacts.social.twitter ?? 'https://twitter.com/company',
      }),
      t('organization.social.linkedin', {
        defaultValue:
          siteFacts.social.linkedin ?? 'https://linkedin.com/company/example',
      }),
      t('organization.social.github', {
        defaultValue: 'https://github.com/company',
      }),
    ],
  };
}

/**
 * 生成网站结构化数据
 */
export function generateWebSiteData(
  t: Awaited<ReturnType<typeof getTranslations>>,
  data: WebSiteData = {},
) {
  const baseUrl =
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    BASE_URL_FALLBACK;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name':
      data.name || t('website.name', { defaultValue: siteFacts.company.name }),
    'description':
      data.description ||
      t('website.description', {
        defaultValue: 'Modern B2B Enterprise Web Platform',
      }),
    'url': data.url || baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': data.searchUrl || `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    'inLanguage': routing.locales,
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
  const baseUrl =
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    BASE_URL_FALLBACK;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': data.title,
    'description': data.description,
    'author': {
      '@type': 'Person',
      'name':
        data.author ||
        t('article.defaultAuthor', {
          defaultValue: `${siteFacts.company.name} Team`,
        }),
    },
    'publisher': {
      '@type': 'Organization',
      'name': t('organization.name', {
        defaultValue: siteFacts.company.name,
      }),
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.png`,
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
          defaultValue: siteFacts.company.name,
        }),
    },
    'manufacturer': {
      '@type': 'Organization',
      'name':
        data.manufacturer ||
        t('organization.name', {
          defaultValue: siteFacts.company.name,
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
