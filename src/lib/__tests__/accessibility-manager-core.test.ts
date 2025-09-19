/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AccessibilityManager,
  KEYBOARD_KEYS,
  THEME_ANNOUNCEMENTS,
} from '../accessibility';

// vi.hoisted Mock setup
const mockLogger = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

// Mock modules
vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
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

describe('AccessibilityManager Core Tests', () => {
  let mockElement: any;
  let mockDocument: any;
  let mockWindow: any;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock DOM element
    mockElement = {
      textContent: '',
      setAttribute: vi.fn(),
      hasAttribute: vi.fn(),
      focus: vi.fn(),
      style: {},
    };

    // Mock document
    mockDocument = {
      createElement: vi.fn().mockReturnValue(mockElement),
      getElementById: vi.fn().mockReturnValue(null),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };

    // Mock window
    mockWindow = {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    };

    // Set up global mocks
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
    vi.useRealTimers();
    vi.clearAllMocks();
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, 'document', originalDocumentDescriptor);
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
    }
  });

  describe('Constants', () => {
    it('should export THEME_ANNOUNCEMENTS with correct structure', () => {
      expect(THEME_ANNOUNCEMENTS).toHaveProperty('zh');
      expect(THEME_ANNOUNCEMENTS).toHaveProperty('en');

      expect(THEME_ANNOUNCEMENTS.zh).toEqual({
        light: '已切换到明亮模式',
        dark: '已切换到深色模式',
        system: '已切换到系统模式',
        switching: '正在切换主题...',
      });
    });

    it('should export KEYBOARD_KEYS with correct values', () => {
      expect(KEYBOARD_KEYS).toEqual({
        ENTER: 'Enter',
        SPACE: ' ',
        ESCAPE: 'Escape',
        ARROW_UP: 'ArrowUp',
        ARROW_DOWN: 'ArrowDown',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_RIGHT: 'ArrowRight',
      });
    });
  });

  describe('AccessibilityManager Constructor', () => {
    it('should create instance with default config', () => {
      const manager = new AccessibilityManager();
      expect(manager).toBeInstanceOf(AccessibilityManager);
    });

    it('should create live region on initialization', () => {
      new AccessibilityManager();

      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'id',
        'accessibility-live-region',
      );
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'aria-live',
        'polite',
      );
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'aria-atomic',
        'true',
      );
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    it('should handle SSR environment gracefully', () => {
      const globalWithDocument = globalThis as { document?: Document };
      const originalDocument = globalWithDocument.document;
      delete globalWithDocument.document;

      expect(() => {
        new AccessibilityManager();
      }).not.toThrow();

      // Restore document
      if (originalDocument) {
        globalWithDocument.document = originalDocument;
      }
    });
  });

  describe('announceThemeChange', () => {
    it('should announce theme change with correct message', () => {
      const manager = new AccessibilityManager();

      manager.announceThemeChange('light');

      expect(mockElement.textContent).toBe('已切换到明亮模式');
    });

    it('should clear message after delay', () => {
      const manager = new AccessibilityManager();

      manager.announceThemeChange('dark');
      expect(mockElement.textContent).toBe('已切换到深色模式');

      vi.advanceTimersByTime(1000); // clearDelay
      expect(mockElement.textContent).toBe('');
    });
  });

  describe('announceSwitching', () => {
    it('should announce switching message', () => {
      const manager = new AccessibilityManager();

      manager.announceSwitching();

      expect(mockElement.textContent).toBe('正在切换主题...');
    });

    it('should clear switching message after delay', () => {
      const manager = new AccessibilityManager();

      manager.announceSwitching();
      expect(mockElement.textContent).toBe('正在切换主题...');

      vi.advanceTimersByTime(1000); // clearDelay

      expect(mockElement.textContent).toBe('');
    });
  });

  describe('cleanup', () => {
    it('should remove live region from DOM', () => {
      const manager = new AccessibilityManager();

      manager.cleanup();

      expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockElement);
    });

    it('should handle cleanup errors gracefully', () => {
      const manager = new AccessibilityManager();
      mockDocument.body.removeChild.mockImplementation(() => {
        throw new Error('removeChild failed');
      });

      expect(() => {
        manager.cleanup();
      }).toThrow('removeChild failed');
    });
  });
});
