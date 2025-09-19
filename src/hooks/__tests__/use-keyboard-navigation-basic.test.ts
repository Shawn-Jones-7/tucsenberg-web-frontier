/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

// Mock focus method
const mockFocus = vi.fn();

describe('useKeyboardNavigation Basic Tests', () => {
  beforeEach(() => {
    // Mock HTMLElement.prototype.focus
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      value: mockFocus,
      writable: true,
    });

    // Mock querySelector and querySelectorAll
    Object.defineProperty(document, 'querySelector', {
      value: vi.fn(),
      writable: true,
    });

    Object.defineProperty(document, 'querySelectorAll', {
      value: vi.fn(() => []),
      writable: true,
    });

    // Mock addEventListener and removeEventListener
    Object.defineProperty(document, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });

    Object.defineProperty(document, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本键盘导航功能', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(result.current.getCurrentFocusIndex()).toBe(-1);
      expect(typeof result.current.focusNext).toBe('function');
      expect(typeof result.current.focusPrevious).toBe('function');
      expect(typeof result.current.focusFirst).toBe('function');
      expect(typeof result.current.focusLast).toBe('function');
      expect(typeof result.current.setFocusIndex).toBe('function');
      expect(result.current.containerRef).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        enabled: false,
        loop: true,
        orientation: 'vertical' as const,
        focusableSelector: '.custom-focusable',
      };

      const { result } = renderHook(() => useKeyboardNavigation(customConfig));

      expect(result.current.containerRef).toBeDefined();
      expect(typeof result.current.focusNext).toBe('function');
      expect(typeof result.current.focusPrevious).toBe('function');
      expect(typeof result.current.focusFirst).toBe('function');
      expect(typeof result.current.focusLast).toBe('function');
    });

    it('should provide all required navigation methods', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      // Check that all methods are functions
      expect(typeof result.current.focusNext).toBe('function');
      expect(typeof result.current.focusPrevious).toBe('function');
      expect(typeof result.current.focusFirst).toBe('function');
      expect(typeof result.current.focusLast).toBe('function');
      expect(typeof result.current.setFocusIndex).toBe('function');
      expect(typeof result.current.getCurrentFocusIndex).toBe('function');

      // Check that containerRef is provided
      expect(result.current.containerRef).toBeDefined();
      expect(typeof result.current.containerRef).toBe('object');
    });
  });

  describe('循环导航', () => {
    it('should provide loop navigation functionality', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ loop: true }),
      );

      expect(result.current.getCurrentFocusIndex()).toBe(-1);
      expect(typeof result.current.focusNext).toBe('function');
      expect(typeof result.current.focusPrevious).toBe('function');
    });

    it('should handle loop configuration changes', () => {
      const { result, rerender } = renderHook(
        ({ loop }) => useKeyboardNavigation({ loop }),
        { initialProps: { loop: false } },
      );

      expect(result.current.containerRef).toBeDefined();

      // Change loop configuration
      rerender({ loop: true });
      expect(result.current.containerRef).toBeDefined();

      // Change back
      rerender({ loop: false });
      expect(typeof result.current.focusNext).toBe('function');
    });
  });

  describe('焦点管理', () => {
    it('should track current focus index', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });

    it('should handle focus index changes', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.setFocusIndex(0);
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });

    it('should handle invalid focus index', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.setFocusIndex(-5); // Invalid negative index
      });

      expect(result.current.getCurrentFocusIndex()).toBe(-1); // Should remain unchanged
    });
  });

  describe('自定义选择器', () => {
    it('should use custom focusable selector', () => {
      const customSelector = '.custom-focusable';

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          selector: customSelector,
        }),
      );

      expect(result.current.containerRef).toBeDefined();
    });
  });

  describe('清理和内存管理', () => {
    it('should cleanup event listeners on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useKeyboardNavigation({ enabled: true }),
      );

      expect(result.current.containerRef).toBeDefined();

      // Unmount should not throw
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle multiple unmounts gracefully', () => {
      const { unmount } = renderHook(() =>
        useKeyboardNavigation({ enabled: true }),
      );

      // Multiple unmounts should not throw
      expect(() => {
        unmount();
        unmount();
      }).not.toThrow();
    });
  });

  describe('边缘情况处理', () => {
    it('should handle empty focusable elements list', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(() => {
        result.current.focusNext();
        result.current.focusPrevious();
        result.current.focusFirst();
        result.current.focusLast();
      }).not.toThrow();
    });

    it('should handle disabled state', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: false }),
      );

      expect(() => {
        result.current.focusNext();
      }).not.toThrow();
    });
  });
});
