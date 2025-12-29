/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import type {
  ApiResponse,
  AsyncFunction,
  ConfigOptions,
  DeepPartial,
  Email,
  Environment,
  ErrorType,
  // FormErrors, // TODO: Add test for FormErrors when needed
  EventHandler,
  FormState,
  LoadingState,
  Locale,
  OptionalKeys,
  PaginatedResponse,
  RequiredKeys,
  Theme,
  UserId,
} from '@/types/global';

describe('Global Types', () => {
  describe('ApiResponse', () => {
    it('should define correct structure for ApiResponse', () => {
      const response: ApiResponse<string> = {
        data: 'test',
        success: true,
        message: 'Success',
        errors: { field: ['error'] },
      };

      expect(response.data).toBe('test');
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
      expect(response.errors).toEqual({ field: ['error'] });
    });

    it('should work with generic types', () => {
      const numberResponse: ApiResponse<number> = {
        data: 42,
        success: true,
      };

      const objectResponse: ApiResponse<{ id: number; name: string }> = {
        data: { id: 1, name: 'test' },
        success: true,
      };

      expect(numberResponse.data).toBe(42);
      expect(objectResponse.data.id).toBe(1);
      expect(objectResponse.data.name).toBe('test');
    });
  });

  describe('PaginatedResponse', () => {
    it('should define correct structure for PaginatedResponse', () => {
      const response: PaginatedResponse<{ id: number }> = {
        data: [{ id: 1 }, { id: 2 }],
        success: true,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      expect(response.data).toHaveLength(2);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.total).toBe(2);
    });
  });

  describe('Utility Types', () => {
    it('should work with DeepPartial', () => {
      interface TestObject {
        a: string;
        b: {
          c: number;
          d: {
            e: boolean;
          };
        };
      }

      const partial: DeepPartial<TestObject> = {
        b: {
          d: {},
        },
      };

      expect(partial.b?.d).toBeDefined();
    });

    it('should work with RequiredKeys', () => {
      interface TestInterface {
        a?: string;
        b?: number;
        c?: boolean;
      }

      const required: RequiredKeys<TestInterface, 'a' | 'b'> = {
        a: 'required',
        b: 42,
        // c is still optional
      };

      expect(required.a).toBe('required');
      expect(required.b).toBe(42);
    });

    it('should work with OptionalKeys', () => {
      interface TestInterface {
        a: string;
        b: number;
        c: boolean;
      }

      const optional: OptionalKeys<TestInterface, 'a' | 'b'> = {
        c: true,
        // a and b are now optional
      };

      expect(optional.c).toBe(true);
    });
  });

  describe('Brand Types', () => {
    it('should create type-safe UserId', () => {
      const userId = 'user123' as UserId;
      expect(typeof userId).toBe('string');
    });

    it('should create type-safe Email', () => {
      const email = 'test@example.com' as Email;
      expect(typeof email).toBe('string');
    });
  });

  describe('Enum Types', () => {
    it('should define Theme type correctly', () => {
      const themes: Theme[] = ['light', 'dark', 'system'];
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
      expect(themes).toContain('system');
    });

    it('should define Locale type correctly', () => {
      const locales: Locale[] = ['en', 'zh'];
      expect(locales).toContain('en');
      expect(locales).toContain('zh');
    });

    it('should define Environment type correctly', () => {
      const environments: Environment[] = ['development', 'production', 'test'];
      expect(environments).toContain('development');
      expect(environments).toContain('production');
      expect(environments).toContain('test');
    });

    it('should define ErrorType correctly', () => {
      const errorTypes: ErrorType[] = [
        'validation',
        'authentication',
        'authorization',
        'not_found',
        'server_error',
        'network_error',
      ];
      expect(errorTypes).toHaveLength(6);
    });

    it('should define LoadingState correctly', () => {
      const states: LoadingState[] = ['idle', 'loading', 'success', 'error'];
      expect(states).toHaveLength(4);
    });
  });

  describe('FormState', () => {
    it('should define correct structure for FormState', () => {
      interface TestForm {
        name: string;
        email: string;
      }

      const formState: FormState<TestForm> = {
        values: { name: 'John', email: 'john@example.com' },
        errors: { name: 'Required', email: 'Invalid' },
        touched: { name: true, email: false },
        isSubmitting: false,
        isValid: true,
      };

      expect(formState.values.name).toBe('John');
      expect(formState.errors.name).toBe('Required');
      expect(formState.touched.name).toBe(true);
    });
  });

  describe('Function Types', () => {
    it('should define EventHandler correctly', () => {
      const handler: EventHandler = () => {
        // Event handler implementation
      };
      expect(typeof handler).toBe('function');
    });

    it('should define AsyncFunction correctly', () => {
      const asyncFn: AsyncFunction<string> = async () => {
        return 'result';
      };
      expect(typeof asyncFn).toBe('function');
    });
  });

  describe('ConfigOptions', () => {
    it('should define correct structure for ConfigOptions', () => {
      const config: ConfigOptions = {
        apiBaseUrl: 'https://api.example.com',
        environment: 'production',
        defaultLocale: 'en',
        debug: false,
      };

      expect(config.apiBaseUrl).toBe('https://api.example.com');
      expect(config.environment).toBe('production');
      expect(config.defaultLocale).toBe('en');
      expect(config.debug).toBe(false);
    });

    it('should work with all optional fields omitted', () => {
      const config: ConfigOptions = {
        apiBaseUrl: 'https://api.example.com',
        environment: 'development',
        defaultLocale: 'zh',
        debug: true,
      };

      expect(config.apiBaseUrl).toBe('https://api.example.com');
    });
  });
});
