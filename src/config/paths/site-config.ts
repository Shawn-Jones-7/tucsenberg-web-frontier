/**
 * 站点配置
 */

// 站点配置
export const SITE_CONFIG = {
  baseUrl:
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    'https://example.com',
  name: '[PROJECT_NAME]',
  description: 'Modern B2B Enterprise Web Platform with Next.js 15',

  // SEO配置
  seo: {
    titleTemplate: '%s | [PROJECT_NAME]',
    defaultTitle: '[PROJECT_NAME]',
    defaultDescription: 'Modern B2B Enterprise Web Platform with Next.js 15',
    keywords: ['Next.js', 'React', 'TypeScript', 'B2B', 'Enterprise'],
  },

  // 社交媒体链接
  social: {
    twitter: '[TWITTER_URL]',
    linkedin: '[LINKEDIN_URL]',
    github: '[GITHUB_URL]',
  },

  // 联系信息
  contact: {
    phone: '+1-555-0123',
    email: '[CONTACT_EMAIL]',
    whatsappNumber: process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '+1-555-0123',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;

/**
 * Production placeholder pattern - matches [PLACEHOLDER_NAME] format
 * Used to detect unconfigured values that should be replaced before production
 */
const PLACEHOLDER_PATTERN = /^\[.+\]$/;

/**
 * Check if a value is a placeholder that needs to be configured
 */
export function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERN.test(value);
}

/**
 * Check if the base URL is properly configured for production
 * Returns false if using example.com or localhost in production
 */
export function isBaseUrlConfigured(): boolean {
  const { baseUrl } = SITE_CONFIG;
  if (process.env.NODE_ENV !== 'production') return true;
  return !baseUrl.includes('example.com') && !baseUrl.includes('localhost');
}

/**
 * Get all unconfigured placeholders in SITE_CONFIG
 * Returns array of { path, value } for each placeholder found
 */
export function getUnconfiguredPlaceholders(): Array<{
  path: string;
  value: string;
}> {
  const placeholders: Array<{ path: string; value: string }> = [];

  // Check top-level string values
  if (isPlaceholder(SITE_CONFIG.name)) {
    placeholders.push({ path: 'SITE_CONFIG.name', value: SITE_CONFIG.name });
  }

  // Check SEO config
  if (isPlaceholder(SITE_CONFIG.seo.defaultTitle)) {
    placeholders.push({
      path: 'SITE_CONFIG.seo.defaultTitle',
      value: SITE_CONFIG.seo.defaultTitle,
    });
  }
  if (SITE_CONFIG.seo.titleTemplate.includes('[PROJECT_NAME]')) {
    placeholders.push({
      path: 'SITE_CONFIG.seo.titleTemplate',
      value: SITE_CONFIG.seo.titleTemplate,
    });
  }

  // Check social links
  if (isPlaceholder(SITE_CONFIG.social.twitter)) {
    placeholders.push({
      path: 'SITE_CONFIG.social.twitter',
      value: SITE_CONFIG.social.twitter,
    });
  }
  if (isPlaceholder(SITE_CONFIG.social.linkedin)) {
    placeholders.push({
      path: 'SITE_CONFIG.social.linkedin',
      value: SITE_CONFIG.social.linkedin,
    });
  }
  if (isPlaceholder(SITE_CONFIG.social.github)) {
    placeholders.push({
      path: 'SITE_CONFIG.social.github',
      value: SITE_CONFIG.social.github,
    });
  }

  // Check contact info
  if (isPlaceholder(SITE_CONFIG.contact.email)) {
    placeholders.push({
      path: 'SITE_CONFIG.contact.email',
      value: SITE_CONFIG.contact.email,
    });
  }

  return placeholders;
}

/**
 * Validate site config for production readiness
 * Returns validation result object for build-time checks
 */
export function validateSiteConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Check base URL
  if (!isBaseUrlConfigured()) {
    const msg = `SITE_CONFIG.baseUrl is not configured for production: ${SITE_CONFIG.baseUrl}`;
    if (isProduction) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  // Check placeholders
  const placeholders = getUnconfiguredPlaceholders();
  for (const { path, value } of placeholders) {
    const msg = `${path} contains placeholder value: ${value}`;
    if (isProduction) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
