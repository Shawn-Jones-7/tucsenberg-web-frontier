/**
 * WhatsApp Business API 消息发送服务
 * 提供各种类型消息的发送功能
 */

import type {
  ImageMessage,
  InteractiveMessage,
  SendMessageRequest,
  TextMessage,
  WhatsAppServiceResponse,
} from '@/types/whatsapp';
import { logger } from '@/lib/logger';

/**
 * WhatsApp 消息发送类
 */
export class WhatsAppMessageService {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  /**
   * 发送消息的通用方法
   */
  async sendMessage(
    message: SendMessageRequest,
  ): Promise<WhatsAppServiceResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const error = data as { error?: { message?: string } };
        throw new Error(error.error?.message || 'Failed to send message');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      logger.error(
        'WhatsApp API Error',
        {},
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 发送文本消息
   */
  sendTextMessage(
    to: string,
    text: string,
    previewUrl: boolean = false,
  ): Promise<WhatsAppServiceResponse> {
    const message: TextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body: text,
        preview_url: previewUrl,
      },
    };

    return this.sendMessage(message);
  }

  /**
   * 发送图片消息
   */
  sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<WhatsAppServiceResponse> {
    const imagePayload: ImageMessage['image'] = {
      link: imageUrl,
    };

    if (caption) {
      imagePayload.caption = caption;
    }

    const message: ImageMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: imagePayload,
    };

    return this.sendMessage(message);
  }

  /**
   * 发送模板消息
   */
  sendTemplateMessage(args: {
    to: string;
    templateName: string;
    languageCode: string;
    parameters?: string[];
  }): Promise<WhatsAppServiceResponse> {
    const { to, templateName, languageCode, parameters } = args;
    const template: NonNullable<SendMessageRequest['template']> = {
      name: templateName,
      language: {
        code: languageCode,
        policy: 'deterministic',
      },
    };

    if (parameters && parameters.length > 0) {
      template.components = [
        {
          type: 'body',
          parameters: parameters.map((param) => ({
            type: 'text',
            text: param,
          })),
        },
      ];
    }

    const message: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template,
    };

    return this.sendMessage(message);
  }

  /**
   * 发送交互式按钮消息
   */
  sendButtonMessage(args: {
    to: string;
    bodyText: string;
    buttons: Array<{ id: string; title: string }>;
    headerText?: string;
    footerText?: string;
  }): Promise<WhatsAppServiceResponse> {
    const { to, bodyText, buttons, headerText, footerText } = args;
    const interactive: InteractiveMessage['interactive'] = {
      type: 'button',
      body: {
        text: bodyText,
      },
      action: {
        buttons: buttons.map((button) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title,
          },
        })),
      },
    };

    if (headerText) {
      interactive.header = {
        type: 'text',
        text: headerText,
      };
    }

    if (footerText) {
      interactive.footer = {
        text: footerText,
      };
    }

    const message: InteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    };

    return this.sendMessage(message);
  }

  /**
   * 发送列表消息
   */
  sendListMessage(args: {
    to: string;
    bodyText: string;
    buttonText: string;
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
    options?: { headerText?: string; footerText?: string };
  }): Promise<WhatsAppServiceResponse> {
    const { to, bodyText, buttonText, sections, options } = args;
    const interactive: InteractiveMessage['interactive'] = {
      type: 'list',
      body: {
        text: bodyText,
      },
      action: {
        button: buttonText,
        sections: sections.map((section) => ({
          title: section.title || '',
          rows: section.rows,
        })),
      },
    };

    if (options?.headerText) {
      interactive.header = {
        type: 'text',
        text: options.headerText,
      };
    }

    if (options?.footerText) {
      interactive.footer = {
        text: options.footerText,
      };
    }

    const message: InteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    };

    return this.sendMessage(message);
  }
}
