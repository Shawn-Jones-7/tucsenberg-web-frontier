/**
 * WhatsApp Webhook 消息类型定义
 * WhatsApp Webhook Message Type Definitions
 *
 * 提供各种类型的WhatsApp入站消息类型定义
 */

import type { WhatsAppMessage } from '@/types/whatsapp-base-types';
import type { MessageContext } from '@/types/whatsapp-webhook-base';

/**
 * 入站文本消息
 * Incoming text message
 */
export interface IncomingTextMessage extends WhatsAppMessage {
  type: 'text';
  text: {
    body: string;
  };
  context?: MessageContext;
}

/**
 * 入站图片消息
 * Incoming image message
 */
export interface IncomingImageMessage extends WhatsAppMessage {
  type: 'image';
  image: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  context?: MessageContext;
}

/**
 * 入站文档消息
 * Incoming document message
 */
export interface IncomingDocumentMessage extends WhatsAppMessage {
  type: 'document';
  document: {
    id: string;
    filename: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  context?: MessageContext;
}

/**
 * 入站音频消息
 * Incoming audio message
 */
export interface IncomingAudioMessage extends WhatsAppMessage {
  type: 'audio';
  audio: {
    id: string;
    mime_type: string;
    sha256: string;
    voice?: boolean;
  };
  context?: MessageContext;
}

/**
 * 入站视频消息
 * Incoming video message
 */
export interface IncomingVideoMessage extends WhatsAppMessage {
  type: 'video';
  video: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  context?: MessageContext;
}

/**
 * 入站位置消息
 * Incoming location message
 */
export interface IncomingLocationMessage extends WhatsAppMessage {
  type: 'location';
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  context?: MessageContext;
}

/**
 * 入站联系人消息
 * Incoming contacts message
 */
export interface IncomingContactsMessage extends WhatsAppMessage {
  type: 'contacts';
  contacts: Array<{
    name: {
      formatted_name: string;
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      suffix?: string;
      prefix?: string;
    };
    phones?: Array<{
      phone: string;
      type?: string;
      wa_id?: string;
    }>;
    emails?: Array<{
      email: string;
      type?: string;
    }>;
    urls?: Array<{
      url: string;
      type?: string;
    }>;
    addresses?: Array<{
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      country_code?: string;
      type?: string;
    }>;
    org?: {
      company?: string;
      department?: string;
      title?: string;
    };
    birthday?: string;
  }>;
  context?: MessageContext;
}

/**
 * 入站交互式消息
 * Incoming interactive message
 */
export interface IncomingInteractiveMessage extends WhatsAppMessage {
  type: 'interactive';
  interactive: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  context?: MessageContext;
}

/**
 * 入站反应消息
 * Incoming reaction message
 */
export interface IncomingReactionMessage extends WhatsAppMessage {
  type: 'reaction';
  reaction: {
    message_id: string;
    emoji: string;
  };
  context?: MessageContext;
}

/**
 * 入站贴纸消息
 * Incoming sticker message
 */
export interface IncomingStickerMessage extends WhatsAppMessage {
  type: 'sticker';
  sticker: {
    id: string;
    mime_type: string;
    sha256: string;
    animated?: boolean;
  };
  context?: MessageContext;
}

/**
 * 入站订单消息
 * Incoming order message
 */
export interface IncomingOrderMessage extends WhatsAppMessage {
  type: 'order';
  order: {
    catalog_id: string;
    product_items: Array<{
      product_retailer_id: string;
      quantity: number;
      item_price: number;
      currency: string;
    }>;
    text?: string;
  };
  context?: MessageContext;
}

/**
 * 入站系统消息
 * Incoming system message
 */
export interface IncomingSystemMessage extends WhatsAppMessage {
  type: 'system';
  system: {
    body: string;
    new_wa_id?: string;
    wa_id?: string;
    type: 'customer_changed_number' | 'customer_identity_changed';
    customer?: string;
  };
  context?: MessageContext;
}

/**
 * 入站按钮消息
 * Incoming button message
 */
export interface IncomingButtonMessage extends WhatsAppMessage {
  type: 'button';
  button: {
    text: string;
    payload: string;
  };
  context?: MessageContext;
}

/**
 * 入站模板消息回复
 * Incoming template message reply
 */
export interface IncomingTemplateReply extends WhatsAppMessage {
  type: 'template_reply';
  template_reply: {
    template_name: string;
    template_id: string;
    button_text: string;
    button_payload: string;
  };
  context?: MessageContext;
}

/**
 * 入站WhatsApp消息联合类型
 * Union type for incoming WhatsApp messages
 */
export type IncomingWhatsAppMessage =
  | IncomingTextMessage
  | IncomingImageMessage
  | IncomingDocumentMessage
  | IncomingAudioMessage
  | IncomingVideoMessage
  | IncomingLocationMessage
  | IncomingContactsMessage
  | IncomingInteractiveMessage
  | IncomingReactionMessage
  | IncomingStickerMessage
  | IncomingOrderMessage
  | IncomingSystemMessage
  | IncomingButtonMessage
  | IncomingTemplateReply;

/**
 * 消息类型常量
 * Message type constants
 */
export const INCOMING_MESSAGE_TYPES = [
  'text',
  'image',
  'document',
  'audio',
  'video',
  'location',
  'contacts',
  'interactive',
  'reaction',
  'sticker',
  'order',
  'system',
  'button',
  'template_reply',
] as const;

export const MEDIA_MESSAGE_TYPES = [
  'image',
  'document',
  'audio',
  'video',
  'sticker',
] as const;

export const INTERACTIVE_MESSAGE_TYPES = [
  'interactive',
  'button',
  'template_reply',
] as const;

/**
 * 消息类型
 * Message types
 */
export type IncomingMessageType = (typeof INCOMING_MESSAGE_TYPES)[number];
export type MediaMessageType = (typeof MEDIA_MESSAGE_TYPES)[number];
export type InteractiveMessageType = (typeof INTERACTIVE_MESSAGE_TYPES)[number];

/**
 * 类型守卫函数
 * Type guard functions
 */
export function isTextMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingTextMessage {
  return message.type === 'text';
}

export function isImageMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingImageMessage {
  return message.type === 'image';
}

export function isDocumentMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingDocumentMessage {
  return message.type === 'document';
}

export function isAudioMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingAudioMessage {
  return message.type === 'audio';
}

export function isVideoMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingVideoMessage {
  return message.type === 'video';
}

export function isLocationMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingLocationMessage {
  return message.type === 'location';
}

export function isContactsMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingContactsMessage {
  return message.type === 'contacts';
}

export function isInteractiveMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingInteractiveMessage {
  return message.type === 'interactive';
}

export function isReactionMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingReactionMessage {
  return message.type === 'reaction';
}

export function isStickerMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingStickerMessage {
  return message.type === 'sticker';
}

export function isOrderMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingOrderMessage {
  return message.type === 'order';
}

export function isSystemMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingSystemMessage {
  return message.type === 'system';
}

export function isButtonMessage(
  message: IncomingWhatsAppMessage,
): message is IncomingButtonMessage {
  return message.type === 'button';
}

export function isTemplateReply(
  message: IncomingWhatsAppMessage,
): message is IncomingTemplateReply {
  return message.type === 'template_reply';
}

export function isMediaMessage(
  message: IncomingWhatsAppMessage,
): message is
  | IncomingImageMessage
  | IncomingDocumentMessage
  | IncomingAudioMessage
  | IncomingVideoMessage
  | IncomingStickerMessage {
  return MEDIA_MESSAGE_TYPES.includes(message.type as MediaMessageType);
}

export function isInteractiveMessageType(
  message: IncomingWhatsAppMessage,
): message is
  | IncomingInteractiveMessage
  | IncomingButtonMessage
  | IncomingTemplateReply {
  return INTERACTIVE_MESSAGE_TYPES.includes(
    message.type as InteractiveMessageType,
  );
}

/**
 * 消息内容提取器
 * Message content extractors
 */
export function getMessageText(
  message: IncomingWhatsAppMessage,
): string | null {
  switch (message.type) {
    case 'text':
      return message.text.body;
    case 'image':
    case 'document':
    case 'video':
      return message[message.type]?.caption || null;
    case 'interactive':
      return (
        message.interactive.button_reply?.title ||
        message.interactive.list_reply?.title ||
        null
      );
    case 'button':
      return message.button.text;
    case 'template_reply':
      return message.template_reply.button_text;
    case 'system':
      return message.system.body;
    default:
      return null;
  }
}

export function getMessageMediaId(
  message: IncomingWhatsAppMessage,
): string | null {
  if (isMediaMessage(message)) {
    type MediaKey = Extract<
      IncomingMessageType,
      'image' | 'document' | 'audio' | 'video' | 'sticker'
    >;
    const key = message.type as MediaKey;
    const mediaData = (
      message as Record<MediaKey, { id?: string } | undefined>
    )[key];
    return mediaData?.id ?? null;
  }
  return null;
}

export function hasMessageContext(message: IncomingWhatsAppMessage): boolean {
  return message.context !== undefined;
}
