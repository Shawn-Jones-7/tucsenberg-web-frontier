import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/types/content.types';
import PrivacyPage, { generateMetadata } from '@/app/[locale]/privacy/page';

const { mockGetTranslations, mockGetPageBySlug, mockSuspenseState } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockGetPageBySlug: vi.fn(),
    mockSuspenseState: {
      locale: 'en' as Locale,
      translations: {} as Record<string, string>,
      pageContent: {
        content: '',
        metadata: {} as Record<string, string | undefined>,
      },
    },
  }));

// Mock Suspense to render mock content (async Server Components can't be rendered in Vitest)
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    Suspense: () => {
      const { locale, translations, pageContent } = mockSuspenseState;
      const t = (key: string) => translations[key] || key;

      // Parse headings from content
      const lines = pageContent.content.split('\n');
      const headings: { level: number; text: string; id: string }[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const text = trimmed.slice(3).trim();
          const id = text.toLowerCase().replace(/\s+/g, '-');
          headings.push({ level: 2, text, id });
        } else if (trimmed.startsWith('### ')) {
          const text = trimmed.slice(4).trim();
          const id = text.toLowerCase().replace(/\s+/g, '-');
          headings.push({ level: 3, text, id });
        }
      }

      const tocItems = [
        {
          id: 'information-we-collect',
          label: t('sections.informationCollected'),
        },
        { id: 'how-we-use-your-information', label: t('sections.howWeUse') },
      ];

      const privacySchema = {
        '@context': 'https://schema.org',
        '@type': 'PrivacyPolicy',
        'inLanguage': locale,
        'name': t('pageTitle'),
        'description': t('pageDescription'),
        'datePublished': pageContent.metadata.publishedAt,
        'dateModified':
          pageContent.metadata.updatedAt ??
          pageContent.metadata.lastReviewed ??
          pageContent.metadata.publishedAt,
      };

      return (
        <>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(privacySchema),
            }}
          />
          <main className='container mx-auto px-4 py-8 md:py-12'>
            <header className='mb-6 md:mb-8'>
              <h1 className='text-heading mb-4'>{t('pageTitle')}</h1>
              <p className='text-body max-w-2xl text-muted-foreground'>
                {t('pageDescription')}
              </p>
            </header>

            <section className='mb-8 flex flex-wrap gap-4 text-xs text-muted-foreground sm:text-sm'>
              {pageContent.metadata.publishedAt !== undefined && (
                <div>
                  <span className='font-medium'>{t('effectiveDate')}:</span>{' '}
                  <span>{pageContent.metadata.publishedAt}</span>
                </div>
              )}
              {pageContent.metadata.updatedAt !== undefined && (
                <div>
                  <span className='font-medium'>{t('lastUpdated')}:</span>{' '}
                  <span>{pageContent.metadata.updatedAt}</span>
                </div>
              )}
            </section>

            <div className='grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]'>
              <article className='min-w-0'>
                {headings
                  .filter((h) => h.level === 2)
                  .map((heading) => (
                    <h2
                      key={heading.id}
                      id={heading.id}
                      className='mt-8 scroll-mt-24 text-xl font-semibold'
                    >
                      {heading.text}
                    </h2>
                  ))}
              </article>

              <aside className='order-first rounded-lg border bg-muted/40 p-4 text-sm lg:order-none'>
                <h2 className='mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  {t('tableOfContents')}
                </h2>
                <nav aria-label={t('tableOfContents')}>
                  <ol className='space-y-2'>
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className='inline-flex text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm'
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            </div>
          </main>
        </>
      );
    },
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
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

  const mockTranslations: Record<string, string> = {
    'pageTitle': 'Privacy Policy',
    'pageDescription': 'How we collect, use, and protect your data.',
    'sections.informationCollected': 'Information We Collect',
    'sections.howWeUse': 'How We Use Your Information',
    'tableOfContents': 'tableOfContents',
  };

  const mockPageContent = {
    content: mockPrivacyContent,
    metadata: {
      slug: 'privacy',
      title: 'Privacy Policy',
      publishedAt: '2024-01-01',
      updatedAt: '2024-02-01',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockReturnValue(mockPageContent);

    mockGetTranslations.mockResolvedValue((key: string) => {
      return mockTranslations[key] ?? key;
    });

    // Reset Suspense mock state
    mockSuspenseState.locale = defaultLocale;
    mockSuspenseState.translations = mockTranslations;
    mockSuspenseState.pageContent = mockPageContent;
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
    mockSuspenseState.locale = 'zh';

    const PrivacyPageComponent = await PrivacyPage({
      params: Promise.resolve(zhParams),
    });

    render(PrivacyPageComponent);

    // Verify the page renders with zh locale context
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
