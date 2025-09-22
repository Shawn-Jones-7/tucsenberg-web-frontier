/**
 * 翻译性能基准测试管理类
 * Translation Performance Benchmarks Management
 *
 * 提供翻译质量基准数据管理、比较分析和性能评估功能
 */

import type { Locale } from '@/types/i18n';
import type { QualityBenchmark } from '@/lib/translation-quality-types';

/**
 * 翻译基准测试管理器
 * 负责管理各语言的翻译质量基准数据
 */
export class TranslationBenchmarks {
  private benchmarks: Map<Locale, QualityBenchmark> = new Map();

  /**
   * 初始化默认基准数据
   * Initialize default benchmark data
   */
  public initialize(): void {
    // 英语基准数据
    const englishBenchmark: QualityBenchmark = {
      locale: 'en' as Locale,
      averageScore: 85,
      benchmarkDate: '2024-01-01',
      sampleSize: 1000,
      categories: {
        grammar: 88,
        consistency: 82,
        terminology: 85,
        fluency: 87,
      },
    };

    // 中文基准数据
    const chineseBenchmark: QualityBenchmark = {
      locale: 'zh' as Locale,
      averageScore: 82,
      benchmarkDate: '2024-01-01',
      sampleSize: 800,
      categories: {
        grammar: 85,
        consistency: 80,
        terminology: 83,
        fluency: 84,
      },
    };

    this.benchmarks.set('en' as Locale, englishBenchmark);
    this.benchmarks.set('zh' as Locale, chineseBenchmark);
  }

  /**
   * 设置特定语言的基准数据
   * Set benchmark data for specific locale
   */
  public setBenchmark(locale: Locale, benchmark: QualityBenchmark): void {
    this.benchmarks.set(locale, benchmark);
  }

  /**
   * 获取特定语言的基准数据
   * Get benchmark data for specific locale
   */
  public getBenchmark(locale: Locale): QualityBenchmark | undefined {
    return this.benchmarks.get(locale);
  }

  /**
   * 与基准数据进行比较分析
   * Compare current score with benchmark data
   */
  public compareWithBenchmark(
    currentScore: {
      score: number;
      confidence: number;
      issues: unknown[];
      suggestions: unknown[];
      grammar: number;
      consistency: number;
      terminology: number;
      fluency: number;
    },
    locale: Locale,
  ): {
    current: typeof currentScore;
    benchmark: QualityBenchmark;
    improvement: number;
    recommendations: string[];
  } {
    const benchmark = this.getBenchmark(locale);

    if (!benchmark) {
      throw new Error(`No benchmark available for locale: ${locale}`);
    }

    // 计算改进百分比
    const improvement =
      ((currentScore.score - benchmark.averageScore) / benchmark.averageScore) *
      100;

    // 生成建议
    const recommendations: string[] = [];

    // 根据总体改进情况生成建议
    if (improvement > 10) {
      recommendations.push('Excellent quality! Above benchmark standards.');
    } else if (improvement < -10) {
      recommendations.push(
        'Overall quality is significantly below benchmark. Consider comprehensive review.',
      );
    } else if (improvement < 0) {
      recommendations.push(
        'Quality is below benchmark. Focus on identified issues.',
      );
    }

    // 生成具体分类建议
    if (currentScore.grammar < benchmark.categories.grammar) {
      recommendations.push(
        'Grammar score below benchmark. Review grammatical accuracy.',
      );
    }

    if (currentScore.consistency < benchmark.categories.consistency) {
      recommendations.push(
        'Consistency score below benchmark. Ensure terminology consistency.',
      );
    }

    if (currentScore.terminology < benchmark.categories.terminology) {
      recommendations.push(
        'Terminology score below benchmark. Review domain-specific terms.',
      );
    }

    if (currentScore.fluency < benchmark.categories.fluency) {
      recommendations.push(
        'Fluency score below benchmark. Improve natural language flow.',
      );
    }

    return {
      current: currentScore,
      benchmark,
      improvement,
      recommendations,
    };
  }

  /**
   * 获取所有已加载的基准数据
   * Get all loaded benchmark data
   */
  public getAllBenchmarks(): Map<Locale, QualityBenchmark> {
    return new Map(this.benchmarks);
  }

  /**
   * 清除所有基准数据
   * Clear all benchmark data
   */
  public clear(): void {
    this.benchmarks.clear();
  }

  /**
   * 检查是否存在特定语言的基准数据
   * Check if benchmark exists for specific locale
   */
  public hasBenchmark(locale: Locale): boolean {
    return this.benchmarks.has(locale);
  }
}
