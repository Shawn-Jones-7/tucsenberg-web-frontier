/**
 * 路径配置工具函数
 */

/* eslint-disable security/detect-object-injection */

import { LOCALES_CONFIG } from '@/config/paths/locales-config';
import { PATHS_CONFIG } from '@/config/paths/paths-config';
import { SITE_CONFIG } from '@/config/paths/site-config';
import type { Locale, LocalizedPath, PageType } from '@/config/paths/types';

/**
 * 获取本地化路径
 */
export function getLocalizedPath(pageType: PageType, locale: Locale): string {
  // 严格验证输入参数
  if (pageType === null || pageType === undefined) {
    throw new Error('Page type cannot be null or undefined');
  }
  if (locale === null || locale === undefined) {
    throw new Error('Locale cannot be null or undefined');
  }

  if (!Object.prototype.hasOwnProperty.call(PATHS_CONFIG, pageType)) {
    throw new Error(`Unknown page type: ${pageType}`);
  }
  const pathConfig = PATHS_CONFIG[pageType];
  if (!Object.prototype.hasOwnProperty.call(pathConfig, locale)) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  return pathConfig[locale];
}

/**
 * 获取所有页面的路径映射（用于next-intl routing）
 *
 * 使用标准路径方案，所有语言使用相同路径
 */
export function getPathnames(): Record<string, string> {
  return {
    '/': '/',
    '/about': '/about',
    '/contact': '/contact',
    '/blog': '/blog',
    '/products': '/products',
    '/diagnostics': '/diagnostics',
    '/services': '/services',
    '/pricing': '/pricing',
    '/support': '/support',
    '/privacy': '/privacy',
    '/terms': '/terms',
  };
}

/**
 * 获取页面类型（根据路径反向查找）
 */
export function getPageTypeFromPath(
  path: string,
  locale: Locale,
): PageType | null {
  // 严格验证输入参数
  if (path === null || path === undefined) {
    throw new Error('Path cannot be null or undefined');
  }
  if (locale === null || locale === undefined) {
    throw new Error('Locale cannot be null or undefined');
  }

  // 处理根路径
  if (path === '/' || path === '') {
    return 'home';
  }

  // 查找匹配的页面类型
  for (const [pageType, paths] of Object.entries(PATHS_CONFIG)) {
    if (
      Object.prototype.hasOwnProperty.call(paths, locale) &&
      paths[locale] === path
    ) {
      return pageType as PageType;
    }
  }

  return null;
}

/**
 * 验证路径配置的一致性
 */
export function validatePathsConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查所有页面类型是否都有完整的路径配置
  Object.entries(PATHS_CONFIG).forEach(([pageType, paths]) => {
    LOCALES_CONFIG.locales.forEach((locale) => {
      if (!Object.prototype.hasOwnProperty.call(paths, locale)) {
        errors.push(`Missing ${locale} path for page type: ${pageType}`);
      }
    });
  });

  // 检查路径是否有重复
  const pathsByLocale: Record<Locale, Set<string>> = {
    en: new Set(),
    zh: new Set(),
  };

  Object.entries(PATHS_CONFIG).forEach(([pageType, paths]) => {
    LOCALES_CONFIG.locales.forEach((locale) => {
      if (Object.prototype.hasOwnProperty.call(paths, locale)) {
        const path = paths[locale];
        if (
          Object.prototype.hasOwnProperty.call(pathsByLocale, locale) &&
          pathsByLocale[locale].has(path)
        ) {
          errors.push(
            `Duplicate ${locale} path: ${path} (page type: ${pageType})`,
          );
        }
        if (Object.prototype.hasOwnProperty.call(pathsByLocale, locale)) {
          pathsByLocale[locale].add(path);
        }
      }
    });
  });

  // 检查路径格式
  Object.entries(PATHS_CONFIG).forEach(([pageType, paths]) => {
    LOCALES_CONFIG.locales.forEach((locale) => {
      if (Object.prototype.hasOwnProperty.call(paths, locale)) {
        const path = paths[locale];
        if (pageType !== 'home' && !path.startsWith('/')) {
          errors.push(
            `Invalid path format for ${pageType}.${locale}: ${path} (should start with /)`,
          );
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 获取sitemap配置（用于next-sitemap）
 */
export function getSitemapConfig() {
  const localizedPaths: Record<string, LocalizedPath> = {};

  Object.entries(PATHS_CONFIG).forEach(([pageType, paths]) => {
    if (pageType !== 'home') {
      localizedPaths[paths.en] = paths;
    }
  });

  return {
    baseUrl: SITE_CONFIG.baseUrl,
    localizedPaths,
    locales: LOCALES_CONFIG.locales,
    defaultLocale: LOCALES_CONFIG.defaultLocale,
  };
}

/**
 * 获取路由配置（用于next-intl）
 */
export function getRoutingConfig() {
  return {
    locales: LOCALES_CONFIG.locales,
    defaultLocale: LOCALES_CONFIG.defaultLocale,
    pathnames: getPathnames(),
    // 使用 'always' 模式确保所有语言都有前缀，这是使用 pathnames 时的最佳实践
    localePrefix: 'always' as const,
  };
}
