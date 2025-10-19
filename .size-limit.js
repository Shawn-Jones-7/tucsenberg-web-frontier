/**
 * Size Limit 配置 - 细粒度 Bundle 守门
 *
 * 策略：
 * 1. 核心 Chunks：framework、main-app、main、polyfills、webpack
 * 2. 分组 Chunks：基于 next.config.ts 的 9 个 cacheGroups
 * 3. 兜底规则：匹配匿名 shared chunks（如 0a4bdfb2-*.js）
 *
 * 门限设置原则：
 * - 当前大小 + 10-20% 缓冲
 * - vendors 严格守门：200 kB（当前 561 kB，强制优化）
 * - 防止单个 vendor 暴涨
 *
 * 插件：@size-limit/file (仅测量文件大小,无 Chrome 依赖)
 * 更新时间：2025-01-19
 */

module.exports = [
  // ==================== 核心 Chunks ====================
  {
    name: 'Framework Bundle',
    path: '.next/static/chunks/framework-*.js',
    limit: '200 KB', // 当前 179K，+21K 缓冲
  },
  {
    name: 'Main App Bundle',
    path: '.next/static/chunks/main-app-*.js',
    limit: '10 KB', // 当前 2.0K，+8K 缓冲
  },
  {
    name: 'Main Bundle',
    path: '.next/static/chunks/main-*.js',
    limit: '10 KB', // 当前 1.6K，+8.4K 缓冲
  },
  {
    name: 'Polyfills Bundle',
    path: '.next/static/chunks/polyfills-*.js',
    limit: '120 KB', // 当前 110K，+10K 缓冲
  },
  {
    name: 'Webpack Runtime',
    path: '.next/static/chunks/webpack-*.js',
    limit: '10 KB', // 当前 4.2K，+5.8K 缓冲
  },

  // ==================== 分组 Chunks（基于 next.config.ts cacheGroups）====================
  {
    name: 'Sentry Bundle',
    path: '.next/static/chunks/sentry*.js',
    limit: '400 KB', // 当前 362K，+38K 缓冲
  },
  {
    name: 'Vendors Bundle',
    path: '.next/static/chunks/vendors-*.js',
    limit: '150 KB', // P1 优化完成：当前 114 KB (Brotli)，目标 ≤150 KB ✅
  },
  {
    name: 'Radix UI Bundle',
    path: '.next/static/chunks/radix-ui-*.js',
    limit: '80 KB', // 当前 67K，+13K 缓冲
  },
  {
    name: 'UI Libs Bundle',
    path: '.next/static/chunks/ui-libs*.js',
    limit: '50 KB', // 当前 41K，+9K 缓冲
  },
  {
    name: 'Analytics Libs Bundle',
    path: '.next/static/chunks/analytics-libs*.js',
    limit: '15 KB', // 当前 8.8K，+6.2K 缓冲
  },
  {
    name: 'Utils Bundle',
    path: '.next/static/chunks/utils-*.js',
    limit: '35 KB', // 当前 25K，+10K 缓冲
  },
  {
    name: 'Next.js Libs Bundle',
    path: '.next/static/chunks/nextjs-libs-*.js',
    limit: '25 KB', // 当前 15K，+10K 缓冲
  },
  {
    name: 'Lucide Icons Bundle',
    path: '.next/static/chunks/lucide-*.js',
    limit: '15 KB', // 当前 8.5K，+6.5K 缓冲
  },
  {
    name: 'Floating UI Bundle',
    path: '.next/static/chunks/floating-ui*.js',
    limit: '25 KB', // 当前 21.8K，+3.2K 缓冲
  },

  // ==================== 兜底规则：匿名 Shared Chunks ====================
  {
    name: 'Anonymous Shared Chunks',
    path: '.next/static/chunks/[0-9a-f]*-*.js',
    limit: '180 KB', // 覆盖 0a4bdfb2-*.js 等匿名 chunks（当前 169K）
  },

  // ==================== 其他资源 ====================
  {
    name: 'Locale Page Bundle',
    path: '.next/static/chunks/app/[[]locale[]]/page-*.js', // minimatch 转义：[[] 匹配 "["，[] ] 匹配 "]"
    limit: '15 KB',
  },
  {
    name: 'Total CSS Bundle',
    path: '.next/static/css/*.css',
    limit: '50 KB',
  },
];
