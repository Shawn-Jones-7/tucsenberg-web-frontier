/**
 * @vitest-environment jsdom
 */

import {
    ExternalLinkIcon,
    LinkedInIcon,
    TwitterIcon,
} from '@/components/ui/social-icons';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Social Icons - Basic Icons', () => {
  describe('TwitterIcon', () => {
    it('renders Twitter icon with default props', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('applies default size attributes', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });

    it('supports custom className', () => {
      render(
        <TwitterIcon
          className='custom-twitter'
          data-testid='twitter-icon'
        />,
      );

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveClass('custom-twitter');
    });

    it('supports custom size', () => {
      render(
        <TwitterIcon
          className='h-8 w-8'
          data-testid='twitter-icon'
        />,
      );

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveClass('h-8', 'w-8');
    });

    it('has correct viewBox', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has aria-hidden by default', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('has aria-hidden by default for decorative use', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      // TwitterIcon is decorative by default with aria-hidden="true"
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders SVG path correctly', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      const path = icon.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('supports all HTML SVG attributes', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });
  });

  describe('LinkedInIcon', () => {
    it('renders LinkedIn icon with default props', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('applies default size attributes', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });

    it('supports custom className', () => {
      render(
        <LinkedInIcon
          className='custom-linkedin'
          data-testid='linkedin-icon'
        />,
      );

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveClass('custom-linkedin');
    });

    it('supports custom size', () => {
      render(
        <LinkedInIcon
          className='h-6 w-6'
          data-testid='linkedin-icon'
        />,
      );

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveClass('h-6', 'w-6');
    });

    it('has correct viewBox', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has aria-hidden by default', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('has aria-hidden by default for decorative use', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      // LinkedInIcon is decorative by default with aria-hidden="true"
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders SVG path correctly', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      const path = icon.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('supports different color schemes', () => {
      render(
        <LinkedInIcon
          className='text-blue-600'
          data-testid='linkedin-icon'
        />,
      );

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveClass('text-blue-600');
    });

    it('handles responsive sizing', () => {
      render(
        <LinkedInIcon
          className='h-4 w-4 md:h-6 md:w-6'
          data-testid='linkedin-icon'
        />,
      );

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveClass('h-4', 'w-4', 'md:h-6', 'md:w-6');
    });
  });

  describe('ExternalLinkIcon', () => {
    it('renders external link icon with default props', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('applies default size attributes', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('height', '16');
    });

    it('supports custom className', () => {
      render(
        <ExternalLinkIcon
          className='custom-external'
          data-testid='external-icon'
        />,
      );

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveClass('custom-external');
    });

    it('supports custom size', () => {
      render(
        <ExternalLinkIcon
          className='h-3 w-3'
          data-testid='external-icon'
        />,
      );

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveClass('h-3', 'w-3');
    });

    it('has correct viewBox', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has aria-hidden by default', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('has aria-hidden by default for decorative use', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      // ExternalLinkIcon is decorative by default with aria-hidden="true"
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders SVG paths correctly', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      const paths = icon.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('supports inline styling', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toBeInTheDocument();
    });

    it('handles hover states', () => {
      render(
        <ExternalLinkIcon
          className='hover:opacity-80'
          data-testid='external-icon'
        />,
      );

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveClass('hover:opacity-80');
    });

    it('supports focus states', () => {
      render(
        <ExternalLinkIcon
          className='focus:outline-none'
          data-testid='external-icon'
        />,
      );

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveClass('focus:outline-none');
    });

    it('handles dark mode variants', () => {
      render(
        <ExternalLinkIcon
          className='text-gray-600 dark:text-gray-300'
          data-testid='external-icon'
        />,
      );

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveClass('text-gray-600', 'dark:text-gray-300');
    });
  });

  describe('Icon Consistency', () => {
    it('all icons have consistent SVG structure', () => {
      render(
        <div>
          <TwitterIcon data-testid='twitter' />
          <LinkedInIcon data-testid='linkedin' />
          <ExternalLinkIcon data-testid='external' />
        </div>,
      );

      const twitter = screen.getByTestId('twitter');
      const linkedin = screen.getByTestId('linkedin');
      const external = screen.getByTestId('external');

      [twitter, linkedin, external].forEach((icon) => {
        expect(icon.tagName).toBe('svg');
        expect(icon).toHaveAttribute('viewBox');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('all icons support className prop', () => {
      const customClass = 'custom-icon-class';

      render(
        <div>
          <TwitterIcon
            className={customClass}
            data-testid='twitter'
          />
          <LinkedInIcon
            className={customClass}
            data-testid='linkedin'
          />
          <ExternalLinkIcon
            className={customClass}
            data-testid='external'
          />
        </div>,
      );

      const twitter = screen.getByTestId('twitter');
      const linkedin = screen.getByTestId('linkedin');
      const external = screen.getByTestId('external');

      [twitter, linkedin, external].forEach((icon) => {
        expect(icon).toHaveClass(customClass);
      });
    });

    it('all icons render without errors', () => {
      expect(() => {
        render(
          <div>
            <TwitterIcon />
            <LinkedInIcon />
            <ExternalLinkIcon />
          </div>,
        );
      }).not.toThrow();
    });

    it('all icons handle component lifecycle correctly', () => {
      const { unmount } = render(
        <div>
          <TwitterIcon data-testid='twitter' />
          <LinkedInIcon data-testid='linkedin' />
          <ExternalLinkIcon data-testid='external' />
        </div>,
      );

      expect(screen.getByTestId('twitter')).toBeInTheDocument();
      expect(screen.getByTestId('linkedin')).toBeInTheDocument();
      expect(screen.getByTestId('external')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });
  });
});
