/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../navigation-menu';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronDownIcon: ({ className, ...props }: React.ComponentProps<'svg'>) => (
    <svg
      data-testid='chevron-down-icon'
      className={className}
      {...props}
    >
      <path d='M6 9l6 6 6-6' />
    </svg>
  ),
}));

// Shared test setup function
function setupNavigationMenuTest() {
  const user = userEvent.setup();

  // Mock ResizeObserver for all tests
  const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));

  vi.stubGlobal('ResizeObserver', mockResizeObserver);

  return { user, mockResizeObserver };
}

describe('NavigationMenu - Basic Components', () => {
  beforeEach(() => {
    setupNavigationMenuTest();
  });

  describe('NavigationMenu', () => {
    it('renders navigation menu with default props', () => {
      render(
        <NavigationMenu data-testid='nav-menu'>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navMenu = screen.getByTestId('nav-menu');
      expect(navMenu).toBeInTheDocument();
      expect(navMenu).toHaveAttribute('data-slot', 'navigation-menu');
      expect(navMenu).toHaveAttribute('data-viewport', 'true');
    });

    it('renders without viewport when viewport=false', () => {
      render(
        <NavigationMenu
          viewport={false}
          data-testid='nav-menu'
        >
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navMenu = screen.getByTestId('nav-menu');
      expect(navMenu).toHaveAttribute('data-viewport', 'false');

      // Viewport should not be rendered
      expect(screen.queryByTestId('nav-viewport')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <NavigationMenu
          className='custom-nav'
          data-testid='nav-menu'
        >
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navMenu = screen.getByTestId('nav-menu');
      expect(navMenu).toHaveClass('custom-nav');
    });

    it('passes through additional props', () => {
      render(
        <NavigationMenu
          data-testid='nav-menu'
          role='navigation'
          aria-label='Main navigation'
        >
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navMenu = screen.getByTestId('nav-menu');
      expect(navMenu).toHaveAttribute('role', 'navigation');
      expect(navMenu).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('NavigationMenuList', () => {
    it('renders navigation menu list', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList data-testid='nav-list'>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navList = screen.getByTestId('nav-list');
      expect(navList).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList data-testid='nav-list'>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navList = screen.getByTestId('nav-list');
      expect(navList).toHaveClass(
        'group',
        'flex',
        'flex-1',
        'list-none',
        'items-center',
        'justify-center',
        'gap-1',
      );
    });

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList
            className='custom-list'
            data-testid='nav-list'
          >
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navList = screen.getByTestId('nav-list');
      expect(navList).toHaveClass('custom-list');
    });
  });

  describe('NavigationMenuItem', () => {
    it('renders navigation menu item', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem data-testid='nav-item'>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem data-testid='nav-item'>
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('data-slot', 'navigation-menu-item');
    });

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem
              className='custom-item'
              data-testid='nav-item'
            >
              <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveClass('custom-item');
    });
  });

  describe('navigationMenuTriggerStyle', () => {
    it('returns trigger style classes', () => {
      const styles = navigationMenuTriggerStyle();
      expect(styles).toContain('group');
      expect(styles).toContain('inline-flex');
      expect(styles).toContain('h-9');
      expect(styles).toContain('w-max');
      expect(styles).toContain('items-center');
      expect(styles).toContain('justify-center');
      expect(styles).toContain('rounded-md');
    });

    it('accepts variant options', () => {
      // Test that the cva function works
      const styles = navigationMenuTriggerStyle();
      expect(typeof styles).toBe('string');
    });
  });
});
