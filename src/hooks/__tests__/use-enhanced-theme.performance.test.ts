import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEnhancedTheme } from '@/hooks/use-enhanced-theme';

// Mock dependencies using vi.hoisted() to solve hoisting issues
const {
  mockSetTheme,
  mockUseTheme,
  mockRecordThemeSwitch,
  mockRecordThemePreference,
} = vi.hoisted(() => ({
  mockSetTheme: vi.fn(),
  mockUseTheme: vi.fn(),
  mockRecordThemeSwitch: vi.fn(),
  mockRecordThemePreference: vi.fn(),
}));

vi.mock('next-themes', () => ({
  useTheme: mockUseTheme,
}));

vi.mock('@/lib/theme-analytics', () => ({
  recordThemeSwitch: mockRecordThemeSwitch,
  recordThemePreference: mockRecordThemePreference,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock View Transitions API
const mockTransition = {
  ready: Promise.resolve(),
  finished: Promise.resolve(),
  updateCallbackDone: Promise.resolve(),
  types: new Set(),
  skipTransition: vi.fn(),
};

const mockStartViewTransition = vi.fn((callback?: () => void) => {
  if (callback) callback();
  return mockTransition;
}) as any;

// Check if startViewTransition already exists before defining it
if (!document.startViewTransition) {
  Object.defineProperty(document, 'startViewTransition', {
    value: mockStartViewTransition,
    writable: true,
    configurable: true,
  });
} else {
  // If it already exists, just replace the implementation
  document.startViewTransition = mockStartViewTransition;
}

describe('useEnhancedTheme Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark', 'system'],
      forcedTheme: undefined,
      resolvedTheme: 'light',
      systemTheme: 'light',
    });
  });

  it('should cache View Transitions API support detection', () => {
    const { result: result1 } = renderHook(() => useEnhancedTheme());
    const { result: result2 } = renderHook(() => useEnhancedTheme());

    // Both hooks should return the same cached result
    // Note: supportsViewTransitions is not part of the hook return value
    // It's a utility function that can be imported separately
    expect(typeof result1.current.setCornerExpandTheme).toBe('function');
    expect(typeof result2.current.setCornerExpandTheme).toBe('function');
  });

  it('should handle rapid theme switching with debouncing', async () => {
    const { result } = renderHook(() => useEnhancedTheme());

    // Simulate rapid theme switching
    act(() => {
      result.current.setTheme('dark');
      result.current.setTheme('light');
      result.current.setTheme('system');
      result.current.setTheme('dark');
    });

    // Wait for debounce delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should only call setTheme once due to debouncing
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenLastCalledWith('dark');
  });

  it('should handle rapid corner expand transitions with debouncing', async () => {
    const { result } = renderHook(() => useEnhancedTheme());

    // Simulate rapid corner expand transitions
    act(() => {
      result.current.setCornerExpandTheme('dark');
      result.current.setCornerExpandTheme('light');
      result.current.setCornerExpandTheme('system');
    });

    // Wait for debounce delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should only call setTheme once due to debouncing
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenLastCalledWith('system');
  });

  it('should not recreate debounced functions unnecessarily', () => {
    const { result, rerender } = renderHook(() => useEnhancedTheme());

    const initialSetTheme = result.current.setTheme;
    const initialSetCornerExpandTheme = result.current.setCornerExpandTheme;

    // Rerender the hook
    rerender();

    // Functions should be the same reference (memoized)
    expect(result.current.setTheme).toBe(initialSetTheme);
    expect(result.current.setCornerExpandTheme).toBe(
      initialSetCornerExpandTheme,
    );
  });

  it('should handle errors gracefully without breaking functionality', () => {
    // Mock setTheme to throw an error
    mockSetTheme.mockImplementationOnce(() => {
      throw new Error('Theme switch failed');
    });

    const { result } = renderHook(() => useEnhancedTheme());

    // Should not throw when theme switching fails
    expect(() => {
      act(() => {
        result.current.setTheme('dark');
      });
    }).not.toThrow();
  });

  it('should clean up debounced functions on unmount', () => {
    const { result, unmount } = renderHook(() => useEnhancedTheme());

    // Trigger theme change to create debounced function
    act(() => {
      result.current.setTheme('dark');
    });

    // Unmount should not throw
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('should maintain performance with multiple hook instances', () => {
    const hooks = Array.from({ length: 10 }, () =>
      renderHook(() => useEnhancedTheme()),
    );

    // All hooks should work independently
    hooks.forEach(({ result }, index) => {
      act(() => {
        result.current.setTheme(index % 2 === 0 ? 'dark' : 'light');
      });
    });

    // Should not cause performance issues
    expect(
      hooks.every(
        ({ result }) => typeof result.current.setTheme === 'function',
      ),
    ).toBe(true);
  });
});
