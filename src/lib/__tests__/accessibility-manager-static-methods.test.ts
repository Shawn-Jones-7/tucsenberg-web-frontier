/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityUtils } from '@/lib/accessibility';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'window',
);

const createMediaQueryList = (
  matches: boolean,
  media?: string,
): MediaQueryList =>
  ({
    matches,
    media: media ?? '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }) as unknown as MediaQueryList;

// vi.hoisted Mock setup
const mockCheckContrastCompliance = vi.hoisted(() => vi.fn());

// Mock modules
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/lib/colors', () => ({
  checkContrastCompliance: mockCheckContrastCompliance,
  PERCENTAGE_CONSTANTS: {
    FULL: 100,
  },
}));

const setGlobalWindow = (value: Window | undefined) => {
  Object.defineProperty(globalThis, 'window', {
    value,
    configurable: true,
    writable: true,
  });
};

type MatchMediaMock = ReturnType<
  typeof vi.fn<(query: string) => MediaQueryList>
>;

let matchMediaMock: MatchMediaMock;
let mockWindow: Window & { matchMedia: MatchMediaMock };

describe('AccessibilityManager Static Methods', () => {
  beforeEach(() => {
    matchMediaMock = vi.fn<(query: string) => MediaQueryList>((query) =>
      createMediaQueryList(false, query),
    );

    mockWindow = {
      matchMedia: matchMediaMock,
    } as unknown as Window & { matchMedia: MatchMediaMock };

    setGlobalWindow(mockWindow);
  });

  afterEach(() => {
    vi.clearAllMocks();

    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
    } else {
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'window');
    }
  });

  describe('prefersReducedMotion', () => {
    it('should return false in SSR environment', () => {
      const originalWindow = globalThis.window;
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'window');

      const result = AccessibilityUtils.prefersReducedMotion();
      expect(result).toBe(false);

      setGlobalWindow(originalWindow as unknown as Window);
    });

    it('should return true when user prefers reduced motion', () => {
      matchMediaMock.mockReturnValue(
        createMediaQueryList(true, '(prefers-reduced-motion: reduce)'),
      );

      const result = AccessibilityUtils.prefersReducedMotion();
      expect(result).toBe(true);
      expect(matchMediaMock).toHaveBeenCalledWith(
        '(prefers-reduced-motion: reduce)',
      );
    });

    it('should return false when user does not prefer reduced motion', () => {
      matchMediaMock.mockReturnValue(
        createMediaQueryList(false, '(prefers-reduced-motion: reduce)'),
      );

      const result = AccessibilityUtils.prefersReducedMotion();
      expect(result).toBe(false);
    });
  });

  describe('prefersHighContrast', () => {
    it('should return true when user prefers high contrast', () => {
      matchMediaMock.mockReturnValue(
        createMediaQueryList(true, '(prefers-contrast: high)'),
      );

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(true);
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-contrast: high)');
    });

    it('should return false when user does not prefer high contrast', () => {
      matchMediaMock.mockReturnValue(
        createMediaQueryList(false, '(prefers-contrast: high)'),
      );

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(false);
    });

    it('should handle SSR environment', () => {
      const originalWindow = globalThis.window;
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'window');

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(false);

      setGlobalWindow(originalWindow as unknown as Window);
    });

    it('should handle matchMedia not supported', () => {
      const originalMatchMedia = globalThis.window.matchMedia;
      Object.defineProperty(globalThis.window, 'matchMedia', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(false);

      Object.defineProperty(globalThis.window, 'matchMedia', {
        value: originalMatchMedia,
        configurable: true,
        writable: true,
      });
    });
  });

  describe('prefersDarkColorScheme', () => {
    it('should return true when user prefers dark color scheme', () => {
      matchMediaMock.mockReturnValue(
        createMediaQueryList(true, '(prefers-color-scheme: dark)'),
      );

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(true);
      expect(matchMediaMock).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)',
      );
    });

    it('should return false when user does not prefer dark color scheme', () => {
      matchMediaMock.mockReturnValue(
        createMediaQueryList(false, '(prefers-color-scheme: dark)'),
      );

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(false);
    });

    it('should handle SSR environment', () => {
      const originalWindow = globalThis.window;
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'window');

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(false);

      setGlobalWindow(originalWindow as unknown as Window);
    });

    it('should handle matchMedia not supported', () => {
      const originalMatchMedia = globalThis.window.matchMedia;
      Object.defineProperty(globalThis.window, 'matchMedia', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(false);

      Object.defineProperty(globalThis.window, 'matchMedia', {
        value: originalMatchMedia,
        configurable: true,
        writable: true,
      });
    });
  });

  describe('getColorSchemePreference', () => {
    it('should return "dark" when user prefers dark', () => {
      matchMediaMock
        .mockReturnValueOnce(
          createMediaQueryList(true, '(prefers-color-scheme: dark)'),
        )
        .mockReturnValueOnce(
          createMediaQueryList(false, '(prefers-color-scheme: light)'),
        );

      const result = AccessibilityUtils.getColorSchemePreference();
      expect(result).toBe('dark');
    });

    it('should return "light" when user prefers light', () => {
      matchMediaMock
        .mockReturnValueOnce(
          createMediaQueryList(false, '(prefers-color-scheme: dark)'),
        )
        .mockReturnValueOnce(
          createMediaQueryList(true, '(prefers-color-scheme: light)'),
        );

      const result = AccessibilityUtils.getColorSchemePreference();
      expect(result).toBe('light');
    });

    it('should return "no-preference" when no preference', () => {
      matchMediaMock
        .mockReturnValueOnce(
          createMediaQueryList(false, '(prefers-color-scheme: dark)'),
        )
        .mockReturnValueOnce(
          createMediaQueryList(false, '(prefers-color-scheme: light)'),
        );

      const result = AccessibilityUtils.getColorSchemePreference();
      expect(result).toBe('no-preference');
    });
  });

  describe('checkColorContrast', () => {
    beforeEach(() => {
      mockCheckContrastCompliance.mockReturnValue(true);
    });

    it('should check contrast compliance', () => {
      const result = AccessibilityUtils.checkColorContrast(
        '#000000',
        '#ffffff',
      );

      expect(result).toBe(true);
      expect(mockCheckContrastCompliance).toHaveBeenCalledWith(
        expect.objectContaining({
          l: expect.any(Number),
          c: expect.any(Number),
          h: expect.any(Number),
          alpha: expect.any(Number),
        }),
        expect.objectContaining({
          l: expect.any(Number),
          c: expect.any(Number),
          h: expect.any(Number),
          alpha: expect.any(Number),
        }),
        'AA',
      );
    });

    it('should return false for invalid colors', () => {
      const result = AccessibilityUtils.checkColorContrast('invalid', 'color');

      expect(result).toBe(false);
      expect(mockCheckContrastCompliance).not.toHaveBeenCalled();
    });
  });

  describe('getAriaAttributes', () => {
    it('should return correct ARIA attributes', () => {
      const result = AccessibilityUtils.getAriaAttributes('light', true);

      expect(result).toEqual({
        'aria-label': '主题切换按钮，当前主题：light',
        'aria-pressed': 'true',
        'aria-expanded': 'true',
        'role': 'button',
      });
    });

    it('should handle collapsed state', () => {
      const result = AccessibilityUtils.getAriaAttributes('dark', false);

      expect(result['aria-expanded']).toBe('false');
    });
  });
});
