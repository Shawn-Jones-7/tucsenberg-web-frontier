'use client';

/**
 * 高优先级动态导入组件
 *
 * 高优先级和核心UI组件的动态导入定义
 */
import { createStandardDynamicComponent } from '@/components/shared/dynamic-imports-base';

// ==================== 高优先级动态导入组件 ====================

/**
 * 进度指示器 - 动态导入
 * Progress Indicator - Dynamic Import
 * 原因：非关键组件，客户端渲染，3.69KB
 */
export const DynamicProgressIndicator = createStandardDynamicComponent(
  () =>
    import('@/components/shared/progress-indicator').then((mod) => ({
      default: mod.ProgressIndicator,
    })),
  {
    ssr: false, // 非关键组件，禁用SSR
  },
);

/**
 * 动画图标 - 动态导入
 * Animated Icon - Dynamic Import
 * 原因：非关键组件，客户端渲染，2.65KB
 */
export const DynamicAnimatedIcon = createStandardDynamicComponent(
  () =>
    import('@/components/shared/animated-icon').then((mod) => ({
      default: mod.AnimatedIcon,
    })),
  {
    ssr: false,
  },
);
