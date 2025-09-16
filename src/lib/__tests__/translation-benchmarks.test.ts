import { beforeEach, describe, expect, it } from 'vitest';
import type { Locale } from '@/types/i18n';
import { TranslationBenchmarks } from '@/lib/translation-benchmarks';
import type { QualityBenchmark } from '@/lib/translation-quality-types';

describe('TranslationBenchmarks', () => {
  let benchmarks: TranslationBenchmarks;

  beforeEach(() => {
    benchmarks = new TranslationBenchmarks();
  });

  describe('initialize', () => {
    it('should initialize with default benchmarks', () => {
      benchmarks.initialize();

      const enBenchmark = benchmarks.getBenchmark('en' as Locale);
      const zhBenchmark = benchmarks.getBenchmark('zh' as Locale);

      expect(enBenchmark).toBeDefined();
      expect(zhBenchmark).toBeDefined();
      expect(enBenchmark?.locale).toBe('en');
      expect(zhBenchmark?.locale).toBe('zh');
    });

    it('should load English benchmark with correct values', () => {
      benchmarks.initialize();

      const enBenchmark = benchmarks.getBenchmark('en' as Locale);

      expect(enBenchmark).toEqual({
        locale: 'en',
        averageScore: 85,
        benchmarkDate: '2024-01-01',
        sampleSize: 1000,
        categories: {
          grammar: 88,
          consistency: 82,
          terminology: 85,
          fluency: 87,
        },
      });
    });

    it('should load Chinese benchmark with correct values', () => {
      benchmarks.initialize();

      const zhBenchmark = benchmarks.getBenchmark('zh' as Locale);

      expect(zhBenchmark).toEqual({
        locale: 'zh',
        averageScore: 82,
        benchmarkDate: '2024-01-01',
        sampleSize: 800,
        categories: {
          grammar: 85,
          consistency: 80,
          terminology: 83,
          fluency: 84,
        },
      });
    });
  });

  describe('setBenchmark and getBenchmark', () => {
    it('should set and get benchmark correctly', () => {
      const customBenchmark: QualityBenchmark = {
        locale: 'fr' as Locale,
        averageScore: 80,
        benchmarkDate: '2024-02-01',
        sampleSize: 500,
        categories: {
          grammar: 82,
          consistency: 78,
          terminology: 81,
          fluency: 79,
        },
      };

      benchmarks.setBenchmark('fr' as Locale, customBenchmark);
      const retrieved = benchmarks.getBenchmark('fr' as Locale);

      expect(retrieved).toEqual(customBenchmark);
    });

    it('should return undefined for non-existent benchmark', () => {
      const result = benchmarks.getBenchmark('de' as Locale);
      expect(result).toBeUndefined();
    });

    it('should overwrite existing benchmark', () => {
      benchmarks.initialize();

      const newEnBenchmark: QualityBenchmark = {
        locale: 'en' as Locale,
        averageScore: 90,
        benchmarkDate: '2024-03-01',
        sampleSize: 1200,
        categories: {
          grammar: 92,
          consistency: 88,
          terminology: 90,
          fluency: 91,
        },
      };

      benchmarks.setBenchmark('en' as Locale, newEnBenchmark);
      const retrieved = benchmarks.getBenchmark('en' as Locale);

      expect(retrieved).toEqual(newEnBenchmark);
      expect(retrieved?.averageScore).toBe(90);
    });
  });

  describe('compareWithBenchmark', () => {
    beforeEach(() => {
      benchmarks.initialize();
    });

    it('should compare current score with benchmark and calculate improvement', () => {
      const currentScore = {
        score: 90,
        confidence: 0.9,
        issues: [],
        suggestions: [],
        grammar: 92,
        consistency: 88,
        terminology: 90,
        fluency: 91,
      };

      const comparison = benchmarks.compareWithBenchmark(
        currentScore,
        'en' as Locale,
      );

      expect(comparison.current).toEqual(currentScore);
      expect(comparison.benchmark.locale).toBe('en');
      expect(comparison.improvement).toBeCloseTo(5.88, 1); // (90-85)/85 * 100
      expect(comparison.recommendations).toBeDefined();
      expect(Array.isArray(comparison.recommendations)).toBe(true);
    });

    it('should throw error for non-existent benchmark', () => {
      const currentScore = {
        score: 85,
        confidence: 0.8,
        issues: [],
        suggestions: [],
        grammar: 85,
        consistency: 85,
        terminology: 85,
        fluency: 85,
      };

      expect(() => {
        benchmarks.compareWithBenchmark(currentScore, 'de' as Locale);
      }).toThrow('No benchmark available for locale: de');
    });

    it('should generate positive recommendations for high scores', () => {
      const currentScore = {
        score: 95,
        confidence: 0.95,
        issues: [],
        suggestions: [],
        grammar: 95,
        consistency: 95,
        terminology: 95,
        fluency: 95,
      };

      const comparison = benchmarks.compareWithBenchmark(
        currentScore,
        'en' as Locale,
      );

      expect(comparison.improvement).toBeGreaterThan(10);
      expect(comparison.recommendations).toContain(
        'Excellent quality! Above benchmark standards.',
      );
    });

    it('should generate improvement recommendations for low scores', () => {
      const currentScore = {
        score: 70,
        confidence: 0.7,
        issues: [],
        suggestions: [],
        grammar: 75,
        consistency: 70,
        terminology: 72,
        fluency: 73,
      };

      const comparison = benchmarks.compareWithBenchmark(
        currentScore,
        'en' as Locale,
      );

      expect(comparison.improvement).toBeLessThan(-10);
      expect(comparison.recommendations).toContain(
        'Overall quality is significantly below benchmark. Consider comprehensive review.',
      );
    });

    it('should generate specific category recommendations', () => {
      const currentScore = {
        score: 85,
        confidence: 0.85,
        issues: [],
        suggestions: [],
        grammar: 80, // Below benchmark (88)
        consistency: 75, // Below benchmark (82)
        terminology: 85, // Equal to benchmark
        fluency: 87, // Equal to benchmark
      };

      const comparison = benchmarks.compareWithBenchmark(
        currentScore,
        'en' as Locale,
      );

      expect(comparison.recommendations).toContain(
        'Grammar score below benchmark. Review grammatical accuracy.',
      );
      expect(comparison.recommendations).toContain(
        'Consistency score below benchmark. Ensure terminology consistency.',
      );
      expect(comparison.recommendations).not.toContain(
        'Terminology score below benchmark. Review domain-specific terms.',
      );
      expect(comparison.recommendations).not.toContain(
        'Fluency score below benchmark. Improve natural language flow.',
      );
    });

    it('should handle moderate improvement correctly', () => {
      const currentScore = {
        score: 82,
        confidence: 0.82,
        issues: [],
        suggestions: [],
        grammar: 85,
        consistency: 80,
        terminology: 83,
        fluency: 84,
      };

      const comparison = benchmarks.compareWithBenchmark(
        currentScore,
        'en' as Locale,
      );

      expect(comparison.improvement).toBeCloseTo(-3.53, 1); // (82-85)/85 * 100
      expect(comparison.recommendations).toContain(
        'Quality is below benchmark. Focus on identified issues.',
      );
    });
  });
});
