/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AccessibilityManager,
  accessibilityManager,
  announceSwitching,
  announceThemeChange,
  useAccessibility,
} from '../accessibility';

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
  checkContrastCompliance: vi.fn().mockReturnValue(true),
  PERCENTAGE_CONSTANTS: {
    FULL: 100,
  },
}));

const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'document',
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'window',
);

describe('AccessibilityManager Global Exports', () => {
  // Mock DOM for tests
  beforeEach(() => {
    const mockElement = {
      textContent: '',
      setAttribute: vi.fn(),
      hasAttribute: vi.fn(),
      focus: vi.fn(),
      style: {},
    };

    const mockDocument = {
      createElement: vi.fn().mockReturnValue(mockElement),
      getElementById: vi.fn().mockReturnValue(null),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };

    const mockWindow = {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    };

    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: mockWindow,
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, 'document', originalDocumentDescriptor);
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
    }
  });

  it('should export global accessibility manager instance', () => {
    expect(accessibilityManager).toBeInstanceOf(AccessibilityManager);
  });

  it('should export bound convenience functions', () => {
    expect(typeof announceThemeChange).toBe('function');
    expect(typeof announceSwitching).toBe('function');
  });

  describe('useAccessibility hook', () => {
    it('should return accessibility utilities', () => {
      const result = useAccessibility();

      expect(result).toHaveProperty('announceThemeChange');
      expect(result).toHaveProperty('announceSwitching');
      expect(result).toHaveProperty('prefersReducedMotion');
      expect(result).toHaveProperty('prefersHighContrast');
      expect(result).toHaveProperty('prefersDarkColorScheme');
      expect(result).toHaveProperty('getColorSchemePreference');
      expect(result).toHaveProperty('checkColorContrast');
      expect(result).toHaveProperty('getAriaAttributes');
      expect(result).toHaveProperty('handleKeyboardNavigation');
      expect(result).toHaveProperty('manageFocus');
      expect(result).toHaveProperty('removeFocusIndicator');
    });

    it('should return functions that work correctly', () => {
      const { announceThemeChange: hookAnnounceThemeChange } =
        useAccessibility();

      expect(typeof hookAnnounceThemeChange).toBe('function');

      // Test that the function can be called without errors
      expect(() => {
        hookAnnounceThemeChange('light');
      }).not.toThrow();
    });

    it('should expose preference flags', () => {
      const { prefersReducedMotion, prefersHighContrast } = useAccessibility();

      expect(typeof prefersReducedMotion).toBe('boolean');
      expect(typeof prefersHighContrast).toBe('boolean');
    });

    it('should return keyboard navigation handler', () => {
      const { handleKeyboardNavigation } = useAccessibility();
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;
      const mockCallback = vi.fn();

      expect(typeof handleKeyboardNavigation).toBe('function');

      // Test that the function can be called
      expect(() => {
        handleKeyboardNavigation(mockEvent, mockCallback);
      }).not.toThrow();
    });

    it('should return focus management utilities', () => {
      const { manageFocus, removeFocusIndicator } = useAccessibility();
      const mockElement = {
        hasAttribute: vi.fn().mockReturnValue(false),
        setAttribute: vi.fn(),
        focus: vi.fn(),
        style: {},
      } as unknown as HTMLElement;

      expect(typeof manageFocus).toBe('function');
      expect(typeof removeFocusIndicator).toBe('function');

      // Test that focus management functions work
      expect(() => {
        manageFocus(mockElement);
        removeFocusIndicator(mockElement);
      }).not.toThrow();
    });

    it('should return color contrast checker', () => {
      const { checkColorContrast } = useAccessibility();

      expect(typeof checkColorContrast).toBe('function');

      // Test that color contrast checker returns boolean
      const result = checkColorContrast('#000000', '#ffffff');
      expect(typeof result).toBe('boolean');
    });

    it('should return ARIA attributes generator', () => {
      const { getAriaAttributes } = useAccessibility();

      expect(typeof getAriaAttributes).toBe('function');

      // Test that ARIA attributes generator returns object
      const result = getAriaAttributes('light', true);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('aria-label');
      expect(result).toHaveProperty('aria-pressed');
      expect(result).toHaveProperty('aria-expanded');
      expect(result).toHaveProperty('role');
    });
  });

  describe('Bound convenience functions', () => {
    it('should call announceThemeChange on global instance', () => {
      const spy = vi.spyOn(accessibilityManager, 'announceThemeChange');

      announceThemeChange('dark');

      expect(spy).toHaveBeenCalledWith('dark');
      spy.mockRestore();
    });

    it('should call announceSwitching on global instance', () => {
      const spy = vi.spyOn(accessibilityManager, 'announceSwitching');

      announceSwitching();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
