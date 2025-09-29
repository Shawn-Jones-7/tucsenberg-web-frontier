/** @type {import('next-sitemap').IConfig} */

// 导入URL生成服务
const {
  SITE_CONFIG,
  generateHreflangLinks,
  generateAllSitemapEntries,
  getLocalizedPaths,
} = require('./src/services/url-generator-cjs.js');

module.exports = {
  siteUrl: SITE_CONFIG.baseUrl,
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*', '/server-sitemap.xml'],

  // next-intl多语言支持 - 使用URL生成服务
  alternateRefs: generateHreflangLinks('home'),

  // 多语言路径映射 - 使用URL生成服务
  transform: async (config, path) => {
    const localizedPaths = getLocalizedPaths();
    const pathConfig = localizedPaths[path];

    if (pathConfig) {
      // 查找页面类型
      let pageType = 'home';
      for (const [type, paths] of Object.entries(localizedPaths)) {
        if (paths.en === path) {
          // 从路径反向查找页面类型
          for (const [pt, pc] of Object.entries({
            about: { en: '/about', zh: '/guanyu' },
            contact: { en: '/contact', zh: '/lianxi' },
            blog: { en: '/blog', zh: '/boke' },
            products: { en: '/products', zh: '/chanpin' },
            services: { en: '/services', zh: '/fuwu' },
            pricing: { en: '/pricing', zh: '/jiage' },
            support: { en: '/support', zh: '/zhichi' },
            privacy: { en: '/privacy', zh: '/yinsi' },
            terms: { en: '/terms', zh: '/tiaokuan' },
          })) {
            if (pc.en === path) {
              pageType = pt;
              break;
            }
          }
          break;
        }
      }

      // 使用URL生成服务生成hreflang链接
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        alternateRefs: generateHreflangLinks(pageType),
      };
    }

    // 对于没有本地化配置的路径，返回默认处理
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs || [],
    };
  },

  // 添加额外的URL - 使用URL生成服务
  additionalPaths: async (config) => {
    // 直接使用URL生成服务生成所有sitemap条目
    return generateAllSitemapEntries();
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [`${SITE_CONFIG.baseUrl}/server-sitemap.xml`],
  },
};
