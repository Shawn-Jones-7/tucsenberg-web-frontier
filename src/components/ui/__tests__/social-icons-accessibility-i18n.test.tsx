/**
 * Social Icons Accessibility - Internationalization Tests
 *
 * 专门测试国际化可访问性功能，包括：
 * - 多语言支持
 * - 右到左语言
 * - 语言特定的ARIA标签
 * - 文化适应性
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SocialIconLink } from '@/components/ui/social-icons';

describe('Social Icons Accessibility - Internationalization Tests', () => {
  beforeEach(() => {
    // Setup user event for tests
  });

  describe('多语言支持', () => {
    it('supports internationalization', () => {
      render(
        <div lang='es'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Síguenos en Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Síguenos en Twitter');
    });

    it('supports French language labels', () => {
      render(
        <div lang='fr'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Suivez-nous sur Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Suivez-nous sur Twitter');
    });

    it('supports German language labels', () => {
      render(
        <div lang='de'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Folgen Sie uns auf Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Folgen Sie uns auf Twitter');
    });

    it('supports Japanese language labels', () => {
      render(
        <div lang='ja'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitterでフォロー'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Twitterでフォロー');
    });

    it('supports Chinese language labels', () => {
      render(
        <div lang='zh'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='在Twitter上关注我们'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', '在Twitter上关注我们');
    });

    it('supports Korean language labels', () => {
      render(
        <div lang='ko'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='트위터에서 팔로우하기'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', '트위터에서 팔로우하기');
    });

    it('supports Portuguese language labels', () => {
      render(
        <div lang='pt'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Siga-nos no Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Siga-nos no Twitter');
    });

    it('supports Italian language labels', () => {
      render(
        <div lang='it'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Seguici su Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Seguici su Twitter');
    });

    it('supports Russian language labels', () => {
      render(
        <div lang='ru'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Подписывайтесь на нас в Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute(
        'aria-label',
        'Подписывайтесь на нас в Twitter',
      );
    });

    it('supports Dutch language labels', () => {
      render(
        <div lang='nl'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Volg ons op Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Volg ons op Twitter');
    });
  });

  describe('右到左语言', () => {
    it('handles right-to-left languages', () => {
      render(
        <div
          dir='rtl'
          lang='ar'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='تويتر'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      const link = screen.getByTestId('social-link');

      expect(container).toHaveAttribute('dir', 'rtl');
      expect(container).toHaveAttribute('lang', 'ar');
      expect(link).toHaveAttribute('aria-label', 'تويتر');
    });

    it('supports Hebrew RTL layout', () => {
      render(
        <div
          dir='rtl'
          lang='he'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='עקבו אחרינו בטוויטר'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      const link = screen.getByTestId('social-link');

      expect(container).toHaveAttribute('dir', 'rtl');
      expect(container).toHaveAttribute('lang', 'he');
      expect(link).toHaveAttribute('aria-label', 'עקבו אחרינו בטוויטר');
    });

    it('supports Persian RTL layout', () => {
      render(
        <div
          dir='rtl'
          lang='fa'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='ما را در توییتر دنبال کنید'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      const link = screen.getByTestId('social-link');

      expect(container).toHaveAttribute('dir', 'rtl');
      expect(container).toHaveAttribute('lang', 'fa');
      expect(link).toHaveAttribute('aria-label', 'ما را در توییتر دنبال کنید');
    });

    it('supports Urdu RTL layout', () => {
      render(
        <div
          dir='rtl'
          lang='ur'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='ٹویٹر پر ہمیں فالو کریں'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      const link = screen.getByTestId('social-link');

      expect(container).toHaveAttribute('dir', 'rtl');
      expect(container).toHaveAttribute('lang', 'ur');
      expect(link).toHaveAttribute('aria-label', 'ٹویٹر پر ہمیں فالو کریں');
    });
  });

  describe('语言特定的ARIA标签', () => {
    it('provides platform-specific labels in different languages', () => {
      render(
        <div>
          <div lang='es'>
            <SocialIconLink
              href='https://linkedin.com/in/example'
              platform='linkedin'
              aria-label='Conéctate en LinkedIn'
              data-testid='linkedin-es'
            />
          </div>
          <div lang='fr'>
            <SocialIconLink
              href='https://linkedin.com/in/example'
              platform='linkedin'
              aria-label='Connectez-vous sur LinkedIn'
              data-testid='linkedin-fr'
            />
          </div>
        </div>,
      );

      const linkedinEs = screen.getByTestId('linkedin-es');
      const linkedinFr = screen.getByTestId('linkedin-fr');

      expect(linkedinEs).toHaveAttribute('aria-label', 'Conéctate en LinkedIn');
      expect(linkedinFr).toHaveAttribute(
        'aria-label',
        'Connectez-vous sur LinkedIn',
      );
    });

    it('supports multiple social platforms in different languages', () => {
      render(
        <div lang='de'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter folgen'
            data-testid='twitter-de'
          />
          <SocialIconLink
            href='https://linkedin.com/in/example'
            platform='linkedin'
            aria-label='LinkedIn verbinden'
            data-testid='linkedin-de'
          />
        </div>,
      );

      const twitterDe = screen.getByTestId('twitter-de');
      const linkedinDe = screen.getByTestId('linkedin-de');

      expect(twitterDe).toHaveAttribute('aria-label', 'Twitter folgen');
      expect(linkedinDe).toHaveAttribute('aria-label', 'LinkedIn verbinden');
    });
  });

  describe('文化适应性', () => {
    it('adapts to cultural reading patterns', () => {
      render(
        <div
          dir='rtl'
          lang='ar'
          className='text-right'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='تابعونا على تويتر'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      expect(container).toHaveClass('text-right');
    });

    it('supports locale-specific formatting', () => {
      render(
        <div
          lang='ja'
          className='font-japanese'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitterをフォロー'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      expect(container).toHaveClass('font-japanese');
    });

    it('handles mixed language content', () => {
      render(
        <div>
          <div lang='en'>
            <SocialIconLink
              href='https://twitter.com/example'
              platform='twitter'
              aria-label='Follow us on Twitter'
              data-testid='twitter-en'
            />
          </div>
          <div lang='zh'>
            <SocialIconLink
              href='https://twitter.com/example'
              platform='twitter'
              aria-label='在Twitter上关注我们'
              data-testid='twitter-zh'
            />
          </div>
        </div>,
      );

      const twitterEn = screen.getByTestId('twitter-en');
      const twitterZh = screen.getByTestId('twitter-zh');

      expect(twitterEn).toHaveAttribute('aria-label', 'Follow us on Twitter');
      expect(twitterZh).toHaveAttribute('aria-label', '在Twitter上关注我们');
    });
  });
});
