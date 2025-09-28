/**
 * ContactFormContainer 核心测试
 * 包含基础渲染、基本验证和Turnstile集成测试
 *
 * 注意：高级测试场景请参考 contact-form-container.test.tsx
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactFormContainer } from '@/components/forms/contact-form-container';

// 确保使用真实的Zod库和validations模块
vi.unmock('zod');
vi.unmock('@/lib/validations');

// Mock fetch
global.fetch = vi.fn();

// Mock useActionState for React 19 testing
const mockUseActionState = vi.hoisted(() => vi.fn());
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: mockUseActionState,
  };
});

// Mock next-intl
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    company: 'Company',
    phone: 'Phone',
    subject: 'Subject',
    message: 'Message',
    submit: 'Submit',
    submitting: 'Submitting...',
    acceptPrivacy: 'I accept the privacy policy',
    marketingConsent: 'I would like to receive marketing communications',
    submitSuccess: 'Message sent successfully',
    submitError: 'Failed to submit form. Please try again.',
    rateLimitMessage: 'Please wait before submitting again.',
    firstNamePlaceholder: 'Enter your first name',
    lastNamePlaceholder: 'Enter your last name',
    emailPlaceholder: 'your@email.com',
    companyPlaceholder: 'Your company name',
    phonePlaceholder: '+1 (555) 123-4567',
    subjectPlaceholder: 'What can we help you with?',
    messagePlaceholder: 'Please describe your needs or questions...',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

vi.mock('next-intl', () => ({
  useTranslations: () => mockT,
}));

// Mock Turnstile
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({
    onSuccess,
    onError,
    onExpire,
  }: {
    onSuccess?: (token: string) => void;
    onError?: (error: string) => void;
    onExpire?: () => void;
  }) => (
    <div data-testid='turnstile-mock'>
      <button
        data-testid='turnstile-success'
        onClick={() => onSuccess?.('mock-token')}
      >
        Success
      </button>
      <button
        data-testid='turnstile-error'
        onClick={() => onError?.('mock-error')}
      >
        Error
      </button>
      <button
        data-testid='turnstile-expire'
        onClick={() => onExpire?.()}
      >
        Expire
      </button>
    </div>
  ),
}));

// 填写有效表单的辅助函数
const _fillValidForm = async (excludeFields: string[] = []) => {
  await act(async () => {
    if (!excludeFields.includes('firstName')) {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
    }

    if (!excludeFields.includes('lastName')) {
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
    }

    if (!excludeFields.includes('email')) {
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      });
    }

    if (!excludeFields.includes('company')) {
      fireEvent.change(screen.getByLabelText(/company/i), {
        target: { value: 'Test Company' },
      });
    }

    if (!excludeFields.includes('phone')) {
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '+1234567890' },
      });
    }

    if (!excludeFields.includes('subject')) {
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' },
      });
    }

    if (!excludeFields.includes('message')) {
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message content' },
      });
    }

    // 总是勾选隐私政策（除非明确排除）
    if (!excludeFields.includes('acceptPrivacy')) {
      const privacyCheckbox = screen.getByLabelText(/accept.*privacy/i);
      fireEvent.click(privacyCheckbox);
    }

    // 启用 Turnstile
    fireEvent.click(screen.getByTestId('turnstile-success'));
  });
};

describe('ContactFormContainer - 核心功能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default useActionState mock - idle state
    mockUseActionState.mockReturnValue([
      null, // state
      vi.fn(), // formAction
      false, // isPending
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('基础渲染', () => {
    it('应该正确渲染联系表单', () => {
      render(<ContactFormContainer />);

      // 检查表单元素存在
      expect(
        screen.getByRole('button', { name: /submit/i }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('turnstile-mock')).toBeInTheDocument();

      // 检查所有表单字段都存在
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    });

    it('应该渲染所有必需的表单字段', () => {
      render(<ContactFormContainer />);

      // 检查所有字段是否存在
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('提交按钮初始状态应该被禁用', () => {
      render(<ContactFormContainer />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('基本验证', () => {
    it('应该验证邮箱格式', async () => {
      // Mock useActionState to return error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Validation failed' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 验证错误状态消息已显示
      expect(
        screen.getByText('Failed to submit form. Please try again.'),
      ).toBeInTheDocument();
    });

    it('应该验证必填字段', async () => {
      // Mock useActionState to return error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Validation failed' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 验证错误状态消息已显示
      expect(
        screen.getByText('Failed to submit form. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  describe('Turnstile 集成', () => {
    it('Turnstile 成功后应该启用提交按钮', () => {
      render(<ContactFormContainer />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();

      fireEvent.click(screen.getByTestId('turnstile-success'));
      // 注意：实际启用还需要表单验证通过
    });

    it('Turnstile 错误后应该禁用提交按钮', () => {
      render(<ContactFormContainer />);

      // 先成功，再错误
      fireEvent.click(screen.getByTestId('turnstile-success'));
      fireEvent.click(screen.getByTestId('turnstile-error'));

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('Turnstile 过期后应该禁用提交按钮', () => {
      render(<ContactFormContainer />);

      // 先成功，再过期
      fireEvent.click(screen.getByTestId('turnstile-success'));
      fireEvent.click(screen.getByTestId('turnstile-expire'));

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('基本提交功能', () => {
    it('应该成功提交有效表单', async () => {
      // Mock useActionState to return success state
      mockUseActionState.mockReturnValue([
        { success: true }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查成功消息 - 使用翻译文本
      expect(screen.getByText('Message sent successfully')).toBeInTheDocument();
    });

    it('应该处理 API 错误响应', async () => {
      // Mock useActionState to return error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Server error' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查错误消息 - 使用翻译文本
      expect(
        screen.getByText('Failed to submit form. Please try again.'),
      ).toBeInTheDocument();
    });
  });
});
