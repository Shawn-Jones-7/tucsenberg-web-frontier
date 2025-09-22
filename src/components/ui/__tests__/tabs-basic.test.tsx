/**
 * @vitest-environment jsdom
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Tabs Basic Components', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Tabs', () => {
    it('renders tabs root component', () => {
      render(
        <Tabs
          defaultValue='tab1'
          data-testid='tabs-root'
        >
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toBeInTheDocument();
      expect(tabsRoot).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('accepts custom className', () => {
      render(
        <Tabs
          defaultValue='tab1'
          className='custom-tabs'
          data-testid='tabs-root'
        >
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
        </Tabs>,
      );

      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toHaveClass('custom-tabs');
    });

    it('supports controlled mode', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('tab1');

        return (
          <Tabs
            value={value}
            onValueChange={setValue}
          >
            <TabsList>
              <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
              <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value='tab1'>Content 1</TabsContent>
            <TabsContent value='tab2'>Content 2</TabsContent>
          </Tabs>
        );
      };

      render(<TestComponent />);

      // Initially tab1 should be active
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      // Click tab2
      await user.click(screen.getByText('Tab 2'));

      // Tab 2 should be active
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('renders tabs list', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList data-testid='tabs-list'>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
      expect(tabsList).toHaveAttribute('role', 'tablist');
    });

    it('applies correct CSS classes', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList data-testid='tabs-list'>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass(
        'bg-muted',
        'text-muted-foreground',
        'inline-flex',
        'h-9',
        'w-fit',
        'items-center',
        'justify-center',
        'rounded-lg',
        'p-[3px]',
      );
    });

    it('accepts custom className', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList
            className='custom-list'
            data-testid='tabs-list'
          >
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('custom-list');
    });

    it('renders multiple tabs', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
            <TabsTrigger value='tab3'>Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
          <TabsContent value='tab3'>Content 3</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });
  });
});
