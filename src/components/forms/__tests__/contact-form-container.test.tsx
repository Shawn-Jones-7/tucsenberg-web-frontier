import { ContactFormContainer } from '@/components/forms/contact-form-container';
import { fireEvent, render, screen } from '@/test/utils';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 确保使用真实的Zod库和validations模块
vi.unmock('zod');
vi.unmock('@/lib/validations');

// Mock next-intl with comprehensive translations
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    // Form fields
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    company: 'Company',
    phone: 'Phone',
    subject: 'Subject',
    message: 'Message',

    // Placeholders
    firstNamePlaceholder: 'Enter your first name',
    lastNamePlaceholder: 'Enter your last name',
    emailPlaceholder: 'Enter your email',
    companyPlaceholder: 'Enter your company',
    phonePlaceholder: 'Enter your phone (optional)',
    subjectPlaceholder: 'Enter subject (optional)',
    messagePlaceholder: 'Enter your message',

    // Actions
    submit: 'Submit',
    submitting: 'Submitting...',

    // Status messages
    submitSuccess: 'Form submitted successfully!',
    submitError: 'Failed to submit form. Please try again.',
    rateLimitMessage: 'Please wait before submitting again.',

    // Checkboxes
    acceptPrivacy: 'I accept the privacy policy',
    marketingConsent: 'I agree to receive marketing communications',
  };

  return Object.prototype.hasOwnProperty.call(translations, key)
    ? translations[key]
    : key; // key 来自测试数据，安全
});

vi.mock('next-intl', () => ({
  useTranslations: () => mockT,
}));

// Mock Turnstile component
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({
    onSuccess,
    onError,
    onExpire,
  }: {
    onSuccess?: (_token: string) => void;
    onError?: (_error: string) => void;
    onExpire?: () => void;
  }) => (
    <div data-testid='turnstile-mock'>
      <button
        type='button'
        data-testid='turnstile-success'
        onClick={() => onSuccess?.('mock-token')}
      >
        Success
      </button>
      <button
        type='button'
        data-testid='turnstile-error'
        onClick={() => onError?.('test error')}
      >
        Error
      </button>
      <button
        type='button'
        data-testid='turnstile-expire'
        onClick={() => onExpire?.()}
      >
        Expire
      </button>
    </div>
  ),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'test-user-agent',
  writable: true,
});

// 通用表单填写函数
const validFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  company: 'Test Company',
  phone: '+1234567890',
  subject: 'Test Subject',
  message: 'Test message content that is long enough to pass validation',
};

const fillValidForm = async () => {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: validFormData.firstName },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: validFormData.lastName },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: validFormData.email },
    });
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: validFormData.company },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: validFormData.phone },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: validFormData.subject },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: validFormData.message },
    });

    // 勾选隐私政策
    const privacyCheckbox = screen.getByLabelText(/accept.*privacy/i);
    fireEvent.click(privacyCheckbox);

    // 启用 Turnstile
    fireEvent.click(screen.getByTestId('turnstile-success'));
  });
};

describe('ContactFormContainer - 剩余高级测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 注意：
  // - 基础渲染测试已移至 contact-form-container-core.test.tsx
  // - 验证逻辑测试已移至 contact-form-validation.test.tsx
  // - 提交和错误处理测试已移至 contact-form-submission.test.tsx

  describe('状态消息组件', () => {
    it('idle 状态不应该显示消息', () => {
      render(<ContactFormContainer />);

      // 不应该有状态消息
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('应该显示正确的状态消息样式', async () => {
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

      // 检查成功消息 - 匹配mock中定义的消息
      expect(
        screen.getByText(/form submitted successfully/i),
      ).toBeInTheDocument();

      // 检查消息样式 - 匹配实际的CSS类名
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('text-green-800');
    });

    it('应该显示错误状态消息样式', async () => {
      // Mock 错误响应
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Server error' }),
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

      // 检查错误消息 - 应该显示通用错误消息而不是具体的服务器错误
      expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();

      // 检查错误消息样式 - 匹配实际的CSS类名
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('text-red-800');
    });
  });
});
