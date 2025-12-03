import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/types/content';
import FaqPage, { generateMetadata } from '@/app/[locale]/faq/page';

// 使用 vi.hoisted 配置 mock，确保在模块导入前生效
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

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockReturnValue({
      content: mockFaqContent,
      metadata: {
        slug: 'faq',
        title: 'FAQ',
      },
    });

    // getTranslations 返回一个简单的 key -> 文本 映射函数
    mockGetTranslations.mockResolvedValue((key: string) => {
      const map: Record<string, string> = {
        'pageTitle': 'Frequently Asked Questions',
        'pageDescription':
          'Answers to the most common questions from our clients.',
        'hero.title': 'Frequently Asked Questions',
        'hero.description':
          'Find quick answers to common questions about orders, shipping, and cooperation.',
        'sections.ordering': 'Ordering',
        'sections.shipping': 'Shipping',
        'cta.contact': 'Still have questions? Contact our sales team.',
      };
      return map[key] ?? key;
    });

    // headers() 提供一个带 nonce 的对象
    mockHeaders.mockResolvedValue({
      get: (name: string) => (name === 'x-csp-nonce' ? 'test-nonce' : null),
    });
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
    expect(script?.getAttribute('nonce')).toBe('test-nonce');

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

    await FaqPage({ params: Promise.resolve(zhParams) });

    expect(mockGetTranslations).toHaveBeenCalledWith({
      locale: 'zh',
      namespace: 'faq',
    });
  });
});
