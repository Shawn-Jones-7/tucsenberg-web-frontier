/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('TabsTrigger Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders tabs trigger', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger
            value='tab1'
            data-testid='tab-trigger'
          >
            Tab 1
          </TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    const tabTrigger = screen.getByTestId('tab-trigger');
    expect(tabTrigger).toBeInTheDocument();
    expect(tabTrigger).toHaveAttribute('role', 'tab');
    expect(tabTrigger).toHaveAttribute('data-state', 'active');
  });

  it('applies correct CSS classes when active', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger
            value='tab1'
            data-testid='active-tab'
          >
            Tab 1
          </TabsTrigger>
          <TabsTrigger
            value='tab2'
            data-testid='inactive-tab'
          >
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    const activeTab = screen.getByTestId('active-tab');
    const inactiveTab = screen.getByTestId('inactive-tab');

    expect(activeTab).toHaveClass(
      'data-[state=active]:bg-background',
      'dark:data-[state=active]:text-foreground',
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:outline-ring',
      'dark:data-[state=active]:border-input',
      'dark:data-[state=active]:bg-input/30',
      'text-foreground',
      'dark:text-muted-foreground',
      'inline-flex',
      'h-[calc(100%-1px)]',
      'flex-1',
      'items-center',
      'justify-center',
      'gap-1.5',
      'rounded-md',
      'border',
      'border-transparent',
      'px-2',
      'py-1',
      'text-sm',
      'font-medium',
      'whitespace-nowrap',
      'transition-[color,box-shadow]',
      'focus-visible:ring-[3px]',
      'focus-visible:outline-1',
      'disabled:pointer-events-none',
      'disabled:opacity-50',
      'data-[state=active]:shadow-sm',
    );

    expect(inactiveTab).toHaveClass(
      'data-[state=active]:bg-background',
      'dark:data-[state=active]:text-foreground',
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:outline-ring',
      'dark:data-[state=active]:border-input',
      'dark:data-[state=active]:bg-input/30',
      'text-foreground',
      'dark:text-muted-foreground',
      'inline-flex',
      'h-[calc(100%-1px)]',
      'flex-1',
      'items-center',
      'justify-center',
      'gap-1.5',
      'rounded-md',
      'border',
      'border-transparent',
      'px-2',
      'py-1',
      'text-sm',
      'font-medium',
      'whitespace-nowrap',
      'transition-[color,box-shadow]',
      'focus-visible:ring-[3px]',
      'focus-visible:outline-1',
      'disabled:pointer-events-none',
      'disabled:opacity-50',
      'data-[state=active]:shadow-sm',
    );
  });

  it('accepts custom className', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger
            value='tab1'
            className='custom-trigger'
            data-testid='tab-trigger'
          >
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
      </Tabs>,
    );

    const tabTrigger = screen.getByTestId('tab-trigger');
    expect(tabTrigger).toHaveClass('custom-trigger');
  });

  it('handles click events', async () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger
            value='tab2'
            data-testid='tab2-trigger'
          >
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    // Initially tab1 content should be visible
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

    // Click tab2
    await user.click(screen.getByTestId('tab2-trigger'));

    // Now tab2 content should be visible
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger
            value='tab1'
            data-testid='tab1-trigger'
          >
            Tab 1
          </TabsTrigger>
          <TabsTrigger
            value='tab2'
            data-testid='tab2-trigger'
          >
            Tab 2
          </TabsTrigger>
          <TabsTrigger
            value='tab3'
            data-testid='tab3-trigger'
          >
            Tab 3
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
        <TabsContent value='tab3'>Content 3</TabsContent>
      </Tabs>,
    );

    const tab1 = screen.getByTestId('tab1-trigger');
    const tab2 = screen.getByTestId('tab2-trigger');

    // Focus first tab
    tab1.focus();
    expect(tab1).toHaveFocus();

    // Press Arrow Right to move to next tab
    await user.keyboard('{ArrowRight}');
    expect(tab2).toHaveFocus();

    // Press Enter to activate the focused tab
    await user.keyboard('{Enter}');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger
            value='tab2'
            disabled
            data-testid='disabled-tab'
          >
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    const disabledTab = screen.getByTestId('disabled-tab');
    expect(disabledTab).toBeDisabled();
    expect(disabledTab).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:opacity-50',
    );
  });
});
