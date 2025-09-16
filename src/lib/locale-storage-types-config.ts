/**
 * 语言存储系统配置接口 - 主入口
 * 重新导出所有配置相关模块
 */

// 重新导出基础配置接口
export type {
  StorageConfig,
  EnvironmentConfig,
} from './locale-storage-types-config/interfaces';

// 重新导出默认配置常量
export { DEFAULT_STORAGE_CONFIG } from '@/lib/locale-storage-types-config/defaults';

// 重新导出环境配置预设
export { CONFIG_PRESETS } from '@/lib/locale-storage-types-config/presets';

// 重新导出配置验证规则
export type { ConfigValidationRules } from '@/lib/locale-storage-types-config/validation';
export { CONFIG_VALIDATION_RULES } from '@/lib/locale-storage-types-config/validation';

// 重新导出配置迁移
export type { ConfigMigration } from '@/lib/locale-storage-types-config/migrations';
export { CONFIG_MIGRATIONS } from '@/lib/locale-storage-types-config/migrations';

// 重新导出配置工厂
export { ConfigFactory } from '@/lib/locale-storage-types-config/factory';
