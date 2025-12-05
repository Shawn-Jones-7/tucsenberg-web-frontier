import { z } from 'zod';
import {
  contactFormSchema,
  type ContactFormData,
} from '@/lib/form-schema/contact-form-schema';
import { CONTACT_FORM_VALIDATION_CONSTANTS } from '@/config/contact-form-config';
import { COUNT_FIVE, COUNT_TEN, ZERO } from '@/constants';

export { contactFormSchema };
export type { ContactFormData };

/**
 * API响应验证模式
 * API response validation schemas
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  messageId: z.string().optional(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

/**
 * Airtable记录验证模式
 * Airtable record validation schema
 */
export const airtableRecordSchema = z.object({
  id: z.string().optional(),
  fields: z.object({
    'First Name': z.string(),
    'Last Name': z.string(),
    'Email': z.string().email(),
    'Company': z.string(),
    'Message': z.string(),
    'Phone': z.string().optional(),
    'Subject': z.string().optional(),
    'Submitted At': z.string(),
    'Status': z
      .enum(['New', 'In Progress', 'Completed', 'Archived'])
      .default('New'),
    'Source': z.string().default('Website Contact Form'),
    'Marketing Consent': z.boolean().optional(),
  }),
  createdTime: z.string().optional(),
});

export type AirtableRecord = z.infer<typeof airtableRecordSchema>;

/**
 * 邮件模板数据验证模式
 * Email template data validation schema
 */
export const emailTemplateDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  company: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) =>
        val.length >= CONTACT_FORM_VALIDATION_CONSTANTS.COMPANY_MIN_LENGTH &&
        val.length <= CONTACT_FORM_VALIDATION_CONSTANTS.COMPANY_MAX_LENGTH,
      {
        message: `Company name must be between ${CONTACT_FORM_VALIDATION_CONSTANTS.COMPANY_MIN_LENGTH} and ${CONTACT_FORM_VALIDATION_CONSTANTS.COMPANY_MAX_LENGTH} characters`,
      },
    ),
  message: z.string(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  submittedAt: z.string(),
  marketingConsent: z.boolean().optional(),

  // Honeypot field - should remain empty
  website: z
    .string()
    .optional()
    .refine((value) => !value, 'Website field should be empty'),
});

export type EmailTemplateData = z.infer<typeof emailTemplateDataSchema>;

/**
 * Product inquiry email data validation schema
 */
export const productInquiryEmailDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  productName: z.string(),
  productSlug: z.string(),
  quantity: z.union([z.string(), z.number()]),
  requirements: z.string().optional(),
  marketingConsent: z.boolean().optional(),
});

export type ProductInquiryEmailData = z.infer<
  typeof productInquiryEmailDataSchema
>;

/**
 * 表单验证错误类型
 * Form validation error types
 */
export interface FormValidationError {
  field: keyof ContactFormData;
  message: string;
}

/**
 * 表单提交状态类型
 * Form submission status types
 */
export type FormSubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * 验证辅助函数
 * Validation helper functions
 */
export const validationHelpers = {
  /**
   * 验证邮箱域名是否在允许列表中
   * Validate if email domain is in allowed list
   */
  isEmailDomainAllowed: (email: string, allowedDomains?: string[]): boolean => {
    if (!allowedDomains || allowedDomains.length === ZERO) return true;

    const parts = email.split('@');
    const [, rawDomain] = parts;
    const domain = rawDomain?.toLowerCase();
    if (!domain) {
      return false;
    }
    return allowedDomains.some((allowed) => domain === allowed.toLowerCase());
  },

  /**
   * 清理和标准化输入数据
   * Sanitize and normalize input data
   */
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  },

  /**
   * 验证是否为垃圾邮件
   * Basic spam detection
   */
  isSpamContent: (message: string): boolean => {
    const spamKeywords = [
      'viagra',
      'casino',
      'lottery',
      'winner',
      'congratulations',
      'click here',
      'free money',
      'make money fast',
      'work from home',
    ];

    const lowerMessage = message.toLowerCase();
    return spamKeywords.some((keyword) => lowerMessage.includes(keyword));
  },

  /**
   * 验证提交频率限制
   * Validate submission rate limiting
   */
  isSubmissionRateLimited: (
    lastSubmission: Date | null,
    cooldownMinutes = CONTACT_FORM_VALIDATION_CONSTANTS.DEFAULT_COOLDOWN_MINUTES,
  ): boolean => {
    if (!lastSubmission) return false;

    const now = new Date();
    const timeDiff = now.getTime() - lastSubmission.getTime();
    const cooldownMs =
      cooldownMinutes *
      CONTACT_FORM_VALIDATION_CONSTANTS.COOLDOWN_TO_MS_MULTIPLIER;

    return timeDiff < cooldownMs;
  },
};

/**
 * 表单验证配置
 * Form validation configuration
 */
export const validationConfig = {
  // Rate limiting
  submissionCooldownMinutes: COUNT_FIVE,
  maxSubmissionsPerHour: COUNT_TEN,

  // Content filtering
  enableSpamDetection: true,
  allowedEmailDomains: [], // Empty array means all domains allowed

  // Field requirements
  requiredFields: [
    'firstName',
    'lastName',
    'email',
    'company',
    'message',
    'acceptPrivacy',
  ] as const,
  optionalFields: ['phone', 'subject', 'marketingConsent', 'website'] as const,

  // Security settings
  enableHoneypot: true,
  enableCsrfProtection: true,
  enableTurnstile: true,
} as const;

/**
 * 导出默认验证模式
 * Export default validation schema
 */
export default contactFormSchema;
