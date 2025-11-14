import { beforeEach, describe, expect, it, vi } from 'vitest';
// Test subject
import {
  loadCriticalMessages,
  loadDeferredMessages,
} from '@/lib/load-messages';

// Hoisted mocks
vi.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: (..._args: unknown[]) => {},
    warn: (..._args: unknown[]) => {},
    info: (..._args: unknown[]) => {},
    debug: (..._args: unknown[]) => {},
  },
}));

describe('Load Messages - Fallback Behavior', () => {
  beforeEach(() => {
    // Force network failure and ensure fs fallback cannot find file
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network fail')),
    );
    vi.spyOn(process, 'cwd').mockReturnValue('/__vitest_nonexistent__');
  });

  it('should return empty object when both fetch and file read fail (no throw)', async () => {
    const result = await loadCriticalMessages('en' as any);
    expect(result).toStrictEqual({});
  });

  it('should sanitize invalid locale and still return {} on failures', async () => {
    const result = await loadCriticalMessages('invalid-locale' as any);
    expect(result).toStrictEqual({});
  });
});

// Deferred messages fallback symmetry tests
describe('Load Deferred Messages - Fallback Behavior', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network fail')),
    );
    vi.spyOn(process, 'cwd').mockReturnValue('/__vitest_nonexistent__');
  });

  it('should return {} when deferred fetch and file read both fail (no throw)', async () => {
    const result = await loadDeferredMessages('en' as any);
    expect(result).toStrictEqual({});
  });

  it('should sanitize invalid locale for deferred and still return {} on failures', async () => {
    const result = await loadDeferredMessages('invalid-locale' as any);
    expect(result).toStrictEqual({});
  });
});
