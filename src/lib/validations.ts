import { MAGIC_15 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE, COUNT_PAIR, COUNT_TEN, PERCENTAGE_FULL, PERCENTAGE_HALF, SECONDS_PER_MINUTE, ZERO } from '@/constants';

import { z } from 'zod';

/**
 * 验证常量定义
 * Validation constants to avoid magic numbers
 */
const VALIDATION_CONSTANTS = {
  // Name field constraints
  NAME_MIN_LENGTH: COUNT_PAIR,
  NAME_MAX_LENGTH: PERCENTAGE_HALF,

  // Email constraints
  EMAIL_MAX_LENGTH: PERCENTAGE_FULL,

  // Company constraints
  COMPANY_MIN_LENGTH: COUNT_PAIR,
  COMPANY_MAX_LENGTH: PERCENTAGE_FULL,

  // Message constraints
  MESSAGE_MIN_LENGTH: COUNT_TEN,
  MESSAGE_MAX_LENGTH: ANIMATION_DURATION_VERY_SLOW,

  // Subject constraints
  SUBJECT_MIN_LENGTH: COUNT_FIVE,
  SUBJECT_MAX_LENGTH: PERCENTAGE_FULL,

  // Phone constraints
  PHONE_MAX_DIGITS: MAGIC_15,

  // Honeypot constraint
  HONEYPOT_MAX_LENGTH: ZERO,

  // Rate limiting
  DEFAULT_COOLDOWN_MINUTES: COUNT_FIVE,
  COOLDOWN_TO_MS_MULTIPLIER: SECONDS_PER_MINUTE,
  MS_PER_SECOND: ANIMATION_DURATION_VERY_SLOW,
} as const;

/**
 * 联系表单验证模式
 * Contact form validation schema with comprehensive validation rules
 */
export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(
      VALIDATION_CONSTANTS.NAME_MIN_LENGTH,
      `First name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`,
    )
    .max(
      VALIDATION_CONSTANTS.NAME_MAX_LENGTH,
      `First name must be less than ${VALIDATION_CONSTANTS.NAME_MAX_LENGTH} characters`,
    )
    .regex(
      /^[a-zA-Z\s\u4e00-\u9fff]+$/,
      'First name can only contain letters and spaces',
    ),

  lastName: z
    .string()
    .min(
      VALIDATION_CONSTANTS.NAME_MIN_LENGTH,
      `Last name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`,
    )
    .max(
      VALIDATION_CONSTANTS.NAME_MAX_LENGTH,
      `Last name must be less than ${VALIDATION_CONSTANTS.NAME_MAX_LENGTH} characters`,
    )
    .regex(
      /^[a-zA-Z\s\u4e00-\u9fff]+$/,
      'Last name can only contain letters and spaces',
    ),

  email: z
    .string()
    .email('Please enter a valid email address')
    .max(
      VALIDATION_CONSTANTS.EMAIL_MAX_LENGTH,
      `Email must be less than ${VALIDATION_CONSTANTS.EMAIL_MAX_LENGTH} characters`,
    )
    .toLowerCase(),

  company: z
    .string()
    .min(
      VALIDATION_CONSTANTS.COMPANY_MIN_LENGTH,
      `Company name must be at least ${VALIDATION_CONSTANTS.COMPANY_MIN_LENGTH} characters`,
    )
    .max(
      VALIDATION_CONSTANTS.COMPANY_MAX_LENGTH,
      `Company name must be less than ${VALIDATION_CONSTANTS.COMPANY_MAX_LENGTH} characters`,
    )
    .regex(
      /^[a-zA-Z0-9\s\u4e00-\u9fff&.,'-]+$/,
      'Company name contains invalid characters',
    ),

  message: z
    .string()
    .min(
      VALIDATION_CONSTANTS.MESSAGE_MIN_LENGTH,
      `Message must be at least ${VALIDATION_CONSTANTS.MESSAGE_MIN_LENGTH} characters`,
    )
    .max(
      VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH,
      `Message must be less than ${VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH} characters`,
    )
    .trim(),

  // Optional fields for enhanced form functionality
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // International phone number validation - using safe static regex
      return /^[+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-()]/g, ''));
    }, 'Please enter a valid phone number'),

  subject: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return (
        val.length >= VALIDATION_CONSTANTS.SUBJECT_MIN_LENGTH &&
        val.length <= VALIDATION_CONSTANTS.SUBJECT_MAX_LENGTH
      );
    }, `Subject must be between ${VALIDATION_CONSTANTS.SUBJECT_MIN_LENGTH} and ${VALIDATION_CONSTANTS.SUBJECT_MAX_LENGTH} characters`),

  // Privacy and terms acceptance
  acceptPrivacy: z
    .boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),

  // Marketing consent (optional)
  marketingConsent: z.boolean().optional(),

  // Honeypot field for bot detection
  website: z
    .string()
    .max(VALIDATION_CONSTANTS.HONEYPOT_MAX_LENGTH, 'This field should be empty')
    .optional(),
});

/**
 * 联系表单数据类型
 * Contact form data type derived from schema
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

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
  company: z.string(),
  message: z.string(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  submittedAt: z.string(),
  marketingConsent: z.boolean().optional(),
});

export type EmailTemplateData = z.infer<typeof emailTemplateDataSchema>;

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
    const domain = parts.length > 1 ? parts[1]?.toLowerCase() : undefined;
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
    cooldownMinutes = VALIDATION_CONSTANTS.DEFAULT_COOLDOWN_MINUTES,
  ): boolean => {
    if (!lastSubmission) return false;

    const now = new Date();
    const timeDiff = now.getTime() - lastSubmission.getTime();
    const cooldownMs =
      cooldownMinutes *
      VALIDATION_CONSTANTS.COOLDOWN_TO_MS_MULTIPLIER *
      VALIDATION_CONSTANTS.MS_PER_SECOND;

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
