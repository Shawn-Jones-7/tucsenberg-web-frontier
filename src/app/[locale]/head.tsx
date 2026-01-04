import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';

interface SubsetSource {
  href: string;
  format: 'woff2' | 'woff';
  weight: number;
}

// 注意：项目使用本地字体（Geist Sans/Mono + PingFang SC子集），不需要Google Fonts
// Analytics 连接优化策略：
// - 仅在生产环境且显式开启开关时使用 preconnect（更激进，可能占用早期连接）
// - 默认使用 dns-prefetch（更保守，低成本）
const ANALYTICS_ORIGIN = 'https://vitals.vercel-insights.com' as const;
const isProduction = process.env.NODE_ENV === 'production';
const enableAnalyticsPreconnect =
  isProduction &&
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_PRECONNECT === 'true';

const ANALYTICS_PRECONNECTS: Array<{
  href: string;
  crossOrigin?: 'anonymous';
}> = enableAnalyticsPreconnect
  ? [
      {
        href: ANALYTICS_ORIGIN,
        crossOrigin: 'anonymous' as const,
      },
    ]
  : [];

// 可选：添加CDN dns-prefetch（除 Analytics 外的其他域名）
const DNS_PREFETCH_DOMAINS: string[] = [
  // 'https://vercel.com', // 示例：Vercel 相关域名
];

// 当未启用 preconnect 时，对 Analytics 域名使用 dns-prefetch（低成本优化）
const ANALYTICS_DNS_PREFETCHES: string[] = enableAnalyticsPreconnect
  ? []
  : [ANALYTICS_ORIGIN];

// P2-1 Phase 3：Geist Sans Latin 子集由 next/font/local 自动处理预加载
// 不再需要手动 preload，避免重复请求
const GEIST_FONT_PRELOADS: Array<{
  href: string;
  type: string;
}> = [];

const SUBSET_SOURCES: SubsetSource[] = [
  {
    href: '/fonts/subsets/pingfang-sc-subset.woff2',
    format: 'woff2',
    weight: 400,
  },
  {
    href: '/fonts/subsets/pingfang-sc-subset.woff',
    format: 'woff',
    weight: 400,
  },
  {
    href: '/fonts/subsets/pingfang-sc-subset-bold.woff2',
    format: 'woff2',
    weight: 600,
  },
  {
    href: '/fonts/subsets/pingfang-sc-subset-bold.woff',
    format: 'woff',
    weight: 600,
  },
];

function buildSubsetStyle(sources: SubsetSource[]): string | null {
  if (sources.length === 0) {
    return null;
  }

  const grouped = sources.reduce<Map<number, SubsetSource[]>>((acc, entry) => {
    const bucket = acc.get(entry.weight) ?? [];
    bucket.push(entry);
    acc.set(entry.weight, bucket);
    return acc;
  }, new Map<number, SubsetSource[]>());

  const fontFaceBlocks = Array.from(grouped.entries())
    .map(([weight, entries]) => {
      const ordered = entries
        .sort((a, b) =>
          a.format === b.format ? 0 : a.format === 'woff2' ? -1 : 1,
        )
        .map((entry) => `url('${entry.href}') format('${entry.format}')`)
        .join(', ');

      return `@font-face{font-family:'Template SC Subset';font-style:normal;font-weight:${weight};font-display:swap;unicode-range:U+4E00-9FFF;src:${ordered};}`;
    })
    .join('');

  return `${fontFaceBlocks}:root{--font-chinese-stack:'Template SC Subset','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Source Han Sans SC','Noto Sans SC','Noto Sans CJK SC','WenQuanYi Micro Hei',sans-serif;}`;
}

export default function LocaleHead(): ReactElement {
  const enableSubset = process.env.NEXT_PUBLIC_ENABLE_CN_FONT_SUBSET === 'true';
  const publicDir = join(process.cwd(), 'public');

  const availableSubsetSources = enableSubset
    ? SUBSET_SOURCES.filter((entry) =>
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe: publicDir is process.cwd()/public, entry.href is from static SUBSET_SOURCES
        existsSync(join(publicDir, entry.href.replace(/^\//, ''))),
      )
    : [];

  const subsetStyle = buildSubsetStyle(availableSubsetSources);

  return (
    <>
      {/* Vercel Analytics 预连接 - 仅生产且开关启用时渲染 */}
      {ANALYTICS_PRECONNECTS.map(({ href, crossOrigin }) => (
        <link
          key={href}
          rel='preconnect'
          href={href}
          crossOrigin={crossOrigin}
        />
      ))}
      {/* DNS 预解析 - 默认包含 Analytics（若未启用 preconnect）及其他可选域名 */}
      {[...ANALYTICS_DNS_PREFETCHES, ...DNS_PREFETCH_DOMAINS].map((href) => (
        <link
          key={href}
          rel='dns-prefetch'
          href={href}
        />
      ))}
      {/* Geist 字体预加载 - 优化 LCP（H-001）*/}
      {GEIST_FONT_PRELOADS.map(({ href, type }) => (
        <link
          key={href}
          rel='preload'
          href={href}
          as='font'
          type={type}
          crossOrigin='anonymous'
        />
      ))}
      {/* 字体预加载 - 本地字体子集 */}
      {availableSubsetSources.map(({ href, format }) => (
        <link
          key={href}
          rel='preload'
          href={href}
          as='font'
          type={`font/${format}`}
          crossOrigin='anonymous'
        />
      ))}
      {subsetStyle ? <style>{subsetStyle}</style> : null}
    </>
  );
}
