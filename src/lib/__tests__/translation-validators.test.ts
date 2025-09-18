import { describe, expect, it } from 'vitest';
import type { Locale } from '@/types/i18n';
import { VALIDATION_THRESHOLDS } from '@/constants/i18n-constants';
import { TranslationValidators } from '@/lib/translation-validators';

describe('TranslationValidators', () => {
  describe('performBasicValidation', () => {
    it('should detect empty translation', () => {
      const result = TranslationValidators.performBasicValidation(
        'Hello world',
        '',
      );

      expect(result.issues.length).toBeGreaterThan(0);
      const missingIssue = result.issues.find(
        (issue) => issue.type === 'missing',
      );
      expect(missingIssue).toBeDefined();
      expect(missingIssue?.severity).toBe('high');
      expect(missingIssue?.message).toBe('Translation is empty');
      expect(result.penalty).toBeGreaterThanOrEqual(
        VALIDATION_THRESHOLDS.EMPTY_TRANSLATION_PENALTY,
      );
    });

    it('should detect empty translation with whitespace only', () => {
      const result = TranslationValidators.performBasicValidation(
        'Hello world',
        '   \n_t  ',
      );

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.type).toBe('missing');
      expect(result.penalty).toBe(
        VALIDATION_THRESHOLDS.EMPTY_TRANSLATION_PENALTY,
      );
    });

    it('should detect placeholder count mismatch', () => {
      const result = TranslationValidators.performBasicValidation(
        'Hello {name}, you have {count} messages',
        'Hello {name}, you have messages',
      );

      expect(result.issues.length).toBeGreaterThan(0);
      const placeholderIssue = result.issues.find(
        (issue) => issue.type === 'placeholder',
      );
      expect(placeholderIssue).toBeDefined();
      expect(placeholderIssue?.severity).toBe('high');
      expect(placeholderIssue?.message).toBe('Placeholder count mismatch');
      expect(result.penalty).toBeGreaterThanOrEqual(
        VALIDATION_THRESHOLDS.PLACEHOLDER_MISMATCH_PENALTY,
      );
    });

    it('should detect missing specific placeholders', () => {
      const result = TranslationValidators.performBasicValidation(
        'Welcome {username} to {platform}',
        'Welcome {username} to our site',
      );

      expect(result.issues).toHaveLength(2); // Both placeholder mismatch and missing placeholder
      const missingPlaceholderIssue = result.issues.find((issue) =>
        issue.message.includes('Missing placeholders'),
      );
      expect(missingPlaceholderIssue).toBeDefined();
      expect(missingPlaceholderIssue?.message).toContain('platform');
    });

    it('should detect significant length differences', () => {
      const shortTranslation = TranslationValidators.performBasicValidation(
        'This is a very long original text that should be translated properly',
        'Short',
      );

      expect(shortTranslation.issues).toHaveLength(1);
      expect(shortTranslation.issues[0]?.type).toBe('length');
      expect(shortTranslation.issues[0]?.severity).toBe('medium');

      const longTranslation = TranslationValidators.performBasicValidation(
        'Short',
        'This is an extremely long translation that goes way beyond what would be reasonable for such a short original text',
      );

      expect(longTranslation.issues).toHaveLength(1);
      expect(longTranslation.issues[0]?.type).toBe('length');
    });

    it('should pass validation for good translation', () => {
      const result = TranslationValidators.performBasicValidation(
        'Hello {name}, welcome to our platform!',
        'Hola {name}, ¡bienvenido a nuestra plataforma!',
      );

      expect(result.issues).toHaveLength(0);
      expect(result.penalty).toBe(0);
    });

    it('should handle text without placeholders', () => {
      const result = TranslationValidators.performBasicValidation(
        'Simple text without placeholders',
        'Texto simple sin marcadores de posición',
      );

      expect(result.issues).toHaveLength(0);
      expect(result.penalty).toBe(0);
    });
  });

  describe('performLanguageSpecificValidation', () => {
    it('should detect traditional Chinese in simplified Chinese locale', () => {
      const result = TranslationValidators.performLanguageSpecificValidation(
        '繁體字檢測',
        'zh' as Locale,
      );

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.type).toBe('language');
      expect(result.issues[0]?.severity).toBe('medium');
      expect(result.issues[0]?.message).toBe(
        'Contains traditional Chinese characters',
      );
      expect(result.penalty).toBe(5);
    });

    it('should pass simplified Chinese validation', () => {
      const result = TranslationValidators.performLanguageSpecificValidation(
        '这是简体中文文本',
        'zh' as Locale,
      );

      expect(result.issues).toHaveLength(0);
      expect(result.penalty).toBe(0);
    });

    it('should detect grammar issues in English', () => {
      const result = TranslationValidators.performLanguageSpecificValidation(
        'This is a a duplicate word and and another one',
        'en' as Locale,
      );

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.type).toBe('grammar');
      expect(result.issues[0]?.severity).toBe('medium');
      expect(result.issues[0]?.message).toBe(
        'Potential grammar issues detected',
      );
      expect(result.penalty).toBe(8);
    });

    it('should pass good English validation', () => {
      const result = TranslationValidators.performLanguageSpecificValidation(
        'This is a well-written English sentence.',
        'en' as Locale,
      );

      expect(result.issues).toHaveLength(0);
      expect(result.penalty).toBe(0);
    });

    it('should handle unsupported locales gracefully', () => {
      const result = TranslationValidators.performLanguageSpecificValidation(
        'Some text in unsupported locale',
        'fr' as Locale,
      );

      expect(result.issues).toHaveLength(0);
      expect(result.penalty).toBe(0);
    });
  });

  describe('compareWithHumanTranslation', () => {
    it('should detect low similarity with human translation', () => {
      const result = TranslationValidators.compareWithHumanTranslation(
        'Completely different AI translation',
        'Totally unrelated human reference text',
      );

      expect(result.issues.length).toBeGreaterThan(0);
      const accuracyIssue = result.issues.find(
        (issue) => issue.type === 'accuracy',
      );
      expect(accuracyIssue).toBeDefined();
      expect(accuracyIssue?.severity).toBe('high');
      expect(accuracyIssue?.message).toBe(
        'AI translation significantly differs from human reference',
      );
      expect(result.penalty).toBeGreaterThanOrEqual(25);
    });

    it('should detect moderate similarity differences', () => {
      const result = TranslationValidators.compareWithHumanTranslation(
        'Hello world this is a test',
        'Hello world this is different content',
      );

      expect(result.issues.length).toBeGreaterThan(0);
      const accuracyIssue = result.issues.find(
        (issue) => issue.type === 'accuracy',
      );
      expect(accuracyIssue).toBeDefined();
      expect(accuracyIssue?.severity).toBe('medium');
      expect(result.penalty).toBeGreaterThanOrEqual(15);
    });

    it('should detect missing key terms', () => {
      const result = TranslationValidators.compareWithHumanTranslation(
        'Simple translation without important terms',
        'Professional translation with technical terminology and specialized vocabulary',
      );

      const terminologyIssue = result.issues.find(
        (issue) => issue.type === 'terminology',
      );
      expect(terminologyIssue).toBeDefined();
      expect(terminologyIssue?.message).toContain('Missing key terms');
      expect(
        (terminologyIssue as { penalty?: number })?.penalty ||
          (result as { penalty?: number }).penalty,
      ).toBeGreaterThan(0);
    });

    it('should pass for similar translations', () => {
      const result = TranslationValidators.compareWithHumanTranslation(
        'Hello world welcome to our platform',
        'Hello world welcome to our amazing platform',
      );

      // Should have no accuracy issues (similarity > 0.6)
      const accuracyIssues = result.issues.filter(
        (issue) => issue.type === 'accuracy',
      );
      expect(accuracyIssues).toHaveLength(0);
    });
  });

  describe('checkContextRelevance', () => {
    it('should detect missing error terms in error context', () => {
      const issues = TranslationValidators.checkContextRelevance(
        'user.error.validation',
        'Please check your input',
      );

      expect(issues).toHaveLength(1);
      expect(issues[0]?.type).toBe('context');
      expect(issues[0]?.severity).toBe('medium');
      expect(issues[0]?.message).toBe(
        'Error context not reflected in translation',
      );
    });

    it('should pass when error terms are present', () => {
      const issues = TranslationValidators.checkContextRelevance(
        'user.error.validation',
        'Error: Invalid input provided',
      );

      expect(issues).toHaveLength(0);
    });

    it('should pass when error terms are present in Chinese', () => {
      const issues = TranslationValidators.checkContextRelevance(
        'user.error.validation',
        '错误：输入无效',
      );

      expect(issues).toHaveLength(0);
    });

    it('should handle non-error contexts gracefully', () => {
      const issues = TranslationValidators.checkContextRelevance(
        'user.welcome.message',
        'Welcome to our platform',
      );

      expect(issues).toHaveLength(0);
    });
  });
});
