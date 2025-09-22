/**
 * @vitest-environment jsdom
 */

/**
 * Card Structure & Accessibility Tests - Core
 *
 * 核心卡片结构和可访问性测试，专注于最重要的功能：
 * - 基础结构测试
 * - 核心可访问性验证
 * - 基本组件集成
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../card';

describe('Card Structure & Accessibility Tests - Core', () => {
  describe('核心结构测试', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(
        screen.getByText('This is the main content of the card.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Footer Action')).toBeInTheDocument();
    });

    it('renders card with minimal structure', () => {
      render(
        <Card>
          <CardContent>
            <p>Minimal card content</p>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Minimal card content')).toBeInTheDocument();
    });

    it('renders card header independently', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Standalone Header</CardTitle>
          </CardHeader>
        </Card>,
      );

      expect(screen.getByText('Standalone Header')).toBeInTheDocument();
    });

    it('renders card footer independently', () => {
      render(
        <Card>
          <CardFooter>
            <button>Standalone Footer</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Standalone Footer')).toBeInTheDocument();
    });
  });

  describe('核心可访问性测试', () => {
    it('has proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>This card is accessible</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content with proper semantics</p>
          </CardContent>
        </Card>,
      );

      const card = screen
        .getByText('Accessible Card')
        .closest('[class*="card"]');
      expect(card).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <Card>
          <CardHeader>
            <CardAction>
              <button>Focusable Action</button>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <button>Focusable Footer</button>
          </CardFooter>
        </Card>,
      );

      const actionButton = screen.getByText('Focusable Action');
      const footerButton = screen.getByText('Focusable Footer');

      expect(actionButton).toBeInTheDocument();
      expect(footerButton).toBeInTheDocument();

      // Both buttons should be focusable
      actionButton.focus();
      expect(actionButton).toHaveFocus();

      footerButton.focus();
      expect(footerButton).toHaveFocus();
    });

    it('maintains proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
            <CardDescription>Supporting description</CardDescription>
          </CardHeader>
        </Card>,
      );

      const title = screen.getByText('Main Title');
      const description = screen.getByText('Supporting description');

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  describe('核心组件集成测试', () => {
    it('integrates header and content properly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Integration Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Integrated content</p>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Integration Test')).toBeInTheDocument();
      expect(screen.getByText('Integrated content')).toBeInTheDocument();
    });

    it('integrates content and footer properly', () => {
      render(
        <Card>
          <CardContent>
            <p>Content before footer</p>
          </CardContent>
          <CardFooter>
            <button>Footer Integration</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Content before footer')).toBeInTheDocument();
      expect(screen.getByText('Footer Integration')).toBeInTheDocument();
    });

    it('handles multiple actions in header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Multiple Actions</CardTitle>
            <CardAction>
              <button>Action 1</button>
              <button>Action 2</button>
            </CardAction>
          </CardHeader>
        </Card>,
      );

      expect(screen.getByText('Multiple Actions')).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });

  describe('核心样式和类名测试', () => {
    it('applies correct CSS classes to card', () => {
      const { container } = render(
        <Card>
          <CardContent>Test content</CardContent>
        </Card>,
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col', 'gap-6', 'rounded-xl', 'border', 'py-6', 'shadow-sm');
    });

    it('applies correct CSS classes to header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Test</CardTitle>
          </CardHeader>
        </Card>,
      );

      const headerElement = screen
        .getByText('Header Test')
        .closest('[data-slot="card-header"]');
      expect(headerElement).toHaveClass(
        '@container/card-header',
        'grid',
        'auto-rows-min',
        'grid-rows-[auto_auto]',
        'items-start',
        'gap-1.5',
        'px-6',
      );
    });

    it('applies correct CSS classes to content', () => {
      render(
        <Card>
          <CardContent>
            <p>Content styling test</p>
          </CardContent>
        </Card>,
      );

      const contentElement = screen
        .getByText('Content styling test')
        .closest('[data-slot="card-content"]');
      expect(contentElement).toHaveClass('px-6');
    });

    it('applies correct CSS classes to footer', () => {
      render(
        <Card>
          <CardFooter>
            <button>Footer styling test</button>
          </CardFooter>
        </Card>,
      );

      const footerElement = screen
        .getByText('Footer styling test')
        .closest('[data-slot="card-footer"]');
      expect(footerElement).toHaveClass('flex', 'items-center', 'px-6', '[.border-t]:pt-6');
    });
  });

  describe('边缘情况测试', () => {
    it('handles empty card gracefully', () => {
      render(<Card />);

      const { container } = render(<Card />);
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeInTheDocument();
    });

    it('handles card with only title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Only Title</CardTitle>
          </CardHeader>
        </Card>,
      );

      expect(screen.getByText('Only Title')).toBeInTheDocument();
    });

    it('handles card with only content', () => {
      render(
        <Card>
          <CardContent>
            <p>Only content</p>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Only content')).toBeInTheDocument();
    });

    it('handles nested content properly', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <h3>Nested heading</h3>
              <p>Nested paragraph</p>
            </div>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Nested heading')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    });
  });
});
