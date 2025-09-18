/**
 * 偏好统计分析
 * Preference Statistics Analyzer
 */

'use client';

import { getPreferenceHistory } from '@/lib/locale-storage-preference-events/history-manager';
import { ANIMATION_DURATION_VERY_SLOW, HOURS_PER_DAY, ONE, SECONDS_PER_MINUTE, ZERO } from '@/constants';
import { safeGetArrayItem } from '@/lib/security-object-access';

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

  const localeMap = new Map<Locale, number>();
  const sourceMap = new Map<string, number>();

  history.forEach((pref) => {
    // 统计语言变化
    localeMap.set(pref.locale, (localeMap.get(pref.locale) || ZERO) + ONE);

    // 统计来源变化
    sourceMap.set(pref.source, (sourceMap.get(pref.source) || ZERO) + ONE);

    // 累计置信度
    totalConfidence += pref.confidence;
  });

  stats.localeChanges = Object.fromEntries(localeMap) as Record<Locale, number>;
  stats.sourceChanges = Object.fromEntries(sourceMap) as Record<string, number>;
  stats.averageConfidence = totalConfidence / history.length;
  const first = safeGetArrayItem(history, ZERO);
  stats.lastChange = first ? first.timestamp || ZERO : ZERO;

  // 计算变化频率
  if (history.length > ONE) {
    const start = safeGetArrayItem(history, ZERO)?.timestamp || ZERO;
    const end = safeGetArrayItem(history, history.length - ONE)?.timestamp || ZERO;
    const timeSpan = start - end;
    const days = timeSpan / (HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW);
    stats.changeFrequency = days > ZERO ? history.length / days : ZERO;
  }

  return stats;
}
