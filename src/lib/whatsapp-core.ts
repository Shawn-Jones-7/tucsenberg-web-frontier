/**
 * WhatsApp Business API 核心服务类
 * 整合消息发送和媒体处理功能
 */

import type {
  SendMessageRequest,
  WhatsAppServiceResponse,
} from '@/types/whatsapp';
import { WhatsAppMediaService } from '@/lib/whatsapp-media';
import { WhatsAppMessageService } from '@/lib/whatsapp-messages';
import { WhatsAppUtils } from '@/lib/whatsapp-utils';

/**
 * WhatsApp 核心服务类
 */
export class WhatsAppService {
  private messageService!: WhatsAppMessageService;
  private mediaService!: WhatsAppMediaService;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(accessToken?: string, phoneNumberId?: string) {
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId =
      phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    // 只在运行时检查，构建时跳过验证
    if (
      process.env.NODE_ENV !== 'production' &&
      typeof window === 'undefined'
    ) {
      // 构建时跳过验证
      return;
    }

    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp access token and phone number ID are required');
    }

    this.messageService = new WhatsAppMessageService(
      this.accessToken,
      this.phoneNumberId,
    );
    this.mediaService = new WhatsAppMediaService(
      this.accessToken,
      this.phoneNumberId,
    );
  }

  // 消息发送方法代理
  sendMessage(
    message: SendMessageRequest,
  ): Promise<WhatsAppServiceResponse> {
    return this.messageService.sendMessage(message);
  }

  sendTextMessage(
    to: string,
    text: string,
    previewUrl?: boolean,
  ): Promise<WhatsAppServiceResponse> {
    return this.messageService.sendTextMessage(to, text, previewUrl);
  }

  sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<WhatsAppServiceResponse> {
    return this.messageService.sendImageMessage(to, imageUrl, caption);
  }

  sendTemplateMessage(args: {
    to: string;
    templateName: string;
    languageCode: string;
    parameters?: string[];
  }): Promise<WhatsAppServiceResponse> {
    return this.messageService.sendTemplateMessage(args);
  }

  sendButtonMessage(args: {
    to: string;
    bodyText: string;
    buttons: Array<{ id: string; title: string }>;
    headerText?: string;
    footerText?: string;
  }): Promise<WhatsAppServiceResponse> {
    return this.messageService.sendButtonMessage(args);
  }

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
    return this.messageService.sendListMessage(args);
  }

  // 媒体处理方法代理
  getMediaUrl(mediaId: string): Promise<string | null> {
    return this.mediaService.getMediaUrl(mediaId);
  }

  downloadMedia(mediaId: string): Promise<Buffer | null> {
    return this.mediaService.downloadMedia(mediaId);
  }

  uploadMedia(
    file: Buffer | Blob,
    type: 'image' | 'document' | 'audio' | 'video' | 'sticker',
    filename?: string,
  ): Promise<string | null> {
    return this.mediaService.uploadMedia(file, type, filename);
  }

  // 工具方法代理
  static validatePhoneNumber = WhatsAppUtils.validatePhoneNumber;
  static formatPhoneNumber = WhatsAppUtils.formatPhoneNumber;
  static validateMessageLength = WhatsAppUtils.validateMessageLength;

  // 获取服务实例
  getMessageService(): WhatsAppMessageService {
    return this.messageService;
  }

  getMediaService(): WhatsAppMediaService {
    return this.mediaService;
  }

  // 配置信息
  getConfig(): { accessToken: string; phoneNumberId: string } {
    return {
      accessToken: this.accessToken,
      phoneNumberId: this.phoneNumberId,
    };
  }
}
