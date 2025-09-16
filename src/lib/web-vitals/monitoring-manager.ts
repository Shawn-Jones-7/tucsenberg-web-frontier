/**
 * 集成的性能监控管理器 - 统一导出入口
 * 统一管理所有性能监控功能
 */

// 导出核心类
export { PerformanceMonitoringManager } from '@/lib/web-vitals/monitoring-manager-core';

// 导出工具类
export { MonitoringUtils } from '@/lib/web-vitals/monitoring-utils';
export { MonitoringReportGenerator } from '@/lib/web-vitals/monitoring-report-generator';
