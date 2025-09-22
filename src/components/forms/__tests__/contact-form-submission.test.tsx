/**
 * ContactFormContainer 提交和错误处理测试
 * 专门测试表单提交、网络错误、速率限制等场景
 *
 * 注意：基础测试请参考 contact-form-container-core.test.tsx
 */

import { ContactFormContainer } from '@/components/forms/contact-form-container';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 确保使用真实的Zod库和validations模块
vi.unmock('zod');
vi.unmock('@/lib/validations');

// Mock fetch
global.fetch = vi.fn();

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
const fillValidForm = async () => {
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('网络错误处理', () => {
    it('应该处理网络错误', async () => {
      // Mock 网络错误
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<ContactFormContainer />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让提交完成
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // 检查错误消息 - 应该显示通用错误消息而不是具体的网络错误
      expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();
    });

    it('应该处理速率限制错误', async () => {
      // Mock 速率限制响应
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: 300,
        }),
      } as Response);

      render(<ContactFormContainer />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让提交完成
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

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
      // Mock 成功响应
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Message sent successfully',
        }),
      } as Response);

      render(<ContactFormContainer />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让提交完成
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // 检查成功消息
      expect(
        screen.getByText(/message sent successfully/i),
      ).toBeInTheDocument();

      // 按钮应该被禁用（速率限制）
      expect(submitButton).toBeDisabled();

      // 应该显示速率限制消息
      expect(
        screen.getByText(/please wait before submitting again/i),
      ).toBeInTheDocument();
    });

    it('速率限制应该在5分钟后解除', async () => {
      // Mock 成功响应
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Message sent successfully',
        }),
      } as Response);

      render(<ContactFormContainer />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit/i });

      // 提交表单
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让提交完成
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // 按钮应该被禁用
      expect(submitButton).toBeDisabled();

      // 推进时间5分钟
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      // 重新填写表单（因为状态可能被重置）
      await fillValidForm();

      // 按钮应该重新启用
      expect(submitButton).not.toBeDisabled();

      // 速率限制消息应该消失
      expect(
        screen.queryByText(/please wait before submitting again/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('数据格式化', () => {
    it('应该正确格式化提交数据', async () => {
      // Mock 成功响应
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Message sent successfully',
        }),
      } as Response);

      render(<ContactFormContainer />);

      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Test Company',
        phone: '+1234567890',
        subject: 'Test Subject',
        message: 'Test message content',
      };

      // 填写表单
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), {
          target: { value: testData.firstName },
        });
        fireEvent.change(screen.getByLabelText(/last name/i), {
          target: { value: testData.lastName },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: testData.email },
        });
        fireEvent.change(screen.getByLabelText(/company/i), {
          target: { value: testData.company },
        });
        fireEvent.change(screen.getByLabelText(/phone/i), {
          target: { value: testData.phone },
        });
        fireEvent.change(screen.getByLabelText(/subject/i), {
          target: { value: testData.subject },
        });
        fireEvent.change(screen.getByLabelText(/message/i), {
          target: { value: testData.message },
        });

        // 勾选隐私政策
        const privacyCheckbox = screen.getByLabelText(/accept.*privacy/i);
        fireEvent.click(privacyCheckbox);

        // 启用 Turnstile
        fireEvent.click(screen.getByTestId('turnstile-success'));
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让提交完成
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // 验证fetch被正确调用
      expect(fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining(testData.firstName),
        }),
      );

      // 解析提交的数据
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const requestBody = JSON.parse(fetchCall?.[1]?.body as string);

      // 验证数据格式
      expect(requestBody).toMatchObject({
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email,
        company: testData.company,
        phone: testData.phone,
        subject: testData.subject,
        message: testData.message,
        acceptPrivacy: true,
        turnstileToken: 'mock-token',
      });
    });
  });
});
