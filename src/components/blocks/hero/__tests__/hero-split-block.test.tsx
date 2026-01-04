import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HeroSplitBlockStatic,
  type HeroSplitBlockMessages,
} from '../hero-split-block';

// Test static translation messages covering all HeroSplitBlock keys
const mockMessages: HeroSplitBlockMessages = {
  version: 'v1.0.0',
  title: { line1: 'Modern B2B', line2: 'Enterprise Solution' },
  subtitle: 'Build powerful business applications with our modern tech stack',
  cta: { demo: 'View Demo', github: 'View on GitHub' },
  stats: {
    technologies: '22+ Technologies',
    typescript: '100% TypeScript',
    performance: 'A+ Performance',
    languages: '2 Languages',
  },
};

const renderHero = (
  props?: Partial<Parameters<typeof HeroSplitBlockStatic>[0]>,
) =>
  render(
    <HeroSplitBlockStatic
      messages={mockMessages}
      {...props}
    />,
  );

// Mock config using vi.hoisted
const {
  mockUseTranslations,
  mockUseIntersectionObserver,
  mockUseRouter,
  mockUseTheme,
} = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(),
  mockUseIntersectionObserver: vi.fn(),
  mockUseRouter: vi.fn(),
  mockUseTheme: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

// Mock intersection observer hook
vi.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: mockUseIntersectionObserver,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: mockUseTheme,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid='arrow-right-icon'>ArrowRight</div>,
  ExternalLink: () => <div data-testid='external-link-icon'>ExternalLink</div>,
  Github: () => <div data-testid='github-icon'>Github</div>,
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='badge'
      className={className}
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    className,
    asChild,
    onClick,
    ...props
  }: React.ComponentProps<'button'> & { asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) {
      const childElement = children as React.ReactElement<
        Record<string, unknown>
      >;
      const existingClass =
        (childElement.props as { className?: string })?.className ?? '';
      return React.cloneElement(childElement, {
        ...props,
        onClick,
        'className': [existingClass, className].filter(Boolean).join(' '),
        'data-testid': 'button-link',
      });
    }

    return (
      <button
        data-testid='button'
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

describe('HeroSplitBlock', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'version': 'v1.0.0',
      'title.line1': 'Modern B2B',
      'title.line2': 'Enterprise Solution',
      'subtitle':
        'Build powerful business applications with our modern tech stack',
      'cta.demo': 'View Demo',
      'cta.github': 'View on GitHub',
      'stats.technologies': '22+ Technologies',
      'stats.typescript': '100% TypeScript',
      'stats.performance': 'A+ Performance',
      'stats.languages': '2 Languages',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockReturnValue(mockT);
    mockUseIntersectionObserver.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    });
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      resolvedTheme: 'light',
    });
  });

  describe('Basic Rendering', () => {
    it('should render hero section without errors', () => {
      renderHero();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render version badge', () => {
      renderHero();
      const badges = screen.getAllByTestId('badge');
      const versionBadge = badges.find((badge) =>
        badge.textContent?.includes('🚀'),
      );
      expect(versionBadge).toBeInTheDocument();
      expect(versionBadge).toHaveTextContent('v1.0.0');
    });

    it('should render hero title with both lines', () => {
      renderHero();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Modern B2B');
      expect(heading).toHaveTextContent('Enterprise Solution');
    });

    it('should render subtitle', () => {
      renderHero();
      expect(
        screen.getByText(
          'Build powerful business applications with our modern tech stack',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Props Customization', () => {
    it('should render custom technologies', () => {
      renderHero({ technologies: ['Custom Tech', 'Another Tech'] });
      expect(screen.getByText('Custom Tech')).toBeInTheDocument();
      expect(screen.getByText('Another Tech')).toBeInTheDocument();
    });

    it('should render custom stats', () => {
      renderHero({
        stats: [
          { value: '50+', labelKey: 'technologies' },
          { value: '99%', labelKey: 'typescript' },
        ],
      });
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('99%')).toBeInTheDocument();
    });

    it('should use custom demoHref', () => {
      renderHero({ demoHref: '#custom-demo' });
      const demoLink = screen.getByRole('link', { name: /view demo/i });
      expect(demoLink).toHaveAttribute('href', '#custom-demo');
    });

    it('should use custom githubHref', () => {
      renderHero({ githubHref: 'https://github.com/custom/repo' });
      const githubLink = screen.getByRole('link', { name: /view on github/i });
      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/custom/repo',
      );
    });
  });

  describe('Action Buttons', () => {
    it('should render demo and github buttons', () => {
      renderHero();
      expect(
        screen.getByRole('link', { name: /view demo/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /view on github/i }),
      ).toBeInTheDocument();
    });

    it('should render button icons', () => {
      renderHero();
      expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
      expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    it('should render project statistics', () => {
      renderHero();
      expect(screen.getByText('22+ Technologies')).toBeInTheDocument();
      expect(screen.getByText('100% TypeScript')).toBeInTheDocument();
      expect(screen.getByText('A+ Performance')).toBeInTheDocument();
      expect(screen.getByText('2 Languages')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should use translations for all text content', () => {
      renderHero();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Modern B2B');
      expect(heading).toHaveTextContent('Enterprise Solution');
    });

    it('should handle missing translations gracefully', () => {
      expect(() =>
        render(
          <HeroSplitBlockStatic
            messages={{ ...mockMessages, title: { line1: '', line2: '' } }}
          />,
        ),
      ).not.toThrow();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with responsive classes', () => {
      renderHero();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl', 'sm:text-6xl', 'lg:text-7xl');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      renderHero();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Build powerful business applications with our modern tech stack',
        ),
      ).toBeInTheDocument();
    });

    it('should have accessible button elements', () => {
      renderHero();
      expect(
        screen.getByRole('link', { name: /view demo/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /view on github/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle translation errors gracefully', () => {
      mockT.mockImplementation((key: string) => key);
      expect(() => renderHero()).not.toThrow();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });
  });
});
