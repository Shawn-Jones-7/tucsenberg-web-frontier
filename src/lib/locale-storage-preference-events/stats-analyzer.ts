/**
 * 偏好统计分析
 * Preference Statistics Analyzer
 */

'use client';

import type { Locale } from '@/types/i18n';
import { HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

import { getPreferenceHistory } from '@/lib/locale-storage-preference-events/history-manager';

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
    averageConfidence: 0,
    lastChange: null as number | null,
    changeFrequency: 0,
  };

  if (history.length === 0) {
    return stats;
  }

  let totalConfidence = 0;

  history.forEach((pref) => {
    // 统计语言变化
    stats.localeChanges[pref.locale] =
      (stats.localeChanges[pref.locale] || 0) + 1;

    // 统计来源变化
    stats.sourceChanges[pref.source] =
      (stats.sourceChanges[pref.source] || 0) + 1;

    // 累计置信度
    totalConfidence += pref.confidence;
  });

  stats.averageConfidence = totalConfidence / history.length;
  stats.lastChange = history[0]?.timestamp || 0;

  // 计算变化频率
  if (history.length > 1) {
    const timeSpan =
      (history[0]?.timestamp || 0) -
      (history[history.length - 1]?.timestamp || 0);
    const days = timeSpan / (HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000);
    stats.changeFrequency = days > 0 ? history.length / days : 0;
  }

  return stats;
}
