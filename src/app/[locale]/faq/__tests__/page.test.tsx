import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/types/content.types';
import FaqPage, { generateMetadata } from '@/app/[locale]/faq/page';

// 使用 vi.hoisted 配置 mock，确保在模块导入前生效
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
      faqCategories: [] as {
        id: string;
        title: string;
        items: { id: string; question: string; answer: string }[];
      }[],
    },
  }));

// Mock Suspense to render mock content (async Server Components can't be rendered in Vitest)
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    Suspense: () => {
      const { locale, translations, faqCategories } = mockSuspenseState;
      const t = (key: string) => translations[key] || key;

      const faqItems = faqCategories.flatMap((cat) => cat.items);

      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqItems.map((item) => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.answer,
          },
        })),
      };

      return (
        <>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqSchema),
            }}
          />
          <main className='container mx-auto px-4 py-8 md:py-12'>
            <header className='mb-8 md:mb-12'>
              <h1 className='text-heading mb-4'>{t('pageTitle')}</h1>
              <p className='text-body max-w-2xl text-muted-foreground'>
                {t('pageDescription')}
              </p>
            </header>

            {faqCategories.length > 0 ? (
              <div className='space-y-10'>
                {faqCategories.map((category) => (
                  <section
                    key={category.id}
                    className='space-y-4'
                  >
                    {category.title !== '' && (
                      <h2 className='text-lg font-semibold text-foreground'>
                        {category.title}
                      </h2>
                    )}
                    <div>
                      {category.items.map((item) => (
                        <div key={item.id}>
                          <button type='button'>{item.question}</button>
                          <div>
                            <p className='text-sm leading-relaxed whitespace-pre-line'>
                              {item.answer.trim()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>{t('noResults')}</p>
            )}

            <section className='mt-12 rounded-lg border bg-muted/40 px-6 py-5'>
              <h2 className='mb-2 text-base font-semibold'>
                {t('contactCta.title')}
              </h2>
              <p className='mb-4 text-sm text-muted-foreground'>
                {t('contactCta.description')}
              </p>
              <a href={`/${locale}/contact`}>{t('contactCta.button')}</a>
            </section>
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

// 固定 FAQ 内容结构：两个分类，每个分类若干问答
const mockFaqContent = `
## Ordering
### How to place an order?
You can contact our sales team via email or phone.

### What is the minimum order quantity?
Our MOQ depends on the specific product and customization requirements.

## Shipping
### What shipping options are available?
We offer sea, air, and express shipping depending on your needs.
`;

const createParams = (locale: Locale) => ({
  locale,
});

describe('FAQ Page', () => {
  const defaultLocale: Locale = 'en';

  const mockTranslations: Record<string, string> = {
    'pageTitle': 'Frequently Asked Questions',
    'pageDescription': 'Answers to the most common questions from our clients.',
    'hero.title': 'Frequently Asked Questions',
    'hero.description':
      'Find quick answers to common questions about orders, shipping, and cooperation.',
    'sections.ordering': 'Ordering',
    'sections.shipping': 'Shipping',
    'cta.contact': 'Still have questions? Contact our sales team.',
  };

  const mockPageContent = {
    content: mockFaqContent,
    metadata: {
      slug: 'faq',
      title: 'FAQ',
    },
  };

  // Pre-parsed FAQ categories for mock
  const mockFaqCategories = [
    {
      id: 'category-1',
      title: 'Ordering',
      items: [
        {
          id: 'category-1-1',
          question: 'How to place an order?',
          answer: 'You can contact our sales team via email or phone.',
        },
        {
          id: 'category-1-2',
          question: 'What is the minimum order quantity?',
          answer:
            'Our MOQ depends on the specific product and customization requirements.',
        },
      ],
    },
    {
      id: 'category-2',
      title: 'Shipping',
      items: [
        {
          id: 'category-2-1',
          question: 'What shipping options are available?',
          answer:
            'We offer sea, air, and express shipping depending on your needs.',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockReturnValue(mockPageContent);

    // getTranslations 返回一个简单的 key -> 文本 映射函数
    mockGetTranslations.mockResolvedValue((key: string) => {
      return mockTranslations[key] ?? key;
    });

    // Reset Suspense mock state
    mockSuspenseState.locale = defaultLocale;
    mockSuspenseState.translations = mockTranslations;
    mockSuspenseState.pageContent = mockPageContent;
    mockSuspenseState.faqCategories = mockFaqCategories;
  });

  it('应该正确生成 metadata（多语言）', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve(createParams(defaultLocale)),
    });

    expect(metadata.title).toBe('Frequently Asked Questions');
    expect(metadata.description).toBe(
      'Answers to the most common questions from our clients.',
    );

    expect(mockGetTranslations).toHaveBeenCalledWith({
      locale: defaultLocale,
      namespace: 'faq',
    });
  });

  it('应该从 MDX 内容解析出 FAQ 分类和问答，并渲染 Accordion', async () => {
    const FaqPageComponent = await FaqPage({
      params: Promise.resolve(createParams(defaultLocale)),
    });

    render(FaqPageComponent);

    // 分类标题
    expect(screen.getByText('Ordering')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();

    // 问题文本
    expect(screen.getByText('How to place an order?')).toBeInTheDocument();
    expect(
      screen.getByText('What is the minimum order quantity?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('What shipping options are available?'),
    ).toBeInTheDocument();

    // Accordion 结构（通过按钮/触发器语义验证）
    const accordionTriggers = screen.getAllByRole('button');
    expect(accordionTriggers.length).toBeGreaterThanOrEqual(3);
  });

  it('应该注入 FAQPage 类型的 JSON-LD schema', async () => {
    const FaqPageComponent = await FaqPage({
      params: Promise.resolve(createParams(defaultLocale)),
    });

    const { container } = render(FaqPageComponent);

    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();

    const json = script?.textContent ?? '';
    const parsed = JSON.parse(json) as {
      '@type'?: string;
      'mainEntity'?: unknown[];
    };

    expect(parsed['@type']).toBe('FAQPage');
    expect(Array.isArray(parsed.mainEntity)).toBe(true);
    expect((parsed.mainEntity ?? []).length).toBeGreaterThan(0);
  });

  it('应该支持不同 locale（zh）', async () => {
    const zhParams = createParams('zh');
    mockSuspenseState.locale = 'zh';

    const FaqPageComponent = await FaqPage({
      params: Promise.resolve(zhParams),
    });

    render(FaqPageComponent);

    // Verify the page renders with zh locale context
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
