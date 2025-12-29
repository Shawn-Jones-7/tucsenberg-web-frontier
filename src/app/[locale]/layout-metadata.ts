import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/paths';
import { ONE } from '@/constants';

/**
 * Locale layout metadata (base only).
 *
 * Next.js metadata is shallow-merged: page routes that don't explicitly return
 * `alternates` or `openGraph` may inherit those fields from layouts.
 *
 * This function intentionally avoids returning `alternates` / `openGraph` to
 * prevent polluting all child pages. Per-page metadata should be generated via
 * path-aware helpers (see `generateMetadataForPath`).
 */
export async function generateLocaleMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // await params 是 Next.js 16 的要求，但解析很快
  await params;

  return {
    title: {
      default: SITE_CONFIG.seo.defaultTitle,
      template: SITE_CONFIG.seo.titleTemplate,
    },
    description: SITE_CONFIG.seo.defaultDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        'index': true,
        'follow': true,
        'max-video-preview': -ONE,
        'max-image-preview': 'large',
        'max-snippet': -ONE,
      },
    },
    verification: {
      google: process.env['GOOGLE_SITE_VERIFICATION'],
      yandex: process.env['YANDEX_VERIFICATION'],
    },
  };
}
