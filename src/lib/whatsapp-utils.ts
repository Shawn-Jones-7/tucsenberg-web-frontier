import { MAGIC_4096 } from "@/constants/count";
import { BYTES_PER_KB, COUNT_PAIR, COUNT_TEN, COUNT_TRIPLE, HOURS_PER_DAY, HTTP_OK, MAGIC_20, MAGIC_256, MAGIC_36, MAGIC_72, MAGIC_9, ZERO } from "@/constants/magic-numbers";

/**
 * WhatsApp Business API 工具函数
 * 提供验证、格式化等辅助功能
 */

/**
 * WhatsApp 工具类
 */
export class WhatsAppUtils {
  /**
   * 验证电话号码格式
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // 基本验证：应该包含国家代码，只包含数字
    const phoneRegex = /^\d{COUNT_TEN,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
  }

  /**
   * 格式化电话号码（移除非数字字符）
   */
  static formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * 检查消息长度限制
   */
  static validateMessageLength(
    message: string,
    maxLength: number = MAGIC_4096,
  ): boolean {
    return message.length <= maxLength;
  }

  /**
   * 验证模板参数
   */
  static validateTemplateParameters(parameters: string[]): boolean {
    return parameters.every(
      (param) =>
        typeof param === 'string' && param.length > ZERO && param.length <= BYTES_PER_KB,
    );
  }

  /**
   * 验证按钮配置
   */
  static validateButtons(
    buttons: Array<{ id: string; title: string }>,
  ): boolean {
    if (buttons.length === ZERO || buttons.length > COUNT_TRIPLE) {
      return false;
    }

    return buttons.every(
      (button) =>
        typeof button.id === 'string' &&
        typeof button.title === 'string' &&
        button.id.length > ZERO &&
        button.id.length <= MAGIC_256 &&
        button.title.length > ZERO &&
        button.title.length <= MAGIC_20,
    );
  }

  /**
   * 验证列表行配置
   */
  static validateListRows(
    rows: Array<{ id: string; title: string; description?: string }>,
  ): boolean {
    if (rows.length === ZERO || rows.length > COUNT_TEN) {
      return false;
    }

    return rows.every(
      (row) =>
        typeof row.id === 'string' &&
        typeof row.title === 'string' &&
        row.id.length > ZERO &&
        row.id.length <= HTTP_OK &&
        row.title.length > ZERO &&
        row.title.length <= HOURS_PER_DAY &&
        (!row.description ||
          (row.description.length > ZERO && row.description.length <= MAGIC_72)),
    );
  }

  /**
   * 生成唯一的消息ID
   */
  static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(MAGIC_36).substr(COUNT_PAIR, MAGIC_9)}`;
  }

  /**
   * 检查URL格式
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查媒体类型
   */
  static validateMediaType(type: string): boolean {
    const validTypes = ['image', 'document', 'audio', 'video', 'sticker'];
    return validTypes.includes(type);
  }
}
