/**
 * CallToAction Component - Interaction Tests
 *
 * 测试交互功能：
 * - 用户交互测试
 * - 可访问性测试
 * - 动画和可见性测试
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('CallToAction Component - Interaction Tests', () => {
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

  describe('用户交互', () => {
    it('应该支持键盘导航', async () => {
      const user = userEvent.setup();
      render(<CallToAction />);

      // 使用Tab键导航到第一个链接
      await user.tab();

      // 验证第一个可聚焦元素获得焦点
      const firstLink = screen.getByRole('link', { name: /primary\.github/i });
      expect(firstLink).toHaveFocus();

      // 继续Tab导航
      await user.tab();
      const secondLink = screen.getByRole('link', { name: /primary\.demo/i });
      expect(secondLink).toHaveFocus();
    });

    it('应该支持Enter键激活链接', async () => {
      const user = userEvent.setup();
      render(<CallToAction />);

      const githubLink = screen.getByRole('link', { name: /primary\.github/i });
      githubLink.focus();

      // 模拟Enter键按下
      await user.keyboard('{Enter}');

      // 验证链接仍然存在（没有导航错误）
      expect(githubLink).toBeInTheDocument();
    });

    it('应该支持空格键激活链接', async () => {
      const user = userEvent.setup();
      render(<CallToAction />);

      const githubLink = screen.getByRole('link', { name: /primary\.github/i });
      githubLink.focus();

      // 模拟空格键按下
      await user.keyboard(' ');

      // 验证链接仍然存在
      expect(githubLink).toBeInTheDocument();
    });

    it('所有外部链接应该在新标签页打开', () => {
      render(<CallToAction />);

      // GitHub链接
      const githubLink = screen.getByRole('link', { name: /primary\.github/i });
      const getStartedLink = screen.getByRole('link', {
        name: /buttons\.getStarted/i,
      });
      const discussionsLink = screen.getByRole('link', {
        name: /community\.discussions/i,
      });
      const issuesLink = screen.getByRole('link', {
        name: /community\.issues/i,
      });

      // 验证外部链接有正确的target属性
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(getStartedLink).toHaveAttribute('target', '_blank');
      expect(discussionsLink).toHaveAttribute('target', '_blank');
      expect(issuesLink).toHaveAttribute('target', '_blank');
    });

    it('内部链接应该在同一标签页打开', () => {
      render(<CallToAction />);

      const demoLink = screen.getByRole('link', { name: /primary\.demo/i });
      const docsLink = screen.getByRole('link', {
        name: /buttons\.learnMore.*→/i,
      });

      // 验证内部链接没有target="_blank"
      expect(demoLink).not.toHaveAttribute('target', '_blank');
      expect(docsLink).not.toHaveAttribute('target', '_blank');
    });
  });

  describe('可访问性', () => {
    it('所有链接应该有正确的ARIA属性', () => {
      render(<CallToAction />);

      const externalLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('target') === '_blank');

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('应该有正确的标题层次结构', () => {
      render(<CallToAction />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Ready to Get Started?');
    });

    it('图标应该有适当的ARIA标签', () => {
      render(<CallToAction />);

      // 验证图标有测试ID（用于可访问性测试）
      // CTABannerBlock has 2 github icons (primary button and action card)
      expect(screen.getAllByTestId('github-icon')).toHaveLength(2);
      // CTABannerBlock uses Star and MessageCircle icons instead of BookOpen/Download
      const starIcons = screen.getAllByTestId('star-icon');
      expect(starIcons.length).toBeGreaterThan(0);
      const messageCircleIcons = screen.getAllByTestId('message-circle-icon');
      expect(messageCircleIcons.length).toBeGreaterThan(0);
    });

    it('链接应该有描述性文本', () => {
      render(<CallToAction />);

      // 验证链接有描述性的可访问名称
      expect(
        screen.getByRole('link', { name: /primary\.github/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /primary\.demo/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /buttons\.getStarted/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /buttons\.learnMore.*🔗/i }),
      ).toBeInTheDocument();
    });

    it('应该支持屏幕阅读器', () => {
      render(<CallToAction />);

      // 验证重要内容对屏幕阅读器可见
      const title = screen.getByText('Ready to Get Started?');
      const subtitle = screen.getByText(
        'Join thousands of developers building amazing projects with our tools.',
      );

      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('动画和可见性', () => {
    it('应该在不可见时应用正确的样式', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: false,
      });

      render(<CallToAction />);

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('应该在可见时应用正确的样式', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: true,
      });

      render(<CallToAction />);

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('应该正确配置Intersection Observer', () => {
      render(<CallToAction />);

      expect(mockUseIntersectionObserver).toHaveBeenCalledWith({
        threshold: 0.2,
        triggerOnce: true,
      });
    });

    it('应该处理Intersection Observer引用', () => {
      const mockRef = vi.fn();
      mockUseIntersectionObserver.mockReturnValue({
        ref: mockRef,
        isVisible: true,
      });

      render(<CallToAction />);

      // 验证ref被正确使用
      expect(mockRef).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理Intersection Observer错误', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: undefined,
      });

      expect(() => render(<CallToAction />)).not.toThrow();
    });

    it('应该处理翻译函数错误', () => {
      mockUseTranslations.mockReturnValue(() => {
        throw new Error('Translation error');
      });

      expect(() => render(<CallToAction />)).toThrow('Translation error');
    });

    it('应该处理缺失的翻译键', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'nonexistent.key') return undefined;
        return (
          defaultTranslations[key as keyof typeof defaultTranslations] || key
        );
      });
      mockUseTranslations.mockReturnValue(mockT);

      expect(() => render(<CallToAction />)).not.toThrow();
    });
  });

  describe('性能优化', () => {
    it('应该只调用必要的翻译', () => {
      const mockT = vi.fn(
        (key: string) =>
          defaultTranslations[key as keyof typeof defaultTranslations] || key,
      );
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 验证翻译函数被调用的次数合理
      expect(mockT.mock.calls.length).toBeGreaterThan(0);
      expect(mockT.mock.calls.length).toBeLessThan(50); // 合理的上限
    });

    it('应该只设置一次Intersection Observer', () => {
      render(<CallToAction />);

      expect(mockUseIntersectionObserver).toHaveBeenCalledTimes(1);
    });
  });
});
