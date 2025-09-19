import { useCallback } from 'react';

export interface ReactScanData {
  components: Array<{
    name: string;
    renderCount: number;
    renderTime: number;
    lastRenderTime: number;
  }>;
  totalRenderTime: number;
  totalRenderCount: number;
}

// React Scan 全局对象类型定义
interface ReactScanGlobalData {
  renderCount: number;
  renderTime: number;
  lastRenderTime: number;
}

interface ReactScanGlobal {
  components: Record<string, ReactScanGlobalData>;
}

// 扩展 Window 接口以包含 React Scan 全局对象
declare global {
  interface Window {
    __REACT_SCAN__?: ReactScanGlobal;
  }
}

export interface ComponentStats {
  name: string;
  renderCount: number;
  renderTime: number;
  lastRenderTime: number;
  avgRenderTime: number;
  efficiency: number;
  timestamp: number;
}

/**
 * React Scan 原始组件数据接口
 */
// interface _ReactScanRawComponentData {
// renderCount?: number;
// renderTime?: number;
// lastRenderTime?: number;
// }

/**
 * React Scan 数据读取钩子
 */
export const useReactScanDataReader = () => {
  // 读取 React Scan 内部数据
  const readReactScanData = useCallback((): ReactScanData | null => {
    if (typeof window === 'undefined') return null;

    try {
      // 尝试从全局对象读取 React Scan 数据
      const globalScan = window.__REACT_SCAN__;
      if (!globalScan) return null;

      const components = Object.entries(globalScan.components || {}).map(
        ([name, data]) => ({
          name,
          renderCount: data.renderCount || 0,
          renderTime: data.renderTime || 0,
          lastRenderTime: data.lastRenderTime || 0,
        }),
      );

      return {
        components,
        totalRenderTime: components.reduce((sum, c) => sum + c.renderTime, 0),
        totalRenderCount: components.reduce((sum, c) => sum + c.renderCount, 0),
      };
    } catch (error) {
      console.warn('Failed to read React Scan data:', error);
      return null;
    }
  }, []);

  // 处理扫描数据
  const processScanData = useCallback(
    (data: ReactScanData | null): ComponentStats[] => {
      if (!data || !data.components.length) return [];

      return data.components
        .map((component) => {
          const avgRenderTime =
            component.renderCount > 0
              ? component.renderTime / component.renderCount
              : 0;

          const efficiency =
            avgRenderTime > 0 ? Math.max(0, 100 - avgRenderTime * 10) : 100;

          return {
            ...component,
            avgRenderTime,
            efficiency,
            timestamp: Date.now(),
          };
        })
        .sort((a, b) => b.renderTime - a.renderTime);
    },
    [],
  );

  return {
    readReactScanData,
    processScanData,
  };
};
