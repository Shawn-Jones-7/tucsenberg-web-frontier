/**
 * WhatsApp API 消息相关请求类型
 * WhatsApp API Message Request Types
 */

import type { ContactData, LocationData } from '@/types/whatsapp-base-types';
import type { TemplateMessage } from '@/types/whatsapp-template-types';

/**
 * 发送消息请求
 * Send message request
 */
export interface SendMessageRequest {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type:
    | 'text'
    | 'template'
    | 'image'
    | 'document'
    | 'audio'
    | 'video'
    | 'location'
    | 'contacts'
    | 'interactive';
  text?: {
    preview_url?: boolean;
    body: string;
  };
  template?: TemplateMessage;
  image?: {
    id?: string;
    link?: string;
    caption?: string;
  };
  document?: {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
  };
  audio?: {
    id?: string;
    link?: string;
  };
  video?: {
    id?: string;
    link?: string;
    caption?: string;
  };
  location?: LocationData;
  contacts?: ContactData[];
  interactive?: {
    type: 'button' | 'list';
    header?: {
      type: 'text' | 'image' | 'document' | 'video';
      text?: string;
      image?: {
        id?: string;
        link?: string;
      };
      document?: {
        id?: string;
        link?: string;
        filename?: string;
      };
      video?: {
        id?: string;
        link?: string;
      };
    };
    body?: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
      button?: string;
      sections?: Array<{
        title?: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}
