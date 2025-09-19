import type { Metadata } from 'next';
import {
  createPageSEOConfig,
  generateLocalizedMetadata,
  type Locale,
  type PageType,
} from '@/lib/seo-metadata';

/**
 * 生成页面元数据的便捷函数
 * 这是一个包装函数，用于简化页面元数据的生成
 */
export function generatePageMetadata({
  locale,
  page,
  customConfig = {},
}: {
  locale: Locale;
  page: PageType;
  customConfig?: Record<string, string | number | boolean>;
}): Promise<Metadata> {
  const seoConfig = createPageSEOConfig(page, customConfig);
  return generateLocalizedMetadata(locale, page, seoConfig);
}

// 重新导出相关类型和函数以保持兼容性
export {
  createPageSEOConfig,
  generateLocalizedMetadata,
} from '@/lib/seo-metadata';
export type { Locale, PageType } from '@/lib/seo-metadata';
