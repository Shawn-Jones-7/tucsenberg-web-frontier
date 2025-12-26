/**
 * @vitest-environment jsdom
 * Tests for theme-transition-core module
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  executeBasicThemeTransition,
  executeThemeTransition,
} from '../theme-transition-core';

// Mock dependencies - ALL mocks must be declared in vi.hoisted for ESM compatibility
const {
  mockLogger,
  mockThemeAnalytics,
  mockSupportsViewTransitions,
  mockRecordThemeTransition,
} = vi.hoisted(() => ({
  mockLogger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  mockThemeAnalytics: {
    recordThemePreference: vi.fn(),
  },
  mockSupportsViewTransitions: vi.fn(),
  mockRecordThemeTransition: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

vi.mock('@/lib/theme-analytics', () => ({
  themeAnalytics: mockThemeAnalytics,
}));

vi.mock('@/hooks/theme-transition-utils', () => ({
  DEFAULT_CONFIG: {
    animationDuration: 300,
    easing: 'ease-in-out',
  },
  recordThemeTransition: mockRecordThemeTransition,
  supportsViewTransitions: mockSupportsViewTransitions,
}));

describe('theme-transition-core', () => {
  let mockSetTheme: ReturnType<typeof vi.fn> & ((_theme: string) => void);
  let mockStartViewTransition: ReturnType<typeof vi.fn>;
  let mockPerformanceMark: ReturnType<typeof vi.fn>;
  let mockPerformanceNow: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetTheme = vi.fn() as ReturnType<typeof vi.fn> &
      ((_theme: string) => void);
    mockPerformanceMark = vi.fn();
    mockPerformanceNow = vi.fn().mockReturnValue(1000);

    vi.stubGlobal('performance', {
      mark: mockPerformanceMark,
      now: mockPerformanceNow,
    });

    const transitionPromise = Promise.resolve();
    mockStartViewTransition = vi.fn().mockReturnValue({
      ready: transitionPromise,
      finished: transitionPromise,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('executeThemeTransition', () => {
    describe('without View Transitions API support', () => {
      beforeEach(() => {
        mockSupportsViewTransitions.mockReturnValue(false);
      });

      it('calls original setTheme function', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          currentTheme: 'light',
        });

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
      });

      it('records theme preference', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
        });

        expect(mockThemeAnalytics.recordThemePreference).toHaveBeenCalledWith(
          'dark',
        );
      });

      it('logs debug message for unsupported API', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
        });

        expect(mockLogger.debug).toHaveBeenCalledWith(
          'View Transitions API not supported, using fallback',
        );
      });

      it('records transition without view transition', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          currentTheme: 'light',
        });

        expect(mockRecordThemeTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            fromTheme: 'light',
            toTheme: 'dark',
            hasViewTransition: false,
          }),
        );
      });

      it('uses unknown as default currentTheme', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
        });

        expect(mockRecordThemeTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            fromTheme: 'unknown',
            toTheme: 'dark',
          }),
        );
      });
    });

    describe('with View Transitions API support', () => {
      beforeEach(() => {
        mockSupportsViewTransitions.mockReturnValue(true);
        (
          document as Document & {
            startViewTransition: typeof document.startViewTransition;
          }
        ).startViewTransition =
          mockStartViewTransition as unknown as typeof document.startViewTransition;
      });

      it('calls startViewTransition', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          currentTheme: 'light',
        });

        expect(mockStartViewTransition).toHaveBeenCalled();
      });

      it('calls setTheme inside transition', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
        });

        const transitionCallback = mockStartViewTransition.mock
          .calls[0]![0] as () => void;
        transitionCallback();

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
      });

      it('records transition on success', async () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          currentTheme: 'light',
        });

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockRecordThemeTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            fromTheme: 'light',
            toTheme: 'dark',
            hasViewTransition: true,
          }),
        );
      });

      it('records performance mark', () => {
        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          currentTheme: 'light',
        });

        expect(mockPerformanceMark).toHaveBeenCalledWith(
          'theme-transition-light-start',
        );
      });

      it('handles animation setup callback', () => {
        const mockAnimationSetup = vi.fn();

        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          animationSetup: mockAnimationSetup,
        });

        expect(mockAnimationSetup).toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      beforeEach(() => {
        mockSupportsViewTransitions.mockReturnValue(true);
      });

      it('falls back to direct setTheme on startViewTransition error', () => {
        (
          document as Document & {
            startViewTransition: typeof mockStartViewTransition;
          }
        ).startViewTransition = vi.fn().mockImplementation(() => {
          throw new Error('Transition error');
        });

        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
        });

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to start view transition',
          expect.any(Object),
        );
      });

      it('records transition with error', () => {
        const error = new Error('Transition error');
        (
          document as Document & {
            startViewTransition: typeof mockStartViewTransition;
          }
        ).startViewTransition = vi.fn().mockImplementation(() => {
          throw error;
        });

        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
          currentTheme: 'light',
        });

        expect(mockRecordThemeTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            error,
            hasViewTransition: false,
          }),
        );
      });

      it('handles rejected finished promise', async () => {
        const error = new Error('Finished error');
        (
          document as Document & {
            startViewTransition: typeof mockStartViewTransition;
          }
        ).startViewTransition = vi.fn().mockReturnValue({
          ready: Promise.resolve(),
          finished: Promise.reject(error),
        });

        executeThemeTransition({
          originalSetTheme: mockSetTheme,
          newTheme: 'dark',
        });

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockLogger.error).toHaveBeenCalledWith(
          'View transition failed',
          expect.any(Object),
        );
      });

      it('handles setTheme error in fallback', () => {
        mockSetTheme.mockImplementation(() => {
          throw new Error('SetTheme error');
        });
        mockSupportsViewTransitions.mockReturnValue(false);

        expect(() =>
          executeThemeTransition({
            originalSetTheme: mockSetTheme,
            newTheme: 'dark',
          }),
        ).not.toThrow();

        expect(mockLogger.error).toHaveBeenCalled();
      });
    });
  });

  describe('executeBasicThemeTransition', () => {
    beforeEach(() => {
      mockSupportsViewTransitions.mockReturnValue(false);
    });

    it('calls executeThemeTransition with basic args', () => {
      executeBasicThemeTransition(mockSetTheme, 'dark', 'light');

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockThemeAnalytics.recordThemePreference).toHaveBeenCalledWith(
        'dark',
      );
    });

    it('works without currentTheme', () => {
      executeBasicThemeTransition(mockSetTheme, 'dark');

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('performance integration', () => {
    beforeEach(() => {
      mockSupportsViewTransitions.mockReturnValue(false);
    });

    it('records start and end time', () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1050);

      executeThemeTransition({
        originalSetTheme: mockSetTheme,
        newTheme: 'dark',
        currentTheme: 'light',
      });

      expect(mockRecordThemeTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: 1000,
        }),
      );
    });

    it('skips performance mark when window.performance is undefined', () => {
      vi.stubGlobal('window', { performance: undefined });

      executeThemeTransition({
        originalSetTheme: mockSetTheme,
        newTheme: 'dark',
      });

      expect(mockPerformanceMark).not.toHaveBeenCalled();
    });
  });
});
