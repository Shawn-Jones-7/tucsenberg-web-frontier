/**
 * @vitest-environment jsdom
 * Tests for ProductCard component
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductSummary } from '@/types/content.types';
import { ProductCard } from '../product-card';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    sizes,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill}
      data-sizes={sizes}
      className={className}
    />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
    >
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='clock-icon'
      {...props}
    />
  ),
  Factory: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='factory-icon'
      {...props}
    />
  ),
  Package: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='package-icon'
      {...props}
    />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span
      data-testid='badge'
      data-variant={variant}
      className={className}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid='card'
      className={className}
    >
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid='card-content'
      className={className}
    >
      {children}
    </div>
  ),
  CardDescription: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <p
      data-testid='card-description'
      className={className}
    >
      {children}
    </p>
  ),
  CardFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid='card-footer'
      className={className}
    >
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid='card-header'
      className={className}
    >
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3
      data-testid='card-title'
      className={className}
    >
      {children}
    </h3>
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

describe('ProductCard', () => {
  describe('basic rendering', () => {
    it('renders product title', () => {
      const product = createMockProduct({ title: 'My Product' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('My Product')).toBeInTheDocument();
    });

    it('renders as article element', () => {
      const product = createMockProduct();
      render(<ProductCard product={product} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('renders link with correct href', () => {
      const product = createMockProduct({ slug: 'my-product' });
      render(
        <ProductCard
          product={product}
          linkPrefix='/en/products'
        />,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/en/products/my-product');
    });

    it('uses default link prefix', () => {
      const product = createMockProduct({ slug: 'my-product' });
      render(<ProductCard product={product} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/my-product');
    });
  });

  describe('cover image', () => {
    it('shows cover image by default', () => {
      const product = createMockProduct({
        coverImage: '/images/product.jpg',
        title: 'Product Title',
      });
      render(<ProductCard product={product} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/images/product.jpg');
      expect(img).toHaveAttribute('alt', 'Product Title');
    });

    it('hides cover image when showCoverImage is false', () => {
      const product = createMockProduct();
      render(
        <ProductCard
          product={product}
          showCoverImage={false}
        />,
      );
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('featured badge', () => {
    it('shows featured badge when product is featured', () => {
      const product = createMockProduct({ featured: true });
      render(<ProductCard product={product} />);
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('does not show featured badge when product is not featured', () => {
      const product = createMockProduct({ featured: false });
      render(<ProductCard product={product} />);
      expect(screen.queryByText('Featured')).not.toBeInTheDocument();
    });

    it('uses custom featured label', () => {
      const product = createMockProduct({ featured: true });
      render(
        <ProductCard
          product={product}
          labels={{ featured: '精选' }}
        />,
      );
      expect(screen.getByText('精选')).toBeInTheDocument();
    });
  });

  describe('category badge', () => {
    it('shows category badge by default', () => {
      const product = createMockProduct({ category: 'Electronics' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('hides category badge when showCategory is false', () => {
      const product = createMockProduct({ category: 'Electronics' });
      render(
        <ProductCard
          product={product}
          showCategory={false}
        />,
      );
      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });
  });

  describe('description', () => {
    it('renders description when provided', () => {
      const product = createMockProduct({
        description: 'This is a product description',
      });
      render(<ProductCard product={product} />);
      expect(
        screen.getByText('This is a product description'),
      ).toBeInTheDocument();
    });

    it('does not render description when undefined', () => {
      const { description: _description, ...productWithoutDescription } =
        createMockProduct();
      const product: ProductSummary = productWithoutDescription;
      render(<ProductCard product={product} />);
      expect(screen.queryByTestId('card-content')).not.toBeInTheDocument();
    });
  });

  describe('trade info', () => {
    it('shows MOQ when provided', () => {
      const product = createMockProduct({ moq: '500 pieces' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('MOQ:')).toBeInTheDocument();
      expect(screen.getByText('500 pieces')).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    });

    it('shows lead time when provided', () => {
      const product = createMockProduct({ leadTime: '14-21 days' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('Lead Time:')).toBeInTheDocument();
      expect(screen.getByText('14-21 days')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('shows supply capacity when provided', () => {
      const product = createMockProduct({ supplyCapacity: '50000/month' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('Capacity:')).toBeInTheDocument();
      expect(screen.getByText('50000/month')).toBeInTheDocument();
      expect(screen.getByTestId('factory-icon')).toBeInTheDocument();
    });

    it('hides trade info when showTradeInfo is false', () => {
      const product = createMockProduct({
        moq: '100 units',
        leadTime: '7 days',
        supplyCapacity: '10000/month',
      });
      render(
        <ProductCard
          product={product}
          showTradeInfo={false}
        />,
      );
      expect(screen.queryByText('MOQ:')).not.toBeInTheDocument();
      expect(screen.queryByText('Lead Time:')).not.toBeInTheDocument();
      expect(screen.queryByText('Capacity:')).not.toBeInTheDocument();
    });

    it('does not render trade info section when no trade info is provided', () => {
      const {
        moq: _moq,
        leadTime: _leadTime,
        supplyCapacity: _supplyCapacity,
        ...productBase
      } = createMockProduct();
      const product: ProductSummary = productBase;
      render(<ProductCard product={product} />);
      expect(screen.queryByTestId('card-footer')).not.toBeInTheDocument();
    });

    it('uses custom trade info labels', () => {
      const product = createMockProduct({
        moq: '100',
        leadTime: '7天',
        supplyCapacity: '10000',
      });
      render(
        <ProductCard
          product={product}
          labels={{
            moq: '最小订购量',
            leadTime: '交货时间',
            supplyCapacity: '供应能力',
          }}
        />,
      );
      expect(screen.getByText('最小订购量:')).toBeInTheDocument();
      expect(screen.getByText('交货时间:')).toBeInTheDocument();
      expect(screen.getByText('供应能力:')).toBeInTheDocument();
    });
  });

  describe('custom styling', () => {
    it('applies custom className to card', () => {
      const product = createMockProduct();
      render(
        <ProductCard
          product={product}
          className='custom-class'
        />,
      );
      const card = screen.getByTestId('card');
      expect(card.className).toContain('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has accessible link structure', () => {
      const product = createMockProduct({ title: 'Accessible Product' });
      render(<ProductCard product={product} />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('focus:outline-none');
      expect(link.className).toContain('focus-visible:ring-2');
    });

    it('hides icons from screen readers', () => {
      const product = createMockProduct({
        moq: '100',
        leadTime: '7 days',
        supplyCapacity: '10000',
      });
      render(<ProductCard product={product} />);
      expect(screen.getByTestId('package-icon')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(screen.getByTestId('clock-icon')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(screen.getByTestId('factory-icon')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });
  });
});
