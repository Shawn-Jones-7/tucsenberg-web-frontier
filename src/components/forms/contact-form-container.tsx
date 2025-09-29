'use client';

import {
  memo,
  useActionState,
  useOptimistic,
  useState,
  useTransition,
} from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/server-action-utils';
import { type FormSubmissionStatus } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { contactFormAction, type ContactFormResult } from '@/app/actions';
import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE } from '@/constants';

/**
 * 乐观更新状态类型
 */
interface OptimisticFormState {
  status: FormSubmissionStatus;
  message?: string;
  timestamp?: number;
}

/**
 * Status message component with optimistic updates
 */
interface StatusMessageProps {
  status: FormSubmissionStatus;
  t: (_key: string) => string;
  optimisticMessage?: string | undefined;
}

const StatusMessage = memo(
  ({ status, t, optimisticMessage }: StatusMessageProps) => {
    if (status === 'idle') return null;

    const statusConfig: Record<
      FormSubmissionStatus,
      { className: string; message: string } | undefined
    > = {
      success: {
        className: 'bg-green-50 border-green-200 text-green-800',
        message: t('submitSuccess'),
      },
      error: {
        className: 'bg-red-50 border-red-200 text-red-800',
        message: t('submitError'),
      },
      submitting: {
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        message: optimisticMessage || t('submitting'),
      },
      idle: undefined,
    };

    // Use Object.prototype.hasOwnProperty to safely access object properties
    const config = Object.prototype.hasOwnProperty.call(statusConfig, status)
      ? statusConfig[status as keyof typeof statusConfig]
      : undefined;
    if (!config) return null;

    return (
      <div
        className={`rounded-md border p-4 ${config.className}`}
        role='alert'
      >
        {config.message}
      </div>
    );
  },
);

StatusMessage.displayName = 'StatusMessage';

// 移除未使用的handleFormSubmission函数和SubmitDeps接口，现在使用React 19 Server Actions

/**
 * 自定义Hook：管理联系表单状态和逻辑（React 19 useActionState + useOptimistic版本）
 */
function useContactForm() {
  // React 19 useActionState Hook替代手动状态管理
  const [state, formAction, isPending] = useActionState(
    contactFormAction,
    null,
  );
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<Date | null>(
    null,
  );
  const [isPendingTransition, startTransition] = useTransition();

  // React 19原生useOptimistic Hook - 乐观更新状态管理
  const [optimisticState, setOptimisticState] = useOptimistic(
    { status: 'idle' as FormSubmissionStatus, message: '', timestamp: 0 },
    (
      currentState: OptimisticFormState,
      optimisticValue: OptimisticFormState,
    ) => ({
      ...currentState,
      ...optimisticValue,
      timestamp: Date.now(),
    }),
  );

  // 从Server Action状态中提取提交状态，优先使用乐观更新状态
  const submitStatus: FormSubmissionStatus =
    optimisticState.status !== 'idle'
      ? optimisticState.status
      : isPending
        ? 'submitting'
        : state?.success
          ? 'success'
          : state?.error
            ? 'error'
            : 'idle';

  // Rate limiting check (5 minutes = 300000ms)
  const RATE_LIMIT_MINUTES = COUNT_FIVE;
  const SECONDS_PER_MINUTE = 60;
  const MS_PER_SECOND = ANIMATION_DURATION_VERY_SLOW;
  const RATE_LIMIT_WINDOW =
    RATE_LIMIT_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  const isRateLimited =
    lastSubmissionTime &&
    Date.now() - lastSubmissionTime.getTime() < RATE_LIMIT_WINDOW;

  // 创建增强的formAction，使用React 19原生乐观更新
  const enhancedFormAction = (formData: FormData) => {
    if (!turnstileToken) {
      logger.warn('Form submission attempted without Turnstile token');
      return;
    }

    // 使用React 19原生useOptimistic进行乐观更新
    setOptimisticState({
      status: 'submitting',
      message: 'Submitting your message...',
      timestamp: Date.now(),
    });

    // 添加Turnstile token和提交时间戳到FormData
    formData.append('turnstileToken', turnstileToken);
    formData.append('submittedAt', new Date().toISOString());

    // 更新最后提交时间
    setLastSubmissionTime(new Date());

    // 使用useTransition的startTransition包装Server Action调用
    startTransition(() => {
      formAction(formData);
    });
  };

  return {
    state,
    formAction: enhancedFormAction,
    isPending: isPending || isPendingTransition,
    submitStatus,
    turnstileToken,
    setTurnstileToken,
    isRateLimited,
    optimisticState,
    optimisticMessage: optimisticState.message,
  };
}

/**
 * 错误信息显示组件
 */
function ErrorDisplay({
  state,
}: {
  state: ServerActionResult<ContactFormResult> | null;
}) {
  if (!state?.error) return null;

  return (
    <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800'>
      <p className='font-medium'>Error</p>
      <p className='text-sm'>{state.error}</p>
      {state.details && (
        <ul className='mt-2 list-inside list-disc text-sm'>
          {state.details.map((detail: string, index: number) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * 通用表单字段类型
 */
interface FieldProps {
  t: (key: string) => string;
  isPending: boolean;
}

/**
 * 姓名字段组件 - 使用memo优化性能
 */
const NameFields = memo(({ t, isPending }: FieldProps) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='space-y-2'>
        <label
          htmlFor='firstName'
          className="after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('firstName')}
        </label>
        <input
          id='firstName'
          name='firstName'
          type='text'
          placeholder={t('firstNamePlaceholder')}
          disabled={isPending}
          required
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
      <div className='space-y-2'>
        <label
          htmlFor='lastName'
          className="after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('lastName')}
        </label>
        <input
          id='lastName'
          name='lastName'
          type='text'
          placeholder={t('lastNamePlaceholder')}
          disabled={isPending}
          required
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    </div>
  );
});

NameFields.displayName = 'NameFields';

/**
 * 联系信息字段组件 - 使用memo优化性能
 */
const ContactFields = memo(({ t, isPending }: FieldProps) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='space-y-2'>
        <label
          htmlFor='email'
          className="after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('email')}
        </label>
        <input
          id='email'
          name='email'
          type='email'
          placeholder={t('emailPlaceholder')}
          disabled={isPending}
          required
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
      <div className='space-y-2'>
        <label htmlFor='company'>{t('company')}</label>
        <input
          id='company'
          name='company'
          type='text'
          placeholder={t('companyPlaceholder')}
          disabled={isPending}
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    </div>
  );
});

ContactFields.displayName = 'ContactFields';

/**
 * 附加信息字段组件 - 使用memo优化性能
 */
const AdditionalFields = memo(({ t, isPending }: FieldProps) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='space-y-2'>
        <label htmlFor='phone'>{t('phone')}</label>
        <input
          id='phone'
          name='phone'
          type='tel'
          placeholder={t('phonePlaceholder')}
          disabled={isPending}
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
      <div className='space-y-2'>
        <label htmlFor='subject'>{t('subject')}</label>
        <input
          id='subject'
          name='subject'
          type='text'
          placeholder={t('subjectPlaceholder')}
          disabled={isPending}
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    </div>
  );
});

AdditionalFields.displayName = 'AdditionalFields';

/**
 * 消息字段组件 - 使用memo优化性能
 */
const MessageField = memo(({ t, isPending }: FieldProps) => {
  return (
    <div className='space-y-2'>
      <label
        htmlFor='message'
        className="after:ml-0.5 after:text-red-500 after:content-['*']"
      >
        {t('message')}
      </label>
      <textarea
        id='message'
        name='message'
        placeholder={t('messagePlaceholder')}
        disabled={isPending}
        required
        rows={4}
        className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
      />
    </div>
  );
});

MessageField.displayName = 'MessageField';

/**
 * 复选框字段组件 - 使用memo优化性能
 */
const CheckboxFields = memo(({ t, isPending }: FieldProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <input
          id='acceptPrivacy'
          name='acceptPrivacy'
          type='checkbox'
          disabled={isPending}
          required
          className='border-input h-4 w-4 rounded border'
        />
        <label
          htmlFor='acceptPrivacy'
          className="text-sm after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('acceptPrivacy')}
        </label>
      </div>
      <div className='flex items-center space-x-2'>
        <input
          id='marketingConsent'
          name='marketingConsent'
          type='checkbox'
          disabled={isPending}
          className='border-input h-4 w-4 rounded border'
        />
        <label
          htmlFor='marketingConsent'
          className='text-sm'
        >
          {t('marketingConsent')}
        </label>
      </div>
    </div>
  );
});

CheckboxFields.displayName = 'CheckboxFields';

/**
 * 表单字段组件 - 组合所有字段，使用memo优化性能
 */
const FormFields = memo(({ t, isPending }: FieldProps) => {
  return (
    <>
      <NameFields
        t={t}
        isPending={isPending}
      />
      <ContactFields
        t={t}
        isPending={isPending}
      />
      <AdditionalFields
        t={t}
        isPending={isPending}
      />
      <MessageField
        t={t}
        isPending={isPending}
      />
      <CheckboxFields
        t={t}
        isPending={isPending}
      />
    </>
  );
});

FormFields.displayName = 'FormFields';

interface SubmitButtonProps {
  disabled: boolean;
  idleLabel: string;
  pendingLabel: string;
}

function SubmitButton({
  disabled,
  idleLabel,
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <Button
      type='submit'
      className='w-full'
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

/**
 * Main contact form container component
 */
export function ContactFormContainer() {
  const t = useTranslations('contact.form');
  const {
    state,
    formAction,
    isPending,
    submitStatus,
    turnstileToken,
    setTurnstileToken,
    isRateLimited,
    optimisticMessage,
  } = useContactForm();

  const submitDisabledReason = Boolean(
    isPending || !turnstileToken || isRateLimited,
  );

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <form
        action={formAction}
        className='space-y-6 p-6'
      >
        <StatusMessage
          status={submitStatus}
          t={t}
          optimisticMessage={optimisticMessage}
        />

        <ErrorDisplay state={state} />

        <FormFields
          t={t}
          isPending={isPending}
        />

        {/* Turnstile CAPTCHA */}
        <div className='space-y-2'>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onSuccess={setTurnstileToken}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
            options={{
              theme: 'auto',
              size: 'normal',
            }}
          />
        </div>

        {/* Submit button */}
        <SubmitButton
          disabled={submitDisabledReason}
          idleLabel={t('submit')}
          pendingLabel={t('submitting')}
        />

        {isRateLimited && (
          <p className='text-center text-sm text-amber-600'>
            {t('rateLimitMessage')}
          </p>
        )}
      </form>
    </Card>
  );
}
