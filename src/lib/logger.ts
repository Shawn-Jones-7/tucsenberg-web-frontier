/* eslint-disable no-console */
/**
 * Lightweight logger utility.
 * - Uses console only in development (keeps production consoles clean)
 * - Safe no-ops in production builds
 */

type LogArgs = [message?: unknown, ...optionalParams: unknown[]];

function isDev() {
  return (
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  );
}

function devOnly(fn: (...args: LogArgs) => void) {
  return (...args: LogArgs) => {
    if (isDev()) {
      fn(...args);
    }
  };
}

export const logger = {
  debug: devOnly((...args: LogArgs) => console.debug(...args)),
  info: devOnly((...args: LogArgs) => console.info(...args)),
  log: devOnly((...args: LogArgs) => console.log(...args)),
  warn: devOnly((...args: LogArgs) => console.warn(...args)),
  error: devOnly((...args: LogArgs) => console.error(...args)),
};

export type Logger = typeof logger;
