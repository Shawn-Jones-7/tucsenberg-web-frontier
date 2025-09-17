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

const nextConfig: NextConfig = {
  /* config options here */

  // Configure pageExtensions to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // ESLint 配置
  eslint: {
    dirs: ['src'],
  },

  // Enable source maps for better error tracking
  productionBrowserSourceMaps: true,

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
    // 启用Next.js 15实验性testProxy用于Playwright测试环境
    testProxy: true,
  },

  // 解决 Turbopack + OpenTelemetry 依赖问题
  // 这些包已经在 Next.js 15 的默认外部包列表中
  // 但 Turbopack 在处理它们时遇到问题，所以我们暂时移除这个配置
  // 让 Next.js 使用默认的外部包处理方式

  webpack: (config, { dev, isServer }) => {
    // Path alias configuration for @/ -> src/
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // 生产环境包大小优化 - 细粒度代码分割
    if (!dev && !isServer) {
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
          chunks: 'all',
          priority: 15,
          enforce: true,
        },
        // Lucide 图标库分离
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide',
          chunks: 'all',
          priority: 15,
          enforce: true,
        },
        // Sentry 监控工具分离
        sentry: {
          test: /[\\/]node_modules[\\/]@sentry[\\/]/,
          name: 'sentry',
          chunks: 'all',
          priority: 15,
          enforce: true,
        },
        // Next.js 相关库分离
        nextjs: {
          test: /[\\/]node_modules[\\/](next-intl|@next[\\/]|next-themes|nextjs-toploader)[\\/]/,
          name: 'nextjs-libs',
          chunks: 'all',
          priority: 10,
          enforce: true,
        },
        // MDX 相关库分离
        mdx: {
          test: /[\\/]node_modules[\\/](@mdx-js|gray-matter|remark|rehype)[\\/]/,
          name: 'mdx-libs',
          chunks: 'all',
          priority: 12,
          enforce: true,
        },
        // 表单和验证库分离
        forms: {
          test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
          name: 'form-libs',
          chunks: 'all',
          priority: 12,
          enforce: true,
        },
        // 工具库分离
        utils: {
          test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge|embla-carousel)[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 8,
          enforce: true,
        },
        // 其他第三方库
        vendor: {
          test: /[\\/]node_modules[\\/](?!(react|react-dom|@radix-ui|lucide-react|@sentry|next-intl|@next[\\/]|next-themes|nextjs-toploader|@mdx-js|gray-matter|remark|rehype|react-hook-form|@hookform|zod|clsx|class-variance-authority|tailwind-merge|embla-carousel)[\\/])/,
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

    // Next.js 15.4.7+ requires non-empty headers array
    if (securityHeaders.length === 0) {
      return [];
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
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
  hideSourceMaps: true, // Hide source maps from public access

  // Only enable in production to reduce development build time
  enabled: process.env['NODE_ENV'] === 'production',
};

export default withSentryConfig(
  withBundleAnalyzer(withNextIntl(withMDX(nextConfig))),
  sentryWebpackPluginOptions,
);
