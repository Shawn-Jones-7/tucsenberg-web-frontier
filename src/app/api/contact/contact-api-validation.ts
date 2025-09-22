/**
 * 联系表单API验证和数据处理
 * Contact form API validation and data processing
 */

import { z } from 'zod';
import { airtableService } from '@/lib/airtable';
import { logger } from '@/lib/logger';
import { resendService } from '@/lib/resend';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';
import { verifyTurnstile } from '@/app/api/contact/contact-api-utils';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_TEN,
  ONE,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';

/**
 * 扩展的联系表单模式，包含Turnstile token
 * Extended contact form schema with Turnstile token
 */
export const contactFormWithTokenSchema = contactFormSchema.extend({
  turnstileToken: z.string().min(ONE, 'Security verification required'),
  submittedAt: z.string(),
});

export type ContactFormWithToken = z.infer<typeof contactFormWithTokenSchema>;

/**
 * 验证表单数据
 * Validate form data
 */
export async function validateFormData(body: unknown, clientIP: string) {
  const validationResult = contactFormWithTokenSchema.safeParse(body);

  if (!validationResult.success) {
    logger.warn('Form validation failed', {
      errors: validationResult.error.issues,
      clientIP,
    });

    const errorMessages = validationResult.error.issues.map(
      (error: z.ZodIssue) => {
        const field = error.path.join('.');
        return `${field}: ${error.message}`;
      },
    );

    return {
      success: false,
      error: 'Validation failed',
      details: errorMessages,
      data: null,
    };
  }

  const formData = validationResult.data;

  // 验证提交时间（防止重放攻击）
  const submittedAt = new Date(formData.submittedAt);
  const now = new Date();
  const timeDiff = now.getTime() - submittedAt.getTime();
  const maxAge = COUNT_TEN * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // COUNT_TEN分钟

  if (timeDiff > maxAge || timeDiff < ZERO) {
    logger.warn('Form submission time validation failed', {
      submittedAt: formData.submittedAt,
      timeDiff,
      clientIP,
    });

    return {
      success: false,
      error: 'Form submission expired or invalid',
      details: ['Please refresh the page and try again'],
      data: null,
    };
  }

  // 验证Turnstile token
  const turnstileValid = await verifyTurnstile(
    formData.turnstileToken,
    clientIP,
  );
  if (!turnstileValid) {
    logger.warn('Turnstile verification failed', { clientIP });
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
    data: formData,
  };
}

/**
 * 处理表单提交
 * Process form submission
 */
export async function processFormSubmission(
  formData: ContactFormData & { turnstileToken: string; submittedAt: string },
) {
  const emailData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    company: formData.company,
    phone: formData.phone,
    subject: formData.subject,
    message: formData.message,
    submittedAt: formData.submittedAt,
  };

  // 并行处理邮件发送和数据存储
  const [emailResult, airtableResult] = await Promise.allSettled([
    resendService.sendContactFormEmail(emailData),
    airtableService.createContact({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      company: formData.company || '',
      phone: formData.phone || '',
      subject: formData.subject,
      message: formData.message,
      acceptPrivacy: true, // 已通过验证，默认为true
      marketingConsent: false, // 默认值
      website: '', // 蜜罐字段，默认为空
    }),
  ]);

  // 检查结果
  const emailSuccess = emailResult.status === 'fulfilled';
  const airtableSuccess = airtableResult.status === 'fulfilled';

  if (!emailSuccess) {
    logger.error('Email sending failed', {
      error: emailResult.reason,
      formData: {
        email: formData.email,
        subject: formData.subject,
      },
    });
  }

  if (!airtableSuccess) {
    logger.error('Airtable record creation failed', {
      error: airtableResult.reason,
      formData: {
        email: formData.email,
        subject: formData.subject,
      },
    });
  }

  // 提取结果数据
  const emailMessageId =
    emailSuccess && emailResult.status === 'fulfilled'
      ? emailResult.value
      : null;
  const airtableRecordId =
    airtableSuccess && airtableResult.status === 'fulfilled'
      ? airtableResult.value?.id
      : null;

  // 至少一个服务成功就认为提交成功
  if (emailSuccess || airtableSuccess) {
    logger.info('Contact form submitted successfully', {
      email: formData.email,
      subject: formData.subject,
      emailSuccess,
      airtableSuccess,
      emailMessageId,
      airtableRecordId,
    });

    return {
      success: true,
      emailSent: emailSuccess,
      recordCreated: airtableSuccess,
      emailMessageId,
      airtableRecordId,
    };
  }

  // 两个服务都失败
  logger.error('Contact form submission failed completely', {
    emailError: emailResult.status === 'rejected' ? emailResult.reason : null,
    airtableError:
      airtableResult.status === 'rejected' ? airtableResult.reason : null,
    formData: {
      email: formData.email,
      subject: formData.subject,
    },
  });

  throw new Error('Failed to process form submission');
}

/**
 * 获取联系表单统计信息
 * Get contact form statistics
 */
export async function getContactFormStats() {
  try {
    if (!airtableService.isReady()) {
      // 如果服务未配置，返回默认值
      return {
        success: true,
        data: {
          totalContacts: ZERO,
          newContacts: ZERO,
          completedContacts: ZERO,
          recentContacts: ZERO,
        },
      };
    }

    const stats = await airtableService.getStatistics();

    // 确保返回完整的统计数据，为缺失字段提供默认值
    const defaultStats = {
      totalContacts: ZERO,
      newContacts: ZERO,
      completedContacts: ZERO,
      recentContacts: ZERO,
    };

    const normalizedStats = stats
      ? { ...defaultStats, ...stats }
      : defaultStats;

    return {
      success: true,
      data: normalizedStats,
    };
  } catch (error) {
    logger.error('Failed to get contact form stats', { error });
    throw new Error('Failed to retrieve statistics');
  }
}

/**
 * 验证管理员权限
 * Validate admin permissions
 */
export function validateAdminAccess(authHeader: string | null): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN;

  if (!adminToken) {
    logger.warn('Admin API token not configured');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return token === adminToken;
}

/**
 * 清理和标准化表单数据
 * Clean and normalize form data
 */
export function sanitizeFormData(
  data: ContactFormWithToken,
): ContactFormWithToken {
  return {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.toLowerCase().trim(),
    company: data.company?.trim() || '',
    phone: data.phone?.trim() || '',
    subject: data.subject?.trim() || '',
    message: data.message.trim(),
  };
}
