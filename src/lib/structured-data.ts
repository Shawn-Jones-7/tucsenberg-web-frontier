import { getTranslations } from 'next-intl/server';
import { I18nPerformanceMonitor } from '@/lib/i18n-performance';
import { type PageType } from '@/config/paths';
import {
  generateArticleData,
  generateBreadcrumbData,
  generateOrganizationData,
  generateProductData,
  generateWebSiteData,
} from './structured-data-generators';
// 导入需要的函数
import {
  generateArticleSchema,
  generateProductSchema,
} from './structured-data-helpers';
import type {
  ArticleData,
  BreadcrumbData,
  Locale,
  OrganizationData,
  ProductData,
  StructuredDataType,
  WebSiteData,
} from './structured-data-types';

// 重新导出类型
export type { Locale } from '@/lib/structured-data-types';

/**
 * 生成本地化结构化数据
 */
export async function generateLocalizedStructuredData(
  locale: Locale,
  type: 'Organization' | 'WebSite' | 'Article' | 'Product' | 'BreadcrumbList',
  data: StructuredDataType,
): Promise<Record<string, unknown>> {
  try {
    // 使用原始的getTranslations，缓存已在底层实现
    const t = await getTranslations({ locale, namespace: 'structured-data' });

    switch (type) {
      case 'Organization':
        return generateOrganizationData(t, data as OrganizationData);
      case 'WebSite':
        return generateWebSiteData(t, data as WebSiteData);
      case 'Article':
        return generateArticleData(t, locale, data as ArticleData);
      case 'Product':
        return generateProductData(t, data as ProductData);
      case 'BreadcrumbList':
        return generateBreadcrumbData(data as BreadcrumbData);
      default:
        // 对于未知类型，返回基础结构而不使用扩展运算符
        return {
          '@context': 'https://schema.org',
          '@type': type,
        };
    }
  } catch (error) {
    // 记录错误并返回基础结构
    if (error instanceof Error) {
      // 处理已知错误类型
      I18nPerformanceMonitor.recordError();
    }
    // 错误情况下也不使用扩展运算符，避免潜在的安全风险
    return {
      '@context': 'https://schema.org',
      '@type': type,
    };
  }
}

/**
 * 生成JSON-LD脚本标签
 */
export function generateJSONLD(structuredData: unknown): string {
  const JSON_INDENT = 2;
  return JSON.stringify(structuredData, null, JSON_INDENT);
}

// 重新导出便捷函数
export {
  createArticleStructuredData,
  createBreadcrumbStructuredData,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateProductSchema,
} from './structured-data-helpers';

// 函数重载：根据页面类型返回不同长度的元组，便于测试中按索引访问
export function generateStructuredData(
  _page: 'home',
  _locale: Locale,
): Promise<[Record<string, unknown>, Record<string, unknown>]>;
export function generateStructuredData(
  _page: 'blog',
  _locale: Locale,
  _extras: {
    article: {
      title: string;
      description: string;
      author?: string;
      publishedTime?: string;
      modifiedTime?: string;
      image?: string;
      section?: string;
    };
  },
): Promise<
  [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>]
>;
export function generateStructuredData(
  _page: 'products',
  _locale: Locale,
  _extras: {
    product: {
      name: string;
      description: string;
      image?: string;
      price?: string | number;
      currency?: string;
      availability?: string;
      brand?: string;
      sku?: string;
    };
  },
): Promise<
  [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>]
>;
export async function generateStructuredData(
  page: PageType,
  locale: Locale,
  extras?: {
    article?: {
      title: string;
      description: string;
      author?: string;
      publishedTime?: string;
      modifiedTime?: string;
      image?: string;
      section?: string;
    };
    product?: {
      name: string;
      description: string;
      image?: string;
      price?: string | number;
      currency?: string;
      availability?: string;
      brand?: string;
      sku?: string;
    };
  },
): Promise<Array<Record<string, unknown>>> {
  const t = await getTranslations({ locale, namespace: 'structured-data' });
  const organization = generateOrganizationData(t, {});
  const website = generateWebSiteData(t, {});

  const base = [organization, website] as Array<Record<string, unknown>>;

  if (page === 'blog' && extras?.article) {
    const article = await generateArticleSchema(extras.article, locale);
    return [...base, article];
  }
  if (page === 'products' && extras?.product) {
    const product = await generateProductSchema(extras.product, locale);
    return [...base, product];
  }

  return base;
}
