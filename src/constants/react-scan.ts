/**
 * React Scan 相关常量
 * 用于 React Scan 开发工具的配置和性能监控
 */

// React Scan 配置常量
export const REACT_SCAN_CONFIG = {
  // 性能监控阈值
  RENDER_WARNING_THRESHOLD: 5, // 渲染次数警告阈值
  NOTIFICATION_FADE_DURATION: 300, // 通知淡出动画时长 (ms)
  NOTIFICATION_DISPLAY_DURATION: 3000, // 通知显示时长 (ms)

  // 演示相关常量
  EXPENSIVE_CALCULATION_ITERATIONS: 100000, // 昂贵计算的迭代次数
  STATS_UPDATE_INTERVAL: 500, // 统计数据更新间隔 (ms)
  LARGE_ITEMS_WARNING_THRESHOLD: 50, // 大量项目性能警告阈值

  // React Scan 功能配置
  enabled: true, // 是否启用 React Scan
  showOverlay: true, // 是否显示覆盖层
  trackRenders: true, // 是否跟踪渲染
  logToConsole: false, // 是否输出到控制台
} as const;

// 邮箱验证常量
export const EMAIL_VALIDATION = {
  // RFC 5321 标准限制
  LOCAL_PART_MAX_LENGTH: 64, // 邮箱本地部分最大长度
  DOMAIN_PART_MAX_LENGTH: 255, // 邮箱域名部分最大长度
  EMAIL_PARTS_COUNT: 2, // 邮箱应该包含的部分数量（本地部分@域名部分）
} as const;
