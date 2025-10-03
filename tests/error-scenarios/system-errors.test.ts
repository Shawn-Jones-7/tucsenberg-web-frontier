/**
 * System Error and Exception Handling Tests
 *
 * 全面测试系统级错误处理，包括：
 * - 内存不足错误
 * - 文件系统错误
 * - 权限错误
 * - 资源耗尽
 * - 异步错误处理
 * - 未捕获异常
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 模拟系统错误场景
class SystemErrorSimulator {
  // 模拟内存不足错误
  simulateOutOfMemoryError(): void {
    const originalError = global.Error;
    global.Error = class extends originalError {
      constructor(message?: string) {
        super(message);
        if (message?.includes('memory')) {
          this.name = 'RangeError';
          this.message = 'Maximum call stack size exceeded';
        }
      }
    } as unknown as ErrorConstructor;
  }

  // 模拟文件系统错误
  simulateFileSystemError(
    errorType: 'ENOENT' | 'EACCES' | 'EMFILE' | 'ENOSPC',
  ): Error {
    const errorMessages = {
      ENOENT: 'ENOENT: no such file or directory',
      EACCES: 'EACCES: permission denied',
      EMFILE: 'EMFILE: too many open files',
      ENOSPC: 'ENOSPC: no space left on device',
    };

    const error = new Error(
      Object.hasOwn(errorMessages, errorType)
        ? errorMessages[errorType]
        : 'Unknown error',
    );
    (error as { code?: string; errno?: number }).code = errorType;
    (error as { code?: string; errno?: number }).errno = -2;
    return error;
  }

  // 模拟网络资源耗尽
  simulateResourceExhaustion(): void {
    global.fetch = vi
      .fn()
      .mockRejectedValue(new Error('ECONNRESET: Connection reset by peer'));
  }

  // 模拟异步操作超时
  simulateAsyncTimeout(delay: number = 5000): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, delay);
    });
  }

  // 恢复原始状态
  restore(): void {
    vi.restoreAllMocks();
  }
}

// 错误处理器类
class ErrorHandler {
  private errorLog: Array<{
    error: Error;
    timestamp: Date;
    context?: Record<string, unknown>;
  }> = [];
  private retryAttempts: Map<string, number> = new Map();

  // 处理系统错误
  handleSystemError(
    error: Error,
    context?: Record<string, unknown>,
  ): { handled: boolean; action: string } {
    this.logError(error, context);

    // 根据错误类型决定处理策略
    if (error.message.includes('ENOENT')) {
      return { handled: true, action: 'create_missing_resource' };
    }

    if (error.message.includes('EACCES')) {
      return { handled: true, action: 'request_permissions' };
    }

    if (error.message.includes('EMFILE')) {
      return { handled: true, action: 'close_unused_files' };
    }

    if (error.message.includes('ENOSPC')) {
      return { handled: true, action: 'cleanup_disk_space' };
    }

    if (error.message.includes('timeout')) {
      return { handled: true, action: 'retry_with_backoff' };
    }

    if (
      error.message.includes('memory') ||
      error.message.includes('stack size exceeded')
    ) {
      return { handled: true, action: 'garbage_collect' };
    }

    return { handled: false, action: 'escalate_to_admin' };
  }

  // 重试机制
  async retryOperation<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = 3,
    backoffMs: number = 1000,
  ): Promise<T> {
    const currentAttempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      this.retryAttempts.delete(operationId); // 成功后清除重试计数
      return result;
    } catch (error) {
      if (currentAttempts >= maxRetries) {
        this.retryAttempts.delete(operationId);
        throw new Error(
          `Operation failed after ${maxRetries} retries: ${(error as Error).message}`,
        );
      }

      this.retryAttempts.set(operationId, currentAttempts + 1);

      // 指数退避
      const delay = backoffMs * 2 ** currentAttempts;
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.retryOperation(operation, operationId, maxRetries, backoffMs);
    }
  }

  // 降级处理
  async handleWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    defaultValue: T,
  ): Promise<{ result: T; source: 'primary' | 'fallback' | 'default' }> {
    try {
      const result = await primaryOperation();
      return { result, source: 'primary' };
    } catch (primaryError) {
      this.logError(primaryError as Error, { operation: 'primary' });

      try {
        const result = await fallbackOperation();
        return { result, source: 'fallback' };
      } catch (fallbackError) {
        this.logError(fallbackError as Error, { operation: 'fallback' });
        return { result: defaultValue, source: 'default' };
      }
    }
  }

  // 记录错误
  private logError(error: Error, context?: Record<string, unknown>): void {
    this.errorLog.push({
      error,
      timestamp: new Date(),
      ...(context !== undefined ? { context } : {}),
    });
  }

  // 获取错误日志
  getErrorLog(): Array<{
    error: Error;
    timestamp: Date;
    context?: Record<string, unknown>;
  }> {
    return [...this.errorLog];
  }

  // 清除错误日志
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // 获取错误统计
  getErrorStats(): { total: number; byType: Record<string, number> } {
    const total = this.errorLog.length;
    const byType: Record<string, number> = {};

    this.errorLog.forEach(({ error }) => {
      const type = error.constructor.name;

      byType[type] =
        ((Object.hasOwn(byType, type) ? byType[type] : null) || 0) + 1;
    });

    return { total, byType };
  }
}

describe('System Error and Exception Handling Tests', () => {
  let systemSimulator: SystemErrorSimulator;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    systemSimulator = new SystemErrorSimulator();
    errorHandler = new ErrorHandler();
    vi.clearAllMocks();
  });

  afterEach(() => {
    systemSimulator.restore();
    vi.restoreAllMocks();
  });

  describe('File System Error Handling', () => {
    it('should handle file not found errors', () => {
      const error = systemSimulator.simulateFileSystemError('ENOENT');
      const result = errorHandler.handleSystemError(error);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('create_missing_resource');
    });

    it('should handle permission denied errors', () => {
      const error = systemSimulator.simulateFileSystemError('EACCES');
      const result = errorHandler.handleSystemError(error);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('request_permissions');
    });

    it('should handle too many open files errors', () => {
      const error = systemSimulator.simulateFileSystemError('EMFILE');
      const result = errorHandler.handleSystemError(error);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('close_unused_files');
    });

    it('should handle disk space errors', () => {
      const error = systemSimulator.simulateFileSystemError('ENOSPC');
      const result = errorHandler.handleSystemError(error);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('cleanup_disk_space');
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle out of memory errors', () => {
      const memoryError = new Error('Maximum call stack size exceeded');
      const result = errorHandler.handleSystemError(memoryError);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('garbage_collect');
    });

    it('should handle resource exhaustion', async () => {
      systemSimulator.simulateResourceExhaustion();

      expect(global.fetch).toHaveBeenCalledTimes(0);

      // Test that fetch will reject
      await expect(fetch('/test')).rejects.toThrow('ECONNRESET');
    });

    it('should handle large memory allocations gracefully', () => {
      // Simulate attempting to allocate large amounts of memory
      const largeArrayTest = () => {
        try {
          // This would normally cause memory issues
          const largeArray = new Array(Number.MAX_SAFE_INTEGER);
          return largeArray;
        } catch (error) {
          return errorHandler.handleSystemError(error as Error);
        }
      };

      const result = largeArrayTest();
      expect(result).toBeDefined();
    });
  });

  describe('Async Error Handling', () => {
    it('should handle async operation timeouts', async () => {
      const timeoutPromise = systemSimulator.simulateAsyncTimeout(100);

      await expect(timeoutPromise).rejects.toThrow('Operation timed out');
    });

    it('should handle unhandled promise rejections', async () => {
      const unhandledRejections: Array<{
        reason: unknown;
        promise: Promise<unknown>;
      }> = [];

      // Mock unhandled rejection handler
      const originalHandler = process.listeners('unhandledRejection');
      process.removeAllListeners('unhandledRejection');

      process.on('unhandledRejection', (reason, promise) => {
        unhandledRejections.push({ reason, promise });
      });

      // Create unhandled rejection
      Promise.reject(new Error('Unhandled async error'));

      // Wait for event loop
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(unhandledRejections).toHaveLength(1);
      expect((unhandledRejections[0]?.reason as Error).message).toBe(
        'Unhandled async error',
      );

      // Restore original handlers
      process.removeAllListeners('unhandledRejection');
      originalHandler.forEach((handler) => {
        process.on('unhandledRejection', handler as (...args: any[]) => void);
      });
    });

    it('should handle concurrent async errors', async () => {
      const operations = Array.from({ length: 10 }, (_, i) =>
        Promise.reject(new Error(`Async error ${i}`)),
      );

      const results = await Promise.allSettled(operations);

      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.status).toBe('rejected');
        expect((result as PromiseRejectedResult).reason.message).toBe(
          `Async error ${index}`,
        );
      });
    });
  });

  describe('Retry Mechanisms', () => {
    it('should retry failed operations with exponential backoff', async () => {
      let attemptCount = 0;
      const failingOperation = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return `Success on attempt ${attemptCount}`;
      };

      const result = await errorHandler.retryOperation(
        failingOperation,
        'test-operation',
        3,
        10, // Short delay for testing
      );

      expect(result).toBe('Success on attempt 3');
      expect(attemptCount).toBe(3);
    });

    it('should fail after maximum retry attempts', async () => {
      const alwaysFailingOperation = async () => {
        throw new Error('Always fails');
      };

      await expect(
        errorHandler.retryOperation(
          alwaysFailingOperation,
          'failing-operation',
          2,
          10,
        ),
      ).rejects.toThrow('Operation failed after 2 retries');
    });

    it('should handle retry with different error types', async () => {
      const errorTypes = ['Network error', 'Timeout error', 'Server error'];
      let attemptCount = 0;

      const varyingErrorOperation = async () => {
        const errorType = errorTypes[attemptCount % errorTypes.length];
        attemptCount++;

        if (attemptCount < 4) {
          throw new Error(errorType);
        }
        return 'Success';
      };

      const result = await errorHandler.retryOperation(
        varyingErrorOperation,
        'varying-error-operation',
        5,
        10,
      );

      expect(result).toBe('Success');
      expect(attemptCount).toBe(4);
    });
  });

  describe('Fallback and Degradation', () => {
    it('should use fallback when primary operation fails', async () => {
      const primaryOperation = async () => {
        throw new Error('Primary failed');
      };

      const fallbackOperation = async () => {
        return 'Fallback success';
      };

      const result = await errorHandler.handleWithFallback(
        primaryOperation,
        fallbackOperation,
        'Default value',
      );

      expect(result.result).toBe('Fallback success');
      expect(result.source).toBe('fallback');
    });

    it('should use default value when both operations fail', async () => {
      const primaryOperation = async () => {
        throw new Error('Primary failed');
      };

      const fallbackOperation = async () => {
        throw new Error('Fallback failed');
      };

      const result = await errorHandler.handleWithFallback(
        primaryOperation,
        fallbackOperation,
        'Default value',
      );

      expect(result.result).toBe('Default value');
      expect(result.source).toBe('default');
    });

    it('should prefer primary operation when successful', async () => {
      const primaryOperation = async () => {
        return 'Primary success';
      };

      const fallbackOperation = async () => {
        return 'Fallback success';
      };

      const result = await errorHandler.handleWithFallback(
        primaryOperation,
        fallbackOperation,
        'Default value',
      );

      expect(result.result).toBe('Primary success');
      expect(result.source).toBe('primary');
    });
  });

  describe('Error Logging and Monitoring', () => {
    it('should log all errors with timestamps', () => {
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3'),
      ];

      errors.forEach((error) => {
        errorHandler.handleSystemError(error);
      });

      const errorLog = errorHandler.getErrorLog();
      expect(errorLog).toHaveLength(3);

      errorLog.forEach((entry, index) => {
        expect(entry.error.message).toBe(`Error ${index + 1}`);
        expect(entry.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should provide error statistics', () => {
      const errors = [
        new Error('Error 1'),
        new TypeError('Type Error'),
        new RangeError('Range Error'),
        new Error('Error 2'),
      ];

      errors.forEach((error) => {
        errorHandler.handleSystemError(error);
      });

      const stats = errorHandler.getErrorStats();
      expect(stats.total).toBe(4);
      expect(stats.byType.Error).toBe(2);
      expect(stats.byType.TypeError).toBe(1);
      expect(stats.byType.RangeError).toBe(1);
    });

    it('should clear error logs when requested', () => {
      errorHandler.handleSystemError(new Error('Test error'));
      expect(errorHandler.getErrorLog()).toHaveLength(1);

      errorHandler.clearErrorLog();
      expect(errorHandler.getErrorLog()).toHaveLength(0);
    });
  });

  describe('Unknown Error Handling', () => {
    it('should handle unknown error types gracefully', () => {
      const unknownError = new Error('Unknown system error');
      const result = errorHandler.handleSystemError(unknownError);

      expect(result.handled).toBe(false);
      expect(result.action).toBe('escalate_to_admin');
    });

    it('should handle non-Error objects thrown as errors', () => {
      const nonErrorObject = { message: 'Not an Error object', code: 500 };

      // Simulate handling non-Error objects
      const handleNonError = (obj: unknown) => {
        try {
          throw obj;
        } catch (caught) {
          if (caught instanceof Error) {
            return errorHandler.handleSystemError(caught);
          }
          // Convert to Error
          const caughtObj = caught as Record<string, unknown>;
          const error = new Error(String(caughtObj?.message || caught));
          return errorHandler.handleSystemError(error);
        }
      };

      const result = handleNonError(nonErrorObject);
      expect(result).toBeDefined();
      expect(result.handled).toBe(false);
    });
  });
});
