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
} = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockSetRequestLocale: vi.fn(),
  mockGetAllProductsCached: vi.fn(),
  mockGetProductCategoriesCached: vi.fn(),
}));

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
    currentCategory,
    allCategoriesLabel,
  }: {
    categories: string[];
    currentCategory?: string;
    allCategoriesLabel: string;
  }) => (
    <div
      data-testid='category-filter'
      data-current-category={currentCategory || 'all'}
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
  const mockSearchParams = {};

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
    mockGetAllProductsCached.mockResolvedValue(mockProducts);
    mockGetProductCategoriesCached.mockResolvedValue(mockCategories);
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
        searchParams: Promise.resolve(mockSearchParams),
      });

      expect(metadata).toMatchObject({
        title: 'Products',
        description: 'Browse our product catalog',
      });
    });

    it('should call getTranslations with correct namespace', async () => {
      await generateMetadata({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'products',
      });
    });

    it('should handle different locales', async () => {
      await generateMetadata({
        params: Promise.resolve({ locale: 'zh' }),
        searchParams: Promise.resolve(mockSearchParams),
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
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Products',
      );
    });

    it('should render page description', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      expect(
        screen.getByText('Browse our product catalog'),
      ).toBeInTheDocument();
    });

    it('should render ProductGrid with products', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      expect(screen.getByTestId('product-product-a')).toBeInTheDocument();
      expect(screen.getByTestId('product-product-b')).toBeInTheDocument();
    });

    it('should pass correct linkPrefix to ProductGrid', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      const productGrid = screen.getByTestId('product-grid');
      expect(productGrid).toHaveAttribute('data-link-prefix', '/en/products');
    });

    it('should pass correct linkPrefix for zh locale', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve({ locale: 'zh' }),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      const productGrid = screen.getByTestId('product-grid');
      expect(productGrid).toHaveAttribute('data-link-prefix', '/zh/products');
    });

    it('should render category filter when categories exist', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('category-Electronics')).toBeInTheDocument();
      expect(screen.getByTestId('category-Machinery')).toBeInTheDocument();
      expect(screen.getByTestId('category-Textiles')).toBeInTheDocument();
    });

    it('should not render category filter when no categories', async () => {
      mockGetProductCategoriesCached.mockResolvedValue([]);

      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    });

    it('should pass current category to filter', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve({ category: 'Electronics' }),
      });

      render(ProductsPageComponent);

      const categoryFilter = screen.getByTestId('category-filter');
      expect(categoryFilter).toHaveAttribute(
        'data-current-category',
        'Electronics',
      );
    });

    it('should render empty state when no products', async () => {
      mockGetAllProductsCached.mockResolvedValue([]);

      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('should call setRequestLocale with locale', async () => {
      await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      expect(mockSetRequestLocale).toHaveBeenCalledWith('en');
    });

    it('should call getAllProductsCached with category filter', async () => {
      await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve({ category: 'Electronics' }),
      });

      expect(mockGetAllProductsCached).toHaveBeenCalledWith('en', {
        category: 'Electronics',
      });
    });

    it('should call getAllProductsCached without filter when no category', async () => {
      await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      expect(mockGetAllProductsCached).toHaveBeenCalledWith('en', {});
    });

    it('should render main element with correct classes', async () => {
      const ProductsPageComponent = await ProductsPage({
        params: Promise.resolve(mockParams),
        searchParams: Promise.resolve(mockSearchParams),
      });

      render(ProductsPageComponent);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = ProductsPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve(mockSearchParams),
        });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<{ locale: string }>((resolve) =>
          setTimeout(() => resolve(mockParams), 10),
        );

        const ProductsPageComponent = await ProductsPage({
          params: delayedParams,
          searchParams: Promise.resolve(mockSearchParams),
        });

        expect(ProductsPageComponent).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should propagate getTranslations errors', async () => {
        mockGetTranslations.mockRejectedValue(new Error('Translation error'));

        await expect(
          ProductsPage({
            params: Promise.resolve(mockParams),
            searchParams: Promise.resolve(mockSearchParams),
          }),
        ).rejects.toThrow('Translation error');
      });

      it('should propagate getAllProductsCached errors', async () => {
        mockGetAllProductsCached.mockRejectedValue(
          new Error('Failed to fetch products'),
        );

        await expect(
          ProductsPage({
            params: Promise.resolve(mockParams),
            searchParams: Promise.resolve(mockSearchParams),
          }),
        ).rejects.toThrow('Failed to fetch products');
      });

      it('should propagate params rejection', async () => {
        const rejectedParams = Promise.reject(new Error('Params error'));

        await expect(
          ProductsPage({
            params: rejectedParams,
            searchParams: Promise.resolve(mockSearchParams),
          }),
        ).rejects.toThrow('Params error');
      });
    });

    describe('labels', () => {
      it('should pass card labels to ProductGrid', async () => {
        const ProductsPageComponent = await ProductsPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve(mockSearchParams),
        });

        render(ProductsPageComponent);

        const productGrid = screen.getByTestId('product-grid');
        expect(productGrid).toHaveAttribute('data-moq-label', 'MOQ');
      });

      it('should pass allCategories label to filter', async () => {
        const ProductsPageComponent = await ProductsPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve(mockSearchParams),
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
