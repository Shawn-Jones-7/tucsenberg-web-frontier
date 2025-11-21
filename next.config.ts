import path from 'path';
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import { getSecurityHeaders } from './src/config/security';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
});

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// 默认禁用 Sentry 客户端打包，除非显式启用（进一步瘦身首包 JS）
const SENTRY_DISABLED =
  process.env['ENABLE_SENTRY_BUNDLE'] !== '1' ||
  process.env['DISABLE_SENTRY_BUNDLE'] === '1';

const nextConfig: NextConfig = {
  /* config options here */

  // Turbopack 配置 - 明确指定项目根目录
  turbopack: {
    root: __dirname,
  },

  // Configure pageExtensions to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // Enable source maps for better error tracking
  productionBrowserSourceMaps: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },

  // Next.js Compiler 配置
  compiler: {
    // 生产环境移除 console 语句，但保留 error 和 warn 级别
    // 这有助于减少生产环境的包大小并避免潜在的信息泄露
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'], // 保留 console.error 和 console.warn
          }
        : false, // 开发环境保留所有 console 语句
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Next.js 16 已移除 testProxy 配置 - 使用 next/experimental/testing/server 替代
    // 旧配置: testProxy: process.env.CI === 'true',
    // 新方式: 在测试文件中使用 unstable_doesProxyMatch() 和相关 API
    // 内联关键CSS，消除渲染阻塞的<link rel="stylesheet">请求，提升首屏渲染（LCP）
    inlineCss: true,
    // PPR 需要 Next.js canary 版本，暂时禁用
    // ppr: 'incremental',
  },

  // 解决 Turbopack + OpenTelemetry 依赖问题
  // 这些包已经在 Next.js 15 的默认外部包列表中
  // 但 Turbopack 在处理它们时遇到问题，所以我们暂时移除这个配置
  // 让 Next.js 使用默认的外部包处理方式

  // ⚠️ Webpack 配置保留 - 待验证 Turbopack 性能后移除
  // Next.js 16 默认使用 Turbopack，此配置仅在 build:webpack 兜底时生效
  // 在 Turbopack 通过 size:check 验证后，应移除此配置块和 splitChunks 逻辑
  webpack: (config, { dev, isServer }) => {
    // Path alias configuration for @/ -> src/
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@messages': path.resolve(__dirname, 'messages'),
      ...(SENTRY_DISABLED
        ? {
            '@/lib/sentry-client': path.resolve(
              __dirname,
              'src/lib/sentry-client.disabled.ts',
            ),
          }
        : {}),
    };

    // 服务端将部分重型依赖标记为 external，避免捆绑到通用 chunk 触发初始化顺序问题
    if (isServer) {
      // 保持 Node.js 运行时从 node_modules 动态加载
      // 避免在构建期/收集阶段加载第三方库内部复杂依赖
      // 尤其是 airtable 等 SDK
      // 说明：commonjs 形式 external 不会影响运行时 require/import
      (config.externals ||= [] as unknown[]).push({
        airtable: 'commonjs airtable',
      });
    }

    // 当禁用 Sentry 时，提供完全的空模块映射，防止生成相关 chunk
    if (SENTRY_DISABLED) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/nextjs': path.resolve(
          __dirname,
          'src/lib/__sentry_empty__.ts',
        ),
      };
    }

    // 生产环境包大小优化 - 细粒度代码分割
    if (!dev && !isServer) {
      // 显式启用 tree-shaking 标记（默认即为开启，这里加固配置）
      config.optimization.usedExports = true;
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // React 核心库单独分离
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
          enforce: true,
        },
        // Radix UI 组件库分离
        radixui: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'async',
          priority: 15,
          enforce: true,
        },
        // Floating UI 弹层库分离（优先级高于 Radix UI）
        // 只包括异步导入，减少首屏加载
        floatingui: {
          test: /[\\/]node_modules[\\/]@floating-ui[\\/]/,
          name: 'floating-ui',
          chunks: 'async',
          priority: 16,
          enforce: true,
        },
        // Lucide 图标库分离
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide',
          chunks: 'async',
          priority: 15,
          enforce: true,
        },
        // Sentry 监控工具分离（仅异步导入，避免打入首屏vendors）
        sentry: {
          test: /[\\/]node_modules[\\/]@sentry[\\/]/,
          name: 'sentry',
          chunks: 'async',
          priority: 15,
          enforce: true,
        },
        // Next.js 相关库分离
        nextjs: {
          test: /[\\/]node_modules[\\/](next-intl|@next[\\/]|next-themes|nextjs-toploader)[\\/]/,
          name: 'nextjs-libs',
          chunks: 'async',
          priority: 10,
          enforce: true,
        },
        // MDX 相关库分离
        mdx: {
          test: /[\\/]node_modules[\\/](@mdx-js|gray-matter|remark|rehype)[\\/]/,
          name: 'mdx-libs',
          chunks: 'async',
          priority: 12,
          enforce: true,
        },
        // 验证库分离
        validation: {
          test: /[\\/]node_modules[\\/](zod)[\\/]/,
          name: 'validation-libs',
          chunks: 'async',
          priority: 12,
          enforce: true,
        },
        // 工具库分离
        utils: {
          test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge)[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 8,
          enforce: true,
        },
        // 轮播库分离（仅异步，避免打入首屏）
        carousel: {
          test: /[\\/]node_modules[\\/]embla-carousel[\\/]/,
          name: 'carousel',
          chunks: 'async',
          priority: 12,
          enforce: true,
        },
        // 分析和监控库分离
        analytics: {
          test: /[\\/]node_modules[\\/](@vercel\/analytics|web-vitals)[\\/]/,
          name: 'analytics-libs',
          chunks: 'async',
          priority: 14,
          enforce: true,
        },
        // UI通知和交互库分离
        ui: {
          test: /[\\/]node_modules[\\/](sonner|@marsidev\/react-turnstile)[\\/]/,
          name: 'ui-libs',
          chunks: 'async',
          priority: 11,
          enforce: true,
        },
        // 其他第三方库
        vendor: {
          test: /[\\/]node_modules[\\/](?!(react|react-dom|@radix-ui|lucide-react|@sentry|next-intl|@next[\\/]|next-themes|nextjs-toploader|@mdx-js|gray-matter|remark|rehype|zod|clsx|class-variance-authority|tailwind-merge|embla-carousel|@vercel\/analytics|web-vitals|sonner|@marsidev\/react-turnstile)[\\/])/,
          name: 'vendors',
          chunks: 'all',
          priority: 5,
          enforce: true,
        },
      };
    }
    return config;
  },

  async headers() {
    // Note: This function is async to comply with Next.js API requirements
    // even though we're returning static configuration
    await Promise.resolve(); // Satisfy require-await ESLint rule

    const securityHeaders = getSecurityHeaders();
    // Prefer CSP from middleware (with nonce). Remove CSP here to avoid duplication/conflicts.
    const headersNoCSP = securityHeaders.filter(
      (h) => h.key !== 'Content-Security-Policy',
    );

    // CDN 缓存策略（H-001 LCP 优化）
    // 为静态资源设置长期缓存，提升性能和 LCP
    const cdnCacheHeaders = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ];

    const headerConfigs = [
      // 安全头部应用到所有路径
      ...(headersNoCSP.length > 0
        ? [
            {
              source: '/:path*',
              headers: headersNoCSP,
            },
          ]
        : []),
      // CDN 缓存策略应用到静态资源
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|woff|woff2|ttf|otf)',
        headers: cdnCacheHeaders,
      },
    ];

    return headerConfigs;
  },
};

// Optimized Sentry webpack plugin options for smaller bundle size
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env['SENTRY_ORG'] || '',
  project: process.env['SENTRY_PROJECT'] || '',

  // Only print logs for uploading source maps in CI
  silent: !process.env['CI'],

  // Optimize for smaller bundle size - disable source map upload in development
  widenClientFileUpload: process.env['NODE_ENV'] === 'production',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Disable automatic instrumentation to reduce bundle size
  automaticVercelMonitors: false,

  // Additional bundle size optimizations
  hideSourceMaps: false, // Temporarily disabled for bundle analysis

  // Only enable in production to reduce development build time
  enabled: process.env['NODE_ENV'] === 'production',
};

// Allow disabling Sentry integration entirely for analysis runs
const base = withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));

export default SENTRY_DISABLED
  ? base
  : withSentryConfig(base, {
      // Build options for withSentryConfig (not just webpack plugin)
      autoInstrumentAppDirectory: false, // avoid injecting client instrumentation into app router
      disableManifestInjection: true, // save client bytes by skipping route manifest injection
      bundleSizeOptimizations: {
        excludeTracing: true, // 不使用性能追踪时可移除 tracing 相关代码
        excludeDebugStatements: true,
      },
      // Pass through webpack plugin options
      ...sentryWebpackPluginOptions,
    });
