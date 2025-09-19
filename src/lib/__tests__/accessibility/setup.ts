import { vi } from 'vitest';
import type { AccessibilityManagerPrivate } from '@/types/test-types';
import { AccessibilityManager, useAccessibility } from '@/lib/accessibility';
import type { ScreenReaderConfig } from '@/lib/accessibility-types';
import {
  DELAY_CONSTANTS,
  PERFORMANCE_CONSTANTS,
} from '../../../constants/app-constants';

// Mock logger module
vi.mock('../../logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock DOM methods
export const mockAppendChild = vi.fn();
export const mockRemoveChild = vi.fn();
export const mockGetElementById = vi.fn();
export const mockCreateElement = vi.fn();

Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
});

// Mock window.matchMedia
export const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

// Mock window.speechSynthesis
export const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
});

// Mock SpeechSynthesisUtterance
export const mockSpeechSynthesisUtterance = vi.fn();
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: mockSpeechSynthesisUtterance,
  writable: true,
});

// Mock ResizeObserver
export const mockResizeObserver = vi.fn();
mockResizeObserver.mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
Object.defineProperty(window, 'ResizeObserver', {
  value: mockResizeObserver,
  writable: true,
});

// Mock IntersectionObserver
export const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
Object.defineProperty(window, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  writable: true,
});

// Mock MutationObserver
export const mockMutationObserver = vi.fn();
mockMutationObserver.mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));
Object.defineProperty(window, 'MutationObserver', {
  value: mockMutationObserver,
  writable: true,
});

// Setup function for accessibility tests
export function setupAccessibilityTest() {
  vi.clearAllMocks();

  // Create mock live region element
  const mockLiveRegion = {
    id: 'accessibility-live-region',
    setAttribute: vi.fn(),
    textContent: '',
    style: {},
    remove: vi.fn(),
  } as unknown;

  // Reset DOM mocks
  mockGetElementById.mockReturnValue(null);
  mockCreateElement.mockReturnValue(mockLiveRegion);
  mockAppendChild.mockImplementation(() => {});
  mockRemoveChild.mockImplementation(() => {});

  // Reset matchMedia mock
  mockMatchMedia.mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // Reset speech synthesis mocks
  mockSpeechSynthesis.speak.mockClear();
  mockSpeechSynthesis.cancel.mockClear();
  mockSpeechSynthesis.pause.mockClear();
  mockSpeechSynthesis.resume.mockClear();
  mockSpeechSynthesis.getVoices.mockReturnValue([]);
  mockSpeechSynthesis.speaking = false;
  mockSpeechSynthesis.pending = false;
  mockSpeechSynthesis.paused = false;

  mockSpeechSynthesisUtterance.mockClear();
  mockSpeechSynthesisUtterance.mockImplementation((text) => ({
    text,
    lang: 'en-US',
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    onstart: null,
    onend: null,
    onerror: null,
    onpause: null,
    onresume: null,
    onmark: null,
    onboundary: null,
  }));

  // Reset observer mocks
  mockResizeObserver.mockClear();
  mockIntersectionObserver.mockClear();
  mockMutationObserver.mockClear();

  return mockLiveRegion;
}

// Helper function to create accessibility manager instance
const defaultAccessibilityConfig: ScreenReaderConfig = {
  enabled: true,
  language: 'en',
  announceDelay: DELAY_CONSTANTS.STANDARD_TIMEOUT,
};

export function createAccessibilityManager(
  config: Partial<ScreenReaderConfig> = {},
): AccessibilityManager {
  return new AccessibilityManager({
    ...defaultAccessibilityConfig,
    ...config,
  });
}

// Helper function to access private methods for testing
export function getPrivateAccessibility(
  manager: AccessibilityManager,
): AccessibilityManagerPrivate {
  return manager as unknown as AccessibilityManagerPrivate;
}

// Helper function to simulate media query changes
export function simulateMediaQueryChange(query: string, matches: boolean) {
  const mediaQuery = {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  mockMatchMedia.mockImplementation((q) => {
    if (q === query) {
      return mediaQuery;
    }
    return {
      matches: false,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });

  return mediaQuery;
}

// Helper function to simulate keyboard events
export function simulateKeyboardEvent(key: string, target?: HTMLElement) {
  const event = new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
  });

  if (target) {
    target.dispatchEvent(event);
  } else {
    document.dispatchEvent(event);
  }

  return event;
}

// Helper function to simulate focus events
export function simulateFocusEvent(
  target: HTMLElement,
  type: 'focus' | 'blur' = 'focus',
) {
  const event = new FocusEvent(type, {
    bubbles: true,
    cancelable: true,
  });

  target.dispatchEvent(event);
  return event;
}

// Cleanup function for tests
export function cleanupAccessibilityTest() {
  vi.restoreAllMocks();
}

// Export constants for use in tests
export {
  DELAY_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  AccessibilityManager,
  useAccessibility,
};
