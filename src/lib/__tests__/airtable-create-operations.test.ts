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
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDestroy = vi.fn();
const mockTable = vi.fn().mockReturnValue({
  create: mockCreate,
  select: mockSelect,
  update: mockUpdate,
  destroy: mockDestroy,
});

const tableFactory: AirtableBaseLike['table'] = (name) => {
  void name;
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
    mockSelect.mockReset();
    mockUpdate.mockReset();
    mockDestroy.mockReset();
    mockTable.mockClear();
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
      mockCreate.mockResolvedValue([
        {
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
        },
      ]);

      const result = await service.createContact(validFormData);

      expect(result).toEqual({ id: 'rec123456' });
      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: {
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@example.com',
            'Company': 'Test Company',
            'Message': 'This is a test message',
            'Accept Privacy': true,
            'Website': '',
          },
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

      mockCreate.mockResolvedValue([
        {
          id: 'rec123456',
          fields: formDataWithOptionals,
          createdTime: '2023-01-01T00:00:00Z',
        },
      ]);

      await service.createContact(formDataWithOptionals);

      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: {
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@example.com',
            'Company': 'Test Company',
            'Message': 'This is a test message',
            'Accept Privacy': true,
            'Phone': '+1234567890',
            'Website': 'https://example.com',
          },
        },
      ]);
    });

    it('should throw error when service is not configured', async () => {
      const service = new AirtableServiceClass();

      // Ensure service is not configured
      (service as unknown as AirtableServicePrivate).isConfigured = false;
      (service as unknown as AirtableServicePrivate).base = null;

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Airtable service is not configured',
      );
    });

    it('should handle creation errors gracefully', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      mockCreate.mockRejectedValue(new Error('Creation failed'));

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Creation failed',
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

      mockCreate.mockResolvedValue([
        {
          id: 'rec123456',
          fields: emptyFormData,
          createdTime: '2023-01-01T00:00:00Z',
        },
      ]);

      const result = await service.createContact(emptyFormData);

      expect(result).toEqual({ id: 'rec123456' });
    });

    it('should handle special characters in form data', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const specialFormData = {
        firstName: 'José',
        lastName: 'García-López',
        email: 'josé@example.com',
        company: 'Test & Co.',
        message: 'Message with "quotes" and special chars: @#$%',
        acceptPrivacy: true,
        website: 'https://example.com/path?param=value&other=test',
      };

      mockCreate.mockResolvedValue([
        {
          id: 'rec123456',
          fields: specialFormData,
          createdTime: '2023-01-01T00:00:00Z',
        },
      ]);

      const result = await service.createContact(specialFormData);

      expect(result).toEqual({ id: 'rec123456' });
      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: {
            'First Name': 'José',
            'Last Name': 'García-López',
            'Email': 'josé@example.com',
            'Company': 'Test & Co.',
            'Message': 'Message with "quotes" and special chars: @#$%',
            'Accept Privacy': true,
            'Website': 'https://example.com/path?param=value&other=test',
          },
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

      mockCreate.mockResolvedValue([
        {
          id: 'rec123456',
          fields: longFormData,
          createdTime: '2023-01-01T00:00:00Z',
        },
      ]);

      const result = await service.createContact(longFormData);

      expect(result).toEqual({ id: 'rec123456' });
      expect(mockCreate).toHaveBeenCalledWith([
        {
          fields: {
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john.doe@example.com',
            'Company': 'Test Company',
            'Message': longMessage,
            'Accept Privacy': true,
            'Website': '',
          },
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
        'Request timeout',
      );
    });

    it('should handle rate limiting errors', async () => {
      const service = new AirtableServiceClass();

      setServiceReady(service);

      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(service.createContact(validFormData)).rejects.toThrow(
        'Rate limit exceeded',
      );
    });
  });
});
