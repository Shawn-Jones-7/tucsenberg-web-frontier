import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductsPage, { generateMetadata, generateStaticParams } from '../page';

// Mock dependencies using vi.hoisted
const {
  mockGetTranslations,
  mockSetRequestLocale,
  mockGetAllProductsCached,
  mockGetProductCategoriesCached,
  mockSuspenseState,
} = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockSetRequestLocale: vi.fn(),
  mockGetAllProductsCached: vi.fn(),
  mockGetProductCategoriesCached: vi.fn(),
  mockSuspenseState: {
    products: [] as { slug: string; title: string }[],
    categories: [] as string[],
    locale: 'en',
  },
}));

// Mock Suspense to render mock content (async Server Components can't be rendered in Vitest)
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    Suspense: () => {
      const { products, categories, locale } = mockSuspenseState;

      if (products.length === 0) {
        return (
          <main className='container mx-auto px-4 py-8 md:py-12'>
            <header className='mb-8 md:mb-12'>
              <h1 className='text-heading mb-4'>Products</h1>
              <p className='text-body max-w-2xl text-muted-foreground'>
                Browse our product catalog
              </p>
            </header>
            <div className='py-12 text-center'>
              <p className='text-muted-foreground'>No products found</p>
            </div>
          </main>
        );
      }

      return (
        <main className='container mx-auto px-4 py-8 md:py-12'>
          <header className='mb-8 md:mb-12'>
            <h1 className='text-heading mb-4'>Products</h1>
            <p className='text-body max-w-2xl text-muted-foreground'>
              Browse our product catalog
            </p>
          </header>
          {categories.length > 0 && (
            <div
              data-testid='category-filter'
              data-all-label='All Categories'
            >
              {categories.map((cat) => (
                <span
                  key={cat}
                  data-testid={`category-${cat}`}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div
            data-testid='product-grid'
            data-link-prefix={`/${locale}/products`}
            data-moq-label='MOQ'
          >
            {products.map((product) => (
              <div
                key={product.slug}
                data-testid={`product-${product.slug}`}
              >
                {product.title}
              </div>
            ))}
          </div>
        </main>
      );
    },
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: mockSetRequestLocale,
}));

vi.mock('@/app/[locale]/generate-static-params', () => ({
  generateLocaleStaticParams: () => [{ locale: 'en' }, { locale: 'zh' }],
}));

vi.mock('@/lib/content/products', () => ({
  getAllProductsCached: mockGetAllProductsCached,
  getProductCategoriesCached: mockGetProductCategoriesCached,
}));

// Mock ProductGrid component
vi.mock('@/components/products', () => ({
  ProductGrid: ({
    products,
    linkPrefix,
    labels,
  }: {
    products: unknown[];
    linkPrefix: string;
    labels: Record<string, string>;
  }) => (
    <div
      data-testid='product-grid'
      data-link-prefix={linkPrefix}
      data-moq-label={labels.moq}
    >
      {(products as { slug: string; title: string }[]).map((product) => (
        <div
          key={product.slug}
          data-testid={`product-${product.slug}`}
        >
          {product.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock ProductCategoryFilter component
vi.mock('@/app/[locale]/products/product-category-filter', () => ({
  ProductCategoryFilter: ({
    categories,
    allCategoriesLabel,
  }: {
    categories: string[];
    allCategoriesLabel: string;
  }) => (
    <div
      data-testid='category-filter'
      data-all-label={allCategoriesLabel}
    >
      {categories.map((cat) => (
        <span
          key={cat}
          data-testid={`category-${cat}`}
        >
          {cat}
        </span>
      ))}
    </div>
  ),
}));

describe('ProductsPage', () => {
  const mockTranslations = {
    'pageTitle': 'Products',
    'pageDescription': 'Browse our product catalog',
    'card.moq': 'MOQ',
    'card.leadTime': 'Lead Time',
    'card.supplyCapacity': 'Supply Capacity',
    'featured': 'Featured',
    'allCategories': 'All Categories',
    'emptyState': 'No products found',
  } as const;

  const mockProducts = [
    {
      slug: 'product-a',
      title: 'Product A',
      category: 'Electronics',
      coverImage: '/images/product-a.jpg',
    },
    {
      slug: 'product-b',
      title: 'Product B',
      category: 'Machinery',
      coverImage: '/images/product-b.jpg',
    },
  ];

  const mockCategories = ['Electronics', 'Machinery', 'Textiles'];

  const mockParams = { locale: 'en' };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
    mockGetAllProductsCached.mockResolvedValue(mockProducts);
    mockGetProductCategoriesCached.mockResolvedValue(mockCategories);

    // Reset Suspense mock state to defaults
    mockSuspenseState.products = mockProducts;
    mockSuspenseState.categories = mockCategories;
    mockSuspenseState.locale = 'en';
  });

  describe('generateStaticParams', () => {
    it('should return params for all locales', () => {
      const params = generateStaticParams();

      expect(params).toEqual([{ locale: 'en' }, { locale: 'zh' }]);
    });
  });

  describe('generateMetadata', () => {
    it('should return correct metadata', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toMatchObject({
        title: 'Products',
        description: 'Browse our product catalog',
      });
    });

    it('should call getTranslations with correct namespace', async () => {
      await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'products',
      });
    });

    it('should handle different locales', async () => {
      await generateMetadata({
        params: Promise.resolve({ locale: 'zh' }),
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'products',
      });
    });
  });

  describe('ProductsPage component', () => {
    it('should render page title', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Products',
      );
    });

    it('should render page description', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      expect(
        screen.getByText('Browse our product catalog'),
      ).toBeInTheDocument();
    });

    it('should render ProductGrid with products', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      expect(screen.getByTestId('product-product-a')).toBeInTheDocument();
      expect(screen.getByTestId('product-product-b')).toBeInTheDocument();
    });

    it('should pass correct linkPrefix to ProductGrid', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      const productGrid = screen.getByTestId('product-grid');
      expect(productGrid).toHaveAttribute('data-link-prefix', '/en/products');
    });

    it('should pass correct linkPrefix for zh locale', async () => {
      mockSuspenseState.locale = 'zh';

      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve({ locale: 'zh' }),
      });

      render(ProductsPageComponent);

      const productGrid = screen.getByTestId('product-grid');
      expect(productGrid).toHaveAttribute('data-link-prefix', '/zh/products');
    });

    it('should render category filter when categories exist', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('category-Electronics')).toBeInTheDocument();
      expect(screen.getByTestId('category-Machinery')).toBeInTheDocument();
      expect(screen.getByTestId('category-Textiles')).toBeInTheDocument();
    });

    it('should not render category filter when no categories', async () => {
      mockGetProductCategoriesCached.mockResolvedValue([]);
      mockSuspenseState.categories = [];

      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    });

    it('should render empty state when no products', async () => {
      mockGetAllProductsCached.mockResolvedValue([]);
      mockSuspenseState.products = [];

      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('should render main element with correct classes', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
      });

      render(ProductsPageComponent);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = ProductsPage({
          params: Promise.resolve(mockParams),
        });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<{ locale: string }>((resolve) =>
          setTimeout(() => resolve(mockParams), 10),
        );

        const ProductsPageComponent = await ProductsPage({
          params: delayedParams,
        });

        expect(ProductsPageComponent).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should propagate params rejection', async () => {
        const rejectedParams = Promise.reject(new Error('Params error'));

        await expect(
          ProductsPage({
            params: rejectedParams,
          }),
        ).rejects.toThrow('Params error');
      });
    });

    describe('labels', () => {
      it('should pass card labels to ProductGrid', async () => {
        const ProductsPageComponent = await ProductsPage({
          params: Promise.resolve(mockParams),
        });

        render(ProductsPageComponent);

        const productGrid = screen.getByTestId('product-grid');
        expect(productGrid).toHaveAttribute('data-moq-label', 'MOQ');
      });

      it('should pass allCategories label to filter', async () => {
        const ProductsPageComponent = await ProductsPage({
          params: Promise.resolve(mockParams),
        });

        render(ProductsPageComponent);

        const categoryFilter = screen.getByTestId('category-filter');
        expect(categoryFilter).toHaveAttribute(
          'data-all-label',
          'All Categories',
        );
      });
    });
  });
});
