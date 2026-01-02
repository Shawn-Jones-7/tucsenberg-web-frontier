import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactFormContainer } from '@/components/forms/contact-form-container';
import * as contactFormConfig from '@/config/contact-form-config';
import { fireEvent, render, screen } from '@/test/utils';

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

  const normalizedKey = key.split('.').pop() ?? key;
  return Object.prototype.hasOwnProperty.call(translations, normalizedKey)
    ? translations[normalizedKey]
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

const _fillValidForm = async () => {
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

    // Set default useActionState mock return value
    mockUseActionState.mockReturnValue([
      null, // state (idle)
      vi.fn(), // formAction
      false, // isPending
    ]);
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
      // Mock useActionState to return success state
      mockUseActionState.mockReturnValue([
        { success: true }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查成功消息 - 匹配mock翻译中定义的消息
      expect(
        screen.getByText('Form submitted successfully!'),
      ).toBeInTheDocument();

      // 检查消息样式 - 匹配实际的CSS类名
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('text-green-800');
    });

    it('应该显示错误状态消息样式', async () => {
      // Mock useActionState to return error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Server error' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      render(<ContactFormContainer />);

      // 检查错误消息 - 匹配mock翻译中定义的消息
      expect(
        screen.getByText('Failed to submit form. Please try again.'),
      ).toBeInTheDocument();

      // 检查错误消息样式 - 匹配实际的CSS类名
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('text-red-800');
    });
  });
});

describe('ContactFormContainer - 配置驱动', () => {
  const baseField = (
    overrides: Partial<contactFormConfig.ContactFormFieldDescriptor> = {},
  ): contactFormConfig.ContactFormFieldDescriptor => ({
    key: 'email',
    enabled: true,
    required: true,
    type: 'email',
    order: 1,
    i18nKey: 'email',
    labelKey: 'contact.form.email',
    placeholderKey: 'contact.form.emailPlaceholder',
    isCheckbox: false,
    isHoneypot: false,
    ...overrides,
  });

  let builderSpy: any = null;

  afterEach(() => {
    builderSpy?.mockRestore();
    builderSpy = null;
  });

  beforeEach(() => {
    mockUseActionState.mockReturnValue([null, vi.fn(), false]);
  });

  it('根据配置控制 required 与星号', () => {
    builderSpy = vi
      .spyOn(contactFormConfig, 'buildFormFieldsFromConfig')
      .mockReturnValue([baseField({ required: false })]);

    render(<ContactFormContainer />);

    const emailLabel = screen.getByText('Email');
    expect(emailLabel.className).not.toContain("after:content-['*']");
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).not.toHaveAttribute('required');
  });

  it('字段禁用时不渲染', () => {
    builderSpy = vi
      .spyOn(contactFormConfig, 'buildFormFieldsFromConfig')
      .mockReturnValue([baseField()]);

    render(<ContactFormContainer />);

    expect(screen.queryByLabelText(/accept.*privacy/i)).toBeNull();
  });
});

describe('ContactFormContainer - ErrorDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display validation error details', () => {
    mockUseActionState.mockReturnValue([
      {
        success: false,
        error: 'Validation failed',
        details: ['errors.invalidEmail', 'errors.messageTooShort'],
      },
      vi.fn(),
      false,
    ]);

    render(<ContactFormContainer />);

    // Should show error container with details
    expect(screen.getByText('errors.invalidEmail')).toBeInTheDocument();
    expect(screen.getByText('errors.messageTooShort')).toBeInTheDocument();
  });

  it('should display raw error message for non-validation errors', () => {
    mockUseActionState.mockReturnValue([
      {
        success: false,
        error: 'Server connection failed',
        details: undefined,
      },
      vi.fn(),
      false,
    ]);

    render(<ContactFormContainer />);

    expect(screen.getByText('Server connection failed')).toBeInTheDocument();
  });

  it('should not display ErrorDisplay when no error', () => {
    mockUseActionState.mockReturnValue([{ success: true }, vi.fn(), false]);

    render(<ContactFormContainer />);

    // Should not have error container
    expect(
      screen.queryByText('Server connection failed'),
    ).not.toBeInTheDocument();
  });
});

describe('ContactFormContainer - 提交状态计算', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show submitting status when isPending is true', () => {
    mockUseActionState.mockReturnValue([
      null,
      vi.fn(),
      true, // isPending
    ]);

    render(<ContactFormContainer />);

    // Should show submitting message
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('should show idle status when no state changes', () => {
    mockUseActionState.mockReturnValue([null, vi.fn(), false]);

    render(<ContactFormContainer />);

    // Should not show any status message
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
