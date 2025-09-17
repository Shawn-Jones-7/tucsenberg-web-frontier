/**
 * 智能语言检测算法
 *
 * 提供综合检测逻辑、置信度计算、结果分析等智能检测功能
 */

import { DEC_0_05, MAGIC_0_1, MAGIC_0_8 } from "@/constants/decimal";
import { ONE, ZERO } from "@/constants/magic-numbers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/locale-constants';
import type { LocaleDetectionResult } from '@/lib/locale-detection-types';
import { BaseLocaleDetector } from '@/lib/locale-detector-base';
import type { DetectionSource } from '@/lib/locale-detector-constants';
import { LocaleStorageManager } from '@/lib/locale-storage';
import { logger } from '@/lib/logger';
import type { Locale } from '@/types/i18n';
import {
  CONFIDENCE_WEIGHTS,
  DETECTION_SOURCES,
  QUALITY_THRESHOLDS,
} from './locale-detector-constants';

/**
 * 检测结果接口
 * Detection result interface
 */
interface DetectionResult {
  locale: Locale;
  source: DetectionSource;
  weight: number;
  confidence: number;
}

/**
 * 智能语言检测器
 * Smart locale detector with advanced algorithms
 */
export class SmartLocaleDetector extends BaseLocaleDetector {
  /**
   * 智能检测用户语言偏好
   * Smart detection of user locale preference
   */
  async detectSmartLocale(): Promise<LocaleDetectionResult> {
    // 1. 检查用户手动设置 (最高优先级)
    const userOverride = LocaleStorageManager.getUserOverride();
    if (userOverride && SUPPORTED_LOCALES.includes(userOverride)) {
      return {
        locale: userOverride,
        source: DETECTION_SOURCES.USER,
        confidence: CONFIDENCE_WEIGHTS.USER_OVERRIDE,
        details: { userOverride },
      };
    }

    // 2. 检查存储的用户偏好
    const userPreference = LocaleStorageManager.getUserPreference();
    if (userPreference && SUPPORTED_LOCALES.includes(userPreference.locale)) {
      return {
        locale: userPreference.locale,
        source: DETECTION_SOURCES.STORED,
        confidence:
          userPreference.confidence || CONFIDENCE_WEIGHTS.STORED_PREFERENCE,
        details: { userOverride: userPreference.locale },
      };
    }

    // 3. 收集所有检测结果
    const detectionResults = await this.collectAllDetectionResults();

    // 4. 如果没有任何检测结果，返回默认语言
    if (detectionResults.length === ZERO) {
      return {
        locale: DEFAULT_LOCALE,
        source: DETECTION_SOURCES.DEFAULT,
        confidence: CONFIDENCE_WEIGHTS.DEFAULT_FALLBACK,
        details: { fallbackUsed: true },
      };
    }

    // 5. 分析检测结果并选择最佳语言
    const bestResult = this.analyzeBestLocale(detectionResults);

    return bestResult;
  }

  /**
   * 检测最佳语言偏好 (兼容方法名)
   * Detect best locale preference (compatibility method)
   */
  async detectBestLocale(): Promise<LocaleDetectionResult> {
    // 1. 检查存储的用户偏好
    const userPreference = LocaleStorageManager.getUserPreference();
    if (userPreference && SUPPORTED_LOCALES.includes(userPreference.locale)) {
      return {
        locale: userPreference.locale,
        source: DETECTION_SOURCES.STORED,
        confidence:
          userPreference.confidence || CONFIDENCE_WEIGHTS.STORED_PREFERENCE,
        details: { userOverride: userPreference.locale },
      };
    }

    // 2. 检查用户手动设置
    const userOverride = LocaleStorageManager.getUserOverride();
    if (userOverride && SUPPORTED_LOCALES.includes(userOverride)) {
      return {
        locale: userOverride,
        source: DETECTION_SOURCES.USER,
        confidence: CONFIDENCE_WEIGHTS.USER_OVERRIDE,
        details: { userOverride },
      };
    }

    // 3. 按优先级逐个检测
    const geoLocale = await this.detectFromGeolocation();
    if (geoLocale !== DEFAULT_LOCALE) {
      return {
        locale: geoLocale,
        source: DETECTION_SOURCES.GEO,
        confidence: CONFIDENCE_WEIGHTS.GEOLOCATION,
        details: { geoLocale },
      };
    }

    const browserLocale = this.detectFromBrowser();
    if (browserLocale !== DEFAULT_LOCALE) {
      return {
        locale: browserLocale,
        source: DETECTION_SOURCES.BROWSER,
        confidence: CONFIDENCE_WEIGHTS.BROWSER_LANGUAGE,
        details: { browserLocale },
      };
    }

    // 4. 使用默认语言
    return {
      locale: DEFAULT_LOCALE,
      source: DETECTION_SOURCES.DEFAULT,
      confidence: CONFIDENCE_WEIGHTS.DEFAULT_FALLBACK,
      details: { fallbackUsed: true },
    };
  }

  /**
   * 收集所有检测结果
   * Collect all detection results
   */
  private async collectAllDetectionResults(): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];

    try {
      // 并行执行所有检测方法
      const [geoLocale, browserLocale, timeZoneLocale, ipLocale] =
        await Promise.allSettled([
          this.detectFromGeolocation(),
          Promise.resolve(this.detectFromBrowser()),
          Promise.resolve(this.detectFromTimeZone()),
          this.detectFromIP(),
        ]);

      // 处理地理位置检测结果
      if (
        geoLocale.status === 'fulfilled' &&
        geoLocale.value !== DEFAULT_LOCALE
      ) {
        results.push({
          locale: geoLocale.value,
          source: DETECTION_SOURCES.GEO,
          weight: CONFIDENCE_WEIGHTS.GEOLOCATION,
          confidence: CONFIDENCE_WEIGHTS.GEOLOCATION,
        });
      }

      // 处理浏览器语言检测结果
      if (
        browserLocale.status === 'fulfilled' &&
        browserLocale.value !== DEFAULT_LOCALE
      ) {
        results.push({
          locale: browserLocale.value,
          source: DETECTION_SOURCES.BROWSER,
          weight: CONFIDENCE_WEIGHTS.BROWSER_LANGUAGE,
          confidence: CONFIDENCE_WEIGHTS.BROWSER_LANGUAGE,
        });
      }

      // 处理时区检测结果
      if (
        timeZoneLocale.status === 'fulfilled' &&
        timeZoneLocale.value !== DEFAULT_LOCALE
      ) {
        results.push({
          locale: timeZoneLocale.value,
          source: DETECTION_SOURCES.TIMEZONE,
          weight: CONFIDENCE_WEIGHTS.TIMEZONE,
          confidence: CONFIDENCE_WEIGHTS.TIMEZONE,
        });
      }

      // 处理IP检测结果
      if (
        ipLocale.status === 'fulfilled' &&
        ipLocale.value !== DEFAULT_LOCALE
      ) {
        results.push({
          locale: ipLocale.value,
          source: DETECTION_SOURCES.GEO, // IP检测归类为地理位置检测
          weight: CONFIDENCE_WEIGHTS.GEOLOCATION * MAGIC_0_8, // IP检测权重略低于GPS
          confidence: CONFIDENCE_WEIGHTS.GEOLOCATION * MAGIC_0_8,
        });
      }
    } catch (error) {
      logger.warn('Error collecting detection results:', error);
    }

    return results;
  }

  /**
   * 分析最佳语言选择
   * Analyze best locale choice
   */
  private analyzeBestLocale(
    detectionResults: DetectionResult[],
  ): LocaleDetectionResult {
    // 统计每种语言的出现次数和权重
    const localeStats = new Map<
      Locale,
      {
        count: number;
        totalWeight: number;
        sources: DetectionSource[];
        maxConfidence: number;
      }
    >();

    for (const result of detectionResults) {
      const current = localeStats.get(result.locale) || {
        count: ZERO,
        totalWeight: ZERO,
        sources: [],
        maxConfidence: ZERO,
      };

      current.count += ONE;
      current.totalWeight += result.weight;
      current.sources.push(result.source);
      current.maxConfidence = Math.max(
        current.maxConfidence,
        result.confidence,
      );

      localeStats.set(result.locale, current);
    }

    // 计算每种语言的综合得分
    let bestLocale = DEFAULT_LOCALE;
    let bestScore = ZERO;
    let bestSources: DetectionSource[] = [];
    let bestConfidence: number = CONFIDENCE_WEIGHTS.DEFAULT_FALLBACK;

    for (const [locale, stats] of localeStats.entries()) {
      // 综合得分 = 权重总和 + 一致性奖励
      const consistencyBonus =
        stats.count > ONE ? QUALITY_THRESHOLDS.CONSISTENCY_BONUS : ZERO;
      const score = stats.totalWeight + consistencyBonus;

      if (score > bestScore) {
        bestScore = score;
        bestLocale = locale;
        bestSources = stats.sources;

        // 计算最终置信度
        const baseConfidence = Math.min(
          stats.totalWeight / detectionResults.length,
          QUALITY_THRESHOLDS.HIGH_CONFIDENCE,
        );
        bestConfidence = Math.min(baseConfidence + consistencyBonus, ONE);
      }
    }

    // 构建详细信息
    const details: Record<string, string | number | boolean> = {};
    for (const result of detectionResults) {
      if (result.source === DETECTION_SOURCES.GEO) {
        details.geoLocale = result.locale;
      } else if (result.source === DETECTION_SOURCES.BROWSER) {
        details.browserLocale = result.locale;
      } else if (result.source === DETECTION_SOURCES.TIMEZONE) {
        details.timeZoneLocale = result.locale;
      }
    }

    // 添加统计信息
    details.detectionStats = JSON.stringify({
      totalSources: detectionResults.length,
      consistentSources: localeStats.get(bestLocale)?.count || ZERO,
      score: bestScore,
    });

    return {
      locale: bestLocale,
      source:
        bestSources.length > QUALITY_THRESHOLDS.MIN_SOURCES_FOR_COMBINED
          ? DETECTION_SOURCES.COMBINED
          : bestSources[ZERO] || DETECTION_SOURCES.DEFAULT,
      confidence: bestConfidence,
      details,
    };
  }

  /**
   * 快速检测语言 (仅使用本地方法)
   * Quick locale detection (local methods only)
   */
  detectQuickLocale(): LocaleDetectionResult {
    // 1. 检查用户设置
    const userOverride = LocaleStorageManager.getUserOverride();
    if (userOverride && SUPPORTED_LOCALES.includes(userOverride)) {
      return {
        locale: userOverride,
        source: DETECTION_SOURCES.USER,
        confidence: CONFIDENCE_WEIGHTS.USER_OVERRIDE,
        details: { userOverride },
      };
    }

    // 2. 检查浏览器语言
    const browserLocale = this.detectFromBrowser();
    if (browserLocale !== DEFAULT_LOCALE) {
      return {
        locale: browserLocale,
        source: DETECTION_SOURCES.BROWSER,
        confidence: CONFIDENCE_WEIGHTS.BROWSER_LANGUAGE,
        details: { browserLocale },
      };
    }

    // 3. 检查时区
    const timeZoneLocale = this.detectFromTimeZone();
    if (timeZoneLocale !== DEFAULT_LOCALE) {
      return {
        locale: timeZoneLocale,
        source: DETECTION_SOURCES.TIMEZONE,
        confidence: CONFIDENCE_WEIGHTS.TIMEZONE,
        details: { timeZoneLocale },
      };
    }

    // 4. 返回默认语言
    return {
      locale: DEFAULT_LOCALE,
      source: DETECTION_SOURCES.DEFAULT,
      confidence: CONFIDENCE_WEIGHTS.DEFAULT_FALLBACK,
      details: { fallbackUsed: true },
    };
  }

  /**
   * 获取检测质量评估
   * Get detection quality assessment
   */
  getDetectionQuality(result: LocaleDetectionResult): {
    quality: 'high' | 'medium' | 'low';
    reliability: number;
    recommendations: string[];
  } {
    const { confidence, source, details } = result;
    const recommendations: string[] = [];

    // 评估质量等级
    let quality: 'high' | 'medium' | 'low';
    if (confidence >= QUALITY_THRESHOLDS.HIGH_CONFIDENCE) {
      quality = 'high';
    } else if (confidence >= QUALITY_THRESHOLDS.MEDIUM_CONFIDENCE) {
      quality = 'medium';
    } else {
      quality = 'low';
    }

    // 计算可靠性
    let reliability = confidence;
    if (source === DETECTION_SOURCES.COMBINED) {
      reliability += MAGIC_0_1; // 组合检测更可靠
    }
    if ((details?.detectionStats?.consistentSources ?? ZERO) > ONE) {
      reliability += DEC_0_05; // 一致性检测更可靠
    }
    reliability = Math.min(reliability, ONE);

    // 生成建议
    if (quality === 'low') {
      recommendations.push('建议用户手动选择语言');
      recommendations.push('可以尝试启用地理位置权限以提高检测准确性');
    }
    if (source === DETECTION_SOURCES.DEFAULT) {
      recommendations.push('检测失败，使用了默认语言');
      recommendations.push('建议检查浏览器语言设置');
    }
    if (!details?.geoLocale && quality !== 'high') {
      recommendations.push('地理位置检测未成功，可能影响准确性');
    }

    return { quality, reliability, recommendations };
  }
}
