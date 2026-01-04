import { safeGetProperty, safeSetProperty } from '@/lib/security-object-access';
import { hasOwn } from '@/lib/security/object-guards';

/**
 * Deep merge plain objects.
 *
 * - Prefers `source` values when they are defined.
 * - Recursively merges nested plain objects (not arrays).
 */
export function mergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  // nosemgrep: object-injection-sink-spread-operator -- 仅复制受控 target 对象
  const result = { ...target };

  for (const key in source) {
    if (!hasOwn(source, key)) continue;
    const sourceValue = safeGetProperty(source, key);
    if (sourceValue === undefined) continue;
    const targetValue = safeGetProperty(result, key);

    const isSourcePlain =
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue);
    const isTargetPlain =
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue);

    if (isSourcePlain && isTargetPlain) {
      const mergedNested = mergeObjects(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
      safeSetProperty({ obj: result, key, value: mergedNested });
      continue;
    }

    safeSetProperty({ obj: result, key, value: sourceValue });
  }

  return result;
}
