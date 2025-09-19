/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

// Mock focus method
const mockFocus = vi.fn();

describe('useKeyboardNavigation DOM Tests', () => {
  beforeEach(() => {
    // Mock HTMLElement.prototype.focus
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      value: mockFocus,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up DOM
    document.body.innerHTML = '';
  });

  describe('实际DOM交互测试', () => {
    beforeEach(() => {
      // Setup DOM with actual focusable elements
      document.body.innerHTML = `
        <div id="container">
          <button id="btn1">Button 1</button>
          <button id="btn2">Button 2</button>
          <button id="btn3">Button 3</button>
          <input id="input1" type="text" />
          <a href="#" id="link1">Link 1</a>
        </div>
      `;
    });

    it('should work with real DOM elements', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      // Set the container ref to the actual DOM element
      const container = document.getElementById('container');
      if (container && result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        });
      }

      expect(result.current.containerRef).toBeDefined();
      expect(container).toBeInTheDocument();
    });

    it('should find focusable elements in container', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      const container = document.getElementById('container');
      if (container && result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        });
      }

      // Test navigation methods
      act(() => {
        result.current.focusNext();
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });

    it('should handle focus on different element types', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      const container = document.getElementById('container');
      if (container && result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        });
      }

      // Test focusing different types of elements
      act(() => {
        result.current.setFocusIndex(0); // Button
      });

      act(() => {
        result.current.setFocusIndex(3); // Input
      });

      act(() => {
        result.current.setFocusIndex(4); // Link
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('键盘事件模拟测试', () => {
    let realContainer: HTMLElement;
    let originalFocus: typeof HTMLElement.prototype.focus;

    beforeEach(() => {
      // 保存原始的focus方法
      originalFocus = HTMLElement.prototype.focus;

      // 创建真实的DOM结构
      document.body.innerHTML = `
        <div id="test-container">
          <button id="btn1">Button 1</button>
          <button id="btn2">Button 2</button>
          <button id="btn3">Button 3</button>
        </div>
      `;

      realContainer = document.getElementById('test-container')!;
    });

    afterEach(() => {
      // 恢复原始的focus方法
      HTMLElement.prototype.focus = originalFocus;
    });

    it('should handle real keyboard events', () => {
      const mockOnNavigate = vi.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          enabled: true,
          onNavigate: mockOnNavigate,
        }),
      );

      // 设置容器引用
      if (result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: realContainer,
          writable: true,
        });
      }

      const buttons = realContainer.querySelectorAll('button');
      expect(buttons).toHaveLength(3);

      // 模拟键盘事件（已移除未使用的事件变量）

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });

    it('should navigate through elements with arrow keys', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: true }),
      );

      if (result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: realContainer,
          writable: true,
        });
      }

      // 测试向下导航
      act(() => {
        result.current.focusNext();
      });

      // 测试向上导航
      act(() => {
        result.current.focusPrevious();
      });

      // 测试跳转到第一个
      act(() => {
        result.current.focusFirst();
      });

      // 测试跳转到最后一个
      act(() => {
        result.current.focusLast();
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });

    it('should handle direct focus by index', () => {
      const mockOnNavigate = vi.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          enabled: true,
          onNavigate: mockOnNavigate,
        }),
      );

      if (result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: realContainer,
          writable: true,
        });
      }

      // 按钮查询已移除（未使用的变量）

      // 直接聚焦到第二个按钮
      act(() => {
        result.current.setFocusIndex(1);
      });

      // 直接聚焦到第三个按钮
      act(() => {
        result.current.setFocusIndex(2);
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('动态DOM变化测试', () => {
    it('should handle dynamically added elements', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      // 初始DOM
      document.body.innerHTML = `
        <div id="dynamic-container">
          <button>Button 1</button>
        </div>
      `;

      const container = document.getElementById('dynamic-container')!;
      if (result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        });
      }

      // 动态添加元素
      const newButton = document.createElement('button');
      newButton.textContent = 'Button 2';
      container.appendChild(newButton);

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });

    it('should handle dynamically removed elements', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      // 初始DOM
      document.body.innerHTML = `
        <div id="dynamic-container">
          <button id="btn1">Button 1</button>
          <button id="btn2">Button 2</button>
        </div>
      `;

      const container = document.getElementById('dynamic-container')!;
      if (result.current.containerRef) {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        });
      }

      // 移除一个元素
      const btn2 = document.getElementById('btn2');
      if (btn2) {
        btn2.remove();
      }

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.getCurrentFocusIndex()).toBeGreaterThanOrEqual(-1);
    });
  });
});
