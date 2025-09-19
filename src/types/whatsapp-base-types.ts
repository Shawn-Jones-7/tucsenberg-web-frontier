import { ZERO } from '@/constants';

/**
 * WhatsApp API Base Type Definitions
 *
 * This module provides fundamental type definitions for WhatsApp Business API integration,
 * including basic contact and message structures.
 */

// Base WhatsApp API Types
export interface WhatsAppContact {
  input: string;
  wa_id: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type:
    | 'text'
    | 'image'
    | 'document'
    | 'audio'
    | 'video'
    | 'location'
    | 'contacts'
    | 'template'
    | 'interactive'
    | 'reaction'
    | 'sticker'
    | 'order'
    | 'system'
    | 'button'
    | 'template_reply';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  document?: {
    id: string;
    filename: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  audio?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: Array<WhatsAppContact | Record<string, unknown>>;
}

// Media Types
export interface MediaObject {
  id?: string;
  link?: string;
  caption?: string;
}

export type ImageMedia = MediaObject;

export interface DocumentMedia extends MediaObject {
  filename?: string;
}

export type VideoMedia = MediaObject;

export interface AudioMedia {
  id?: string;
  link?: string;
  // Audio doesn't typically have captions
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

// Contact Types
export interface ContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface ContactPhone {
  phone?: string;
  type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK';
  wa_id?: string;
}

export interface ContactEmail {
  email?: string;
  type?: 'WORK' | 'HOME';
}

export interface ContactUrl {
  url?: string;
  type?: 'WORK' | 'HOME';
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_code?: string;
  type?: 'WORK' | 'HOME';
}

export interface ContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

export interface ContactData {
  name: ContactName;
  phones?: ContactPhone[];
  emails?: ContactEmail[];
  urls?: ContactUrl[];
  addresses?: ContactAddress[];
  org?: ContactOrg;
  birthday?: string; // YYYY-MM-DD format
}

// Message Status Types
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageStatusUpdate {
  id: string;
  status: MessageStatus;
  timestamp: string;
  recipient_id: string;
  errors?: WhatsAppError[];
}

// Error Types (Basic)
export interface WhatsAppError {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
  };
}

// Utility Types
export type MessageType = WhatsAppMessage['type'];
export type MediaType = 'image' | 'document' | 'audio' | 'video';

// Type Guards
export function isTextMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & { text: NonNullable<WhatsAppMessage['text']> } {
  return message.type === 'text' && Boolean(message.text);
}

export function isImageMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & {
  image: NonNullable<WhatsAppMessage['image']>;
} {
  return message.type === 'image' && Boolean(message.image);
}

export function isDocumentMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & {
  document: NonNullable<WhatsAppMessage['document']>;
} {
  return message.type === 'document' && Boolean(message.document);
}

export function isAudioMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & {
  audio: NonNullable<WhatsAppMessage['audio']>;
} {
  return message.type === 'audio' && Boolean(message.audio);
}

export function isVideoMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & {
  video: NonNullable<WhatsAppMessage['video']>;
} {
  return message.type === 'video' && Boolean(message.video);
}

export function isLocationMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & {
  location: NonNullable<WhatsAppMessage['location']>;
} {
  return message.type === 'location' && Boolean(message.location);
}

export function isContactsMessage(
  message: WhatsAppMessage,
): message is WhatsAppMessage & {
  contacts: NonNullable<WhatsAppMessage['contacts']>;
} {
  return message.type === 'contacts' && Boolean(message.contacts);
}

// Constants
export const WHATSAPP_MESSAGE_TYPES = [
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
  'order',
  'system',
  'button',
  'template_reply',
] as const;

export const WHATSAPP_MESSAGE_STATUSES = [
  'sent',
  'delivered',
  'read',
  'failed',
] as const;

export const SUPPORTED_MEDIA_TYPES = [
  'image',
  'document',
  'audio',
  'video',
] as const;

// Validation Helpers
export function isValidMessageType(type: string): type is MessageType {
  return WHATSAPP_MESSAGE_TYPES.includes(type as MessageType);
}

export function isValidMessageStatus(status: string): status is MessageStatus {
  return WHATSAPP_MESSAGE_STATUSES.includes(status as MessageStatus);
}

export function isValidMediaType(type: string): type is MediaType {
  return SUPPORTED_MEDIA_TYPES.includes(type as MediaType);
}

// Message Validation
export interface MessageValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateWhatsAppMessage(
  message: Partial<WhatsAppMessage>,
): MessageValidationResult {
  const errors: string[] = [];

  if (!message.id) {
    errors.push('Message ID is required');
  }

  if (!message.from) {
    errors.push('Message sender is required');
  }

  if (!message.timestamp) {
    errors.push('Message timestamp is required');
  }

  if (!message.type || !isValidMessageType(message.type)) {
    errors.push('Valid message type is required');
  }

  // Type-specific validation
  if (message.type === 'text' && !message.text?.body) {
    errors.push('Text message must have body content');
  }

  if (message.type === 'location' && message.location) {
    if (
      typeof message.location.latitude !== 'number' ||
      typeof message.location.longitude !== 'number'
    ) {
      errors.push('Location message must have valid latitude and longitude');
    }
  }

  return {
    isValid: errors.length === ZERO,
    errors,
  };
}

// Export commonly used types with shorter names
export type {
  WhatsAppContact as Contact,
  ContactData as ContactInfo,
  WhatsAppError as Error,
  LocationData as Location,
  WhatsAppMessage as Message,
  MessageStatusUpdate as StatusUpdate,
};
