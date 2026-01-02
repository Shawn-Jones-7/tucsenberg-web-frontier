/* eslint-disable no-console */
/**
 * Lightweight logger utility with production-safe behavior.
 * - error/warn: Always output (critical for production debugging)
 * - info: Respects LOG_LEVEL (default: warn in production)
 * - debug/log: Development only
 */

type LogArgs = [message?: unknown, ...optionalParams: unknown[]];

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function isDev(): boolean {
  return (
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  );
}

function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL as LogLevel | undefined;
  if (level && level in LOG_LEVELS) {
    return level;
  }
  // Default: warn in production, debug in development
  return isDev() ? 'debug' : 'warn';
}

function shouldLog(level: LogLevel): boolean {
  // error and warn always log regardless of LOG_LEVEL
  if (level === 'error' || level === 'warn') {
    return true;
  }
  // debug/log only in development
  if (level === 'debug' && !isDev()) {
    return false;
  }
  // info respects LOG_LEVEL
  // eslint-disable-next-line security/detect-object-injection -- level is typed as LogLevel union, keys are constrained to 'error'|'warn'|'info'|'debug'
  return LOG_LEVELS[level] <= LOG_LEVELS[getLogLevel()];
}

export const logger = {
  debug: (...args: LogArgs) => {
    if (shouldLog('debug')) {
      console.debug(...args);
    }
  },
  info: (...args: LogArgs) => {
    if (shouldLog('info')) {
      console.info(...args);
    }
  },
  log: (...args: LogArgs) => {
    // log is treated same as debug (dev only)
    if (shouldLog('debug')) {
      console.log(...args);
    }
  },
  warn: (...args: LogArgs) => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  error: (...args: LogArgs) => {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
};

export type Logger = typeof logger;
