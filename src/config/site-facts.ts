/**
 * Site Facts - Non-translatable business data
 *
 * This file contains factual data about the business that does NOT change
 * based on language. Examples: company name, founding year, certifications,
 * contact info, social links.
 *
 * Translatable content (marketing copy, descriptions) belongs in messages/*.json
 *
 * Usage in components:
 * ```tsx
 * import { siteFacts } from '@/config/site-facts';
 * import { useTranslations } from 'next-intl';
 *
 * function HeroSection() {
 *   const t = useTranslations('home.hero');
 *   return (
 *     <p>{t('subtitle', {
 *       year: siteFacts.company.established,
 *       countries: siteFacts.stats.exportCountries
 *     })}</p>
 *   );
 * }
 * ```
 */

import { SITE_CONFIG } from '@/config/paths/site-config';

export interface CompanyInfo {
  name: string;
  established: number;
  employees?: number;
  location: {
    country: string;
    city: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface BusinessHours {
  weekdays: string;
  saturday: string;
  sundayClosed: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp?: string;
  wechat?: string;
  businessHours?: BusinessHours;
}

export interface Certification {
  name: string;
  file?: string;
  validUntil?: string;
}

export interface BusinessStats {
  exportCountries?: number;
  annualCapacity?: string;
  clientsServed?: number;
  onTimeDeliveryRate?: number;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  instagram?: string;
}

export interface SiteFacts {
  company: CompanyInfo;
  contact: ContactInfo;
  certifications: Certification[];
  stats: BusinessStats;
  social: SocialLinks;
}

/**
 * Default site facts - Replace with actual business data
 *
 * When creating a new client project:
 * 1. Copy this file
 * 2. Update all values with client's actual data
 * 3. Add/remove fields as needed
 */
export const siteFacts: SiteFacts = {
  company: {
    name: SITE_CONFIG.name,
    established: 2020,
    location: {
      country: 'United States',
      city: 'San Francisco',
    },
  },
  contact: {
    phone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    whatsapp: SITE_CONFIG.contact.whatsappNumber,
    businessHours: {
      weekdays: '9:00 - 18:00',
      saturday: '10:00 - 16:00',
      sundayClosed: true,
    },
  },
  certifications: [
    { name: 'ISO 9001', file: '/certs/iso9001.pdf' },
    { name: 'ISO 14001' },
  ],
  stats: {
    exportCountries: 50,
    clientsServed: 500,
    onTimeDeliveryRate: 98,
  },
  social: {
    linkedin: SITE_CONFIG.social.linkedin,
    twitter: SITE_CONFIG.social.twitter,
    github: SITE_CONFIG.social.github,
  },
};
