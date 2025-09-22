import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InteractiveShowcase } from '@/components/home/showcase/interactive-showcase';

// Mock翻译函数
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'components.interactive.title': 'Interactive Components',
    'components.interactive.description':
      'Interactive UI elements and controls',
    'components.interactive.likes': 'Likes',
    'components.interactive.star': 'Star',
    'components.interactive.download': 'Download',
    'components.interactive.share': 'Share',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

// Mock props
const mockProps = {
  t: mockT,
  likeCount: 42,
  isLiked: false,
  handleLike: vi.fn(),
};

describe('InteractiveShowcase', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染Interactive展示组件', () => {
      render(<InteractiveShowcase {...mockProps} />);

      expect(screen.getByText('Interactive Components')).toBeInTheDocument();
      expect(
        screen.getByText('Interactive UI elements and controls'),
      ).toBeInTheDocument();
    });

    it('应该渲染点赞功能', () => {
      render(<InteractiveShowcase {...mockProps} />);

      expect(screen.getByText('Likes')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('应该渲染交互按钮', () => {
      render(<InteractiveShowcase {...mockProps} />);

      expect(screen.getByText('Star')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  describe('点赞交互', () => {
    it('应该支持点赞功能', () => {
      const handleLike = vi.fn();
      render(
        <InteractiveShowcase
          {...mockProps}
          handleLike={handleLike}
        />,
      );

      // 点赞按钮是第一个按钮（没有文本，只有心形图标）
      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0]; // 第一个按钮是点赞按钮
      if (likeButton) {
        fireEvent.click(likeButton);
      }

      expect(handleLike).toHaveBeenCalledTimes(1);
    });

    it('应该显示点赞数量', () => {
      render(
        <InteractiveShowcase
          {...mockProps}
          likeCount={100}
        />,
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('应该根据isLiked状态显示不同样式', () => {
      const { rerender } = render(
        <InteractiveShowcase
          {...mockProps}
          isLiked={false}
        />,
      );

      let buttons = screen.getAllByRole('button');
      let likeButton = buttons[0]; // 第一个按钮是点赞按钮
      expect(likeButton).not.toHaveClass('text-red-500');

      rerender(
        <InteractiveShowcase
          {...mockProps}
          isLiked={true}
        />,
      );
      buttons = screen.getAllByRole('button');
      likeButton = buttons[0]; // 第一个按钮是点赞按钮
      expect(likeButton).toHaveClass('text-red-500');
    });
  });

  describe('按钮交互', () => {
    it('应该渲染所有交互按钮', () => {
      render(<InteractiveShowcase {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4); // 1个点赞按钮 + 3个功能按钮
    });

    it('应该支持按钮点击', () => {
      render(<InteractiveShowcase {...mockProps} />);

      const starButton = screen.getByText('Star');
      const downloadButton = screen.getByText('Download');
      const shareButton = screen.getByText('Share');

      fireEvent.click(starButton);
      fireEvent.click(downloadButton);
      fireEvent.click(shareButton);

      // 按钮应该可以被点击（不抛出错误）
      expect(starButton).toBeInTheDocument();
      expect(downloadButton).toBeInTheDocument();
      expect(shareButton).toBeInTheDocument();
    });
  });

  describe('翻译功能', () => {
    it('应该调用翻译函数获取所有文本', () => {
      render(<InteractiveShowcase {...mockProps} />);

      expect(mockT).toHaveBeenCalledWith('components.interactive.title');
      expect(mockT).toHaveBeenCalledWith('components.interactive.description');
      expect(mockT).toHaveBeenCalledWith('components.interactive.likes');
      expect(mockT).toHaveBeenCalledWith('components.interactive.star');
      expect(mockT).toHaveBeenCalledWith('components.interactive.download');
      expect(mockT).toHaveBeenCalledWith('components.interactive.share');
    });

    it('应该处理缺失的翻译', () => {
      const fallbackT = vi.fn((key: string) => key);
      const fallbackProps = { ...mockProps, t: fallbackT };
      render(<InteractiveShowcase {...fallbackProps} />);

      expect(
        screen.getByText('components.interactive.title'),
      ).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的CSS类', () => {
      const { container } = render(<InteractiveShowcase {...mockProps} />);

      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
      expect(
        container.querySelector('.flex.items-center.justify-between'),
      ).toBeInTheDocument();
      expect(container.querySelector('.flex.gap-2')).toBeInTheDocument();
    });

    it('应该有正确的组件结构', () => {
      const { container } = render(<InteractiveShowcase {...mockProps} />);

      // 检查是否有点赞区域
      expect(
        container.querySelector('.flex.items-center.justify-between'),
      ).toBeInTheDocument();
      // 检查是否有按钮组
      expect(container.querySelector('.flex.gap-2')).toBeInTheDocument();
    });
  });

  describe('组件结构', () => {
    it('应该使用Card组件包装', () => {
      const { container } = render(<InteractiveShowcase {...mockProps} />);

      // 检查Card结构
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    });

    it('应该包含CardHeader和CardContent', () => {
      render(<InteractiveShowcase {...mockProps} />);

      // 通过文本内容验证结构
      expect(screen.getByText('Interactive Components')).toBeInTheDocument();
      expect(
        screen.getByText('Interactive UI elements and controls'),
      ).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('按钮应该有正确的角色属性', () => {
      render(<InteractiveShowcase {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('data-slot', 'button');
      });
    });

    it('点赞按钮应该有正确的可访问性', () => {
      render(<InteractiveShowcase {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0]; // 第一个按钮是点赞按钮
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).not.toBeDisabled();
    });

    it('功能按钮应该有正确的文本标签', () => {
      render(<InteractiveShowcase {...mockProps} />);

      expect(screen.getByRole('button', { name: /star/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /download/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /share/i }),
      ).toBeInTheDocument();
    });
  });

  describe('边界条件', () => {
    it('应该处理空的翻译函数', () => {
      const emptyT = vi.fn(() => '');
      const emptyProps = { ...mockProps, t: emptyT };
      render(<InteractiveShowcase {...emptyProps} />);

      // 组件应该仍然渲染，即使文本为空
      expect(emptyT).toHaveBeenCalled();
    });

    it('应该处理翻译函数抛出错误', () => {
      const errorT = vi.fn(() => {
        throw new Error('Translation error');
      });
      const errorProps = { ...mockProps, t: errorT };

      expect(() => render(<InteractiveShowcase {...errorProps} />)).toThrow();
    });

    it('应该处理缺失的handleLike函数', () => {
      const propsWithoutHandler = { ...mockProps, handleLike: () => {} };
      render(<InteractiveShowcase {...propsWithoutHandler} />);

      const buttons = screen.getAllByRole('button');
      const likeButton = buttons[0]; // 第一个按钮是点赞按钮
      if (likeButton) {
        expect(() => fireEvent.click(likeButton)).not.toThrow();
      }
    });

    it('应该处理负数的点赞数量', () => {
      render(
        <InteractiveShowcase
          {...mockProps}
          likeCount={-5}
        />,
      );

      expect(screen.getByText('-5')).toBeInTheDocument();
    });

    it('应该处理极大的点赞数量', () => {
      render(
        <InteractiveShowcase
          {...mockProps}
          likeCount={999999}
        />,
      );

      expect(screen.getByText('999999')).toBeInTheDocument();
    });
  });
});
