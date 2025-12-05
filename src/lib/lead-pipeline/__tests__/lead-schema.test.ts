/**
 * Lead Schema Tests
 * Tests for unified lead pipeline Zod schemas
 */

import { describe, expect, it, vi } from 'vitest';
import {
  CONTACT_SUBJECTS,
  contactLeadSchema,
  isContactLead,
  isNewsletterLead,
  isProductLead,
  LEAD_TYPES,
  leadSchema,
  newsletterLeadSchema,
  productLeadSchema,
  type ContactLeadInput,
  type NewsletterLeadInput,
  type ProductLeadInput,
} from '../lead-schema';

// Ensure real Zod is used, not mocked
vi.unmock('zod');

describe('Lead Schema', () => {
  describe('contactLeadSchema', () => {
    const validContactLead = {
      type: LEAD_TYPES.CONTACT,
      fullName: 'John Doe',
      email: 'john@example.com',
      subject: CONTACT_SUBJECTS.PRODUCT_INQUIRY,
      message: 'This is a test message with enough characters.',
      turnstileToken: 'valid-token',
      company: 'Test Company',
      marketingConsent: true,
    };

    it('should validate a complete contact lead', () => {
      const result = contactLeadSchema.safeParse(validContactLead);
      expect(result.success).toBe(true);
    });

    it('should validate contact lead without optional fields', () => {
      const minimalLead = {
        type: LEAD_TYPES.CONTACT,
        fullName: 'John Doe',
        email: 'john@example.com',
        subject: CONTACT_SUBJECTS.OTHER,
        message: 'Test message with enough characters.',
        turnstileToken: 'token',
      };
      const result = contactLeadSchema.safeParse(minimalLead);
      expect(result.success).toBe(true);
    });

    it('should reject contact lead with invalid email', () => {
      const invalidLead = { ...validContactLead, email: 'invalid-email' };
      const result = contactLeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject contact lead with too short message', () => {
      const invalidLead = { ...validContactLead, message: 'short' };
      const result = contactLeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject contact lead with invalid subject', () => {
      const invalidLead = { ...validContactLead, subject: 'invalid_subject' };
      const result = contactLeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should trim fullName', () => {
      const leadWithSpaces = { ...validContactLead, fullName: '  John Doe  ' };
      const result = contactLeadSchema.safeParse(leadWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('John Doe');
      }
    });

    it('should accept all valid subject types', () => {
      const subjects = Object.values(CONTACT_SUBJECTS);
      for (const subject of subjects) {
        const lead = { ...validContactLead, subject };
        const result = contactLeadSchema.safeParse(lead);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('productLeadSchema', () => {
    const validProductLead = {
      type: LEAD_TYPES.PRODUCT,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      productSlug: 'industrial-pump-x100',
      productName: 'Industrial Pump X100',
      quantity: '500 units',
      company: 'Manufacturing Corp',
      requirements: 'Need custom packaging',
      marketingConsent: false,
    };

    it('should validate a complete product lead', () => {
      const result = productLeadSchema.safeParse(validProductLead);
      expect(result.success).toBe(true);
    });

    it('should validate product lead with numeric quantity', () => {
      const leadWithNumericQty = { ...validProductLead, quantity: 100 };
      const result = productLeadSchema.safeParse(leadWithNumericQty);
      expect(result.success).toBe(true);
    });

    it('should reject product lead without productSlug', () => {
      const { productSlug: _, ...invalidLead } = validProductLead;
      const result = productLeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject product lead without productName', () => {
      const { productName: _, ...invalidLead } = validProductLead;
      const result = productLeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should accept product lead without optional requirements', () => {
      const { requirements: _, ...minimalLead } = validProductLead;
      const result = productLeadSchema.safeParse(minimalLead);
      expect(result.success).toBe(true);
    });
  });

  describe('newsletterLeadSchema', () => {
    it('should validate a valid newsletter subscription', () => {
      const validNewsletter = {
        type: LEAD_TYPES.NEWSLETTER,
        email: 'subscriber@example.com',
      };
      const result = newsletterLeadSchema.safeParse(validNewsletter);
      expect(result.success).toBe(true);
    });

    it('should reject newsletter with invalid email', () => {
      const invalidNewsletter = {
        type: LEAD_TYPES.NEWSLETTER,
        email: 'not-an-email',
      };
      const result = newsletterLeadSchema.safeParse(invalidNewsletter);
      expect(result.success).toBe(false);
    });

    it('should reject newsletter without email', () => {
      const invalidNewsletter = { type: LEAD_TYPES.NEWSLETTER };
      const result = newsletterLeadSchema.safeParse(invalidNewsletter);
      expect(result.success).toBe(false);
    });
  });

  describe('leadSchema (discriminated union)', () => {
    it('should correctly discriminate contact lead', () => {
      const contactLead = {
        type: LEAD_TYPES.CONTACT,
        fullName: 'Test User',
        email: 'test@example.com',
        subject: CONTACT_SUBJECTS.OTHER,
        message: 'Test message with enough length.',
        turnstileToken: 'token',
      };
      const result = leadSchema.safeParse(contactLead);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(LEAD_TYPES.CONTACT);
      }
    });

    it('should correctly discriminate product lead', () => {
      const productLead = {
        type: LEAD_TYPES.PRODUCT,
        fullName: 'Test User',
        email: 'test@example.com',
        productSlug: 'test-product',
        productName: 'Test Product',
        quantity: 10,
      };
      const result = leadSchema.safeParse(productLead);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(LEAD_TYPES.PRODUCT);
      }
    });

    it('should correctly discriminate newsletter lead', () => {
      const newsletterLead = {
        type: LEAD_TYPES.NEWSLETTER,
        email: 'test@example.com',
      };
      const result = leadSchema.safeParse(newsletterLead);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(LEAD_TYPES.NEWSLETTER);
      }
    });

    it('should reject unknown lead type', () => {
      const invalidLead = {
        type: 'unknown',
        email: 'test@example.com',
      };
      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guards', () => {
    it('isContactLead should correctly identify contact leads', () => {
      const contactLead: ContactLeadInput = {
        type: LEAD_TYPES.CONTACT,
        fullName: 'Test',
        email: 'test@example.com',
        subject: CONTACT_SUBJECTS.OTHER,
        message: 'Test message.',
        turnstileToken: 'token',
      };
      expect(isContactLead(contactLead)).toBe(true);
      expect(isProductLead(contactLead)).toBe(false);
      expect(isNewsletterLead(contactLead)).toBe(false);
    });

    it('isProductLead should correctly identify product leads', () => {
      const productLead: ProductLeadInput = {
        type: LEAD_TYPES.PRODUCT,
        fullName: 'Test',
        email: 'test@example.com',
        productSlug: 'test',
        productName: 'Test',
        quantity: 1,
      };
      expect(isProductLead(productLead)).toBe(true);
      expect(isContactLead(productLead)).toBe(false);
      expect(isNewsletterLead(productLead)).toBe(false);
    });

    it('isNewsletterLead should correctly identify newsletter leads', () => {
      const newsletterLead: NewsletterLeadInput = {
        type: LEAD_TYPES.NEWSLETTER,
        email: 'test@example.com',
      };
      expect(isNewsletterLead(newsletterLead)).toBe(true);
      expect(isContactLead(newsletterLead)).toBe(false);
      expect(isProductLead(newsletterLead)).toBe(false);
    });
  });
});
