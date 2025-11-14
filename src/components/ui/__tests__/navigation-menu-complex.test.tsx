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
function setupComplexTest() {
  const user = userEvent.setup();

  // v4 构造器类 mock：确保可被 `new` 调用
  class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }
  vi.stubGlobal('ResizeObserver', MockResizeObserver);

  return { user };
}

describe('NavigationMenu - Complex Structures', () => {
  beforeEach(() => {
    setupComplexTest();
  });

  it('works with complex navigation structure', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                <li className='row-span-3'>
                  <NavigationMenuLink
                    href='/'
                    className='from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md'
                  >
                    <div className='mt-4 mb-2 text-lg font-medium'>
                      shadcn/ui
                    </div>
                    <p className='text-muted-foreground text-sm leading-tight'>
                      Beautifully designed components built with Radix UI and
                      Tailwind CSS.
                    </p>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href='/docs'
                    data-testid='docs-link'
                  >
                    Introduction
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href='/docs/installation'
                    data-testid='installation-link'
                  >
                    Installation
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                <li>
                  <NavigationMenuLink
                    href='/docs/primitives/alert-dialog'
                    data-testid='alert-dialog-link'
                  >
                    Alert Dialog
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href='/docs/primitives/hover-card'
                    data-testid='hover-card-link'
                  >
                    Hover Card
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href='/docs'
              data-testid='documentation-link'
            >
              Documentation
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(screen.getByText('Getting started')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByTestId('documentation-link')).toBeInTheDocument();
  });

  it('handles multiple navigation items', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          {Array.from({ length: 5 }, (_, i) => (
            <NavigationMenuItem key={i}>
              <NavigationMenuTrigger data-testid={`trigger-${i}`}>
                Item {i + 1}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div data-testid={`content-${i}`}>Content {i + 1}</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>,
    );

    // All triggers should be rendered
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`trigger-${i}`)).toBeInTheDocument();
    }
  });

  it('handles nested navigation structures', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='main-trigger'>
              Main Menu
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className='grid gap-3 p-4'>
                <NavigationMenuLink
                  href='/section1'
                  data-testid='section1-link'
                >
                  Section 1
                </NavigationMenuLink>
                <NavigationMenuLink
                  href='/section2'
                  data-testid='section2-link'
                >
                  Section 2
                </NavigationMenuLink>
                <NavigationMenuLink
                  href='/section3'
                  data-testid='section3-link'
                >
                  Section 3
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByTestId('main-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Main Menu');
  });

  it('handles dynamic content updates', async () => {
    const user = userEvent.setup();
    const TestComponent = ({ items }: { items: string[] }) => (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='dynamic-trigger'>
              Dynamic Menu
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div data-testid='dynamic-content'>
                {items.map((item, index) => (
                  <NavigationMenuLink
                    key={index}
                    href={`/${item.toLowerCase()}`}
                    data-testid={`item-${index}`}
                  >
                    {item}
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    const { rerender } = render(<TestComponent items={['Item 1', 'Item 2']} />);

    // Open the menu first to access content
    const trigger = screen.getByTestId('dynamic-trigger');
    await user.click(trigger);

    // Initial items should be rendered
    expect(screen.getByTestId('item-0')).toHaveTextContent('Item 1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Item 2');

    // Update items
    rerender(
      <TestComponent items={['New Item 1', 'New Item 2', 'New Item 3']} />,
    );

    // Updated items should be rendered
    expect(screen.getByTestId('item-0')).toHaveTextContent('New Item 1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('New Item 2');
    expect(screen.getByTestId('item-2')).toHaveTextContent('New Item 3');
  });

  it('handles large navigation menus efficiently', async () => {
    const user = userEvent.setup();
    const largeItemCount = 20;

    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid='large-menu-trigger'>
              Large Menu
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className='grid grid-cols-4 gap-2 p-4'>
                {Array.from({ length: largeItemCount }, (_, i) => (
                  <NavigationMenuLink
                    key={i}
                    href={`/item-${i}`}
                    data-testid={`large-item-${i}`}
                  >
                    Item {i + 1}
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    // Open the menu first to access content
    const trigger = screen.getByTestId('large-menu-trigger');
    await user.click(trigger);

    // Check that all items are rendered
    for (let i = 0; i < largeItemCount; i++) {
      expect(screen.getByTestId(`large-item-${i}`)).toBeInTheDocument();
    }
  });
});
