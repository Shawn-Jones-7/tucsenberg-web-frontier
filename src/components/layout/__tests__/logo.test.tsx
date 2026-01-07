/**
 * @vitest-environment jsdom
 * Tests for Logo, LogoCompact, and LogoLarge components
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SITE_CONFIG } from '@/config/paths/site-config';
import { Logo, LogoCompact, LogoLarge } from '../logo';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
    priority,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
  }) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid='logo-image'
      data-priority={priority ? 'true' : undefined}
    />
  ),
}));

// Mock next/link (P0-2: Logo converted to Server Component using next/link)
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    'href': string;
    'children': React.ReactNode;
    'className'?: string;
    'aria-label'?: string;
  }) => (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      data-testid='logo-link'
    >
      {children}
    </a>
  ),
}));

describe('Logo', () => {
  describe('basic rendering', () => {
    it('renders link to homepage', () => {
      render(<Logo />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveAttribute('href', '/');
    });

    it('renders logo image', () => {
      render(<Logo />);

      const image = screen.getByTestId('logo-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', `${SITE_CONFIG.name} Logo`);
    });

    it('renders logo text by default', () => {
      render(<Logo />);

      expect(screen.getByText(SITE_CONFIG.name)).toBeInTheDocument();
    });

    it('has default aria-label', () => {
      render(<Logo />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveAttribute('aria-label', SITE_CONFIG.name);
    });

    it('has priority attribute on image', () => {
      render(<Logo />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('data-priority', 'true');
    });
  });

  describe('showText prop', () => {
    it('hides text when showText is false', () => {
      render(<Logo showText={false} />);

      expect(screen.queryByText(SITE_CONFIG.name)).not.toBeInTheDocument();
    });

    it('shows text when showText is true', () => {
      render(<Logo showText={true} />);

      expect(screen.getByText(SITE_CONFIG.name)).toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('applies sm size class to image', () => {
      render(<Logo size='sm' />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveClass('h-6');
    });

    it('applies md size class to image (default)', () => {
      render(<Logo size='md' />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveClass('h-8');
    });

    it('applies lg size class to image', () => {
      render(<Logo size='lg' />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveClass('h-10');
    });

    it('applies sm text size class', () => {
      render(<Logo size='sm' />);

      const text = screen.getByText(SITE_CONFIG.name);
      expect(text).toHaveClass('text-lg');
    });

    it('applies md text size class (default)', () => {
      render(<Logo size='md' />);

      const text = screen.getByText(SITE_CONFIG.name);
      expect(text).toHaveClass('text-xl');
    });

    it('applies lg text size class', () => {
      render(<Logo size='lg' />);

      const text = screen.getByText(SITE_CONFIG.name);
      expect(text).toHaveClass('text-2xl');
    });
  });

  describe('custom className', () => {
    it('applies custom className to link', () => {
      render(<Logo className='custom-logo-class' />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveClass('custom-logo-class');
    });

    it('preserves default flex classes with custom className', () => {
      render(<Logo className='my-custom' />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveClass('flex');
      expect(link).toHaveClass('items-center');
      expect(link).toHaveClass('my-custom');
    });
  });

  describe('custom ariaLabel', () => {
    it('applies custom aria-label', () => {
      render(<Logo ariaLabel='Custom Brand' />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveAttribute('aria-label', 'Custom Brand');
    });
  });

  describe('image attributes', () => {
    it('uses correct src path', () => {
      render(<Logo />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('src', '/next.svg');
    });

    it('has dark mode invert class', () => {
      render(<Logo />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveClass('dark:invert');
    });

    it('has transition class', () => {
      render(<Logo />);

      const image = screen.getByTestId('logo-image');
      expect(image).toHaveClass('transition-all');
    });
  });

  describe('text styling', () => {
    it('text has font-bold class', () => {
      render(<Logo />);

      const text = screen.getByText(SITE_CONFIG.name);
      expect(text).toHaveClass('font-bold');
    });

    it('text has text-foreground class', () => {
      render(<Logo />);

      const text = screen.getByText(SITE_CONFIG.name);
      expect(text).toHaveClass('text-foreground');
    });

    it('text uses desktop-only visibility contract', () => {
      render(<Logo />);

      const text = screen.getByText(SITE_CONFIG.name);
      expect(text).toHaveClass('header-logo-text-desktop-only');
    });
  });

  describe('link styling', () => {
    it('link has hover opacity transition', () => {
      render(<Logo />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveClass('hover:opacity-80');
    });

    it('link has gap between image and text', () => {
      render(<Logo />);

      const link = screen.getByTestId('logo-link');
      expect(link).toHaveClass('gap-2');
    });
  });
});

describe('LogoCompact', () => {
  it('renders Logo with showText false', () => {
    render(<LogoCompact />);

    expect(screen.getByTestId('logo-image')).toBeInTheDocument();
    expect(screen.queryByText(SITE_CONFIG.name)).not.toBeInTheDocument();
  });

  it('uses sm size', () => {
    render(<LogoCompact />);

    const image = screen.getByTestId('logo-image');
    expect(image).toHaveClass('h-6');
  });

  it('accepts custom className', () => {
    render(<LogoCompact className='compact-custom' />);

    const link = screen.getByTestId('logo-link');
    expect(link).toHaveClass('compact-custom');
  });
});

describe('LogoLarge', () => {
  it('renders Logo with showText true', () => {
    render(<LogoLarge />);

    expect(screen.getByTestId('logo-image')).toBeInTheDocument();
    expect(screen.getByText(SITE_CONFIG.name)).toBeInTheDocument();
  });

  it('uses lg size', () => {
    render(<LogoLarge />);

    const image = screen.getByTestId('logo-image');
    expect(image).toHaveClass('h-10');
  });

  it('uses lg text size', () => {
    render(<LogoLarge />);

    const text = screen.getByText(SITE_CONFIG.name);
    expect(text).toHaveClass('text-2xl');
  });

  it('accepts custom className', () => {
    render(<LogoLarge className='large-custom' />);

    const link = screen.getByTestId('logo-link');
    expect(link).toHaveClass('large-custom');
  });
});
