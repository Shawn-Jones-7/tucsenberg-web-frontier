import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/types/content';
import PrivacyPage, { generateMetadata } from '@/app/[locale]/privacy/page';

const { mockGetTranslations, mockGetPageBySlug, mockHeaders } = vi.hoisted(
  () => ({
    mockGetTranslations: vi.fn(),
    mockGetPageBySlug: vi.fn(),
    mockHeaders: vi.fn(),
  }),
);

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

vi.mock('@/lib/content', () => ({
  getPageBySlug: mockGetPageBySlug,
}));

const mockPrivacyContent = `
## Information We Collect
We collect data to provide better services to all our users.

### Personal Information
Personal information includes your name, email address, and phone number.

## How We Use Your Information
We use the collected data to maintain and improve our services.
`;

const createParams = (locale: Locale) => ({
  locale,
});

describe('Privacy Page', () => {
  const defaultLocale: Locale = 'en';

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockReturnValue({
      content: mockPrivacyContent,
      metadata: {
        slug: 'privacy',
        title: 'Privacy Policy',
        publishedAt: '2024-01-01',
        updatedAt: '2024-02-01',
      },
    });

    mockGetTranslations.mockResolvedValue((key: string) => {
      const map: Record<string, string> = {
        'pageTitle': 'Privacy Policy',
        'pageDescription': 'How we collect, use, and protect your data.',
        'sections.informationCollected': 'Information We Collect',
        'sections.howWeUse': 'How We Use Your Information',
      };
      return map[key] ?? key;
    });

    mockHeaders.mockResolvedValue({
      get: (name: string) => (name === 'x-csp-nonce' ? 'privacy-nonce' : null),
    });
  });

  it('应该正确生成 metadata（多语言）', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve(createParams(defaultLocale)),
    });

    expect(metadata.title).toBe('Privacy Policy');
    expect(metadata.description).toBe(
      'How we collect, use, and protect your data.',
    );

    expect(mockGetTranslations).toHaveBeenCalledWith({
      locale: defaultLocale,
      namespace: 'privacy',
    });
  });

  it('应该从内容中提取 heading 并生成 TOC 锚点', async () => {
    const PrivacyPageComponent = await PrivacyPage({
      params: Promise.resolve(createParams(defaultLocale)),
    });

    const { container } = render(PrivacyPageComponent);

    // 检查正文区域中的 H2 标题正确渲染并带有 id（用于目录锚点）
    const articleHeadings = container.querySelectorAll('article h2');
    expect(articleHeadings.length).toBeGreaterThanOrEqual(2);
    articleHeadings.forEach((heading) => {
      expect(heading.id).toBeTruthy();
    });

    // TOC 容器中应该包含对应的链接文本（限定在导航区域内，避免和正文 H2 冲突）
    const tocNav = screen.getByRole('navigation', { name: 'tableOfContents' });
    expect(
      within(tocNav).getByText('Information We Collect'),
    ).toBeInTheDocument();
    expect(
      within(tocNav).getByText('How We Use Your Information'),
    ).toBeInTheDocument();
  });

  it('应该注入 PrivacyPolicy 类型的 JSON-LD schema', async () => {
    const PrivacyPageComponent = await PrivacyPage({
      params: Promise.resolve(createParams(defaultLocale)),
    });

    const { container } = render(PrivacyPageComponent);

    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    expect(script?.getAttribute('nonce')).toBe('privacy-nonce');

    const json = script?.textContent ?? '';
    const parsed = JSON.parse(json) as {
      '@type'?: string;
      'inLanguage'?: string;
      'name'?: string;
      'description'?: string;
    };

    expect(parsed['@type']).toBe('PrivacyPolicy');
    expect(parsed.inLanguage).toBe(defaultLocale);
    expect(parsed.name).toBe('Privacy Policy');
    expect(parsed.description).toBe(
      'How we collect, use, and protect your data.',
    );
  });

  it('应该支持不同 locale（zh）', async () => {
    const zhParams = createParams('zh');

    await PrivacyPage({ params: Promise.resolve(zhParams) });

    expect(mockGetTranslations).toHaveBeenCalledWith({
      locale: 'zh',
      namespace: 'privacy',
    });
  });
});
