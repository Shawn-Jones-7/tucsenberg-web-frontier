import type { Metadata } from 'next';
import {
  createPageSEOConfig,
  generateLocalizedMetadata,
  type Locale,
} from '@/lib/seo-metadata';
import { routing } from '@/i18n/routing';

/**
 * 生成本地化页面元数据（同步版本）
 * 翻译从静态 JSON 读取，确保 metadata 嵌入初始 HTML
 */
export async function generateLocaleMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // await params 是 Next.js 16 的要求，但解析很快
  const { locale } = await params;

  // 确保locale有效
  if (!routing.locales.includes(locale as Locale)) {
    return {
      title: 'Tucsenberg Web Frontier',
      description: 'Modern B2B Enterprise Web Platform with Next.js 15',
    };
  }

  const seoConfig = createPageSEOConfig('home');
  // generateLocalizedMetadata 现在是同步的，翻译直接从 JSON 读取
  return generateLocalizedMetadata(locale as Locale, 'home', seoConfig);
}
