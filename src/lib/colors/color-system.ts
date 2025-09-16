/**
 * 颜色系统工具类
 */

import { darkThemeColors } from '@/lib/colors/dark-theme';
import { lightThemeColors } from '@/lib/colors/light-theme';
import {
  calculateContrast,
  checkContrastCompliance,
  generateCSSVariables,
  oklchToCSS,
  validateThemeContrast,
} from './utils';

/**
 * 颜色系统工具类
 */
export class ColorSystem {
  static light = lightThemeColors;
  static dark = darkThemeColors;

  static toCSS = oklchToCSS;
  static calculateContrast = calculateContrast;
  static checkCompliance = checkContrastCompliance;
  static generateVariables = generateCSSVariables;
  static validate = validateThemeContrast;
}
