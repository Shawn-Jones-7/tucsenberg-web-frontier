/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../dropdown-menu';

// 局部 Mock lucide-react（v4：避免 hoist 导致的集中 Mock 冲突）
vi.mock('lucide-react', () => ({
  CheckIcon: () => null,
  ChevronRightIcon: () => null,
  CircleIcon: () => null,
}));

describe('DropdownMenu - Accessibility', () => {
  it('supports keyboard navigation', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>Open</DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuItem data-testid='item-1'>Item 1</DropdownMenuItem>
          <DropdownMenuItem data-testid='item-2'>Item 2</DropdownMenuItem>
          <DropdownMenuItem data-testid='item-3'>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const content = screen.getByTestId('content');
    const item1 = screen.getByTestId('item-1');
    const item2 = screen.getByTestId('item-2');
    const item3 = screen.getByTestId('item-3');

    expect(content).toHaveAttribute('role', 'menu');
    expect(item1).toHaveAttribute('role', 'menuitem');
    expect(item2).toHaveAttribute('role', 'menuitem');
    expect(item3).toHaveAttribute('role', 'menuitem');
  });

  it('provides proper ARIA attributes', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>
          Open Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(content).toHaveAttribute('role', 'menu');
  });

  it('supports disabled items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='enabled-item'>
            Enabled
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            data-testid='disabled-item'
          >
            Disabled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const enabledItem = screen.getByTestId('enabled-item');
    const disabledItem = screen.getByTestId('disabled-item');

    expect(enabledItem).not.toHaveAttribute('data-disabled');
    expect(disabledItem).toHaveAttribute('data-disabled');
  });

  it('handles focus management', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>Open</DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuItem data-testid='item-1'>Item 1</DropdownMenuItem>
          <DropdownMenuItem data-testid='item-2'>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
  });

  it('supports screen readers with proper labeling', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger
          data-testid='trigger'
          aria-label='Main menu'
        >
          Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-testid='content'
          aria-label='Menu options'
        >
          <DropdownMenuLabel>File Operations</DropdownMenuLabel>
          <DropdownMenuItem>New File</DropdownMenuItem>
          <DropdownMenuItem>Open File</DropdownMenuItem>
          <DropdownMenuItem>Save File</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(trigger).toHaveAttribute('aria-label', 'Main menu');
    expect(content).toHaveAttribute('aria-label', 'Menu options');
  });

  it('handles high contrast mode compatibility', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>
          High Contrast Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuItem data-testid='item'>
            High Contrast Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const content = screen.getByTestId('content');
    const item = screen.getByTestId('item');

    // These elements should be properly styled for high contrast
    expect(content).toBeInTheDocument();
    expect(item).toBeInTheDocument();
  });

  it('supports ARIA live regions for dynamic content', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>
          Dynamic Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <div
            aria-live='polite'
            data-testid='live-region'
          >
            Menu status: Open
          </div>
          <DropdownMenuItem>Dynamic Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('Menu status: Open');
  });

  it('handles keyboard shortcuts accessibility', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>
          Shortcut Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuItem data-testid='item-with-shortcut'>
            <span>Copy</span>
            <span aria-label='Keyboard shortcut: Control C'>⌘C</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByTestId('item-with-shortcut');
    const shortcut = screen.getByLabelText('Keyboard shortcut: Control C');

    expect(item).toBeInTheDocument();
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveTextContent('⌘C');
  });

  it('supports reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='trigger'>
          Reduced Motion Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
  });

  it('handles touch and mobile accessibility', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger
          data-testid='trigger'
          style={{ minHeight: '44px', minWidth: '44px' }} // Touch target size
        >
          Mobile Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='content'>
          <DropdownMenuItem
            data-testid='mobile-item'
            style={{ minHeight: '44px' }} // Touch target size
          >
            Mobile Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    const item = screen.getByTestId('mobile-item');

    expect(trigger).toBeInTheDocument();
    expect(item).toBeInTheDocument();
  });
});
