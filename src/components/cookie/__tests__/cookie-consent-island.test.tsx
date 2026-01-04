import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCookieConsentProvider,
  mockLazyCookieBanner,
  mockEnterpriseAnalyticsIsland,
} = vi.hoisted(() => ({
  mockCookieConsentProvider: vi.fn(({ children }) => (
    <div data-testid='cookie-consent-provider'>{children}</div>
  )),
  mockLazyCookieBanner: vi.fn(() => <div data-testid='lazy-cookie-banner' />),
  mockEnterpriseAnalyticsIsland: vi.fn(() => (
    <div data-testid='enterprise-analytics-island' />
  )),
}));

vi.mock('@/lib/cookie-consent', () => ({
  CookieConsentProvider: mockCookieConsentProvider,
}));

vi.mock('@/components/cookie/lazy-cookie-banner', () => ({
  LazyCookieBanner: mockLazyCookieBanner,
}));

vi.mock('@/components/monitoring/enterprise-analytics-island', () => ({
  EnterpriseAnalyticsIsland: mockEnterpriseAnalyticsIsland,
}));

describe('CookieConsentIsland', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('renders CookieConsentProvider wrapping children', async () => {
    const { CookieConsentIsland } = await import('../cookie-consent-island');
    render(<CookieConsentIsland />);

    expect(screen.getByTestId('cookie-consent-provider')).toBeInTheDocument();
  });

  it('renders LazyCookieBanner inside Suspense', async () => {
    const { CookieConsentIsland } = await import('../cookie-consent-island');
    render(<CookieConsentIsland />);

    expect(screen.getByTestId('lazy-cookie-banner')).toBeInTheDocument();
  });

  it('renders EnterpriseAnalyticsIsland in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { CookieConsentIsland } = await import('../cookie-consent-island');
    render(<CookieConsentIsland />);

    expect(
      screen.getByTestId('enterprise-analytics-island'),
    ).toBeInTheDocument();
  });

  it('does not render EnterpriseAnalyticsIsland in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { CookieConsentIsland } = await import('../cookie-consent-island');
    render(<CookieConsentIsland />);

    expect(
      screen.queryByTestId('enterprise-analytics-island'),
    ).not.toBeInTheDocument();
  });
});
