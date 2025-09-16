/**
 * OKLCH颜色系统管理库 - 主入口
 * 重新导出所有颜色相关模块
 */

// 重新导出类型定义
export type { OKLCHColor, ContrastLevel, ThemeColors } from '@/lib/colors/types';

// 重新导出主题颜色
export { lightThemeColors } from '@/lib/colors/light-theme';
export { darkThemeColors } from '@/lib/colors/dark-theme';

// 重新导出工具函数
export {
  oklchToCSS,
  calculateContrast,
  checkContrastCompliance,
  generateCSSVariables,
  validateThemeContrast,
} from './colors/utils';

// 重新导出颜色系统类
export { ColorSystem } from '@/lib/colors/color-system';
