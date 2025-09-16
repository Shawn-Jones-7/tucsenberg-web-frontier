/**
 * 暗黑主题颜色定义
 */

import type { ThemeColors } from '@/lib/colors/types';

/**
 * 暗黑主题颜色定义
 */
export const darkThemeColors: ThemeColors = {
  // 基础颜色 - 深色背景
  background: { l: 0.145, c: 0, h: 0 },
  foreground: { l: 0.985, c: 0, h: 0 },

  // 卡片和弹出层
  card: { l: 0.145, c: 0, h: 0 },
  cardForeground: { l: 0.985, c: 0, h: 0 },
  popover: { l: 0.145, c: 0, h: 0 },
  popoverForeground: { l: 0.985, c: 0, h: 0 },

  // 主要颜色
  primary: { l: 0.985, c: 0, h: 0 },
  primaryForeground: { l: 0.205, c: 0, h: 0 },

  // 次要颜色
  secondary: { l: 0.262, c: 0, h: 0 },
  secondaryForeground: { l: 0.985, c: 0, h: 0 },

  // 静音颜色
  muted: { l: 0.262, c: 0, h: 0 },
  mutedForeground: { l: 0.708, c: 0, h: 0 },

  // 强调颜色
  accent: { l: 0.262, c: 0, h: 0 },
  accentForeground: { l: 0.985, c: 0, h: 0 },

  // 破坏性颜色
  destructive: { l: 0.631, c: 0.245, h: 27.325 },
  destructiveForeground: { l: 0.985, c: 0, h: 0 },

  // 边框和输入
  border: { l: 0.262, c: 0, h: 0 },
  input: { l: 0.262, c: 0, h: 0 },
  ring: { l: 0.708, c: 0, h: 0 },

  // 语义化颜色
  success: { l: 0.7, c: 0.222, h: 142.5 },
  successForeground: { l: 0.145, c: 0, h: 0 },
  warning: { l: 0.85, c: 0.189, h: 84.429 },
  warningForeground: { l: 0.145, c: 0, h: 0 },
  error: { l: 0.631, c: 0.245, h: 27.325 },
  errorForeground: { l: 0.985, c: 0, h: 0 },
  info: { l: 0.65, c: 0.118, h: 184.704 },
  infoForeground: { l: 0.145, c: 0, h: 0 },
};
