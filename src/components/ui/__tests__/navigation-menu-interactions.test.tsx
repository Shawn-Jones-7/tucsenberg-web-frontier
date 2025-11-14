/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
function setupInteractionTest() {
  const user = userEvent.setup();

  // Mock ResizeObserver for all tests (Vitest v4: use class/function constructor)
  class MockResizeObserver {
    callback: ResizeObserverCallback | undefined;
    constructor(cb?: ResizeObserverCallback) {
      this.callback = cb;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  vi.stubGlobal(
    'ResizeObserver',
    MockResizeObserver as unknown as ResizeObserver,
  );

  return { user };
}

describe('NavigationMenu - Interactions', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    const setup = setupInteractionTest();
    user = setup.user;
  });

  describe('NavigationMenuTrigger', () => {
    it('renders navigation menu trigger with chevron icon', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid='nav-trigger'>
                Products
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByTestId('nav-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Products');

      const chevronIcon = screen.getByTestId('chevron-down-icon');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('applies trigger styles', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid='nav-trigger'>
                Products
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByTestId('nav-trigger');
      expect(trigger).toHaveClass(
        'group',
        'inline-flex',
        'h-9',
        'w-max',
        'items-center',
        'justify-center',
      );
    });

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className='custom-trigger'
                data-testid='nav-trigger'
              >
                Products
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByTestId('nav-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('handles click interactions', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid='nav-trigger'>
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div data-testid='nav-content'>Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const trigger = screen.getByTestId('nav-trigger');

      // Initially content should not be visible
      expect(screen.queryByTestId('nav-content')).not.toBeInTheDocument();

      // Click trigger to open content
      await user.click(trigger);

      // Content should now be visible
      expect(screen.getByTestId('nav-content')).toBeInTheDocument();
    });
  });

  describe('NavigationMenuContent', () => {
    it('renders navigation menu content when menu is open', () => {
      render(
        <NavigationMenu defaultValue='item-1'>
          <NavigationMenuList>
            <NavigationMenuItem value='item-1'>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent data-testid='nav-content'>
                <div>Product content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const content = screen.getByTestId('nav-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Product content');
    });

    it('applies default classes when rendered', () => {
      render(
        <NavigationMenu defaultValue='item-1'>
          <NavigationMenuList>
            <NavigationMenuItem value='item-1'>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent data-testid='nav-content'>
                <div>Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const content = screen.getByTestId('nav-content');
      expect(content).toHaveAttribute('data-slot', 'navigation-menu-content');
    });

    it('applies custom className when provided', () => {
      render(
        <NavigationMenu defaultValue='item-1'>
          <NavigationMenuList>
            <NavigationMenuItem value='item-1'>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent
                className='custom-content'
                data-testid='nav-content'
              >
                <div>Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const content = screen.getByTestId('nav-content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('NavigationMenuLink', () => {
    it('renders navigation menu link', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/products'
                data-testid='nav-link'
              >
                Products
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = screen.getByTestId('nav-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('Products');
      expect(link).toHaveAttribute('href', '/products');
    });

    it('applies default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/products'
                data-testid='nav-link'
              >
                Products
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = screen.getByTestId('nav-link');
      expect(link).toHaveClass(
        'flex',
        'flex-col',
        'gap-1',
        'rounded-sm',
        'p-2',
      );
    });

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/products'
                className='custom-link'
                data-testid='nav-link'
              >
                Products
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = screen.getByTestId('nav-link');
      expect(link).toHaveClass('custom-link');
    });

    it('handles click interactions', async () => {
      const handleClick = vi.fn();

      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/products'
                onClick={handleClick}
                data-testid='nav-link'
              >
                Products
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>,
      );

      const link = screen.getByTestId('nav-link');
      await user.click(link);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
