/**
 * @vitest-environment jsdom
 */

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
function setupKeyboardTest() {
  const user = userEvent.setup();

  // Mock ResizeObserver（v4 需支持可被 new 的构造器）
  class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }

  // 替换全局构造器，确保 Radix UI 内部 new ResizeObserver() 正常工作
  vi.stubGlobal('ResizeObserver', MockResizeObserver);

  return { user, mockResizeObserver: MockResizeObserver };
}

describe('NavigationMenu - Keyboard Navigation', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    const setup = setupKeyboardTest();
    user = setup.user;
  });

  it('supports keyboard navigation', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='trigger-1'>
              Item 1
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                href='/item1'
                data-testid='link-1'
              >
                Link 1
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='trigger-2'>
              Item 2
            </NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger1 = screen.getByTestId('trigger-1');
    const trigger2 = screen.getByTestId('trigger-2');

    // Focus first trigger
    trigger1.focus();
    expect(trigger1).toHaveFocus();

    // Tab to next trigger
    await user.tab();
    expect(trigger2).toHaveFocus();

    // Tab back to first trigger
    await user.tab({ shift: true });
    expect(trigger1).toHaveFocus();
  });

  it('opens menu with Enter key', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='trigger'>
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div data-testid='content'>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    trigger.focus();

    // Press Enter to open menu
    await user.keyboard('{Enter}');

    // Content should be visible
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('opens menu with Space key', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='trigger'>
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div data-testid='content'>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    trigger.focus();

    // Press Space to open menu
    await user.keyboard(' ');

    // Content should be visible
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('closes menu with Escape key', async () => {
    render(
      <NavigationMenu defaultValue='item-1'>
        <NavigationMenuList>
          <NavigationMenuItem value='item-1'>
            <NavigationMenuTrigger data-testid='trigger'>
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div data-testid='content'>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    // Content should be visible initially
    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Press Escape to close menu
    await user.keyboard('{Escape}');

    // Content should be hidden
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('handles focus management', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='trigger'>
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                href='/product1'
                data-testid='link-1'
              >
                Product 1
              </NavigationMenuLink>
              <NavigationMenuLink
                href='/product2'
                data-testid='link-2'
              >
                Product 2
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('trigger');

    // Focus trigger
    trigger.focus();
    expect(trigger).toHaveFocus();

    // Open menu with Enter
    await user.keyboard('{Enter}');

    // Focus should move to first link
    const link1 = screen.getByTestId('link-1');
    expect(link1).toBeInTheDocument();
  });

  it('maintains focus when menu closes', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='trigger'>
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div data-testid='content'>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('trigger');

    // Focus and open menu
    trigger.focus();
    await user.keyboard('{Enter}');

    // Close menu with Escape
    await user.keyboard('{Escape}');

    // Focus should return to trigger
    expect(trigger).toHaveFocus();
  });
});
