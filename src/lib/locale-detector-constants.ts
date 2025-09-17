/**
 * 语言检测器常量定义
 *
 * 包含语言代码映射、地理位置映射、时区映射等常量定义
 */

import { DEC_0_4, MAGIC_0_1, MAGIC_0_3, MAGIC_0_6, MAGIC_0_7, MAGIC_0_8, MAGIC_0_95 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, HOURS_PER_DAY, ONE, SECONDS_PER_MINUTE, TEN_SECONDS_MS, THREE_SECONDS_MS } from "@/constants/magic-numbers";
import type { Locale } from '@/types/i18n';

// ==================== 语言代码映射常量 ====================

/**
 * 中文语言代码集合
 * Chinese language codes set
 */
export const CHINESE_LANGUAGE_CODES = new Set([
  'zh',
  'zh-cn',
  'zh-tw',
  'zh-hk',
  'zh-sg',
  'zh-hans',
  'zh-hant',
  'zh-chs',
  'zh-cht',
  'cmn',
  'yue',
]);

/**
 * 英文语言代码集合
 * English language codes set
 */
export const ENGLISH_LANGUAGE_CODES = new Set([
  'en',
  'en-us',
  'en-gb',
  'en-ca',
  'en-au',
  'en-nz',
  'en-ie',
  'en-za',
  'en-in',
  'en-ph',
  'en-my',
  'en-sg',
]);

/**
 * 语言代码到语言环境的映射
 * Language code to locale mapping
 */
export const LANGUAGE_CODE_TO_LOCALE_MAP = new Map<string, Locale>([
  // 中文变体
  ['zh', 'zh'],
  ['zh-cn', 'zh'],
  ['zh-tw', 'zh'],
  ['zh-hk', 'zh'],
  ['zh-sg', 'zh'],
  ['zh-hans', 'zh'],
  ['zh-hant', 'zh'],
  ['zh-chs', 'zh'],
  ['zh-cht', 'zh'],
  ['cmn', 'zh'],
  ['yue', 'zh'],

  // 英文变体
  ['en', 'en'],
  ['en-us', 'en'],
  ['en-gb', 'en'],
  ['en-ca', 'en'],
  ['en-au', 'en'],
  ['en-nz', 'en'],
  ['en-ie', 'en'],
  ['en-za', 'en'],
  ['en-in', 'en'],
  ['en-ph', 'en'],
  ['en-my', 'en'],
  ['en-sg', 'en'],
]);

// ==================== 地理位置映射常量 ====================

/**
 * 中文地区国家代码集合
 * Chinese region country codes set
 */
export const CHINESE_COUNTRY_CODES = new Set([
  'CN', // 中国大陆
  'TW', // 台湾
  'HK', // 香港
  'MO', // 澳门
  'SG', // 新加坡
  'MY', // 马来西亚
]);

/**
 * 英文地区国家代码集合
 * English region country codes set
 */
export const ENGLISH_COUNTRY_CODES = new Set([
  'US', // 美国
  'GB', // 英国
  'CA', // 加拿大
  'AU', // 澳大利亚
  'NZ', // 新西兰
  'IE', // 爱尔兰
  'ZA', // 南非
  'IN', // 印度
  'PH', // 菲律宾
  'NG', // 尼日利亚
  'KE', // 肯尼亚
  'GH', // 加纳
]);

/**
 * 国家代码到语言环境的映射
 * Country code to locale mapping
 */
export const COUNTRY_CODE_TO_LOCALE_MAP = new Map<string, Locale>([
  // 中文地区
  ['CN', 'zh'],
  ['TW', 'zh'],
  ['HK', 'zh'],
  ['MO', 'zh'],
  ['SG', 'zh'],
  ['MY', 'zh'],

  // 英文地区
  ['US', 'en'],
  ['GB', 'en'],
  ['CA', 'en'],
  ['AU', 'en'],
  ['NZ', 'en'],
  ['IE', 'en'],
  ['ZA', 'en'],
  ['IN', 'en'],
  ['PH', 'en'],
  ['NG', 'en'],
  ['KE', 'en'],
  ['GH', 'en'],
]);

// ==================== 时区映射常量 ====================

/**
 * 中文时区集合
 * Chinese timezone set
 */
export const CHINESE_TIME_ZONES = new Set([
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Macau',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Chongqing',
  'Asia/Harbin',
  'Asia/Urumqi',
]);

/**
 * 英文时区集合
 * English timezone set
 */
export const ENGLISH_TIME_ZONES = new Set([
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Dublin',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Brisbane',
  'Pacific/Auckland',
  'Africa/Johannesburg',
  'Asia/Kolkata',
  'Asia/Manila',
]);

/**
 * 时区到语言环境的映射
 * Timezone to locale mapping
 */
export const TIMEZONE_TO_LOCALE_MAP = new Map<string, Locale>([
  // 中文时区
  ['Asia/Shanghai', 'zh'],
  ['Asia/Hong_Kong', 'zh'],
  ['Asia/Taipei', 'zh'],
  ['Asia/Macau', 'zh'],
  ['Asia/Singapore', 'zh'],
  ['Asia/Kuala_Lumpur', 'zh'],
  ['Asia/Chongqing', 'zh'],
  ['Asia/Harbin', 'zh'],
  ['Asia/Urumqi', 'zh'],

  // 英文时区
  ['America/New_York', 'en'],
  ['America/Los_Angeles', 'en'],
  ['America/Chicago', 'en'],
  ['America/Denver', 'en'],
  ['America/Phoenix', 'en'],
  ['America/Anchorage', 'en'],
  ['America/Honolulu', 'en'],
  ['America/Toronto', 'en'],
  ['America/Vancouver', 'en'],
  ['Europe/London', 'en'],
  ['Europe/Dublin', 'en'],
  ['Australia/Sydney', 'en'],
  ['Australia/Melbourne', 'en'],
  ['Australia/Perth', 'en'],
  ['Australia/Brisbane', 'en'],
  ['Pacific/Auckland', 'en'],
  ['Africa/Johannesburg', 'en'],
  ['Asia/Kolkata', 'en'],
  ['Asia/Manila', 'en'],
]);

// ==================== 检测配置常量 ====================

/**
 * 检测超时配置
 * Detection timeout configuration
 */
export const DETECTION_TIMEOUTS = {
  GEOLOCATION: 5000, // 地理位置检测超时 (毫秒)
  NETWORK_REQUEST: THREE_SECONDS_MS, // 网络请求超时 (毫秒)
  TOTAL_DETECTION: TEN_SECONDS_MS, // 总检测超时 (毫秒)
} as const;

/**
 * 置信度权重配置
 * Confidence weight configuration
 */
export const CONFIDENCE_WEIGHTS = {
  USER_OVERRIDE: ONE, // 用户手动设置
  STORED_PREFERENCE: MAGIC_0_95, // 存储的用户偏好
  GEOLOCATION: 0.8, // 地理位置检测
  BROWSER_LANGUAGE: MAGIC_0_7, // 浏览器语言
  TIMEZONE: MAGIC_0_6, // 时区检测
  DEFAULT_FALLBACK: MAGIC_0_3, // 默认回退
} as const;

/**
 * 检测源类型
 * Detection source types
 */
export const DETECTION_SOURCES = {
  USER: 'user',
  STORED: 'stored',
  GEO: 'geo',
  BROWSER: 'browser',
  TIMEZONE: 'timezone',
  COMBINED: 'combined',
  DEFAULT: 'default',
} as const;

export type DetectionSource =
  (typeof DETECTION_SOURCES)[keyof typeof DETECTION_SOURCES];

/**
 * 地理位置API配置
 * Geolocation API configuration
 */
export const GEO_API_CONFIG = {
  // 示例API端点 (生产环境应使用真实的地理位置服务)
  ENDPOINTS: [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://ipinfo.io/json',
  ],
  FALLBACK_ENDPOINT: 'https://httpbin.org/ip',
  MAX_RETRIES: COUNT_PAIR,
  CACHE_DURATION: HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 24小时缓存
} as const;

/**
 * 检测质量阈值
 * Detection quality thresholds
 */
export const QUALITY_THRESHOLDS = {
  HIGH_CONFIDENCE: MAGIC_0_8, // 高置信度阈值
  MEDIUM_CONFIDENCE: MAGIC_0_6, // 中等置信度阈值
  LOW_CONFIDENCE: DEC_0_4, // 低置信度阈值
  CONSISTENCY_BONUS: MAGIC_0_1, // 一致性奖励
  MIN_SOURCES_FOR_COMBINED: COUNT_PAIR, // 组合检测的最小源数量
} as const;
