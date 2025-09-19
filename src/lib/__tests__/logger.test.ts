import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  let consoleSpies: Record<
    'debug' | 'info' | 'log' | 'warn' | 'error',
    ReturnType<typeof vi.spyOn>
  >;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => void 0),
      info: vi.spyOn(console, 'info').mockImplementation(() => void 0),
      log: vi.spyOn(console, 'log').mockImplementation(() => void 0),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => void 0),
      error: vi.spyOn(console, 'error').mockImplementation(() => void 0),
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
  });

  it('should forward logs when 处于开发或测试环境', () => {
    logger.debug('debug message', { feature: 'debug' });
    logger.info('info message');
    logger.log('log message');
    logger.warn('warn message');
    logger.error('error message');

    expect(consoleSpies.debug).toHaveBeenCalledWith(
      'debug message',
      { feature: 'debug' },
    );
    expect(consoleSpies.info).toHaveBeenCalledWith('info message');
    expect(consoleSpies.log).toHaveBeenCalledWith('log message');
    expect(consoleSpies.warn).toHaveBeenCalledWith('warn message');
    expect(consoleSpies.error).toHaveBeenCalledWith('error message');
  });

  it('should noop logs when 处于生产环境', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'production');

    logger.debug('should not log');
    logger.info('should not log');
    logger.log('should not log');
    logger.warn('should not log');
    logger.error('should not log');

    expect(consoleSpies.debug).not.toHaveBeenCalled();
    expect(consoleSpies.info).not.toHaveBeenCalled();
    expect(consoleSpies.log).not.toHaveBeenCalled();
    expect(consoleSpies.warn).not.toHaveBeenCalled();
    expect(consoleSpies.error).not.toHaveBeenCalled();
  });
});
