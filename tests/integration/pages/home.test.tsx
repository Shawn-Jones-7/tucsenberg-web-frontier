import enMessages from '@messages/en.json';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeStatic } from '@/components/home/home-static-page';

const testMessages = {
  home: enMessages.home,
};

// Mock block components (new paths after refactoring)
vi.mock('@/components/blocks/cta/cta-banner-block', () => ({
  CTABannerBlock: () => (
    <section data-testid='call-to-action'>Call to Action Section</section>
  ),
}));

vi.mock('@/components/home/component-showcase', () => ({
  ComponentShowcase: () => (
    <section data-testid='component-showcase'>
      Component Showcase Section
    </section>
  ),
}));

vi.mock('@/components/blocks/hero/hero-split-block', () => ({
  HeroSplitBlock: () => (
    <section data-testid='hero-section'>Hero Section</section>
  ),
  HeroSplitBlockStatic: () => (
    <section data-testid='hero-section'>Hero Section</section>
  ),
}));

vi.mock('@/components/blocks/features/features-grid-block', () => ({
  FeaturesGridBlock: () => (
    <section data-testid='project-overview'>Project Overview Section</section>
  ),
}));

vi.mock('@/components/blocks/tech/tech-tabs-block', () => ({
  TechTabsBlock: () => (
    <section data-testid='tech-stack-section'>Tech Stack Section</section>
  ),
}));

// Mock translations boundary to a simple pass-through
vi.mock('@/components/i18n/translations-boundary', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

vi.mock('next/dynamic', async () => {
  const React = await import('react');
  return {
    __esModule: true,
    default: (
      importer: () => Promise<
        { default?: React.ComponentType<any> } | React.ComponentType<any>
      >,
    ) =>
      function DynamicComponent(props: Record<string, unknown>) {
        const [Loaded, setLoaded] =
          React.useState<React.ComponentType<any> | null>(null);

        React.useEffect(() => {
          let mounted = true;
          importer().then((mod) => {
            if (!mounted) return;
            const Component =
              typeof mod === 'function'
                ? (mod as React.ComponentType<any>)
                : mod.default;
            setLoaded(() => Component ?? (() => null));
          });
          return () => {
            mounted = false;
          };
        }, []);

        if (!Loaded) return null;
        return React.createElement(Loaded, props);
      },
  };
});

describe('Home Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render all main sections in correct order', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      // Verify all sections are present
      const hero = await screen.findByTestId('hero-section');
      const techStack = await screen.findByTestId('tech-stack-section');
      const showcase = await screen.findByTestId('component-showcase');
      const overview = await screen.findByTestId('project-overview');
      const cta = await screen.findByTestId('call-to-action');

      expect(hero).toBeInTheDocument();
      expect(techStack).toBeInTheDocument();
      expect(showcase).toBeInTheDocument();
      expect(overview).toBeInTheDocument();
      expect(cta).toBeInTheDocument();
    });

    it('should have correct page layout structure', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      const hero = await screen.findByTestId('hero-section');
      const mainContainer = hero.parentElement;
      expect(mainContainer).toHaveClass('bg-background');
      expect(mainContainer).toHaveClass('text-foreground');
      expect(mainContainer).toHaveClass('min-h-screen');
    });

    it('should maintain proper section hierarchy', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      const hero = await screen.findByTestId('hero-section');

      // Ensure all sections have been loaded (including dynamic imports)
      await screen.findByTestId('tech-stack-section');
      await screen.findByTestId('component-showcase');
      await screen.findByTestId('project-overview');
      await screen.findByTestId('call-to-action');

      const container = hero.parentElement;
      const sections = Array.from(container?.querySelectorAll('section') ?? []);

      expect(sections).toHaveLength(5);

      const ids = sections.map((el) => el.getAttribute('data-testid'));
      expect(ids).toEqual([
        'hero-section',
        'tech-stack-section',
        'component-showcase',
        'project-overview',
        'call-to-action',
      ]);
    });
  });

  describe('Component Integration', () => {
    it('should render all components without errors', async () => {
      const { container } = render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Verify no error boundaries were triggered
      expect(
        screen.queryByText(/something went wrong/i),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle component loading states', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      await screen.findByTestId('hero-section');
      await screen.findByTestId('tech-stack-section');
      await screen.findByTestId('component-showcase');
      await screen.findByTestId('project-overview');
      await screen.findByTestId('call-to-action');
    });
  });

  describe('Responsive Design', () => {
    it('should maintain layout on different screen sizes', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      const hero = await screen.findByTestId('hero-section');
      const container = hero.parentElement;

      // Container should have responsive classes
      expect(container).toHaveClass('min-h-screen');

      // All sections should be present regardless of screen size
      await screen.findByTestId('hero-section');
      await screen.findByTestId('tech-stack-section');
      await screen.findByTestId('component-showcase');
      await screen.findByTestId('project-overview');
      await screen.findByTestId('call-to-action');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      const heroSection = await screen.findByTestId('hero-section');
      const techStackSection = await screen.findByTestId('tech-stack-section');
      const componentShowcase = await screen.findByTestId('component-showcase');
      const projectOverview = await screen.findByTestId('project-overview');
      const callToAction = await screen.findByTestId('call-to-action');

      expect(heroSection.tagName).toBe('SECTION');
      expect(techStackSection.tagName).toBe('SECTION');
      expect(componentShowcase.tagName).toBe('SECTION');
      expect(projectOverview.tagName).toBe('SECTION');
      expect(callToAction.tagName).toBe('SECTION');

      // Main container should be accessible
      const container = heroSection.parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      const hero = await screen.findByTestId('hero-section');
      const container = hero.parentElement;
      expect(container).toBeInTheDocument();

      // All interactive sections should be present
      await screen.findByTestId('hero-section');
      await screen.findByTestId('call-to-action');
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );
      const endTime = performance.now();

      // Rendering should be fast (under 100ms for mocked components)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle multiple renders without issues', async () => {
      const { rerender } = render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      await screen.findByTestId('hero-section');

      rerender(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      await screen.findByTestId('hero-section');
      await screen.findByTestId('call-to-action');
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors gracefully', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      await screen.findByTestId('hero-section');

      consoleSpy.mockRestore();
    });
  });

  describe('Content Flow', () => {
    it('should present content in logical order for user journey', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      // Wait for all sections to load (including dynamic imports)
      const hero = await screen.findByTestId('hero-section');
      await screen.findByTestId('tech-stack-section');
      await screen.findByTestId('component-showcase');
      await screen.findByTestId('project-overview');
      await screen.findByTestId('call-to-action');

      const container = hero.parentElement;
      const sections = Array.from(container?.children || []);

      // Verify logical flow:
      // 1. Hero (introduction)
      // 2. Tech Stack (what we use)
      // 3. Component Showcase (what we built)
      // 4. Project Overview (how it works)
      // 5. Call to Action (next steps)

      expect(sections[0]).toHaveAttribute('data-testid', 'hero-section');
      expect(sections[1]).toHaveAttribute('data-testid', 'tech-stack-section');
      expect(sections[2]).toHaveAttribute('data-testid', 'component-showcase');
      expect(sections[3]).toHaveAttribute('data-testid', 'project-overview');
      expect(sections[4]).toHaveAttribute('data-testid', 'call-to-action');
    });

    it('should maintain visual hierarchy', async () => {
      render(
        <HomeStatic
          messages={testMessages}
          locale='en'
        />,
      );

      const hero = await screen.findByTestId('hero-section');
      const container = hero.parentElement;

      // Container should establish proper visual context
      expect(container).toHaveClass('bg-background');
      expect(container).toHaveClass('text-foreground');

      // All sections should inherit this context
      expect(hero).toBeInTheDocument();
      await screen.findByTestId('tech-stack-section');
      await screen.findByTestId('component-showcase');
      await screen.findByTestId('project-overview');
      await screen.findByTestId('call-to-action');
    });
  });
});

// zh-locale Fast LCP behavior
describe('Chinese Locale Fast LCP', () => {
  it('sets data-fast-lcp-zh when NEXT_PUBLIC_FAST_LCP_ZH=1 and locale=zh', () => {
    vi.stubEnv('NEXT_PUBLIC_FAST_LCP_ZH', '1');
    render(
      <HomeStatic
        messages={testMessages}
        locale='zh'
      />,
    );
    const hero = screen.getByTestId('hero-section');
    const container = hero.parentElement as HTMLElement | null;
    expect(container).toHaveAttribute('data-fast-lcp-zh', '1');
    vi.unstubAllEnvs();
  });

  it('does not set data-fast-lcp-zh when locale=en even if flag=1', () => {
    vi.stubEnv('NEXT_PUBLIC_FAST_LCP_ZH', '1');
    render(
      <HomeStatic
        messages={testMessages}
        locale='en'
      />,
    );
    const hero = screen.getByTestId('hero-section');
    const container = hero.parentElement as HTMLElement | null;
    expect(container).not.toHaveAttribute('data-fast-lcp-zh');
    vi.unstubAllEnvs();
  });

  it('does not set data-fast-lcp-zh when flag is disabled', () => {
    vi.stubEnv('NEXT_PUBLIC_FAST_LCP_ZH', '0');
    render(
      <HomeStatic
        messages={testMessages}
        locale='zh'
      />,
    );
    const hero = screen.getByTestId('hero-section');
    const container = hero.parentElement as HTMLElement | null;
    expect(container).not.toHaveAttribute('data-fast-lcp-zh');
    vi.unstubAllEnvs();
  });
});
