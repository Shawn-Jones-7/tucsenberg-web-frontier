/**
 * 增强的i18n类型定义
 * 提供具体的类型定义来替换any类型，提高类型安全性
 */
import React from 'react';
import type { Locale } from '@/types/i18n';

// ==================== 格式化相关类型 ====================

/** 格式化选项基础接口 */
export interface FormatOptions {
  /** 语言环境 */
  locale?: Locale;
  /** 时区 */
  timeZone?: string;
  /** 货币代码 */
  currency?: string;
  /** 数字格式样式 */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  /** 最小小数位数 */
  minimumFractionDigits?: number;
  /** 最大小数位数 */
  maximumFractionDigits?: number;
}

/** 日期格式化选项 */
export interface DateFormatOptions extends FormatOptions {
  /** 日期样式 */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  /** 时间样式 */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  /** 年份格式 */
  year?: 'numeric' | '2-digit';
  /** 月份格式 */
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  /** 日期格式 */
  day?: 'numeric' | '2-digit';
  /** 小时格式 */
  hour?: 'numeric' | '2-digit';
  /** 分钟格式 */
  minute?: 'numeric' | '2-digit';
  /** 秒格式 */
  second?: 'numeric' | '2-digit';
}

/** 数字格式化选项 */
export interface NumberFormatOptions extends FormatOptions {
  /** 符号显示 */
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
  /** 紧凑显示 */
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  /** 紧凑显示类型 */
  compactDisplay?: 'short' | 'long';
}

/** 相对时间格式化选项 */
export interface RelativeTimeFormatOptions {
  /** 语言环境 */
  locale?: Locale;
  /** 数字格式 */
  numeric?: 'always' | 'auto';
  /** 样式 */
  style?: 'long' | 'short' | 'narrow';
}

// ==================== 组件相关类型 ====================

/** React组件基础Props */
export interface BaseComponentProps {
  /** CSS类名 */
  'className'?: string;
  /** 内联样式 */
  'style'?: React.CSSProperties;
  /** 子元素 */
  'children'?: React.ReactNode;
  /** 测试ID */
  'data-testid'?: string;
}

/** 翻译回退组件Props */
export interface TranslationFallbackProps extends BaseComponentProps {
  /** 翻译键 */
  translationKey: string;
  /** 回退文本 */
  fallbackText?: string;
  /** 语言环境 */
  locale?: Locale;
  /** 错误处理函数 */
  onError?: (_error: Error, _translationKey: string) => void;
  /** 加载状态 */
  loading?: boolean;
  /** 重试函数 */
  onRetry?: () => void;
}

/** 语言检测演示组件Props */
export interface LocaleDetectionDemoProps extends BaseComponentProps {
  /** 初始语言 */
  initialLocale?: Locale;
  /** 检测结果回调 */
  onDetectionResult?: (_result: DetectionResult) => void;
  /** 是否显示详细信息 */
  showDetails?: boolean;
}

// ==================== 验证相关类型 ====================

/** 验证规则配置 */
export interface ValidationRuleConfig {
  /** 规则名称 */
  name: string;
  /** 是否启用 */
  enabled: boolean;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 权重 */
  weight: number;
  /** 自定义参数 */
  params?: Record<string, unknown>;
}

/** 验证上下文 */
export interface ValidationContext {
  /** 源语言 */
  sourceLocale: Locale;
  /** 目标语言 */
  targetLocale: Locale;
  /** 翻译键 */
  translationKey: string;
  /** 命名空间 */
  namespace?: string;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/** 验证结果详情 */
export interface ValidationResultDetail {
  /** 规则名称 */
  ruleName: string;
  /** 是否通过 */
  passed: boolean;
  /** 错误消息 */
  message?: string;
  /** 建议 */
  suggestion?: string;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 位置信息 */
  position?: {
    start: number;
    end: number;
  };
}

// ==================== 检测相关类型 ====================

/** 语言检测结果 */
export interface DetectionResult {
  /** 检测到的语言 */
  detectedLocale: Locale;
  /** 置信度 (0-1) */
  confidence: number;
  /** 检测方法 */
  method: 'browser' | 'geo' | 'user' | 'header' | 'cookie' | 'storage';
  /** 检测时间戳 */
  timestamp: number;
  /** 额外信息 */
  metadata?: {
    /** 浏览器语言列表 */
    browserLanguages?: string[];
    /** 地理位置信息 */
    geoLocation?: {
      country: string;
      region?: string;
    };
    /** 用户代理信息 */
    userAgent?: string;
  };
}

/** 检测配置 */
export interface DetectionConfig {
  /** 启用的检测方法 */
  enabledMethods: Array<
    'browser' | 'geo' | 'user' | 'header' | 'cookie' | 'storage'
  >;
  /** 方法权重 */
  methodWeights: Record<string, number>;
  /** 最小置信度阈值 */
  minConfidence: number;
  /** 回退语言 */
  fallbackLocale: Locale;
  /** 缓存配置 */
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

// ==================== 监控相关类型 ====================

/** 监控事件数据 */
export interface MonitoringEventData {
  /** 事件类型 */
  type: 'performance' | 'error' | 'user_action' | 'system';
  /** 事件名称 */
  name: string;
  /** 时间戳 */
  timestamp: number;
  /** 持续时间 (毫秒) */
  duration?: number;
  /** 事件属性 */
  properties: Record<string, string | number | boolean>;
  /** 标签 */
  tags?: Record<string, string>;
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId?: string;
}

/** 性能指标数据 */
export interface PerformanceMetricData {
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
  /** 单位 */
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  /** 时间戳 */
  timestamp: number;
  /** 标签 */
  tags?: Record<string, string>;
}

// ==================== 工具函数类型 ====================

/** 深度合并函数类型 */
export type DeepMergeFunction = <T extends Record<string, unknown>>(
  _target: T,
  ..._sources: Array<Partial<T>>
) => T;

/** 路径获取函数类型 */
export type PathGetterFunction = <T = unknown>(
  _obj: Record<string, unknown>,
  _path: string,
  _defaultValue?: T,
) => T;

/** 路径设置函数类型 */
export type PathSetterFunction = (
  _obj: Record<string, unknown>,
  _path: string,
  _value: unknown,
) => void;

/** 扁平化函数类型 */
export type FlattenFunction = (
  _obj: Record<string, unknown>,
  _prefix?: string,
  _separator?: string,
) => Record<string, string>;

// ==================== 错误类型 ====================

/** i18n错误基类 */
export interface I18nError extends Error {
  /** 错误代码 */
  code: string;
  /** 错误详情 */
  details?: Record<string, unknown>;
  /** 相关的翻译键 */
  translationKey?: string;
  /** 语言环境 */
  locale?: Locale;
}

/** 翻译加载错误 */
export interface TranslationLoadError extends I18nError {
  code: 'TRANSLATION_LOAD_ERROR';
  /** 加载的URL */
  url?: string;
  /** HTTP状态码 */
  statusCode?: number;
}

/** 翻译验证错误 */
export interface TranslationValidationError extends I18nError {
  code: 'TRANSLATION_VALIDATION_ERROR';
  /** 验证规则 */
  rule: string;
  /** 验证详情 */
  validationDetails: ValidationResultDetail[];
}
