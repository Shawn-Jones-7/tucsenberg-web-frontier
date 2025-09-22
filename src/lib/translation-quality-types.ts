/**
 * 翻译质量相关类型定义
 * Translation Quality Type Definitions
 *
 * 提供翻译质量评估、基准测试和比较分析的类型定义
 */

import type { Locale } from '@/types/i18n';

/**
 * 质量基准数据接口
 * Quality benchmark data interface
 */
export interface QualityBenchmark {
  /** 语言代码 */
  locale: Locale;
  /** 平均质量分数 */
  averageScore: number;
  /** 基准测试日期 */
  benchmarkDate: string;
  /** 样本大小 */
  sampleSize: number;
  /** 分类评分 */
  categories: {
    /** 语法分数 */
    grammar: number;
    /** 一致性分数 */
    consistency: number;
    /** 术语分数 */
    terminology: number;
    /** 流畅性分数 */
    fluency: number;
  };
}

/**
 * 质量比较结果接口
 * Quality comparison result interface
 */
export interface QualityComparison {
  /** 当前分数 */
  current: QualityScore;
  /** 基准分数 */
  benchmark: QualityBenchmark;
  /** 改进百分比 */
  improvement: number;
  /** 改进建议 */
  recommendations: string[];
}

/**
 * 质量分数接口
 * Quality score interface
 */
export interface QualityScore {
  /** 总体分数 */
  score: number;
  /** 置信度 */
  confidence: number;
  /** 质量问题列表 */
  issues: QualityIssue[];
  /** 改进建议 */
  suggestions: string[];
  /** 语法分数 */
  grammar: number;
  /** 一致性分数 */
  consistency: number;
  /** 术语分数 */
  terminology: number;
  /** 流畅性分数 */
  fluency: number;
}

/**
 * 质量问题接口
 * Quality issue interface
 */
export interface QualityIssue {
  /** 问题类型 */
  type:
    | 'missing'
    | 'placeholder'
    | 'length'
    | 'grammar'
    | 'language'
    | 'context'
    | 'consistency'
    | 'terminology'
    | 'fluency';
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 问题描述 */
  message: string;
  /** 改进建议 */
  suggestion?: string;
  /** 相关位置 */
  position?: {
    start: number;
    end: number;
  };
}

/**
 * 批量翻译输入接口
 * Batch translation input interface
 */
export interface BatchTranslationInput {
  /** 翻译键 */
  key: string;
  /** 原文 */
  original: string;
  /** 翻译文本 */
  translated: string;
  /** 目标语言 */
  locale: Locale;
  /** 人工翻译参考（可选） */
  humanReference?: string;
}

/**
 * 质量报告接口
 * Quality report interface
 */
export interface QualityReport {
  /** 报告生成时间 */
  timestamp: string;
  /** 语言代码 */
  locale: Locale;
  /** 总体分数 */
  overallScore: number;
  /** 分类分数 */
  categoryScores: {
    grammar: number;
    consistency: number;
    terminology: number;
    fluency: number;
  };
  /** 问题统计 */
  issueStats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  /** 详细问题列表 */
  issues: QualityIssue[];
  /** 改进建议 */
  recommendations: string[];
}

/**
 * 质量阈值配置接口
 * Quality threshold configuration interface
 */
export interface QualityThresholds {
  /** 最小可接受分数 */
  minAcceptableScore: number;
  /** 优秀分数阈值 */
  excellentScore: number;
  /** 最大允许问题数 */
  maxIssues: number;
  /** 关键问题阈值 */
  criticalIssueThreshold: number;
}

/**
 * 质量权重配置接口
 * Quality weight configuration interface
 */
export interface QualityWeights {
  /** 语法权重 */
  grammar: number;
  /** 一致性权重 */
  consistency: number;
  /** 术语权重 */
  terminology: number;
  /** 流畅性权重 */
  fluency: number;
}

/**
 * 质量分析结果接口
 * Quality analysis result interface
 */
export interface QualityAnalysisResult {
  /** 分析ID */
  id: string;
  /** 分析时间 */
  timestamp: string;
  /** 输入数据 */
  input: BatchTranslationInput;
  /** 质量分数 */
  score: QualityScore;
  /** 与基准的比较 */
  comparison?: QualityComparison;
  /** 分析元数据 */
  metadata: {
    analyzer: string;
    version: string;
    duration: number;
  };
}

/**
 * 质量趋势数据接口
 * Quality trend data interface
 */
export interface QualityTrend {
  /** 语言代码 */
  locale: Locale;
  /** 时间范围 */
  timeRange: {
    start: string;
    end: string;
  };
  /** 数据点 */
  dataPoints: Array<{
    timestamp: string;
    score: number;
    issueCount: number;
  }>;
  /** 趋势统计 */
  statistics: {
    average: number;
    trend: 'improving' | 'declining' | 'stable';
    changeRate: number;
  };
}
