/**
 * 偏好统计分析
 * Preference Statistics Analyzer
 */

'use client';

import { ANIMATION_DURATION_VERY_SLOW, HOURS_PER_DAY, ONE, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { getPreferenceHistory } from '@/lib/locale-storage-preference-events/history-manager';
import type { Locale } from '@/types/i18n';

/**
 * 获取偏好变化统计
 * Get preference change statistics
 */
export function getPreferenceChangeStats(): {
  totalChanges: number;
  localeChanges: Record<Locale, number>;
  sourceChanges: Record<string, number>;
  averageConfidence: number;
  lastChange: number | null;
  changeFrequency: number; // changes per day
} {
  const history = getPreferenceHistory();

  const stats = {
    totalChanges: history.length,
    localeChanges: {} as Record<Locale, number>,
    sourceChanges: {} as Record<string, number>,
    averageConfidence: ZERO,
    lastChange: null as number | null,
    changeFrequency: ZERO,
  };

  if (history.length === ZERO) {
    return stats;
  }

  let totalConfidence = ZERO;

  history.forEach((pref) => {
    // 统计语言变化
    stats.localeChanges[pref.locale] =
      (stats.localeChanges[pref.locale] || ZERO) + ONE;

    // 统计来源变化
    stats.sourceChanges[pref.source] =
      (stats.sourceChanges[pref.source] || ZERO) + ONE;

    // 累计置信度
    totalConfidence += pref.confidence;
  });

  stats.averageConfidence = totalConfidence / history.length;
  stats.lastChange = history[ZERO]?.timestamp || ZERO;

  // 计算变化频率
  if (history.length > ONE) {
    const timeSpan =
      (history[ZERO]?.timestamp || ZERO) -
      (history[history.length - ONE]?.timestamp || ZERO);
    const days = timeSpan / (HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW);
    stats.changeFrequency = days > ZERO ? history.length / days : ZERO;
  }

  return stats;
}
