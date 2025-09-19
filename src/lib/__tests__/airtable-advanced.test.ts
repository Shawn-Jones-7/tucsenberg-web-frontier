import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AirtableBaseLike,
  AirtableServicePrivate,
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

describe('Airtable Advanced Tests', () => {
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

    // Reset modules to ensure fresh imports
    vi.resetModules();

    // Import the service fresh for each test
    const AirtableModule = await import('../airtable');
    AirtableServiceClass =
      AirtableModule.AirtableService as typeof AirtableServiceType;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Edge Cases', () => {
    it('should handle very large form data', async () => {
      const service = new AirtableServiceClass();

      // Override service configuration to make it ready
      setServiceReady(service);

      const largeFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Test Company',
        message: 'A'.repeat(10000), // Very large message
        acceptPrivacy: true,
        website: '',
      };

      const mockRecord = {
        id: 'rec123456',
        fields: {},
        get: vi.fn().mockReturnValue('2023-01-01T00:00:00Z'),
      };

      mockCreate.mockClear();
      mockCreate.mockResolvedValue([mockRecord]);

      const result = await service.createContact(largeFormData);

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should handle special characters in form data', async () => {
      const service = new AirtableServiceClass();

      // Override service configuration to make it ready
      setServiceReady(service);

      const specialCharFormData = {
        firstName: 'José',
        lastName: 'García-López',
        email: 'josé.garcía@example.com',
        company: 'Tëst Çömpäny',
        message: 'Special chars: àáâãäåæçèéêë',
        acceptPrivacy: true,
        website: '',
      };

      const mockRecord = {
        id: 'rec123456',
        fields: {},
        get: vi.fn().mockReturnValue('2023-01-01T00:00:00Z'),
      };

      mockCreate.mockClear();
      mockCreate.mockResolvedValue([mockRecord]);

      const result = await service.createContact(specialCharFormData);

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalledWith([
        expect.objectContaining({
          fields: expect.objectContaining({
            'First Name': 'José',
            'Last Name': 'García-López',
            'Email': 'josé.garcía@example.com',
          }),
        }),
      ]);
    });

    it('should handle concurrent operations', async () => {
      const service = new AirtableServiceClass();

      // Override service configuration to make it ready
      (service as unknown as AirtableServicePrivate).isConfigured = true;
      (service as unknown as AirtableServicePrivate).base = {
        table: vi.fn().mockReturnValue({
          create: mockCreate,
          select: mockSelect,
        }),
      };

      const mockRecord = {
        id: 'rec123456',
        fields: {},
        get: vi.fn().mockReturnValue('2023-01-01T00:00:00Z'),
      };

      const mockSelectChain = {
        all: vi.fn().mockResolvedValue([mockRecord]),
      };

      mockCreate.mockClear();
      mockCreate.mockResolvedValue([mockRecord]);
      mockSelect.mockClear();
      mockSelect.mockReturnValue(mockSelectChain);

      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Test Company',
        message: 'Test message',
        acceptPrivacy: true,
        website: '',
      };

      // Run concurrent operations
      const promises = [
        service.createContact(formData),
        service.getContacts(),
        service.createContact({ ...formData, firstName: 'Jane' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(mockSelect).toHaveBeenCalledTimes(1);
    });
  });
});
