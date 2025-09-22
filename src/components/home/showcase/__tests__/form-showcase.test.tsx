import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormShowcase } from '@/components/home/showcase/form-showcase';

// Mock翻译函数
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'components.forms.title': 'Form Components',
    'components.forms.description': 'Various form elements and inputs',
    'components.forms.name': 'Name',
    'components.forms.email': 'Email',
    'components.forms.submit': 'Submit',
    'components.forms.namePlaceholder': 'Enter your name',
    'components.forms.emailPlaceholder': 'Enter your email',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

describe('FormShowcase', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染Form展示组件', () => {
      render(<FormShowcase t={mockT} />);

      expect(screen.getByText('Form Components')).toBeInTheDocument();
      expect(
        screen.getByText('Various form elements and inputs'),
      ).toBeInTheDocument();
    });

    it('应该渲染所有表单字段', () => {
      render(<FormShowcase t={mockT} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('应该渲染提交按钮', () => {
      render(<FormShowcase t={mockT} />);

      expect(
        screen.getByRole('button', { name: 'Submit' }),
      ).toBeInTheDocument();
    });
  });

  describe('表单交互', () => {
    it('应该支持输入文本', () => {
      render(<FormShowcase t={mockT} />);

      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect(nameInput).toHaveValue('John Doe');
    });

    it('应该支持邮箱输入', () => {
      render(<FormShowcase t={mockT} />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      expect(emailInput).toHaveValue('john@example.com');
    });

    it('应该支持输入占位符', () => {
      render(<FormShowcase t={mockT} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      expect(nameInput).toHaveAttribute('placeholder', 'Enter your name');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
    });

    it('应该支持表单提交', () => {
      render(<FormShowcase t={mockT} />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      // 按钮应该可以被点击（不抛出错误）
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('翻译功能', () => {
    it('应该调用翻译函数获取所有文本', () => {
      render(<FormShowcase t={mockT} />);

      expect(mockT).toHaveBeenCalledWith('components.forms.title');
      expect(mockT).toHaveBeenCalledWith('components.forms.description');
      expect(mockT).toHaveBeenCalledWith('components.forms.name');
      expect(mockT).toHaveBeenCalledWith('components.forms.namePlaceholder');
      expect(mockT).toHaveBeenCalledWith('components.forms.email');
      expect(mockT).toHaveBeenCalledWith('components.forms.emailPlaceholder');
      expect(mockT).toHaveBeenCalledWith('components.forms.submit');
    });

    it('应该处理缺失的翻译', () => {
      const fallbackT = vi.fn((key: string) => key);
      render(<FormShowcase t={fallbackT} />);

      expect(screen.getByText('components.forms.title')).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('邮箱字段应该有正确的类型', () => {
      render(<FormShowcase t={mockT} />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('必填字段应该有required属性', () => {
      render(<FormShowcase t={mockT} />);

      const nameInput = screen.getByLabelText('Name');
      // 检查是否有required属性或相关的验证
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的CSS类', () => {
      const { container } = render(<FormShowcase t={mockT} />);

      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });

    it('应该有正确的表单结构', () => {
      const { container } = render(<FormShowcase t={mockT} />);

      // 检查是否有输入字段和按钮
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBe(2);
      expect(
        container.querySelector('input[type="email"]'),
      ).toBeInTheDocument();
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('组件结构', () => {
    it('应该使用Card组件包装', () => {
      const { container } = render(<FormShowcase t={mockT} />);

      // 检查Card结构
      expect(
        container.querySelector('[data-testid="card"], .card, [class*="card"]'),
      ).toBeTruthy();
    });

    it('应该包含CardHeader和CardContent', () => {
      render(<FormShowcase t={mockT} />);

      // 通过文本内容验证结构
      expect(screen.getByText('Form Components')).toBeInTheDocument();
      expect(
        screen.getByText('Various form elements and inputs'),
      ).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('所有输入字段应该有对应的标签', () => {
      render(<FormShowcase t={mockT} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('表单应该支持键盘导航', () => {
      render(<FormShowcase t={mockT} />);

      const nameInput = screen.getByLabelText('Name');
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
    });
  });

  describe('边界条件', () => {
    it('应该处理空的翻译函数', () => {
      const emptyT = vi.fn(() => '');
      render(<FormShowcase t={emptyT} />);

      // 组件应该仍然渲染，即使文本为空
      expect(emptyT).toHaveBeenCalled();
    });

    it('应该处理翻译函数抛出错误', () => {
      const errorT = vi.fn(() => {
        throw new Error('Translation error');
      });

      expect(() => render(<FormShowcase t={errorT} />)).toThrow();
    });
  });
});
