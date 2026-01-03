/**
 * Footer Configuration
 *
 * Centralized configuration for footer content, links, and structure.
 * Supports internationalization and enterprise-grade organization.
 */

import type { Locale } from '@/types/i18n';

// Footer link interface
export interface FooterLink {
  key: string;
  href: string;
  external?: boolean;
  translationKey: string;
}

// Footer section interface
export interface FooterSection {
  key: string;
  titleKey: string;
  links: FooterLink[];
}

// Social media link interface
export interface SocialLink {
  key: string;
  href: string;
  icon: string;
  label: string;
  ariaLabel: string;
}

// Company information interface
export interface CompanyInfo {
  name: string;
  description: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  contact?: {
    email: string;
    phone: string;
  };
}

// Footer configuration interface
export interface FooterConfig {
  company: CompanyInfo;
  sections: FooterSection[];
  socialLinks: SocialLink[];
}

// Company information (placeholders for customization)
export const COMPANY_INFO: CompanyInfo = {
  name: '[PROJECT_NAME]',
  description:
    'Modern B2B enterprise web solutions with cutting-edge technology.',
  address: {
    street: '[STREET_ADDRESS]',
    city: '[CITY]',
    country: '[COUNTRY]',
    postalCode: '[POSTAL_CODE]',
  },
  contact: {
    email: '[EMAIL]',
    phone: '[PHONE]',
  },
};

// Main footer sections
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    key: 'navigation',
    titleKey: 'footer.sections.navigation.title',
    links: [
      {
        key: 'home',
        href: '/',
        translationKey: 'footer.sections.navigation.home',
      },
      {
        key: 'about',
        href: '/about',
        translationKey: 'footer.sections.navigation.about',
      },
      {
        key: 'products',
        href: '/products',
        translationKey: 'footer.sections.navigation.products',
      },
      {
        key: 'blog',
        href: '/blog',
        translationKey: 'footer.sections.navigation.blog',
      },
      {
        key: 'contact',
        href: '/contact',
        translationKey: 'footer.sections.navigation.contact',
      },
    ],
  },
  {
    key: 'support',
    titleKey: 'footer.sections.support.title',
    links: [
      {
        key: 'faq',
        href: '/faq',
        translationKey: 'footer.sections.support.faq',
      },
      {
        key: 'privacy',
        href: '/privacy',
        translationKey: 'footer.sections.support.privacy',
      },
      {
        key: 'terms',
        href: '/terms',
        translationKey: 'footer.sections.support.terms',
      },
    ],
  },
];

// Social media links (placeholders for customization)
export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: 'twitter',
    href: '[TWITTER_URL]',
    icon: 'twitter',
    label: 'Twitter',
    ariaLabel: 'Visit Twitter',
  },
  {
    key: 'linkedin',
    href: '[LINKEDIN_URL]',
    icon: 'linkedin',
    label: 'LinkedIn',
    ariaLabel: 'Visit LinkedIn',
  },
  {
    key: 'github',
    href: '[GITHUB_URL]',
    icon: 'github',
    label: 'GitHub',
    ariaLabel: 'Visit GitHub',
  },
];

// Main footer configuration
export const FOOTER_CONFIG: FooterConfig = {
  company: COMPANY_INFO,
  sections: FOOTER_SECTIONS,
  socialLinks: SOCIAL_LINKS,
};

// Utility functions
export function getFooterConfig(): FooterConfig {
  return FOOTER_CONFIG;
}

export function getCompanyInfo(): CompanyInfo {
  return COMPANY_INFO;
}

export function getSocialLinks(): SocialLink[] {
  return SOCIAL_LINKS;
}

// Get current year for copyright
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Generate copyright text
export function getCopyrightText(locale: Locale = 'en'): string {
  const year = getCurrentYear();
  const companyName = COMPANY_INFO.name;

  if (locale === 'zh') {
    return `© ${year} ${companyName}。保留所有权利。`;
  }

  return `© ${year} ${companyName}. All rights reserved.`;
}
