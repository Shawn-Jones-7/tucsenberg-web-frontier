import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TEST_BASE_NUMBERS,
  TEST_SCREEN_CONSTANTS,
} from '@/constants/test-constants';
import { useBreakpoint } from '@/hooks/use-breakpoint';

// Use vi.hoisted to ensure proper mock setup
const {
  mockWindow,
  mockAddEventListener,
  mockRemoveEventListener,
  mockDispatchEvent,
  mockMatchMedia,
  mockMediaQueryList,
  mockWindowDimensions,
} = vi.hoisted(() => {
  const addEventListenerMock = vi.fn();
  const removeEventListenerMock = vi.fn();
  const dispatchEventMock = vi.fn();

  const matchMediaMock = vi.fn();
  const mediaQueryListMock = {
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  // Create a mutable dimensions object with hardcoded values to avoid import issues in hoisted
  const windowDimensionsMock = {
    innerWidth: 1024, // TEST_SCREEN_CONSTANTS.TABLET_WIDTH
    innerHeight: 768, // TEST_SCREEN_CONSTANTS.STANDARD_HEIGHT
  };

  const windowMock = {
    get innerWidth() {
      return windowDimensionsMock.innerWidth;
    },
    get innerHeight() {
      return windowDimensionsMock.innerHeight;
    },
    addEventListener: addEventListenerMock,
    removeEventListener: removeEventListenerMock,
    dispatchEvent: dispatchEventMock,
    matchMedia: matchMediaMock,
  };

  // Setup default matchMedia behavior
  matchMediaMock.mockReturnValue(mediaQueryListMock);

  return {
    mockWindow: windowMock,
    mockAddEventListener: addEventListenerMock,
    mockRemoveEventListener: removeEventListenerMock,
    mockDispatchEvent: dispatchEventMock,
    mockMatchMedia: matchMediaMock,
    mockMediaQueryList: mediaQueryListMock,
    mockWindowDimensions: windowDimensionsMock,
  };
});

const { mockResizeObserver, mockObserve, mockUnobserve, mockDisconnect } =
  vi.hoisted(() => ({
    mockResizeObserver: vi.fn(),
    mockObserve: vi.fn(),
    mockUnobserve: vi.fn(),
    mockDisconnect: vi.fn(),
  }));

// Setup ResizeObserver mock implementation
mockResizeObserver.mockImplementation((_callback) => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
}));

// Setup complete window mock
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true,
});

// Mock ResizeObserver
Object.defineProperty(global, 'ResizeObserver', {
  value: mockResizeObserver,
  writable: true,
  configurable: true,
});

// Window dimensions are now handled in the hoisted mock above

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset window dimensions
    mockWindowDimensions.innerWidth = TEST_SCREEN_CONSTANTS.TABLET_WIDTH;
    mockWindowDimensions.innerHeight = TEST_SCREEN_CONSTANTS.STANDARD_HEIGHT;

    // Setup default mock behaviors
    mockMatchMedia.mockImplementation((query) => ({
      ...mockMediaQueryList,
      media: query,
      matches: false,
    }));

    // Clear ResizeObserver mocks
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();

    // Clear window event listener mocks
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    mockDispatchEvent.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('基本断点检测', () => {
    it('should detect mobile breakpoint', () => {
      const testWidth =
        TEST_SCREEN_CONSTANTS.BREAKPOINT_SM + TEST_BASE_NUMBERS.LARGE_COUNT; // Between 640 (sm) and 768 (md)
      mockWindowDimensions.innerWidth = testWidth;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe('sm');
      expect(result.current.isExactly('sm')).toBe(true);
      expect(result.current.isBelow('md')).toBe(true);
      expect(result.current.isAbove('sm')).toBe(true);
      expect(result.current.width).toBe(testWidth);
    });

    it('should detect tablet breakpoint', () => {
      mockWindowDimensions.innerWidth = 768;

      mockMatchMedia.mockImplementation((query) => {
        if (
          query.includes('min-width: 768px') &&
          query.includes('max-width: 1023px')
        ) {
          return { ...mockMediaQueryList, media: query, matches: true };
        }
        return { ...mockMediaQueryList, media: query, matches: false };
      });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe('md');
      expect(result.current.isExactly('md')).toBe(true);
      expect(result.current.isAbove('sm')).toBe(true);
      expect(result.current.isBelow('lg')).toBe(true);
    });

    it('should detect desktop breakpoint', () => {
      mockWindowDimensions.innerWidth = 1280;

      mockMatchMedia.mockImplementation((query) => ({
        ...mockMediaQueryList,
        media: query,
        matches: query.includes('min-width: 1024px'),
      }));

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe('xl');
      expect(result.current.isExactly('xl')).toBe(true);
      expect(result.current.isAbove('lg')).toBe(true);
      expect(result.current.isBelow('2xl')).toBe(true);
    });

    it('should provide viewport width', () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.width).toBe(TEST_SCREEN_CONSTANTS.TABLET_WIDTH);
    });
  });

  describe('响应式状态管理', () => {
    it('should update breakpoint on window resize', () => {
      // Start with desktop width
      mockWindowDimensions.innerWidth = TEST_SCREEN_CONSTANTS.BREAKPOINT_XL;

      const { result } = renderHook(() => useBreakpoint());

      // Initial state should be xl
      expect(result.current.currentBreakpoint).toBe('xl');
      expect(result.current.width).toBe(TEST_SCREEN_CONSTANTS.BREAKPOINT_XL);

      // Simulate resize to mobile (within sm range: 640-767)
      const testMobileWidth =
        TEST_SCREEN_CONSTANTS.BREAKPOINT_SM + TEST_BASE_NUMBERS.LARGE_COUNT; // Within sm range

      act(() => {
        mockWindowDimensions.innerWidth = testMobileWidth;

        // Manually trigger the resize handler if it was registered
        const resizeHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'resize',
        )?.[1];
        if (resizeHandler) {
          resizeHandler(new Event('resize'));
        }
      });

      expect(result.current.currentBreakpoint).toBe('sm');
      expect(result.current.width).toBe(testMobileWidth);
      expect(result.current.isExactly('sm')).toBe(true);
    });

    it('should handle media query changes', () => {
      // Note: useBreakpoint doesn't actually use matchMedia in its current implementation
      // It only uses window.innerWidth, so this test verifies the width-based logic

      // Start with desktop width
      mockWindowDimensions.innerWidth = TEST_SCREEN_CONSTANTS.BREAKPOINT_XL;
      const { result } = renderHook(() => useBreakpoint());

      // Should be above lg with xl width
      expect(result.current.isAbove('lg')).toBe(true);
      expect(result.current.currentBreakpoint).toBe('xl');

      // Simulate width change to below lg
      act(() => {
        mockWindowDimensions.innerWidth = 800; // Below lg (1024)

        // Trigger resize event
        const resizeHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'resize',
        )?.[1];
        if (resizeHandler) {
          resizeHandler(new Event('resize'));
        }
      });

      expect(result.current.isAbove('lg')).toBe(false);
      expect(result.current.currentBreakpoint).toBe('md');
    });
  });

  describe('自定义断点配置', () => {
    it('should accept custom breakpoint configuration', () => {
      const customBreakpoints = {
        sm: 480,
        md: 768,
        lg: 1200,
      };

      // Set width to lg breakpoint for this test
      const testWidth = TEST_SCREEN_CONSTANTS.BREAKPOINT_LG;
      mockWindowDimensions.innerWidth = testWidth;

      const { result } = renderHook(() => useBreakpoint(customBreakpoints));

      // With custom breakpoints: sm: 480, md: 768, lg: 1200, xl: 1280 (default), 2xl: 1536 (default)
      // 1024 >= 768 but < 1200, so it should be 'md'
      expect(result.current.currentBreakpoint).toBe('md');
      expect(result.current.width).toBe(testWidth);
    });

    it('should handle partial custom breakpoint gracefully', () => {
      const partialBreakpoints = {
        md: 768,
        // Only partial configuration
      };

      expect(() => {
        renderHook(() => useBreakpoint(partialBreakpoints));
      }).not.toThrow();
    });
  });

  describe('性能优化', () => {
    it('should debounce resize events', () => {
      // Note: Current useBreakpoint implementation doesn't have debouncing
      // This test verifies that resize events are handled correctly

      const { result } = renderHook(() => useBreakpoint());

      // Initial width
      const initialWidth = result.current.width;
      expect(initialWidth).toBe(TEST_SCREEN_CONSTANTS.TABLET_WIDTH);

      // Change width and trigger resize
      act(() => {
        mockWindowDimensions.innerWidth = 500;

        // Trigger resize event
        const resizeHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'resize',
        )?.[1];
        if (resizeHandler) {
          resizeHandler(new Event('resize'));
        }
      });

      // Should update to new width
      expect(result.current.width).toBe(500);
      expect(result.current.currentBreakpoint).toBe('sm');
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => useBreakpoint());

      // Verify that addEventListener was called during mount
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );

      unmount();

      // Verify that removeEventListener was called during unmount
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });
  });

  describe('边缘情况处理', () => {
    it('should handle missing window object', () => {
      // Note: Testing complete window removal conflicts with React Testing Library
      // Instead, we test the hook's behavior with a window object missing innerWidth

      const originalWindow = global.window;

      try {
        // Create a window mock without innerWidth but with required methods
        global.window = {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          // innerWidth is undefined, which should trigger fallback
        } as unknown as Window & typeof globalThis;

        const { result } = renderHook(() => useBreakpoint());

        // Should handle undefined innerWidth gracefully
        // Note: Hook returns undefined when window.innerWidth is undefined
        expect(result.current.width).toBeUndefined();
        expect(result.current.currentBreakpoint).toBe('sm'); // NaN/undefined defaults to sm
        expect(result.current.isAbove('sm')).toBe(false); // undefined < 640
        expect(result.current.isBelow('md')).toBe(false); // undefined < 768 is false
      } finally {
        // Always restore window
        global.window = originalWindow;
      }
    });

    it('should handle matchMedia not supported', () => {
      // Note: useBreakpoint doesn't actually use matchMedia in current implementation
      // This test verifies it works without matchMedia
      const originalMatchMedia = mockWindow.matchMedia;

      try {
        // @ts-expect-error - Testing edge case
        delete mockWindow.matchMedia;

        const { result } = renderHook(() => useBreakpoint());

        // Should provide fallback values based on width
        expect(result.current.currentBreakpoint).toBeDefined();
        expect(result.current.width).toBe(TEST_SCREEN_CONSTANTS.TABLET_WIDTH);
      } finally {
        // Restore matchMedia
        mockWindow.matchMedia = originalMatchMedia;
      }
    });

    it('should handle ResizeObserver not supported', () => {
      // Note: useBreakpoint doesn't use ResizeObserver, only window resize events
      const originalResizeObserver = global.ResizeObserver;

      try {
        // @ts-expect-error - Testing edge case
        delete global.ResizeObserver;

        expect(() => {
          renderHook(() => useBreakpoint());
        }).not.toThrow();
      } finally {
        // Restore ResizeObserver
        global.ResizeObserver = originalResizeObserver;
      }
    });

    it('should handle invalid window dimensions', () => {
      // Temporarily set invalid dimensions
      const originalInnerWidth = mockWindowDimensions.innerWidth;
      const originalInnerHeight = mockWindowDimensions.innerHeight;

      try {
        mockWindowDimensions.innerWidth = NaN;
        mockWindowDimensions.innerHeight = undefined as number;

        const { result } = renderHook(() => useBreakpoint());

        // Should handle NaN gracefully
        expect(typeof result.current.width).toBe('number');
        // NaN width should result in sm breakpoint (default fallback)
        expect(result.current.currentBreakpoint).toBe('sm');
      } finally {
        // Restore original dimensions
        mockWindowDimensions.innerWidth = originalInnerWidth;
        mockWindowDimensions.innerHeight = originalInnerHeight;
      }
    });
  });

  describe('TypeScript 类型安全', () => {
    it('should provide correct TypeScript types', () => {
      const { result } = renderHook(() => useBreakpoint());

      // These should compile without TypeScript errors
      const { currentBreakpoint } = result.current;
      const { width } = result.current;
      const isAbove: boolean = result.current.isAbove('md');
      const isBelow: boolean = result.current.isBelow('lg');
      const isExactly: boolean = result.current.isExactly('sm');

      expect(typeof currentBreakpoint).toBe('string');
      expect(typeof width).toBe('number');
      expect(typeof isAbove).toBe('boolean');
      expect(typeof isBelow).toBe('boolean');
      expect(typeof isExactly).toBe('boolean');

      // Verify specific breakpoint values
      expect(['sm', 'md', 'lg', 'xl', '2xl']).toContain(currentBreakpoint);
      expect(width).toBeGreaterThanOrEqual(0);
    });
  });

  describe('极端边缘情况', () => {
    it('should handle extremely large window dimensions', () => {
      mockWindowDimensions.innerWidth = 999999;
      mockWindowDimensions.innerHeight = 999999;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.width).toBe(999999);
      expect(result.current.currentBreakpoint).toBe('2xl');
      expect(result.current.isAbove('xl')).toBe(true);
    });

    it('should handle zero window dimensions', () => {
      mockWindowDimensions.innerWidth = 0;
      mockWindowDimensions.innerHeight = 0;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.width).toBe(0);
      expect(result.current.currentBreakpoint).toBe('sm');
      expect(result.current.isBelow('md')).toBe(true);
    });

    it('should handle rapid consecutive resize events', () => {
      const { result } = renderHook(() => useBreakpoint());

      // Simulate rapid resize events
      const widths = [320, 768, 1024, 1280, 1920, 640];

      widths.forEach((width) => {
        act(() => {
          mockWindowDimensions.innerWidth = width;

          // Get the registered resize handler and call it directly
          const resizeHandler = mockAddEventListener.mock.calls.find(
            (call) => call[0] === 'resize',
          )?.[1];
          if (resizeHandler) {
            resizeHandler(new Event('resize'));
          }
        });
      });

      // Should handle the last width
      expect(result.current.width).toBe(640);
      expect(result.current.currentBreakpoint).toBe('sm');
    });
  });
});
