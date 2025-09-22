/**
 * Resend邮件服务核心类
 * Resend email service core class
 */

import { Resend } from 'resend';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { ResendTemplates } from '@/lib/resend-templates';
import { EMAIL_CONFIG, ResendUtils } from '@/lib/resend-utils';
import type { EmailTemplateData } from '@/lib/validations';
import { ZERO } from '@/constants';

/**
 * Resend邮件服务配置
 * Resend email service configuration
 */
export class ResendService {
  private resend: Resend | null = null;
  private isConfigured: boolean = false;
  private emailConfig: {
    from: string;
    replyTo: string;
    supportEmail: string;
  };

  constructor() {
    this.emailConfig = {
      from: env.EMAIL_FROM || EMAIL_CONFIG.from,
      replyTo: env.EMAIL_REPLY_TO || EMAIL_CONFIG.replyTo,
      supportEmail: env.EMAIL_REPLY_TO || EMAIL_CONFIG.supportEmail,
    };

    this.initializeResend();
  }

  /**
   * 初始化Resend服务
   * Initialize Resend service
   */
  private initializeResend(): void {
    try {
      if (!env.RESEND_API_KEY) {
        logger.warn('Resend API key missing - email service will be disabled');
        return;
      }

      this.resend = new Resend(env.RESEND_API_KEY);
      this.isConfigured = true;

      logger.info('Resend email service initialized successfully', {
        from: this.emailConfig.from,
        replyTo: this.emailConfig.replyTo,
      });
    } catch (error) {
      logger.error('Failed to initialize Resend service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 检查服务是否已配置
   * Check if service is configured
   */
  public isReady(): boolean {
    return this.isConfigured && this.resend !== null;
  }

  /**
   * 发送联系表单邮件给管理员
   * Send contact form email to admin
   */
  public async sendContactFormEmail(data: EmailTemplateData): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Resend service is not configured');
    }

    try {
      // 验证和清理邮件数据
      const validatedData = ResendUtils.validateEmailData(data);
      const sanitizedData = ResendUtils.sanitizeEmailData(validatedData);

      // 构建邮件内容
      const subject = ResendUtils.generateContactSubject(sanitizedData);
      const htmlContent =
        ResendTemplates.generateContactEmailHtml(sanitizedData);
      const textContent =
        ResendTemplates.generateContactEmailText(sanitizedData);

      // 发送邮件
      const result = await this.resend!.emails.send({
        from: this.emailConfig.from,
        to: [this.emailConfig.replyTo],
        replyTo: sanitizedData.email,
        subject,
        html: htmlContent,
        text: textContent,
        tags: ResendUtils.getContactFormTags(),
      });

      if (result.error) {
        throw new Error(`Resend API error: ${result.error.message}`);
      }

      logger.info('Contact form email sent successfully', {
        messageId: result.data?.id,
        to: this.emailConfig.replyTo,
        from: sanitizedData.email,
        subject,
      });

      return result.data?.id || 'unknown';
    } catch (error) {
      logger.error('Failed to send contact form email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email,
      });
      throw new Error('Failed to send email');
    }
  }

  /**
   * 发送确认邮件给用户
   * Send confirmation email to user
   */
  public async sendConfirmationEmail(data: EmailTemplateData): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Resend service is not configured');
    }

    try {
      const validatedData = ResendUtils.validateEmailData(data);
      const sanitizedData = ResendUtils.sanitizeEmailData(validatedData);

      const subject = ResendUtils.generateConfirmationSubject();
      const htmlContent =
        ResendTemplates.generateConfirmationEmailHtml(sanitizedData);
      const textContent =
        ResendTemplates.generateConfirmationEmailText(sanitizedData);

      const result = await this.resend!.emails.send({
        from: this.emailConfig.from,
        to: [sanitizedData.email],
        replyTo: this.emailConfig.supportEmail,
        subject,
        html: htmlContent,
        text: textContent,
        tags: ResendUtils.getConfirmationTags(),
      });

      if (result.error) {
        throw new Error(`Resend API error: ${result.error.message}`);
      }

      logger.info('Confirmation email sent successfully', {
        messageId: result.data?.id,
        to: sanitizedData.email,
        subject,
      });

      return result.data?.id || 'unknown';
    } catch (error) {
      logger.error('Failed to send confirmation email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email,
      });
      throw new Error('Failed to send confirmation email');
    }
  }

  /**
   * 获取邮件发送统计
   * Get email sending statistics
   */
  public getEmailStats(): {
    sent: number;
    delivered: number;
    bounced: number;
    complained: number;
  } {
    // Note: Resend doesn't provide built-in analytics API
    // This would need to be implemented with webhook tracking
    return {
      sent: ZERO,
      delivered: ZERO,
      bounced: ZERO,
      complained: ZERO,
    };
  }

  /**
   * 获取邮件配置
   * Get email configuration
   */
  public getEmailConfig(): typeof this.emailConfig {
    return { ...this.emailConfig };
  }

  /**
   * 检查API连接状态
   * Check API connection status
   */
  public checkConnection(): boolean {
    if (!this.isReady()) {
      return false;
    }

    let ok = true;
    try {
      // 尝试获取域名信息来测试连接
      // Note: This is a placeholder - Resend doesn't have a ping endpoint
      ok = true;
    } catch {
      ok = false;
    }
    return ok;
  }
}
