/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('Tabs Accessibility', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('provides proper ARIA attributes', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList data-testid='tabs-list'>
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
        </TabsList>
        <TabsContent
          value='tab1'
          data-testid='tab1-content'
        >
          Content 1
        </TabsContent>
        <TabsContent
          value='tab2'
          data-testid='tab2-content'
        >
          Content 2
        </TabsContent>
      </Tabs>,
    );

    const tabsList = screen.getByTestId('tabs-list');
    const tab1Trigger = screen.getByTestId('tab1-trigger');
    const tab2Trigger = screen.getByTestId('tab2-trigger');
    const tab1Content = screen.getByTestId('tab1-content');

    // TabsList should have proper role
    expect(tabsList).toHaveAttribute('role', 'tablist');

    // TabsTrigger should have proper role and ARIA attributes
    expect(tab1Trigger).toHaveAttribute('role', 'tab');
    expect(tab1Trigger).toHaveAttribute('data-state', 'active');
    expect(tab1Trigger).toHaveAttribute('aria-selected', 'true');

    expect(tab2Trigger).toHaveAttribute('role', 'tab');
    expect(tab2Trigger).toHaveAttribute('data-state', 'inactive');
    expect(tab2Trigger).toHaveAttribute('aria-selected', 'false');

    // TabsContent should have proper role
    expect(tab1Content).toHaveAttribute('role', 'tabpanel');
    expect(tab1Content).toHaveAttribute('data-state', 'active');
  });

  it('maintains proper ARIA relationships', async () => {
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
        </TabsList>
        <TabsContent
          value='tab1'
          data-testid='tab1-content'
        >
          Content 1
        </TabsContent>
        <TabsContent
          value='tab2'
          data-testid='tab2-content'
        >
          Content 2
        </TabsContent>
      </Tabs>,
    );

    const tab1Trigger = screen.getByTestId('tab1-trigger');
    const tab2Trigger = screen.getByTestId('tab2-trigger');

    // Initially tab1 should be selected
    expect(tab1Trigger).toHaveAttribute('aria-selected', 'true');
    expect(tab2Trigger).toHaveAttribute('aria-selected', 'false');

    // Click tab2
    await user.click(tab2Trigger);

    // Now tab2 should be selected
    expect(tab1Trigger).toHaveAttribute('aria-selected', 'false');
    expect(tab2Trigger).toHaveAttribute('aria-selected', 'true');
  });

  it('supports keyboard navigation with arrow keys', async () => {
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
    const tab3 = screen.getByTestId('tab3-trigger');

    // Focus first tab
    tab1.focus();
    expect(tab1).toHaveFocus();

    // Arrow Right should move to next tab
    await user.keyboard('{ArrowRight}');
    expect(tab2).toHaveFocus();

    // Arrow Right again should move to third tab
    await user.keyboard('{ArrowRight}');
    expect(tab3).toHaveFocus();

    // Arrow Right should wrap to first tab
    await user.keyboard('{ArrowRight}');
    expect(tab1).toHaveFocus();

    // Arrow Left should move to previous tab (wrapping)
    await user.keyboard('{ArrowLeft}');
    expect(tab3).toHaveFocus();
  });

  it('supports Home and End keys', async () => {
    render(
      <Tabs defaultValue='tab2'>
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
    const tab3 = screen.getByTestId('tab3-trigger');

    // Focus middle tab
    tab2.focus();
    expect(tab2).toHaveFocus();

    // Home should move to first tab
    await user.keyboard('{Home}');
    expect(tab1).toHaveFocus();

    // End should move to last tab
    await user.keyboard('{End}');
    expect(tab3).toHaveFocus();
  });

  it('supports Enter and Space keys for activation', async () => {
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
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    const tab2 = screen.getByTestId('tab2-trigger');

    // Focus tab2 but don't activate it yet
    tab2.focus();
    expect(tab2).toHaveFocus();
    expect(screen.getByText('Content 1')).toBeInTheDocument(); // tab1 still active

    // Press Enter to activate
    await user.keyboard('{Enter}');
    expect(screen.getByText('Content 2')).toBeInTheDocument();

    // Switch back to tab1 with click
    await user.click(screen.getByTestId('tab1-trigger'));
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    // Focus tab2 again
    tab2.focus();

    // Press Space to activate
    await user.keyboard(' ');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('manages focus properly when content has focusable elements', async () => {
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
        </TabsList>
        <TabsContent value='tab1'>
          <button data-testid='tab1-button'>Button in Tab 1</button>
        </TabsContent>
        <TabsContent value='tab2'>
          <button data-testid='tab2-button'>Button in Tab 2</button>
        </TabsContent>
      </Tabs>,
    );

    const tab1Trigger = screen.getByTestId('tab1-trigger');
    const tab2Trigger = screen.getByTestId('tab2-trigger');
    const tab1Button = screen.getByTestId('tab1-button');

    // Focus tab1 trigger
    tab1Trigger.focus();
    expect(tab1Trigger).toHaveFocus();

    // Tab should move to content button
    await user.tab();
    expect(tab1Button).toHaveFocus();

    // Tab should move to next tab trigger
    await user.tab();
    expect(tab2Trigger).toHaveFocus();

    // Activate tab2
    await user.keyboard('{Enter}');

    // Tab should move to tab2 content button
    await user.tab();
    const tab2Button = screen.getByTestId('tab2-button');
    expect(tab2Button).toHaveFocus();
  });
});
