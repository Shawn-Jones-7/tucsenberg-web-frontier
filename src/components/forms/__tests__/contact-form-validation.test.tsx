/**
 * ContactFormContainer 验证测试
 * 专门测试表单验证逻辑和边界条件
 *
 * 注意：基础测试请参考 contact-form-container-core.test.tsx
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactFormContainer } from '@/components/forms/contact-form-container';

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
  };
  // eslint-disable-next-line security/detect-object-injection
  return translations[key] || key; // key 来自测试数据，安全
});

vi.mock('next-intl', () => ({
  useTranslations: () => mockT,
}));

// 填写有效表单但排除指定字段的辅助函数
const fillValidFormExcept = async (excludeFields: string[]) => {
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

describe('ContactFormContainer - 验证逻辑', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('字段长度验证', () => {
    it('应该验证姓名长度', async () => {
      render(<ContactFormContainer />);

      // 填写所有有效字段，除了firstName
      await fillValidFormExcept(['firstName']);

      // 填写过短的姓名
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), {
          target: { value: 'A' },
        });
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让验证完成
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 检查验证错误
      expect(
        screen.getByText(/first name must be at least 2 characters/i),
      ).toBeInTheDocument();
    });

    it('应该验证消息长度', async () => {
      render(<ContactFormContainer />);

      // 填写所有有效字段，除了消息
      await fillValidFormExcept(['message']);

      // 填写过短的消息
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/message/i), {
          target: { value: 'Hi' },
        });
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让验证完成
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 检查验证错误
      expect(
        screen.getByText(/message must be at least 10 characters/i),
      ).toBeInTheDocument();
    });

    it('应该处理极长的输入', async () => {
      render(<ContactFormContainer />);

      const longText = 'a'.repeat(1000); // 超过最大长度

      // 填写所有有效字段，除了firstName
      await fillValidFormExcept(['firstName']);

      // 填写超长的姓名
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), {
          target: { value: longText },
        });
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让验证完成
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 检查验证错误
      expect(
        screen.getByText(/first name must be less than 50 characters/i),
      ).toBeInTheDocument();
    });
  });

  describe('格式验证', () => {
    it('应该验证电话号码格式', async () => {
      render(<ContactFormContainer />);

      // 填写所有有效字段，除了phone
      await fillValidFormExcept(['phone']);

      // 填写无效电话号码
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/phone/i), {
          target: { value: 'invalid-phone' },
        });
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 推进时间让验证完成
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 检查验证错误
      expect(
        screen.getByText(/please enter a valid phone number/i),
      ).toBeInTheDocument();
    });

    it('应该正确处理特殊字符', async () => {
      // Mock 成功响应
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<ContactFormContainer />);

      const specialCharsData = {
        firstName: 'José',
        lastName: 'García-López',
        email: 'jose.garcia+test@example.com',
        company: 'Café & Co.',
        phone: '+34-123-456-789',
        subject: 'Test with émojis 🚀',
        message: 'Message with special chars: àáâãäåæçèéêë',
      };

      // 填写包含特殊字符的表单
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), {
          target: { value: specialCharsData.firstName },
        });
        fireEvent.change(screen.getByLabelText(/last name/i), {
          target: { value: specialCharsData.lastName },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: specialCharsData.email },
        });
        fireEvent.change(screen.getByLabelText(/company/i), {
          target: { value: specialCharsData.company },
        });
        fireEvent.change(screen.getByLabelText(/phone/i), {
          target: { value: specialCharsData.phone },
        });
        fireEvent.change(screen.getByLabelText(/subject/i), {
          target: { value: specialCharsData.subject },
        });
        fireEvent.change(screen.getByLabelText(/message/i), {
          target: { value: specialCharsData.message },
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

      // 验证fetch被调用且数据正确传递
      expect(fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining(specialCharsData.firstName),
        }),
      );
    });
  });
});
