'use server';

/**
 * Server Actions 统一入口文件
 * 提供基础的 Server Actions 架构模式，包含错误处理、类型安全和日志记录机制
 *
 * @description React 19 Server Actions 基础设施
 * @version 1.0.0
 */
import * as Sentry from '@sentry/nextjs';
import type { ZodIssue } from 'zod';
import { logger } from '@/lib/logger';
import {
  createErrorResultWithLogging,
  createSuccessResultWithLogging,
  getFormDataBoolean,
  getFormDataString,
  withErrorHandling,
  type ServerAction,
} from '@/lib/server-action-utils';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';
import { verifyTurnstile } from '@/app/api/contact/contact-api-utils';
import { processFormSubmission } from '@/app/api/contact/contact-api-validation';

/**
 * 联系表单提交结果类型
 */
export interface ContactFormResult {
  /** 邮件是否发送成功 */
  emailSent: boolean;
  /** 记录是否创建成功 */
  recordCreated: boolean;
  /** 邮件消息ID */
  emailMessageId?: string | null;
  /** Airtable记录ID */
  airtableRecordId?: string | null;
}

/**
 * 扩展的联系表单数据类型，包含Turnstile token
 */
export interface ContactFormWithToken extends ContactFormData {
  /** Turnstile验证token */
  turnstileToken: string;
  /** 提交时间戳 */
  submittedAt: string;
}

const FIELD_ERROR_KEY_PREFIX = new Map<string, string>([
  ['firstName', 'errors.firstName'],
  ['lastName', 'errors.lastName'],
  ['email', 'errors.email'],
  ['company', 'errors.company'],
  ['message', 'errors.message'],
  ['phone', 'errors.phone'],
  ['subject', 'errors.subject'],
  ['acceptPrivacy', 'errors.acceptPrivacy'],
  ['website', 'errors.website'],
]);

const FALLBACK_ERROR_KEY = 'errors.generic';

function getBaseErrorKey(issue: ZodIssue): string {
  const [rawField] = issue.path;
  if (typeof rawField !== 'string') {
    return FALLBACK_ERROR_KEY;
  }

  return FIELD_ERROR_KEY_PREFIX.get(rawField) ?? FALLBACK_ERROR_KEY;
}

function isRequiredMinimum(issue: ZodIssue): boolean {
  return (
    'minimum' in issue &&
    typeof issue.minimum === 'number' &&
    issue.minimum <= 1
  );
}

function handleCustomIssue(baseKey: string): string {
  if (baseKey === 'errors.acceptPrivacy') {
    return `${baseKey}.required`;
  }
  if (baseKey === 'errors.subject') {
    return `${baseKey}.length`;
  }
  if (baseKey === 'errors.phone') {
    return `${baseKey}.invalid`;
  }
  return `${baseKey}.invalid`;
}

function mapIssueToErrorKey(issue: ZodIssue): string {
  const baseKey = getBaseErrorKey(issue);
  const message = issue.message?.toLowerCase?.() ?? '';

  if (message.includes('required')) {
    return `${baseKey}.required`;
  }

  switch (issue.code) {
    case 'too_small':
      return isRequiredMinimum(issue)
        ? `${baseKey}.required`
        : `${baseKey}.tooShort`;
    case 'too_big':
      return baseKey === 'errors.website'
        ? `${baseKey}.shouldBeEmpty`
        : `${baseKey}.tooLong`;
    case 'custom':
      return handleCustomIssue(baseKey);
    case 'invalid_type':
      return `${baseKey}.invalid`;
    default:
      return baseKey === FALLBACK_ERROR_KEY
        ? FALLBACK_ERROR_KEY
        : `${baseKey}.invalid`;
  }
}

/**
 * 验证联系表单数据（包含Turnstile验证）
 */
async function validateContactFormData(data: ContactFormWithToken) {
  // 首先验证基础表单数据
  const baseValidation = contactFormSchema.safeParse(data);
  if (!baseValidation.success) {
    const errorMessages = baseValidation.error.issues.map(mapIssueToErrorKey);

    return {
      success: false,
      error: 'Validation failed',
      details: errorMessages,
      data: null,
    };
  }

  // 验证提交时间（防止重放攻击）
  const submittedAt = new Date(data.submittedAt);
  const now = new Date();
  const timeDiff = now.getTime() - submittedAt.getTime();
  const maxAge = 10 * 60 * 1000; // 10分钟

  if (timeDiff > maxAge || timeDiff < 0) {
    return {
      success: false,
      error: 'Form submission expired or invalid',
      details: ['Please refresh the page and try again'],
      data: null,
    };
  }

  // 验证Turnstile token
  const turnstileValid = await verifyTurnstile(
    data.turnstileToken,
    'server-action',
  );
  if (!turnstileValid) {
    return {
      success: false,
      error: 'Security verification failed',
      details: ['Please complete the security check'],
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    details: null,
    data: baseValidation.data,
  };
}

/**
 * 处理联系表单提交
 */
async function processContactFormSubmission(
  formData: ContactFormWithToken,
): Promise<ContactFormResult> {
  // 调用现有的表单处理逻辑
  const result = await processFormSubmission(formData);

  return {
    emailSent: result.emailSent,
    recordCreated: result.recordCreated,
    emailMessageId: result.emailMessageId || null,
    airtableRecordId: result.airtableRecordId || null,
  };
}

/**
 * 联系表单 Server Action
 * 处理联系表单提交，集成Zod验证、Turnstile验证和现有的业务逻辑
 *
 * @example
 * ```typescript
 * // 在组件中使用
 * const [state, formAction, isPending] = useActionState(contactFormAction, null);
 *
 * return (
 *   <form action={formAction}>
 *     <input name="firstName" required />
 *     <input name="lastName" required />
 *     <input name="email" type="email" required />
 *     <button disabled={isPending} type="submit">
 *       {isPending ? 'Submitting...' : 'Submit'}
 *     </button>
 *   </form>
 * );
 * ```
 */
export const contactFormAction: ServerAction<FormData, ContactFormResult> =
  withErrorHandling(async (_previousState, formData) => {
    const startTime = performance.now();

    try {
      // 提取表单数据
      const contactData: ContactFormWithToken = {
        firstName: getFormDataString(formData, 'firstName'),
        lastName: getFormDataString(formData, 'lastName'),
        email: getFormDataString(formData, 'email'),
        company: getFormDataString(formData, 'company'),
        phone: getFormDataString(formData, 'phone'),
        subject: getFormDataString(formData, 'subject'),
        message: getFormDataString(formData, 'message'),
        acceptPrivacy: getFormDataBoolean(formData, 'acceptPrivacy'),
        marketingConsent: getFormDataBoolean(formData, 'marketingConsent'),
        turnstileToken: getFormDataString(formData, 'turnstileToken'),
        submittedAt:
          getFormDataString(formData, 'submittedAt') ||
          new Date().toISOString(),
      };

      // 验证必需的Turnstile token
      if (!contactData.turnstileToken) {
        return createErrorResultWithLogging(
          'Security verification required',
          undefined,
          logger,
        );
      }

      // 使用现有的验证逻辑
      const validation = await validateContactFormData(contactData);
      if (!validation.success || !validation.data) {
        return createErrorResultWithLogging(
          validation.error || 'Validation failed',
          validation.details || undefined,
          logger,
        );
      }

      // 处理表单提交
      const submissionResult = await processContactFormSubmission(contactData);

      // 记录成功提交
      const processingTime = performance.now() - startTime;
      logger.info('Contact form submitted via Server Action', {
        email: validation.data.email,
        company: validation.data.company,
        processingTime,
        emailSent: submissionResult.emailSent,
        recordCreated: submissionResult.recordCreated,
        emailMessageId: submissionResult.emailMessageId,
        airtableRecordId: submissionResult.airtableRecordId,
      });

      return createSuccessResultWithLogging(
        submissionResult,
        'Thank you for your message. We will get back to you soon.',
        logger,
      );
    } catch (error) {
      const processingTime = performance.now() - startTime;
      Sentry.captureException(error);
      logger.error('Contact form Server Action failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime,
      });

      return createErrorResultWithLogging(
        'An unexpected error occurred. Please try again later.',
        undefined,
        logger,
      );
    }
  });
