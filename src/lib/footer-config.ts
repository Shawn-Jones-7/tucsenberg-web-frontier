/**
 * Footer Configuration
 *
 * Centralized configuration for footer content, links, and structure.
 * Supports internationalization and enterprise-grade organization.
 */

import type { Locale } from '@/types/i18n';
import { siteFacts } from '@/config/site-facts';

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

// Company information - uses siteFacts for business data
export const COMPANY_INFO: CompanyInfo = {
  name: siteFacts.company.name,
  description:
    'Modern B2B enterprise web solutions with cutting-edge technology.',
  address: {
    street: '123 Innovation Drive',
    city: siteFacts.company.location.city,
    country: siteFacts.company.location.country,
    postalCode: '12345',
  },
  contact: {
    email: siteFacts.contact.email,
    phone: siteFacts.contact.phone,
  },
};

// Main footer sections - based on the reference design
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    key: 'product',
    titleKey: 'footer.sections.product.title',
    links: [
      {
        key: 'home',
        href: '/',
        translationKey: 'footer.sections.product.home',
      },
      {
        key: 'enterprise',
        href: '/enterprise',
        translationKey: 'footer.sections.product.enterprise',
      },
      {
        key: 'pricing',
        href: '/pricing',
        translationKey: 'footer.sections.product.pricing',
      },
    ],
  },
  {
    key: 'company',
    titleKey: 'footer.sections.company.title',
    links: [
      {
        key: 'terms',
        href: '/terms',
        translationKey: 'footer.sections.company.terms',
      },
      {
        key: 'ai-policy',
        href: '/ai-policy',
        translationKey: 'footer.sections.company.aiPolicy',
      },
      {
        key: 'privacy',
        href: '/privacy',
        translationKey: 'footer.sections.company.privacy',
      },
    ],
  },
  {
    key: 'resources',
    titleKey: 'footer.sections.resources.title',
    links: [
      {
        key: 'faqs',
        href: '/faqs',
        translationKey: 'footer.sections.resources.faqs',
      },
      {
        key: 'docs',
        href: '/docs',
        translationKey: 'footer.sections.resources.docs',
      },
      {
        key: 'ambassadors',
        href: '/ambassadors',
        translationKey: 'footer.sections.resources.ambassadors',
      },
      {
        key: 'community',
        href: process.env['NEXT_PUBLIC_COMMUNITY_URL'] ?? '#',
        external: true,
        translationKey: 'footer.sections.resources.community',
      },
      {
        key: 'vercel',
        href: 'https://vercel.com',
        external: true,
        translationKey: 'footer.sections.resources.vercel',
      },
    ],
  },
];

// Social media links - based on the reference design
export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: 'facebook',
    href: 'https://www.facebook.com',
    icon: 'facebook',
    label: 'Facebook',
    ariaLabel: 'Visit Facebook',
  },
  {
    key: 'youtube',
    href: 'https://www.youtube.com',
    icon: 'youtube',
    label: 'YouTube',
    ariaLabel: 'Visit YouTube',
  },
  {
    key: 'x',
    href: 'https://x.com',
    icon: 'x',
    label: 'X',
    ariaLabel: 'Visit X',
  },
  {
    key: 'linkedin',
    href: 'https://www.linkedin.com',
    icon: 'linkedin',
    label: 'LinkedIn',
    ariaLabel: 'Visit LinkedIn',
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
