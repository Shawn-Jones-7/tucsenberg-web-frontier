// 创建单例实例
import { ResendService } from '@/lib/resend-core';

/**
 * Resend邮件服务 - 统一导出入口
 * Resend email service - unified export entry
 */

// 导出核心服务类
export { ResendService } from '@/lib/resend-core';

// 导出工具类
export { ResendUtils } from '@/lib/resend-utils';

// 导出配置和类型
export { EMAIL_CONFIG } from '@/lib/resend-utils';
export type { EmailTemplateData } from '@/lib/validations';

export const resendService = new ResendService();
