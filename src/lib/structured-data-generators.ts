import { getTranslations } from 'next-intl/server';
import type {
  ArticleData,
  BreadcrumbData,
  Locale,
  OrganizationData,
  ProductData,
  WebSiteData,
} from '@/lib/structured-data-types';
import { SITE_CONFIG } from '@/config/paths/site-config';
import { routing } from '@/i18n/routing';

const DEFAULT_BASE_URL =
  process.env['NEXT_PUBLIC_BASE_URL'] ||
  process.env['NEXT_PUBLIC_SITE_URL'] ||
  SITE_CONFIG.baseUrl;

const DEFAULT_LOGO_PATH = '/next.svg';

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
      t('organization.name', {
        defaultValue: SITE_CONFIG.name,
      }),
    'description':
      data.description ||
      t('organization.description', {
        defaultValue: SITE_CONFIG.description,
      }),
    'url': data.url || DEFAULT_BASE_URL,
    'logo': data.logo || `${DEFAULT_BASE_URL}${DEFAULT_LOGO_PATH}`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone':
        data.phone ||
        t('organization.phone', { defaultValue: SITE_CONFIG.contact.phone }),
      'contactType': 'customer service',
      'availableLanguage': routing.locales,
    },
    'sameAs': [
      t('organization.social.twitter', {
        defaultValue: SITE_CONFIG.social.twitter,
      }),
      t('organization.social.linkedin', {
        defaultValue: SITE_CONFIG.social.linkedin,
      }),
      t('organization.social.github', {
        defaultValue: SITE_CONFIG.social.github,
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
      t('website.name', {
        defaultValue: SITE_CONFIG.name,
      }),
    'description':
      data.description ||
      t('website.description', {
        defaultValue: SITE_CONFIG.seo.defaultDescription,
      }),
    'url': data.url || DEFAULT_BASE_URL,
    'potentialAction': {
      '@type': 'SearchAction',
      'target':
        data.searchUrl || `${DEFAULT_BASE_URL}/search?q={search_term_string}`,
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
        t('article.defaultAuthor', {
          defaultValue: `${SITE_CONFIG.name} Team`,
        }),
    },
    'publisher': {
      '@type': 'Organization',
      'name': t('organization.name', {
        defaultValue: SITE_CONFIG.name,
      }),
      'logo': {
        '@type': 'ImageObject',
        'url': `${DEFAULT_BASE_URL}${DEFAULT_LOGO_PATH}`,
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
          defaultValue: SITE_CONFIG.name,
        }),
    },
    'manufacturer': {
      '@type': 'Organization',
      'name':
        data.manufacturer ||
        t('organization.name', {
          defaultValue: SITE_CONFIG.name,
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
