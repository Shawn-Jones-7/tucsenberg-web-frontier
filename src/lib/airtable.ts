/**
 * Airtable 服务 - 主入口
 * 重新导出所有 Airtable 相关模块
 */

// 重新导出类型
export type {
  AirtableRecord,
  ContactFormData,
  AirtableQueryOptions,
  AirtableStatistics,
  ContactStatus,
} from './airtable/types';

// 重新导出服务类
export { AirtableService } from '@/lib/airtable/service';

// 重新导出单例实例
export { airtableService } from '@/lib/airtable/instance';
