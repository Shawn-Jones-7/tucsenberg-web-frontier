import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface ProductCategoryFilterProps {
  categories: string[];
  currentCategory?: string;
  allCategoriesLabel: string;
  pathname: string;
  className?: string;
}

/**
 * Category filter for products (Server Component).
 *
 * Uses URL search params for category filtering, enabling
 * server-side rendering and shareable filtered URLs.
 */
export function ProductCategoryFilter({
  categories,
  currentCategory,
  allCategoriesLabel,
  pathname,
  className,
}: ProductCategoryFilterProps) {
  return (
    <nav
      className={cn('flex flex-wrap gap-2', className)}
      aria-label='Product categories'
    >
      {/* All Categories */}
      <Link
        href={pathname}
        className='rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        <Badge
          variant={currentCategory === undefined ? 'default' : 'outline'}
          className='cursor-pointer transition-colors hover:bg-primary/90'
        >
          {allCategoriesLabel}
        </Badge>
      </Link>

      {/* Category Badges */}
      {categories.map((category) => (
        <Link
          key={category}
          href={`${pathname}?category=${encodeURIComponent(category)}`}
          className='rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <Badge
            variant={currentCategory === category ? 'default' : 'outline'}
            className='cursor-pointer transition-colors hover:bg-primary/90'
          >
            {category}
          </Badge>
        </Link>
      ))}
    </nav>
  );
}
