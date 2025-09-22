import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  airtableRecordSchema,
  apiResponseSchema,
  contactFormSchema,
  emailTemplateDataSchema,
  validationConfig,
  validationHelpers,
  type ContactFormData,
  type FormSubmissionStatus,
  type FormValidationError,
} from '../validations';

// 确保使用真实的validations模块和Zod库，不受Mock影响
vi.unmock('../validations');
vi.unmock('@/lib/validations');
vi.unmock('zod');

describe('validations - Schema Validation', () => {
  describe('contactFormSchema', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Company',
      message: 'This is a test message with sufficient length.',
      acceptPrivacy: true,
      website: '', // honeypot field
    };

    it('should validate correct form data', () => {
      const result = contactFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it('should reject form data with short first name', () => {
      const invalidData = { ...validFormData, firstName: 'J' };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'at least 2 characters',
        );
      }
    });

    it('should reject form data with long first name', () => {
      const invalidData = { ...validFormData, firstName: 'J'.repeat(51) };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'less than 50 characters',
        );
      }
    });

    it('should reject form data with invalid first name characters', () => {
      const invalidData = { ...validFormData, firstName: 'John123' };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'only contain letters',
        );
      }
    });

    it('should accept Chinese characters in names', () => {
      const chineseData = {
        ...validFormData,
        firstName: '张三',
        lastName: '李四',
      };
      const result = contactFormSchema.safeParse(chineseData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = { ...validFormData, email: 'invalid-email' };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'valid email address',
        );
      }
    });

    it('should convert email to lowercase', () => {
      const upperCaseEmailData = {
        ...validFormData,
        email: 'JOHN.DOE@EXAMPLE.COM',
      };
      const result = contactFormSchema.safeParse(upperCaseEmailData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john.doe@example.com');
      }
    });

    it('should validate optional phone number', () => {
      const dataWithPhone = { ...validFormData, phone: '+1234567890' };
      const result = contactFormSchema.safeParse(dataWithPhone);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number format', () => {
      const invalidData = { ...validFormData, phone: 'invalid-phone' };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('valid phone number');
      }
    });

    it('should validate optional subject', () => {
      const dataWithSubject = { ...validFormData, subject: 'Test Subject' };
      const result = contactFormSchema.safeParse(dataWithSubject);
      expect(result.success).toBe(true);
    });

    it('should reject subject that is too short', () => {
      const invalidData = { ...validFormData, subject: 'Hi' };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'between 5 and 100 characters',
        );
      }
    });

    it('should require privacy acceptance', () => {
      const invalidData = { ...validFormData, acceptPrivacy: false };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'accept the privacy policy',
        );
      }
    });

    it('should validate optional marketing consent', () => {
      const dataWithConsent = { ...validFormData, marketingConsent: true };
      const result = contactFormSchema.safeParse(dataWithConsent);
      expect(result.success).toBe(true);
    });

    it('should reject honeypot field with content', () => {
      const invalidData = { ...validFormData, website: 'spam content' };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('should be empty');
      }
    });
  });
});

describe('validations - API and Data Schemas', () => {
  describe('apiResponseSchema', () => {
    it('should validate successful API response', () => {
      const response = {
        success: true,
        message: 'Operation completed successfully',
        data: { id: '123' },
      };
      const result = apiResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should validate error API response', () => {
      const response = {
        success: false,
        error: 'Something went wrong',
      };
      const result = apiResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should validate minimal API response', () => {
      const response = { success: true };
      const result = apiResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });

  describe('airtableRecordSchema', () => {
    const validRecord = {
      id: 'rec123',
      fields: {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john@example.com',
        'Company': 'Test Co',
        'Message': 'Test message',
        'Submitted At': '2023-01-01T00:00:00Z',
      },
      createdTime: '2023-01-01T00:00:00Z',
    };

    it('should validate correct Airtable record', () => {
      const result = airtableRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it('should set default status to New', () => {
      const result = airtableRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fields.Status).toBe('New');
      }
    });

    it('should set default source to Website Contact Form', () => {
      const result = airtableRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fields.Source).toBe('Website Contact Form');
      }
    });

    it('should validate with custom status', () => {
      const recordWithStatus = {
        ...validRecord,
        fields: { ...validRecord.fields, Status: 'In Progress' as const },
      };
      const result = airtableRecordSchema.safeParse(recordWithStatus);
      expect(result.success).toBe(true);
    });
  });

  describe('emailTemplateDataSchema', () => {
    const validTemplateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Test Co',
      message: 'Test message',
      submittedAt: '2023-01-01T00:00:00Z',
    };

    it('should validate correct email template data', () => {
      const result = emailTemplateDataSchema.safeParse(validTemplateData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const dataWithOptionals = {
        ...validTemplateData,
        phone: '+1234567890',
        subject: 'Test Subject',
        marketingConsent: true,
      };
      const result = emailTemplateDataSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
    });
  });
});

describe('validations - Helper Functions', () => {
  describe('validationHelpers', () => {
    describe('isEmailDomainAllowed', () => {
      it('should allow all domains when no restrictions', () => {
        const result =
          validationHelpers.isEmailDomainAllowed('test@example.com');
        expect(result).toBe(true);
      });

      it('should allow all domains when empty array provided', () => {
        const result = validationHelpers.isEmailDomainAllowed(
          'test@example.com',
          [],
        );
        expect(result).toBe(true);
      });

      it('should allow email from allowed domain', () => {
        const result = validationHelpers.isEmailDomainAllowed(
          'test@example.com',
          ['example.com'],
        );
        expect(result).toBe(true);
      });

      it('should reject email from disallowed domain', () => {
        const result = validationHelpers.isEmailDomainAllowed('test@spam.com', [
          'example.com',
        ]);
        expect(result).toBe(false);
      });

      it('should be case insensitive', () => {
        const result = validationHelpers.isEmailDomainAllowed(
          'test@EXAMPLE.COM',
          ['example.com'],
        );
        expect(result).toBe(true);
      });
    });

    describe('sanitizeInput', () => {
      it('should trim whitespace', () => {
        const result = validationHelpers.sanitizeInput('  test  ');
        expect(result).toBe('test');
      });

      it('should replace multiple spaces with single space', () => {
        const result = validationHelpers.sanitizeInput(
          'test   multiple   spaces',
        );
        expect(result).toBe('test multiple spaces');
      });

      it('should remove HTML tags', () => {
        const result = validationHelpers.sanitizeInput(
          'test<script>alert("xss")</script>',
        );
        expect(result).toBe('testscriptalert("xss")/script');
      });
    });

    describe('isSpamContent', () => {
      it('should detect spam keywords', () => {
        const result = validationHelpers.isSpamContent('Win the lottery now!');
        expect(result).toBe(true);
      });

      it('should be case insensitive', () => {
        const result = validationHelpers.isSpamContent('VIAGRA for sale');
        expect(result).toBe(true);
      });

      it('should allow legitimate content', () => {
        const result = validationHelpers.isSpamContent(
          'I would like to inquire about your services',
        );
        expect(result).toBe(false);
      });
    });

    describe('isSubmissionRateLimited', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      it('should not rate limit when no previous submission', () => {
        const result = validationHelpers.isSubmissionRateLimited(null);
        expect(result).toBe(false);
      });

      it('should rate limit recent submissions', () => {
        const recentSubmission = new Date();
        const result = validationHelpers.isSubmissionRateLimited(
          recentSubmission,
          5,
        );
        expect(result).toBe(true);
      });

      it('should not rate limit old submissions', () => {
        const oldSubmission = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        const result = validationHelpers.isSubmissionRateLimited(
          oldSubmission,
          5,
        );
        expect(result).toBe(false);
      });
    });
  });
});

describe('validations - Configuration and Types', () => {
  describe('validationConfig', () => {
    it('should have correct default configuration', () => {
      expect(validationConfig.submissionCooldownMinutes).toBe(5);
      expect(validationConfig.maxSubmissionsPerHour).toBe(10);
      expect(validationConfig.enableSpamDetection).toBe(true);
      expect(validationConfig.allowedEmailDomains).toEqual([]);
      expect(validationConfig.enableHoneypot).toBe(true);
      expect(validationConfig.enableCsrfProtection).toBe(true);
      expect(validationConfig.enableTurnstile).toBe(true);
    });

    it('should have correct required fields', () => {
      expect(validationConfig.requiredFields).toContain('firstName');
      expect(validationConfig.requiredFields).toContain('lastName');
      expect(validationConfig.requiredFields).toContain('email');
      expect(validationConfig.requiredFields).toContain('company');
      expect(validationConfig.requiredFields).toContain('message');
      expect(validationConfig.requiredFields).toContain('acceptPrivacy');
    });

    it('should have correct optional fields', () => {
      expect(validationConfig.optionalFields).toContain('phone');
      expect(validationConfig.optionalFields).toContain('subject');
      expect(validationConfig.optionalFields).toContain('marketingConsent');
      expect(validationConfig.optionalFields).toContain('website');
    });
  });

  describe('TypeScript types', () => {
    it('should infer correct ContactFormData type', () => {
      const formData: ContactFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Co',
        message: 'Test message',
        acceptPrivacy: true,
        website: '',
      };
      expect(formData).toBeDefined();
    });

    it('should define FormValidationError interface', () => {
      const error: FormValidationError = {
        field: 'firstName',
        message: 'First name is required',
      };
      expect(error).toBeDefined();
    });

    it('should define FormSubmissionStatus type', () => {
      const statuses: FormSubmissionStatus[] = [
        'idle',
        'submitting',
        'success',
        'error',
      ];
      expect(statuses).toHaveLength(4);
    });
  });
});
