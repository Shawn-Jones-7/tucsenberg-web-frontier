/**
 * @vitest-environment jsdom
 * Tests for header client components (Island components)
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  LanguageToggleIsland,
  MobileNavigationIsland,
  NavSwitcherIsland,
} from '../header-client';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<{ default: React.ComponentType<unknown> }>,
    options?: { ssr?: boolean },
  ) => {
    // Return a component that renders a placeholder
    const DynamicComponent = (props: Record<string, unknown>) => (
      <div
        data-testid='dynamic-component'
        data-ssr={String(options?.ssr ?? true)}
        {...props}
      />
    );
    DynamicComponent.displayName = 'DynamicComponent';

    // Trigger loader to avoid unused warnings
    loader();
    return DynamicComponent;
  },
}));

// Mock MobileNavigation
vi.mock('@/components/layout/mobile-navigation', () => ({
  MobileNavigation: () => <div data-testid='mobile-navigation'>Mobile Nav</div>,
}));

// Mock NavSwitcher
vi.mock('@/components/layout/nav-switcher', () => ({
  NavSwitcher: () => <div data-testid='nav-switcher'>Nav Switcher</div>,
}));

// Mock LanguageToggle
vi.mock('@/components/language-toggle', () => ({
  LanguageToggle: ({ locale }: { locale: string }) => (
    <div
      data-testid='language-toggle'
      data-locale={locale}
    >
      Language Toggle
    </div>
  ),
}));

describe('MobileNavigationIsland', () => {
  it('renders dynamic component with ssr false', () => {
    render(<MobileNavigationIsland />);

    const dynamicComponent = screen.getByTestId('dynamic-component');
    expect(dynamicComponent).toHaveAttribute('data-ssr', 'false');
  });
});

describe('NavSwitcherIsland', () => {
  it('renders dynamic component with ssr false', () => {
    render(<NavSwitcherIsland />);

    const dynamicComponent = screen.getByTestId('dynamic-component');
    expect(dynamicComponent).toHaveAttribute('data-ssr', 'false');
  });
});

describe('LanguageToggleIsland', () => {
  it('renders LanguageToggle with en locale', () => {
    render(<LanguageToggleIsland locale='en' />);

    const toggle = screen.getByTestId('dynamic-component');
    expect(toggle).toHaveAttribute('data-ssr', 'false');
  });

  it('renders LanguageToggle with zh locale', () => {
    render(<LanguageToggleIsland locale='zh' />);

    const toggle = screen.getByTestId('dynamic-component');
    expect(toggle).toBeInTheDocument();
  });

  it('passes locale prop to LanguageToggle', () => {
    render(<LanguageToggleIsland locale='zh' />);

    // The dynamic component receives the locale prop
    const toggle = screen.getByTestId('dynamic-component');
    expect(toggle).toHaveAttribute('locale', 'zh');
  });

  it('does not wrap in ClientI18nProvider', () => {
    render(<LanguageToggleIsland locale='en' />);

    // Should not have i18n-provider wrapper
    expect(screen.queryByTestId('i18n-provider')).not.toBeInTheDocument();
  });
});

describe('Island components integration', () => {
  it('all islands can render together', () => {
    const { container } = render(
      <>
        <MobileNavigationIsland />
        <NavSwitcherIsland />
        <LanguageToggleIsland locale='en' />
      </>,
    );

    const dynamicComponents = container.querySelectorAll(
      '[data-testid="dynamic-component"]',
    );
    expect(dynamicComponents.length).toBe(3);
  });

  it('all islands accept zh locale', () => {
    render(
      <>
        <MobileNavigationIsland />
        <NavSwitcherIsland />
        <LanguageToggleIsland locale='zh' />
      </>,
    );
  });
});
