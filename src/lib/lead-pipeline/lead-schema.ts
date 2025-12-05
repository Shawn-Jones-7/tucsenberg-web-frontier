/**
 * Lead Pipeline Schema Definitions
 * Unified Zod schema for all lead sources: contact, product inquiry, newsletter
 */

import { z } from 'zod';
import {
  COUNT_TEN,
  MAGIC_255,
  MAGIC_2000,
  MAGIC_2500,
  ONE,
  PERCENTAGE_FULL,
} from '@/constants';

// Validation limits for lead fields - using named constants from project constants
const EMAIL_MAX_LENGTH = MAGIC_255 - 1; // 254 (RFC 5321)
const COMPANY_MAX_LENGTH = PERCENTAGE_FULL + PERCENTAGE_FULL; // 200
const NAME_MAX_LENGTH = PERCENTAGE_FULL; // 100
const MESSAGE_MIN_LENGTH = COUNT_TEN; // 10
const MESSAGE_MAX_LENGTH = MAGIC_2500 + MAGIC_2500; // 5000
const PRODUCT_NAME_MAX_LENGTH = COMPANY_MAX_LENGTH;
const REQUIREMENTS_MAX_LENGTH = MAGIC_2000;

/**
 * Lead type discriminator
 */
export const LEAD_TYPES = {
  CONTACT: 'contact',
  PRODUCT: 'product',
  NEWSLETTER: 'newsletter',
} as const;

export type LeadType = (typeof LEAD_TYPES)[keyof typeof LEAD_TYPES];

/**
 * Subject options for contact form
 */
export const CONTACT_SUBJECTS = {
  PRODUCT_INQUIRY: 'product_inquiry',
  DISTRIBUTOR: 'distributor',
  OEM_ODM: 'oem_odm',
  OTHER: 'other',
} as const;

export type ContactSubject =
  (typeof CONTACT_SUBJECTS)[keyof typeof CONTACT_SUBJECTS];

/**
 * Base lead fields shared across all lead types
 */
const baseLeadFields = {
  email: z.string().email().max(EMAIL_MAX_LENGTH),
  company: z.string().trim().max(COMPANY_MAX_LENGTH).optional(),
  marketingConsent: z.boolean().optional().default(false),
};

/**
 * Contact form lead schema
 * Used for general inquiries via /contact page
 */
export const contactLeadSchema = z.object({
  type: z.literal(LEAD_TYPES.CONTACT),
  fullName: z.string().trim().min(ONE).max(NAME_MAX_LENGTH),
  subject: z.enum([
    CONTACT_SUBJECTS.PRODUCT_INQUIRY,
    CONTACT_SUBJECTS.DISTRIBUTOR,
    CONTACT_SUBJECTS.OEM_ODM,
    CONTACT_SUBJECTS.OTHER,
  ]),
  message: z.string().trim().min(MESSAGE_MIN_LENGTH).max(MESSAGE_MAX_LENGTH),
  turnstileToken: z.string().min(ONE),
  submittedAt: z.string().optional(),
  ...baseLeadFields,
});

/**
 * Product inquiry lead schema
 * Used for product-specific inquiries via product page drawer
 */
export const productLeadSchema = z.object({
  type: z.literal(LEAD_TYPES.PRODUCT),
  fullName: z.string().trim().min(ONE).max(NAME_MAX_LENGTH),
  productSlug: z.string().trim().min(ONE),
  productName: z.string().trim().min(ONE).max(PRODUCT_NAME_MAX_LENGTH),
  quantity: z.union([z.string().trim().min(ONE), z.coerce.number().positive()]),
  requirements: z.string().trim().max(REQUIREMENTS_MAX_LENGTH).optional(),
  ...baseLeadFields,
});

/**
 * Newsletter subscription lead schema
 * Used for blog/news page email subscriptions
 */
export const newsletterLeadSchema = z.object({
  type: z.literal(LEAD_TYPES.NEWSLETTER),
  email: z.string().email().max(EMAIL_MAX_LENGTH),
});

/**
 * Unified lead schema using discriminated union
 * Allows type-safe handling of different lead types
 */
export const leadSchema = z.discriminatedUnion('type', [
  contactLeadSchema,
  productLeadSchema,
  newsletterLeadSchema,
]);

/**
 * Type exports for external use
 */
export type ContactLeadInput = z.infer<typeof contactLeadSchema>;
export type ProductLeadInput = z.infer<typeof productLeadSchema>;
export type NewsletterLeadInput = z.infer<typeof newsletterLeadSchema>;
export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Type guard functions for runtime type checking
 */
export function isContactLead(lead: LeadInput): lead is ContactLeadInput {
  return lead.type === LEAD_TYPES.CONTACT;
}

export function isProductLead(lead: LeadInput): lead is ProductLeadInput {
  return lead.type === LEAD_TYPES.PRODUCT;
}

export function isNewsletterLead(lead: LeadInput): lead is NewsletterLeadInput {
  return lead.type === LEAD_TYPES.NEWSLETTER;
}
