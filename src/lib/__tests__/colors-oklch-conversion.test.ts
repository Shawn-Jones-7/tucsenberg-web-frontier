/**
 * OKLCH Color Conversion and Calculation Tests
 *
 * Tests for OKLCH color system conversion and calculation functions including:
 * - OKLCH to CSS string conversion
 * - Color contrast calculations
 * - Basic color manipulation utilities
 */

import { TEST_CONSTANTS } from '@/constants/test-constants';
import { calculateContrast, oklchToCSS, type OKLCHColor } from '@/lib/colors';

describe('OKLCH Color Conversion and Calculation Tests', () => {
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
      // NaN < 1 is false, so alpha won'_t be included
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
      // Infinity < 1 is false, so alpha won'_t be included
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

      expect(contrast).toBe(1); // Identical colors should have contrast ratio of 1
    });

    it('should be symmetric (order independent)', () => {
      const color1: OKLCHColor = { l: 0.8, c: 0.1, h: 120 };
      const color2: OKLCHColor = { l: 0.3, c: 0.15, h: 240 };

      const contrast1 = calculateContrast(color1, color2);
      const contrast2 = calculateContrast(color2, color1);

      expect(contrast1).toBe(contrast2);
    });

    it('should handle colors with different chroma values', () => {
      const saturatedColor: OKLCHColor = { l: 0.5, c: 0.3, h: 0 };
      const desaturatedColor: OKLCHColor = { l: 0.5, c: 0.05, h: 0 };

      const contrast = calculateContrast(saturatedColor, desaturatedColor);

      expect(contrast).toBeGreaterThan(1);
    });

    it('should handle colors with different hue values', () => {
      const redColor: OKLCHColor = { l: 0.5, c: 0.2, h: 0 };
      const blueColor: OKLCHColor = { l: 0.5, c: 0.2, h: 240 };

      const contrast = calculateContrast(redColor, blueColor);

      expect(contrast).toBeGreaterThan(1);
    });

    it('should handle edge case lightness values', () => {
      const maxLight: OKLCHColor = { l: 1, c: 0, h: 0 };
      const minLight: OKLCHColor = { l: 0, c: 0, h: 0 };

      const contrast = calculateContrast(maxLight, minLight);

      expect(contrast).toBeGreaterThan(TEST_CONSTANTS.CONTRAST.HIGH_THRESHOLD);
    });

    it('should handle very small lightness differences', () => {
      const color1: OKLCHColor = { l: 0.5, c: 0, h: 0 };
      const color2: OKLCHColor = { l: 0.5001, c: 0, h: 0 };

      const contrast = calculateContrast(color1, color2);

      expect(contrast).toBeGreaterThan(1);
      expect(contrast).toBeLessThan(1.1); // Very small difference
    });

    it('should handle alpha values in contrast calculation', () => {
      const opaqueColor: OKLCHColor = { l: 0.5, c: 0.1, h: 180, alpha: 1 };
      const transparentColor: OKLCHColor = {
        l: 0.5,
        c: 0.1,
        h: 180,
        alpha: 0.5,
      };

      // Alpha should not affect contrast calculation (only lightness matters primarily)
      const contrast = calculateContrast(opaqueColor, transparentColor);

      expect(contrast).toBe(1); // Same lightness should give contrast of 1
    });

    it('should handle extreme chroma values', () => {
      const highChroma: OKLCHColor = { l: 0.5, c: 1, h: 120 };
      const lowChroma: OKLCHColor = { l: 0.5, c: 0, h: 120 };

      const contrast = calculateContrast(highChroma, lowChroma);

      expect(contrast).toBeGreaterThan(1);
    });

    it('should handle extreme hue values', () => {
      const color1: OKLCHColor = { l: 0.5, c: 0.2, h: 0 };
      const color2: OKLCHColor = { l: 0.5, c: 0.2, h: 359.9 };

      const contrast = calculateContrast(color1, color2);

      expect(contrast).toBeGreaterThan(1);
    });

    it('should handle negative lightness values', () => {
      const negativeLight: OKLCHColor = { l: -0.1, c: 0, h: 0 };
      const positiveLight: OKLCHColor = { l: 0.1, c: 0, h: 0 };

      const contrast = calculateContrast(negativeLight, positiveLight);

      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle lightness values greater than 1', () => {
      const extremeLight: OKLCHColor = { l: 2, c: 0, h: 0 };
      const normalLight: OKLCHColor = { l: 0.5, c: 0, h: 0 };

      const contrast = calculateContrast(extremeLight, normalLight);

      expect(Number.isFinite(contrast)).toBe(true);
    });

    it('should handle NaN and Infinity values gracefully', () => {
      const nanColor: OKLCHColor = { l: NaN, c: 0, h: 0 };
      const infiniteColor: OKLCHColor = { l: Infinity, c: 0, h: 0 };
      const normalColor: OKLCHColor = { l: 0.5, c: 0, h: 0 };

      expect(() => calculateContrast(nanColor, normalColor)).not.toThrow();
      expect(() => calculateContrast(infiniteColor, normalColor)).not.toThrow();
    });

    it('should handle extreme combinations', () => {
      const extremeColor1: OKLCHColor = { l: 1000, c: 1000, h: 1000 };
      const extremeColor2: OKLCHColor = { l: -1000, c: -1000, h: -1000 };

      const contrast = calculateContrast(extremeColor1, extremeColor2);
      expect(Number.isFinite(contrast)).toBe(true);
    });
  });
});
