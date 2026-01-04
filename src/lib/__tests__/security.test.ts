import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateFileUpload } from '@/lib/security-file-upload';
import { checkSecurityConfig } from '@/lib/security-headers';
import { rateLimit } from '@/lib/security-rate-limit';
import { generateSecureToken } from '@/lib/security-tokens';
import {
  isValidEmail,
  isValidUrl,
  sanitizeInput,
} from '@/lib/security-validation';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script',
      );
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeInput('onclick=alert("xss")')).toBe('alert("xss")');
      expect(
        sanitizeInput('data:text/html,<script>alert("xss")</script>'),
      ).toBe('text/html,scriptalert("xss")/script');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('');
      expect(sanitizeInput(undefined as unknown as string)).toBe('');
      expect(sanitizeInput(123 as unknown as string)).toBe('');
    });

    it('should preserve safe content', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
      expect(sanitizeInput('Some text with spaces')).toBe(
        'Some text with spaces',
      );
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert("xss")')).toBe(false);
    });

    it('should respect allowed protocols', () => {
      expect(isValidUrl('ftp://example.com', ['ftp:'])).toBe(true);
      expect(isValidUrl('https://example.com', ['http:'])).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate tokens of correct length', () => {
      expect(generateSecureToken(16)).toHaveLength(16);
      expect(generateSecureToken(32)).toHaveLength(32);
      expect(generateSecureToken(64)).toHaveLength(64);
    });

    it('should generate different tokens', () => {
      const token1 = generateSecureToken(32);
      const token2 = generateSecureToken(32);
      expect(token1).not.toBe(token2);
    });

    it('should use default length', () => {
      expect(generateSecureToken()).toHaveLength(32);
    });
  });

  describe('rateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store before each test
      vi.clearAllMocks();
    });

    it('should allow requests within limit', () => {
      expect(rateLimit('test-user', 5, 60000)).toBe(true);
      expect(rateLimit('test-user', 5, 60000)).toBe(true);
      expect(rateLimit('test-user', 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      // Make 5 requests (should all pass)
      for (let i = 0; i < 5; i++) {
        expect(rateLimit('test-user-2', 5, 60000)).toBe(true);
      }

      // 6th request should be blocked
      expect(rateLimit('test-user-2', 5, 60000)).toBe(false);
    });

    it('should handle different identifiers separately', () => {
      expect(rateLimit('user1', 2, 60000)).toBe(true);
      expect(rateLimit('user2', 2, 60000)).toBe(true);
      expect(rateLimit('user1', 2, 60000)).toBe(true);
      expect(rateLimit('user2', 2, 60000)).toBe(true);
    });
  });

  describe('validateFileUpload', () => {
    it('should accept valid files', () => {
      const validFile = new File(['content'], 'test.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFileUpload(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFileUpload(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('size exceeds');
    });

    it('should reject dangerous file types', () => {
      const dangerousFile = new File(['content'], 'malware.exe', {
        type: 'application/octet-stream',
      });
      const result = validateFileUpload(dangerousFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('is not allowed');
    });

    it('should reject dangerous file extensions', () => {
      const dangerousFile = new File(['content'], 'script.js', {
        type: 'text/plain',
      });
      const result = validateFileUpload(dangerousFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('is not allowed');
    });
  });

  describe('checkSecurityConfig', () => {
    it('should identify missing configuration in production', () => {
      // Mock production environment
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('TURNSTILE_SECRET_KEY', '');
      vi.stubEnv('SENTRY_DSN', '');

      const result = checkSecurityConfig(true);
      expect(result.configured).toBe(false);
      expect(result.issues).toContain(
        'Turnstile secret key not configured in production',
      );
    });

    it('should pass in development environment', () => {
      // Mock development environment
      vi.stubEnv('NODE_ENV', 'development');

      const result = checkSecurityConfig(true);
      expect(result.configured).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should identify relaxed security mode in production', () => {
      // Mock production with relaxed security
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_SECURITY_MODE', 'relaxed');

      const result = checkSecurityConfig(true);
      expect(result.configured).toBe(false);
      expect(result.issues).toContain(
        'Security mode is set to relaxed in production',
      );
    });
  });
});
