/**
 * Form Validation Basic Tests
 *
 * 基本表单验证测试，包括：
 * - 邮箱验证
 * - 密码验证
 * - 用户名验证
 * - 年龄验证
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { BoundaryConditionTester } from '@/../tests/error-scenarios/setup';

// 验证常量
const VALIDATION_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  MESSAGE_MIN_LENGTH: 10,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  TEXT_FIELD_MAX_LENGTH: 128,
  LARGE_TEXT_MAX_LENGTH: 1024,
  ARRAY_MIN_LENGTH: 3,
  ARRAY_MAX_LENGTH: 50,
  DECIMAL_PRECISION: 2,
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  RETRY_COUNT: 5,
  TIMEOUT_FACTOR: 0.5,
} as const;

// 密码强度常量
const PASSWORD_STRENGTH = {
  MEDIUM_THRESHOLD: 3,
  STRONG_THRESHOLD: 4,
  STRONG_MIN_LENGTH: 12,
} as const;

// Mock FormValidator class
class FormValidator {
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) return { isValid: false, error: 'Email is required' };
    if (email.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH) {
      return { isValid: false, error: 'Email is too long' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
  }

  validatePassword(password: string): {
    isValid: boolean;
    error?: string;
    strength?: 'weak' | 'medium' | 'strong';
  } {
    if (!password) return { isValid: false, error: 'Password is required' };
    if (password.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
      return { isValid: false, error: 'Password too short' };
    }
    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long' };
    }

    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score >= PASSWORD_STRENGTH.STRONG_THRESHOLD) strength = 'strong';
    else if (score >= PASSWORD_STRENGTH.MEDIUM_THRESHOLD) strength = 'medium';

    return { isValid: true, strength };
  }

  validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username) return { isValid: false, error: 'Username is required' };
    if (username.length < VALIDATION_LIMITS.NAME_MIN_LENGTH) {
      return { isValid: false, error: 'Username too short' };
    }
    if (username.length > VALIDATION_LIMITS.TEXT_FIELD_MAX_LENGTH) {
      return { isValid: false, error: 'Username too long' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { isValid: false, error: 'Invalid username format' };
    }
    return { isValid: true };
  }

  validateAge(age: number): { isValid: boolean; error?: string } {
    if (age < 0) return { isValid: false, error: 'Age cannot be negative' };
    if (age > 150) return { isValid: false, error: 'Age too high' };
    if (!Number.isInteger(age))
      return { isValid: false, error: 'Age must be integer' };
    return { isValid: true };
  }
}

describe('Form Validation Basic Tests', () => {
  let validator: FormValidator;
  let boundaryTester: BoundaryConditionTester;

  beforeEach(() => {
    validator = new FormValidator();
    boundaryTester = new BoundaryConditionTester();
  });

  describe('Email Validation Tests', () => {
    it('should validate normal email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = validator.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user..double.dot@domain.com',
        'user@domain..com',
      ];

      invalidEmails.forEach((email) => {
        const result = validator.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle extremely long email addresses', () => {
      const longEmail = `${boundaryTester.generateLargeString(250)}@example.com`;
      const result = validator.validateEmail(longEmail);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is too long');
    });

    it('should handle special characters in email', () => {
      const specialCharEmail = `${boundaryTester.generateSpecialCharString()}@example.com`;
      const result = validator.validateEmail(specialCharEmail);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });
  });

  describe('Password Validation Tests', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecure@Password2024',
        'Complex#Pass$Word789',
      ];

      strongPasswords.forEach((password) => {
        const result = validator.validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.strength).toBeDefined();
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = ['', '123', 'password', '12345678', 'PASSWORD'];

      weakPasswords.forEach((password) => {
        const result = validator.validatePassword(password);
        if (password.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
          expect(result.isValid).toBe(false);
        } else {
          expect(result.strength).toBe('weak');
        }
      });
    });

    it('should handle extremely long passwords', () => {
      const longPassword = boundaryTester.generateLargeString(200);
      const result = validator.validatePassword(longPassword);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is too long');
    });

    it('should handle unicode characters in passwords', () => {
      const unicodePassword = `${boundaryTester.generateUnicodeString()}123!`;
      const result = validator.validatePassword(unicodePassword);

      expect(result.isValid).toBe(true);
      expect(result.strength).toBeDefined();
    });
  });

  describe('Username Validation Tests', () => {
    it('should validate normal usernames', () => {
      const validUsernames = ['user123', 'test_user', 'john-doe', 'admin'];

      validUsernames.forEach((username) => {
        const result = validator.validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        '',
        'a',
        'user@domain',
        'user space',
        'user#123',
      ];

      invalidUsernames.forEach((username) => {
        const result = validator.validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle extremely long usernames', () => {
      const longUsername = boundaryTester.generateLargeString(200);
      const result = validator.validateUsername(longUsername);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username too long');
    });

    it('should handle special characters in usernames', () => {
      const specialCharUsername = boundaryTester.generateSpecialCharString();
      const result = validator.validateUsername(specialCharUsername);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid username format');
    });
  });

  describe('Age Validation Tests', () => {
    it('should validate normal ages', () => {
      const validAges = [18, 25, 35, 65, 100];

      validAges.forEach((age) => {
        const result = validator.validateAge(age);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid ages', () => {
      const invalidAges = [-1, -10, 200, 999];

      invalidAges.forEach((age) => {
        const result = validator.validateAge(age);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle decimal ages', () => {
      const decimalAge = 25.5;
      const result = validator.validateAge(decimalAge);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Age must be integer');
    });

    it('should handle boundary ages', () => {
      const boundaryAges = [0, 1, 149, 150];

      boundaryAges.forEach((age) => {
        const result = validator.validateAge(age);
        if (age <= 150) {
          expect(result.isValid).toBe(true);
        } else {
          expect(result.isValid).toBe(false);
        }
      });
    });
  });
});
