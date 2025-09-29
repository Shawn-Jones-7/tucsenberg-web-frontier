/**
 * 核心动态组件导出配置
 */
import {
  DynamicAnimatedIcon,
  DynamicProgressIndicator,
} from '@/components/shared/dynamic-imports/high-priority';
import {
  DynamicAnimatedCounter,
  DynamicCarousel,
  DynamicDropdownMenu,
  DynamicTabs,
} from '@/components/shared/dynamic-imports/ui-components';

// ==================== 导出所有核心组件 ====================

export const CoreDynamicComponents = {
  ProgressIndicator: DynamicProgressIndicator,
  AnimatedIcon: DynamicAnimatedIcon,
  AnimatedCounter: DynamicAnimatedCounter,
  DropdownMenu: DynamicDropdownMenu,
  Tabs: DynamicTabs,
  Carousel: DynamicCarousel,
} as const;
