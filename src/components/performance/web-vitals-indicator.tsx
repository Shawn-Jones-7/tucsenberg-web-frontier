'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDevToolsLayout } from '@/lib/dev-tools-positioning';
import {
  webVitalsMonitor,
  type WebVitalsMetrics,
} from '@/lib/web-vitals-monitor';
import {
  MONITORING_INTERVALS,
  WEB_VITALS_THRESHOLDS,
} from '@/constants/performance-constants';

// 拖动相关常量
const DRAG_CONSTANTS = {
  COMPONENT_WIDTH: 200,
  COMPONENT_HEIGHT: 300,
  AUTO_RETURN_DELAY: 8000,
  RETURN_ANIMATION_DURATION: 300,
} as const;

// 拖动功能自定义 Hook
function useDraggable() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 只在标题栏区域允许拖动
      if ((e.target as HTMLElement).closest('.drag-handle')) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        };
      }
    },
    [position.x, position.y],
  );

  // 拖动时监听全局鼠标事件
  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;

      // 边界限制：确保不超出视口
      const maxX = window.innerWidth - DRAG_CONSTANTS.COMPONENT_WIDTH;
      const maxY = window.innerHeight - DRAG_CONSTANTS.COMPONENT_HEIGHT;
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      // 清除之前的定时器
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }

      // 8 秒后自动归位
      returnTimerRef.current = setTimeout(() => {
        setIsReturning(true);
        setPosition({ x: 0, y: 0 });

        // 归位动画完成后重置状态
        animationTimerRef.current = setTimeout(() => {
          setIsReturning(false);
        }, DRAG_CONSTANTS.RETURN_ANIMATION_DURATION);
      }, DRAG_CONSTANTS.AUTO_RETURN_DELAY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  return {
    position,
    isDragging,
    isReturning,
    handleMouseDown,
  };
}

// 工具函数：获取指标颜色
const getMetricColor = (value: number, good: number, poor: number): string => {
  if (value <= good) return 'text-green-600';
  if (value <= poor) return 'text-yellow-600';
  return 'text-red-600';
};

// 工具函数：格式化指标值
const formatMetric = (value: number | undefined, unit: string): string => {
  if (value === undefined) return 'N/A';
  return `${Math.round(value)}${unit}`;
};

// 指标行组件
interface MetricRowProps {
  label: string;
  value: number | undefined;
  unit: string;
  good: number;
  poor: number;
}

function MetricRow({ label, value, unit, good, poor }: MetricRowProps) {
  if (value === undefined) return null;

  return (
    <div className='flex justify-between gap-4'>
      <span>{label}:</span>
      <span className={getMetricColor(value, good, poor)}>
        {formatMetric(value, unit)}
      </span>
    </div>
  );
}

// 性能监控钩子
function useWebVitalsMonitoring() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics | null>(null);
  const [isVisible] = useState(() => process.env.NODE_ENV === 'development');

  useEffect(() => {
    // 定期更新指标（每3秒）
    const updateInterval = setInterval(() => {
      const summary = webVitalsMonitor.getPerformanceSummary();
      setMetrics(summary.metrics);
    }, MONITORING_INTERVALS.METRICS_UPDATE);

    // 定期发送性能报告（每5分钟）
    const reportInterval = setInterval(() => {
      webVitalsMonitor.sendReport();
    }, MONITORING_INTERVALS.REPORT_SEND);

    // 页面可见性变化时发送报告
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        webVitalsMonitor.sendReport();
      }
    };

    // 页面卸载前发送最终报告
    const handleBeforeUnload = () => {
      webVitalsMonitor.sendReport();
    };

    // 添加事件监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 组件挂载时发送初始报告
    webVitalsMonitor.sendReport();

    // 清理函数
    return () => {
      clearInterval(updateInterval);
      clearInterval(reportInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      webVitalsMonitor.sendReport();
    };
  }, []);

  return { metrics, isVisible };
}

/**
 * Web Vitals 性能指示器组件
 *
 * 基于现有性能监控组件模式，在开发环境显示性能指标，
 * 生产环境静默收集数据并定期发送报告。
 * 支持拖动功能，拖动后 8 秒自动归位到原始位置。
 */
export function WebVitalsIndicator() {
  const { registerTool, unregisterTool, getClasses } = useDevToolsLayout();
  const { metrics, isVisible } = useWebVitalsMonitoring();
  const { position, isDragging, isReturning, handleMouseDown } = useDraggable();

  // 注册工具到布局管理器
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      registerTool('webVitalsIndicator');
      return () => unregisterTool('webVitalsIndicator');
    }
    return undefined;
  }, [registerTool, unregisterTool]);

  // 生产环境不渲染任何UI
  if (!isVisible || !metrics) {
    return null;
  }

  return (
    <div
      className={`${getClasses('webVitalsIndicator')} rounded-lg bg-black/80 p-3 text-xs text-white shadow-lg backdrop-blur-sm ${
        isDragging ? 'cursor-grabbing' : ''
      } ${isReturning ? 'transition-transform duration-300 ease-out' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className='drag-handle mb-2 cursor-grab font-semibold'>
        🚀 Web Vitals
      </div>
      <div className='space-y-1'>
        <MetricRow
          label='CLS'
          value={metrics.cls}
          unit=''
          good={WEB_VITALS_THRESHOLDS.CLS.GOOD}
          poor={WEB_VITALS_THRESHOLDS.CLS.POOR}
        />
        <MetricRow
          label='FID'
          value={metrics.fid}
          unit='ms'
          good={WEB_VITALS_THRESHOLDS.FID.GOOD}
          poor={WEB_VITALS_THRESHOLDS.FID.POOR}
        />
        <MetricRow
          label='LCP'
          value={metrics.lcp}
          unit='ms'
          good={WEB_VITALS_THRESHOLDS.LCP.GOOD}
          poor={WEB_VITALS_THRESHOLDS.LCP.POOR}
        />
        <MetricRow
          label='FCP'
          value={metrics.fcp}
          unit='ms'
          good={WEB_VITALS_THRESHOLDS.FCP.GOOD}
          poor={WEB_VITALS_THRESHOLDS.FCP.POOR}
        />
        <MetricRow
          label='TTFB'
          value={metrics.ttfb}
          unit='ms'
          good={WEB_VITALS_THRESHOLDS.TTFB.GOOD}
          poor={WEB_VITALS_THRESHOLDS.TTFB.POOR}
        />
      </div>

      {/* 性能评分 */}
      <div className='mt-2 border-t border-white/20 pt-2'>
        <div className='flex justify-between gap-4'>
          <span>Score:</span>
          <span className='font-semibold'>
            {Math.round(webVitalsMonitor.getPerformanceSummary().score)}/100
          </span>
        </div>
      </div>

      {/* 说明文字 */}
      <div className='mt-2 text-[10px] text-white/60'>
        Dev only • Updates every 3s
      </div>
    </div>
  );
}
