import { TEST_COUNT_CONSTANTS } from '@/constants/test-constants';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    ExternalLinkIcon,
    LinkedInIcon,
    SocialIconLink,
    SocialIconMapper,
    TwitterIcon,
} from '../social-icons';

describe('Social Icons Components', () => {
  describe('TwitterIcon', () => {
    it('renders Twitter icon with default props', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies custom size', () => {
      render(
        <TwitterIcon
          size={32}
          data-testid='twitter-icon'
        />,
      );

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveAttribute('width', '32');
      expect(icon).toHaveAttribute('height', '32');
    });

    it('applies custom className', () => {
      render(
        <TwitterIcon
          className='text-blue-500'
          data-testid='twitter-icon'
        />,
      );

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveClass('text-blue-500');
    });

    it('has correct viewBox and fill', () => {
      render(<TwitterIcon data-testid='twitter-icon' />);

      const icon = screen.getByTestId('twitter-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon).toHaveAttribute('fill', 'currentColor');
    });

    it('contains path element', () => {
      const { container } = render(<TwitterIcon />);

      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
    });
  });

  describe('LinkedInIcon', () => {
    it('renders LinkedIn icon with default props', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies custom size', () => {
      render(
        <LinkedInIcon
          size={24}
          data-testid='linkedin-icon'
        />,
      );

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });

    it('applies custom className', () => {
      render(
        <LinkedInIcon
          className='text-blue-600'
          data-testid='linkedin-icon'
        />,
      );

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveClass('text-blue-600');
    });

    it('has correct viewBox and fill', () => {
      render(<LinkedInIcon data-testid='linkedin-icon' />);

      const icon = screen.getByTestId('linkedin-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('ExternalLinkIcon', () => {
    it('renders external link icon with default props', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('height', '16');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('has stroke-based styling', () => {
      render(<ExternalLinkIcon data-testid='external-icon' />);

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveAttribute('fill', 'none');
      expect(icon).toHaveAttribute('stroke', 'currentColor');
      expect(icon).toHaveAttribute('stroke-width', '2');
      expect(icon).toHaveAttribute('stroke-linecap', 'round');
      expect(icon).toHaveAttribute('stroke-linejoin', 'round');
    });

    it('applies custom size', () => {
      render(
        <ExternalLinkIcon
          size={20}
          data-testid='external-icon'
        />,
      );

      const icon = screen.getByTestId('external-icon');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });

    it('contains correct path elements', () => {
      const { container } = render(<ExternalLinkIcon />);

      const paths = container.querySelectorAll('path');
      expect(paths).toHaveLength(TEST_COUNT_CONSTANTS.SMALL);
    });
  });

  describe('SocialIconMapper', () => {
    it('renders Twitter icon for "twitter" input', () => {
      const { container } = render(<SocialIconMapper platform='twitter' />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('renders Twitter icon for "x" input', () => {
      const { container } = render(<SocialIconMapper platform='x' />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('renders LinkedIn icon for "linkedin" input', () => {
      const { container } = render(<SocialIconMapper platform='linkedin' />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('handles case insensitive input', () => {
      const { container: twitterContainer } = render(
        <SocialIconMapper platform='TWITTER' />,
      );
      const { container: linkedinContainer } = render(
        <SocialIconMapper platform='LinkedIn' />,
      );

      expect(twitterContainer.querySelector('svg')).toBeInTheDocument();
      expect(linkedinContainer.querySelector('svg')).toBeInTheDocument();
    });

    it('returns ExternalLinkIcon for unknown platform', () => {
      const { container } = render(<SocialIconMapper platform='unknown' />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // ExternalLinkIcon has stroke-based styling and specific viewBox
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('passes through className prop', () => {
      const { container } = render(
        <SocialIconMapper
          platform='twitter'
          className='text-red-500'
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
    });

    it('passes through size prop', () => {
      const { container } = render(
        <SocialIconMapper
          platform='twitter'
          size={32}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('handles conditional props correctly', () => {
      const { container: noPropsContainer } = render(
        <SocialIconMapper platform='twitter' />,
      );
      const { container: withPropsContainer } = render(
        <SocialIconMapper
          platform='twitter'
          className='custom'
          size={24}
        />,
      );

      const noPropsIcon = noPropsContainer.querySelector('svg');
      const withPropsIcon = withPropsContainer.querySelector('svg');

      expect(noPropsIcon).toHaveAttribute('width', '20'); // default
      expect(withPropsIcon).toHaveAttribute('width', '24'); // custom
      expect(withPropsIcon).toHaveClass('custom');
    });
  });

  describe('SocialIconLink', () => {
    const defaultProps = {
      href: 'https://twitter.com/example',
      icon: 'twitter',
      label: 'Twitter',
      ariaLabel: 'Follow us on Twitter',
    };

    it('renders social icon link with all elements', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      const label = screen.getByText('Twitter');

      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
      expect(label).toBeInTheDocument();
    });

    it('applies correct link attributes', () => {
      render(
        <SocialIconLink
          {...defaultProps}
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('aria-label', 'Follow us on Twitter');
    });

    it('applies default styling classes', () => {
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
        'gap-2',
        'text-gray-600',
        'transition-colors',
        'duration-200',
        'hover:text-gray-900',
        'dark:text-gray-400',
        'dark:hover:text-gray-100',
      );
    });

    it('applies custom className', () => {
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

    it('passes iconSize to SocialIconMapper', () => {
      const { container } = render(
        <SocialIconLink
          {...defaultProps}
          iconSize={32}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('renders with LinkedIn icon', () => {
      render(
        <SocialIconLink
          href='https://linkedin.com/company/example'
          icon='linkedin'
          label='LinkedIn'
          ariaLabel='Follow us on LinkedIn'
          data-testid='linkedin-link'
        />,
      );

      const link = screen.getByTestId('linkedin-link');
      const label = screen.getByText('LinkedIn');

      expect(link).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('handles unknown icon gracefully', () => {
      render(
        <SocialIconLink
          href='https://example.com'
          icon='unknown'
          label='Unknown'
          ariaLabel='Unknown platform'
          data-testid='unknown-link'
        />,
      );

      const link = screen.getByTestId('unknown-link');
      const label = screen.getByText('Unknown');

      expect(link).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      // Icon should not render, but link and label should still work
    });

    it('applies text styling to label', () => {
      render(<SocialIconLink {...defaultProps} />);

      const label = screen.getByText('Twitter');
      expect(label).toHaveClass('text-sm');
    });
  });

  describe('Accessibility', () => {
    it('all icons have aria-hidden attribute', () => {
      const { container: twitterContainer } = render(<TwitterIcon />);
      const { container: linkedinContainer } = render(<LinkedInIcon />);
      const { container: externalContainer } = render(<ExternalLinkIcon />);

      expect(twitterContainer.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(linkedinContainer.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(externalContainer.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('SocialIconLink provides proper aria-label', () => {
      render(
        <SocialIconLink
          href='https://twitter.com'
          icon='twitter'
          label='Twitter'
          ariaLabel='Follow us on Twitter for updates'
        />,
      );

      const link = screen.getByLabelText('Follow us on Twitter for updates');
      expect(link).toBeInTheDocument();
    });

    it('external links have proper security attributes', () => {
      render(
        <SocialIconLink
          href='https://external.com'
          icon='twitter'
          label='External'
          ariaLabel='External link'
          data-testid='external-link'
        />,
      );

      const link = screen.getByTestId('external-link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
