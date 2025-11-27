/**
 * Test utilities for layout components
 *
 * @deprecated This file is deprecated. Please use @/test/utils instead.
 *
 * Migration guide:
 * ```typescript
 * // Before
 * import { renderWithProviders, mockMessages } from '@/components/layout/__tests__/test-utils';
 *
 * // After
 * import { renderWithIntl } from '@/test/utils';
 * import { combinedMessages } from '@/test/constants/mock-messages';
 * ```
 *
 * This file is kept for backward compatibility during the migration period.
 * It will be removed in a future version.
 */
import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Re-export centralized mock messages
export { combinedMessages as mockMessages } from '@/test/constants/mock-messages';

// Re-export renderWithIntl as renderWithProviders for compatibility
export { renderWithIntl as renderWithProviders } from '@/test/utils';

// Simple render function without complex providers for now
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  messages?: Record<string, unknown>;
}

/**
 * @deprecated Use renderWithIntl from @/test/utils instead
 */
export function customRenderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  // For now, just use basic render - we'll mock the i18n hooks directly
  return render(ui, options);
}

// Mock theme provider
export const mockThemeProvider = {
  theme: 'light' as const,
  setTheme: vi.fn(),
  systemTheme: 'light' as const,
  resolvedTheme: 'light' as const,
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
