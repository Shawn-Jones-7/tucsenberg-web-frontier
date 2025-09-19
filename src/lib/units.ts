/**
 * 单位转换工具库
 *
 * 用于替代硬编码的时间、尺寸、百分比等数值常量
 * 提供语义化的单位转换函数，提升代码可读性
 *
 * @example
 * ```typescript
 * // 时间相关
 * setTimeout(callback, seconds(5)); // 替代 5000
 * setInterval(poll, minutes(2));    // 替代 120000
 *
 * // 百分比相关
 * opacity: percent(85);             // 替代 0.85
 * width: `${percent(50) * 100}%`;   // 替代 50
 *
 * // 尺寸相关
 * padding: pixels(16);              // 替代 16
 * margin: rem(2);                   // 替代 2
 * ```
 */

// ============================================================================
// 时间单位转换
// ============================================================================

/**
 * 将秒转换为毫秒
 * @param seconds 秒数
 * @returns 毫秒数
 *
 * @example
 * ```typescript
 * setTimeout(callback, seconds(5));     // 5000ms
 * delay(seconds(2.5));                  // 2500ms
 * ```
 */
export const seconds = (value: number): number => value * 1000;

/**
 * 将分钟转换为毫秒
 * @param minutes 分钟数
 * @returns 毫秒数
 *
 * @example
 * ```typescript
 * setInterval(poll, minutes(2));        // 120000ms
 * setTimeout(cleanup, minutes(0.5));    // 30000ms
 * ```
 */
export const minutes = (value: number): number => value * (60 * 1000);

/**
 * 将小时转换为毫秒
 * @param hours 小时数
 * @returns 毫秒数
 *
 * @example
 * ```typescript
 * const cacheExpiry = hours(24);        // 86400000ms
 * const sessionTimeout = hours(2);      // 7200000ms
 * ```
 */
export const hours = (value: number): number => value * (60 * 60 * 1000);

/**
 * 将天转换为毫秒
 * @param days 天数
 * @returns 毫秒数
 *
 * @example
 * ```typescript
 * const weekInMs = days(7);             // 604800000ms
 * const monthInMs = days(30);           // 2592000000ms
 * ```
 */
export const days = (value: number): number => value * (24 * 60 * 60 * 1000);

// ============================================================================
// 百分比和比例转换
// ============================================================================

/**
 * 将百分比转换为小数（0-1之间）
 * @param percentage 百分比数值（0-100）
 * @returns 小数值（0-1）
 *
 * @example
 * ```typescript
 * opacity: percent(85);                 // 0.85
 * transform: `scale(${percent(120)})`;  // 1.2
 * ```
 */
export const percent = (percentage: number): number => percentage / 100;

/**
 * 将小数转换为百分比
 * @param decimal 小数值（0-1）
 * @returns 百分比数值（0-100）
 *
 * @example
 * ```typescript
 * const progress = toPercent(0.75);     // 75
 * const completion = toPercent(0.95);   // 95
 * ```
 */
export const toPercent = (decimal: number): number => decimal * 100;

/**
 * 将分数转换为小数
 * @param numerator 分子
 * @param denominator 分母
 * @returns 小数值
 *
 * @example
 * ```typescript
 * const ratio = fraction(3, 4);         // 0.75
 * const portion = fraction(1, 3);       // 0.333...
 * ```
 */
export const fraction = (numerator: number, denominator: number): number =>
  numerator / denominator;

// ============================================================================
// 尺寸单位转换
// ============================================================================

/**
 * 像素值（语义化标识）
 * @param px 像素数值
 * @returns 像素数值（原样返回，用于语义标识）
 *
 * @example
 * ```typescript
 * padding: pixels(16);                  // 16
 * margin: pixels(8);                    // 8
 * ```
 */
export const pixels = (value: number): number => value;

/**
 * rem单位值（语义化标识）
 * @param rem rem数值
 * @returns rem数值（原样返回，用于语义标识）
 *
 * @example
 * ```typescript
 * fontSize: rem(1.5);                   // 1.5
 * lineHeight: rem(1.2);                 // 1.2
 * ```
 */
export const rem = (value: number): number => value;

/**
 * em单位值（语义化标识）
 * @param em em数值
 * @returns em数值（原样返回，用于语义标识）
 *
 * @example
 * ```typescript
 * padding: em(0.5);                     // 0.5
 * margin: em(1);                        // 1
 * ```
 */
export const em = (value: number): number => value;

// ============================================================================
// 角度单位转换
// ============================================================================

/**
 * 角度值（语义化标识）
 * @param degrees 角度数值
 * @returns 角度数值（原样返回，用于语义标识）
 *
 * @example
 * ```typescript
 * transform: `rotate(${degrees(45)}deg)`;   // rotate(45deg)
 * transform: `rotate(${degrees(90)}deg)`;   // rotate(90deg)
 * ```
 */
export const degrees = (value: number): number => value;

/**
 * 弧度转角度
 * @param radians 弧度值
 * @returns 角度值
 *
 * @example
 * ```typescript
 * const angle = radiansToDegrees(Math.PI);  // 180
 * const rotation = radiansToDegrees(Math.PI / 2); // 90
 * ```
 */
export const radiansToDegrees = (value: number): number =>
  value * (360 / 2 / Math.PI);

/**
 * 角度转弧度
 * @param degrees 角度值
 * @returns 弧度值
 *
 * @example
 * ```typescript
 * const radians = degreesToRadians(180);    // Math.PI
 * const halfPi = degreesToRadians(90);      // Math.PI / 2
 * ```
 */
export const degreesToRadians = (value: number): number =>
  value * (Math.PI / (360 / 2));

// ============================================================================
// 数据大小单位转换
// ============================================================================

/**
 * 字节值（语义化标识）
 * @param bytes 字节数
 * @returns 字节数（原样返回，用于语义标识）
 */
export const bytes = (value: number): number => value;

/**
 * KB转字节
 * @param kb KB数值
 * @returns 字节数
 */
export const kilobytes = (value: number): number => value * 1024;

/**
 * MB转字节
 * @param mb MB数值
 * @returns 字节数
 */
export const megabytes = (value: number): number => value * (1024 * 1024);

/**
 * GB转字节
 * @param gb GB数值
 * @returns 字节数
 */
export const gigabytes = (value: number): number =>
  value * (1024 * 1024 * 1024);

// ============================================================================
// 常用数学常量和比例
// ============================================================================

/**
 * 黄金比例
 */
export const GOLDEN_RATIO = 1.618033988749;

/**
 * 常用比例
 */
export const RATIOS = {
  /** 1:1 正方形比例 */
  SQUARE: 1,
  /** 4:3 传统屏幕比例 */
  TRADITIONAL: 4 / 3,
  /** 16:9 宽屏比例 */
  WIDESCREEN: 16 / 9,
  /** 21:9 超宽屏比例 */
  ULTRAWIDE: (7 * 3) / 9,
  /** 黄金比例 */
  GOLDEN: GOLDEN_RATIO,
} as const;

/**
 * 常用透明度值
 */
export const OPACITY = {
  /** 完全透明 */
  TRANSPARENT: 0,
  /** 几乎透明 */
  BARELY_VISIBLE: percent(5),
  /** 轻微透明 */
  LIGHT: percent(25),
  /** 半透明 */
  SEMI: percent(50),
  /** 大部分不透明 */
  MOSTLY_OPAQUE: percent(75),
  /** 几乎不透明 */
  NEARLY_OPAQUE: percent(95),
  /** 完全不透明 */
  OPAQUE: 1,
} as const;

/**
 * 常用动画持续时间（毫秒）
 */
export const DURATION = {
  /** 极快动画 */
  INSTANT: 0,
  /** 快速动画 */
  FAST: 150,
  /** 正常动画 */
  NORMAL: 300,
  /** 慢速动画 */
  SLOW: 500,
  /** 很慢动画 */
  VERY_SLOW: 1000,
} as const;

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 时间单位类型
 */
export type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd';

/**
 * 尺寸单位类型
 */
export type SizeUnit = 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw';

/**
 * 角度单位类型
 */
export type AngleUnit = 'deg' | 'rad' | 'grad' | 'turn';

/**
 * 数据大小单位类型
 */
export type DataSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';
