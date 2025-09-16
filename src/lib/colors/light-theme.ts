/**
 * 明亮主题颜色定义
 */

import type { ThemeColors } from '@/lib/colors/types';

/**
 * 明亮主题颜色定义
 */
export const lightThemeColors: ThemeColors = {
  // 基础颜色 - 高对比度白色背景
  background: { l: 1, c: 0, h: 0 }, // 纯白
  foreground: { l: 0.145, c: 0, h: 0 }, // 深灰，确保高对比度

  // 卡片和弹出层
  card: { l: 1, c: 0, h: 0 },
  cardForeground: { l: 0.145, c: 0, h: 0 },
  popover: { l: 1, c: 0, h: 0 },
  popoverForeground: { l: 0.145, c: 0, h: 0 },

  // 主要颜色 - 深色确保对比度
  primary: { l: 0.205, c: 0, h: 0 },
  primaryForeground: { l: 0.985, c: 0, h: 0 },

  // 次要颜色
  secondary: { l: 0.97, c: 0, h: 0 },
  secondaryForeground: { l: 0.205, c: 0, h: 0 },

  // 静音颜色
  muted: { l: 0.97, c: 0, h: 0 },
  mutedForeground: { l: 0.556, c: 0, h: 0 },

  // 强调颜色
  accent: { l: 0.97, c: 0, h: 0 },
  accentForeground: { l: 0.205, c: 0, h: 0 },

  // 破坏性颜色 - 红色系
  destructive: { l: 0.577, c: 0.245, h: 27.325 },
  destructiveForeground: { l: 0.985, c: 0, h: 0 },

  // 边框和输入
  border: { l: 0.922, c: 0, h: 0 },
  input: { l: 0.922, c: 0, h: 0 },
  ring: { l: 0.708, c: 0, h: 0 },

  // 语义化颜色
  success: { l: 0.646, c: 0.222, h: 142.5 }, // 绿色
  successForeground: { l: 0.985, c: 0, h: 0 },
  warning: { l: 0.828, c: 0.189, h: 84.429 }, // 黄色
  warningForeground: { l: 0.145, c: 0, h: 0 },
  error: { l: 0.577, c: 0.245, h: 27.325 }, // 红色
  errorForeground: { l: 0.985, c: 0, h: 0 },
  info: { l: 0.6, c: 0.118, h: 184.704 }, // 蓝色
  infoForeground: { l: 0.985, c: 0, h: 0 },
};
