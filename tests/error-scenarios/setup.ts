/**
 * Error Scenarios Testing Setup
 *
 * 提供全面的错误处理测试基础设施，包括：
 * - 网络错误模拟
 * - API错误处理
 * - 边界条件测试
 * - 异常情况处理
 * - 错误恢复机制
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// 错误类型定义
export interface ErrorScenario {
  name: string;
  type: 'network' | 'api' | 'validation' | 'boundary' | 'system';
  description: string;
  setup: () => void;
  cleanup: () => void;
  expectedBehavior: string;
}

// 网络错误模拟器
export class NetworkErrorSimulator {
  private originalFetch: typeof global.fetch;

  constructor() {
    this.originalFetch = global.fetch;
  }

  // 模拟网络超时
  simulateTimeout(delay: number = 5000): void {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), delay);
        }),
    );
  }

  // 模拟网络连接失败
  simulateConnectionFailure(): void {
    global.fetch = vi
      .fn()
      .mockRejectedValue(
        new Error('Failed to fetch: Network connection failed'),
      );
  }

  // 模拟间歇性网络错误
  simulateIntermittentFailure(failureRate: number = 0.5): void {
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (
        crypto &&
        crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32 < failureRate
      ) {
        return Promise.reject(new Error('Intermittent network failure'));
      }
      return this.originalFetch(url, options);
    });
  }

  // 模拟慢网络
  simulateSlowNetwork(delay: number = 2000): void {
    global.fetch = vi.fn().mockImplementation(
      (url, options) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.originalFetch(url, options));
          }, delay);
        }),
    );
  }

  // 恢复原始fetch
  restore(): void {
    global.fetch = this.originalFetch;
  }
}

// API错误模拟器
export class APIErrorSimulator {
  // 模拟HTTP状态码错误
  simulateHTTPError(status: number, message?: string): void {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText: this.getStatusText(status),
      json: async () => ({
        success: false,
        error: message || this.getDefaultErrorMessage(status),
      }),
    } as Response);
  }

  // 模拟服务器内部错误
  simulateServerError(): void {
    this.simulateHTTPError(500, 'Internal Server Error');
  }

  // 模拟认证错误
  simulateAuthError(): void {
    this.simulateHTTPError(401, 'Unauthorized');
  }

  // 模拟权限错误
  simulatePermissionError(): void {
    this.simulateHTTPError(403, 'Forbidden');
  }

  // 模拟资源不存在错误
  simulateNotFoundError(): void {
    this.simulateHTTPError(404, 'Resource not found');
  }

  // 模拟请求过于频繁错误
  simulateRateLimitError(): void {
    this.simulateHTTPError(429, 'Too Many Requests');
  }

  // 模拟无效JSON响应
  simulateInvalidJSONResponse(): void {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'basic' as Response['type'],
      url: '',
      body: null,
      bodyUsed: false,
      clone: vi.fn(),
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      formData: vi.fn(),
      text: vi.fn(),
      bytes: vi.fn().mockResolvedValue(new Uint8Array()),
      json: async () => {
        throw new Error('Unexpected token in JSON');
      },
    } as Response);
  }

  private getStatusText(status: number): string {
    const statusTexts = new Map([
      [400, 'Bad Request'],
      [401, 'Unauthorized'],
      [403, 'Forbidden'],
      [404, 'Not Found'],
      [429, 'Too Many Requests'],
      [500, 'Internal Server Error'],
      [502, 'Bad Gateway'],
      [503, 'Service Unavailable'],
    ]);
    return statusTexts.get(status) || 'Unknown Error';
  }

  private getDefaultErrorMessage(status: number): string {
    const messages = new Map([
      [400, 'The request was invalid'],
      [401, 'Authentication required'],
      [403, 'Access denied'],
      [404, 'The requested resource was not found'],
      [429, 'Too many requests, please try again later'],
      [500, 'An internal server error occurred'],
      [502, 'Bad gateway'],
      [503, 'Service temporarily unavailable'],
    ]);
    return messages.get(status) || 'An unknown error occurred';
  }
}

// 边界条件测试工具
export class BoundaryConditionTester {
  // 生成极大字符串
  generateLargeString(size: number): string {
    return 'a'.repeat(size);
  }

  // 生成特殊字符字符串
  generateSpecialCharString(): string {
    return '!@#$%^&*()_+-=[]{}|;:,.<>?`~\'"\\';
  }

  // 生成Unicode字符串
  generateUnicodeString(): string {
    return '你好世界🌍🚀💻🎉';
  }

  // 生成SQL注入尝试字符串
  generateSQLInjectionString(): string {
    return "'; DROP TABLE users; --";
  }

  // 生成XSS尝试字符串
  generateXSSString(): string {
    return '<script>alert("XSS")</script>';
  }

  // 生成极大数字
  generateLargeNumber(): number {
    return Number.MAX_SAFE_INTEGER;
  }

  // 生成负数
  generateNegativeNumber(): number {
    return -1000000;
  }

  // 生成无效日期
  generateInvalidDate(): string {
    return '2023-13-45';
  }

  // 生成空值变体
  generateNullVariants(): Array<unknown> {
    return [null, undefined, '', 0, false, NaN, {}, []];
  }
}

// 错误边界测试组件工厂
export function createTestErrorBoundary() {
  return class TestErrorBoundary extends React.Component<
    { children: React.ReactNode; onError?: (error: Error) => void },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: {
      children: React.ReactNode;
      onError?: (error: Error) => void;
    }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      this.props.onError?.(error);
      console.error('Test Error Boundary caught error:', error, errorInfo);
    }

    override render() {
      if (this.state.hasError) {
        return React.createElement(
          'div',
          { 'data-testid': 'test-error-boundary' },
          React.createElement('h2', null, 'Test Error Boundary'),
          React.createElement('p', null, `Error: ${this.state.error?.message}`),
        );
      }

      return this.props.children;
    }
  };
}

// 错误场景渲染器
export function renderWithErrorScenario(
  ui: ReactElement,
  scenario: ErrorScenario,
  options?: RenderOptions,
) {
  // 设置错误场景
  scenario.setup();

  try {
    const result = render(ui, options);
    return {
      ...result,
      cleanup: () => {
        scenario.cleanup();
        result.unmount();
      },
    };
  } catch (error) {
    scenario.cleanup();
    throw error;
  }
}

// 错误恢复测试工具
export class ErrorRecoveryTester {
  // 测试重试机制
  async testRetryMechanism(
    operation: () => Promise<unknown>,
    _operationId: string,
    maxRetries: number = 3,
    backoffMs: number = 10,
  ): Promise<{ success: boolean; attempts: number; lastError?: Error | null }> {
    let attempts = 0;
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
      attempts++;
      try {
        await operation();
        return { success: true, attempts };
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) {
          break;
        }
        // 简单的退避延迟
        if (backoffMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    return { success: false, attempts, lastError };
  }

  // 测试降级机制
  testFallbackMechanism<T>(
    primaryOperation: () => T,
    fallbackOperation: () => T,
  ): { result: T; usedFallback: boolean } {
    try {
      const result = primaryOperation();
      return { result, usedFallback: false };
    } catch (error) {
      const result = fallbackOperation();
      return { result, usedFallback: true };
    }
  }
}

// 导出所有工具
export const errorTestingUtils = {
  NetworkErrorSimulator,
  APIErrorSimulator,
  BoundaryConditionTester,
  ErrorRecoveryTester,
  createTestErrorBoundary,
  renderWithErrorScenario,
};

// 常用错误场景预设
export const commonErrorScenarios: ErrorScenario[] = [
  {
    name: 'Network Timeout',
    type: 'network',
    description: 'Simulates network request timeout',
    setup: () => new NetworkErrorSimulator().simulateTimeout(),
    cleanup: () => new NetworkErrorSimulator().restore(),
    expectedBehavior: 'Should show timeout error message and retry option',
  },
  {
    name: 'Server Error',
    type: 'api',
    description: 'Simulates 500 Internal Server Error',
    setup: () => new APIErrorSimulator().simulateServerError(),
    cleanup: () => vi.restoreAllMocks(),
    expectedBehavior:
      'Should show generic error message and contact support option',
  },
  {
    name: 'Authentication Error',
    type: 'api',
    description: 'Simulates 401 Unauthorized error',
    setup: () => new APIErrorSimulator().simulateAuthError(),
    cleanup: () => vi.restoreAllMocks(),
    expectedBehavior: 'Should redirect to login page',
  },
];
