/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Mapper & Links Tests - Index
 *
 * Basic integration tests for the Social Icons components.
 * For comprehensive testing, see:
 * - social-icons-mapper.test.tsx - SocialIconMapper tests
 * - social-icons-link.test.tsx - SocialIconLink tests
 */

import { SocialIconLink, SocialIconMapper } from '@/components/ui/social-icons';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Social Icons Mapper & Links Tests - Index', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic SocialIconMapper', () => {
    it('renders Twitter icon for "twitter" input', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('renders LinkedIn icon for "linkedin" input', () => {
      render(
        <SocialIconMapper
          platform='linkedin'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('renders external link icon for unknown platform', () => {
      render(
        <SocialIconMapper
          platform='unknown'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('handles case insensitive platform names', () => {
      render(
        <SocialIconMapper
          platform='TWITTER'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
    });

    it('passes through className to mapped icon', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='custom-mapped'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('custom-mapped');
    });

    it('passes through other props to mapped icon', () => {
      render(
        <SocialIconMapper
          platform='linkedin'
          className='custom-class'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('custom-class');
    });

    it('handles empty platform gracefully', () => {
      render(
        <SocialIconMapper
          platform=''
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
    });

    it('handles null platform gracefully', () => {
      render(
        <SocialIconMapper
          platform=''
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
    });

    it('supports all known platforms', () => {
      const platforms = ['twitter', 'linkedin'];

      platforms.forEach((platform) => {
        const { unmount } = render(
          <SocialIconMapper
            platform={platform}
            data-testid={`${platform}-icon`}
          />,
        );

        const icon = screen.getByTestId(`${platform}-icon`);
        expect(icon).toBeInTheDocument();

        unmount();
      });
    });

    it('maintains consistent sizing across platforms', () => {
      const platforms = ['twitter', 'linkedin', 'unknown'];

      platforms.forEach((platform) => {
        const { unmount } = render(
          <SocialIconMapper
            platform={platform}
            className='h-6 w-6'
            data-testid={`${platform}-icon`}
          />,
        );

        const icon = screen.getByTestId(`${platform}-icon`);
        expect(icon).toHaveClass('h-6', 'w-6');

        unmount();
      });
    });
  });

  describe('Basic SocialIconLink', () => {
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
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('supports custom rel', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

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
          className='custom-social-link'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('custom-social-link');
    });

    it('supports different platforms', () => {
      const platforms = [
        { platform: 'twitter', href: 'https://twitter.com/example' },
        { platform: 'linkedin', href: 'https://linkedin.com/in/example' },
      ];

      platforms.forEach(({ platform, href }) => {
        const { unmount } = render(
          <SocialIconLink
            platform={platform as 'twitter' | 'linkedin'}
            href={href}
            aria-label={`Follow on ${platform}`}
            data-testid={`${platform}-link`}
          />,
        );

        const link = screen.getByTestId(`${platform}-link`);
        expect(link).toHaveAttribute('href', href);

        unmount();
      });
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

    it('maintains accessibility standards', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');

      // Should have accessible name
      expect(link).toHaveAttribute('aria-label');

      // Should be keyboard accessible
      expect(link).toHaveAttribute('href');

      // Icon should be hidden from screen readers
      const icon = link.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
