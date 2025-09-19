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
  // Modal: DynamicModal, // 组件文件不存在
  // Tooltip: DynamicTooltip, // 组件文件不存在
  // Popover: DynamicPopover, // 组件文件不存在
  // Drawer: DynamicDrawer, // 组件文件不存在
  Tabs: DynamicTabs,
  // Accordion: DynamicAccordion, // 组件文件不存在
  Carousel: DynamicCarousel,
  // DataTable: DynamicDataTable, // 组件文件不存在
  // Chart: DynamicChart, // 组件文件不存在
  // DatePicker: DynamicDatePicker, // 组件文件不存在
  // ColorPicker: DynamicColorPicker, // 组件文件不存在
  // FileUpload: DynamicFileUpload, // 组件文件不存在
  // RichTextEditor: DynamicRichTextEditor, // 组件文件不存在
} as const;
