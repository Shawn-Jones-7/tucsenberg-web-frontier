import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableService } from '@/lib/airtable';
import { processLead } from '@/lib/lead-pipeline';
import { verifyTurnstile } from '../contact-api-utils';
import {
  getContactFormStats,
  processFormSubmission,
  sanitizeFormData,
  validateAdminAccess,
  validateFormData,
  type ContactFormWithToken,
} from '../contact-api-validation';

// Mock dependencies before imports
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  sanitizeIP: (ip: string | undefined | null) =>
    ip ? '[REDACTED_IP]' : '[NO_IP]',
  sanitizeEmail: (email: string | undefined | null) =>
    email ? '[REDACTED_EMAIL]' : '[NO_EMAIL]',
}));

vi.mock('@/lib/airtable', () => ({
  airtableService: {
    isReady: vi.fn(() => true),
    getStatistics: vi.fn(() =>
      Promise.resolve({
        totalContacts: 100,
        newContacts: 10,
        completedContacts: 80,
        recentContacts: 5,
      }),
    ),
  },
}));

vi.mock('@/lib/lead-pipeline', () => ({
  processLead: vi.fn(() =>
    Promise.resolve({
      success: true,
      emailSent: true,
      recordCreated: true,
      referenceId: 'ref-123',
    }),
  ),
}));

vi.mock('@/app/api/contact/contact-api-utils', () => ({
  verifyTurnstile: vi.fn(() => Promise.resolve(true)),
}));

describe('contact-api-validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('validateFormData', () => {
    const validFormData = {
      turnstileToken: 'valid-token',
      submittedAt: new Date().toISOString(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      message: 'Hello, this is a test message.',
      acceptPrivacy: true,
    };

    it('should return success for valid form data', async () => {
      vi.setSystemTime(new Date());
      const result = await validateFormData(validFormData, '192.168.1.1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle various input types', async () => {
      // Test with minimal data that includes required timestamps
      const minimalValidData = {
        turnstileToken: 'token',
        submittedAt: new Date().toISOString(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        company: 'Test Co',
        message: 'This is a test message for validation.',
        acceptPrivacy: true,
      };

      const result = await validateFormData(minimalValidData, '192.168.1.1');

      // Should return a result
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should return error for expired submission', async () => {
      // Set submission time to 15 minutes ago
      const expiredTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const expiredData = {
        ...validFormData,
        submittedAt: expiredTime,
      };

      const result = await validateFormData(expiredData, '192.168.1.1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Form submission expired or invalid');
    });

    it('should return error for future submission time', async () => {
      const futureTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const futureData = {
        ...validFormData,
        submittedAt: futureTime,
      };

      const result = await validateFormData(futureData, '192.168.1.1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Form submission expired or invalid');
    });

    it('should return error when turnstile verification fails', async () => {
      vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);
      vi.setSystemTime(new Date());

      const result = await validateFormData(validFormData, '192.168.1.1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Security verification failed');
    });

    it('should return result with expected structure', async () => {
      // Verify the function returns expected structure
      const result = await validateFormData({}, '192.168.1.1');

      // Verify structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('data');
    });
  });

  describe('processFormSubmission', () => {
    const validFormData: ContactFormWithToken = {
      turnstileToken: 'valid-token',
      submittedAt: new Date().toISOString(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      message: 'Hello, this is a test message.',
      acceptPrivacy: true,
      marketingConsent: false,
    };

    it('should process form submission successfully', async () => {
      const result = await processFormSubmission(validFormData);

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(result.recordCreated).toBe(true);
      expect(processLead).toHaveBeenCalled();
    });

    it('should pass correct data to processLead', async () => {
      await processFormSubmission(validFormData);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          fullName: 'John Doe',
        }),
      );
    });

    it('should handle firstName only', async () => {
      const firstNameOnly: ContactFormWithToken = {
        ...validFormData,
        lastName: '',
      };

      await processFormSubmission(firstNameOnly);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John',
        }),
      );
    });

    it('should throw error on processLead failure', async () => {
      vi.mocked(processLead).mockResolvedValueOnce({
        success: false,
        error: 'Processing failed',
        emailSent: false,
        recordCreated: false,
      });

      await expect(processFormSubmission(validFormData)).rejects.toThrow(
        'Failed to process form submission',
      );
    });

    it('should map product subject correctly', async () => {
      const productData: ContactFormWithToken = {
        ...validFormData,
        subject: 'Product inquiry',
      };

      await processFormSubmission(productData);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'product_inquiry',
        }),
      );
    });

    it('should map distributor subject correctly', async () => {
      const distributorData: ContactFormWithToken = {
        ...validFormData,
        subject: 'Become a distributor',
      };

      await processFormSubmission(distributorData);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'distributor',
        }),
      );
    });

    it('should map oem/odm subject correctly', async () => {
      const oemData: ContactFormWithToken = {
        ...validFormData,
        subject: 'OEM partnership',
      };

      await processFormSubmission(oemData);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'oem_odm',
        }),
      );
    });

    it('should map odm subject correctly', async () => {
      const odmData: ContactFormWithToken = {
        ...validFormData,
        subject: 'ODM services',
      };

      await processFormSubmission(odmData);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'oem_odm',
        }),
      );
    });

    it('should map unknown subject to other', async () => {
      const otherData: ContactFormWithToken = {
        ...validFormData,
        subject: 'General question',
      };

      await processFormSubmission(otherData);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'other',
        }),
      );
    });

    it('should handle undefined subject', async () => {
      const noSubject: ContactFormWithToken = {
        ...validFormData,
        subject: undefined,
      };

      await processFormSubmission(noSubject);

      expect(processLead).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'other',
        }),
      );
    });
  });

  describe('getContactFormStats', () => {
    it('should return statistics when service is ready', async () => {
      const result = await getContactFormStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalContacts: 100,
        newContacts: 10,
        completedContacts: 80,
        recentContacts: 5,
      });
    });

    it('should return default values when service is not ready', async () => {
      vi.mocked(airtableService.isReady).mockReturnValueOnce(false);

      const result = await getContactFormStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalContacts: 0,
        newContacts: 0,
        completedContacts: 0,
        recentContacts: 0,
      });
    });

    it('should throw error on getStatistics failure', async () => {
      vi.mocked(airtableService.getStatistics).mockRejectedValueOnce(
        new Error('DB error'),
      );

      await expect(getContactFormStats()).rejects.toThrow(
        'Failed to retrieve statistics',
      );
    });

    it('should handle partial stats', async () => {
      vi.mocked(airtableService.getStatistics).mockResolvedValueOnce({
        totalContacts: 50,
        // Other fields undefined
      } as ReturnType<typeof airtableService.getStatistics> extends Promise<
        infer T
      >
        ? T
        : never);

      const result = await getContactFormStats();

      expect(result.data?.totalContacts).toBe(50);
      expect(result.data?.newContacts).toBe(0);
    });
  });

  describe('validateAdminAccess', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      process.env = { ...originalEnv };
      process.env.ADMIN_API_TOKEN = 'test-admin-token';
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return true for valid admin token', () => {
      const result = validateAdminAccess('Bearer test-admin-token');

      expect(result).toBe(true);
    });

    it('should return false for invalid token', () => {
      const result = validateAdminAccess('Bearer wrong-token');

      expect(result).toBe(false);
    });

    it('should return false for missing Bearer prefix', () => {
      const result = validateAdminAccess('test-admin-token');

      expect(result).toBe(false);
    });

    it('should return false for null header', () => {
      const result = validateAdminAccess(null);

      expect(result).toBe(false);
    });

    it('should return false when ADMIN_API_TOKEN is not configured', () => {
      delete process.env.ADMIN_API_TOKEN;

      const result = validateAdminAccess('Bearer test-admin-token');

      expect(result).toBe(false);
    });

    it('should return false for empty auth header', () => {
      const result = validateAdminAccess('');

      expect(result).toBe(false);
    });

    it('should return false for Bearer with empty token', () => {
      const result = validateAdminAccess('Bearer ');

      expect(result).toBe(false);
    });
  });

  describe('sanitizeFormData', () => {
    const rawFormData: ContactFormWithToken = {
      turnstileToken: '  token  ',
      submittedAt: '2024-01-01T00:00:00Z',
      firstName: '  John  ',
      lastName: '  Doe  ',
      email: '  JOHN@EXAMPLE.COM  ',
      company: '  Acme Inc  ',
      phone: '  +1234567890  ',
      subject: '  General  ',
      message: '  Hello world  ',
      acceptPrivacy: true,
      marketingConsent: true,
      website: '  http://example.com  ',
    };

    it('should trim whitespace from all string fields', () => {
      const result = sanitizeFormData(rawFormData);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.company).toBe('Acme Inc');
      expect(result.message).toBe('Hello world');
    });

    it('should lowercase email', () => {
      const result = sanitizeFormData(rawFormData);

      expect(result.email).toBe('john@example.com');
    });

    it('should trim turnstileToken', () => {
      const result = sanitizeFormData(rawFormData);

      expect(result.turnstileToken).toBe('token');
    });

    it('should handle empty optional fields', () => {
      const dataWithEmptyOptionals: ContactFormWithToken = {
        ...rawFormData,
        company: '',
        phone: '',
        subject: '',
        website: '',
      };

      const result = sanitizeFormData(dataWithEmptyOptionals);

      expect(result.company).toBe('');
      expect(result.phone).toBeUndefined();
      expect(result.subject).toBeUndefined();
      expect(result.website).toBeUndefined();
    });

    it('should handle undefined optional fields', () => {
      const dataWithUndefined: ContactFormWithToken = {
        ...rawFormData,
        phone: undefined,
        subject: undefined,
        website: undefined,
      };

      const result = sanitizeFormData(dataWithUndefined);

      expect(result.phone).toBeUndefined();
      expect(result.subject).toBeUndefined();
      expect(result.website).toBeUndefined();
    });

    it('should preserve boolean fields', () => {
      const result = sanitizeFormData(rawFormData);

      expect(result.acceptPrivacy).toBe(true);
      expect(result.marketingConsent).toBe(true);
    });

    it('should default marketingConsent to false when undefined', () => {
      const dataWithoutConsent: ContactFormWithToken = {
        ...rawFormData,
        marketingConsent: undefined,
      };

      const result = sanitizeFormData(dataWithoutConsent);

      expect(result.marketingConsent).toBe(false);
    });

    it('should preserve submittedAt', () => {
      const result = sanitizeFormData(rawFormData);

      expect(result.submittedAt).toBe('2024-01-01T00:00:00Z');
    });
  });
});
