/**
 * 工具库统一导出
 * 提供项目中所有工具函数的统一入口
 */

// 重新导出共享工具函数
export { formatDate, validateEmail } from '@/shared/utils';

// 未来可以添加更多工具模块的导出
// export type { validationConfig } from './validations';
export {
  contactFormSchema,
  apiResponseSchema,
  airtableRecordSchema,
  emailTemplateDataSchema,
  validationHelpers,
} from './validations';
export type {
  ContactFormData,
  ApiResponse,
  AirtableRecord,
  EmailTemplateData,
  FormValidationError,
  FormSubmissionStatus,
} from './validations';
// export * from './constants';
// export * from './api';
// export * from './auth';
