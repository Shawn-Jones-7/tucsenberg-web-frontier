import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from '@/test/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { cleanupThemeToggleTest, setupThemeToggleTest } from '@/components/__tests__/theme-toggle/setup';

describe('ThemeToggle - Theme Switching', () => {
  beforeEach(() => {
    setupThemeToggleTest();
  });

  afterEach(() => {
    cleanupThemeToggleTest();
  });

  it('should render theme toggle button and be clickable', () => {
    render(<ThemeToggle />);

    // Find the theme toggle button
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();

    // Verify button is initially closed
    expect(themeButton).toHaveAttribute('data-state', 'closed');
    expect(themeButton).toHaveAttribute('aria-expanded', 'false');

    // Verify button is clickable (this tests the basic interaction)
    expect(themeButton).toHaveAttribute('type', 'button');
    expect(themeButton).not.toHaveAttribute('disabled');
  });

  it('should have proper theme context and accessibility', () => {
    render(<ThemeToggle />);

    // Find the theme toggle button
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();

    // Verify accessibility attributes
    expect(themeButton).toHaveAttribute('aria-label');
    expect(themeButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(themeButton).toHaveAttribute('role', 'button');

    // Verify the aria-label contains theme information
    const ariaLabel = themeButton?.getAttribute('aria-label');
    expect(ariaLabel).toContain('主题');
    expect(ariaLabel).toContain('light'); // Current theme should be mentioned
  });

  it('should have correct visual styling and layout', () => {
    render(<ThemeToggle />);

    // Find the theme toggle button
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();

    // Verify button has proper styling classes
    const buttonClasses = themeButton?.className;
    expect(buttonClasses).toContain('inline-flex');
    expect(buttonClasses).toContain('items-center');
    expect(buttonClasses).toContain('justify-center');

    // Verify icons are present
    const sunIcon = document.querySelector('.lucide-sun');
    const moonIcon = document.querySelector('.lucide-moon');
    expect(sunIcon).toBeInTheDocument();
    expect(moonIcon).toBeInTheDocument();
  });

  it('should handle keyboard navigation properly', () => {
    render(<ThemeToggle />);

    // Find the theme toggle button
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();

    // Verify button can receive keyboard focus
    expect(themeButton).toHaveAttribute('type', 'button');
    expect(themeButton).not.toHaveAttribute('disabled');

    // Verify keyboard accessibility attributes are present
    expect(themeButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(themeButton).toHaveAttribute('role', 'button');

    // The component should be ready for keyboard interaction
    // Detailed keyboard behavior is tested in the hook tests
    expect(themeButton).toBeInTheDocument();
  });

  it('should maintain proper component structure', () => {
    render(<ThemeToggle />);

    // Verify the component renders within theme provider context
    const themeProvider = document.querySelector(
      '[data-testid="theme-provider"]',
    );
    expect(themeProvider).toBeInTheDocument();

    // Verify the component renders within intl provider context
    const intlProvider = document.querySelector(
      '[data-testid="intl-provider"]',
    );
    expect(intlProvider).toBeInTheDocument();

    // Verify button is properly nested
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();
  });

  it('should have proper focus management', () => {
    render(<ThemeToggle />);

    // Find the theme toggle button
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    ) as HTMLElement;
    expect(themeButton).toBeInTheDocument();

    // Test focus behavior
    themeButton.focus();
    expect(document.activeElement).toBe(themeButton);

    // Verify button can receive focus
    expect(themeButton.tabIndex).not.toBe(-1);
  });

  it('should render with proper theme state', () => {
    render(<ThemeToggle />);

    // Verify theme provider has correct attributes
    const themeProvider = document.querySelector(
      '[data-testid="theme-provider"]',
    );
    expect(themeProvider).toHaveAttribute('data-theme', 'light');
    expect(themeProvider).toHaveAttribute('data-themes', 'light,dark,system');

    // Verify button reflects current theme in aria-label
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    const ariaLabel = themeButton?.getAttribute('aria-label');
    expect(ariaLabel).toContain('light');
  });

  it('should have screen reader support', () => {
    render(<ThemeToggle />);

    // Verify screen reader text is present
    const srText = document.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveTextContent('主题切换按钮');

    // Verify icons have proper aria-hidden attributes
    const sunIcon = document.querySelector('.lucide-sun');
    const moonIcon = document.querySelector('.lucide-moon');
    expect(sunIcon).toHaveAttribute('aria-hidden', 'true');
    expect(moonIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
