/**
 * CallToAction Component - Integration Tests
 *
 * 基本集成测试，包括：
 * - 核心渲染功能测试
 * - 基本交互验证
 *
 * 详细测试请参考：
 * - call-to-action-basic.test.tsx - 基础渲染和链接验证测试
 * - call-to-action-interaction.test.tsx - 用户交互和可访问性测试
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CallToAction } from '@/components/home/call-to-action';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockUseTranslations, mockUseIntersectionObserver } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(),
  mockUseIntersectionObserver: vi.fn(),
}));

// Mock外部依赖
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

vi.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: mockUseIntersectionObserver,
}));

// Mock Lucide React图标
vi.mock('lucide-react', () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='arrow-right-icon'
    >
      →
    </span>
  ),
  BookOpen: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='book-open-icon'
    >
      📖
    </span>
  ),
  Download: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='download-icon'
    >
      ⬇️
    </span>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='external-link-icon'
    >
      🔗
    </span>
  ),
  Github: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='github-icon'
    >
      🐙
    </span>
  ),
  MessageCircle: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='message-circle-icon'
    >
      💬
    </span>
  ),
  Star: ({ className }: { className?: string }) => (
    <span
      className={className}
      data-testid='star-icon'
    >
      ⭐
    </span>
  ),
}));

describe('CallToAction Component - Integration Tests', () => {
  // 默认翻译Mock
  const defaultTranslations = {
    'badge': 'Open Source',
    'title': 'Ready to Get Started?',
    'subtitle':
      'Join thousands of developers building amazing projects with our tools.',
    'github.primary.text': 'View on GitHub',
    'github.primary.description': 'Explore the source code',
    'github.secondary.text': 'Star on GitHub',
    'github.secondary.description': 'Show your support',
    'docs.text': 'Documentation',
    'docs.description': 'Learn how to use our tools',
    'community.text': 'Join Community',
    'community.description': 'Connect with other developers',
    'discussions.text': 'Discussions',
    'discussions.description': 'Ask questions and share ideas',
    'issues.text': 'Report Issues',
    'issues.description': 'Help us improve',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认的翻译Mock
    const mockT = vi.fn(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
    mockUseTranslations.mockReturnValue(mockT);

    // 设置默认的Intersection Observer Mock
    mockUseIntersectionObserver.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    });
  });

  describe('核心集成测试', () => {
    it('应该正确渲染完整的CTA组件', () => {
      render(<CallToAction />);

      // 验证主要元素存在
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Join thousands of developers building amazing projects with our tools.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Open Source')).toBeInTheDocument();
    });

    it('应该渲染所有主要行动按钮', () => {
      render(<CallToAction />);

      // 验证主要GitHub按钮
      expect(
        screen.getByRole('link', { name: /primary\.github/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /primary\.demo/i }),
      ).toBeInTheDocument();

      // 验证行动卡片链接
      expect(
        screen.getByRole('link', { name: /buttons\.getStarted/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /buttons\.learnMore.*🔗/i }),
      ).toBeInTheDocument();
    });

    it('应该正确配置外部链接', () => {
      render(<CallToAction />);

      const githubLink = screen.getByRole('link', { name: /primary\.github/i });
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('应该渲染必要的图标', () => {
      render(<CallToAction />);

      // 验证主要图标存在
      // CTABannerBlock has 2 github icons (primary button and action card)
      expect(screen.getAllByTestId('github-icon')).toHaveLength(2);
      // CTABannerBlock uses Star and MessageCircle icons instead of BookOpen/Download
      const starIcons = screen.getAllByTestId('star-icon');
      expect(starIcons.length).toBeGreaterThan(0);
      const messageCircleIcons = screen.getAllByTestId('message-circle-icon');
      expect(messageCircleIcons.length).toBeGreaterThan(0);
    });

    it('应该正确集成翻译系统', () => {
      render(<CallToAction />);

      expect(mockUseTranslations).toHaveBeenCalledWith('home.cta');
    });

    it('应该正确集成Intersection Observer', () => {
      render(<CallToAction />);

      expect(mockUseIntersectionObserver).toHaveBeenCalledWith({
        threshold: 0.2,
        triggerOnce: true,
      });
    });

    it('应该有正确的可访问性结构', () => {
      render(<CallToAction />);

      // 验证标题层次结构
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Ready to Get Started?');
    });

    it('应该处理可见性状态变化', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: false,
      });

      render(<CallToAction />);

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('应该处理翻译缺失的情况', () => {
      const mockT = vi.fn((key: string) => key); // 返回键本身，模拟缺失翻译
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 组件应该仍然渲染，即使翻译缺失
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument();
    });

    it('应该支持基本的键盘导航', () => {
      render(<CallToAction />);

      const firstLink = screen.getByRole('link', { name: /primary\.github/i });
      firstLink.focus();

      expect(firstLink).toHaveFocus();
    });

    it('应该有正确的链接地址', () => {
      render(<CallToAction />);

      const githubLink = screen.getByRole('link', { name: /primary\.github/i });
      expect(githubLink).toHaveAttribute('href', '[GITHUB_URL]');

      const demoLink = screen.getByRole('link', { name: /primary\.demo/i });
      expect(demoLink).toHaveAttribute('href', '#demo');
    });

    it('应该正确处理组件生命周期', () => {
      const { unmount } = render(<CallToAction />);

      // 验证组件可以正常卸载
      expect(() => unmount()).not.toThrow();
    });

    it('应该在错误情况下保持稳定', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: undefined,
      });

      expect(() => render(<CallToAction />)).not.toThrow();
    });

    it('应该有合理的性能表现', () => {
      const mockT = vi.fn(
        (key: string) =>
          defaultTranslations[key as keyof typeof defaultTranslations] || key,
      );
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 验证翻译函数调用次数合理
      expect(mockT.mock.calls.length).toBeGreaterThan(0);
      expect(mockT.mock.calls.length).toBeLessThan(50);
    });

    it('应该正确处理多个相同图标', () => {
      render(<CallToAction />);

      // 验证有多个GitHub图标和箭头图标
      const githubIcons = screen.getAllByTestId('github-icon');
      const arrowIcons = screen.getAllByTestId('arrow-right-icon');

      expect(githubIcons.length).toBeGreaterThan(1);
      expect(arrowIcons.length).toBeGreaterThan(1);
    });

    it('应该支持组件重新渲染', () => {
      const { rerender } = render(<CallToAction />);

      expect(() => rerender(<CallToAction />)).not.toThrow();

      // 验证重新渲染后内容仍然存在
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    });
  });
});
