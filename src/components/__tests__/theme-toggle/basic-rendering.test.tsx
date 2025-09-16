import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from '@/test/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { cleanupThemeToggleTest, setupThemeToggleTest } from '@/components/__tests__/theme-toggle/setup';

describe('ThemeToggle - Basic Rendering', () => {
  beforeEach(() => {
    setupThemeToggleTest();
  });

  afterEach(() => {
    cleanupThemeToggleTest();
  });

  it('should render without errors (architecture validation)', () => {
    // This is a basic test to validate the testing architecture
    expect(() => {
      const { container } = render(<ThemeToggle />);
      expect(container).toBeInTheDocument();
    }).not.toThrow();
  });

  it('should render component with correct DOM structure', () => {
    render(<ThemeToggle />);

    // Verify theme toggle button exists (using actual rendered structure)
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();
    expect(themeButton).toHaveAttribute('role', 'button');
    expect(themeButton).toHaveAttribute('type', 'button');

    // Verify button has correct state
    expect(themeButton).toHaveAttribute('data-state', 'closed');
  });

  it('should render with correct accessibility attributes', () => {
    render(<ThemeToggle />);

    // Verify ARIA attributes on theme toggle button (using actual rendered structure)
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toHaveAttribute(
      'aria-label',
      '主题切换按钮，当前主题：light',
    );
    expect(themeButton).toHaveAttribute('aria-expanded', 'false');
    expect(themeButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(themeButton).toHaveAttribute('role', 'button');
  });

  it('should render theme toggle button with correct icons', () => {
    render(<ThemeToggle />);

    // Verify sun and moon icons are present (using actual SVG structure)
    const sunIcon = document.querySelector('.lucide-sun');
    const moonIcon = document.querySelector('.lucide-moon');

    expect(sunIcon).toBeInTheDocument();
    expect(moonIcon).toBeInTheDocument();

    // Verify icons have correct accessibility attributes
    expect(sunIcon).toHaveAttribute('aria-hidden', 'true');
    expect(moonIcon).toHaveAttribute('aria-hidden', 'true');

    // Verify screen reader text is present
    const srText = document.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveTextContent('主题切换按钮');
  });

  it('should render theme toggle button and be ready for interaction', () => {
    render(<ThemeToggle />);

    // Verify the main toggle button is present and functional
    const themeButton = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    );
    expect(themeButton).toBeInTheDocument();

    // Verify button is in closed state initially
    expect(themeButton).toHaveAttribute('data-state', 'closed');

    // Verify button has proper accessibility setup for dropdown
    expect(themeButton).toHaveAttribute('aria-expanded', 'false');
    expect(themeButton).toHaveAttribute('aria-haspopup', 'menu');

    // Note: Menu items are not rendered until dropdown is opened
    // This is the expected behavior for dropdown menus
  });
});
