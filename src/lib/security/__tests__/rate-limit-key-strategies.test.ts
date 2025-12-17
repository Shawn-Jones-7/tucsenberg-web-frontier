import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getApiKeyPriorityKey,
  getIPKey,
  getSessionPriorityKey,
  hmacKey,
  hmacKeyWithRotation,
  resetPepperWarning,
} from '../rate-limit-key-strategies';

// Use vi.hoisted for mock functions
const mockGetClientIP = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());

vi.mock('@/lib/security/client-ip', () => ({
  getClientIP: mockGetClientIP,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: mockLoggerWarn,
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('rate-limit-key-strategies', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    resetPepperWarning();
    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.RATE_LIMIT_PEPPER;
    delete process.env.RATE_LIMIT_PEPPER_PREVIOUS;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  function createMockRequest(
    options: {
      cookies?: Record<string, string>;
      headers?: Record<string, string>;
    } = {},
  ): NextRequest {
    const url = 'http://localhost/api/test';
    const headers = new Headers(options.headers);

    const request = new NextRequest(url, { headers });

    // Mock cookies
    if (options.cookies) {
      Object.defineProperty(request.cookies, 'get', {
        value: vi.fn().mockImplementation((cookieName: string) => {
          if (options.cookies && cookieName in options.cookies) {
            return { value: options.cookies[cookieName] };
          }
          return undefined;
        }),
      });
    }

    return request;
  }

  describe('hmacKey', () => {
    it('should generate consistent hash for same input', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);

      const key1 = hmacKey('192.168.1.1');
      const key2 = hmacKey('192.168.1.1');

      expect(key1).toBe(key2);
    });

    it('should generate different hash for different inputs', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);

      const key1 = hmacKey('192.168.1.1');
      const key2 = hmacKey('192.168.1.2');

      expect(key1).not.toBe(key2);
    });

    it('should return 16 character hex string (64-bit)', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);

      const key = hmacKey('test-input');

      expect(key).toHaveLength(16);
      expect(key).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should use development fallback pepper when not configured', () => {
      process.env.NODE_ENV = 'development';

      const key = hmacKey('test-input');

      expect(key).toHaveLength(16);
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT_PEPPER not configured'),
      );
    });

    it('should warn only once about missing pepper', () => {
      process.env.NODE_ENV = 'development';

      hmacKey('input1');
      hmacKey('input2');
      hmacKey('input3');

      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    });

    it('should throw error in production without pepper', () => {
      process.env.NODE_ENV = 'production';

      expect(() => hmacKey('test-input')).toThrow(
        /RATE_LIMIT_PEPPER is required in production/,
      );
    });

    it('should throw error in production with short pepper', () => {
      process.env.NODE_ENV = 'production';
      process.env.RATE_LIMIT_PEPPER = 'tooshort';

      expect(() => hmacKey('test-input')).toThrow(
        /RATE_LIMIT_PEPPER is too short/,
      );
    });

    it('should warn about weak pepper in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.RATE_LIMIT_PEPPER = 'short';

      hmacKey('test-input');

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT_PEPPER is weak'),
      );
    });
  });

  describe('hmacKeyWithRotation', () => {
    it('should return single key when no previous pepper', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);

      const keys = hmacKeyWithRotation('test-input');

      expect(keys).toHaveLength(1);
    });

    it('should return two keys during pepper rotation', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);
      process.env.RATE_LIMIT_PEPPER_PREVIOUS = 'b'.repeat(32);

      const keys = hmacKeyWithRotation('test-input');

      expect(keys).toHaveLength(2);
      expect(keys[0]).not.toBe(keys[1]);
    });

    it('should have current key as first element', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);
      process.env.RATE_LIMIT_PEPPER_PREVIOUS = 'b'.repeat(32);

      const currentKey = hmacKey('test-input');
      const keys = hmacKeyWithRotation('test-input');

      expect(keys[0]).toBe(currentKey);
    });
  });

  describe('getIPKey', () => {
    it('should return IP-based key with prefix', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);
      mockGetClientIP.mockReturnValue('192.168.1.100');

      const request = createMockRequest();
      const key = getIPKey(request);

      expect(key).toMatch(/^ip:[0-9a-f]{16}$/);
    });

    it('should call getClientIP with request', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);
      mockGetClientIP.mockReturnValue('10.0.0.1');

      const request = createMockRequest();
      getIPKey(request);

      expect(mockGetClientIP).toHaveBeenCalledWith(request);
    });

    it('should produce different keys for different IPs', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);

      mockGetClientIP.mockReturnValue('192.168.1.1');
      const key1 = getIPKey(createMockRequest());

      mockGetClientIP.mockReturnValue('192.168.1.2');
      const key2 = getIPKey(createMockRequest());

      expect(key1).not.toBe(key2);
    });
  });

  describe('getSessionPriorityKey', () => {
    beforeEach(() => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);
      mockGetClientIP.mockReturnValue('192.168.1.100');
    });

    it('should return session-based key when valid session exists', () => {
      const request = createMockRequest({
        cookies: { 'session-id': 'valid-session-id-12345678' },
      });

      const key = getSessionPriorityKey(request);

      expect(key).toMatch(/^session:[0-9a-f]{16}$/);
    });

    it('should fallback to IP key when no session cookie', () => {
      const request = createMockRequest();

      const ipKey = getIPKey(request);
      const sessionKey = getSessionPriorityKey(request);

      expect(sessionKey).toBe(ipKey);
    });

    it('should fallback to IP key for too short session ID', () => {
      const request = createMockRequest({
        cookies: { 'session-id': 'short' },
      });

      const ipKey = getIPKey(request);
      const sessionKey = getSessionPriorityKey(request);

      expect(sessionKey).toBe(ipKey);
    });

    it('should reject invalid session values', () => {
      const invalidValues = ['undefined', 'null', '[object Object]'];

      for (const invalidValue of invalidValues) {
        const request = createMockRequest({
          cookies: { 'session-id': invalidValue },
        });

        const ipKey = getIPKey(request);
        const sessionKey = getSessionPriorityKey(request);

        expect(sessionKey).toBe(ipKey);
      }
    });
  });

  describe('getApiKeyPriorityKey', () => {
    beforeEach(() => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);
      mockGetClientIP.mockReturnValue('192.168.1.100');
    });

    it('should return API key-based key when Bearer token exists', () => {
      const request = createMockRequest({
        headers: { Authorization: 'Bearer sk-test-api-key-12345' },
      });

      const key = getApiKeyPriorityKey(request);

      expect(key).toMatch(/^apikey:[0-9a-f]{16}$/);
    });

    it('should fallback to IP key when no Authorization header', () => {
      const request = createMockRequest();

      const ipKey = getIPKey(request);
      const apiKeyKey = getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it('should fallback to IP key for non-Bearer authorization', () => {
      const request = createMockRequest({
        headers: { Authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=' },
      });

      const ipKey = getIPKey(request);
      const apiKeyKey = getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it('should handle case-insensitive Bearer prefix', () => {
      const request = createMockRequest({
        headers: { Authorization: 'bearer sk-test-key' },
      });

      const key = getApiKeyPriorityKey(request);

      expect(key).toMatch(/^apikey:[0-9a-f]{16}$/);
    });

    it('should produce different keys for different API keys', () => {
      process.env.RATE_LIMIT_PEPPER = 'a'.repeat(32);

      const request1 = createMockRequest({
        headers: { Authorization: 'Bearer api-key-1' },
      });
      const request2 = createMockRequest({
        headers: { Authorization: 'Bearer api-key-2' },
      });

      const key1 = getApiKeyPriorityKey(request1);
      const key2 = getApiKeyPriorityKey(request2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('resetPepperWarning', () => {
    it('should allow warning to be logged again after reset', () => {
      process.env.NODE_ENV = 'development';

      hmacKey('input1');
      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);

      resetPepperWarning();
      hmacKey('input2');
      expect(mockLoggerWarn).toHaveBeenCalledTimes(2);
    });
  });
});
