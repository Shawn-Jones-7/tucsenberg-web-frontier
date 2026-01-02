'use client';

import {
  memo,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/server-action-utils';
import { appendAttributionToFormData, storeAttributionData } from '@/lib/utm';
import { type FormSubmissionStatus } from '@/lib/validations';
import { LazyTurnstile } from '@/components/forms/lazy-turnstile';
import { useOptimisticFormState } from '@/components/forms/use-optimistic-form-state';
import { useRateLimit } from '@/components/forms/use-rate-limit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactFormAction, type ContactFormResult } from '@/app/actions';
import {
  buildFormFieldsFromConfig,
  CONTACT_FORM_CONFIG,
  type ContactFormFieldDescriptor,
} from '@/config/contact-form-config';

/**
 * 获取状态消息配置
 */
function getStatusConfig(
  status: FormSubmissionStatus,
  t: (key: string) => string,
  optimisticMessage?: string,
): { className: string; message: string } | undefined {
  // 使用 switch 代替对象索引访问，避免 security/detect-object-injection
  switch (status) {
    case 'success':
      return {
        className: 'bg-green-50 border-green-200 text-green-800',
        message: t('submitSuccess'),
      };
    case 'error':
      return {
        className: 'bg-red-50 border-red-200 text-red-800',
        message: t('submitError'),
      };
    case 'submitting':
      return {
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        message: optimisticMessage || t('submitting'),
      };
    case 'idle':
    default:
      return undefined;
  }
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

    const config = getStatusConfig(status, t, optimisticMessage);
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

/**
 * 计算提交状态的输入参数
 */
interface SubmitStatusInput {
  optimisticStatus: FormSubmissionStatus;
  isPending: boolean;
  stateSuccess: boolean | undefined;
  stateError: string | undefined;
}

/**
 * 计算提交状态，优先使用乐观更新状态
 */
function computeSubmitStatus(input: SubmitStatusInput): FormSubmissionStatus {
  if (input.optimisticStatus !== 'idle') return input.optimisticStatus;
  if (input.isPending) return 'submitting';
  if (input.stateSuccess) return 'success';
  if (input.stateError) return 'error';
  return 'idle';
}

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
  const lastRecordedSuccessRef = useRef(false);
  const [isPendingTransition, startTransition] = useTransition();

  // 使用提取的 hooks
  const { isRateLimited, recordSubmission, setLastSubmissionTime } =
    useRateLimit();
  const { optimisticState, setOptimisticState, optimisticMessage } =
    useOptimisticFormState();

  // Capture UTM parameters on mount (first-touch attribution)
  useEffect(() => {
    storeAttributionData();
  }, []);

  // 从Server Action状态中提取提交状态
  const submitStatus = computeSubmitStatus({
    optimisticStatus: optimisticState.status,
    isPending,
    stateSuccess: state?.success,
    stateError: state?.error,
  });

  // 成功提交后记录时间
  useEffect(() => {
    if (state?.success && !lastRecordedSuccessRef.current) {
      queueMicrotask(() => {
        setLastSubmissionTime(new Date());
      });
    }
    lastRecordedSuccessRef.current = Boolean(state?.success);
  }, [state?.success, setLastSubmissionTime]);

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

    // Append marketing attribution data
    appendAttributionToFormData(formData);

    // 记录提交时间
    recordSubmission();

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
    optimisticMessage,
  };
}

/**
 * 错误信息显示组件
 */
function ErrorDisplay({
  state,
  translate,
}: {
  state: ServerActionResult<ContactFormResult> | null;
  translate: (key: string) => string;
}) {
  if (!state?.error) return null;

  const translatedDetails = state.details?.map((detail) =>
    detail.startsWith('errors.') ? translate(detail) : detail,
  );
  const uniqueDetails = translatedDetails
    ? Array.from(new Set(translatedDetails))
    : undefined;
  const isValidationError = state.error === 'Validation failed';
  const shouldShowRawMessage = state.error && !isValidationError;

  return (
    <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800'>
      <p className='font-medium'>{translate('error')}</p>
      {shouldShowRawMessage && <p className='text-sm'>{state.error}</p>}
      {uniqueDetails && uniqueDetails.length > 0 && (
        <ul className='mt-2 list-inside list-disc text-sm'>
          {uniqueDetails.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FormFieldsProps {
  t: (key: string) => string;
  isPending: boolean;
}

/**
 * 表单字段组件 - 组合所有字段，使用memo优化性能
 */
const FormFields = memo(({ t, isPending }: FormFieldsProps) => {
  const configuredFields = buildFormFieldsFromConfig(CONTACT_FORM_CONFIG);
  const textInputs = configuredFields.filter(
    (field) =>
      !field.isCheckbox && field.type !== 'textarea' && !field.isHoneypot,
  );
  const textareas = configuredFields.filter(
    (field) => field.type === 'textarea',
  );
  const checkboxFields = configuredFields.filter((field) => field.isCheckbox);
  const honeypotField = configuredFields.find((field) => field.isHoneypot);

  const renderLabelClass = (field: ContactFormFieldDescriptor) =>
    [
      'text-sm',
      field.required
        ? "after:ml-0.5 after:text-red-500 after:content-['*']"
        : '',
    ]
      .filter(Boolean)
      .join(' ');

  const renderPlaceholder = (field: ContactFormFieldDescriptor) =>
    field.placeholderKey ? t(field.placeholderKey) : undefined;

  return (
    <>
      {textInputs.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {textInputs.map((field) => (
            <div
              key={field.key}
              className='space-y-2'
            >
              <Label
                htmlFor={field.key}
                className={renderLabelClass(field)}
              >
                {t(field.labelKey)}
              </Label>
              <Input
                id={field.key}
                name={field.key}
                type={field.type}
                placeholder={renderPlaceholder(field)}
                disabled={isPending}
                required={field.required}
                aria-describedby={`${field.key}-error`}
              />
            </div>
          ))}
        </div>
      )}

      {textareas.map((field) => (
        <div
          key={field.key}
          className='space-y-2'
        >
          <Label
            htmlFor={field.key}
            className={renderLabelClass(field)}
          >
            {t(field.labelKey)}
          </Label>
          <Textarea
            id={field.key}
            name={field.key}
            placeholder={renderPlaceholder(field)}
            disabled={isPending}
            required={field.required}
            rows={4}
            aria-describedby={`${field.key}-error`}
          />
        </div>
      ))}

      {checkboxFields.length > 0 && (
        <div className='space-y-4'>
          {checkboxFields.map((field) => (
            <div
              key={field.key}
              className='space-y-2'
            >
              <div className='flex items-center space-x-2'>
                <input
                  id={field.key}
                  name={field.key}
                  type='checkbox'
                  disabled={isPending}
                  required={field.required}
                  className='h-4 w-4 rounded border border-input'
                  aria-describedby={`${field.key}-error`}
                />
                <Label
                  htmlFor={field.key}
                  className={renderLabelClass(field)}
                >
                  {t(field.labelKey)}
                </Label>
              </div>
            </div>
          ))}
        </div>
      )}

      {honeypotField && (
        <input
          id={honeypotField.key}
          name={honeypotField.key}
          type='text'
          autoComplete='off'
          tabIndex={-1}
          aria-hidden='true'
          className='sr-only'
        />
      )}
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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (process.env.NODE_ENV === 'test') {
      e.preventDefault();
    }
  };
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
        onSubmit={handleSubmit}
        className='space-y-6 p-6'
      >
        <StatusMessage
          status={submitStatus}
          t={t}
          optimisticMessage={optimisticMessage}
        />

        <ErrorDisplay
          state={state}
          translate={t}
        />

        <FormFields
          t={t}
          isPending={isPending}
        />

        {/* Turnstile CAPTCHA - 延迟/按需加载，降低首屏阻塞 */}
        <LazyTurnstile
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken('')}
          onExpire={() => setTurnstileToken('')}
          onLoad={() => setTurnstileToken('')}
        />

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
