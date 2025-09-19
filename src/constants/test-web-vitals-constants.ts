import {
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  SECONDS_PER_MINUTE,
} from '@/constants';

/**
 * Web Vitals 测试常量定义
 * 专门用于性能监控和Web Vitals相关的测试
 */

/** Web Vitals 阈值常量 */
export const WEB_VITALS_CONSTANTS = {
  // Core Web Vitals 阈值
  /** CLS 良好阈值 - 0.1 */
  CLS_GOOD_THRESHOLD: 0.1,

  /** CLS 需要改进阈值 - 0.25 */
  CLS_NEEDS_IMPROVEMENT_THRESHOLD: 0.25,

  /** CLS 警告变化 - 0.05 */
  CLS_WARNING_CHANGE: 0.05,

  /** CLS 严重变化 - 0.1 */
  CLS_CRITICAL_CHANGE: 0.1,

  /** FID 良好阈值 - 100ms */
  FID_GOOD_THRESHOLD: 100,

  /** FID 需要改进阈值 - 300ms */
  FID_NEEDS_IMPROVEMENT_THRESHOLD: 300,

  /** FCP 良好阈值 - 1800ms */
  FCP_GOOD_THRESHOLD: 1800,

  /** FCP 需要改进阈值 - 3000ms */
  FCP_NEEDS_IMPROVEMENT_THRESHOLD: 3000,

  /** LCP 良好阈值 - 2500ms */
  LCP_GOOD_THRESHOLD: 2500,

  /** LCP 需要改进阈值 - 4000ms */
  LCP_NEEDS_IMPROVEMENT_THRESHOLD: 4000,

  /** TTFB 良好阈值 - 800ms */
  TTFB_GOOD_THRESHOLD: 800,

  /** TTFB 需要改进阈值 - 1800ms */
  TTFB_NEEDS_IMPROVEMENT_THRESHOLD: 1800,

  // 时间单位
  /** 毫秒每秒 - 1000 */
  MILLISECONDS_PER_SECOND: 1000,

  /** 秒每分钟 - 60 */
  SECONDS_PER_MINUTE: 60,

  /** 分钟每小时 - 60 */
  MINUTES_PER_HOUR: 60,

  /** 小时每天 - 24 */
  HOURS_PER_DAY: 24,

  // 基准管理
  /** 最大基准数量 - 50 */
  MAX_BASELINES: 50,

  /** 基准最大年龄（天）- 30 */
  BASELINE_MAX_AGE_DAYS: 30,

  /** 基准保存延迟 - 5000ms */
  BASELINE_SAVE_DELAY: 5000,

  // ID生成
  /** 哈希基数 - 36 */
  HASH_BASE: 36,

  /** ID截取开始位置 - 2 */
  ID_SUBSTR_START: 2,

  /** ID随机长度 - 9 */
  ID_RANDOM_LENGTH: 9,

  // 报告
  /** 报告项目限制 - 50 */
  REPORT_ITEM_LIMIT: 50,

  // ==================== 测试时间常量 ====================

  /** 测试获取开始时间 - 100ms */
  TEST_FETCH_START: 100,

  /** 测试域名查找结束时间 - 150ms */
  TEST_DOMAIN_LOOKUP_END: 150,

  /** 测试连接开始时间 - 200ms */
  TEST_CONNECT_START: 200,

  /** 测试连接结束时间 - 250ms */
  TEST_CONNECT_END: 250,

  /** 测试请求开始时间 - 300ms */
  TEST_REQUEST_START: 300,

  /** 测试响应开始时间 - 400ms */
  TEST_RESPONSE_START: 400,

  /** 测试响应结束时间 - 500ms */
  TEST_RESPONSE_END: 500,

  /** 测试DOM交互时间 - 600ms */
  TEST_DOM_INTERACTIVE: 600,

  /** 测试DOM内容加载开始时间 - 700ms */
  TEST_DOM_CONTENT_LOADED_START: 700,

  /** 测试DOM内容加载结束时间 - 750ms */
  TEST_DOM_CONTENT_LOADED_END: 750,

  /** 测试DOM完成时间 - 800ms */
  TEST_DOM_COMPLETE: 800,

  /** 测试加载事件结束时间 - 900ms */
  TEST_LOAD_EVENT_END: 900,

  // ==================== 网络测试常量 ====================

  /** 测试下行速度 - 4 Mbps */
  TEST_DOWNLINK_SPEED: 4,

  /** 测试RTT延迟 - 50ms */
  TEST_RTT_LATENCY: 50,

  // ==================== 资源监控常量 ====================

  /** 慢资源阈值 - 1000ms */
  SLOW_RESOURCE_THRESHOLD: 1000,

  /** 最大慢资源数量 - 10 */
  MAX_SLOW_RESOURCES: 10,

  // ==================== 评分权重常量 ====================

  /** 评分权重四分之一 - 0.25 */
  SCORE_WEIGHT_QUARTER: 0.25,

  /** 良好评分乘数 - 30 */
  SCORE_MULTIPLIER_GOOD: 30,

  /** 需要改进评分乘数 - 15 */
  SCORE_MULTIPLIER_NEEDS_IMPROVEMENT: 15,

  /** 较差评分乘数 - 5 */
  SCORE_MULTIPLIER_POOR: 5,

  // ==================== 测试计时器常量 ====================

  /** 测试计时器推进 - 1000ms */
  TEST_TIMER_ADVANCE: 1000,

  /** 测试长超时 - 5000ms */
  TEST_TIMEOUT_LONG: 5000,

  // ==================== 缓存测试常量 ====================

  /** 缓存大小2 - 2 */
  CACHE_SIZE_TWO: 2,

  /** 缓存命中率一半 - 0.5 */
  CACHE_HIT_RATE_HALF: 0.5,

  // ==================== 置信度阈值常量 ====================

  /** 中等置信度阈值 - 0.7 */
  CONFIDENCE_THRESHOLD_MEDIUM: 0.7,

  /** 高置信度阈值 - 0.9 */
  CONFIDENCE_THRESHOLD_HIGH: 0.9,

  // ==================== 性能分数常量 ====================

  /** 完美分数 - 100 */
  PERFECT_SCORE: 100,

  /** 性能样本大小 - 50 */
  PERFORMANCE_SAMPLE_SIZE: 50,

  /** 优秀分数阈值 - 90 */
  SCORE_EXCELLENT_THRESHOLD: 90,

  /** 测试良好分数阈值 - 80 */
  TEST_SCORE_THRESHOLD_GOOD: 80,

  /** 平均分数阈值 - 60 */
  SCORE_AVERAGE_THRESHOLD: 60,

  // ==================== 小数位数常量 ====================

  /** 小数位数1 - 1 */
  DECIMAL_PLACES_ONE: 1,

  /** 小数位数2 - 2 */
  DECIMAL_PLACES_TWO: 2,

  /** 小数位数3 - 3 */
  DECIMAL_PLACES_THREE: 3,

  // ==================== 转换常量 ====================

  /** 字节转KB除数 - 1024 */
  BYTES_TO_KB_DIVISOR: 1024,

  // ==================== 报告历史常量 ====================

  /** 报告历史限制 - 50 */
  REPORT_HISTORY_LIMIT: 50,

  // ==================== 性能阈值常量 ====================

  /** 性能阈值常量 */
  PERFORMANCE_THRESHOLDS: {
    /** LCP良好阈值 - 2500ms */
    LCP: 2500,
    /** FID良好阈值 - 100ms */
    FID: 100,
    /** CLS良好阈值 - 0.1 */
    CLS: 0.1,
    /** FCP良好阈值 - 1800ms */
    FCP: 1800,
    /** TTFB良好阈值 - 800ms */
    TTFB: 800,
  },

  // ==================== 百分比变化常量 ====================

  /** 百分比变化警告 - 10 */
  PERCENT_CHANGE_WARNING: 10,

  /** 百分比变化严重 - 25 */
  PERCENT_CHANGE_CRITICAL: 25,

  // ==================== TTFB变化常量 ====================

  /** TTFB警告变化 - 200ms */
  TTFB_WARNING_CHANGE: 200,

  /** TTFB严重变化 - 400ms */
  TTFB_CRITICAL_CHANGE: 400,

  // ==================== 其他Web Vitals变化常量 ====================

  /** FID警告变化 - 50ms */
  FID_WARNING_CHANGE: 50,

  /** FID严重变化 - 100ms */
  FID_CRITICAL_CHANGE: 100,

  /** LCP警告变化 - 500ms */
  LCP_WARNING_CHANGE: 500,

  /** LCP严重变化 - 1000ms */
  LCP_CRITICAL_CHANGE: 1000,

  /** FCP警告变化 - 300ms */
  FCP_WARNING_CHANGE: 300,

  /** FCP严重变化 - 600ms */
  FCP_CRITICAL_CHANGE: 600,

  // ==================== 时间计算常量 ====================

  /** 每月天数 - 30 */
  DAYS_PER_MONTH: 30,

  /** 每天毫秒数 - 86400000ms */
  MILLISECONDS_PER_DAY: 86400000,

  // ==================== 测试百分比常量 ====================

  /** 测试百分比50 - 50 */
  TEST_PERCENTAGE_FIFTY: 50,

  // ==================== 测试计数常量 ====================

  /** 测试计数2 - 2 */
  TEST_COUNT_TWO: 2,

  /** 测试警报历史限制 - 100 */
  TEST_ALERT_HISTORY_LIMIT: 100,

  /** 测试分数阈值差 - 30 */
  TEST_SCORE_THRESHOLD_POOR: 30,

  // ==================== 设备和网络常量 ====================

  /** 设备内存 - 8GB */
  DEVICE_MEMORY: 8,

  /** 网络下行速度 - 4 Mbps */
  NETWORK_DOWNLINK: 4,

  /** 慢资源持续时间 - 1500ms */
  SLOW_RESOURCE_DURATION: 1500,

  // ==================== 资源惩罚常量 ====================

  /** 最大慢资源惩罚 - 10 */
  MAX_SLOW_RESOURCES_PENALTY: 10,

  /** 慢资源惩罚 - 5 */
  SLOW_RESOURCE_PENALTY: 5,

  // ==================== 基线刷新常量 ====================

  /** 基线刷新小时数 - 24 */
  BASELINE_REFRESH_HOURS: 24,

  // ==================== 评分等级阈值 ====================

  /** A级阈值 - 90 */
  GRADE_A_THRESHOLD: 90,

  /** B级阈值 - 80 */
  GRADE_B_THRESHOLD: 80,

  /** C级阈值 - 70 */
  GRADE_C_THRESHOLD: 70,

  /** D级阈值 - 60 */
  GRADE_D_THRESHOLD: 60,
} as const;

/** Web Vitals 诊断常量 */
export const TEST_WEB_VITALS_DIAGNOSTICS = {
  /** 诊断超时 - 5000ms */
  TIMEOUT: 5000,

  /** 最大重试次数 - 3 */
  MAX_RETRIES: 3,

  /** 重试延迟 - 1000ms */
  RETRY_DELAY: 1000,

  /** 采样率 - 0.1 (10%) */
  SAMPLING_RATE: 0.1,

  /** 缓冲区大小 - 100 */
  BUFFER_SIZE: 100,

  /** 批处理大小 - 10 */
  BATCH_SIZE: 10,

  /** 刷新间隔 - 30000ms (30秒) */
  FLUSH_INTERVAL: 30000,

  /** 最大队列大小 - 1000 */
  MAX_QUEUE_SIZE: 1000,

  /** 压缩阈值 - 1024字节 */
  COMPRESSION_THRESHOLD: 1024,

  /** 最大有效负载大小 - 64KB */
  MAX_PAYLOAD_SIZE: 65536,

  // ==================== Web Vitals 基线常量 ====================

  /** CLS基线值 - 0.1 */
  CLS_BASELINE: 0.1,

  /** LCP基线值 - 2500ms */
  LCP_BASELINE: 2500,

  /** FID基线值 - 100ms */
  FID_BASELINE: 100,

  /** INP基线值 - 200ms */
  INP_BASELINE: 200,

  /** TTFB基线值 - 800ms */
  TTFB_BASELINE: 800,

  /** FCP基线值 - 1800ms */
  FCP_BASELINE: 1800,

  // ==================== 网络和设备诊断常量 ====================

  /** 网络下行速度 - 4 Mbps */
  NETWORK_DOWNLINK: 4,

  /** 网络RTT - 50ms */
  NETWORK_RTT: 50,

  /** 设备内存 - 8GB */
  DEVICE_MEMORY: 8,

  /** 性能分数 - 85 */
  PERFORMANCE_SCORE: 85,

  /** 历史时间偏移 - 86400000ms (24小时) */
  HISTORICAL_TIME_OFFSET: 86400000,

  // ==================== Web Vitals 增量常量 ====================

  /** CLS增量 - 0.05 */
  CLS_INCREMENT: 0.05,

  /** LCP增量 - 500ms */
  LCP_INCREMENT: 500,

  /** FID增量 - 50ms */
  FID_INCREMENT: 50,
} as const;
