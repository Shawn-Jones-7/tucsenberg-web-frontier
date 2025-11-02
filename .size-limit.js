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

const glob = require('glob');

const sentryEnabled =
  process.env['ENABLE_SENTRY_BUNDLE'] === '1' &&
  process.env['DISABLE_SENTRY_BUNDLE'] !== '1';

const createRule = ({
  name,
  limit,
  patterns,
  optional = false,
  enabled = true,
}) => {
  if (!enabled) {
    return null;
  }

  const normalizedPatterns = Array.isArray(patterns) ? patterns : [patterns];
  const matches = normalizedPatterns.flatMap((pattern) =>
    glob.sync(pattern, { nodir: true, absolute: false }),
  );

  if (matches.length === 0) {
    if (optional) {
      return null;
    }

    console.warn(
      `[size-limit] No files matched for "${name}" (` +
        `${normalizedPatterns.join(', ')}) – keeping pattern for visibility`,
    );

    return {
      name,
      path: normalizedPatterns,
      limit,
    };
  }

  return {
    name,
    path: matches,
    limit,
  };
};

module.exports = [
  // ==================== 核心 Chunks ====================
  createRule({
    name: 'Framework Bundle',
    patterns: '.next/static/chunks/framework-*.js',
    limit: '200 KB', // 当前 179K，+21K 缓冲
  }),
  createRule({
    name: 'Main App Bundle',
    patterns: '.next/static/chunks/main-app-*.js',
    limit: '10 KB', // 当前 2.0K，+8K 缓冲
  }),
  createRule({
    name: 'Main Bundle',
    patterns: '.next/static/chunks/main-*.js',
    limit: '10 KB', // 当前 1.6K，+8.4K 缓冲
  }),
  createRule({
    name: 'Polyfills Bundle',
    patterns: '.next/static/chunks/polyfills-*.js',
    limit: '120 KB', // 当前 110K，+10K 缓冲
  }),
  createRule({
    name: 'Webpack Runtime',
    patterns: '.next/static/chunks/webpack-*.js',
    limit: '10 KB', // 当前 4.2K，+5.8K 缓冲
  }),

  // ==================== 分组 Chunks（基于 next.config.ts cacheGroups）====================
  createRule({
    name: 'Sentry Bundle',
    patterns: [
      '.next/static/chunks/sentry*.js',
      '.next/static/chunks/app/sentry*.js',
    ],
    limit: '400 KB', // 当前 362K，+38K 缓冲
    optional: true,
    enabled: sentryEnabled,
  }),
  createRule({
    name: 'Vendors Bundle',
    patterns: '.next/static/chunks/vendors-*.js',
    limit: '150 KB', // P1 优化完成：当前 114 KB (Brotli)，目标 ≤150 KB ✅
  }),
  createRule({
    name: 'Radix UI Bundle',
    patterns: '.next/static/chunks/radix-ui*.js',
    limit: '80 KB', // 当前 67K，+13K 缓冲
  }),
  createRule({
    name: 'UI Libs Bundle',
    patterns: '.next/static/chunks/ui-libs*.js',
    limit: '50 KB', // 当前 41K，+9K 缓冲
  }),
  createRule({
    name: 'Analytics Libs Bundle',
    patterns: '.next/static/chunks/analytics-libs*.js',
    limit: '15 KB', // 当前 8.8K，+6.2K 缓冲
  }),
  createRule({
    name: 'Utils Bundle',
    patterns: '.next/static/chunks/utils-*.js',
    limit: '35 KB', // 当前 25K，+10K 缓冲
  }),
  createRule({
    name: 'Next.js Libs Bundle',
    patterns: '.next/static/chunks/nextjs-libs*.js',
    limit: '25 KB', // 当前 15K，+10K 缓冲
  }),
  createRule({
    name: 'Lucide Icons Bundle',
    patterns: '.next/static/chunks/lucide*.js',
    limit: '15 KB', // 当前 8.5K，+6.5K 缓冲
  }),
  createRule({
    name: 'Floating UI Bundle',
    patterns: '.next/static/chunks/floating-ui*.js',
    limit: '25 KB', // 当前 21.8K，+3.2K 缓冲
  }),

  // ==================== 兜底规则：匿名 Shared Chunks ====================
  createRule({
    name: 'Anonymous Shared Chunks',
    patterns: '.next/static/chunks/[0-9a-f]*-*.js',
    limit: '180 KB', // 覆盖 0a4bdfb2-*.js 等匿名 chunks（当前 169K）
  }),

  // ==================== 其他资源 ====================
  createRule({
    name: 'Locale Page Bundle',
    patterns: '.next/static/chunks/app/[[]locale[]]/page-*.js', // minimatch 转义：[[] 匹配 "["，[] ] 匹配 "]"
    limit: '15 KB',
  }),
  createRule({
    name: 'Total CSS Bundle',
    patterns: '.next/static/css/*.css',
    limit: '50 KB',
  }),
].filter(Boolean);
