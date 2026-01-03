/**
 * @vitest-environment jsdom
 * Tests for UnderConstructionV2 component parts
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ContactSection,
  EmailSubscription,
  FeaturePreview,
  HeaderSection,
  ProgressSection,
  SocialLinks,
} from '../under-construction-v2-components';

// Mock lucide-react icons - create simple mock components
const MockIcon = vi.hoisted(() => ({ className }: { className?: string }) => (
  <span
    data-testid='mock-icon'
    className={className}
  />
));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    ArrowRight: MockIcon,
    Bell: MockIcon,
    CheckCircle: MockIcon,
    Clock: MockIcon,
    Github: MockIcon,
    Linkedin: MockIcon,
    Mail: MockIcon,
    Twitter: MockIcon,
    Users: MockIcon,
    Zap: MockIcon,
  };
});

// Mock dependencies
const mockFetch = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockUseTranslations = vi.hoisted(() =>
  vi.fn((namespace: string) => {
    return (key: string) => `${namespace}.${key}`;
  }),
);

vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/components/shared/animated-icon', () => ({
  AnimatedIcon: ({
    variant,
    size,
    className,
  }: {
    variant: string;
    size: string;
    className: string;
  }) => (
    <div
      data-testid='animated-icon'
      data-variant={variant}
      data-size={size}
      className={className}
    >
      Icon
    </div>
  ),
}));

vi.mock('@/components/shared/progress-indicator', () => ({
  ProgressIndicator: ({ currentStep }: { currentStep: number }) => (
    <div
      data-testid='progress-indicator'
      data-step={currentStep}
    >
      Progress Step {currentStep}
    </div>
  ),
}));

vi.stubGlobal('fetch', mockFetch);

describe('EmailSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('visibility', () => {
    it('renders when showEmailSubscription is true', () => {
      render(<EmailSubscription showEmailSubscription />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders null when showEmailSubscription is false', () => {
      const { container } = render(
        <EmailSubscription showEmailSubscription={false} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('form submission', () => {
    it('submits email successfully', async () => {
      const user = userEvent.setup();
      render(<EmailSubscription showEmailSubscription />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test@example.com');
      await user.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        });
      });
    });

    it('shows success message after subscription', async () => {
      const user = userEvent.setup();
      render(<EmailSubscription showEmailSubscription />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test@example.com');
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/emailSubscription\.success/),
        ).toBeInTheDocument();
      });
    });

    it('does not submit when email is empty', async () => {
      const user = userEvent.setup();
      render(<EmailSubscription showEmailSubscription />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles subscription error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<EmailSubscription showEmailSubscription />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test@example.com');
      await user.click(button);

      await waitFor(() => {
        expect(mockLoggerError).toHaveBeenCalledWith(
          'Subscription error',
          expect.objectContaining({ error: expect.any(Error) }),
        );
      });
    });
  });

  describe('translations', () => {
    it('displays translated title', () => {
      render(<EmailSubscription showEmailSubscription />);

      expect(screen.getByText(/emailSubscription\.title/)).toBeInTheDocument();
    });

    it('displays translated description', () => {
      render(<EmailSubscription showEmailSubscription />);

      expect(
        screen.getByText(/emailSubscription\.description/),
      ).toBeInTheDocument();
    });
  });
});

describe('SocialLinks', () => {
  describe('visibility', () => {
    it('renders when showSocialLinks is true', () => {
      render(<SocialLinks showSocialLinks />);

      expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'LinkedIn' }),
      ).toBeInTheDocument();
    });

    it('renders null when showSocialLinks is false', () => {
      const { container } = render(<SocialLinks showSocialLinks={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders Twitter link with correct href', () => {
      render(<SocialLinks showSocialLinks />);

      const link = screen.getByRole('link', { name: 'Twitter' });
      expect(link).toHaveAttribute('href', '[SOCIAL_URL]');
    });

    it('renders GitHub link with correct href', () => {
      render(<SocialLinks showSocialLinks />);

      const link = screen.getByRole('link', { name: 'GitHub' });
      expect(link).toHaveAttribute('href', '[GITHUB_URL]');
    });

    it('renders LinkedIn link with correct href', () => {
      render(<SocialLinks showSocialLinks />);

      const link = screen.getByRole('link', { name: 'LinkedIn' });
      expect(link).toHaveAttribute('href', '[SOCIAL_URL]');
    });

    it('opens links in new tab', () => {
      render(<SocialLinks showSocialLinks />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer noopener');
      });
    });
  });
});

describe('FeaturePreview', () => {
  describe('visibility', () => {
    it('renders when showFeaturePreview is true', () => {
      render(<FeaturePreview showFeaturePreview />);

      expect(screen.getByText(/features\.title/)).toBeInTheDocument();
    });

    it('renders null when showFeaturePreview is false', () => {
      const { container } = render(
        <FeaturePreview showFeaturePreview={false} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('features', () => {
    it('displays all three feature cards', () => {
      render(<FeaturePreview showFeaturePreview />);

      expect(screen.getByText(/features\.performance$/)).toBeInTheDocument();
      expect(screen.getByText(/features\.collaboration$/)).toBeInTheDocument();
      expect(screen.getByText(/features\.quality$/)).toBeInTheDocument();
    });

    it('displays feature descriptions', () => {
      render(<FeaturePreview showFeaturePreview />);

      expect(screen.getByText(/features\.performanceDesc/)).toBeInTheDocument();
      expect(
        screen.getByText(/features\.collaborationDesc/),
      ).toBeInTheDocument();
      expect(screen.getByText(/features\.qualityDesc/)).toBeInTheDocument();
    });
  });
});

describe('HeaderSection', () => {
  it('renders with page type and expected date', () => {
    render(
      <HeaderSection
        pageType='products'
        expectedDate='2024年第二季度'
      />,
    );

    expect(screen.getByTestId('animated-icon')).toBeInTheDocument();
    expect(screen.getByText(/pages\.products\.title/)).toBeInTheDocument();
  });

  it('displays expected launch date', () => {
    render(
      <HeaderSection
        pageType='products'
        expectedDate='2024年第二季度'
      />,
    );

    expect(screen.getByText(/expectedLaunch/)).toBeInTheDocument();
    expect(screen.getByText(/2024年第二季度/)).toBeInTheDocument();
  });

  it('renders animated icon with construction variant', () => {
    render(
      <HeaderSection
        pageType='blog'
        expectedDate='2024年第三季度'
      />,
    );

    const icon = screen.getByTestId('animated-icon');
    expect(icon).toHaveAttribute('data-variant', 'construction');
    expect(icon).toHaveAttribute('data-size', 'xl');
  });

  it('renders back to home link', () => {
    render(
      <HeaderSection
        pageType='about'
        expectedDate='2024年第四季度'
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByText(/backToHome/)).toBeInTheDocument();
  });

  it('renders subtitle from translations', () => {
    render(
      <HeaderSection
        pageType='contact'
        expectedDate='2025年第一季度'
      />,
    );

    expect(screen.getByText(/pages\.contact\.subtitle/)).toBeInTheDocument();
  });
});

describe('ProgressSection', () => {
  describe('visibility', () => {
    it('renders when showProgress is true', () => {
      render(
        <ProgressSection
          showProgress
          currentStep={2}
        />,
      );

      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    });

    it('renders null when showProgress is false', () => {
      const { container } = render(
        <ProgressSection
          showProgress={false}
          currentStep={1}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('progress indicator', () => {
    it('passes correct currentStep to ProgressIndicator', () => {
      render(
        <ProgressSection
          showProgress
          currentStep={3}
        />,
      );

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveAttribute('data-step', '3');
    });

    it('displays progress title', () => {
      render(
        <ProgressSection
          showProgress
          currentStep={1}
        />,
      );

      expect(screen.getByText(/progress\.title/)).toBeInTheDocument();
    });
  });
});

describe('ContactSection', () => {
  it('renders contact card', () => {
    render(<ContactSection pageType='products' />);

    expect(screen.getByText(/contact\.title/)).toBeInTheDocument();
    expect(screen.getByText(/contact\.description/)).toBeInTheDocument();
  });

  it('renders contact link to contact page', () => {
    render(<ContactSection pageType='blog' />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('displays contact button text', () => {
    render(<ContactSection pageType='about' />);

    expect(screen.getByText(/contact\.button/)).toBeInTheDocument();
  });
});
