import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CONSENT,
  type CookieConsentContextValue,
} from '@/lib/cookie-consent/types';

const { mockUseLocale, mockUseCookieConsentOptional } = vi.hoisted(() => ({
  mockUseLocale: vi.fn(() => 'en'),
  mockUseCookieConsentOptional: vi.fn<() => CookieConsentContextValue | null>(),
}));

vi.mock('next-intl', () => ({
  useLocale: mockUseLocale,
}));

vi.mock('@/lib/cookie-consent', () => ({
  useCookieConsentOptional: mockUseCookieConsentOptional,
}));

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
}));

let dynamicIndex = 0;
vi.mock('next/dynamic', () => ({
  default: () => {
    dynamicIndex += 1;
    const testId = dynamicIndex === 1 ? 'analytics' : 'speed-insights';
    const DynamicComponent = () => <div data-testid={testId} />;
    DynamicComponent.displayName = `MockDynamic(${testId})`;
    return DynamicComponent;
  },
}));

function createCookieConsentValue(
  overrides: Partial<Pick<CookieConsentContextValue, 'ready' | 'consent'>> = {},
): CookieConsentContextValue {
  return {
    consent: overrides.consent ?? DEFAULT_CONSENT,
    hasConsented: true,
    ready: overrides.ready ?? true,
    acceptAll: vi.fn(),
    rejectAll: vi.fn(),
    updateConsent: vi.fn(),
    savePreferences: vi.fn(),
    resetConsent: vi.fn(),
  };
}

describe('EnterpriseAnalyticsIsland', () => {
  it('renders nothing when consent system exists but is not ready', async () => {
    dynamicIndex = 0;
    mockUseCookieConsentOptional.mockReturnValue(
      createCookieConsentValue({ ready: false }),
    );

    const { EnterpriseAnalyticsIsland } =
      await import('../enterprise-analytics-island');
    const { container } = render(<EnterpriseAnalyticsIsland />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('analytics')).not.toBeInTheDocument();
  });

  it('renders analytics components when no consent system exists (prod)', async () => {
    dynamicIndex = 0;
    mockUseCookieConsentOptional.mockReturnValue(null);

    const originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');

    try {
      const { EnterpriseAnalyticsIsland } =
        await import('../enterprise-analytics-island');
      render(<EnterpriseAnalyticsIsland />);

      expect(screen.getByTestId('analytics')).toBeInTheDocument();
      expect(screen.getByTestId('speed-insights')).toBeInTheDocument();
    } finally {
      vi.stubEnv('NODE_ENV', originalNodeEnv);
    }
  });
});
