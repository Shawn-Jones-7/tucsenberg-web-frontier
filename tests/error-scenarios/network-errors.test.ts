/**
 * Network Error Handling Tests
 *
 * 全面测试网络错误处理机制，包括：
 * - 网络超时处理
 * - 连接失败处理
 * - 间歇性网络错误
 * - 慢网络处理
 * - 重试机制
 * - 降级策略
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APIErrorSimulator,
  ErrorRecoveryTester,
  NetworkErrorSimulator,
} from './setup';

// Mock fetch for testing
const originalFetch = global.fetch;

// 模拟API客户端
class TestAPIClient {
  private baseURL: string;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(
    baseURL: string = '/api',
    retryAttempts: number = 3,
    retryDelay: number = 100,
  ) {
    // 减少重试延迟
    this.baseURL = baseURL;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
  }

  async get(endpoint: string): Promise<unknown> {
    return this.request('GET', endpoint);
  }

  async post(endpoint: string, data?: unknown): Promise<unknown> {
    return this.request('POST', endpoint, data);
  }

  private async request(
    method: string,
    endpoint: string,
    data?: unknown,
  ): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          ...(data ? { body: JSON.stringify(data) } : {}),
        });

        if (!response.ok) {
          const httpError = new Error(
            `HTTP ${response.status}: ${response.statusText}`,
          );

          // Don't retry on 4xx client errors (client-side issues)
          if (response.status >= 400 && response.status < 500) {
            throw httpError;
          }

          throw httpError;
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on 4xx errors or on the last attempt
        if (attempt === this.retryAttempts) {
          break;
        }

        // Check if it's a 4xx error and don't retry
        if (lastError.message.includes('HTTP 4')) {
          break;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }

    throw lastError;
  }

  // 带降级策略的请求
  async requestWithFallback<T>(
    primaryEndpoint: string,
    fallbackEndpoint: string,
    defaultValue: T,
  ): Promise<{ data: T; source: 'primary' | 'fallback' | 'default' }> {
    try {
      const data = (await this.get(primaryEndpoint)) as T;
      return { data, source: 'primary' };
    } catch {
      try {
        const data = (await this.get(fallbackEndpoint)) as T;
        return { data, source: 'fallback' };
      } catch {
        return { data: defaultValue, source: 'default' };
      }
    }
  }
}

describe('Network Error Handling Tests', () => {
  let networkSimulator: NetworkErrorSimulator;
  let apiSimulator: APIErrorSimulator;
  let recoveryTester: ErrorRecoveryTester;
  let apiClient: TestAPIClient;

  beforeEach(() => {
    networkSimulator = new NetworkErrorSimulator();
    apiSimulator = new APIErrorSimulator();
    recoveryTester = new ErrorRecoveryTester();
    apiClient = new TestAPIClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    networkSimulator.restore();
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Network Timeout Handling', () => {
    it('should handle network timeout errors correctly', async () => {
      networkSimulator.simulateTimeout(1000);

      await expect(apiClient.get('/test')).rejects.toThrow('Network timeout');
    });

    it('should retry on timeout and eventually succeed', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: 'success' }),
        });
      });

      const result = await apiClient.get('/test');
      expect(result).toEqual({ success: true, data: 'success' });
      expect(callCount).toBe(3); // 2 failures + 1 success
    });

    it('should fail after maximum retry attempts on persistent timeout', async () => {
      networkSimulator.simulateTimeout(100);

      const startTime = Date.now();
      await expect(apiClient.get('/test')).rejects.toThrow('Network timeout');
      const endTime = Date.now();

      // Should have attempted retries (4 total attempts with delays)
      expect(endTime - startTime).toBeGreaterThan(300); // 3 retry delays of 100ms each
    }, 10000); // 为这个测试设置10秒超时
  });

  describe('Connection Failure Handling', () => {
    it('should handle connection failure errors', async () => {
      networkSimulator.simulateConnectionFailure();

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Network connection failed',
      );
    });

    it('should handle DNS resolution failures', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('getaddrinfo ENOTFOUND api.example.com'));

      await expect(apiClient.get('/test')).rejects.toThrow(
        'getaddrinfo ENOTFOUND',
      );
    });

    it('should handle CORS errors', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(
          new Error("CORS policy: No 'Access-Control-Allow-Origin' header"),
        );

      await expect(apiClient.get('/test')).rejects.toThrow('CORS policy');
    });
  });

  describe('Intermittent Network Errors', () => {
    it('should handle intermittent network failures with retry', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        // Fail first 2 calls, succeed on 3rd
        if (callCount <= 2) {
          return Promise.reject(new Error('Intermittent network failure'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, attempt: callCount }),
        });
      });

      const result = await apiClient.get('/test');
      expect(result).toEqual({ success: true, attempt: 3 });
      expect(callCount).toBe(3);
    });

    it('should handle random network failures', async () => {
      // Simulate 70% failure rate
      networkSimulator.simulateIntermittentFailure(0.7);

      const results = [];
      const attempts = 10;

      for (let i = 0; i < attempts; i++) {
        try {
          await apiClient.get('/test');
          results.push('success');
        } catch {
          results.push('failure');
        }
      }

      // Should have some failures due to 70% failure rate
      const failures = results.filter((r) => r === 'failure').length;
      expect(failures).toBeGreaterThan(0);
    });
  });

  describe('Slow Network Handling', () => {
    it('should handle slow network responses', async () => {
      networkSimulator.simulateSlowNetwork(1000); // 减少延迟时间

      const startTime = Date.now();

      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ success: true, data: 'slow response' }),
              });
            }, 1000); // 减少到1秒
          }),
      );

      const result = await apiClient.get('/test');
      const endTime = Date.now();

      expect(result).toEqual({ success: true, data: 'slow response' });
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // 调整期望值
    }, 10000); // 为这个测试设置10秒超时

    it('should timeout on extremely slow responses', async () => {
      // Simulate request that takes longer than timeout
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Request timeout'));
            }, 2000); // 减少到2秒，避免测试超时
          }),
      );

      await expect(apiClient.get('/test')).rejects.toThrow('Request timeout');
    }, 15000); // 为这个特定测试设置15秒超时
  });

  describe('HTTP Status Error Handling', () => {
    it('should handle 4xx client errors correctly', async () => {
      const clientErrors = [400, 401, 403, 404, 422, 429];

      for (const status of clientErrors) {
        apiSimulator.simulateHTTPError(status);

        await expect(apiClient.get('/test')).rejects.toThrow(`HTTP ${status}`);
      }
    }, 20000); // 为循环测试设置20秒超时

    it('should handle 5xx server errors correctly', async () => {
      const serverErrors = [500, 502, 503, 504];

      for (const status of serverErrors) {
        apiSimulator.simulateHTTPError(status);

        await expect(apiClient.get('/test')).rejects.toThrow(`HTTP ${status}`);
      }
    }, 20000); // 为循环测试设置20秒超时

    it('should retry on 5xx errors but not on 4xx errors', async () => {
      let callCount = 0;

      // First test: 500 error (should retry)
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });
      });

      await expect(apiClient.get('/test')).rejects.toThrow('HTTP 500');
      expect(callCount).toBe(4); // 1 initial + 3 retries

      // Reset for second test
      callCount = 0;

      // Second test: 404 error (should not retry)
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      });

      await expect(apiClient.get('/test')).rejects.toThrow('HTTP 404');
      expect(callCount).toBe(1); // No retries for 4xx errors
    });
  });

  describe('Fallback and Degradation Strategies', () => {
    it('should use fallback endpoint when primary fails', async () => {
      // Primary endpoint fails
      let _callCount = 0;
      global.fetch = vi.fn().mockImplementation((url) => {
        _callCount++;
        if (url.includes('/primary')) {
          return Promise.reject(new Error('Primary endpoint failed'));
        }
        if (url.includes('/fallback')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, source: 'fallback' }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const result = await apiClient.requestWithFallback(
        '/primary',
        '/fallback',
        { success: false, source: 'default' },
      );

      expect(result).toEqual({
        data: { success: true, source: 'fallback' },
        source: 'fallback',
      });
    });

    it('should use default value when both primary and fallback fail', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('All endpoints failed'));

      const result = await apiClient.requestWithFallback(
        '/primary',
        '/fallback',
        { success: false, source: 'default' },
      );

      expect(result).toEqual({
        data: { success: false, source: 'default' },
        source: 'default',
      });
    });

    it('should prefer primary endpoint when available', async () => {
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/primary')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, source: 'primary' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, source: 'fallback' }),
        });
      });

      const result = await apiClient.requestWithFallback(
        '/primary',
        '/fallback',
        { success: false, source: 'default' },
      );

      expect(result).toEqual({
        data: { success: true, source: 'primary' },
        source: 'primary',
      });
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should test retry mechanism with configurable attempts', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce('Success');

      const result = await recoveryTester.testRetryMechanism(
        operation,
        'test-operation',
        3,
        2,
      );

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should test fallback mechanism', async () => {
      const primaryOperation = vi.fn().mockImplementation(() => {
        throw new Error('Primary failed');
      });
      const fallbackOperation = vi.fn().mockReturnValue('Fallback success');

      const result = recoveryTester.testFallbackMechanism(
        primaryOperation,
        fallbackOperation,
      );

      expect(result.result).toBe('Fallback success');
      expect(result.usedFallback).toBe(true);
      expect(primaryOperation).toHaveBeenCalledTimes(1);
      expect(fallbackOperation).toHaveBeenCalledTimes(1);
    });
  });
});
