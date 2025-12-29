import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/paths';

// Base URL for the site - uses centralized SITE_CONFIG for consistency
const BASE_URL = SITE_CONFIG.baseUrl;

/**
 * Dynamic robots.txt generation for Next.js.
 * Configures search engine crawling rules.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/error-test/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
