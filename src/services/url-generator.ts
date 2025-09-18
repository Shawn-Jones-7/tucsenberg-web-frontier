/**
 * 集中URL生成服务
 * 统一管理所有URL生成逻辑，确保一致性和类型安全
 */

/* eslint-disable security/detect-object-injection */

import { type Locale, getLocalizedPath, LOCALES_CONFIG, PATHS_CONFIG, SITE_CONFIG, type PageType } from '@/config/paths';
import { ONE, ZERO } from "@/constants";
import { SEO_CONSTANTS } from '@/constants/seo-constants';

// URL生成选项接口
export interface URLGeneratorOptions {
  includeLocale?: boolean;
  absolute?: boolean;
  trailingSlash?: boolean;
  protocol?: 'http' | 'https';
  host?: string;
}

// 默认选项
const DEFAULT_OPTIONS: Required<URLGeneratorOptions> = {
  includeLocale: true,
  absolute: false,
  trailingSlash: false,
  protocol: 'https',
  host: '',
};

// hreflang链接接口
export interface HreflangLink {
  href: string;
  hreflang: string;
}

// Sitemap条目接口
export interface SitemapEntry {
  loc: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
  lastmod?: string;
  alternateRefs?: HreflangLink[];
}

/**
 * 核心URL生成器类
 */
export class URLGenerator {
  private readonly baseUrl: string;
  private readonly defaultLocale: Locale;
  private readonly locales: readonly Locale[];

  constructor() {
    this.baseUrl = SITE_CONFIG.baseUrl;
    this.defaultLocale = LOCALES_CONFIG.defaultLocale;
    this.locales = LOCALES_CONFIG.locales;
  }

  /**
   * 生成页面URL
   */
  generatePageURL(
    pageType: PageType,
    locale: Locale,
    options: URLGeneratorOptions = {},
  ): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // 获取本地化路径
    const localizedPath = getLocalizedPath(pageType, locale);

    // 构建路径
    let path = '';

    // 添加语言前缀（如果需要且不是默认语言）
    if (opts.includeLocale && locale !== this.defaultLocale) {
      path += `/${locale}`;
    }

    // 添加页面路径（对于主页，如果已有语言前缀则不添加额外的斜杠）
    if (localizedPath !== '/' || path === '') {
      path += localizedPath;
    }

    // 添加尾部斜杠
    if (opts.trailingSlash && !path.endsWith('/') && path !== '') {
      path += '/';
    }

    // 返回绝对或相对URL
    if (opts.absolute) {
      const host = opts.host || this.baseUrl.replace(/^https?:\/\//, '');
      return `${opts.protocol}://${host}${path}`;
    }

    return path || '/';
  }

  /**
   * 生成规范化URL（用于SEO）
   */
  generateCanonicalURL(pageType: PageType, locale: Locale): string {
    return this.generatePageURL(pageType, locale, {
      absolute: true,
      includeLocale: true,
      trailingSlash: false,
    });
  }

  /**
   * 生成所有语言版本的URL映射
   */
  generateLanguageAlternates(pageType: PageType): Record<Locale, string> {
    const alternates: Record<string, string> = {};

    this.locales.forEach((locale) => {
      alternates[locale] = this.generateCanonicalURL(pageType, locale);
    });

    return alternates as Record<Locale, string>;
  }

  /**
   * 生成hreflang链接数组
   */
  generateHreflangLinks(pageType: PageType): HreflangLink[] {
    const links: HreflangLink[] = [];

    this.locales.forEach((locale) => {
      links.push({
        href: this.generateCanonicalURL(pageType, locale),
        hreflang: locale,
      });
    });

    // 添加x-default链接（指向默认语言）
    links.push({
      href: this.generateCanonicalURL(pageType, this.defaultLocale),
      hreflang: 'x-default',
    });

    return links;
  }

  /**
   * 生成sitemap条目
   */
  generateSitemapEntry(
    pageType: PageType,
    locale: Locale,
    options: {
      changefreq?: SitemapEntry['changefreq'];
      priority?: number;
      lastmod?: string;
    } = {},
  ): SitemapEntry {
    const url = this.generateCanonicalURL(pageType, locale);
    const alternateRefs = this.generateHreflangLinks(pageType);

    return {
      loc: url,
      changefreq:
        options.changefreq || SEO_CONSTANTS.URL_GENERATION.DEFAULT_CHANGEFREQ,
      priority:
        options.priority || SEO_CONSTANTS.URL_GENERATION.DEFAULT_PAGE_PRIORITY,
      lastmod: options.lastmod || new Date().toISOString(),
      alternateRefs,
    };
  }

  /**
   * 生成所有页面的sitemap条目
   */
  generateAllSitemapEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = [];

    // 为每个页面类型和语言生成条目
    Object.keys(PATHS_CONFIG).forEach((pageType) => {
      this.locales.forEach((locale) => {
        const entry = this.generateSitemapEntry(pageType as PageType, locale, {
          changefreq:
            pageType === 'home'
              ? SEO_CONSTANTS.URL_GENERATION.HOME_CHANGEFREQ
              : SEO_CONSTANTS.URL_GENERATION.DEFAULT_CHANGEFREQ,
          priority:
            pageType === 'home'
              ? SEO_CONSTANTS.URL_GENERATION.HOME_PAGE_PRIORITY
              : SEO_CONSTANTS.URL_GENERATION.DEFAULT_PAGE_PRIORITY,
        });
        entries.push(entry);
      });
    });

    return entries;
  }

  /**
   * 根据路径反向生成页面信息
   */
  parseURLToPageInfo(url: string): {
    pageType: PageType | null;
    locale: Locale;
    isValid: boolean;
  } {
    // 移除协议和域名
    let path = url.replace(/^https?:\/\/[^/]+/, '');

    // 移除查询参数和锚点
    const pathWithoutQuery = path.split('?')[ZERO] || '';
    path = pathWithoutQuery.split('#')[ZERO] || '';

    // 检测语言
    let locale: Locale = this.defaultLocale;
    let cleanPath = path;

    // 检查是否有语言前缀
    const localeMatch = path.match(/^\/([a-z]{2})(?=\/|$)/);
    if (localeMatch && this.locales.includes(localeMatch[ONE] as Locale)) {
      locale = localeMatch[ONE] as Locale;
      cleanPath = path.replace(/^\/[a-z]{2}/, '') || '/';
    }

    // 查找页面类型
    let pageType: PageType | null = null;

    if (cleanPath === '/' || cleanPath === '') {
      pageType = 'home';
    } else {
      // 查找匹配的页面类型
      for (const [type, paths] of Object.entries(PATHS_CONFIG)) {
        if (
          Object.prototype.hasOwnProperty.call(paths, locale) &&
          paths[locale] === cleanPath
        ) {
          pageType = type as PageType;
          break;
        }
      }
    }

    return {
      pageType,
      locale,
      isValid: pageType !== null,
    };
  }

  /**
   * 验证URL是否有效
   */
  isValidURL(url: string): boolean {
    const { isValid } = this.parseURLToPageInfo(url);
    return isValid;
  }

  /**
   * 获取基础URL
   */
  getBaseURL(): string {
    return this.baseUrl;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLocales(): readonly Locale[] {
    return this.locales;
  }

  /**
   * 获取默认语言
   */
  getDefaultLocale(): Locale {
    return this.defaultLocale;
  }
}

// 导出单例实例
export const urlGenerator = new URLGenerator();

// 导出便捷函数
export const generatePageURL = urlGenerator.generatePageURL.bind(urlGenerator);
export const generateCanonicalURL =
  urlGenerator.generateCanonicalURL.bind(urlGenerator);
export const generateLanguageAlternates =
  urlGenerator.generateLanguageAlternates.bind(urlGenerator);
export const generateHreflangLinks =
  urlGenerator.generateHreflangLinks.bind(urlGenerator);
export const generateSitemapEntry =
  urlGenerator.generateSitemapEntry.bind(urlGenerator);
export const generateAllSitemapEntries =
  urlGenerator.generateAllSitemapEntries.bind(urlGenerator);
export const parseURLToPageInfo =
  urlGenerator.parseURLToPageInfo.bind(urlGenerator);
export const isValidURL = urlGenerator.isValidURL.bind(urlGenerator);

// 类型已在上面导出
