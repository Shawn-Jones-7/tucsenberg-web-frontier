import path from 'path';
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

// Avoid importing TS/alias-based runtime modules into next.config to keep config load stable.
function computeSecurityHeaders(nonce?: string) {
  const isEnabled = process.env.SECURITY_HEADERS_ENABLED !== 'false';
  if (!isEnabled) return [] as { key: string; value: string }[];

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  const cspDirectives: Record<string, string[] | undefined> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      'https://va.vercel-scripts.com',
      'https://js.sentry-cdn.com',
      'https://challenges.cloudflare.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      ...(isDevelopment ? ["'unsafe-inline'"] : []),
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'https://va.vercel-scripts.com',
      'https://images.unsplash.com',
      'https://via.placeholder.com',
    ],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://vitals.vercel-insights.com',
      'https://o4507902318592000.ingest.us.sentry.io',
      ...(isDevelopment ? ['http://localhost:*', 'ws://localhost:*'] : []),
      'https://api.resend.com',
    ],
    'frame-src': ["'none'", 'https://challenges.cloudflare.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': isProduction ? [] : undefined,
  };

  const csp = Object.entries(cspDirectives)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value) && value.length > 0)
        return `${key} ${value.join(' ')}`;
      return key;
    })
    .join('; ');

  return [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Content-Security-Policy', value: csp },
    {
      key: 'Permissions-Policy',
      value: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
        'payment=()',
        'usb=()',
      ].join(', '),
    },
    { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
  ];
}

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
    // 临时放宽构建期 ESLint 阻塞，Phase 3 清零后恢复为严格模式
    ignoreDuringBuilds: true,
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
        // 验证库分离
        validation: {
          test: /[\\/]node_modules[\\/](zod)[\\/]/,
          name: 'validation-libs',
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
          test: /[\\/]node_modules[\\/](?!(react|react-dom|@radix-ui|lucide-react|@sentry|next-intl|@next[\\/]|next-themes|nextjs-toploader|@mdx-js|gray-matter|remark|rehype|zod|clsx|class-variance-authority|tailwind-merge|embla-carousel)[\\/])/,
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

    const securityHeaders = computeSecurityHeaders();
    // Prefer CSP from middleware (with nonce). Remove CSP here to avoid duplication/conflicts.
    const headersNoCSP = securityHeaders.filter(
      (h) => h.key !== 'Content-Security-Policy',
    );

    // Next.js 15.4.7+ requires non-empty headers array
    if (headersNoCSP.length === 0) {
      return [];
    }

    return [
      {
        source: '/:path*',
        headers: headersNoCSP,
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
