/**
 * 动态导入组件 - 主入口文件
 * Dynamic Imports - Main Entry Point
 *
 * 统一的动态导入组件管理接口，整合所有子模块功能
 * 为非关键组件提供懒加载功能，优化初始包大小
 */

'use client';

// 导入主要组件集合
import dynamic from 'next/dynamic';
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

// 临时直接导出开发工具组件，直到devtools模块修复
export const DynamicReactScanDemo = dynamic(
  () =>
    import('@/components/dev-tools/react-scan-demo').then((mod) => ({
      default: mod.ReactScanDemo,
    })),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  },
);

export const DynamicReactScanStressTest = dynamic(
  () =>
    import('@/components/dev-tools/react-scan-demo').then((mod) => ({
      default: mod.ReactScanStressTest,
    })),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  },
);

// UI组件的向后兼容导出
export const DynamicAnimatedCounter = CoreDynamicComponents.AnimatedCounter;
export const DynamicDropdownMenu = CoreDynamicComponents.DropdownMenu;

// ==================== 统一的组件集合导出 ====================

/**
 * 所有动态导入组件的统一集合
 * Unified collection of all dynamic import components
 */
export const AllDynamicComponents = {
  // 核心组件
  ...CoreDynamicComponents,
} as const;

/**
 * 开发环境专用组件集合
 * Development-only components collection
 */
export const DevelopmentComponents = {} as const;
