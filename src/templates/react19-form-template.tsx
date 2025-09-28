'use client';

/**
 * React 19表单组件模板
 * 基于contact-form-container.tsx的成功实践，提供可重用的表单架构模式
 *
 * @version 1.0.0
 * @author React 19架构升级项目
 * @description 标准化的React 19表单组件模板，包含useActionState、useOptimistic、错误处理等最佳实践
 */
import { useActionState, useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/server-action-utils';
import { type FormSubmissionStatus } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 表单状态类型定义
 */
export interface FormState {
  status: FormSubmissionStatus;
  message: string;
  errors?: Record<string, string[]> | undefined;
}

/**
 * 表单字段配置类型
 */
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

/**
 * 表单模板属性
 */
export interface React19FormTemplateProps {
  /** 表单字段配置 */
  fields: FormField[];
  /** Server Action函数 */
  action: (
    prevState: FormState | null,
    formData: FormData,
  ) => Promise<ServerActionResult>;
  /** 表单标题 */
  title: string;
  /** 提交按钮文本 */
  submitText?: string;
  /** 是否启用乐观更新 */
  enableOptimistic?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 成功回调 */
  onSuccess?: (result: ServerActionResult) => void;
  /** 错误回调 */
  onError?: (error: string) => void;
}

/**
 * 状态消息组件
 */
interface StatusMessageProps {
  status: FormSubmissionStatus;
  message?: string;
  t: (key: string) => string;
}

function StatusMessage({ status, message, t }: StatusMessageProps) {
  if (status === 'idle') return null;

  const statusConfig: Record<
    FormSubmissionStatus,
    { className: string; defaultMessage: string } | undefined
  > = {
    success: {
      className:
        'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      defaultMessage: t('form.success'),
    },
    error: {
      className:
        'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      defaultMessage: t('form.error'),
    },
    submitting: {
      className:
        'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      defaultMessage: t('form.submitting'),
    },
    idle: undefined,
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <div className={`rounded-md border p-4 ${config.className}`}>
      <p className='text-sm font-medium'>{message || config.defaultMessage}</p>
    </div>
  );
}

/**
 * 表单字段渲染组件
 */
interface FormFieldRendererProps {
  field: FormField;
  errors?: string[] | undefined;
  t: (key: string) => string;
}

function FormFieldRenderer({ field, errors, t }: FormFieldRendererProps) {
  const hasError = errors && errors.length > 0;
  const fieldId = `field-${field.name}`;

  return (
    <div className='space-y-2'>
      <Label
        htmlFor={fieldId}
        className={hasError ? 'text-red-600 dark:text-red-400' : ''}
      >
        {field.label}
        {field.required && <span className='ml-1 text-red-500'>*</span>}
      </Label>

      {field.type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          className={`min-h-[100px] w-full rounded-md border px-3 py-2 text-sm ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-input focus:border-primary focus:ring-primary'
          }`}
        />
      ) : field.type === 'select' ? (
        <select
          id={fieldId}
          name={field.name}
          required={field.required}
          className={`w-full rounded-md border px-3 py-2 text-sm ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-input focus:border-primary focus:ring-primary'
          }`}
        >
          <option value=''>{t('form.selectOption')}</option>
          {field.options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={fieldId}
          name={field.name}
          type={field.type}
          placeholder={field.placeholder}
          required={field.required}
          className={
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : ''
          }
        />
      )}

      {hasError && (
        <div className='text-sm text-red-600 dark:text-red-400'>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 提交按钮组件（使用useFormStatus）
 */
function SubmitButton({
  text,
  isPending,
  t,
}: {
  text: string | undefined;
  isPending: boolean;
  t: (key: string) => string;
}) {
  return (
    <Button
      type='submit'
      disabled={isPending}
      className='w-full'
    >
      {isPending ? t('form.submitting') : text || t('form.submit')}
    </Button>
  );
}

/**
 * React 19表单模板主组件
 */
export function React19FormTemplate({
  fields,
  action,
  title,
  submitText,
  enableOptimistic = false,
  className = '',
  onSuccess,
  onError,
}: React19FormTemplateProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  // useActionState Hook - React 19表单状态管理
  const [state, formAction, isActionPending] = useActionState(
    async (
      prevState: FormState | null,
      formData: FormData,
    ): Promise<FormState> => {
      try {
        const result = await action(prevState, formData);

        if (result.success) {
          onSuccess?.(result);
          return {
            status: 'success' as FormSubmissionStatus,
            message: 'Success',
          };
        }

        onError?.(result.error || 'Unknown error');
        return {
          status: 'error' as FormSubmissionStatus,
          message: result.error || 'Unknown error',
          errors: result.error ? { general: [result.error] } : undefined,
        };
      } catch (error) {
        logger.error('Form submission error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        onError?.(errorMessage);
        return {
          status: 'error' as FormSubmissionStatus,
          message: errorMessage,
        };
      }
    },
    null,
  );

  // useOptimistic Hook - 乐观更新（可选）
  const [optimisticState, setOptimisticState] = useOptimistic(
    state,
    (currentState, optimisticValue: FormState) => optimisticValue,
  );

  const handleSubmit = (formData: FormData) => {
    if (enableOptimistic) {
      // 乐观更新：立即显示提交状态
      setOptimisticState({
        status: 'submitting',
        message: t('form.submitting'),
      });
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  const currentState = enableOptimistic ? optimisticState : state;
  const pending = isPending || isActionPending;

  return (
    <Card className={`p-6 ${className}`}>
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            {title}
          </h2>
        </div>

        {currentState && (
          <StatusMessage
            status={currentState.status}
            message={currentState.message}
            t={t}
          />
        )}

        <form
          action={handleSubmit}
          className='space-y-4'
        >
          {fields.map((field) => (
            <FormFieldRenderer
              key={field.name}
              field={field}
              errors={currentState?.errors?.[field.name]}
              t={t}
            />
          ))}

          <SubmitButton
            text={submitText}
            isPending={pending}
            t={t}
          />
        </form>
      </div>
    </Card>
  );
}

/**
 * 表单模板使用示例
 */
export const FORM_TEMPLATE_EXAMPLE = {
  fields: [
    {
      name: 'name',
      type: 'text' as const,
      label: 'Name',
      required: true,
      placeholder: 'Enter your name',
    },
    {
      name: 'email',
      type: 'email' as const,
      label: 'Email',
      required: true,
      placeholder: 'Enter your email',
    },
    {
      name: 'message',
      type: 'textarea' as const,
      label: 'Message',
      required: true,
      placeholder: 'Enter your message',
    },
  ],
};
