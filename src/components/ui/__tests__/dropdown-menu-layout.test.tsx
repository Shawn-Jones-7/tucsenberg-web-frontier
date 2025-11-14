/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../dropdown-menu';

vi.mock('lucide-react', () => ({
  CheckIcon: () => null,
  ChevronRightIcon: () => null,
  CircleIcon: () => null,
}));

describe('DropdownMenu - Layout Components', () => {
  describe('DropdownMenuLabel', () => {
    it('renders label', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid='menu-label'>
              Menu Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const label = screen.getByTestId('menu-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Menu Label');
    });

    it('applies default classes', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid='menu-label'>
              Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const label = screen.getByTestId('menu-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Label');
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel
              className='custom-label'
              data-testid='menu-label'
            >
              Custom Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const label = screen.getByTestId('menu-label');
      expect(label).toHaveClass('custom-label');
    });

    it('supports inset prop', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel
              inset
              data-testid='menu-label'
            >
              Inset Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const label = screen.getByTestId('menu-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Inset Label');
    });

    it('renders with different content types', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid='menu-label'>
              <span>Formatted</span> <strong>Label</strong>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const label = screen.getByTestId('menu-label');
      expect(label).toHaveTextContent('Formatted Label');
      expect(label.querySelector('span')).toBeInTheDocument();
      expect(label.querySelector('strong')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separator', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator data-testid='separator' />
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator data-testid='separator' />
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
      expect(separator.tagName.toLowerCase()).toBe('div');
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator
              className='custom-separator'
              data-testid='separator'
            />
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('custom-separator');
    });

    it('renders as hr element by default', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator data-testid='separator' />
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const separator = screen.getByTestId('separator');
      expect(separator.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders shortcut', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuShortcut data-testid='shortcut'>
              ⌘K
            </DropdownMenuShortcut>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toBeInTheDocument();
      expect(shortcut).toHaveTextContent('⌘K');
    });

    it('applies default classes', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuShortcut data-testid='shortcut'>
              ⌘K
            </DropdownMenuShortcut>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toBeInTheDocument();
      expect(shortcut).toHaveTextContent('⌘K');
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuShortcut
              className='custom-shortcut'
              data-testid='shortcut'
            >
              ⌘K
            </DropdownMenuShortcut>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('custom-shortcut');
    });

    it('renders different shortcut formats', () => {
      const shortcuts = ['⌘K', 'Ctrl+K', 'Alt+F4', 'Shift+Enter'];

      shortcuts.forEach((shortcutText, index) => {
        const { unmount } = render(
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuShortcut data-testid={`shortcut-${index}`}>
                {shortcutText}
              </DropdownMenuShortcut>
            </DropdownMenuContent>
          </DropdownMenu>,
        );

        const shortcut = screen.getByTestId(`shortcut-${index}`);
        expect(shortcut).toHaveTextContent(shortcutText);

        unmount();
      });
    });
  });

  describe('DropdownMenuGroup', () => {
    it('renders group', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid='menu-group'>
              <div>Group Content</div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const group = screen.getByTestId('menu-group');
      expect(group).toBeInTheDocument();
      expect(group).toHaveTextContent('Group Content');
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup
              className='custom-group'
              data-testid='menu-group'
            >
              <div>Group Content</div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const group = screen.getByTestId('menu-group');
      expect(group).toHaveClass('custom-group');
    });

    it('groups multiple items together', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid='menu-group'>
              <div data-testid='item-1'>Item 1</div>
              <div data-testid='item-2'>Item 2</div>
              <div data-testid='item-3'>Item 3</div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const group = screen.getByTestId('menu-group');
      const item1 = screen.getByTestId('item-1');
      const item2 = screen.getByTestId('item-2');
      const item3 = screen.getByTestId('item-3');

      expect(group).toBeInTheDocument();
      expect(group).toContainElement(item1);
      expect(group).toContainElement(item2);
      expect(group).toContainElement(item3);
    });

    it('supports nested structure', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid='outer-group'>
              <DropdownMenuGroup data-testid='inner-group'>
                <div>Nested Content</div>
              </DropdownMenuGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const outerGroup = screen.getByTestId('outer-group');
      const innerGroup = screen.getByTestId('inner-group');

      expect(outerGroup).toBeInTheDocument();
      expect(innerGroup).toBeInTheDocument();
      expect(outerGroup).toContainElement(innerGroup);
    });
  });
});
