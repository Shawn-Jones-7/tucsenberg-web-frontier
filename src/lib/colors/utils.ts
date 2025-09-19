/**
 * 颜色系统工具函数
 */

import type {
  ContrastLevel,
  OKLCHColor,
  ThemeColors,
} from '@/lib/colors/types';

/**
 * 将OKLCH颜色转换为CSS字符串
 */
export function oklchToCSS(color: OKLCHColor): string {
  const { l, c, h, alpha = 1 } = color;
  if (alpha < 1) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }
  return `oklch(${l} ${c} ${h})`;
}

/**
 * 计算两个OKLCH颜色之间的对比度
 * 基于WCAG 2.1标准
 */
export function calculateContrast(
  color1: OKLCHColor,
  color2: OKLCHColor,
): number {
  // 简化的对比度计算，基于亮度差异
  // 实际项目中应该使用更精确的算法
  const l1 = Math.max(color1.l, color2.l);
  const l2 = Math.min(color1.l, color2.l);

  // WCAG对比度公式的简化版本
  const contrastOffset = 0.05;
  return (l1 + contrastOffset) / (l2 + contrastOffset);
}

/**
 * 检查颜色对比度是否符合WCAG标准
 */
export function checkContrastCompliance(
  foreground: OKLCHColor,
  background: OKLCHColor,
  level: ContrastLevel = 'AA',
): boolean {
  const contrast = calculateContrast(foreground, background);
  const aaaMinRatio = 7;
  const aaMinRatio = 4.5;
  const minRatio = level === 'AAA' ? aaaMinRatio : aaMinRatio;
  return contrast >= minRatio;
}

/**
 * 生成CSS变量定义
 */
export function generateCSSVariables(
  colors: Partial<ThemeColors>,
  prefix = '',
): Record<string, string> {
  const variables: Record<string, string> = {};

  Object.entries(colors).forEach(([key, color]) => {
    const cssKey = `--${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    // eslint-disable-next-line security/detect-object-injection
    variables[cssKey] = oklchToCSS(color);
  });

  return variables;
}

/**
 * 验证主题颜色的对比度合规性
 */
export function validateThemeContrast(colors: Partial<ThemeColors>): {
  compliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // 检查主要的前景/背景组合
  const checks = [
    {
      fg: colors.foreground,
      bg: colors.background,
      name: 'foreground/background',
    },
    {
      fg: colors.cardForeground,
      bg: colors.card,
      name: 'card-foreground/card',
    },
    {
      fg: colors.primaryForeground,
      bg: colors.primary,
      name: 'primary-foreground/primary',
    },
    {
      fg: colors.secondaryForeground,
      bg: colors.secondary,
      name: 'secondary-foreground/secondary',
    },
    {
      fg: colors.mutedForeground,
      bg: colors.muted,
      name: 'muted-foreground/muted',
    },
    {
      fg: colors.accentForeground,
      bg: colors.accent,
      name: 'accent-foreground/accent',
    },
    {
      fg: colors.destructiveForeground,
      bg: colors.destructive,
      name: 'destructive-foreground/destructive',
    },
    {
      fg: colors.successForeground,
      bg: colors.success,
      name: 'success-foreground/success',
    },
    {
      fg: colors.warningForeground,
      bg: colors.warning,
      name: 'warning-foreground/warning',
    },
    {
      fg: colors.errorForeground,
      bg: colors.error,
      name: 'error-foreground/error',
    },
    {
      fg: colors.infoForeground,
      bg: colors.info,
      name: 'info-foreground/info',
    },
  ];

  checks.forEach(({ fg, bg, name }) => {
    if (fg && bg && !checkContrastCompliance(fg, bg, 'AA')) {
      const contrast = calculateContrast(fg, bg);
      const decimalPlaces = 2;
      issues.push(
        `${name}: ${contrast.toFixed(decimalPlaces)}:1 (需要 ≥4.5:1)`,
      );
    }
  });

  return {
    compliant: issues.length === 0,
    issues,
  };
}
