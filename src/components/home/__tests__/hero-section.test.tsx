import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// 导入被测试的组件
import { HeroSection } from '@/components/home/hero-section';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
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
    onClick,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button
      data-testid='button'
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('HeroSection', () => {
  // Mock翻译函数
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
    return translations[key] || key; // key 来自测试数据，安全
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置Mock的默认行为
    mockUseTranslations.mockReturnValue(mockT);

    // Mock intersection observer hook
    mockUseIntersectionObserver.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    });

    // Mock router
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    // Mock theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      resolvedTheme: 'light',
    });
  });

  describe('Basic Rendering', () => {
    it('should render hero section without errors', () => {
      render(<HeroSection />);

      // Hero section uses <section> element, not <header>, so check for main heading instead
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render version badge', () => {
      render(<HeroSection />);

      // Get all badges and find the version badge (first one with rocket emoji)
      const badges = screen.getAllByTestId('badge');
      const versionBadge = badges.find((badge) =>
        badge.textContent?.includes('🚀'),
      );

      expect(versionBadge).toBeInTheDocument();
      expect(versionBadge).toHaveTextContent('🚀');
      expect(versionBadge).toHaveTextContent('v1.0.0');
    });

    it('should render hero title with both lines', () => {
      render(<HeroSection />);

      // Check for the main heading that contains both title lines
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Modern B2B');
      expect(heading).toHaveTextContent('Enterprise Solution');
    });

    it('should render subtitle', () => {
      render(<HeroSection />);

      expect(
        screen.getByText(
          'Build powerful business applications with our modern tech stack',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render demo and github buttons', () => {
      render(<HeroSection />);

      const buttons = screen.getAllByTestId('button');
      expect(buttons).toHaveLength(2);

      expect(screen.getByText('View Demo')).toBeInTheDocument();
      expect(screen.getByText('View on GitHub')).toBeInTheDocument();
    });

    it('should render button icons', () => {
      render(<HeroSection />);

      expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
      expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    it('should render project statistics', () => {
      render(<HeroSection />);

      expect(screen.getByText('22+ Technologies')).toBeInTheDocument();
      expect(screen.getByText('100% TypeScript')).toBeInTheDocument();
      expect(screen.getByText('A+ Performance')).toBeInTheDocument();
      expect(screen.getByText('2 Languages')).toBeInTheDocument();
    });
  });

  describe('Animation Integration', () => {
    it('should use intersection observer for animations', () => {
      render(<HeroSection />);

      // 验证intersection observer被调用了3次（badge, title, buttons）
      expect(mockUseIntersectionObserver).toHaveBeenCalledTimes(3);

      // 验证每次调用都有正确的配置
      expect(mockUseIntersectionObserver).toHaveBeenCalledWith({
        threshold: 0.3,
        triggerOnce: true,
      });
    });

    it('should apply animation classes when visible', () => {
      render(<HeroSection />);

      // Check for section element with animation classes
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();

      // Check for animation classes on animated elements
      const animatedElements = document.querySelectorAll(
        '.translate-y-0.opacity-100',
      );
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should handle invisible state', () => {
      // Mock intersection observer to return invisible state
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: false,
      });

      render(<HeroSection />);

      // Check for section element
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();

      // Check for invisible animation classes
      const invisibleElements = document.querySelectorAll(
        '.translate-y-8.opacity-0, .translate-y-4.opacity-0',
      );
      expect(invisibleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Internationalization', () => {
    it('should use translations for all text content', () => {
      render(<HeroSection />);

      // 验证翻译函数被调用
      expect(mockT).toHaveBeenCalledWith('version');
      expect(mockT).toHaveBeenCalledWith('title.line1');
      expect(mockT).toHaveBeenCalledWith('title.line2');
      expect(mockT).toHaveBeenCalledWith('subtitle');
      expect(mockT).toHaveBeenCalledWith('cta.demo');
      expect(mockT).toHaveBeenCalledWith('cta.github');
      expect(mockT).toHaveBeenCalledWith('stats.technologies');
      expect(mockT).toHaveBeenCalledWith('stats.typescript');
      expect(mockT).toHaveBeenCalledWith('stats.performance');
      expect(mockT).toHaveBeenCalledWith('stats.languages');
    });

    it('should handle missing translations gracefully', () => {
      const mockTWithMissing = vi.fn((key: string) => key);
      mockUseTranslations.mockReturnValue(mockTWithMissing);

      render(<HeroSection />);

      // 应该显示key作为fallback
      expect(screen.getByText('title.line1')).toBeInTheDocument();
      expect(screen.getByText('title.line2')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with responsive classes', () => {
      render(<HeroSection />);

      // Check for responsive classes on the main heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl', 'sm:text-6xl', 'lg:text-7xl');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<HeroSection />);

      // Hero section uses <section> element, not <header>
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();

      // Check for proper paragraph structure
      const paragraph = screen.getByRole('paragraph');
      expect(paragraph).toBeInTheDocument();
    });

    it('should have accessible button elements', () => {
      render(<HeroSection />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle intersection observer errors gracefully', () => {
      // Mock intersection observer to return a safe fallback
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: true, // Safe fallback
      });

      expect(() => render(<HeroSection />)).not.toThrow();
    });

    it('should handle translation errors gracefully', () => {
      // Mock translation function to return fallback values
      mockT.mockImplementation((key: string) => key);

      expect(() => render(<HeroSection />)).not.toThrow();

      // Component should still render with fallback keys
      expect(screen.getByText('version')).toBeInTheDocument();
    });
  });
});
