/**
 * WhatsApp Specific Message Type Definitions
 *
 * This module provides type definitions for specific WhatsApp message types
 * including text, image, interactive, and other specialized message formats.
 */

import { COUNT_TEN, COUNT_TRIPLE, MAGIC_20, MAGIC_4096, ONE, ZERO } from "@/constants/magic-numbers";
import type { TemplateMessage } from '@/types/whatsapp-template-types';
import type {
  ContactData,
  LocationData
} from '@/types/whatsapp-base-types';

// Base Message Structure
interface BaseMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
}

// Text Message Types
export interface TextMessage extends BaseMessage {
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

// Image Message Types
export interface ImageMessage extends BaseMessage {
  type: 'image';
  image: {
    id?: string;
    link?: string;
    caption?: string;
  };
}

// Document Message Types
export interface DocumentMessage extends BaseMessage {
  type: 'document';
  document: {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
  };
}

// Audio Message Types
export interface AudioMessage extends BaseMessage {
  type: 'audio';
  audio: {
    id?: string;
    link?: string;
  };
}

// Video Message Types
export interface VideoMessage extends BaseMessage {
  type: 'video';
  video: {
    id?: string;
    link?: string;
    caption?: string;
  };
}

// Location Message Types
export interface LocationMessage extends BaseMessage {
  type: 'location';
  location: LocationData;
}

// Contacts Message Types
export interface ContactsMessage extends BaseMessage {
  type: 'contacts';
  contacts: ContactData[];
}

// Template Message Types
export interface TemplateMessageRequest extends BaseMessage {
  type: 'template';
  template: TemplateMessage;
}

// Interactive Message Types
export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title?: string;
  rows: InteractiveListRow[];
}

export interface InteractiveHeader {
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
}

export interface InteractiveBody {
  text: string;
}

export interface InteractiveFooter {
  text: string;
}

export interface InteractiveButtonAction {
  buttons: InteractiveButton[];
}

export interface InteractiveListAction {
  button: string;
  sections: InteractiveListSection[];
}

export interface InteractiveMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    type: 'button' | 'list';
    header?: InteractiveHeader;
    body: InteractiveBody;
    footer?: InteractiveFooter;
    action: InteractiveButtonAction | InteractiveListAction;
  };
}

// Reaction Message Types
export interface ReactionMessage extends BaseMessage {
  type: 'reaction';
  reaction: {
    message_id: string;
    emoji: string;
  };
}

// Sticker Message Types
export interface StickerMessage extends BaseMessage {
  type: 'sticker';
  sticker: {
    id?: string;
    link?: string;
  };
}

// Union Types
export type WhatsAppOutgoingMessage =
  | TextMessage
  | ImageMessage
  | DocumentMessage
  | AudioMessage
  | VideoMessage
  | LocationMessage
  | ContactsMessage
  | TemplateMessageRequest
  | InteractiveMessage
  | ReactionMessage
  | StickerMessage;

export type MediaMessage =
  | ImageMessage
  | DocumentMessage
  | AudioMessage
  | VideoMessage
  | StickerMessage;
export type InteractiveMessageType = 'button' | 'list';

// Message Builder Types
export interface MessageBuilder {
  to: string;
  type: WhatsAppOutgoingMessage['type'];
}

export interface TextMessageBuilder extends MessageBuilder {
  type: 'text';
  body: string;
  preview_url?: boolean;
}

export interface MediaMessageBuilder extends MessageBuilder {
  type: 'image' | 'document' | 'audio' | 'video' | 'sticker';
  media_id?: string;
  media_link?: string;
  caption?: string;
  filename?: string; // For documents
}

export interface InteractiveMessageBuilder extends MessageBuilder {
  type: 'interactive';
  interactive_type: InteractiveMessageType;
  header?: Omit<InteractiveHeader, 'type'> & {
    type?: InteractiveHeader['type'];
  };
  body: string;
  footer?: string;
  buttons?: Array<{ id: string; title: string }>;
  list_button?: string;
  sections?: InteractiveListSection[];
}

// Type Guards
export function isTextMessage(
  message: WhatsAppOutgoingMessage,
): message is TextMessage {
  return message.type === 'text';
}

export function isImageMessage(
  message: WhatsAppOutgoingMessage,
): message is ImageMessage {
  return message.type === 'image';
}

export function isDocumentMessage(
  message: WhatsAppOutgoingMessage,
): message is DocumentMessage {
  return message.type === 'document';
}

export function isAudioMessage(
  message: WhatsAppOutgoingMessage,
): message is AudioMessage {
  return message.type === 'audio';
}

export function isVideoMessage(
  message: WhatsAppOutgoingMessage,
): message is VideoMessage {
  return message.type === 'video';
}

export function isLocationMessage(
  message: WhatsAppOutgoingMessage,
): message is LocationMessage {
  return message.type === 'location';
}

export function isContactsMessage(
  message: WhatsAppOutgoingMessage,
): message is ContactsMessage {
  return message.type === 'contacts';
}

export function isTemplateMessage(
  message: WhatsAppOutgoingMessage,
): message is TemplateMessageRequest {
  return message.type === 'template';
}

export function isInteractiveMessage(
  message: WhatsAppOutgoingMessage,
): message is InteractiveMessage {
  return message.type === 'interactive';
}

export function isReactionMessage(
  message: WhatsAppOutgoingMessage,
): message is ReactionMessage {
  return message.type === 'reaction';
}

export function isStickerMessage(
  message: WhatsAppOutgoingMessage,
): message is StickerMessage {
  return message.type === 'sticker';
}

export function isMediaMessage(
  message: WhatsAppOutgoingMessage,
): message is MediaMessage {
  return ['image', 'document', 'audio', 'video', 'sticker'].includes(
    message.type,
  );
}

export function isButtonInteractive(
  interactive: InteractiveMessage['interactive'],
): interactive is InteractiveMessage['interactive'] & {
  type: 'button';
  action: InteractiveButtonAction;
} {
  return interactive.type === 'button';
}

export function isListInteractive(
  interactive: InteractiveMessage['interactive'],
): interactive is InteractiveMessage['interactive'] & {
  type: 'list';
  action: InteractiveListAction;
} {
  return interactive.type === 'list';
}

// Message Validation
export interface MessageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTextMessage(
  message: TextMessage,
): MessageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!message.text.body || message.text.body.trim().length === ZERO) {
    errors.push('Text message body cannot be empty');
  }

  if (message.text.body && message.text.body.length > MAGIC_4096) {
    errors.push('Text message body cannot exceed MAGIC_4096 characters');
  }

  return { isValid: errors.length === ZERO, errors, warnings };
}

export function validateInteractiveMessage(
  message: InteractiveMessage,
): MessageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    !message.interactive.body.text ||
    message.interactive.body.text.trim().length === ZERO
  ) {
    errors.push('Interactive message body cannot be empty');
  }

  if (message.interactive.type === 'button') {
    const action = message.interactive.action as InteractiveButtonAction;
    if (!action.buttons || action.buttons.length === ZERO) {
      errors.push('Button interactive message must have at least one button');
    } else if (action.buttons.length > COUNT_TRIPLE) {
      errors.push('Button interactive message cannot have more than COUNT_TRIPLE buttons');
    }

    action.buttons?.forEach((button, index) => {
      if (!button.reply.id || !button.reply.title) {
        errors.push(`Button ${index + ONE} must have both id and title`);
      }
      if (button.reply.title.length > MAGIC_20) {
        warnings.push(
          `Button ${index + ONE} title should not exceed MAGIC_20 characters`,
        );
      }
    });
  }

  if (message.interactive.type === 'list') {
    const action = message.interactive.action as InteractiveListAction;
    if (!action.sections || action.sections.length === ZERO) {
      errors.push('List interactive message must have at least one section');
    } else if (action.sections.length > COUNT_TEN) {
      errors.push('List interactive message cannot have more than COUNT_TEN sections');
    }

    if (!action.button) {
      errors.push('List interactive message must have a button text');
    }

    action.sections?.forEach((section, sectionIndex) => {
      if (!section.rows || section.rows.length === ZERO) {
        errors.push(`Section ${sectionIndex + ONE} must have at least one row`);
      } else if (section.rows.length > COUNT_TEN) {
        errors.push(
          `Section ${sectionIndex + ONE} cannot have more than COUNT_TEN rows`,
        );
      }

      section.rows?.forEach((row, rowIndex) => {
        if (!row.id || !row.title) {
          errors.push(
            `Section ${sectionIndex + ONE}, Row ${rowIndex + ONE} must have both id and title`,
          );
        }
      });
    });
  }

  return { isValid: errors.length === ZERO, errors, warnings };
}

// Constants
export const MESSAGE_TYPES = [
  'text',
  'image',
  'document',
  'audio',
  'video',
  'location',
  'contacts',
  'template',
  'interactive',
  'reaction',
  'sticker',
] as const;

export const MEDIA_MESSAGE_TYPES = [
  'image',
  'document',
  'audio',
  'video',
  'sticker',
] as const;

export const INTERACTIVE_TYPES = ['button', 'list'] as const;

// Export commonly used types with shorter names
export type {
  ImageMessage as Image,
  InteractiveMessage as Interactive, WhatsAppOutgoingMessage as OutgoingMessage, TemplateMessageRequest as Template, TextMessage as Text
};
