import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';

interface SubsetSource {
  href: string;
  format: 'woff2' | 'woff';
  weight: number;
}

const FONT_PRECONNECTS = [
  { href: 'https://fonts.googleapis.com' },
  { href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
];

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

  const grouped = sources.reduce<Record<number, SubsetSource[]>>(
    (acc, entry) => {
      const bucket = acc[entry.weight] ?? [];
      bucket.push(entry);
      acc[entry.weight] = bucket;
      return acc;
    },
    {},
  );

  const fontFaceBlocks = Object.entries(grouped)
    .map(([weight, entries]) => {
      const ordered = entries
        .sort((a, b) =>
          a.format === b.format ? 0 : a.format === 'woff2' ? -1 : 1,
        )
        .map((entry) => `url('${entry.href}') format('${entry.format}')`)
        .join(', ');

      return `@font-face{font-family:'Tucsenberg SC Subset';font-style:normal;font-weight:${weight};font-display:swap;unicode-range:U+4E00-9FFF;src:${ordered};}`;
    })
    .join('');

  return `${fontFaceBlocks}:root{--font-chinese-stack:'Tucsenberg SC Subset','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Source Han Sans SC','Noto Sans SC','Noto Sans CJK SC','WenQuanYi Micro Hei',sans-serif;}`;
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
      {FONT_PRECONNECTS.map(({ href, crossOrigin }) => (
        <link
          key={href}
          rel='preconnect'
          href={href}
          crossOrigin={crossOrigin}
        />
      ))}
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
