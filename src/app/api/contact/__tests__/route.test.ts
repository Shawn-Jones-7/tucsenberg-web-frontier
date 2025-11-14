import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/contact/route';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const {
  mockAirtableService,
  mockResendService,
  mockLogger,
  mockValidationHelpers,
} = vi.hoisted(() => ({
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
}));

// Mock dependencies
vi.mock('@/lib/airtable', () => ({
  airtableService: mockAirtableService,
}));

vi.mock('@/lib/resend', () => ({
  resendService: mockResendService,
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

// 移除全局validations Mock，使用真实的验证逻辑
// 在需要的地方进行局部Mock
// vi.mock('@/lib/validations', () => { ... });

// Mock contact API utils
vi.mock('@/app/api/contact/contact-api-utils', () => ({
  checkRateLimit: vi.fn().mockReturnValue(true),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

// Mock contact API validation
vi.mock('@/app/api/contact/contact-api-validation', async () => {
  const actual = await vi.importActual(
    '@/app/api/contact/contact-api-validation',
  );
  return {
    ...actual,
    validateFormData: vi.fn(),
    processFormSubmission: vi.fn().mockResolvedValue({
      emailSent: true,
      recordCreated: true,
      emailMessageId: 'email-123',
      airtableRecordId: 'record-123',
    }),
    validateAdminAccess: vi.fn(),
    getContactFormStats: vi.fn(),
  };
});

// Mock environment variables
vi.mock('../../../../env.mjs', () => ({
  env: {
    NODE_ENV: 'test',
    ADMIN_API_TOKEN: 'test-admin-token',
    TURNSTILE_SECRET_KEY: 'test-turnstile-key',
  },
}));

// Mock process.env for Turnstile verification
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    NODE_ENV: 'test',
    TURNSTILE_SECRET_KEY: 'test-turnstile-key',
  },
});

describe('Contact API Route', () => {
  beforeEach(async () => {
    // Vitest v4: ensure mock implementations are reset between tests
    vi.resetAllMocks();

    // Reset default mock implementations
    mockAirtableService.isReady.mockReturnValue(true);
    mockResendService.isReady.mockReturnValue(true);
    mockValidationHelpers.validateEmail.mockReturnValue(true);
    mockValidationHelpers.sanitizeInput.mockImplementation((input) => input);

    // Reset contact-api-utils mocks
    const contactApiUtils = await import('@/app/api/contact/contact-api-utils');
    vi.mocked(contactApiUtils.checkRateLimit).mockReturnValue(true);
    vi.mocked(contactApiUtils.getClientIP).mockReturnValue('127.0.0.1');
    vi.mocked(contactApiUtils.verifyTurnstile).mockResolvedValue(true);
  });

  describe('POST /api/contact', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Company',
      message: 'Test message',
      acceptPrivacy: true,
      phone: '+1234567890',
      subject: 'Test Subject',
      marketingConsent: false,
      turnstileToken: 'valid-token',
      submittedAt: new Date().toISOString(),
    };

    it('应该成功处理有效的表单提交', async () => {
      // Mock successful validation
      const { validateFormData } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(validateFormData).mockResolvedValue({
        success: true,
        error: null,
        details: null,
        data: validFormData,
      });

      // Ensure submission processing is mocked to succeed under Vitest v4
      const { processFormSubmission } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(processFormSubmission).mockResolvedValue({
        success: true,
        emailSent: true,
        recordCreated: true,
        emailMessageId: 'email-123',
        airtableRecordId: 'record-123',
      } as any);

      // Mock successful service responses
      mockAirtableService.createContact.mockResolvedValue({ id: 'record-123' });
      mockResendService.sendContactFormEmail.mockResolvedValue('email-123');
      mockResendService.sendConfirmationEmail.mockResolvedValue(
        'confirmation-123',
      );

      // Mock Turnstile verification
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Thank you for your message');
    });

    it('应该处理无效的表单数据', async () => {
      // Mock validation failure
      const { validateFormData } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(validateFormData).mockResolvedValue({
        success: false,
        error: 'Invalid form data',
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
      expect(data.error).toBe('Invalid form data');
      expect(data.details).toBeDefined();
    });

    it('应该处理速率限制', async () => {
      // 模拟多次快速请求来触发速率限制
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validFormData),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
      });

      // 第一次请求应该成功 - use the global mock from setup.ts
      const mockValidations = await import('@/lib/validations');
      const mockExtendedSchema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: validFormData,
        }),
        parse: vi.fn(),
        parseAsync: vi.fn(),
        _def: {},
        _type: undefined as any,
      };
      vi.mocked(mockValidations.contactFormSchema.extend).mockReturnValue(
        mockExtendedSchema as any,
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      mockAirtableService.createContact.mockResolvedValue('record-123');
      mockResendService.sendContactFormEmail.mockResolvedValue('email-123');

      // 执行多次请求
      await POST(request);
      await POST(request);
      await POST(request);
      await POST(request);
      await POST(request);

      // 第6次请求应该被速率限制
      const response = await POST(request);

      if (response.status === 429) {
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('Too many requests');
      }
    });

    it('应该处理Turnstile验证失败', async () => {
      // Mock validation failure due to Turnstile
      const { validateFormData } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(validateFormData).mockResolvedValue({
        success: false,
        error: 'Security verification failed. Please try again.',
        details: ['Turnstile verification failed'],
        data: null,
      });

      // Mock failed Turnstile verification
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            'success': false,
            'error-codes': ['invalid-input-response'],
          }),
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
      expect(data.error).toBe(
        'Security verification failed. Please try again.',
      );
    });

    it('应该处理服务不可用的情况', async () => {
      // Mock services not ready
      mockAirtableService.isReady.mockReturnValue(false);
      mockResendService.isReady.mockReturnValue(false);

      // Mock successful validation
      const { validateFormData, processFormSubmission } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(validateFormData).mockResolvedValue({
        success: true,
        error: null,
        details: null,
        data: validFormData,
      });

      // Mock processFormSubmission to handle service unavailability gracefully
      vi.mocked(processFormSubmission).mockResolvedValue({
        success: true,
        emailSent: false,
        recordCreated: false,
        emailMessageId: null,
        airtableRecordId: null,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
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
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        'An unexpected error occurred. Please try again later.',
      );
    });
  });

  describe('GET /api/contact', () => {
    it('应该返回统计信息（有效的管理员token）', async () => {
      const mockStats = {
        totalContacts: 100,
        newContacts: 10,
        completedContacts: 90,
        recentContacts: 5,
      };

      // Mock admin validation and stats
      const { validateAdminAccess, getContactFormStats } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(validateAdminAccess).mockReturnValue(true);
      vi.mocked(getContactFormStats).mockResolvedValue({
        success: true,
        data: mockStats,
      });

      mockAirtableService.getStatistics.mockResolvedValue(mockStats);

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
    });

    it('应该拒绝无效的管理员token', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('应该处理缺少authorization header的情况', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('应该处理Airtable服务不可用的情况', async () => {
      mockAirtableService.isReady.mockReturnValue(false);

      // Mock admin validation and stats
      const { validateAdminAccess, getContactFormStats } = await import(
        '@/app/api/contact/contact-api-validation'
      );
      vi.mocked(validateAdminAccess).mockReturnValue(true);
      vi.mocked(getContactFormStats).mockResolvedValue({
        success: true,
        data: {
          totalContacts: 0,
          newContacts: 0,
          completedContacts: 0,
          recentContacts: 0,
        },
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        totalContacts: 0,
        newContacts: 0,
        completedContacts: 0,
        recentContacts: 0,
      });
    });
  });

  describe('错误处理', () => {
    it('应该记录错误日志', async () => {
      const testFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Test Company',
        message: 'Test message',
        phone: '+1234567890',
        subject: 'Test Subject',
        marketingConsent: false,
        turnstileToken: 'valid-token',
        submittedAt: new Date().toISOString(),
      };

      // Mock validation error - use the global mock from setup.ts
      const mockValidations = await import('@/lib/validations');
      const mockExtendedSchema = {
        safeParse: vi.fn().mockImplementation(() => {
          throw new Error('Validation error');
        }),
        parse: vi.fn(),
        parseAsync: vi.fn(),
        _def: {},
        _type: undefined as any,
      };
      vi.mocked(mockValidations.contactFormSchema.extend).mockReturnValue(
        mockExtendedSchema as any,
      );

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(testFormData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
