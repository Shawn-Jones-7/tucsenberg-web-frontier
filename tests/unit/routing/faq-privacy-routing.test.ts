import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

describe('routing 配置 - FAQ & Privacy', () => {
  it('应该在 pathnames 中包含 /faq 和 /privacy 路由', () => {
    const pathnames = routing.pathnames ?? {};

    expect(Object.prototype.hasOwnProperty.call(pathnames, '/faq')).toBe(true);
    expect(pathnames['/faq']).toBe('/faq');

    expect(Object.prototype.hasOwnProperty.call(pathnames, '/privacy')).toBe(
      true,
    );
    expect(pathnames['/privacy']).toBe('/privacy');
  });

  it('应该为所有支持的 locale 生成包含 /faq 和 /privacy 的路径', () => {
    const locales = routing.locales;

    locales.forEach((locale) => {
      const faqPath = `/${locale}/faq`;
      const privacyPath = `/${locale}/privacy`;

      expect(faqPath).toContain(`/${locale}/faq`);
      expect(privacyPath).toContain(`/${locale}/privacy`);
    });
  });
});
