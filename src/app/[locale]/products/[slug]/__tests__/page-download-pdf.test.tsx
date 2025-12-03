import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductDetailPage, {
  generateMetadata,
} from '@/app/[locale]/products/[slug]/page';

const { mockGetTranslations, mockGetProductBySlugCached, mockGetAllProducts } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockGetProductBySlugCached: vi.fn(),
    mockGetAllProducts: vi.fn(),
  }));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock('@/lib/content/products', () => ({
  getAllProductsCached: mockGetAllProducts,
  getProductBySlugCached: mockGetProductBySlugCached,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      {...rest}
    >
      {children}
    </a>
  ),
}));

// Mock 产品子组件，聚焦于按钮渲染
vi.mock('@/components/products', () => ({
  ProductGallery: ({ title }: { title: string }) => (
    <div data-testid='product-gallery'>{title}</div>
  ),
  ProductCertifications: () => <div data-testid='product-certifications' />,
  ProductInquiryForm: () => <div data-testid='product-inquiry-form' />,
  ProductSpecs: () => <div data-testid='product-specs' />,
  ProductTradeInfo: () => <div data-testid='product-trade-info' />,
}));

describe('ProductDetailPage PDF 下载按钮', () => {
  const defaultParams = {
    locale: 'en',
    slug: 'test-product',
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetProductBySlugCached.mockResolvedValue({
      slug: defaultParams.slug,
      locale: defaultParams.locale,
      title: 'Test Product',
      coverImage: '/images/test-product.jpg',
      category: 'Category A',
      content: '<p>Test content</p>',
      filePath: '/content/products/en/test-product.mdx',
    });

    mockGetTranslations.mockResolvedValue((key: string) => {
      const map: Record<string, string> = {
        'pageTitle': 'Products',
        'requestQuote': 'Request Quote',
        'card.moq': 'MOQ',
        'card.leadTime': 'Lead Time',
        'detail.certifications': 'Certifications',
        'detail.tradeInfo': 'Trade Information',
        'detail.specifications': 'Specifications',
        'detail.downloadPdf': 'Download product PDF',
        'detail.labels.moq': 'Minimum Order',
        'detail.labels.leadTime': 'Lead Time',
        'detail.labels.supplyCapacity': 'Supply Capacity',
        'detail.labels.packaging': 'Packaging',
        'detail.labels.portOfLoading': 'Port of Loading',
      };
      return map[key] ?? key;
    });
  });

  it('应该生成正确的 downloadPdfHref 路径', async () => {
    const PageComponent = await ProductDetailPage({
      params: Promise.resolve(defaultParams),
    });

    const { container } = render(PageComponent);

    const downloadLink = container.querySelector(
      'a[href="/pdfs/products/en/test-product.pdf"]',
    );
    expect(downloadLink).not.toBeNull();
  });

  it('应该渲染 PDF 下载按钮并使用 i18n 文案', async () => {
    const PageComponent = await ProductDetailPage({
      params: Promise.resolve(defaultParams),
    });

    render(PageComponent);

    const downloadButton = screen.getByText('Download product PDF');
    expect(downloadButton).toBeInTheDocument();

    const link = downloadButton.closest('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', '/pdfs/products/en/test-product.pdf');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('generateMetadata 应该可用（基础 smoke）', async () => {
    mockGetProductBySlugCached.mockResolvedValueOnce({
      slug: defaultParams.slug,
      locale: defaultParams.locale,
      title: 'Test Product',
      coverImage: '/images/test-product.jpg',
      category: 'Category A',
      content: '<p>Test content</p>',
      filePath: '/content/products/en/test-product.mdx',
      seo: {
        title: 'SEO Title',
        description: 'SEO Description',
      },
    });

    const metadata = await generateMetadata({
      params: Promise.resolve(defaultParams),
    });

    expect(metadata.title).toBe('SEO Title');
    expect(metadata.description).toBe('SEO Description');
  });
});
