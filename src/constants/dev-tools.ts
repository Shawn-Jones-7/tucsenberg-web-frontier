/**
 * 开发工具相关常量定义
 * 用于替换代码中的魔法数字，提高可维护性
 */

export const DEV_TOOLS_CONSTANTS = {
  // React Scan配置
  REACT_SCAN: {
    MAX_RENDERS: 100000,
    DEBOUNCE_DELAY: 300,
    GRID_COLUMNS: 4,
    GRID_ROWS: 2,
    SAMPLE_RATE: 5,
    EXPORT_INDENT: 2,
    NEGATIVE_OFFSET: -10,
    CHART_PRECISION: 10,
  },

  // 性能监控
  PERFORMANCE: {
    TIMEOUT: 5000,
    RETRY_COUNT: 3,
    SAMPLE_INTERVAL: 60,
    CACHE_DURATION: 60000,
    METRICS_LIMIT: 10,
    SCORE_MULTIPLIER: 2,
  },

  // UI布局
  LAYOUT: {
    SIDEBAR_WIDTH: 300,
    HEADER_HEIGHT: 50,
    GRID_GAP: 8,
    BORDER_RADIUS: 6,
    ANIMATION_DELAY: 2000,
    DEFAULT_OFFSET: 50, // 默认偏移量
  },

  // 诊断工具
  DIAGNOSTICS: {
    DIAGNOSTIC_DELAY: 300, // 诊断延迟时间
  },

  // 性能阈值
  THRESHOLDS: {
    BUNDLE_SIZE_MAIN: 50,
    BUNDLE_SIZE_FRAMEWORK: 130,
    BUNDLE_SIZE_CSS: 50,
    BUNDLE_SIZE_UNIT: 1024, // KB
  },
} as const;

export const CONFIG_CONSTANTS = {
  PLAYWRIGHT: {
    WORKERS: 2,
    RETRIES: 4,
    TIMEOUT: 120000,
    EXPECT_TIMEOUT: 30000,
    ACTION_TIMEOUT: 5000,
  },
} as const;

// 类型导出
export type DevToolsConstants = typeof DEV_TOOLS_CONSTANTS;
export type ConfigConstants = typeof CONFIG_CONSTANTS;
