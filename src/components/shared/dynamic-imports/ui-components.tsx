'use client';

/**
 * UI组件动态导入
 *
 * UI组件的动态导入定义
 */
import {
  ComponentLoadingFallback,
  createStandardDynamicComponent,
} from '@/components/shared/dynamic-imports-base';

// ==================== UI组件 ====================

/**
 * 动画计数器 - 动态导入
 * Animated Counter - Dynamic Import
 * 原因：动画组件，非关键，5.54KB
 */
export const DynamicAnimatedCounter = createStandardDynamicComponent(
  () =>
    import('@/components/ui/animated-counter').then((mod) => ({
      default: mod.AnimatedCounter,
    })),
  {
    ssr: false, // 动画组件不需要SSR
  },
);

/**
 * 下拉菜单 - 动态导入
 * Dropdown Menu - Dynamic Import
 * 原因：交互组件，较大，8.27KB
 */
export const DynamicDropdownMenu = createStandardDynamicComponent(() =>
  import('@/components/ui/dropdown-menu').then((mod) => ({
    default: mod.DropdownMenu,
  })),
);

/**
 * 标签页 - 动态导入
 * Tabs - Dynamic Import
 * 原因：布局组件，可能较大
 */
export const DynamicTabs = createStandardDynamicComponent(() =>
  import('@/components/ui/tabs').then((mod) => ({
    default: mod.Tabs,
  })),
);

/**
 * 轮播图 - 动态导入
 * Carousel - Dynamic Import
 * 原因：复杂组件，较大体积
 */
export const DynamicCarousel = createStandardDynamicComponent(
  () =>
    import('@/components/ui/carousel').then((mod) => ({
      default: mod.Carousel,
    })),
  {
    loading: ComponentLoadingFallback,
  },
);
