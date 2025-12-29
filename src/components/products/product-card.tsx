import Image from 'next/image';
import Link from 'next/link';
import { Clock, Factory, Package } from 'lucide-react';
import type { ProductSummary } from '@/types/content.types';
import { getBlurPlaceholder } from '@/lib/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface ProductCardProps {
  product: ProductSummary;
  /** Prefix for the link, e.g. "/en/products" or "/zh/products" */
  linkPrefix?: string;
  /** Whether to show cover image */
  showCoverImage?: boolean;
  /** Whether to show category badge */
  showCategory?: boolean;
  /** Whether to show B2B trade info (MOQ, lead time) */
  showTradeInfo?: boolean;
  /** Custom class name */
  className?: string;
  /** Localized labels */
  labels?: ProductCardLabels;
}

export interface ProductCardLabels {
  moq?: string;
  leadTime?: string;
  supplyCapacity?: string;
  featured?: string;
}

const DEFAULT_LABELS: ProductCardLabels = {
  moq: 'MOQ',
  leadTime: 'Lead Time',
  supplyCapacity: 'Capacity',
  featured: 'Featured',
};

interface CoverImageProps {
  src: string;
  alt: string;
  featured: boolean | undefined;
  featuredLabel: string | undefined;
}

function CoverImage({ src, alt, featured, featuredLabel }: CoverImageProps) {
  return (
    <div className='relative aspect-[4/3] w-full overflow-hidden'>
      <Image
        src={src}
        alt={alt}
        fill
        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
        className='object-cover transition-transform duration-300 group-hover:scale-105'
        {...getBlurPlaceholder('neutral')}
      />
      {featured === true && (
        <Badge className='absolute top-3 left-3 bg-primary text-primary-foreground'>
          {featuredLabel}
        </Badge>
      )}
    </div>
  );
}

interface TradeInfoProps {
  moq: string | undefined;
  leadTime: string | undefined;
  supplyCapacity: string | undefined;
  labels: ProductCardLabels;
}

function TradeInfo({ moq, leadTime, supplyCapacity, labels }: TradeInfoProps) {
  const hasInfo =
    moq !== undefined || leadTime !== undefined || supplyCapacity !== undefined;

  if (!hasInfo) {
    return null;
  }

  return (
    <CardFooter className='mt-auto flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground'>
      {moq !== undefined && (
        <span className='flex items-center gap-1'>
          <Package
            className='h-3.5 w-3.5'
            aria-hidden='true'
          />
          <span className='font-medium'>{labels.moq}:</span> {moq}
        </span>
      )}
      {leadTime !== undefined && (
        <span className='flex items-center gap-1'>
          <Clock
            className='h-3.5 w-3.5'
            aria-hidden='true'
          />
          <span className='font-medium'>{labels.leadTime}:</span> {leadTime}
        </span>
      )}
      {supplyCapacity !== undefined && (
        <span className='flex items-center gap-1'>
          <Factory
            className='h-3.5 w-3.5'
            aria-hidden='true'
          />
          <span className='font-medium'>{labels.supplyCapacity}:</span>{' '}
          {supplyCapacity}
        </span>
      )}
    </CardFooter>
  );
}

/**
 * Product card component for displaying product summaries in a grid layout.
 *
 * Designed for B2B foreign trade scenarios with MOQ, lead time, and supply capacity info.
 * Implemented as a Server Component - no client-side interactivity required.
 */
export function ProductCard({
  product,
  linkPrefix = '/products',
  showCoverImage = true,
  showCategory = true,
  showTradeInfo = true,
  className,
  labels = DEFAULT_LABELS,
}: ProductCardProps) {
  // nosemgrep: object-injection-sink-spread-operator
  // Reason: DEFAULT_LABELS and labels are controlled UI label definitions
  // used solely for rendering text in the product card. They do not contain
  // user input and are not propagated to any persistence or execution sinks.
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const {
    slug,
    title,
    description,
    coverImage,
    category,
    featured,
    moq,
    leadTime,
    supplyCapacity,
  } = product;

  return (
    <article>
      <Link
        href={`${linkPrefix}/${slug}`}
        className='group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        <Card
          className={cn(
            'h-full overflow-hidden transition-all duration-200',
            'hover:border-primary/20 hover:shadow-md',
            'group-focus-visible:border-primary/20 group-focus-visible:shadow-md',
            className,
          )}
        >
          {showCoverImage && (
            <CoverImage
              src={coverImage}
              alt={title}
              featured={featured}
              featuredLabel={mergedLabels.featured}
            />
          )}

          <CardHeader className='gap-3'>
            {showCategory && (
              <Badge
                variant='secondary'
                className='w-fit text-xs'
              >
                {category}
              </Badge>
            )}
            <CardTitle className='line-clamp-2 text-lg leading-snug transition-colors group-hover:text-primary'>
              {title}
            </CardTitle>
          </CardHeader>

          {description !== undefined && (
            <CardContent className='pt-0'>
              <CardDescription className='line-clamp-2'>
                {description}
              </CardDescription>
            </CardContent>
          )}

          {showTradeInfo && (
            <TradeInfo
              moq={moq}
              leadTime={leadTime}
              supplyCapacity={supplyCapacity}
              labels={mergedLabels}
            />
          )}
        </Card>
      </Link>
    </article>
  );
}
