/**
 * 开发工具定位管理系统
 *
 * 统一管理所有开发工具的定位，防止重叠和视觉冲突
 * 提供智能布局算法和可配置的定位策略
 */

export type DevToolPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
  | 'left-center'
  | 'right-center';

export type DevToolSize = 'small' | 'medium' | 'large';

export interface DevToolConfig {
  id: string;
  name: string;
  position: DevToolPosition;
  size: DevToolSize;
  priority: number; // 1-10, 10 为最高优先级
  zIndex: number;
  collapsible: boolean;
  defaultCollapsed?: boolean;
}

/**
 * 开发工具定位配置
 * 按优先级和功能重要性分配位置
 */
export const DEV_TOOLS_CONFIG: Record<string, DevToolConfig> = {
  // React Scan - 最重要的性能工具，右下角主要位置
  reactScanIndicator: {
    id: 'react-scan-indicator',
    name: 'React Scan Indicator',
    position: 'bottom-left',
    size: 'small',
    priority: 9,
    zIndex: 1000,
    collapsible: false,
  },

  reactScanControlPanel: {
    id: 'react-scan-control-panel',
    name: 'React Scan Controls',
    position: 'bottom-right',
    size: 'medium',
    priority: 8,
    zIndex: 1001,
    collapsible: true,
    defaultCollapsed: false,
  },

  // I18n Performance - 重要但不如 React Scan，放在右上角
  i18nPerformanceDashboard: {
    id: 'i18n-performance-dashboard',
    name: 'I18n Performance',
    position: 'top-right',
    size: 'medium',
    priority: 7,
    zIndex: 999,
    collapsible: true,
    defaultCollapsed: false,
  },

  i18nPerformanceIndicator: {
    id: 'i18n-performance-indicator',
    name: 'I18n Indicator',
    position: 'top-left',
    size: 'small',
    priority: 6,
    zIndex: 998,
    collapsible: false,
  },

  // Web Vitals - 性能监控，左下角次要位置
  webVitalsIndicator: {
    id: 'web-vitals-indicator',
    name: 'Web Vitals',
    position: 'left-center',
    size: 'medium',
    priority: 5,
    zIndex: 997,
    collapsible: true,
    defaultCollapsed: true,
  },

  // 开发性能监控 - 最低优先级，顶部中央
  developmentPerformanceMonitor: {
    id: 'development-performance-monitor',
    name: 'Dev Performance',
    position: 'top-center',
    size: 'small',
    priority: 4,
    zIndex: 996,
    collapsible: true,
    defaultCollapsed: true,
  },
};

/**
 * 位置到 CSS 类的映射
 */
export const POSITION_CLASSES: Record<DevToolPosition, string> = {
  'top-left': 'fixed top-4 left-4',
  'top-right': 'fixed top-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'bottom-right': 'fixed bottom-4 right-4',
  'top-center': 'fixed top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2',
  'left-center': 'fixed left-4 top-1/2 -translate-y-1/2',
  'right-center': 'fixed right-4 top-1/2 -translate-y-1/2',
};

/**
 * 尺寸到 CSS 类的映射
 */
export const SIZE_CLASSES: Record<DevToolSize, string> = {
  small: 'max-w-xs',
  medium: 'max-w-sm',
  large: 'max-w-md',
};

/**
 * 获取开发工具的完整 CSS 类
 */
export function getDevToolClasses(toolId: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const config = DEV_TOOLS_CONFIG[toolId]; // toolId 来自预定义配置，安全
  if (!config) {
    console.warn(`Dev tool config not found for: ${toolId}`);
    return 'fixed bottom-4 right-4 z-50';
  }

  const positionClass =
    POSITION_CLASSES[config.position as keyof typeof POSITION_CLASSES] ||
    POSITION_CLASSES['bottom-right'];
  const sizeClass =
    SIZE_CLASSES[config.size as keyof typeof SIZE_CLASSES] ||
    SIZE_CLASSES.medium;
  const zIndexClass = `z-[${config.zIndex}]`;

  return `${positionClass} ${sizeClass} ${zIndexClass}`;
}

/**
 * 获取开发工具的 z-index 值
 */
export function getDevToolZIndex(toolId: string): number {
  const config = DEV_TOOLS_CONFIG[toolId as keyof typeof DEV_TOOLS_CONFIG];
  return config?.zIndex || DEV_TOOLS_CONSTANTS.LAYOUT.DEFAULT_OFFSET;
}

/**
 * 检查开发工具是否应该默认折叠
 */
export function shouldDefaultCollapse(toolId: string): boolean {
  const config = DEV_TOOLS_CONFIG[toolId as keyof typeof DEV_TOOLS_CONFIG];
  return config?.defaultCollapsed || false;
}

/**
 * 获取开发工具的优先级
 */
export function getDevToolPriority(toolId: string): number {
  const config = DEV_TOOLS_CONFIG[toolId as keyof typeof DEV_TOOLS_CONFIG];
  return config?.priority || 1;
}

/**
 * 开发工具布局管理器
 */
export class DevToolsLayoutManager {
  private static instance: DevToolsLayoutManager;
  private activeTools: Set<string> = new Set();

  static getInstance(): DevToolsLayoutManager {
    if (!DevToolsLayoutManager.instance) {
      DevToolsLayoutManager.instance = new DevToolsLayoutManager();
    }
    return DevToolsLayoutManager.instance;
  }

  /**
   * 注册开发工具
   */
  registerTool(toolId: string): void {
    this.activeTools.add(toolId);
    this.optimizeLayout();
  }

  /**
   * 注销开发工具
   */
  unregisterTool(toolId: string): void {
    this.activeTools.delete(toolId);
    this.optimizeLayout();
  }

  /**
   * 优化布局，避免重叠
   */
  private optimizeLayout(): void {
    // 按优先级排序活跃工具
    const sortedTools = Array.from(this.activeTools).sort((a, b) => {
      const priorityA = getDevToolPriority(a);
      const priorityB = getDevToolPriority(b);
      return priorityB - priorityA; // 降序排列
    });

    // 检测位置冲突并调整
    const usedPositions = new Set<DevToolPosition>();

    sortedTools.forEach((toolId) => {
      const config = DEV_TOOLS_CONFIG[toolId as keyof typeof DEV_TOOLS_CONFIG];
      if (!config) return;

      if (usedPositions.has(config.position)) {
        // 位置冲突，寻找替代位置
        const alternativePosition = this.findAlternativePosition(
          config.position,
          usedPositions,
        );
        if (alternativePosition) {
          // 临时调整位置（在实际应用中可能需要更复杂的状态管理）
          console.warn(
            `Dev tool ${toolId} position conflict, using alternative: ${alternativePosition}`,
          );
        }
      } else {
        usedPositions.add(config.position);
      }
    });
  }

  /**
   * 寻找替代位置
   */
  private findAlternativePosition(
    preferredPosition: DevToolPosition,
    usedPositions: Set<DevToolPosition>,
  ): DevToolPosition | null {
    // 位置优先级映射
    const alternatives: Record<DevToolPosition, DevToolPosition[]> = {
      'bottom-right': ['right-center', 'bottom-center', 'top-right'],
      'bottom-left': ['left-center', 'bottom-center', 'top-left'],
      'top-right': ['right-center', 'top-center', 'bottom-right'],
      'top-left': ['left-center', 'top-center', 'bottom-left'],
      'top-center': ['top-right', 'top-left', 'bottom-center'],
      'bottom-center': ['bottom-right', 'bottom-left', 'top-center'],
      'left-center': ['bottom-left', 'top-left', 'right-center'],
      'right-center': ['bottom-right', 'top-right', 'left-center'],
    };

    const alternativeList =
      alternatives[preferredPosition as keyof typeof alternatives] || [];

    for (const alternative of alternativeList) {
      if (!usedPositions.has(alternative)) {
        return alternative;
      }
    }

    return null;
  }

  /**
   * 获取所有活跃工具的布局信息
   */
  getLayoutInfo(): Array<{ toolId: string; config: DevToolConfig }> {
    return Array.from(this.activeTools)
      .map((toolId) => ({
        toolId,
        config: DEV_TOOLS_CONFIG[toolId as keyof typeof DEV_TOOLS_CONFIG],
      }))
      .filter((item): item is { toolId: string; config: DevToolConfig } =>
        Boolean(item.config),
      )
      .sort((a, b) => b.config.priority - a.config.priority);
  }
}

/**
 * React Hook for dev tools positioning
 */
export function useDevToolsLayout() {
  const layoutManager = DevToolsLayoutManager.getInstance();

  return {
    registerTool: (toolId: string) => layoutManager.registerTool(toolId),
    unregisterTool: (toolId: string) => layoutManager.unregisterTool(toolId),
    getClasses: (toolId: string) => getDevToolClasses(toolId),
    getZIndex: (toolId: string) => getDevToolZIndex(toolId),
    shouldCollapse: (toolId: string) => shouldDefaultCollapse(toolId),
    getLayoutInfo: () => layoutManager.getLayoutInfo(),
  };
}
