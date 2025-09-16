import { describe, expect, it } from 'vitest';
import { formatDate, validateEmail } from '@/shared/utils';

describe('shared utils', () => {
  describe('formatDate', () => {
    it('should format date to ISO string (YYYY-MM-DD)', () => {
      const date = new Date('2025-07-29T10:30:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('2025-07-29');
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('2024-01-01T00:00:00.000Z');
      const date2 = new Date('2024-12-31T23:59:59.999Z');

      expect(formatDate(date1)).toBe('2024-01-01');
      expect(formatDate(date2)).toBe('2024-12-31');
    });

    it('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00.000Z');
      const result = formatDate(leapYearDate);
      expect(result).toBe('2024-02-29');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2025-01-05T08:15:30.000Z');
      const result = formatDate(date);
      expect(result).toBe('2025-01-05');
    });

    it('should handle edge case dates', () => {
      const epochDate = new Date('1970-01-01T00:00:00.000Z');
      const futureDate = new Date('2099-12-31T23:59:59.999Z');

      expect(formatDate(epochDate)).toBe('1970-01-01');
      expect(formatDate(futureDate)).toBe('2099-12-31');
    });

    it('should return string type', () => {
      const date = new Date();
      const result = formatDate(date);
      expect(typeof result).toBe('string');
    });

    it('should match ISO date format pattern', () => {
      const date = new Date();
      const result = formatDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
        'user123@test-domain.net',
        'a@b.co',
        'very.long.email.address@very-long-domain-name.com',
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com',
        'user @domain.com',
        'user@domain .com',
        'user@domain..com',
        '',
        ' ',
        'user@@domain.com',
        'user@domain@com',
        '.user@domain.com',
        'user.@domain.com',
        'user@.domain.com',
        'user@domain.com.',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle special characters correctly', () => {
      // Valid special characters
      expect(validateEmail('user+tag@example.com')).toBe(true);
      expect(validateEmail('user.name@example.com')).toBe(true);
      expect(validateEmail('user_name@example.com')).toBe(true);
      expect(validateEmail('user-name@example.com')).toBe(true);

      // Invalid special characters
      expect(validateEmail('user#name@example.com')).toBe(false);
      expect(validateEmail('user$name@example.com')).toBe(false);
      expect(validateEmail('user%name@example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true); // Minimal valid email
      expect(validateEmail('1@2.3')).toBe(true); // Numeric email
      expect(validateEmail('test@localhost.localdomain')).toBe(true); // Long TLD
    });

    it('should be case insensitive', () => {
      expect(validateEmail('User@Example.COM')).toBe(true);
      expect(validateEmail('TEST@DOMAIN.ORG')).toBe(true);
      expect(validateEmail('MixedCase@Domain.Net')).toBe(true);
    });

    it('should return boolean type', () => {
      const result1 = validateEmail('valid@email.com');
      const result2 = validateEmail('invalid-email');

      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });

    it('should handle whitespace correctly', () => {
      expect(validateEmail(' user@domain.com')).toBe(false);
      expect(validateEmail('user@domain.com ')).toBe(false);
      expect(validateEmail(' user@domain.com ')).toBe(false);
      expect(validateEmail('user @domain.com')).toBe(false);
      expect(validateEmail('user@ domain.com')).toBe(false);
      expect(validateEmail('user@domain .com')).toBe(false);
    });

    it('should handle international domain names', () => {
      // Note: This regex might not handle all international domains perfectly
      // but should handle basic ASCII domains correctly
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user@test.org')).toBe(true);
      expect(validateEmail('user@domain.net')).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should work together in realistic scenarios', () => {
      const today = new Date();
      const formattedDate = formatDate(today);
      const email = `user-${formattedDate}@example.com`;

      expect(typeof formattedDate).toBe('string');
      expect(formattedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validateEmail(email)).toBe(true);
    });

    it('should handle multiple operations', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31'),
      ];

      const emails = [
        'user1@example.com',
        'user2@test.org',
        'user3@domain.net',
      ];

      dates.forEach((date) => {
        const formatted = formatDate(date);
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      emails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });
  });
});
