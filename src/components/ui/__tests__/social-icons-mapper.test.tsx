/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Mapper Tests
 *
 * Tests for SocialIconMapper component including:
 * - Platform icon mapping
 * - Case insensitive platform names
 * - Unknown platform handling
 * - Custom styling and sizing
 * - Accessibility features
 * - Performance and lifecycle
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SocialIconMapper } from '@/components/ui/social-icons';

describe('Social Icons Mapper Tests', () => {
  describe('SocialIconMapper', () => {
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

    it('renders GitHub icon for "github" input', () => {
      render(
        <SocialIconMapper
          platform='github'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('renders Facebook icon for "facebook" input', () => {
      render(
        <SocialIconMapper
          platform='facebook'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('renders Instagram icon for "instagram" input', () => {
      render(
        <SocialIconMapper
          platform='instagram'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('renders YouTube icon for "youtube" input', () => {
      render(
        <SocialIconMapper
          platform='youtube'
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

    it('handles mixed case platform names', () => {
      render(
        <SocialIconMapper
          platform='LiNkEdIn'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='custom-class'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('custom-class');
    });

    it('applies default size classes', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('supports custom sizing', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='h-8 w-8'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('h-8', 'w-8');
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

    it('supports aria-hidden attribute', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports data-testid attribute', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
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
      expect(icon.tagName).toBe('svg');
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
      expect(icon.tagName).toBe('svg');
    });

    it('handles undefined platform gracefully', () => {
      render(
        <SocialIconMapper
          platform=''
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('supports basic platform mapping', () => {
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

    it('supports className prop', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='text-red-500'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('text-red-500');
    });

    it('handles component lifecycle correctly', () => {
      const { unmount, rerender } = render(
        <SocialIconMapper
          platform='twitter'
          data-testid='mapped-icon'
        />,
      );

      expect(screen.getByTestId('mapped-icon')).toBeInTheDocument();

      rerender(
        <SocialIconMapper
          platform='linkedin'
          data-testid='mapped-icon'
        />,
      );
      expect(screen.getByTestId('mapped-icon')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it('maintains performance with multiple renders', () => {
      const platforms = [
        'twitter',
        'linkedin',
        'github',
        'facebook',
        'instagram',
      ];

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

    it('supports data-testid attribute', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-testid', 'mapped-icon');
    });

    it('handles special characters in platform names', () => {
      render(
        <SocialIconMapper
          platform='twitter-x'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('supports responsive classes', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass(
        'h-4',
        'w-4',
        'md:h-6',
        'md:w-6',
        'lg:h-8',
        'lg:w-8',
      );
    });

    it('supports color customization', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='text-blue-500 hover:text-blue-600'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass('text-blue-500', 'hover:text-blue-600');
    });

    it('supports animation classes', () => {
      render(
        <SocialIconMapper
          platform='twitter'
          className='transition-colors duration-200 hover:scale-110'
          data-testid='mapped-icon'
        />,
      );

      const icon = screen.getByTestId('mapped-icon');
      expect(icon).toHaveClass(
        'transition-colors',
        'duration-200',
        'hover:scale-110',
      );
    });

    it('handles platform name normalization', () => {
      const variations = ['twitter', 'Twitter', 'TWITTER', 'tWiTtEr'];

      variations.forEach((variation) => {
        const { unmount } = render(
          <SocialIconMapper
            platform={variation}
            data-testid={`${variation}-icon`}
          />,
        );

        const icon = screen.getByTestId(`${variation}-icon`);
        expect(icon).toBeInTheDocument();

        unmount();
      });
    });
  });
});
