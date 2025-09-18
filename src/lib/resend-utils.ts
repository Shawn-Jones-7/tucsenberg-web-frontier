/**
 * Resend邮件服务工具函数
 * Resend email service utilities
 */

import { emailTemplateDataSchema, validationHelpers, type EmailTemplateData } from '@/lib/validations';

/**
 * 邮件配置常量
 * Email configuration constants
 */
export const EMAIL_CONFIG = {
  from: 'noreply@tucsenberg.com',
  replyTo: 'contact@tucsenberg.com',
  supportEmail: 'support@tucsenberg.com',
} as const;

/**
 * 邮件工具类
 * Email utilities class
 */
export class ResendUtils {
  /**
   * 验证邮件数据
   * Validate email data
   */
  static validateEmailData(data: EmailTemplateData): EmailTemplateData {
    return emailTemplateDataSchema.parse(data);
  }

  /**
   * 清理邮件数据
   * Sanitize email data
   */
  static sanitizeEmailData(data: EmailTemplateData): EmailTemplateData {
    return {
      firstName: validationHelpers.sanitizeInput(data.firstName),
      lastName: validationHelpers.sanitizeInput(data.lastName),
      email: data.email.toLowerCase().trim(),
      company: validationHelpers.sanitizeInput(data.company),
      message: validationHelpers.sanitizeInput(data.message),
      phone: data.phone
        ? validationHelpers.sanitizeInput(data.phone)
        : undefined,
      subject: data.subject
        ? validationHelpers.sanitizeInput(data.subject)
        : undefined,
      submittedAt: data.submittedAt,
      marketingConsent: data.marketingConsent,
    };
  }

  /**
   * 生成邮件主题
   * Generate email subject
   */
  static generateContactSubject(data: EmailTemplateData): string {
    return data.subject
      ? `Contact Form: ${data.subject}`
      : `New Contact from ${data.firstName} ${data.lastName}`;
  }

  /**
   * 生成确认邮件主题
   * Generate confirmation email subject
   */
  static generateConfirmationSubject(): string {
    return 'Thank you for contacting us - Tucsenberg';
  }

  /**
   * 获取邮件标签
   * Get email tags
   */
  static getContactFormTags(): Array<{ name: string; value: string }> {
    return [
      { name: 'type', value: 'contact-form' },
      { name: 'source', value: 'website' },
    ];
  }

  /**
   * 获取确认邮件标签
   * Get confirmation email tags
   */
  static getConfirmationTags(): Array<{ name: string; value: string }> {
    return [
      { name: 'type', value: 'confirmation' },
      { name: 'source', value: 'website' },
    ];
  }

  /**
   * 格式化日期时间
   * Format date time
   */
  static formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString();
  }
}
