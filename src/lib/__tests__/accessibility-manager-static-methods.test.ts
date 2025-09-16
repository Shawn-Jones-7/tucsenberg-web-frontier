/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityUtils } from '@/lib/accessibility';

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

describe('AccessibilityManager Static Methods', () => {
  let mockWindow: any;

  beforeEach(() => {
    // Mock window
    mockWindow = {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    };

    global.window = mockWindow as unknown as Window;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('should return false in SSR environment', () => {
      const originalWindow = global.window;
      delete (global as unknown).window;

      const result = AccessibilityUtils.prefersReducedMotion();
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it('should return true when user prefers reduced motion', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });

      const result = AccessibilityUtils.prefersReducedMotion();
      expect(result).toBe(true);
      expect(mockWindow.matchMedia).toHaveBeenCalledWith(
        '(prefers-reduced-motion: reduce)',
      );
    });

    it('should return false when user does not prefer reduced motion', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: false });

      const result = AccessibilityUtils.prefersReducedMotion();
      expect(result).toBe(false);
    });
  });

  describe('prefersHighContrast', () => {
    it('should return true when user prefers high contrast', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(true);
      expect(mockWindow.matchMedia).toHaveBeenCalledWith(
        '(prefers-contrast: high)',
      );
    });

    it('should return false when user does not prefer high contrast', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: false });

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(false);
    });

    it('should handle SSR environment', () => {
      const originalWindow = global.window;
      delete (global as unknown).window;

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it('should handle matchMedia not supported', () => {
      const originalMatchMedia = global.window.matchMedia;
      delete global.window.matchMedia;

      const result = AccessibilityUtils.prefersHighContrast();
      expect(result).toBe(false);

      global.window.matchMedia = originalMatchMedia;
    });
  });

  describe('prefersDarkColorScheme', () => {
    it('should return true when user prefers dark color scheme', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(true);
      expect(mockWindow.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)',
      );
    });

    it('should return false when user does not prefer dark color scheme', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: false });

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(false);
    });

    it('should handle SSR environment', () => {
      const originalWindow = global.window;
      delete (global as unknown).window;

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it('should handle matchMedia not supported', () => {
      const originalMatchMedia = global.window.matchMedia;
      delete global.window.matchMedia;

      const result = AccessibilityUtils.prefersDarkColorScheme();
      expect(result).toBe(false);

      global.window.matchMedia = originalMatchMedia;
    });
  });

  describe('getColorSchemePreference', () => {
    it('should return "dark" when user prefers dark', () => {
      mockWindow.matchMedia
        .mockReturnValueOnce({ matches: true }) // dark query
        .mockReturnValueOnce({ matches: false }); // light query

      const result = AccessibilityUtils.getColorSchemePreference();
      expect(result).toBe('dark');
    });

    it('should return "light" when user prefers light', () => {
      mockWindow.matchMedia
        .mockReturnValueOnce({ matches: false }) // dark query
        .mockReturnValueOnce({ matches: true }); // light query

      const result = AccessibilityUtils.getColorSchemePreference();
      expect(result).toBe('light');
    });

    it('should return "no-preference" when no preference', () => {
      mockWindow.matchMedia
        .mockReturnValueOnce({ matches: false }) // dark query
        .mockReturnValueOnce({ matches: false }); // light query

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
          lightness: expect.any(Number),
          chroma: expect.any(Number),
          hue: expect.any(Number),
          alpha: expect.any(Number),
        }),
        expect.objectContaining({
          lightness: expect.any(Number),
          chroma: expect.any(Number),
          hue: expect.any(Number),
          alpha: expect.any(Number),
        }),
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
