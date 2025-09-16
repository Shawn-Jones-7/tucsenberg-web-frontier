import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger, log, logger, LogLevel } from '@/lib/logger';

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock Date.now for consistent timestamps
const mockDate = new Date('2023-01-01T00:00:00.000Z');

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      mockDate.toISOString(),
    );

    // Mock console methods
    vi.spyOn(console, 'debug').mockImplementation(mockConsole.debug);
    vi.spyOn(console, 'info').mockImplementation(mockConsole.info);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LogLevel enum', () => {
    it('should have correct log level values', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('Logger class', () => {
    describe('initialization', () => {
      it('should create logger with default config', () => {
        const testLogger = createLogger();
        const config = testLogger.getConfig();

        expect(config.enabled).toBe(true);
        expect(config.minLevel).toBe(LogLevel.INFO);
        expect(config.includeTimestamp).toBe(true);
      });

      it('should create logger with custom config', () => {
        const customConfig = {
          enabled: false,
          minLevel: LogLevel.ERROR,
          includeTimestamp: false,
        };

        const testLogger = createLogger(customConfig);
        const config = testLogger.getConfig();

        expect(config.enabled).toBe(false);
        expect(config.minLevel).toBe(LogLevel.ERROR);
        expect(config.includeTimestamp).toBe(false);
      });
    });

    describe('log level filtering', () => {
      it('should respect minimum log level', () => {
        const testLogger = createLogger({
          minLevel: LogLevel.WARN,
          enableConsoleInDev: true,
        });

        testLogger.debug('Debug message');
        testLogger.info('Info message');
        testLogger.warn('Warn message');
        testLogger.error('Error message');

        expect(mockConsole.debug).not.toHaveBeenCalled();
        expect(mockConsole.info).not.toHaveBeenCalled();
        expect(mockConsole.warn).toHaveBeenCalled();
        expect(mockConsole.error).toHaveBeenCalled();
      });

      it('should not log when disabled', () => {
        const testLogger = createLogger({
          enabled: false,
          enableConsoleInDev: true,
        });

        testLogger.error('Error message');
        expect(mockConsole.error).not.toHaveBeenCalled();
      });
    });

    describe('logging methods', () => {
      let testLogger: ReturnType<typeof createLogger>;

      beforeEach(() => {
        testLogger = createLogger({
          minLevel: LogLevel.DEBUG,
          enableConsoleInDev: true,
        });
      });

      it('should log debug messages', () => {
        testLogger.debug('Debug message', { userId: 123 });

        expect(mockConsole.debug).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Debug message`,
          { userId: 123 },
          '',
        );
      });

      it('should log info messages', () => {
        testLogger.info('Info message', { action: 'login' });

        expect(mockConsole.info).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Info message`,
          { action: 'login' },
          '',
        );
      });

      it('should log warn messages', () => {
        testLogger.warn('Warning message', { deprecated: true });

        expect(mockConsole.warn).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Warning message`,
          { deprecated: true },
          '',
        );
      });

      it('should log error messages with error object', () => {
        const error = new Error('Test error');
        testLogger.error('Error message', { code: 500 }, error);

        expect(mockConsole.error).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Error message`,
          { code: 500 },
          error,
        );
      });

      it('should handle messages without context', () => {
        testLogger.info('Simple message');

        expect(mockConsole.info).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Simple message`,
          '',
          '',
        );
      });

      it('should handle empty context objects', () => {
        testLogger.info('Message with empty context', {});

        expect(mockConsole.info).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Message with empty context`,
          '',
          '',
        );
      });
    });

    describe('timestamp handling', () => {
      it('should include timestamp when enabled', () => {
        const testLogger = createLogger({
          includeTimestamp: true,
          enableConsoleInDev: true,
        });

        testLogger.info('Test message');

        expect(mockConsole.info).toHaveBeenCalledWith(
          `[${mockDate.toISOString()}] Test message`,
          '',
          '',
        );
      });

      it('should exclude timestamp when disabled', () => {
        const testLogger = createLogger({
          includeTimestamp: false,
          enableConsoleInDev: true,
        });

        testLogger.info('Test message');

        expect(mockConsole.info).toHaveBeenCalledWith('Test message', '', '');
      });
    });

    describe('console output control', () => {
      it('should not output to console when disabled', () => {
        const testLogger = createLogger({
          enableConsoleInDev: false,
        });

        testLogger.error('Error message');
        expect(mockConsole.error).not.toHaveBeenCalled();
      });
    });

    describe('configuration management', () => {
      it('should update configuration', () => {
        const testLogger = createLogger({ minLevel: LogLevel.INFO });

        testLogger.updateConfig({ minLevel: LogLevel.ERROR });
        const config = testLogger.getConfig();

        expect(config.minLevel).toBe(LogLevel.ERROR);
      });

      it('should return immutable config copy', () => {
        const testLogger = createLogger();
        const config1 = testLogger.getConfig();
        const config2 = testLogger.getConfig();

        expect(config1).not.toBe(config2);
        expect(config1).toEqual(config2);
      });
    });
  });

  describe('default logger instance', () => {
    it('should provide working default logger', () => {
      logger.info('Test message');
      // Should not throw and should work with default config
    });
  });

  describe('log utility functions', () => {
    beforeEach(() => {
      // Clear mocks for utility tests
      vi.clearAllMocks();
    });

    it('should provide debug utility', () => {
      log.debug('Debug via utility');
      // The utility functions use the default logger, which may have different config
      // Just verify the function doesn't throw
      expect(() => log.debug('Debug via utility')).not.toThrow();
    });

    it('should provide info utility', () => {
      log.info('Info via utility');
      expect(() => log.info('Info via utility')).not.toThrow();
    });

    it('should provide warn utility', () => {
      log.warn('Warn via utility');
      expect(() => log.warn('Warn via utility')).not.toThrow();
    });

    it('should provide error utility', () => {
      const error = new Error('Test error');
      log.error('Error via utility', { test: true }, error);
      expect(() =>
        log.error('Error via utility', { test: true }, error),
      ).not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null context gracefully', () => {
      const testLogger = createLogger({ enableConsoleInDev: true });

      expect(() => {
        testLogger.info('Test message', null as unknown);
      }).not.toThrow();
    });

    it('should handle undefined context gracefully', () => {
      const testLogger = createLogger({ enableConsoleInDev: true });

      expect(() => {
        testLogger.info('Test message', undefined);
      }).not.toThrow();
    });

    it('should handle invalid log levels gracefully', () => {
      const testLogger = createLogger({ enableConsoleInDev: true });

      expect(() => {
        // @ts-expect-error - Testing invalid log level
        testLogger.log('invalid' as LogLevel, 'Test message');
      }).not.toThrow();
    });
  });
});
