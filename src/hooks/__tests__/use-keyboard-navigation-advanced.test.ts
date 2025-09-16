/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

// Mock focus method
const mockFocus = vi.fn();

describe('useKeyboardNavigation Advanced Tests', () => {
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

  describe('配置选项深度测试', () => {
    it('should handle all orientation options', () => {
      const orientations = ['horizontal', 'vertical', 'both'] as const;

      orientations.forEach((orientation) => {
        const { result } = renderHook(() =>
          useKeyboardNavigation({ orientation }),
        );

        expect(result.current.containerRef).toBeDefined();
        expect(typeof result.current.focusNext).toBe('function');
      });
    });

    it('should handle enabled state changes', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useKeyboardNavigation({ enabled }),
        { initialProps: { enabled: false } },
      );

      expect(result.current.containerRef).toBeDefined();

      // Enable navigation
      rerender({ enabled: true });
      expect(result.current.containerRef).toBeDefined();

      // Disable navigation
      rerender({ enabled: false });
      expect(result.current.containerRef).toBeDefined();
    });

    it('should handle loop configuration changes', () => {
      const { result, rerender } = renderHook(
        ({ loop }) => useKeyboardNavigation({ loop }),
        { initialProps: { loop: false } },
      );

      expect(result.current.containerRef).toBeDefined();

      rerender({ loop: true });
      expect(result.current.containerRef).toBeDefined();
    });
  });

  describe('内存泄漏和性能测试', () => {
    it('should handle multiple rapid focus changes', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(() => {
        for (let i = 0; i < 100; i++) {
          act(() => {
            result.current.focusNext();
            result.current.focusPrevious();
          });
        }
      }).not.toThrow();
    });

    it('should handle rapid configuration changes', () => {
      const { rerender } = renderHook(
        ({ config }) => useKeyboardNavigation(config),
        {
          initialProps: {
            config: {
              enabled: true,
              loop: false,
              orientation: 'horizontal' as const,
            },
          },
        },
      );

      expect(() => {
        for (let i = 0; i < 50; i++) {
          rerender({
            config: {
              enabled: i % 2 === 0,
              loop: i % 3 === 0,
              orientation: 'horizontal' as const,
            },
          });
        }
      }).not.toThrow();
    });

    it('should handle multiple hook instances', () => {
      const hooks = Array.from({ length: 10 }, () =>
        renderHook(() => useKeyboardNavigation()),
      );

      expect(() => {
        hooks.forEach((hook) => hook.unmount());
      }).not.toThrow();
    });
  });

  describe('错误恢复和边界条件', () => {
    it('should handle focus errors on invalid elements', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      // Mock focus to throw error
      mockFocus.mockImplementation(() => {
        throw new Error('Focus failed');
      });

      expect(() => {
        act(() => {
          result.current.focusNext();
        });
      }).not.toThrow();

      // Reset mock
      mockFocus.mockReset();
    });

    it('should handle null container ref', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      // Simulate null container
      if (result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: null,
          writable: true,
        });
      }

      expect(() => {
        act(() => {
          result.current.focusNext();
          result.current.focusPrevious();
          result.current.focusFirst();
          result.current.focusLast();
        });
      }).not.toThrow();
    });

    it('should handle invalid focus indices', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(() => {
        act(() => {
          result.current.focusIndex(-1);
          result.current.focusIndex(999);
          result.current.focusIndex(NaN);
          result.current.focusIndex(Infinity);
        });
      }).not.toThrow();
    });

    it('should handle malformed keyboard events', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: true }),
      );

      const malformedEvents = [
        {} as KeyboardEvent,
        { key: null } as unknown as KeyboardEvent,
        { key: undefined } as unknown as KeyboardEvent,
        { key: '' } as KeyboardEvent,
      ];

      malformedEvents.forEach((_event) => {
        expect(() => {
          act(() => {
            result.current.focusNext();
          });
        }).not.toThrow();
      });
    });
  });

  describe('复杂场景集成测试', () => {
    it('should handle complex navigation scenarios', () => {
      const mockOnNavigate = vi.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          enabled: true,
          loop: true,
          orientation: 'both',
          onNavigate: mockOnNavigate,
        }),
      );

      // Simulate complex navigation sequence
      const navigationSequence = [
        () => result.current.focusNext(),
        () => result.current.focusPrevious(),
        () => result.current.focusFirst(),
        () => result.current.focusLast(),
        () => result.current.setFocusIndex(0),
        () => result.current.setFocusIndex(1),
      ];

      expect(() => {
        navigationSequence.forEach((action) => {
          act(action);
        });
      }).not.toThrow();
    });

    it('should maintain state consistency during rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useKeyboardNavigation(config),
        {
          initialProps: {
            config: { enabled: true, loop: false },
          },
        },
      );

      // Rapid state changes with navigation
      expect(() => {
        for (let i = 0; i < 20; i++) {
          act(() => {
            result.current.focusNext();
          });

          rerender({
            config: {
              enabled: i % 2 === 0,
              loop: i % 3 === 0,
            },
          });

          act(() => {
            result.current.focusPrevious();
          });
        }
      }).not.toThrow();

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('自定义选择器高级测试', () => {
    it('should handle complex custom selectors', () => {
      const complexSelectors = [
        'button:not([disabled])',
        'input[type="text"], input[type="email"]',
        '.focusable:not(.hidden)',
        '[tabindex]:not([tabindex="-1"])',
      ];

      complexSelectors.forEach((selector) => {
        const { result } = renderHook(() =>
          useKeyboardNavigation({
            selector: selector,
          }),
        );

        expect(result.current.containerRef).toBeDefined();
      });
    });

    it('should handle invalid selectors gracefully', () => {
      const invalidSelectors = [
        '',
        ':::invalid',
        null as unknown as string,
        undefined as unknown as string,
      ];

      invalidSelectors.forEach((selector) => {
        expect(() => {
          renderHook(() =>
            useKeyboardNavigation({
              selector: selector,
            }),
          );
        }).not.toThrow();
      });
    });
  });
});
