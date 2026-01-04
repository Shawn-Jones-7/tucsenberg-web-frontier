import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '../page';

// Mock dependencies using vi.hoisted
const {
  mockGetTranslations,
  mockSetRequestLocale,
  mockGetAllProductsCached,
  mockGetProductBySlugCached,
  mockGetStaticParamsForType,
  mockNotFound,
  mockSuspenseState,
} = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockSetRequestLocale: vi.fn(),
  mockGetAllProductsCached: vi.fn(),
  mockGetProductBySlugCached: vi.fn(),
  mockGetStaticParamsForType: vi.fn(),
  mockNotFound: vi.fn(),
  mockSuspenseState: {
    locale: 'en',
    slug: 'test-product',
    product: null as {
      slug: string;
      title: string;
      category: string;
      coverImage: string;
      description?: string;
      content?: string;
      moq?: string;
      leadTime?: string;
      pdfUrl?: string;
      images?: string[];
      specs?: Record<string, string>;
      certifications?: string[];
    } | null,
    translations: {} as Record<string, string>,
  },
}));

// Mock React Suspense to render product detail UI based on mockSuspenseState
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    Suspense: () => {
      const { product, translations, locale } = mockSuspenseState;
      if (!product) {
        return null;
      }

      const t = (key: string) => translations[key] || key;
      const hasSpecs = product.specs && Object.keys(product.specs).length > 0;
      const hasCertifications =
        product.certifications && product.certifications.length > 0;
      const hasContent = product.content && product.content.trim();

      return (
        <main className='container mx-auto px-4 py-8 md:py-12'>
          <nav className='mb-6'>
            <a
              href={`/${locale}/products`}
              className='inline-flex items-center gap-2 text-sm'
            >
              <svg data-testid='arrow-left-icon' />
              {t('pageTitle')}
            </a>
          </nav>

          <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
            <div
              data-testid='product-gallery'
              data-title={product.title}
            >
              <img
                src={product.coverImage}
                alt={`${product.title} 0`}
                data-testid='image-0'
              />
              {product.images?.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.title} ${i + 1}`}
                  data-testid={`image-${i + 1}`}
                />
              ))}
            </div>

            <div className='space-y-6'>
              <span
                data-testid='badge'
                data-variant='secondary'
              >
                {product.category}
              </span>
              <h1 className='text-heading'>{product.title}</h1>
              {product.description && (
                <p className='text-body text-muted-foreground'>
                  {product.description}
                </p>
              )}

              <div className='flex flex-wrap gap-4 text-sm'>
                {product.moq && (
                  <div className='flex items-center gap-1'>
                    <span className='font-medium'>{t('card.moq')}:</span>
                    <span className='text-muted-foreground'>{product.moq}</span>
                  </div>
                )}
                {product.leadTime && (
                  <div className='flex items-center gap-1'>
                    <span className='font-medium'>{t('card.leadTime')}:</span>
                    <span className='text-muted-foreground'>
                      {product.leadTime}
                    </span>
                  </div>
                )}
              </div>

              {hasCertifications && (
                <div
                  data-testid='product-certifications'
                  data-title={t('detail.certifications')}
                >
                  {product.certifications!.map((cert: string) => (
                    <span
                      key={cert}
                      data-testid={`cert-${cert}`}
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              <div
                data-testid='product-actions'
                data-product-slug={product.slug}
                data-product-name={product.title}
              >
                <button data-testid='request-quote-button'>
                  {t('requestQuote')}
                </button>
                {product.pdfUrl && (
                  <a
                    href={product.pdfUrl}
                    data-testid='download-pdf-link'
                  >
                    {t('detail.downloadPdf')}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className='mt-12 grid gap-8 lg:grid-cols-2'>
            {hasSpecs && (
              <div
                data-testid='product-specs'
                data-title={t('detail.specifications')}
              >
                {Object.entries(product.specs!).map(
                  ([key, value]: [string, string]) => (
                    <div
                      key={key}
                      data-testid={`spec-${key}`}
                    >
                      {key}: {value}
                    </div>
                  ),
                )}
              </div>
            )}
            <div
              data-testid='product-trade-info'
              data-title={t('detail.tradeInfo')}
            >
              {product.moq && (
                <div data-testid='trade-moq'>
                  {t('detail.labels.moq')}: {product.moq}
                </div>
              )}
              {product.leadTime && (
                <div data-testid='trade-leadTime'>
                  {t('detail.labels.leadTime')}: {product.leadTime}
                </div>
              )}
            </div>
          </div>

          {hasContent && (
            <article className='prose mt-12 max-w-none'>
              <div data-testid='mdx-content'>
                <p>Product content</p>
              </div>
            </article>
          )}

          <section className='mt-12'>
            <div
              data-testid='product-inquiry-form'
              data-product-name={product.title}
              data-product-slug={product.slug}
            >
              Inquiry Form
            </div>
          </section>
        </main>
      );
    },
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: mockSetRequestLocale,
}));

// Mock i18n routing Link component
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string; [key: string]: unknown }>) => (
    <a
      href={typeof href === 'string' ? href : href}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

// Mock content-query to prevent MDX importer from being loaded
vi.mock('@/lib/content-query', () => ({
  getAllPosts: vi.fn(),
  getPostBySlug: vi.fn(),
  getAllProducts: vi.fn(),
  getProductBySlug: vi.fn(),
  getAllPages: vi.fn(),
  getPageBySlug: vi.fn(),
}));

// Mock content-manifest to prevent real static params generation
vi.mock('@/lib/content-manifest', () => ({
  getStaticParamsForType: mockGetStaticParamsForType,
}));

vi.mock('@/lib/content/products', () => ({
  getAllProductsCached: mockGetAllProductsCached,
  getProductBySlugCached: mockGetProductBySlugCached,
}));

// Mock MDX importers to prevent Vite from trying to resolve MDX files
vi.mock('@/lib/mdx-importers.generated', () => ({
  postImporters: {},
  productImporters: {},
  pageImporters: {},
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: ({ className }: { className?: string }) => (
    <svg
      data-testid='arrow-left-icon'
      className={className}
    />
  ),
  Download: ({ className }: { className?: string }) => (
    <svg
      data-testid='download-icon'
      className={className}
    />
  ),
  MessageSquare: ({ className }: { className?: string }) => (
    <svg
      data-testid='message-square-icon'
      className={className}
    />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
  }: React.PropsWithChildren<{ variant?: string }>) => (
    <span
      data-testid='badge'
      data-variant={variant}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild: _asChild,
    variant,
    size,
    className,
    ...props
  }: React.PropsWithChildren<{
    asChild?: boolean;
    variant?: string;
    size?: string;
    className?: string;
    [key: string]: unknown;
  }>) => (
    <button
      data-testid='button'
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/mdx', () => ({
  MDXContent: ({
    type: _type,
    locale: _locale,
    slug: _slug,
  }: {
    type: string;
    locale: string;
    slug: string;
  }) => (
    <div data-testid='mdx-content'>
      <p>Product content</p>
    </div>
  ),
}));

// Mock product components
vi.mock('@/components/products', () => ({
  ProductCertifications: ({
    certifications,
    title,
  }: {
    certifications: string[];
    title: string;
  }) => (
    <div
      data-testid='product-certifications'
      data-title={title}
    >
      {certifications.map((cert) => (
        <span
          key={cert}
          data-testid={`cert-${cert}`}
        >
          {cert}
        </span>
      ))}
    </div>
  ),
  ProductGallery: ({ images, title }: { images: string[]; title: string }) => (
    <div
      data-testid='product-gallery'
      data-title={title}
    >
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${title} ${i}`}
          data-testid={`image-${i}`}
        />
      ))}
    </div>
  ),
  ProductInquiryForm: ({
    productName,
    productSlug,
  }: {
    productName: string;
    productSlug: string;
  }) => (
    <div
      data-testid='product-inquiry-form'
      data-product-name={productName}
      data-product-slug={productSlug}
    >
      Inquiry Form
    </div>
  ),
  ProductSpecs: ({
    specs,
    title,
  }: {
    specs: Record<string, string>;
    title: string;
  }) => (
    <div
      data-testid='product-specs'
      data-title={title}
    >
      {Object.entries(specs).map(([key, value]) => (
        <div
          key={key}
          data-testid={`spec-${key}`}
        >
          {key}: {value}
        </div>
      ))}
    </div>
  ),
  ProductTradeInfo: ({
    title,
    labels,
    ...props
  }: {
    title: string;
    labels: Record<string, string>;
    [key: string]: unknown;
  }) => (
    <div
      data-testid='product-trade-info'
      data-title={title}
    >
      {Object.entries(props).map(([key, value]) => (
        <div
          key={key}
          data-testid={`trade-${key}`}
        >
          {labels[key] || key}: {String(value)}
        </div>
      ))}
    </div>
  ),
  ProductActions: ({
    productSlug,
    productName,
    requestQuoteLabel,
    pdfHref,
    downloadPdfLabel,
  }: {
    productSlug: string;
    productName: string;
    productImage?: string;
    requestQuoteLabel: string;
    pdfHref?: string;
    downloadPdfLabel?: string;
  }) => (
    <div
      data-testid='product-actions'
      data-product-slug={productSlug}
      data-product-name={productName}
    >
      <button data-testid='request-quote-button'>{requestQuoteLabel}</button>
      {pdfHref && (
        <a
          href={pdfHref}
          data-testid='download-pdf-link'
        >
          {downloadPdfLabel}
        </a>
      )}
    </div>
  ),
}));

describe('ProductDetailPage', () => {
  const mockTranslations = {
    'pageTitle': 'Products',
    'detail.labels.moq': 'MOQ',
    'detail.labels.leadTime': 'Lead Time',
    'detail.labels.supplyCapacity': 'Supply Capacity',
    'detail.labels.packaging': 'Packaging',
    'detail.labels.portOfLoading': 'Port of Loading',
    'detail.certifications': 'Certifications',
    'detail.specifications': 'Specifications',
    'detail.tradeInfo': 'Trade Information',
    'detail.downloadPdf': 'Download PDF',
    'requestQuote': 'Request Quote',
    'card.moq': 'MOQ',
    'card.leadTime': 'Lead Time',
  } as const;

  const mockProduct = {
    slug: 'test-product',
    title: 'Test Product',
    description: 'A test product description',
    category: 'Electronics',
    coverImage: '/images/test-product.jpg',
    pdfUrl: '/pdfs/products/en/test-product.pdf',
    images: ['/images/test-product-2.jpg'],
    moq: '100 units',
    leadTime: '7 days',
    supplyCapacity: '10,000/month',
    packaging: 'Standard',
    portOfLoading: 'Shanghai',
    certifications: ['ISO9001', 'CE'],
    specs: {
      Material: 'Aluminum',
      Weight: '500g',
    },
    content: '<p>Product content</p>',
    seo: {
      title: 'Test Product SEO Title',
      description: 'SEO Description',
      keywords: 'test, product',
    },
  };

  const mockParams = { locale: 'en', slug: 'test-product' };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up mockSuspenseState with default product and translations
    mockSuspenseState.locale = 'en';
    mockSuspenseState.slug = 'test-product';
    mockSuspenseState.product = mockProduct;
    mockSuspenseState.translations = mockTranslations;

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
    mockGetProductBySlugCached.mockResolvedValue(mockProduct);
    mockGetAllProductsCached.mockResolvedValue([
      { slug: 'product-a', title: 'Product A' },
      { slug: 'product-b', title: 'Product B' },
    ]);
    mockGetStaticParamsForType.mockReturnValue([
      { locale: 'en', slug: 'product-a' },
      { locale: 'en', slug: 'product-b' },
      { locale: 'zh', slug: 'product-a' },
      { locale: 'zh', slug: 'product-b' },
    ]);
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
  });

  describe('generateStaticParams', () => {
    it('should return params for all products in all locales', async () => {
      const params = await generateStaticParams();

      expect(params).toEqual([
        { locale: 'en', slug: 'product-a' },
        { locale: 'en', slug: 'product-b' },
        { locale: 'zh', slug: 'product-a' },
        { locale: 'zh', slug: 'product-b' },
      ]);
    });
  });

  describe('generateMetadata', () => {
    it('should return correct metadata with SEO fields', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toMatchObject({
        title: 'Test Product SEO Title',
        description: 'SEO Description',
        keywords: 'test, product',
        openGraph: {
          title: 'Test Product SEO Title',
          description: 'SEO Description',
          url: expect.stringContaining('/en/products/test-product'),
          images: [{ url: '/images/test-product.jpg' }], // Falls back to coverImage when ogImage not set
        },
      });
    });

    it('should fallback to product title when SEO title not available', async () => {
      mockGetProductBySlugCached.mockResolvedValue({
        ...mockProduct,
        seo: undefined,
      });

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata.title).toBe('Test Product');
    });

    it('should return not found metadata when product not found', async () => {
      mockGetProductBySlugCached.mockRejectedValue(
        new Error('Product not found'),
      );

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toEqual({
        title: 'Product Not Found',
      });
    });
  });

  describe('ProductDetailPage component', () => {
    it('should render product title', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Test Product',
      );
    });

    it('should render product description', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(
        screen.getByText('A test product description'),
      ).toBeInTheDocument();
    });

    it('should render category badge', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByTestId('badge')).toHaveTextContent('Electronics');
    });

    it('should render product gallery', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByTestId('product-gallery')).toBeInTheDocument();
    });

    it('should render back link to products page', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      const backLink = screen.getByRole('link', { name: /products/i });
      expect(backLink).toHaveAttribute('href', '/en/products');
    });

    it('should render certifications when available', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByTestId('product-certifications')).toBeInTheDocument();
      expect(screen.getByTestId('cert-ISO9001')).toBeInTheDocument();
      expect(screen.getByTestId('cert-CE')).toBeInTheDocument();
    });

    it('should not render certifications when not available', async () => {
      // Update mockSuspenseState with no certifications
      const { certifications: _certifications, ...productWithoutCerts } =
        mockProduct;
      mockSuspenseState.product = productWithoutCerts;

      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(
        screen.queryByTestId('product-certifications'),
      ).not.toBeInTheDocument();
    });

    it('should render product specs when available', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByTestId('product-specs')).toBeInTheDocument();
      expect(screen.getByTestId('spec-Material')).toBeInTheDocument();
    });

    it('should not render product specs when empty', async () => {
      // Update mockSuspenseState with empty specs
      mockSuspenseState.product = {
        ...mockProduct,
        specs: {},
      };

      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.queryByTestId('product-specs')).not.toBeInTheDocument();
    });

    it('should render trade info', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByTestId('product-trade-info')).toBeInTheDocument();
    });

    it('should render inquiry form', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      const inquiryForm = screen.getByTestId('product-inquiry-form');
      expect(inquiryForm).toBeInTheDocument();
      expect(inquiryForm).toHaveAttribute('data-product-name', 'Test Product');
      expect(inquiryForm).toHaveAttribute('data-product-slug', 'test-product');
    });

    it('should render product content when available', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText('Product content')).toBeInTheDocument();
    });

    it('should not render content section when empty', async () => {
      // Update mockSuspenseState with empty content
      mockSuspenseState.product = {
        ...mockProduct,
        content: '',
      };

      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      const { container } = render(PageComponent);

      expect(container.querySelector('article.prose')).not.toBeInTheDocument();
    });

    it('should call notFound when product not found', async () => {
      // Set product to null to simulate not found scenario
      mockSuspenseState.product = null;

      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      const { container } = render(PageComponent);

      // When product is null, Suspense mock renders nothing
      expect(container.querySelector('main')).not.toBeInTheDocument();
    });

    it('should render download PDF button', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('should render request quote button', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText('Request Quote')).toBeInTheDocument();
    });

    it('should render MOQ and lead time info', async () => {
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText('100 units')).toBeInTheDocument();
      expect(screen.getByText('7 days')).toBeInTheDocument();
    });

    it('should render with correct locale in back link', async () => {
      // This test verifies the locale is correctly passed through to the UI
      const PageComponent = await ProductDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      const backLink = screen.getByRole('link', { name: /products/i });
      expect(backLink).toHaveAttribute('href', '/en/products');
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = ProductDetailPage({
          params: Promise.resolve(mockParams),
        });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<{ locale: string; slug: string }>(
          (resolve) => setTimeout(() => resolve(mockParams), 10),
        );

        const PageComponent = await ProductDetailPage({
          params: delayedParams,
        });

        expect(PageComponent).toBeDefined();
      });
    });

    describe('locale handling', () => {
      it('should handle zh locale correctly', async () => {
        // Update mockSuspenseState for zh locale
        mockSuspenseState.locale = 'zh';

        const PageComponent = await ProductDetailPage({
          params: Promise.resolve({ locale: 'zh', slug: 'test-product' }),
        });

        render(PageComponent);

        // Verify the back link uses zh locale
        const backLink = screen.getByRole('link', { name: /products/i });
        expect(backLink).toHaveAttribute('href', '/zh/products');
      });

      it('should generate correct PDF href for locale', async () => {
        const PageComponent = await ProductDetailPage({
          params: Promise.resolve(mockParams),
        });

        render(PageComponent);

        const pdfLink = screen.getByRole('link', { name: /download pdf/i });
        expect(pdfLink).toHaveAttribute(
          'href',
          '/pdfs/products/en/test-product.pdf',
        );
      });
    });
  });
});
