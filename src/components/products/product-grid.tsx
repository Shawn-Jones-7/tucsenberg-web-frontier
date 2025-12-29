import type { ProductSummary } from '@/types/content.types';
import { cn } from '@/lib/utils';
import {
  ProductCard,
  type ProductCardLabels,
} from '@/components/products/product-card';

export interface ProductGridProps {
  products: ProductSummary[];
  /** Prefix for product links */
  linkPrefix?: string;
  /** Number of columns on small screens (sm breakpoint) */
  sm?: 1 | 2;
  /** Number of columns on medium screens (md breakpoint) */
  md?: 2 | 3;
  /** Number of columns on large screens (lg breakpoint) */
  lg?: 3 | 4;
  /** Gap between grid items */
  gap?: 4 | 6 | 8;
  /** Whether to show cover images */
  showCoverImage?: boolean;
  /** Whether to show category badges */
  showCategory?: boolean;
  /** Whether to show B2B trade info */
  showTradeInfo?: boolean;
  /** Custom class name for the grid container */
  className?: string;
  /** Localized labels for product cards */
  labels?: ProductCardLabels;
}

// Static column class getters to avoid object injection
function getSmColumnClass(sm: 1 | 2): string {
  if (sm === 1) return 'sm:grid-cols-1';
  return 'sm:grid-cols-2';
}

function getMdColumnClass(md: 2 | 3): string {
  if (md === 2) return 'md:grid-cols-2';
  return 'md:grid-cols-3';
}

function getLgColumnClass(lg: 3 | 4): string {
  if (lg === 3) return 'lg:grid-cols-3';
  return 'lg:grid-cols-4';
}

function getGapClass(gap: 4 | 6 | 8): string {
  if (gap === 4) return 'gap-4';
  if (gap === 6) return 'gap-6';
  return 'gap-8';
}

/**
 * Responsive grid layout for product cards.
 *
 * Supports configurable columns at different breakpoints for flexible layouts.
 * Designed as a Server Component.
 */
export function ProductGrid({
  products,
  linkPrefix = '/products',
  sm = 1,
  md = 2,
  lg = 3,
  gap = 6,
  showCoverImage = true,
  showCategory = true,
  showTradeInfo = true,
  className,
  labels,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  const gridClasses = cn(
    'grid grid-cols-1',
    getSmColumnClass(sm),
    getMdColumnClass(md),
    getLgColumnClass(lg),
    getGapClass(gap),
    className,
  );

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          linkPrefix={linkPrefix}
          showCoverImage={showCoverImage}
          showCategory={showCategory}
          showTradeInfo={showTradeInfo}
          {...(labels !== undefined && { labels })}
        />
      ))}
    </div>
  );
}
