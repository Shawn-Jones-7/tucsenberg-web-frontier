/**
 * Airtable 相关类型定义
 */

// 重新导出验证相关类型
export type { AirtableRecord, ContactFormData } from '@/lib/validations';

// Airtable 查询选项类型
export interface AirtableQueryOptions {
  maxRecords?: number;
  filterByFormula?: string;
  sort?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
}

// Airtable 统计数据类型
export interface AirtableStatistics {
  totalContacts: number;
  newContacts: number;
  inProgressContacts: number;
  completedContacts: number;
  archivedContacts: number;
}

// 联系人状态类型
export type ContactStatus = 'New' | 'In Progress' | 'Completed' | 'Archived';
