/**
 * WhatsApp API 请求构建器
 * WhatsApp API Request Builders
 */

import type { SendMessageRequest } from '@/types/whatsapp-api-requests/message-requests';
import type { ContactData, LocationData } from '@/types/whatsapp-base-types';
import type { TemplateMessage } from '@/types/whatsapp-template-types';

/**
 * 请求构建器辅助函数
 * Request builder helper functions
 */
export const RequestBuilders = {
  /**
   * 构建文本消息请求
   * Build text message request
   */
  buildTextMessage(
    to: string,
    text: string,
    previewUrl?: boolean,
  ): SendMessageRequest {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body: text,
        ...(previewUrl !== undefined && { preview_url: previewUrl }),
      },
    };
  },

  /**
   * 构建模板消息请求
   * Build template message request
   */
  buildTemplateMessage(
    to: string,
    template: TemplateMessage,
  ): SendMessageRequest {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template,
    };
  },

  /**
   * 构建媒体消息请求
   * Build media message request
   */
  buildMediaMessage(
    to: string,
    type: 'image' | 'document' | 'audio' | 'video',
    media: { id?: string; link?: string; caption?: string; filename?: string },
  ): SendMessageRequest {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
      [type]: media,
    } as SendMessageRequest;
  },

  /**
   * 构建位置消息请求
   * Build location message request
   */
  buildLocationMessage(to: string, location: LocationData): SendMessageRequest {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'location',
      location,
    };
  },

  /**
   * 构建联系人消息请求
   * Build contacts message request
   */
  buildContactsMessage(
    to: string,
    contacts: ContactData[],
  ): SendMessageRequest {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'contacts',
      contacts,
    };
  },
};
