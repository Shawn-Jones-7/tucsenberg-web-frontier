/**
 * 动态导入组件 - 主入口文件
 * Dynamic Imports - Main Entry Point
 *
 * 统一的动态导入组件管理接口，整合所有子模块功能
 * 为非关键组件提供懒加载功能，优化初始包大小
 */

'use client';

// 重新导出所有模块的组件和功能
// export * from './dynamic-imports-devtools'; // 暂时禁用，组件不存在
// export * from './dynamic-imports-i18n'; // 暂时禁用，组件不存在
// export * from './dynamic-imports-performance'; // 暂时禁用，组件不存在
// export * from './dynamic-imports-showcase'; // 暂时禁用，组件不存在

// 导入主要组件集合
import { CoreDynamicComponents } from '@/../backups/barrel-exports/src/components/shared/dynamic-imports-core';

export * from '@/../backups/barrel-exports/src/components/shared/dynamic-imports-base';
export * from '@/../backups/barrel-exports/src/components/shared/dynamic-imports-core';

// import { DevToolsDynamicComponents, DevelopmentOnlyComponents } from './dynamic-imports-devtools'; // 暂时禁用
// import { I18nDynamicComponents } from './dynamic-imports-i18n'; // 暂时禁用
// import { DevelopmentPerformanceComponents, PerformanceDynamicComponents } from './dynamic-imports-performance'; // 暂时禁用
// import {
//     DemoDynamicComponents,
//     ExampleDynamicComponents,
//     ShowcaseDynamicComponents,
//     TutorialDynamicComponents
// } from './dynamic-imports-showcase'; // 暂时禁用

// 向后兼容的导出 - 保持原有的导出名称
export const DynamicProgressIndicator = CoreDynamicComponents.ProgressIndicator;
export const DynamicAnimatedIcon = CoreDynamicComponents.AnimatedIcon;

// 以下组件暂时禁用，因为相关文件不存在
// 性能监控组件的向后兼容导出
// export const DynamicWebVitalsIndicator = PerformanceDynamicComponents.WebVitalsIndicator;
// export const DynamicThemePerformanceMonitor = PerformanceDynamicComponents.ThemePerformanceMonitor;

// 开发工具组件的向后兼容导出
// export const DynamicReactScanProvider = DevToolsDynamicComponents.ReactScanProvider;
// export const DynamicReactScanIndicator = DevToolsDynamicComponents.ReactScanIndicator;
// export const DynamicReactScanControlPanel = DevToolsDynamicComponents.ReactScanControlPanel;
// export const DynamicDevToolsController = DevToolsDynamicComponents.DevToolsController;
// export const DynamicDevToolsStatusIndicator = DevToolsDynamicComponents.DevToolsStatusIndicator;
// export const DynamicReactScanDemo = DevToolsDynamicComponents.ReactScanDemo;
// export const DynamicReactScanStressTest = DevToolsDynamicComponents.ReactScanStressTest;

// 国际化组件的向后兼容导出
// export const DynamicI18nPerformanceDashboard = I18nDynamicComponents.PerformanceDashboard;
// export const DynamicLocaleDetectionDemo = I18nDynamicComponents.LocaleDetectionDemo;
// export const DynamicTranslationPreloader = I18nDynamicComponents.TranslationPreloader;
// 展示组件的向后兼容导出
// export const DynamicComponentShowcase = ShowcaseDynamicComponents.ComponentShowcase; // 暂时禁用

// UI组件的向后兼容导出
export const DynamicAnimatedCounter = CoreDynamicComponents.AnimatedCounter;
export const DynamicDropdownMenu = CoreDynamicComponents.DropdownMenu;

// 开发环境专用组件的向后兼容导出
// export const DevelopmentPerformanceMonitor = DevelopmentPerformanceComponents.PerformanceMonitor; // 暂时禁用
// export const DevelopmentWebVitalsIndicator = DevelopmentPerformanceComponents.WebVitalsIndicator; // 暂时禁用

// ==================== 统一的组件集合导出 ====================

/**
 * 所有动态导入组件的统一集合
 * Unified collection of all dynamic import components
 */
export const AllDynamicComponents = {
  // 核心组件
  ...CoreDynamicComponents,

  // 以下组件暂时禁用，因为相关文件不存在
  // 性能监控组件
  // ...PerformanceDynamicComponents,

  // 开发工具组件
  // ...DevToolsDynamicComponents,

  // 国际化组件
  // ...I18nDynamicComponents,

  // 展示组件
  // ...ShowcaseDynamicComponents,
  // ...DemoDynamicComponents,
  // ...ExampleDynamicComponents,
  // ...TutorialDynamicComponents,
} as const;

/**
 * 开发环境专用组件集合
 * Development-only components collection
 */
export const DevelopmentComponents = {
  // 暂时禁用，因为相关文件不存在
  // ...DevelopmentPerformanceComponents,
  // ...DevelopmentOnlyComponents,
} as const;
