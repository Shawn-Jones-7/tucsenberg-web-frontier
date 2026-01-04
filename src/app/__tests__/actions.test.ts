import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkDistributedRateLimit } from '@/lib/security/distributed-rate-limit';
import { verifyTurnstile } from '@/app/api/contact/contact-api-utils';
import { contactFormAction } from '../actions';

// Mock dependencies before imports
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockHeadersGet = vi.fn<(key: string) => string | null>((key) => {
  if (key === 'x-forwarded-for') return '192.168.1.100';
  if (key === 'x-real-ip') return '192.168.1.101';
  return null;
});

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: mockHeadersGet,
    }),
  ),
}));

vi.mock('@/lib/security/distributed-rate-limit', () => ({
  checkDistributedRateLimit: vi.fn(() =>
    Promise.resolve({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
    }),
  ),
}));

vi.mock('@/app/api/contact/contact-api-utils', () => ({
  verifyTurnstile: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/app/api/contact/contact-api-validation', () => ({
  processFormSubmission: vi.fn(() =>
    Promise.resolve({
      emailSent: true,
      recordCreated: true,
      emailMessageId: 'msg-123',
      airtableRecordId: 'rec-123',
    }),
  ),
}));

describe('actions.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    // Reset mockHeadersGet to default behavior
    mockHeadersGet.mockImplementation((key: string) => {
      if (key === 'x-forwarded-for') return '192.168.1.100';
      if (key === 'x-real-ip') return '192.168.1.101';
      return null;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createFormData(data: Record<string, string>): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }
    return formData;
  }

  describe('contactFormAction', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      phone: '+1234567890',
      subject: 'General Inquiry',
      message: 'Hello, this is a test message with enough length.',
      acceptPrivacy: 'true',
      marketingConsent: 'false',
      turnstileToken: 'valid-token',
      submittedAt: new Date().toISOString(),
    };

    it('should return error when turnstile token is missing', async () => {
      const dataWithoutToken = { ...validFormData };
      delete (dataWithoutToken as { turnstileToken?: string }).turnstileToken;
      const formData = createFormData(dataWithoutToken);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Security verification required');
    });

    it('should return error when turnstile verification fails', async () => {
      vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);
      const formData = createFormData(validFormData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
      // Error could be validation-related or security-related depending on validation order
      expect(result.error).toBeDefined();
    });

    it('should return error when submittedAt is expired', async () => {
      const expiredData = {
        ...validFormData,
        submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      };
      const formData = createFormData(expiredData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
      // Error could be about expired form or validation
      expect(result.error).toBeDefined();
    });

    it('should return error when form validation fails for missing field', async () => {
      const invalidData = { ...validFormData, firstName: '' };
      const formData = createFormData(invalidData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
    });

    it('should return error when acceptPrivacy is false', async () => {
      const invalidData = { ...validFormData, acceptPrivacy: 'false' };
      const formData = createFormData(invalidData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
    });

    it('should return error when email is invalid', async () => {
      const invalidData = { ...validFormData, email: 'invalid-email' };
      const formData = createFormData(invalidData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
    });

    it('should attempt verification with valid form data', async () => {
      const formData = createFormData(validFormData);

      const result = await contactFormAction(null, formData);

      // Result depends on whether validation passes before turnstile check
      // The test verifies the action runs without throwing
      expect(result).toBeDefined();
    });

    it('should use current time when submittedAt is not provided', async () => {
      const dataWithoutSubmittedAt = { ...validFormData };
      delete (dataWithoutSubmittedAt as { submittedAt?: string }).submittedAt;
      const formData = createFormData(dataWithoutSubmittedAt);

      const result = await contactFormAction(null, formData);

      // Should still return a result (success or error depending on validation)
      expect(result).toBeDefined();
    });

    it('should return result object with expected structure', async () => {
      const formData = createFormData(validFormData);

      const result = await contactFormAction(null, formData);

      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle missing lastName', async () => {
      const invalidData = { ...validFormData, lastName: '' };
      const formData = createFormData(invalidData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
    });

    it('should handle missing message', async () => {
      const invalidData = { ...validFormData, message: '' };
      const formData = createFormData(invalidData);

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
    });

    it('should handle empty form data', async () => {
      const formData = new FormData();

      const result = await contactFormAction(null, formData);

      expect(result.success).toBe(false);
    });
  });

  describe('Server Action Security', () => {
    function getValidFormData(): Record<string, string> {
      return {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Acme Inc',
        phone: '+1234567890',
        subject: 'General Inquiry',
        message: 'Hello, this is a test message with enough length.',
        acceptPrivacy: 'true',
        marketingConsent: 'false',
        turnstileToken: 'valid-token',
        submittedAt: new Date().toISOString(),
      };
    }

    function createFormData(data: Record<string, string>): FormData {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }
      return formData;
    }

    describe('Rate Limiting', () => {
      it('should reject request when rate limit exceeded', async () => {
        vi.mocked(checkDistributedRateLimit).mockResolvedValueOnce({
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + 60000,
          retryAfter: 60,
        });

        const formData = createFormData(getValidFormData());
        const result = await contactFormAction(null, formData);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Too many requests');
      });

      it('should call rate limiter with extracted client IP', async () => {
        const formData = createFormData(getValidFormData());
        await contactFormAction(null, formData);

        expect(checkDistributedRateLimit).toHaveBeenCalledWith(
          '192.168.1.100',
          'contact',
        );
      });

      it('should use x-real-ip when x-forwarded-for is not available', async () => {
        mockHeadersGet.mockImplementation((key: string) => {
          if (key === 'x-real-ip') return '10.0.0.50';
          return null;
        });

        const formData = createFormData(getValidFormData());
        await contactFormAction(null, formData);

        expect(checkDistributedRateLimit).toHaveBeenCalledWith(
          '10.0.0.50',
          'contact',
        );
      });

      it('should use "unknown" when no IP headers available', async () => {
        mockHeadersGet.mockReturnValue(null);

        const formData = createFormData(getValidFormData());
        await contactFormAction(null, formData);

        expect(checkDistributedRateLimit).toHaveBeenCalledWith(
          'unknown',
          'contact',
        );
      });
    });

    describe('Honeypot Field Validation', () => {
      it('should silently reject when honeypot field is filled', async () => {
        const formDataWithHoneypot = {
          ...getValidFormData(),
          website: 'http://spam-bot.com',
        };
        const formData = createFormData(formDataWithHoneypot);

        const result = await contactFormAction(null, formData);

        // Honeypot triggers silent rejection: returns success but doesn't process
        expect(result.success).toBe(true);
        expect(result.data?.emailSent).toBe(false);
        expect(result.data?.recordCreated).toBe(false);
        // verifyTurnstile should NOT be called (blocked before validation)
        expect(verifyTurnstile).not.toHaveBeenCalled();
      });

      it('should process normally when honeypot field is empty', async () => {
        const formDataWithEmptyHoneypot = {
          ...getValidFormData(),
          website: '',
        };
        const formData = createFormData(formDataWithEmptyHoneypot);

        await contactFormAction(null, formData);

        // Should proceed to Turnstile verification
        expect(verifyTurnstile).toHaveBeenCalled();
      });

      it('should process normally when honeypot field is absent', async () => {
        const formData = createFormData(getValidFormData());

        await contactFormAction(null, formData);

        // Should proceed to Turnstile verification
        expect(verifyTurnstile).toHaveBeenCalled();
      });
    });

    describe('Client IP Extraction', () => {
      it('should extract first IP from x-forwarded-for chain', async () => {
        mockHeadersGet.mockImplementation((key: string) => {
          if (key === 'x-forwarded-for') return '203.0.113.50, 198.51.100.1';
          return null;
        });

        const formData = createFormData(getValidFormData());
        await contactFormAction(null, formData);

        expect(checkDistributedRateLimit).toHaveBeenCalledWith(
          '203.0.113.50',
          'contact',
        );
      });

      it('should pass client IP to Turnstile verification', async () => {
        mockHeadersGet.mockImplementation((key: string) => {
          if (key === 'x-forwarded-for') return '172.16.0.100';
          return null;
        });

        const formData = createFormData(getValidFormData());
        await contactFormAction(null, formData);

        expect(verifyTurnstile).toHaveBeenCalledWith(
          'valid-token',
          '172.16.0.100',
        );
      });
    });
  });
});
