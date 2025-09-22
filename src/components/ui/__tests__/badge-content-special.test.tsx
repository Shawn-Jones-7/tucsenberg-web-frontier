/**
 * @vitest-environment jsdom
 */

/**
 * Badge Content - Special Characters Tests
 *
 * 专门测试特殊字符内容渲染，包括：
 * - 特殊字符
 * - Unicode字符
 * - HTML实体
 * - 数学符号
 * - 货币符号
 */

import { Badge } from '@/components/ui/badge';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Badge Content - Special Characters Tests', () => {
  describe('特殊字符渲染', () => {
    it('renders special characters', () => {
      render(<Badge>Special: @#$%^&*()</Badge>);

      const badge = screen.getByText('Special: @#$%^&*()');
      expect(badge).toHaveTextContent('Special: @#$%^&*()');
    });

    it('renders unicode characters', () => {
      render(<Badge>Unicode: 🎉 ✨ 🚀</Badge>);

      const badge = screen.getByText('Unicode: 🎉 ✨ 🚀');
      expect(badge).toHaveTextContent('Unicode: 🎉 ✨ 🚀');
    });

    it('renders HTML entities correctly', () => {
      render(<Badge>&lt;HTML&gt; &amp; Entities</Badge>);

      const badge = screen.getByText('<HTML> & Entities');
      expect(badge).toHaveTextContent('<HTML> & Entities');
    });

    it('renders mathematical symbols', () => {
      render(<Badge>Math: ∑ ∫ ∞ ≠ ≤ ≥</Badge>);

      const badge = screen.getByText('Math: ∑ ∫ ∞ ≠ ≤ ≥');
      expect(badge).toHaveTextContent('Math: ∑ ∫ ∞ ≠ ≤ ≥');
    });

    it('renders currency symbols', () => {
      render(<Badge>Currency: $ € £ ¥ ₹</Badge>);

      const badge = screen.getByText('Currency: $ € £ ¥ ₹');
      expect(badge).toHaveTextContent('Currency: $ € £ ¥ ₹');
    });

    it('renders punctuation marks', () => {
      render(<Badge>Punctuation: .,;:!?</Badge>);

      const badge = screen.getByText('Punctuation: .,;:!?');
      expect(badge).toHaveTextContent('Punctuation: .,;:!?');
    });

    it('renders quotation marks', () => {
      render(<Badge>Quotes: "Hello" 'World'</Badge>);

      const badge = screen.getByText('Quotes: "Hello" \'World\'');
      expect(badge).toHaveTextContent('Quotes: "Hello" \'World\'');
    });

    it('renders brackets and parentheses', () => {
      render(<Badge data-testid="brackets-badge">Brackets: [] {'{}'} ()</Badge>);

      const badge = screen.getByTestId('brackets-badge');
      expect(badge).toHaveTextContent('Brackets: [] {} ()');
    });

    it('renders operators', () => {
      render(<Badge>Operators: + - * / = %</Badge>);

      const badge = screen.getByText('Operators: + - * / = %');
      expect(badge).toHaveTextContent('Operators: + - * / = %');
    });

    it('renders comparison operators', () => {
      render(<Badge>Compare: &lt; &gt; &lt;= &gt;=</Badge>);

      const badge = screen.getByText('Compare: < > <= >=');
      expect(badge).toHaveTextContent('Compare: < > <= >=');
    });
  });

  describe('国际化字符', () => {
    it('renders Chinese characters', () => {
      render(<Badge>中文测试</Badge>);

      const badge = screen.getByText('中文测试');
      expect(badge).toHaveTextContent('中文测试');
    });

    it('renders Japanese characters', () => {
      render(<Badge>日本語テスト</Badge>);

      const badge = screen.getByText('日本語テスト');
      expect(badge).toHaveTextContent('日本語テスト');
    });

    it('renders Korean characters', () => {
      render(<Badge>한국어 테스트</Badge>);

      const badge = screen.getByText('한국어 테스트');
      expect(badge).toHaveTextContent('한국어 테스트');
    });

    it('renders Arabic characters', () => {
      render(<Badge>اختبار عربي</Badge>);

      const badge = screen.getByText('اختبار عربي');
      expect(badge).toHaveTextContent('اختبار عربي');
    });

    it('renders Hebrew characters', () => {
      render(<Badge>בדיקה עברית</Badge>);

      const badge = screen.getByText('בדיקה עברית');
      expect(badge).toHaveTextContent('בדיקה עברית');
    });

    it('renders Russian characters', () => {
      render(<Badge>Русский тест</Badge>);

      const badge = screen.getByText('Русский тест');
      expect(badge).toHaveTextContent('Русский тест');
    });

    it('renders Greek characters', () => {
      render(<Badge>Ελληνικό τεστ</Badge>);

      const badge = screen.getByText('Ελληνικό τεστ');
      expect(badge).toHaveTextContent('Ελληνικό τεστ');
    });

    it('renders accented characters', () => {
      render(<Badge>Café résumé naïve</Badge>);

      const badge = screen.getByText('Café résumé naïve');
      expect(badge).toHaveTextContent('Café résumé naïve');
    });

    it('renders mixed languages', () => {
      render(<Badge>Hello 世界 мир</Badge>);

      const badge = screen.getByText('Hello 世界 мир');
      expect(badge).toHaveTextContent('Hello 世界 мир');
    });
  });

  describe('符号和图标', () => {
    it('renders arrow symbols', () => {
      render(<Badge>Arrows: ← → ↑ ↓ ↔</Badge>);

      const badge = screen.getByText('Arrows: ← → ↑ ↓ ↔');
      expect(badge).toHaveTextContent('Arrows: ← → ↑ ↓ ↔');
    });

    it('renders geometric shapes', () => {
      render(<Badge>Shapes: ■ ● ▲ ◆ ★</Badge>);

      const badge = screen.getByText('Shapes: ■ ● ▲ ◆ ★');
      expect(badge).toHaveTextContent('Shapes: ■ ● ▲ ◆ ★');
    });

    it('renders checkmarks and crosses', () => {
      render(<Badge>Marks: ✓ ✗ ✔ ✘ ☑</Badge>);

      const badge = screen.getByText('Marks: ✓ ✗ ✔ ✘ ☑');
      expect(badge).toHaveTextContent('Marks: ✓ ✗ ✔ ✘ ☑');
    });

    it('renders weather symbols', () => {
      render(<Badge>Weather: ☀ ☁ ☂ ❄ ⚡</Badge>);

      const badge = screen.getByText('Weather: ☀ ☁ ☂ ❄ ⚡');
      expect(badge).toHaveTextContent('Weather: ☀ ☁ ☂ ❄ ⚡');
    });

    it('renders music symbols', () => {
      render(<Badge>Music: ♪ ♫ ♬ ♭ ♯</Badge>);

      const badge = screen.getByText('Music: ♪ ♫ ♬ ♭ ♯');
      expect(badge).toHaveTextContent('Music: ♪ ♫ ♬ ♭ ♯');
    });

    it('renders card suits', () => {
      render(<Badge>Cards: ♠ ♥ ♦ ♣</Badge>);

      const badge = screen.getByText('Cards: ♠ ♥ ♦ ♣');
      expect(badge).toHaveTextContent('Cards: ♠ ♥ ♦ ♣');
    });

    it('renders zodiac symbols', () => {
      render(<Badge>Zodiac: ♈ ♉ ♊ ♋ ♌</Badge>);

      const badge = screen.getByText('Zodiac: ♈ ♉ ♊ ♋ ♌');
      expect(badge).toHaveTextContent('Zodiac: ♈ ♉ ♊ ♋ ♌');
    });

    it('renders miscellaneous symbols', () => {
      render(<Badge>Misc: © ® ™ § ¶</Badge>);

      const badge = screen.getByText('Misc: © ® ™ § ¶');
      expect(badge).toHaveTextContent('Misc: © ® ™ § ¶');
    });
  });

  describe('技术符号', () => {
    it('renders programming symbols', () => {
      render(<Badge data-testid="programming-badge">Code: {'{}'} [] () &lt;&gt;</Badge>);

      const badge = screen.getByTestId('programming-badge');
      expect(badge).toHaveTextContent('Code: {} [] () <>');
    });

    it('renders network symbols', () => {
      render(<Badge>Network: @ # $ %</Badge>);

      const badge = screen.getByText('Network: @ # $ %');
      expect(badge).toHaveTextContent('Network: @ # $ %');
    });

    it('renders file path separators', () => {
      render(<Badge data-testid="path-badge">Path: / \\ | :</Badge>);

      const badge = screen.getByTestId('path-badge');
      expect(badge).toHaveTextContent('Path: / \\\\ | :');
    });

    it('renders escape sequences', () => {
      render(<Badge data-testid="escape-badge">Escape: \\n \\t \\r \\&quot;</Badge>);

      const badge = screen.getByTestId('escape-badge');
      expect(badge).toHaveTextContent('Escape: \\\\n \\\\t \\\\r \\\\"');
    });

    it('renders regex patterns', () => {
      render(<Badge>Regex: ^$ .* +? [a-z]</Badge>);

      const badge = screen.getByText('Regex: ^$ .* +? [a-z]');
      expect(badge).toHaveTextContent('Regex: ^$ .* +? [a-z]');
    });

    it('renders SQL operators', () => {
      render(<Badge>SQL: = != &lt;&gt; LIKE IN</Badge>);

      const badge = screen.getByText('SQL: = != <> LIKE IN');
      expect(badge).toHaveTextContent('SQL: = != <> LIKE IN');
    });

    it('renders markdown syntax', () => {
      render(<Badge>Markdown: # ** __ ~~</Badge>);

      const badge = screen.getByText('Markdown: # ** __ ~~');
      expect(badge).toHaveTextContent('Markdown: # ** __ ~~');
    });

    it('renders URL components', () => {
      render(<Badge>URL: :// ? & = #</Badge>);

      const badge = screen.getByText('URL: :// ? & = #');
      expect(badge).toHaveTextContent('URL: :// ? & = #');
    });
  });
});
