import { TEST_CONSTANTS } from '@/constants/test-constants';
import type { ThemeColors } from '@/types';
import {
  calculateContrast,
  checkContrastCompliance,
  ColorSystem,
  darkThemeColors,
  generateCSSVariables,
  lightThemeColors,
  oklchToCSS,
  validateThemeContrast,
  type OKLCHColor,
} from '../colors';

describe('OKLCH颜色系统', () => {
  describe('oklchToCSS', () => {
    it('should convert OKLCH color to CSS string without alpha', () => {
      const color: OKLCHColor = { l: 0.7, c: 0.15, h: 200 };
      const result = oklchToCSS(color);

      expect(result).toBe('oklch(0.7 0.15 200)');
    });

    it('should convert OKLCH color to CSS string with alpha', () => {
      const color: OKLCHColor = { l: 0.7, c: 0.15, h: 200, alpha: 0.8 };
      const result = oklchToCSS(color);

      expect(result).toBe('oklch(0.7 0.15 200 / 0.8)');
    });

    it('should handle alpha value of 1 as no alpha', () => {
      const color: OKLCHColor = { l: 0.7, c: 0.15, h: 200, alpha: 1 };
      const result = oklchToCSS(color);

      expect(result).toBe('oklch(0.7 0.15 200)');
    });

    it('should handle zero values correctly', () => {
      const color: OKLCHColor = { l: 0, c: 0, h: 0 };
      const result = oklchToCSS(color);

      expect(result).toBe('oklch(0 0 0)');
    });

    it('should handle extreme alpha boundary values', () => {
      // Test alpha = 0 (fully transparent)
      const transparentColor: OKLCHColor = { l: 0.5, c: 0.1, h: 180, alpha: 0 };
      const result1 = oklchToCSS(transparentColor);
      expect(result1).toBe('oklch(0.5 0.1 180 / 0)');

      // Test alpha very close to 1 but not exactly 1
      const almostOpaqueColor: OKLCHColor = {
        l: 0.5,
        c: 0.1,
        h: 180,
        alpha: 0.9999999,
      };
      const result2 = oklchToCSS(almostOpaqueColor);
      expect(result2).toBe('oklch(0.5 0.1 180 / 0.9999999)');
    });

    it('should handle negative values gracefully', () => {
      const negativeColor: OKLCHColor = {
        l: -0.1,
        c: -0.05,
        h: -90,
        alpha: -0.5,
      };
      const result = oklchToCSS(negativeColor);
      expect(result).toBe('oklch(-0.1 -0.05 -90 / -0.5)');
    });

    it('should handle values greater than normal ranges', () => {
      const extremeColor: OKLCHColor = { l: 2, c: 5, h: 720, alpha: 2 };
      const result = oklchToCSS(extremeColor);
      // Alpha > 1 is still included since it's not equal to 1
      expect(result).toBe('oklch(2 5 720)'); // Alpha >= 1 is not included
    });

    it('should handle NaN values', () => {
      const nanColor: OKLCHColor = { l: NaN, c: NaN, h: NaN, alpha: NaN };
      const result = oklchToCSS(nanColor);
      // NaN < 1 is false, so alpha won't be included
      expect(result).toBe('oklch(NaN NaN NaN)');
    });

    it('should handle Infinity values', () => {
      const infiniteColor: OKLCHColor = {
        l: Infinity,
        c: Infinity,
        h: Infinity,
        alpha: Infinity,
      };
      const result = oklchToCSS(infiniteColor);
      // Infinity < 1 is false, so alpha won't be included
      expect(result).toBe('oklch(Infinity Infinity Infinity)');
    });

    it('should handle missing alpha property', () => {
      const colorWithoutAlpha: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      const result = oklchToCSS(colorWithoutAlpha);
      expect(result).toBe('oklch(0.5 0.1 180)');
    });

    it('should handle undefined alpha property', () => {
      const colorWithUndefinedAlpha: OKLCHColor = {
        l: 0.5,
        c: 0.1,
        h: 180,
      };
      const result = oklchToCSS(colorWithUndefinedAlpha);
      expect(result).toBe('oklch(0.5 0.1 180)');
    });

    it('should handle very precise decimal values', () => {
      const preciseColor: OKLCHColor = {
        l: 0.123456789012345,
        c: 0.987654321098765,
        h: 359.999999999999,
        alpha: 0.500000000000001,
      };
      const result = oklchToCSS(preciseColor);
      expect(result).toBe(
        'oklch(0.123456789012345 0.987654321098765 359.999999999999 / 0.500000000000001)',
      );
    });
  });

  describe('calculateContrast', () => {
    it('should calculate contrast between white and black correctly', () => {
      const white: OKLCHColor = { l: 1, c: 0, h: 0 };
      const black: OKLCHColor = { l: 0, c: 0, h: 0 };

      const contrast = calculateContrast(white, black);

      // White vs Black should have maximum contrast
      expect(contrast).toBeGreaterThan(TEST_CONSTANTS.CONTRAST.HIGH_THRESHOLD); // Very high contrast
    });

    it('should calculate contrast between similar colors', () => {
      const lightGray: OKLCHColor = { l: 0.8, c: 0, h: 0 };
      const darkGray: OKLCHColor = { l: 0.7, c: 0, h: 0 };

      const contrast = calculateContrast(lightGray, darkGray);

      expect(contrast).toBeGreaterThan(1);
      expect(contrast).toBeLessThan(TEST_CONSTANTS.CONTRAST.LOW_THRESHOLD); // Low contrast
    });

    it('should handle identical colors', () => {
      const color: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };

      const contrast = calculateContrast(color, color);

      expect(contrast).toBe(1); // No contrast
    });

    it('should be symmetric (order independent)', () => {
      const color1: OKLCHColor = { l: 0.8, c: 0.1, h: 120 };
      const color2: OKLCHColor = { l: 0.3, c: 0.1, h: 240 };

      const contrast1 = calculateContrast(color1, color2);
      const contrast2 = calculateContrast(color2, color1);

      expect(contrast1).toBe(contrast2);
    });

    it('should handle edge case lightness values', () => {
      const maxLight: OKLCHColor = { l: 1, c: 0, h: 0 };
      const minLight: OKLCHColor = { l: 0, c: 0, h: 0 };

      expect(() => calculateContrast(maxLight, minLight)).not.toThrow();

      const nearZero: OKLCHColor = { l: 0.001, c: 0, h: 0 };
      expect(() => calculateContrast(maxLight, nearZero)).not.toThrow();
    });

    it('should handle extreme lightness boundary values', () => {
      // Test with exactly 0 lightness
      const absoluteBlack: OKLCHColor = { l: 0, c: 0, h: 0 };
      const absoluteWhite: OKLCHColor = { l: 1, c: 0, h: 0 };

      const contrast = calculateContrast(absoluteBlack, absoluteWhite);
      expect(contrast).toBeGreaterThan(TEST_CONSTANTS.CONTRAST.HIGH_THRESHOLD); // Should be very high
      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle negative lightness values gracefully', () => {
      const negativeLight: OKLCHColor = { l: -0.1, c: 0, h: 0 };
      const normalLight: OKLCHColor = { l: 0.5, c: 0, h: 0 };

      expect(() => calculateContrast(negativeLight, normalLight)).not.toThrow();
      const contrast = calculateContrast(negativeLight, normalLight);
      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle lightness values greater than 1', () => {
      const overLight: OKLCHColor = { l: 1.5, c: 0, h: 0 };
      const normalLight: OKLCHColor = { l: 0.5, c: 0, h: 0 };

      expect(() => calculateContrast(overLight, normalLight)).not.toThrow();
      const contrast = calculateContrast(overLight, normalLight);
      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle very small lightness differences', () => {
      const color1: OKLCHColor = { l: 0.5, c: 0, h: 0 };
      const color2: OKLCHColor = { l: 0.5000001, c: 0, h: 0 }; // Tiny difference

      const contrast = calculateContrast(color1, color2);
      expect(contrast).toBeCloseTo(1, TEST_CONSTANTS.CONTRAST.PRECISION_DIGITS); // Should be very close to 1
      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle NaN lightness values', () => {
      const nanColor: OKLCHColor = { l: NaN, c: 0, h: 0 };
      const normalColor: OKLCHColor = { l: 0.5, c: 0, h: 0 };

      expect(() => calculateContrast(nanColor, normalColor)).not.toThrow();
      // Result might be NaN, but function shouldn't crash
    });

    it('should handle Infinity lightness values', () => {
      const infiniteColor: OKLCHColor = { l: Infinity, c: 0, h: 0 };
      const normalColor: OKLCHColor = { l: 0.5, c: 0, h: 0 };

      expect(() => calculateContrast(infiniteColor, normalColor)).not.toThrow();
      // Result might be Infinity, but function shouldn't crash
    });

    it('should handle colors with alpha channel', () => {
      const colorWithAlpha: OKLCHColor = { l: 0.8, c: 0.1, h: 120, alpha: 0.5 };
      const opaqueColor: OKLCHColor = { l: 0.3, c: 0.1, h: 240 };

      expect(() =>
        calculateContrast(colorWithAlpha, opaqueColor),
      ).not.toThrow();
      const contrast = calculateContrast(colorWithAlpha, opaqueColor);
      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle colors with extreme chroma and hue values', () => {
      const extremeColor1: OKLCHColor = { l: 0.5, c: 999, h: 720 }; // Very high chroma and hue
      const extremeColor2: OKLCHColor = { l: 0.5, c: -10, h: -180 }; // Negative chroma and hue

      expect(() =>
        calculateContrast(extremeColor1, extremeColor2),
      ).not.toThrow();
      const contrast = calculateContrast(extremeColor1, extremeColor2);
      expect(Number.isFinite(contrast)).toBe(true);
    });
  });

  describe('checkContrastCompliance', () => {
    it('should pass AA compliance for high contrast colors', () => {
      const white: OKLCHColor = { l: 1, c: 0, h: 0 };
      const black: OKLCHColor = { l: 0, c: 0, h: 0 };

      expect(checkContrastCompliance(white, black, 'AA')).toBe(true);
      expect(checkContrastCompliance(black, white, 'AA')).toBe(true);
    });

    it('should pass AAA compliance for very high contrast colors', () => {
      const white: OKLCHColor = { l: 1, c: 0, h: 0 };
      const black: OKLCHColor = { l: 0, c: 0, h: 0 };

      expect(checkContrastCompliance(white, black, 'AAA')).toBe(true);
    });

    it('should fail compliance for low contrast colors', () => {
      const lightGray: OKLCHColor = { l: 0.8, c: 0, h: 0 };
      const mediumGray: OKLCHColor = { l: 0.75, c: 0, h: 0 };

      expect(checkContrastCompliance(lightGray, mediumGray, 'AA')).toBe(false);
      expect(checkContrastCompliance(lightGray, mediumGray, 'AAA')).toBe(false);
    });

    it('should have stricter requirements for AAA than AA', () => {
      // Create colors that might pass AA but not AAA
      const color1: OKLCHColor = { l: 0.6, c: 0, h: 0 };
      const color2: OKLCHColor = { l: 0.2, c: 0, h: 0 };

      const aaResult = checkContrastCompliance(color1, color2, 'AA');
      const aaaResult = checkContrastCompliance(color1, color2, 'AAA');

      // AAA should be same or stricter than AA
      if (aaaResult) {
        expect(aaResult).toBe(true);
      }
    });

    it('should handle extreme contrast boundary cases', () => {
      // Test exactly at AA threshold (4.5:1)
      // Create colors that should be right at the boundary
      const borderlineColor1: OKLCHColor = { l: 0.7, c: 0, h: 0 };
      const borderlineColor2: OKLCHColor = { l: 0.25, c: 0, h: 0 };

      expect(() =>
        checkContrastCompliance(borderlineColor1, borderlineColor2, 'AA'),
      ).not.toThrow();
      expect(() =>
        checkContrastCompliance(borderlineColor1, borderlineColor2, 'AAA'),
      ).not.toThrow();
    });

    it('should handle invalid contrast level gracefully', () => {
      const color1: OKLCHColor = { l: 1, c: 0, h: 0 };
      const color2: OKLCHColor = { l: 0, c: 0, h: 0 };

      expect(() =>
        // @ts-expect-error - Testing invalid input
        checkContrastCompliance(color1, color2, 'INVALID'),
      ).not.toThrow();
    });

    it('should handle colors with extreme alpha values', () => {
      const transparentColor: OKLCHColor = { l: 1, c: 0, h: 0, alpha: 0 };
      const opaqueColor: OKLCHColor = { l: 0, c: 0, h: 0, alpha: 1 };

      expect(() =>
        checkContrastCompliance(transparentColor, opaqueColor, 'AA'),
      ).not.toThrow();

      const overAlphaColor: OKLCHColor = { l: 1, c: 0, h: 0, alpha: 2 };
      expect(() =>
        checkContrastCompliance(overAlphaColor, opaqueColor, 'AA'),
      ).not.toThrow();

      const negativeAlphaColor: OKLCHColor = { l: 1, c: 0, h: 0, alpha: -0.5 };
      expect(() =>
        checkContrastCompliance(negativeAlphaColor, opaqueColor, 'AA'),
      ).not.toThrow();
    });

    it('should handle colors with NaN values', () => {
      const nanColor: OKLCHColor = { l: NaN, c: NaN, h: NaN };
      const normalColor: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };

      expect(() =>
        checkContrastCompliance(nanColor, normalColor, 'AA'),
      ).not.toThrow();
      expect(() =>
        checkContrastCompliance(normalColor, nanColor, 'AAA'),
      ).not.toThrow();
    });

    it('should handle colors with Infinity values', () => {
      const infiniteColor: OKLCHColor = {
        l: Infinity,
        c: Infinity,
        h: Infinity,
      };
      const normalColor: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };

      expect(() =>
        checkContrastCompliance(infiniteColor, normalColor, 'AA'),
      ).not.toThrow();
      expect(() =>
        checkContrastCompliance(normalColor, infiniteColor, 'AAA'),
      ).not.toThrow();
    });

    it('should handle missing color properties', () => {
      const incompleteColor1 = { l: 0.5 }; // Missing c and h
      const incompleteColor2 = { c: 0.1, h: 180 }; // Missing l

      expect(() =>
        // @ts-expect-error - Testing with incomplete color objects
        checkContrastCompliance(incompleteColor1, incompleteColor2, 'AA'),
      ).not.toThrow();
    });

    it('should handle null and undefined color objects', () => {
      const normalColor: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };

      // These should throw errors since null/undefined don't have the required properties
      expect(() =>
        // @ts-expect-error - Testing null input
        checkContrastCompliance(null, normalColor, 'AA'),
      ).toThrow();
      expect(() =>
        // @ts-expect-error - Testing undefined input
        checkContrastCompliance(undefined, normalColor, 'AA'),
      ).toThrow();
      // @ts-expect-error - Testing null input
      expect(() => checkContrastCompliance(normalColor, null, 'AAA')).toThrow();
    });

    it('should handle very precise contrast ratios near thresholds', () => {
      // Test colors that produce contrast ratios very close to 4.5 and 7
      const preciseColor1: OKLCHColor = { l: 0.6666666666666666, c: 0, h: 0 };
      const preciseColor2: OKLCHColor = { l: 0.2222222222222222, c: 0, h: 0 };

      expect(() =>
        checkContrastCompliance(preciseColor1, preciseColor2, 'AA'),
      ).not.toThrow();
      expect(() =>
        checkContrastCompliance(preciseColor1, preciseColor2, 'AAA'),
      ).not.toThrow();
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate CSS variables with correct naming', () => {
      const testColors: Partial<ThemeColors> = {
        background: { l: 1, c: 0, h: 0 },
        foreground: { l: 0, c: 0, h: 0 },
        primaryForeground: { l: 1, c: 0, h: 0 },
      };

      const variables = generateCSSVariables(testColors);

      expect(variables).toEqual({
        '--background': 'oklch(1 0 0)',
        '--foreground': 'oklch(0 0 0)',
        '--primary-foreground': 'oklch(1 0 0)',
      });
    });

    it('should handle prefix correctly', () => {
      const testColors: Partial<ThemeColors> = {
        background: { l: 1, c: 0, h: 0 },
      };

      const variables = generateCSSVariables(testColors, 'theme-');

      expect(variables).toEqual({
        '--theme-background': 'oklch(1 0 0)',
      });
    });

    it('should handle empty colors object', () => {
      const variables = generateCSSVariables({} as Partial<ThemeColors>);

      expect(variables).toEqual({});
    });

    it('should handle colors with alpha values', () => {
      const testColors: Partial<ThemeColors> = {
        accent: { l: 0.5, c: 0, h: 0, alpha: 0.8 },
      };

      const variables = generateCSSVariables(testColors);

      expect(variables).toEqual({
        '--accent': 'oklch(0.5 0 0 / 0.8)',
      });
    });
  });

  describe('validateThemeContrast', () => {
    it('should validate light theme contrast compliance', () => {
      const validation = validateThemeContrast(lightThemeColors);

      expect(validation).toHaveProperty('compliant');
      expect(validation).toHaveProperty('issues');
      expect(Array.isArray(validation.issues)).toBe(true);
    });

    it('should validate dark theme contrast compliance', () => {
      const validation = validateThemeContrast(darkThemeColors);

      expect(validation).toHaveProperty('compliant');
      expect(validation).toHaveProperty('issues');
      expect(Array.isArray(validation.issues)).toBe(true);
    });

    it('should identify non-compliant color combinations', () => {
      const badTheme = {
        background: { l: 0.5, c: 0, h: 0 },
        foreground: { l: 0.55, c: 0, h: 0 }, // Very low contrast
        card: { l: 0.5, c: 0, h: 0 },
        cardForeground: { l: 0.55, c: 0, h: 0 },
        popover: { l: 0.5, c: 0, h: 0 },
        popoverForeground: { l: 0.55, c: 0, h: 0 },
        primary: { l: 0.5, c: 0, h: 0 },
        primaryForeground: { l: 0.55, c: 0, h: 0 },
        secondary: { l: 0.5, c: 0, h: 0 },
        secondaryForeground: { l: 0.55, c: 0, h: 0 },
        muted: { l: 0.5, c: 0, h: 0 },
        mutedForeground: { l: 0.55, c: 0, h: 0 },
        accent: { l: 0.5, c: 0, h: 0 },
        accentForeground: { l: 0.55, c: 0, h: 0 },
        destructive: { l: 0.5, c: 0, h: 0 },
        destructiveForeground: { l: 0.55, c: 0, h: 0 },
        border: { l: 0.5, c: 0, h: 0 },
        input: { l: 0.5, c: 0, h: 0 },
        ring: { l: 0.5, c: 0, h: 0 },
        success: { l: 0.5, c: 0, h: 0 },
        successForeground: { l: 0.55, c: 0, h: 0 },
        warning: { l: 0.5, c: 0, h: 0 },
        warningForeground: { l: 0.55, c: 0, h: 0 },
        error: { l: 0.5, c: 0, h: 0 },
        errorForeground: { l: 0.55, c: 0, h: 0 },
        info: { l: 0.5, c: 0, h: 0 },
        infoForeground: { l: 0.55, c: 0, h: 0 },
      };

      const validation = validateThemeContrast(badTheme);

      expect(validation.compliant).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('should provide detailed issue descriptions', () => {
      // Create a theme with low contrast colors
      const lowContrastColor1 = { l: 0.5, c: 0, h: 0 };
      const lowContrastColor2 = { l: 0.55, c: 0, h: 0 };

      const badTheme: ThemeColors = {
        background: lowContrastColor1,
        foreground: lowContrastColor2,
        card: lowContrastColor1,
        cardForeground: lowContrastColor2,
        popover: lowContrastColor1,
        popoverForeground: lowContrastColor2,
        primary: lowContrastColor1,
        primaryForeground: lowContrastColor2,
        secondary: lowContrastColor1,
        secondaryForeground: lowContrastColor2,
        muted: lowContrastColor1,
        mutedForeground: lowContrastColor2,
        accent: lowContrastColor1,
        accentForeground: lowContrastColor2,
        destructive: lowContrastColor1,
        destructiveForeground: lowContrastColor2,
        border: lowContrastColor1,
        input: lowContrastColor1,
        ring: lowContrastColor1,
        success: lowContrastColor1,
        successForeground: lowContrastColor2,
        warning: lowContrastColor1,
        warningForeground: lowContrastColor2,
        error: lowContrastColor1,
        errorForeground: lowContrastColor2,
        info: lowContrastColor1,
        infoForeground: lowContrastColor2,
      };

      const validation = validateThemeContrast(badTheme);

      expect(validation.compliant).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      if (validation.issues.length > 0) {
        expect(validation.issues[0]).toMatch(/需要 ≥4\.5:1/);
      }
    });
  });

  describe('ColorSystem工具类', () => {
    it('should provide access to light theme colors', () => {
      expect(ColorSystem.light).toBe(lightThemeColors);
    });

    it('should provide access to dark theme colors', () => {
      expect(ColorSystem.dark).toBe(darkThemeColors);
    });

    it('should provide utility functions', () => {
      expect(ColorSystem.toCSS).toBe(oklchToCSS);
      expect(ColorSystem.calculateContrast).toBe(calculateContrast);
      expect(ColorSystem.checkCompliance).toBe(checkContrastCompliance);
      expect(ColorSystem.generateVariables).toBe(generateCSSVariables);
      expect(ColorSystem.validate).toBe(validateThemeContrast);
    });
  });

  describe('主题颜色定义验证', () => {
    it('should have consistent color keys between light and dark themes', () => {
      const lightKeys = Object.keys(lightThemeColors).sort();
      const darkKeys = Object.keys(darkThemeColors).sort();

      expect(lightKeys).toEqual(darkKeys);
    });

    it('should have valid OKLCH values in light theme', () => {
      Object.entries(lightThemeColors).forEach(([_key, color]) => {
        expect(color.l).toBeGreaterThanOrEqual(0);
        expect(color.l).toBeLessThanOrEqual(1);
        expect(color.c).toBeGreaterThanOrEqual(0);
        expect(color.h).toBeGreaterThanOrEqual(0);
        expect(color.h).toBeLessThanOrEqual(TEST_CONSTANTS.ANGLE.FULL_CIRCLE);

        if (color.alpha !== undefined) {
          expect(color.alpha).toBeGreaterThanOrEqual(0);
          expect(color.alpha).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should have valid OKLCH values in dark theme', () => {
      Object.entries(darkThemeColors).forEach(([_key, color]) => {
        expect(color.l).toBeGreaterThanOrEqual(0);
        expect(color.l).toBeLessThanOrEqual(1);
        expect(color.c).toBeGreaterThanOrEqual(0);
        expect(color.h).toBeGreaterThanOrEqual(0);
        expect(color.h).toBeLessThanOrEqual(TEST_CONSTANTS.ANGLE.FULL_CIRCLE);

        if (color.alpha !== undefined) {
          expect(color.alpha).toBeGreaterThanOrEqual(0);
          expect(color.alpha).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should have reasonable chroma values', () => {
      const maxReasonableChroma = 0.5; // Most colors should be below this

      Object.entries(lightThemeColors).forEach(([_key, color]) => {
        expect(color.c).toBeLessThanOrEqual(maxReasonableChroma);
      });

      Object.entries(darkThemeColors).forEach(([_key, color]) => {
        expect(color.c).toBeLessThanOrEqual(maxReasonableChroma);
      });
    });
  });

  describe('边缘情况处理', () => {
    it('should handle extreme lightness values', () => {
      const extremeLight: OKLCHColor = { l: 1, c: 0, h: 0 };
      const extremeDark: OKLCHColor = { l: 0, c: 0, h: 0 };

      expect(() => oklchToCSS(extremeLight)).not.toThrow();
      expect(() => oklchToCSS(extremeDark)).not.toThrow();
      expect(() => calculateContrast(extremeLight, extremeDark)).not.toThrow();
    });

    it('should handle high chroma values', () => {
      const highChroma: OKLCHColor = { l: 0.5, c: 0.4, h: 180 };

      expect(() => oklchToCSS(highChroma)).not.toThrow();
    });

    it('should handle hue values at boundaries', () => {
      const hue0: OKLCHColor = { l: 0.5, c: 0.1, h: 0 };
      const hue360: OKLCHColor = { l: 0.5, c: 0.1, h: 360 };

      expect(() => oklchToCSS(hue0)).not.toThrow();
      expect(() => oklchToCSS(hue360)).not.toThrow();
    });

    it('should handle very small alpha values', () => {
      const nearTransparent: OKLCHColor = {
        l: 0.5,
        c: 0.1,
        h: 180,
        alpha: 0.001,
      };

      const result = oklchToCSS(nearTransparent);
      expect(result).toBe('oklch(0.5 0.1 180 / 0.001)');
    });
  });
});
