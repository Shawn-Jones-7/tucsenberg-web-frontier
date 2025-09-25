/**
 * Contact API Route - POST Tests
 *
 * 专门测试POST /api/contact端点，包括：
 * - 表单数据验证
 * - Turnstile安全验证
 * - 速率限制处理
 * - 服务集成测试
 * - 错误处理场景
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/contact/route';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const {
  mockAirtableService,
  mockResendService,
  mockLogger,
  mockValidationHelpers,
  mockSafeParse,
  mockExtendedSchema,
  mockCheckRateLimit,
  mockGetClientIP,
  mockVerifyTurnstile,
  mockValidateFormData,
  mockProcessFormSubmission,
} = vi.hoisted(() => {
  const hoistedMockSafeParse = vi.fn().mockReturnValue({
    success: true,
    data: {},
  });

  const hoistedMockExtendedSchema = {
    safeParse: hoistedMockSafeParse,
    extend: vi.fn().mockReturnValue({
      safeParse: hoistedMockSafeParse,
    }),
  };

  return {
    mockAirtableService: {
      isReady: vi.fn(),
      createContact: vi.fn(),
      getStatistics: vi.fn(),
    },
    mockResendService: {
      isReady: vi.fn(),
      sendContactFormEmail: vi.fn(),
      sendConfirmationEmail: vi.fn(),
    },
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    mockValidationHelpers: {
      validateEmail: vi.fn(),
      sanitizeInput: vi.fn(),
    },
    mockSafeParse: hoistedMockSafeParse,
    mockExtendedSchema: hoistedMockExtendedSchema,
    mockCheckRateLimit: vi.fn(() => true),
    mockGetClientIP: vi.fn(() => '127.0.0.1'),
    mockVerifyTurnstile: vi.fn(() => Promise.resolve(true)),
    mockValidateFormData: vi.fn(),
    mockProcessFormSubmission: vi.fn(),
  };
});

// Mock外部依赖
vi.mock('@/lib/airtable', () => ({
  airtableService: mockAirtableService,
}));

vi.mock('@/lib/resend', () => ({
  resendService: mockResendService,
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

vi.mock('@/lib/validation-helpers', () => mockValidationHelpers);

// Mock contact API utils
vi.mock('@/app/api/contact/contact-api-utils', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIP: mockGetClientIP,
  verifyTurnstile: mockVerifyTurnstile,
}));

// Mock contact API validation
vi.mock('@/app/api/contact/contact-api-validation', () => ({
  validateFormData: mockValidateFormData,
  processFormSubmission: mockProcessFormSubmission,
  validateAdminAccess: vi.fn(),
  getContactFormStats: vi.fn(),
}));

vi.mock('zod', () => ({
  z: {
    object: vi.fn().mockReturnValue(mockExtendedSchema),
    string: vi.fn(() => {
      const mockString = {
        min: vi.fn(() => mockString),
        max: vi.fn(() => mockString),
        email: vi.fn(() => mockString),
        regex: vi.fn(() => mockString),
        optional: vi.fn(() => mockString),
        refine: vi.fn(() => mockString),
        transform: vi.fn(() => mockString),
        default: vi.fn(() => mockString),
      };
      return mockString;
    }),
    boolean: vi.fn(() => {
      const mockBoolean = {
        optional: vi.fn(() => mockBoolean),
        refine: vi.fn(() => mockBoolean),
        default: vi.fn(() => mockBoolean),
      };
      return mockBoolean;
    }),
    date: vi.fn().mockReturnValue({
      optional: vi.fn().mockReturnThis(),
    }),
    unknown: vi.fn(() => {
      const mockUnknown = {
        optional: vi.fn(() => mockUnknown),
        refine: vi.fn(() => mockUnknown),
        default: vi.fn(() => mockUnknown),
      };
      return mockUnknown;
    }),
    enum: vi.fn(() => {
      const mockEnum = {
        optional: vi.fn(() => mockEnum),
        default: vi.fn(() => mockEnum),
        refine: vi.fn(() => mockEnum),
      };
      return mockEnum;
    }),
  },
}));

// Mock环境变量
Object.defineProperty(process, 'env', {
  value: {
    ADMIN_TOKEN: 'test-admin-token',
    TURNSTILE_SECRET_KEY: 'test-turnstile-key',
  },
  configurable: true,
});

describe('Contact API Route - POST Tests', () => {
  const validFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Test Company',
    phone: '+1234567890',
    message: 'Test message',
    preferredContact: 'email' as const,
    marketingConsent: false,
    turnstileToken: 'valid-token',
    submittedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default mock implementations
    mockAirtableService.isReady.mockReturnValue(true);
    mockResendService.isReady.mockReturnValue(true);
    mockAirtableService.createContact.mockResolvedValue({ id: 'test-id' });
    mockResendService.sendContactFormEmail.mockResolvedValue({
      id: 'email-id',
    });
    mockResendService.sendConfirmationEmail.mockResolvedValue({
      id: 'confirm-id',
    });
    mockValidationHelpers.validateEmail.mockReturnValue(true);
    mockValidationHelpers.sanitizeInput.mockImplementation((input) => input);

    // Setup API utils mocks
    mockCheckRateLimit.mockReturnValue(true);
    mockGetClientIP.mockReturnValue('127.0.0.1');
    mockVerifyTurnstile.mockResolvedValue(true);

    // Setup validation mocks
    mockValidateFormData.mockResolvedValue({
      success: true,
      data: validFormData,
      error: null,
      details: null,
    });

    mockProcessFormSubmission.mockResolvedValue({
      emailSent: true,
      recordCreated: true,
      emailMessageId: 'test-email-id',
      airtableRecordId: 'test-record-id',
    });

    // Mock fetch for Turnstile verification
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('表单数据验证', () => {
    it('应该成功处理有效的表单提交', async () => {
      // Mock successful validation
      mockSafeParse.mockReturnValue({
        success: true,
        data: validFormData,
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Thank you');
    });

    it('应该处理无效的表单数据', async () => {
      // Mock validation failure
      mockValidateFormData.mockResolvedValue({
        success: false,
        error: 'Validation failed',
        details: ['email: Invalid email'],
        data: null,
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid-email' }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('应该处理JSON解析错误', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        'An unexpected error occurred. Please try again later.',
      );
    });
  });

  describe('Turnstile安全验证', () => {
    it('应该处理Turnstile验证失败', async () => {
      // Mock validation failure due to Turnstile
      mockValidateFormData.mockResolvedValue({
        success: false,
        error: 'Security verification failed',
        details: ['Please complete the security check'],
        data: null,
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Security verification failed');
    });

    it('应该处理Turnstile服务不可用', async () => {
      // Mock validation throwing an error (simulating service unavailable)
      mockValidateFormData.mockRejectedValue(new Error('Service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        'An unexpected error occurred. Please try again later.',
      );
    });
  });

  describe('服务集成测试', () => {
    it('应该处理服务不可用的情况', async () => {
      // Mock services not ready
      mockAirtableService.isReady.mockReturnValue(false);
      mockResendService.isReady.mockReturnValue(false);

      // Mock successful validation
      mockSafeParse.mockReturnValue({
        success: true,
        data: validFormData,
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // 应该仍然成功，但没有调用外部服务
      expect(mockAirtableService.createContact).not.toHaveBeenCalled();
      expect(mockResendService.sendContactFormEmail).not.toHaveBeenCalled();
    });

    it('应该处理Airtable服务错误', async () => {
      // Mock successful validation but Airtable error in processing
      mockProcessFormSubmission.mockResolvedValue({
        emailSent: true,
        recordCreated: false, // Airtable failed
        emailMessageId: 'test-email-id',
        airtableRecordId: null,
      });

      // Expect error to be logged
      mockLogger.error.mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still succeed despite Airtable error
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: Error logging happens inside processFormSubmission which is mocked
    });

    it('应该处理Resend服务错误', async () => {
      // Mock successful validation but Resend error in processing
      mockProcessFormSubmission.mockResolvedValue({
        emailSent: false, // Resend failed
        recordCreated: true,
        emailMessageId: null,
        airtableRecordId: 'test-record-id',
      });

      // Expect error to be logged
      mockLogger.error.mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still succeed despite Resend error
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: Error logging happens inside processFormSubmission which is mocked
    });
  });
});
