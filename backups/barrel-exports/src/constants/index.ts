/**
 * 常量模块统一导出
 * 提供项目中所有常量的集中访问点
 */

// 国际化常量
export * from '@/../backups/barrel-exports/src/constants/i18n-constants';

// 应用程序常量
export * from '@/../backups/barrel-exports/src/constants/app-constants';

// 测试相关常量
export * from '@/../backups/barrel-exports/src/constants/test-constants';

// 安全相关常量
export * from '@/../backups/barrel-exports/src/constants/security-constants';

// SEO相关常量
export * from '@/../backups/barrel-exports/src/constants/seo-constants';

// 重新导出主要常量对象以便于使用
export { APP_CONSTANTS } from '@/../backups/barrel-exports/src/constants/app-constants';
export { SECURITY_CONSTANTS } from '@/../backups/barrel-exports/src/constants/security-constants';
export { SEO_CONSTANTS } from '@/../backups/barrel-exports/src/constants/seo-constants';
export { TEST_CONSTANTS } from '@/../backups/barrel-exports/src/constants/test-constants';
