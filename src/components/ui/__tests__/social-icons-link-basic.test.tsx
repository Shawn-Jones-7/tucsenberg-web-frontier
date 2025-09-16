/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Link - Basic Tests
 *
 * 专门测试基本链接功能，包括：
 * - 基本渲染
 * - 链接属性
 * - 样式类
 * - 平台支持
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SocialIconLink } from '@/components/ui/social-icons';

describe('Social Icons Link - Basic Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('基本渲染', () => {
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

    it('supports custom target', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('target', '_self');
    });

    it('supports custom rel', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('rel', 'nofollow');
    });
  });

  describe('样式类', () => {
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

    it('supports focus styles', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          className='focus:ring-primary focus:ring-2'
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
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      const icon = link.querySelector('svg');
      expect(icon).toHaveClass('h-8', 'w-8');
    });
  });

  describe('平台支持', () => {
    it('supports different platforms', () => {
      const platforms = [
        { platform: 'twitter', href: 'https://twitter.com/example' },
        { platform: 'linkedin', href: 'https://linkedin.com/in/example' },
        { platform: 'github', href: 'https://github.com/example' },
        { platform: 'facebook', href: 'https://facebook.com/example' },
      ];

      platforms.forEach(({ platform, href }, index) => {
        const { unmount } = render(
          <SocialIconLink
            href={href}
            platform={platform}
            aria-label={`Follow us on ${platform}`}
            data-testid={`social-link-${index}`}
          />,
        );

        const link = screen.getByTestId(`social-link-${index}`);
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', href);

        unmount();
      });
    });
  });

  describe('键盘导航', () => {
    const defaultProps = {
      'href': 'https://twitter.com/example',
      'platform': 'twitter' as const,
      'aria-label': 'Follow us on Twitter',
    };

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
  });

  describe('安全性', () => {
    const defaultProps = {
      'href': 'https://twitter.com/example',
      'platform': 'twitter' as const,
      'aria-label': 'Follow us on Twitter',
    };

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
  });

  describe('HTML属性支持', () => {
    const defaultProps = {
      'href': 'https://twitter.com/example',
      'platform': 'twitter' as const,
      'aria-label': 'Follow us on Twitter',
    };

    it('supports all HTML anchor attributes', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('id', 'social-link-id');
      expect(link).toHaveAttribute('title', 'Social media link');
      expect(link).toHaveAttribute('download', 'file.pdf');
    });

    it('handles component lifecycle correctly', () => {
      const { unmount, rerender } = render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      expect(screen.getByTestId('social-link')).toBeInTheDocument();

      rerender(
        <SocialIconLink
          {...defaultProps}
          href='https://github.com/example'
          data-testid='social-link'
        />,
      );

      expect(screen.getByTestId('social-link')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it('supports data attributes', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-platform='twitter'
          data-category='social'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('data-platform', 'twitter');
      expect(link).toHaveAttribute('data-category', 'social');
    });

    it('handles style prop', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveStyle({
        backgroundColor: 'red',
        color: 'white',
      });
    });
  });
});
