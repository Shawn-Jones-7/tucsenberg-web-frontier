/**
 * 联系表单API验证和数据处理
 * Contact form API validation and data processing
 *
 * This module handles validation and delegates to the unified processLead pipeline
 */

import { z } from 'zod';
import { airtableService } from '@/lib/airtable';
import { contactFieldValidators } from '@/lib/form-schema/contact-field-validators';
import { processLead } from '@/lib/lead-pipeline';
import { CONTACT_SUBJECTS, LEAD_TYPES } from '@/lib/lead-pipeline/lead-schema';
import { logger } from '@/lib/logger';
import { verifyTurnstile } from '@/app/api/contact/contact-api-utils';
import { mapZodIssueToErrorKey } from '@/app/api/contact/contact-form-error-utils';
import {
  CONTACT_FORM_CONFIG,
  createContactFormSchemaFromConfig,
  type ContactFormFieldValues,
} from '@/config/contact-form-config';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_TEN,
  ONE,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';

const contactFormSchema = createContactFormSchemaFromConfig(
  CONTACT_FORM_CONFIG,
  contactFieldValidators,
);

/**
 * 扩展的联系表单模式，包含Turnstile token
 * Extended contact form schema with Turnstile token
 */
export const contactFormWithTokenSchema = contactFormSchema.extend({
  turnstileToken: z.string().min(ONE, 'Security verification required'),
  submittedAt: z.string(),
});

export type ContactFormWithToken = ContactFormFieldValues & {
  turnstileToken: string;
  submittedAt: string;
};

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
      mapZodIssueToErrorKey,
    );

    return {
      success: false,
      error: 'Validation failed',
      details: errorMessages,
      data: null,
    };
  }

  const formData = validationResult.data as unknown as ContactFormWithToken;

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
 * Map legacy subject string to contact subject enum
 */
function mapSubjectToEnum(
  subject: string | undefined,
): (typeof CONTACT_SUBJECTS)[keyof typeof CONTACT_SUBJECTS] {
  if (!subject) return CONTACT_SUBJECTS.OTHER;

  const subjectLower = subject.toLowerCase();
  if (subjectLower.includes('product')) return CONTACT_SUBJECTS.PRODUCT_INQUIRY;
  if (subjectLower.includes('distributor')) return CONTACT_SUBJECTS.DISTRIBUTOR;
  if (subjectLower.includes('oem') || subjectLower.includes('odm')) {
    return CONTACT_SUBJECTS.OEM_ODM;
  }
  return CONTACT_SUBJECTS.OTHER;
}

/**
 * 处理表单提交 - 委托给统一的 processLead pipeline
 * Process form submission - delegates to unified processLead pipeline
 */
export async function processFormSubmission(formData: ContactFormWithToken) {
  // 将旧格式映射到新的 Lead Pipeline 格式
  // Map legacy format to new Lead Pipeline format
  const fullName = [formData.firstName, formData.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const leadInput = {
    type: LEAD_TYPES.CONTACT,
    fullName: fullName || formData.firstName || 'Unknown',
    email: formData.email,
    company: formData.company,
    subject: mapSubjectToEnum(formData.subject),
    message: formData.message,
    turnstileToken: formData.turnstileToken,
    submittedAt: formData.submittedAt,
    marketingConsent: formData.marketingConsent ?? false,
  };

  // 调用统一的 Lead Pipeline
  const result = await processLead(leadInput);

  if (result.success) {
    return {
      success: true,
      emailSent: result.emailSent,
      recordCreated: result.recordCreated,
      emailMessageId: result.referenceId,
      airtableRecordId: result.referenceId,
    };
  }

  // 处理失败情况
  logger.error('Contact form submission failed via processLead', {
    error: result.error,
    email: formData.email,
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

    const normalizedStats = {
      totalContacts: stats?.totalContacts ?? defaultStats.totalContacts,
      newContacts: stats?.newContacts ?? defaultStats.newContacts,
      completedContacts:
        stats?.completedContacts ?? defaultStats.completedContacts,
      recentContacts: stats?.recentContacts ?? defaultStats.recentContacts,
    };

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
    turnstileToken: data.turnstileToken.trim(),
    submittedAt: data.submittedAt,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.toLowerCase().trim(),
    company: data.company?.trim() || '',
    phone: data.phone?.trim() || undefined,
    subject: data.subject?.trim() || undefined,
    message: data.message.trim(),
    acceptPrivacy: data.acceptPrivacy,
    marketingConsent: data.marketingConsent ?? false,
    website: data.website?.trim() || undefined,
  };
}
