/**
 * 动态导入组件 - 主入口文件
 * Dynamic Imports - Main Entry Point
 *
 * 统一的动态导入组件管理接口，整合所有子模块功能
 * 为非关键组件提供懒加载功能，优化初始包大小
 */

'use client';

// 导入主要组件集合
import { CoreDynamicComponents } from '@/components/shared/dynamic-imports-core';

export {
  CardSkeletonFallback,
  ComponentLoadingFallback,
  createDynamicConfig,
  DEV_TOOLS_CONFIG,
  isClient,
  isDevelopment,
  isProduction,
  MinimalLoadingFallback,
  PERFORMANCE_CONFIG,
  SHOWCASE_CONFIG,
  SkeletonLoadingFallback,
  UI_COMPONENT_CONFIG,
  withConditionalDynamic,
  withDelayedDynamic,
  withDynamicSuspense,
  withErrorBoundary,
} from '@/components/shared/dynamic-imports-base';
export type { DynamicImportConfig } from '@/components/shared/dynamic-imports-base';
export { CoreDynamicComponents } from '@/components/shared/dynamic-imports-core';

// 向后兼容的导出 - 保持原有的导出名称
export const DynamicProgressIndicator = CoreDynamicComponents.ProgressIndicator;
export const DynamicAnimatedIcon = CoreDynamicComponents.AnimatedIcon;

// React Scan 已移除

// UI组件的向后兼容导出
export const DynamicAnimatedCounter = CoreDynamicComponents.AnimatedCounter;
export const DynamicDropdownMenu = CoreDynamicComponents.DropdownMenu;
