import {
  generateLocalizedStructuredData,
  type Locale,
} from '@/lib/structured-data';

/**
 * 页面结构化数据接口
 */
export interface PageStructuredData {
  organizationData: string;
  websiteData: string;
}

/**
 * 生成页面结构化数据
 * 包含组织信息和网站信息的JSON-LD数据
 */
export async function generatePageStructuredData(locale: Locale): Promise<{
  organizationData: Record<string, unknown>;
  websiteData: Record<string, unknown>;
}> {
  const organizationData = await generateLocalizedStructuredData(
    locale,
    'Organization',
    {},
  );
  const websiteData = await generateLocalizedStructuredData(
    locale,
    'WebSite',
    {},
  );

  return { organizationData, websiteData };
}
