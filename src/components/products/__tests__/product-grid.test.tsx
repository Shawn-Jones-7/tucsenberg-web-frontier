/**
 * @vitest-environment jsdom
 * Tests for ProductGrid component
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductSummary } from '@/types/content.types';
import { ProductGrid } from '../product-grid';

// Mock ProductCard component
vi.mock('@/components/products/product-card', () => ({
  ProductCard: ({
    product,
    linkPrefix,
    showCoverImage,
    showCategory,
    showTradeInfo,
    labels,
  }: {
    product: { slug: string; title: string };
    linkPrefix?: string;
    showCoverImage?: boolean;
    showCategory?: boolean;
    showTradeInfo?: boolean;
    labels?: object;
  }) => (
    <div
      data-testid='product-card'
      data-slug={product.slug}
      data-link-prefix={linkPrefix}
      data-show-cover={showCoverImage}
      data-show-category={showCategory}
      data-show-trade={showTradeInfo}
      data-labels={labels ? 'custom' : 'default'}
    >
      {product.title}
    </div>
  ),
}));

function createMockProduct(
  overrides: Partial<ProductSummary> = {},
): ProductSummary {
  const base: ProductSummary = {
    slug: 'test-product',
    locale: 'en',
    title: 'Test Product',
    description: 'A test product description',
    coverImage: '/images/test-product.jpg',
    category: 'Test Category',
    featured: false,
    publishedAt: '2024-01-01',
    moq: '100 units',
    leadTime: '7-14 days',
    supplyCapacity: '10000/month',
  };
  return { ...base, ...overrides };
}

describe('ProductGrid', () => {
  describe('rendering', () => {
    it('renders products in a grid', () => {
      const products = [
        createMockProduct({ slug: 'product-1', title: 'Product 1' }),
        createMockProduct({ slug: 'product-2', title: 'Product 2' }),
        createMockProduct({ slug: 'product-3', title: 'Product 3' }),
      ];

      render(<ProductGrid products={products} />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product 3')).toBeInTheDocument();
    });

    it('renders correct number of ProductCard components', () => {
      const products = [
        createMockProduct({ slug: 'product-1' }),
        createMockProduct({ slug: 'product-2' }),
      ];

      render(<ProductGrid products={products} />);

      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });

    it('returns null when products array is empty', () => {
      const { container } = render(<ProductGrid products={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('grid columns', () => {
    it('applies default column classes', () => {
      const products = [createMockProduct()];

      const { container } = render(<ProductGrid products={products} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('grid-cols-1');
      expect(grid.className).toContain('sm:grid-cols-1');
      expect(grid.className).toContain('md:grid-cols-2');
      expect(grid.className).toContain('lg:grid-cols-3');
    });

    it('applies sm=2 column class', () => {
      const products = [createMockProduct()];

      const { container } = render(
        <ProductGrid
          products={products}
          sm={2}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('sm:grid-cols-2');
    });

    it('applies md=3 column class', () => {
      const products = [createMockProduct()];

      const { container } = render(
        <ProductGrid
          products={products}
          md={3}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('md:grid-cols-3');
    });

    it('applies lg=4 column class', () => {
      const products = [createMockProduct()];

      const { container } = render(
        <ProductGrid
          products={products}
          lg={4}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('lg:grid-cols-4');
    });
  });

  describe('grid gap', () => {
    it('applies default gap-6', () => {
      const products = [createMockProduct()];

      const { container } = render(<ProductGrid products={products} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('gap-6');
    });

    it('applies gap-4', () => {
      const products = [createMockProduct()];

      const { container } = render(
        <ProductGrid
          products={products}
          gap={4}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('gap-4');
    });

    it('applies gap-8', () => {
      const products = [createMockProduct()];

      const { container } = render(
        <ProductGrid
          products={products}
          gap={8}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('gap-8');
    });
  });

  describe('props forwarding', () => {
    it('passes linkPrefix to ProductCard', () => {
      const products = [createMockProduct()];

      render(
        <ProductGrid
          products={products}
          linkPrefix='/zh/products'
        />,
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-link-prefix', '/zh/products');
    });

    it('passes showCoverImage to ProductCard', () => {
      const products = [createMockProduct()];

      render(
        <ProductGrid
          products={products}
          showCoverImage={false}
        />,
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-show-cover', 'false');
    });

    it('passes showCategory to ProductCard', () => {
      const products = [createMockProduct()];

      render(
        <ProductGrid
          products={products}
          showCategory={false}
        />,
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-show-category', 'false');
    });

    it('passes showTradeInfo to ProductCard', () => {
      const products = [createMockProduct()];

      render(
        <ProductGrid
          products={products}
          showTradeInfo={false}
        />,
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-show-trade', 'false');
    });

    it('passes labels to ProductCard when provided', () => {
      const products = [createMockProduct()];
      const labels = { moq: 'Min Order' };

      render(
        <ProductGrid
          products={products}
          labels={labels}
        />,
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-labels', 'custom');
    });

    it('does not pass labels when undefined', () => {
      const products = [createMockProduct()];

      render(<ProductGrid products={products} />);

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('data-labels', 'default');
    });
  });

  describe('custom styling', () => {
    it('applies custom className to grid', () => {
      const products = [createMockProduct()];

      const { container } = render(
        <ProductGrid
          products={products}
          className='custom-grid-class'
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toContain('custom-grid-class');
    });
  });

  describe('key handling', () => {
    it('uses product slug as key', () => {
      const products = [
        createMockProduct({ slug: 'unique-slug-1' }),
        createMockProduct({ slug: 'unique-slug-2' }),
      ];

      render(<ProductGrid products={products} />);

      const cards = screen.getAllByTestId('product-card');
      expect(cards[0]).toHaveAttribute('data-slug', 'unique-slug-1');
      expect(cards[1]).toHaveAttribute('data-slug', 'unique-slug-2');
    });
  });
});
