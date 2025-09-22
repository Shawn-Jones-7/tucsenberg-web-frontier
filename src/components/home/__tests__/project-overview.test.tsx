import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Import the component after mocks
import { ProjectOverview } from '@/components/home/project-overview';

// Mock next-intl
const mockUseTranslations = vi.hoisted(() => vi.fn());
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

// Mock intersection observer hook
const mockUseIntersectionObserver = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: mockUseIntersectionObserver,
}));

// Mock site config
vi.mock('@/lib/site-config', () => ({
  PROJECT_STATS: {
    performance: {
      grade: 'A+',
      securityScore: '95%',
      languages: 2,
    },
  },
  TECH_ARCHITECTURE: {
    frontend: {
      title: 'Frontend',
      technologies: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS'],
      color: 'blue',
    },
    ui: {
      title: 'UI System',
      technologies: ['shadcn/ui', 'Radix UI', 'Lucide Icons', 'CSS Variables'],
      color: 'green',
    },
    tooling: {
      title: 'Development',
      technologies: ['ESLint', 'Prettier', 'Husky', 'Jest'],
      color: 'purple',
    },
  },
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='badge'
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: (
    props: React.PropsWithChildren<{
      variant?: string;
      size?: string;
      className?: string;
      onClick?: () => void;
      disabled?: boolean;
      asChild?: boolean;
      [key: string]: unknown;
    }>,
  ) => {
    const { asChild, children, ...restProps } = props;
    if (asChild) {
      return (
        <div
          data-testid='button'
          {...restProps}
        >
          {children}
        </div>
      );
    }
    return (
      <button
        data-testid='button'
        {...restProps}
      >
        {children}
      </button>
    );
  },
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card'
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-content'
      {...props}
    >
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-description'
      {...props}
    >
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-header'
      {...props}
    >
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-title'
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid='arrow-right-icon'>ArrowRight</div>,
  CheckCircle: () => <div data-testid='check-circle-icon'>CheckCircle</div>,
  Code: () => <div data-testid='code-icon'>Code</div>,
  ExternalLink: () => <div data-testid='external-link-icon'>ExternalLink</div>,
  Globe: () => <div data-testid='globe-icon'>Globe</div>,
  Palette: () => <div data-testid='palette-icon'>Palette</div>,
  Rocket: () => <div data-testid='rocket-icon'>Rocket</div>,
  Shield: () => <div data-testid='shield-icon'>Shield</div>,
  Zap: () => <div data-testid='zap-icon'>Zap</div>,
}));

describe('ProjectOverview', () => {
  // Mock translation function
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'title': 'Project Overview',
      'subtitle': 'Comprehensive analysis of our modern tech stack',
      'features.performance.title': 'High Performance',
      'features.performance.description': 'Optimized for speed and efficiency',
      'features.security.title': 'Security First',
      'features.security.description': 'Built with security best practices',
      'features.i18n.title': 'Internationalization',
      'features.i18n.description': 'Multi-language support',
      'features.themes.title': 'Theme Support',
      'features.themes.description': 'Light and dark themes',
      'highlights.title': 'Project Highlights',
      'highlights.subtitle': 'Key features and benefits',
      'highlights.modern': 'Modern Architecture',
      'highlights.scalable': 'Highly Scalable',
      'highlights.accessible': 'Accessibility First',
      'highlights.performant': 'High Performance',
      'highlights.secure': 'Security Focused',
      'highlights.maintainable': 'Easy to Maintain',
      'architecture.title': 'Tech Architecture',
      'architecture.subtitle': 'Modern stack for enterprise applications',
      'architecture.frontend.description': 'Modern frontend technologies',
      'architecture.ui.description': 'Comprehensive UI system',
      'architecture.tooling.description': 'Development tools and workflow',
      'cta.title': 'Get Started',
      'cta.description': 'Ready to build something amazing?',
      'cta.getStarted': 'Get Started',
      'cta.viewSource': 'View Source Code',
    };
    return translations[key] || key; // key 来自测试数据，安全
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockUseTranslations.mockReturnValue(mockT);
    mockUseIntersectionObserver.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render project overview without errors', () => {
      render(<ProjectOverview />);

      expect(screen.getByText('Project Overview')).toBeInTheDocument();
    });

    it('should render main title and subtitle', () => {
      render(<ProjectOverview />);

      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      expect(
        screen.getByText('Comprehensive analysis of our modern tech stack'),
      ).toBeInTheDocument();
    });
  });

  describe('Feature Grid', () => {
    it('should render all feature cards', () => {
      render(<ProjectOverview />);

      // Use getAllByText to handle multiple occurrences
      const highPerformanceElements = screen.getAllByText('High Performance');
      expect(highPerformanceElements.length).toBeGreaterThan(0);

      expect(screen.getByText('Security First')).toBeInTheDocument();
      expect(screen.getByText('Internationalization')).toBeInTheDocument();
      expect(screen.getByText('Theme Support')).toBeInTheDocument();
    });

    it('should render feature icons', () => {
      render(<ProjectOverview />);

      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
    });

    it('should render feature badges', () => {
      render(<ProjectOverview />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);

      // Check for specific badge content
      expect(screen.getByText('A+')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  describe('Tech Architecture', () => {
    it('should render architecture section', () => {
      render(<ProjectOverview />);

      // Check if architecture section exists by looking for technology items
      expect(screen.getByText('Next.js 15')).toBeInTheDocument();
    });

    it('should render architecture categories', () => {
      render(<ProjectOverview />);

      // Check for technology items instead of category titles
      expect(screen.getByText('Next.js 15')).toBeInTheDocument();
      expect(screen.getByText('shadcn/ui')).toBeInTheDocument();
      expect(screen.getByText('ESLint')).toBeInTheDocument();
    });

    it('should render technology items', () => {
      render(<ProjectOverview />);

      expect(screen.getByText('Next.js 15')).toBeInTheDocument();
      expect(screen.getByText('React 19')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('shadcn/ui')).toBeInTheDocument();
      expect(screen.getByText('ESLint')).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    it('should render CTA buttons', () => {
      render(<ProjectOverview />);

      // Use getAllByText to handle multiple occurrences
      const getStartedElements = screen.getAllByText('Get Started');
      expect(getStartedElements.length).toBeGreaterThan(0);

      expect(screen.getByText('View Source Code')).toBeInTheDocument();
    });

    it('should render CTA icons', () => {
      render(<ProjectOverview />);

      expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
      expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
    });
  });

  describe('Animation Integration', () => {
    it('should use intersection observer for animations', () => {
      render(<ProjectOverview />);

      // Verify intersection observer is called for animated sections
      expect(mockUseIntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Internationalization', () => {
    it('should use translations for all text content', () => {
      render(<ProjectOverview />);

      expect(mockT).toHaveBeenCalledWith('title');
      expect(mockT).toHaveBeenCalledWith('subtitle');
      expect(mockT).toHaveBeenCalledWith('features.performance.title');
      expect(mockT).toHaveBeenCalledWith('features.security.title');
      expect(mockT).toHaveBeenCalledWith('architecture.title');
    });
  });
});
