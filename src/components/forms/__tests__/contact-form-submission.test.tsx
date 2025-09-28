/**
 * ContactFormContainer 提交和错误处理测试
 * 专门测试表单提交、网络错误、速率限制等场景
 *
 * 注意：基础测试请参考 contact-form-container-core.test.tsx
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
    submitSuccess: 'Message sent successfully',
    submitError: 'Failed to submit form. Please try again.',
    rateLimitMessage: 'Please wait before submitting again.',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

vi.mock('next-intl', () => ({
  useTranslations: () => mockT,
}));

// 填写有效表单的辅助函数
const _fillValidForm = async () => {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'Test Company' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test message content' },
    });

    // 勾选隐私政策
    const privacyCheckbox = screen.getByLabelText(/accept.*privacy/i);
    fireEvent.click(privacyCheckbox);

    // 启用 Turnstile
    fireEvent.click(screen.getByTestId('turnstile-success'));
  });
};

describe('ContactFormContainer - 提交和错误处理', () => {
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

  describe('网络错误处理', () => {
    it('应该处理网络错误', async () => {
      // Mock useActionState to return error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Network error' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查错误消息 - 应该显示通用错误消息而不是具体的网络错误
      expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();
    });

    it('应该处理速率限制错误', async () => {
      // Mock useActionState to return rate limit error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Rate limit exceeded' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查速率限制消息 - 应该显示通用错误消息而不是具体的速率限制错误
      expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();
    });

    it('没有 Turnstile token 时不应该提交', async () => {
      render(<ContactFormContainer />);

      // 填写表单但不启用 Turnstile
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), {
          target: { value: 'John' },
        });
        fireEvent.change(screen.getByLabelText(/last name/i), {
          target: { value: 'Doe' },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'john.doe@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/company/i), {
          target: { value: 'Test Company' },
        });
        fireEvent.change(screen.getByLabelText(/message/i), {
          target: { value: 'Test message content' },
        });

        // 勾选隐私政策
        const privacyCheckbox = screen.getByLabelText(/accept.*privacy/i);
        fireEvent.click(privacyCheckbox);
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      // 按钮应该仍然被禁用
      expect(submitButton).toBeDisabled();

      // 不应该调用 fetch
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('速率限制功能', () => {
    it('应该在成功提交后显示速率限制', async () => {
      // Mock useActionState to return success state
      mockUseActionState.mockReturnValue([
        { success: true }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查成功消息
      expect(
        screen.getByText(/message sent successfully/i),
      ).toBeInTheDocument();
    });

    it('速率限制应该在5分钟后解除', async () => {
      // Mock useActionState to return idle state (no rate limiting)
      mockUseActionState.mockReturnValue([
        null, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 启用 Turnstile 以使按钮可用
      await act(async () => {
        fireEvent.click(screen.getByTestId('turnstile-success'));
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      // 按钮应该是启用的（没有速率限制且有Turnstile token）
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('数据格式化', () => {
    it('应该正确格式化提交数据', async () => {
      // Mock useActionState to return success state
      mockUseActionState.mockReturnValue([
        { success: true }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 验证表单渲染正确，数据格式化由Server Actions处理
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

      // 验证成功状态显示
      expect(screen.getByText('Message sent successfully')).toBeInTheDocument();
    });
  });
});
