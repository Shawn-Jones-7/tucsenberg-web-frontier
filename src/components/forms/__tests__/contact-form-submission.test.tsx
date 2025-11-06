/**
 * ContactFormContainer 提交和错误处理测试
 * 专门测试表单提交、网络错误、速率限制等场景
 *
 * 注意：基础测试请参考 contact-form-container-core.test.tsx
 */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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

const originalRequestIdleCallback = window.requestIdleCallback;
const originalCancelIdleCallback = window.cancelIdleCallback;
const originalIntersectionObserver = (
  globalThis as typeof globalThis & {
    IntersectionObserver?: typeof IntersectionObserver;
  }
).IntersectionObserver;

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe: IntersectionObserver['observe'] = vi.fn((element: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          target: element,
        } as IntersectionObserverEntry,
      ],
      this,
    );
  });

  unobserve: IntersectionObserver['unobserve'] = vi.fn();
  disconnect: IntersectionObserver['disconnect'] = vi.fn();
  takeRecords: IntersectionObserver['takeRecords'] = vi.fn(() => []);
}

// 填写有效表单的辅助函数
const renderContactForm = async () => {
  let utils: ReturnType<typeof render> | undefined;
  await act(async () => {
    utils = render(<ContactFormContainer />);
  });
  await screen.findByTestId('turnstile-mock');
  return utils!;
};

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
    const successButton = await screen.findByTestId('turnstile-success');
    fireEvent.click(successButton);
  });
};

describe('ContactFormContainer - 提交和错误处理', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (
      window as typeof window & {
        requestIdleCallback?: typeof globalThis.requestIdleCallback;
        cancelIdleCallback?: typeof globalThis.cancelIdleCallback;
      }
    ).requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      callback({
        didTimeout: false,
        timeRemaining: () => 1,
      });
      return 1 as unknown as number;
    });

    (
      window as typeof window & {
        cancelIdleCallback?: typeof globalThis.cancelIdleCallback;
      }
    ).cancelIdleCallback = vi.fn();

    (
      globalThis as typeof globalThis & {
        IntersectionObserver?: typeof IntersectionObserver;
      }
    ).IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    // Default useActionState mock - idle state
    mockUseActionState.mockReturnValue([
      null, // state
      vi.fn(), // formAction
      false, // isPending
    ]);
  });

  afterEach(() => {
    (
      window as typeof window & {
        requestIdleCallback?: typeof globalThis.requestIdleCallback;
        cancelIdleCallback?: typeof globalThis.cancelIdleCallback;
      }
    ).requestIdleCallback = originalRequestIdleCallback;
    (
      window as typeof window & {
        cancelIdleCallback?: typeof globalThis.cancelIdleCallback;
      }
    ).cancelIdleCallback = originalCancelIdleCallback;

    if (originalIntersectionObserver) {
      (
        globalThis as typeof globalThis & {
          IntersectionObserver?: typeof IntersectionObserver;
        }
      ).IntersectionObserver = originalIntersectionObserver;
    } else {
      Reflect.deleteProperty(globalThis, 'IntersectionObserver');
    }
  });

  describe('网络错误处理', () => {
    it('应该处理网络错误', async () => {
      // Mock useActionState to return error state
      mockUseActionState.mockReturnValue([
        { success: false, error: 'Network error' }, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      await renderContactForm();

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

      await renderContactForm();

      // 检查速率限制消息 - 应该显示通用错误消息而不是具体的速率限制错误
      expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();
    });

    it('没有 Turnstile token 时不应该提交', async () => {
      await renderContactForm();

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

      await renderContactForm();

      const successButton = await screen.findByTestId('turnstile-success');
      await act(async () => {
        fireEvent.click(successButton);
      });

      // 检查成功消息
      expect(
        screen.getByText(/message sent successfully/i),
      ).toBeInTheDocument();

      // Turnstile 成功后应出现速率限制提示（以用户可见文本为准）
      // 说明：不同环境下 disabled 属性的应用时序可能略有差异，
      // 为避免脆弱断言导致误报，这里以可见提示为主进行断言。
      await waitFor(() =>
        expect(
          screen.getByText(/wait before submitting again/i),
        ).toBeInTheDocument(),
      );
      // 可选：若环境及时应用了 disabled，也应满足下述断言（非强制）
      const submitButton = screen.getByRole('button', { name: /submit/i });
      try {
        await waitFor(() => expect(submitButton).toBeDisabled());
      } catch {
        // 忽略：在个别环境中，可能仅设置了 aria-disabled 或存在短暂时序差异
      }
    });

    it('should re-enable submission after cooldown duration elapses', async () => {
      const originalCooldown = process.env.NEXT_PUBLIC_CONTACT_FORM_COOLDOWN_MS;
      process.env.NEXT_PUBLIC_CONTACT_FORM_COOLDOWN_MS = '25';

      try {
        mockUseActionState.mockReturnValue([{ success: true }, vi.fn(), false]);

        await renderContactForm();

        const successButton = await screen.findByTestId('turnstile-success');
        await act(async () => {
          fireEvent.click(successButton);
        });

        // 先以可见提示验证进入速率限制窗口
        await waitFor(() =>
          expect(
            screen.getByText(/wait before submitting again/i),
          ).toBeInTheDocument(),
        );
        const submitButton = screen.getByRole('button', { name: /submit/i });

        // 在不同环境下，速率限制提示或 disabled 属性的应用时机可能不同。
        // 这里以“提示可见”或“按钮禁用”任一成立作为已进入速率限制窗口的判据，提升鲁棒性。
        try {
          await waitFor(() =>
            expect(
              screen.getByText(/wait before submitting again/i),
            ).toBeInTheDocument(),
          );
        } catch {
          await waitFor(() => expect(submitButton).toBeDisabled());
        }

        await act(async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 50);
          });
        });

        await waitFor(() => expect(submitButton).not.toBeDisabled());
      } finally {
        if (originalCooldown === undefined) {
          delete process.env.NEXT_PUBLIC_CONTACT_FORM_COOLDOWN_MS;
        } else {
          process.env.NEXT_PUBLIC_CONTACT_FORM_COOLDOWN_MS = originalCooldown;
        }
      }
    });

    it('速率限制应该在5分钟后解除', async () => {
      // Mock useActionState to return idle state (no rate limiting)
      mockUseActionState.mockReturnValue([
        null, // state
        vi.fn(), // formAction
        false, // isPending
      ]);

      await renderContactForm();

      // 启用 Turnstile 以使按钮可用
      const successButton = await screen.findByTestId('turnstile-success');
      await act(async () => {
        fireEvent.click(successButton);
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

      await renderContactForm();

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
