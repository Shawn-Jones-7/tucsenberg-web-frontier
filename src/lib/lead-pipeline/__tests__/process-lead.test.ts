/**
 * Process Lead Tests
 * Tests for the main lead processing function
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_SUBJECTS, LEAD_TYPES } from '../lead-schema';
import { processLead } from '../process-lead';

// Ensure real Zod is used
vi.unmock('zod');

// Hoist mock functions for dynamic import compatibility
const mockSendContactFormEmail = vi.hoisted(() => vi.fn());
const mockSendProductInquiryEmail = vi.hoisted(() => vi.fn());
const mockCreateLead = vi.hoisted(() => vi.fn());

// Mock external services with hoisted functions
vi.mock('@/lib/resend', () => ({
  resendService: {
    sendContactFormEmail: mockSendContactFormEmail,
    sendProductInquiryEmail: mockSendProductInquiryEmail,
  },
}));

vi.mock('@/lib/airtable', () => ({
  airtableService: {
    createLead: mockCreateLead,
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('processLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation', () => {
    it('should return VALIDATION_ERROR for invalid input', async () => {
      const invalidInput = { type: 'invalid' };
      const result = await processLead(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
      expect(result.emailSent).toBe(false);
      expect(result.recordCreated).toBe(false);
    });

    it('should return VALIDATION_ERROR for missing required fields', async () => {
      const missingFields = {
        type: LEAD_TYPES.CONTACT,
        // Missing fullName, email, subject, message, turnstileToken
      };
      const result = await processLead(missingFields);

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should return VALIDATION_ERROR for invalid email', async () => {
      const invalidEmail = {
        type: LEAD_TYPES.CONTACT,
        fullName: 'John Doe',
        email: 'not-an-email',
        subject: CONTACT_SUBJECTS.OTHER,
        message: 'Test message with enough characters.',
        turnstileToken: 'token',
      };
      const result = await processLead(invalidEmail);

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Contact Lead Processing', () => {
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

    it('should process contact lead successfully when both services succeed', async () => {
      mockSendContactFormEmail.mockResolvedValue('email-id-123');
      mockCreateLead.mockResolvedValue({ id: 'record-123' });

      const result = await processLead(validContactLead);

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(result.recordCreated).toBe(true);
      expect(result.referenceId).toBeDefined();
      expect(result.referenceId?.startsWith('CON-')).toBe(true);
    });

    it('should succeed when only email succeeds', async () => {
      mockSendContactFormEmail.mockResolvedValue('email-id-123');
      mockCreateLead.mockRejectedValue(new Error('CRM failed'));

      const result = await processLead(validContactLead);

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(result.recordCreated).toBe(false);
    });

    it('should succeed when only CRM succeeds', async () => {
      mockSendContactFormEmail.mockRejectedValue(new Error('Email failed'));
      mockCreateLead.mockResolvedValue({ id: 'record-123' });

      const result = await processLead(validContactLead);

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(false);
      expect(result.recordCreated).toBe(true);
    });

    it('should fail when both services fail', async () => {
      mockSendContactFormEmail.mockRejectedValue(new Error('Email failed'));
      mockCreateLead.mockRejectedValue(new Error('CRM failed'));

      const result = await processLead(validContactLead);

      expect(result.success).toBe(false);
      expect(result.emailSent).toBe(false);
      expect(result.recordCreated).toBe(false);
      expect(result.error).toBe('PROCESSING_FAILED');
    });

    it('should split fullName correctly', async () => {
      mockSendContactFormEmail.mockResolvedValue('email-id');
      mockCreateLead.mockResolvedValue({ id: 'rec-id' });

      await processLead(validContactLead);

      expect(mockSendContactFormEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
        }),
      );
    });
  });

  describe('Product Lead Processing', () => {
    const validProductLead = {
      type: LEAD_TYPES.PRODUCT,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      productSlug: 'industrial-pump-x100',
      productName: 'Industrial Pump X100',
      quantity: '500 units',
      company: 'Manufacturing Corp',
      requirements: 'Custom packaging needed',
    };

    it('should process product lead successfully', async () => {
      const { resendService } = await import('@/lib/resend');
      const { airtableService } = await import('@/lib/airtable');

      vi.mocked(resendService.sendProductInquiryEmail).mockResolvedValue(
        'email-id-456',
      );
      vi.mocked(airtableService.createLead).mockResolvedValue({
        id: 'record-456',
      });

      const result = await processLead(validProductLead);

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(result.recordCreated).toBe(true);
      expect(result.referenceId?.startsWith('PRO-')).toBe(true);
    });

    it('should call correct email service method', async () => {
      const { resendService } = await import('@/lib/resend');
      const { airtableService } = await import('@/lib/airtable');

      vi.mocked(resendService.sendProductInquiryEmail).mockResolvedValue('id');
      vi.mocked(airtableService.createLead).mockResolvedValue({ id: 'rec' });

      await processLead(validProductLead);

      expect(resendService.sendProductInquiryEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          productName: 'Industrial Pump X100',
          productSlug: 'industrial-pump-x100',
          quantity: '500 units',
        }),
      );
    });
  });

  describe('Newsletter Lead Processing', () => {
    const validNewsletterLead = {
      type: LEAD_TYPES.NEWSLETTER,
      email: 'subscriber@example.com',
    };

    it('should process newsletter lead successfully', async () => {
      const { airtableService } = await import('@/lib/airtable');

      vi.mocked(airtableService.createLead).mockResolvedValue({
        id: 'record-789',
      });

      const result = await processLead(validNewsletterLead);

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(false); // Newsletter has no email operation
      expect(result.recordCreated).toBe(true);
      expect(result.referenceId?.startsWith('NEW-')).toBe(true);
    });

    it('should not call email service for newsletter', async () => {
      const { resendService } = await import('@/lib/resend');
      const { airtableService } = await import('@/lib/airtable');

      vi.mocked(airtableService.createLead).mockResolvedValue({ id: 'rec' });

      await processLead(validNewsletterLead);

      expect(resendService.sendContactFormEmail).not.toHaveBeenCalled();
      expect(resendService.sendProductInquiryEmail).not.toHaveBeenCalled();
    });

    it('should fail when CRM fails for newsletter (no email fallback)', async () => {
      mockCreateLead.mockRejectedValue(new Error('CRM failed'));

      const result = await processLead(validNewsletterLead);

      // Newsletter success depends solely on CRM - no email fallback
      expect(result.success).toBe(false);
      expect(result.emailSent).toBe(false);
      expect(result.recordCreated).toBe(false);
      expect(result.error).toBe('PROCESSING_FAILED');
    });
  });
});
