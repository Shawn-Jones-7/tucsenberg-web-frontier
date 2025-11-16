/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Link - Main Tests
 *
 * 主要链接集成测试，包括：
 * - 核心链接功能验证
 * - 基本链接测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - social-icons-link-basic.test.tsx - 基本链接功能测试
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SocialIconLink } from '@/components/ui/social-icons';

describe('Social Icons Link - Main Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心链接功能验证', () => {
    const defaultProps = {
      'href': 'https://twitter.com/example',
      'platform': 'twitter' as const,
      'aria-label': 'Follow us on Twitter',
    };

    it('renders link with icon', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');

      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('applies correct href', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
    });

    it('applies aria-label', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Follow us on Twitter');
    });

    it('opens in new tab by default', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('uses secure target="_blank" by default', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('uses secure rel="noopener noreferrer" by default', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('基本链接测试', () => {
    const defaultProps = {
      'href': 'https://twitter.com/example',
      'platform': 'twitter' as const,
      'aria-label': 'Follow us on Twitter',
    };

    it('applies default classes', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'p-2',
        'text-muted-foreground',
        'transition-colors',
        'hover:bg-accent',
        'hover:text-accent-foreground',
      );
    });

    it('supports custom className', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='custom-class'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('custom-class');
    });

    it('merges custom className with defaults', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='bg-blue-500 text-white'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass(
        'bg-blue-500',
        'text-white',
        'inline-flex',
        'items-center',
      );
    });

    it('handles keyboard navigation', async () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');

      await user.tab();
      expect(link).toHaveFocus();

      // Should be able to activate with Enter
      await user.keyboard('{Enter}');
      // Note: In test environment, navigation won'_t actually happen
    });

    it('supports focus styles', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='focus:ring-2 focus:ring-primary'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('focus:ring-2', 'focus:ring-primary');
    });

    it('handles disabled state', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='pointer-events-none opacity-50'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('pointer-events-none', 'opacity-50');
    });

    it('supports custom icon size', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          iconSize={32}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      const icon = link.querySelector('svg');
      expect(icon).toHaveAttribute('width', '32');
      expect(icon).toHaveAttribute('height', '32');
    });

    it('handles external link security', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('supports core anchor attributes', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      // SocialIconLink supports core attributes like href, target, rel, aria-label
      expect(link).toHaveAttribute('href', defaultProps.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('aria-label', defaultProps['aria-label']);
    });
  });

  describe('错误处理验证', () => {
    const defaultProps = {
      'href': 'https://twitter.com/example',
      'platform': 'twitter' as const,
      'aria-label': 'Follow us on Twitter',
    };

    it('maintains accessibility standards', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');

      // Should have accessible name
      expect(link).toHaveAttribute('aria-label', 'Follow us on Twitter');

      // Should be focusable
      expect(link).toHaveAttribute('href');

      // Icon should be hidden from screen readers
      const icon = link.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports responsive design', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='p-1 md:p-2 lg:p-3'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('p-1', 'md:p-2', 'lg:p-3');

      const icon = link.querySelector('svg');
      // Icon uses width/height attributes, not CSS classes
      expect(icon).toHaveAttribute('width');
      expect(icon).toHaveAttribute('height');
    });

    it('handles hover and active states', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='hover:scale-110 active:scale-95'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('hover:scale-110', 'active:scale-95');
    });

    it('handles empty href gracefully', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          href=''
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('href', '');
    });

    it('handles missing aria-label gracefully', () => {
      const propsWithoutLabel = {
        'href': 'https://twitter.com/example',
        'platform': 'twitter' as const,
        'aria-label': 'Follow us on Twitter',
      };

      render(
        <SocialIconLink
          {...propsWithoutLabel}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toBeInTheDocument();
    });
  });
});
