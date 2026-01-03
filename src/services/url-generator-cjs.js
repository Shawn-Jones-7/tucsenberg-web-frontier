/**
 * CommonJS兼容的URL生成器导出
 * 用于next-sitemap.config.js等CommonJS环境
 */

/* eslint-disable security/detect-object-injection */

// SEO常量定义
const SEO_CONSTANTS = {
  PRIORITY: {
    HIGHEST: 1.0,
    HIGH: 0.8,
  },
  CHANGEFREQ: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
  },
};

// 硬编码配置，避免ES模块导入问题
const SITE_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://example.com',
};

const LOCALES_CONFIG = {
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  prefixes: {
    en: '',
    zh: '/zh',
  },
};

const PATHS_CONFIG = {
  home: { en: '/', zh: '/' },
  about: { en: '/about', zh: '/about' },
  contact: { en: '/contact', zh: '/contact' },
  blog: { en: '/blog', zh: '/blog' },
  products: { en: '/products', zh: '/products' },
  faq: { en: '/faq', zh: '/faq' },
  privacy: { en: '/privacy', zh: '/privacy' },
  terms: { en: '/terms', zh: '/terms' },
};

/**
 * 获取本地化路径
 */
function getLocalizedPath(pageType, locale) {
  // nosemgrep: object-injection-sink-dynamic-property -- PATHS_CONFIG 是静态内部配置对象，pageType 仅来自受控调用方并在此处进行存在性检查，键空间是受限且不可由用户直接控制的。
  if (!PATHS_CONFIG[pageType]) {
    throw new Error(`Unknown page type: ${pageType}`);
  }
  // nosemgrep: object-injection-sink-dynamic-property -- PATHS_CONFIG is a static internal configuration object and pageType is validated above, so keys are constrained and not user-controlled.
  return PATHS_CONFIG[pageType][locale];
}

/**
 * 生成规范化URL
 */
function generateCanonicalURL(pageType, locale) {
  const localizedPath = getLocalizedPath(pageType, locale);

  if (locale === 'en') {
    return `${SITE_CONFIG.baseUrl}${localizedPath}`;
  }
  return `${SITE_CONFIG.baseUrl}/${locale}${localizedPath}`;
}

/**
 * 生成hreflang链接
 */
function generateHreflangLinks(pageType) {
  const links = [];

  LOCALES_CONFIG.locales.forEach((locale) => {
    links.push({
      href: generateCanonicalURL(pageType, locale),
      hreflang: locale,
    });
  });

  // 添加x-default链接
  links.push({
    href: generateCanonicalURL(pageType, LOCALES_CONFIG.defaultLocale),
    hreflang: 'x-default',
  });

  return links;
}

/**
 * 生成sitemap条目
 */
function generateSitemapEntry(pageType, locale, options = {}) {
  const url = generateCanonicalURL(pageType, locale);
  const alternateRefs = generateHreflangLinks(pageType);

  return {
    loc: url,
    changefreq: options.changefreq || SEO_CONSTANTS.CHANGEFREQ.WEEKLY,
    priority: options.priority || SEO_CONSTANTS.PRIORITY.HIGH,
    lastmod: options.lastmod || new Date().toISOString(),
    alternateRefs,
  };
}

/**
 * 生成所有页面的sitemap条目
 */
function generateAllSitemapEntries() {
  const entries = [];

  Object.keys(PATHS_CONFIG).forEach((pageType) => {
    LOCALES_CONFIG.locales.forEach((locale) => {
      const entry = generateSitemapEntry(pageType, locale, {
        changefreq:
          pageType === 'home'
            ? SEO_CONSTANTS.CHANGEFREQ.DAILY
            : SEO_CONSTANTS.CHANGEFREQ.WEEKLY,
        priority:
          pageType === 'home'
            ? SEO_CONSTANTS.PRIORITY.HIGHEST
            : SEO_CONSTANTS.PRIORITY.HIGH,
      });
      entries.push(entry);
    });
  });

  return entries;
}

/**
 * 获取本地化路径配置
 */
function getLocalizedPaths() {
  const entries = Object.entries(PATHS_CONFIG)
    .filter(([pageType]) => pageType !== 'home')
    .map(([, paths]) => [paths.en, paths]);

  return Object.fromEntries(entries);
}

module.exports = {
  SITE_CONFIG,
  LOCALES_CONFIG,
  PATHS_CONFIG,
  getLocalizedPath,
  generateCanonicalURL,
  generateHreflangLinks,
  generateSitemapEntry,
  generateAllSitemapEntries,
  getLocalizedPaths,
};
