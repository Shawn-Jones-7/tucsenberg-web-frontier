/**
 * Form Validation and Boundary Condition Tests
 *
 * 全面测试表单验证和边界条件处理，包括：
 * - 输入验证边界条件
 * - 恶意输入防护
 * - 数据类型边界测试
 * - 安全性验证
 * - 性能边界测试
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

// 文件大小常量
const FILE_SIZE_LIMITS = {
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,
  MAX_FILE_SIZE_MB: 10,
  SMALL_FILE_SIZE_KB: 500,
  LARGE_FILE_SIZE_MB: 15,
  TINY_FILE_SIZE: 1024,
} as const;

// 密码强度常量
const PASSWORD_STRENGTH = {
  MEDIUM_THRESHOLD: 3,
  STRONG_THRESHOLD: 4,
  STRONG_MIN_LENGTH: 12,
} as const;

// 内容长度常量
const CONTENT_LIMITS = {
  MAX_CONTENT_LENGTH: 10000,
} as const;

// 用户名常量
const USERNAME_LIMITS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
} as const;

// 年龄常量
const AGE_LIMITS = {
  MIN_AGE: 0,
  MAX_REALISTIC_AGE: 150,
} as const;

// 模拟表单验证器
class FormValidator {
  // 验证邮箱格式
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    if (email.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH) {
      return { isValid: false, error: 'Email is too long' };
    }

    // 邮箱验证，使用安全的正则表达式避免ReDoS攻击
    // 使用更简单的模式避免嵌套量词
    const emailRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // 检查连续点号
    if (email.includes('..')) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  // 验证密码强度
  validatePassword(password: string): {
    isValid: boolean;
    error?: string;
    strength?: string;
  } {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters',
      };
    }

    if (password.length > VALIDATION_LIMITS.TEXT_FIELD_MAX_LENGTH) {
      return { isValid: false, error: 'Password is too long' };
    }

    // Check for common patterns
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthScore = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    let strength = 'weak';
    if (strengthScore >= PASSWORD_STRENGTH.MEDIUM_THRESHOLD)
      strength = 'medium';
    if (
      strengthScore === PASSWORD_STRENGTH.STRONG_THRESHOLD &&
      password.length >= PASSWORD_STRENGTH.STRONG_MIN_LENGTH
    )
      strength = 'strong';

    return { isValid: true, strength };
  }

  // 验证用户名
  validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username) {
      return { isValid: false, error: 'Username is required' };
    }

    if (username.length < USERNAME_LIMITS.MIN_LENGTH) {
      return {
        isValid: false,
        error: 'Username must be at least 3 characters',
      };
    }

    if (username.length > USERNAME_LIMITS.MAX_LENGTH) {
      return { isValid: false, error: 'Username is too long' };
    }

    // Only allow alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, and underscores',
      };
    }

    return { isValid: true };
  }

  // 验证年龄
  validateAge(age: number): { isValid: boolean; error?: string } {
    if (age === null || age === undefined || isNaN(age)) {
      return { isValid: false, error: 'Age is required' };
    }

    if (age < 0) {
      return { isValid: false, error: 'Age cannot be negative' };
    }

    if (age > AGE_LIMITS.MAX_REALISTIC_AGE) {
      return { isValid: false, error: 'Age seems unrealistic' };
    }

    if (!Number.isInteger(age)) {
      return { isValid: false, error: 'Age must be a whole number' };
    }

    return { isValid: true };
  }

  // 验证文本内容（防XSS）
  validateTextContent(content: string): {
    isValid: boolean;
    error?: string;
    sanitized?: string;
  } {
    if (!content) {
      return { isValid: false, error: 'Content is required' };
    }

    if (content.length > CONTENT_LIMITS.MAX_CONTENT_LENGTH) {
      return { isValid: false, error: 'Content is too long' };
    }

    // Check for potential XSS patterns using safe regex patterns
    const xssPatterns = [
      /<script[\s\S]{0,1000}?<\/script>/gi,
      /javascript:/gi,
      /on\w{1,20}\s*=/gi,
      /<iframe[\s\S]{0,1000}?<\/iframe>/gi,
    ];

    let hasXSS = false;
    for (const pattern of xssPatterns) {
      if (pattern.test(content)) {
        hasXSS = true;
        break;
      }
    }

    if (hasXSS) {
      return {
        isValid: false,
        error: 'Content contains potentially dangerous code',
      };
    }

    // Basic sanitization
    const sanitized = content
      .replace(/&/g, '&amp;') // 必须先处理&字符
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return { isValid: true, sanitized };
  }

  // 验证文件上传
  validateFileUpload(file: { name: string; size: number; type: string }): {
    isValid: boolean;
    error?: string;
  } {
    if (!file) {
      return { isValid: false, error: 'File is required' };
    }

    // Check file size (10MB limit)
    const maxSize =
      FILE_SIZE_LIMITS.MAX_FILE_SIZE_MB * FILE_SIZE_LIMITS.BYTES_PER_MB;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check for dangerous file types first (by MIME type)
    const dangerousTypes = [
      'application/x-msdownload',
      'application/javascript',
      'application/x-bat',
      'application/x-executable',
      'application/x-sh',
      'text/x-shellscript',
    ];

    if (dangerousTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type is dangerous and not allowed',
      };
    }

    // Check file name extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js'];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File type is dangerous and not allowed',
      };
    }

    // Check allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    return { isValid: true };
  }
}

describe('Form Validation and Boundary Condition Tests', () => {
  let validator: FormValidator;
  let boundaryTester: BoundaryConditionTester;

  beforeEach(() => {
    validator = new FormValidator();
    boundaryTester = new BoundaryConditionTester();
  });

  describe('Email Validation Boundary Tests', () => {
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

  describe('Password Validation Boundary Tests', () => {
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
    });
  });

  describe('Username Validation Boundary Tests', () => {
    it('should validate normal usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'username',
        'User_Name_123',
      ];

      validUsernames.forEach((username) => {
        const result = validator.validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        '',
        'ab',
        'user-name',
        'user@name',
        'user name',
        'user.name',
      ];

      invalidUsernames.forEach((username) => {
        const result = validator.validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle extremely long usernames', () => {
      const longUsername = boundaryTester.generateLargeString(50);
      const result = validator.validateUsername(longUsername);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is too long');
    });

    it('should handle special characters in usernames', () => {
      // 使用较短的特殊字符字符串，确保触发字符验证而不是长度验证
      const specialCharUsername = 'user@#$';
      const result = validator.validateUsername(specialCharUsername);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Username can only contain letters, numbers, and underscores',
      );
    });
  });

  describe('Age Validation Boundary Tests', () => {
    it('should validate normal ages', () => {
      const validAges = [0, 1, 18, 25, 65, 100, 120];

      validAges.forEach((age) => {
        const result = validator.validateAge(age);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid ages', () => {
      const invalidAges = [
        -1,
        -100,
        200,
        1000,
        1.5,
        3.14,
        NaN,
        Infinity,
        -Infinity,
      ];

      invalidAges.forEach((age) => {
        const result = validator.validateAge(age);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle boundary values', () => {
      const boundaryValues = [
        { age: boundaryTester.generateLargeNumber(), expected: false },
        { age: boundaryTester.generateNegativeNumber(), expected: false },
        { age: AGE_LIMITS.MIN_AGE, expected: true },
        { age: AGE_LIMITS.MAX_REALISTIC_AGE, expected: true },
        { age: AGE_LIMITS.MAX_REALISTIC_AGE + 1, expected: false },
      ];

      boundaryValues.forEach(({ age, expected }) => {
        const result = validator.validateAge(age);
        expect(result.isValid).toBe(expected);
      });
    });
  });

  describe('Content Validation and XSS Prevention', () => {
    it('should validate normal text content', () => {
      const validContent = [
        'This is normal text content.',
        'Content with numbers 123 and symbols !@#',
        boundaryTester.generateUnicodeString(),
      ];

      validContent.forEach((content) => {
        const result = validator.validateTextContent(content);
        expect(result.isValid).toBe(true);
        expect(result.sanitized).toBeDefined();
      });
    });

    it('should detect and reject XSS attempts', () => {
      const xssAttempts = [
        boundaryTester.generateXSSString(),
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<img onerror="alert(\'xss\')" src="invalid">',
        '<div onclick="alert(\'xss\')">Click me</div>',
      ];

      xssAttempts.forEach((content) => {
        const result = validator.validateTextContent(content);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          'Content contains potentially dangerous code',
        );
      });
    });

    it('should handle extremely long content', () => {
      const longContent = boundaryTester.generateLargeString(15000);
      const result = validator.validateTextContent(longContent);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Content is too long');
    });

    it('should properly sanitize content', () => {
      const unsafeContent = '<div>Hello "world" & \'test\'</div>';
      const result = validator.validateTextContent(unsafeContent);

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe(
        '&lt;div&gt;Hello &quot;world&quot; &amp; &#x27;test&#x27;&lt;/div&gt;',
      );
    });
  });

  describe('File Upload Validation Boundary Tests', () => {
    it('should validate normal file uploads', () => {
      const validFiles = [
        {
          name: 'image.jpg',
          size: FILE_SIZE_LIMITS.BYTES_PER_MB,
          type: 'image/jpeg',
        },
        {
          name: 'document.pdf',
          size: 2 * FILE_SIZE_LIMITS.BYTES_PER_MB,
          type: 'application/pdf',
        },
        {
          name: 'photo.png',
          size:
            FILE_SIZE_LIMITS.SMALL_FILE_SIZE_KB * FILE_SIZE_LIMITS.BYTES_PER_KB,
          type: 'image/png',
        },
      ];

      validFiles.forEach((file) => {
        const result = validator.validateFileUpload(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject files that are too large', () => {
      const largeFile = {
        name: 'large-file.jpg',
        size:
          FILE_SIZE_LIMITS.LARGE_FILE_SIZE_MB * FILE_SIZE_LIMITS.BYTES_PER_MB, // 15MB
        type: 'image/jpeg',
      };

      const result = validator.validateFileUpload(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size exceeds 10MB limit');
    });

    it('should reject dangerous file types', () => {
      const dangerousFiles = [
        {
          name: 'virus.exe',
          size: FILE_SIZE_LIMITS.TINY_FILE_SIZE,
          type: 'application/x-msdownload',
        },
        {
          name: 'script.js',
          size: FILE_SIZE_LIMITS.TINY_FILE_SIZE,
          type: 'application/javascript',
        },
        {
          name: 'batch.bat',
          size: FILE_SIZE_LIMITS.TINY_FILE_SIZE,
          type: 'application/x-bat',
        },
      ];

      dangerousFiles.forEach((file) => {
        const result = validator.validateFileUpload(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('dangerous');
      });
    });

    it('should reject unsupported file types', () => {
      const unsupportedFile = {
        name: 'document.docx',
        size: FILE_SIZE_LIMITS.BYTES_PER_MB,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const result = validator.validateFileUpload(unsupportedFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File type not allowed');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should detect SQL injection attempts in text fields', () => {
      const sqlInjectionAttempts = [
        boundaryTester.generateSQLInjectionString(),
        "1' OR '1'='1",
        "'; DELETE FROM users; --",
        '1; DROP TABLE users; --',
        "' UNION SELECT * FROM passwords --",
      ];

      sqlInjectionAttempts.forEach((attempt) => {
        // In a real application, this would be handled by parameterized queries
        // Here we test that the content validator catches dangerous patterns
        const result = validator.validateTextContent(attempt);

        // The content should be sanitized, making SQL injection ineffective
        expect(result.sanitized).not.toContain("'");
        expect(result.sanitized).not.toContain('"');
      });
    });
  });

  describe('Performance Boundary Tests', () => {
    it('should handle validation performance under load', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        validator.validateEmail(`user${i}@example.com`);
        validator.validatePassword(`Password${i}!`);
        validator.validateUsername(`user${i}`);
        validator.validateAge(i % 100);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1000 validations in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle memory usage with large inputs', () => {
      const largeInputs = Array.from(
        { length: 100 },
        (_, i) => boundaryTester.generateLargeString(1000) + i,
      );

      largeInputs.forEach((input) => {
        const result = validator.validateTextContent(input);
        // Should handle large inputs without memory issues
        expect(result).toBeDefined();
      });
    });
  });
});
