/**
 * Airtable Service - Create Operations Tests
 *
 * 专门测试创建操作功能，包括：
 * - 创建联系人记录
 * - 可选字段处理
 * - 错误处理
 * - 空数据处理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AirtableBaseLike,
  AirtableServicePrivate,
  DynamicImportModule,
} from '@/types/test-types';
import type { AirtableService as AirtableServiceType } from '../airtable/service';
import {
  configureServiceForTesting,
  createMockBase,
} from './airtable/test-helpers';

// Mock Airtable
const mockCreate = vi.fn();
const mockSelectAll = vi.fn();
const mockSelect = vi.fn().mockReturnValue({
  all: mockSelectAll,
  firstPage: vi.fn(),
});
const mockUpdate = vi.fn();
const mockDestroy = vi.fn();

// Mock record with get method
const createMockRecord = (data: Record<string, unknown>) => ({
  id: data.id || 'rec123456',
  fields: data.fields || {},
  createdTime: data.createdTime || '2023-01-01T00:00:00Z',
  get: vi.fn((field: string) => {
    if (field === 'Created Time') return data.createdTime || '2023-01-01T00:00:00Z';
    return (data.fields as Record<string, unknown>)?.[field];
  }),
});

const mockTable = vi.fn().mockReturnValue({
  create: mockCreate,
  select: mockSelect,
  update: mockUpdate,
  destroy: mockDestroy,
});

const tableFactory: AirtableBaseLike['table'] = (_name) => {
  // Parameter renamed with underscore to indicate it's intentionally unused
  return mockTable() as ReturnType<AirtableBaseLike['table']>;
};

const mockBase = vi.fn(() => createMockBase(tableFactory));
const mockConfigure = vi.fn();

const setServiceReady = (service: unknown) =>
  configureServiceForTesting(service, createMockBase(tableFactory));

vi.mock('airtable', () => ({
  default: {
    configure: mockConfigure,
    base: mockBase,
  },
}));

// Use TypeScript Mock modules to bypass Vite's special handling
vi.mock('@/../env.mjs', async () => {
  const mockEnv = await import('./mocks/airtable-env');
  return mockEnv;
});

vi.mock('./logger', async () => {
  const mockLogger = await import('./mocks/logger');
  return mockLogger;
});

vi.mock('./validations', async () => {
  const mockValidations = await import('./mocks/airtable-validations');
  return mockValidations;
});

describe('Airtable Service - Create Operations Tests', () => {
  let AirtableServiceClass: typeof AirtableServiceType;

  beforeEach(async () => {
    // Clear mocks but preserve the mock functions
    mockCreate.mockReset();
    mockSelectAll.mockReset();
    mockSelect.mockReset().mockReturnValue({
      all: mockSelectAll,
      firstPage: vi.fn(),
    });
    mockUpdate.mockReset();
    mockDestroy.mockReset();
    mockTable.mockClear().mockReturnValue({
      create: mockCreate,
      select: mockSelect,
      update: mockUpdate,
      destroy: mockDestroy,
    });
    mockBase.mockClear();
    mockConfigure.mockClear();

    // Dynamically import the module to ensure fresh instance
    const module = (await import('../airtable')) as DynamicImportModule;
    AirtableServiceClass = module.AirtableService as typeof AirtableServiceType;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const validFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Test Company',
    message: 'This is a test message',
    acceptPrivacy: true,
    website: '',
  };

  describe('创建联系人记录', () => {
    it('should create contact record successfully', async () => {
      const service = new AirtableServiceClass();

      // Override service configuration to make it ready
      setServiceReady(service);

      // Mock successful creation
      const mockRecordData = {
        id: 'rec123456',
        fields: {
          'First Name': 'John',
          'Last Name': 'Doe',
          'Email': 'john.doe@example.com',
          'Company': 'Test Company',
          'Message': 'This is a test message',
          'Accept Privacy': true,
        },
        createdTime: '2023-01-01T00:00:00Z',
      };
      mockCreate.mockResolvedValue([createMockRecord(mockRecordData)]);

      const result = await service.createContact(validFormData);

      expect(result).toEqual({
        id: 'rec123456',
        fields: mockRecordData.fields,
        createdTime: '2023-01-01T00:00:00Z',
      });
      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: expect.objectContaining({
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@example.com',
            'Company': 'Test Company',
            'Message': 'This is a test message',
            'Marketing Consent': false,
            'Phone': '',
            'Subject': '',
            'Status': 'New',
            'Source': 'Website Contact Form',
            'Submitted At': expect.any(String),
          }),
        },
      ]);
    });

    it('should include optional fields when provided', async () => {
      const service = new AirtableServiceClass();

      // Override service configuration to make it ready
      setServiceReady(service);

      const formDataWithOptionals = {
        ...validFormData,
        phone: '+1234567890',
        website: 'https://example.com',
      };

      const mockRecordDataWithOptionals = {
        id: 'rec123456',
        fields: formDataWithOptionals,
        createdTime: '2023-01-01T00:00:00Z',
      };
      mockCreate.mockResolvedValue([createMockRecord(mockRecordDataWithOptionals)]);

      await service.createContact(formDataWithOptionals);

      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: expect.objectContaining({
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@example.com',
            'Company': 'Test Company',
            'Message': 'This is a test message',
            'Marketing Consent': false,
            'Phone': '+1234567890',
            'Subject': '',
            'Status': 'New',
            'Source': 'Website Contact Form',
            'Submitted At': expect.any(String),
          }),
        },
      ]);
    });

    it('should throw error when service is not configured', async () => {
      const service = new AirtableServiceClass();

      // Explicitly ensure service is not configured and stays that way
      (service as unknown as AirtableServicePrivate).isConfigured = false;
      (service as unknown as AirtableServicePrivate).base = null;

      // Mock ensureReady to do nothing (prevent auto-configuration)
      vi.spyOn(service as any, 'ensureReady').mockImplementation(async () => {
        // Do nothing - prevent initialization
      });

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Airtable service is not configured',
      );
    });

    it('should handle creation errors gracefully', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      mockCreate.mockRejectedValue(new Error('Creation failed'));

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Failed to create contact record',
      );
    });

    it('should handle empty form data', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const emptyFormData = {
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        message: '',
        acceptPrivacy: false,
        website: '',
      };

      // Empty email should cause validation error
      await expect(service.createContact(emptyFormData)).rejects.toThrow(
        'Failed to create contact record',
      );
    });

    it('should handle special characters in form data', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const specialFormData = {
        firstName: 'José',
        lastName: 'García-López',
        email: 'jose.garcia@example.com', // Use valid email format
        company: 'Test & Co.',
        message: 'Message with "quotes" and special chars: @#$%',
        acceptPrivacy: true,
        website: 'https://example.com/path?param=value&other=test',
      };

      const mockRecordDataSpecial = {
        id: 'rec123456',
        fields: specialFormData,
        createdTime: '2023-01-01T00:00:00Z',
      };
      mockCreate.mockResolvedValue([createMockRecord(mockRecordDataSpecial)]);

      const result = await service.createContact(specialFormData);

      expect(result).toEqual({
        id: 'rec123456',
        fields: mockRecordDataSpecial.fields,
        createdTime: '2023-01-01T00:00:00Z',
      });
      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: expect.objectContaining({
            'First Name': 'José',
            'Last Name': 'García-López',
            'Email': 'jose.garcia@example.com',
            'Company': 'Test & Co.',
            'Message': 'Message with "quotes" and special chars: @#$%',
            'Marketing Consent': false,
            'Phone': '',
            'Subject': '',
            'Status': 'New',
            'Source': 'Website Contact Form',
            'Submitted At': expect.any(String),
          }),
        },
      ]);
    });

    it('should handle long text content', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const longMessage = 'A'.repeat(1000); // Very long message
      const longFormData = {
        ...validFormData,
        message: longMessage,
      };

      const mockRecordDataLong = {
        id: 'rec123456',
        fields: longFormData,
        createdTime: '2023-01-01T00:00:00Z',
      };
      mockCreate.mockResolvedValue([createMockRecord(mockRecordDataLong)]);

      const result = await service.createContact(longFormData);

      expect(result).toEqual({
        id: 'rec123456',
        fields: mockRecordDataLong.fields,
        createdTime: '2023-01-01T00:00:00Z',
      });
      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: expect.objectContaining({
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@example.com',
            'Company': 'Test Company',
            'Message': longMessage,
            'Marketing Consent': false,
            'Phone': '',
            'Subject': '',
            'Status': 'New',
            'Source': 'Website Contact Form',
            'Submitted At': expect.any(String),
          }),
        },
      ]);
    });

    it('should handle network timeout errors', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockCreate.mockRejectedValue(timeoutError);

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Failed to create contact record',
      );
    });

    it('should handle rate limiting errors', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Failed to create contact record',
      );
    });
  });
});
