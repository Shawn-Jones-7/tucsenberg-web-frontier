// 延迟初始化的单例实例
import type { SendMessageRequest } from '@/types/whatsapp';
import { WhatsAppService } from '@/lib/whatsapp-core';

/**
 * WhatsApp Business API 服务 - 统一导出入口
 * 提供完整的WhatsApp消息发送和管理功能
 */

// 导出核心服务类
export { WhatsAppService } from '@/lib/whatsapp-core';

// 导出子服务类
export { WhatsAppMessageService } from '@/lib/whatsapp-messages';
export { WhatsAppMediaService } from '@/lib/whatsapp-media';
export { WhatsAppUtils } from '@/lib/whatsapp-utils';

// 导出类型
export type {
  SendMessageRequest,
  WhatsAppServiceResponse,
} from '@/types/whatsapp';

let whatsappServiceInstance: WhatsAppService | null = null;

function getWhatsAppService(): WhatsAppService {
  if (!whatsappServiceInstance) {
    whatsappServiceInstance = new WhatsAppService();
  }
  return whatsappServiceInstance;
}

// 导出便捷函数
export const sendWhatsAppMessage = (message: SendMessageRequest) =>
  getWhatsAppService().sendMessage(message);

export const sendWhatsAppText = (
  to: string,
  text: string,
  previewUrl?: boolean,
) => getWhatsAppService().sendTextMessage(to, text, previewUrl);

export const sendWhatsAppImage = (
  to: string,
  imageUrl: string,
  caption?: string,
) => getWhatsAppService().sendImageMessage(to, imageUrl, caption);

export const sendWhatsAppTemplate = (
  to: string,
  templateName: string,
  languageCode: string,
  parameters?: string[],
) =>
  getWhatsAppService().sendTemplateMessage(
    to,
    templateName,
    languageCode,
    parameters,
  );
