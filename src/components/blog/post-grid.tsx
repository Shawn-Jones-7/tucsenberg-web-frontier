import type { PostSummary } from '@/types/content.types';
import { cn } from '@/lib/utils';
import { PostCard, type PostCardProps } from '@/components/blog/post-card';

export interface PostGridProps {
  posts: PostSummary[];
  /** Prefix for post links, e.g. "/en/blog" */
  linkPrefix?: string;
  /** Grid column configuration */
  columns?: {
    /** Columns on mobile (default: 1) */
    sm?: 1 | 2;
    /** Columns on tablet (default: 2) */
    md?: 1 | 2 | 3;
    /** Columns on desktop (default: 3) */
    lg?: 1 | 2 | 3 | 4;
  };
  /** Gap between cards (Tailwind gap class number, default: 6) */
  gap?: 4 | 6 | 8;
  /** Props to pass to each PostCard */
  cardProps?: Partial<Omit<PostCardProps, 'post' | 'linkPrefix'>>;
  /** Custom class name for the grid container */
  className?: string;
  /** Content to display when posts array is empty */
  emptyState?: React.ReactNode;
}

function getSmColumnClass(sm: 1 | 2): string {
  if (sm === 2) return 'sm:grid-cols-2';
  return 'grid-cols-1';
}

function getMdColumnClass(md: 1 | 2 | 3): string {
  if (md === 1) return 'md:grid-cols-1';
  if (md === 3) return 'md:grid-cols-3';
  return 'md:grid-cols-2';
}

function getLgColumnClass(lg: 1 | 2 | 3 | 4): string {
  if (lg === 1) return 'lg:grid-cols-1';
  if (lg === 2) return 'lg:grid-cols-2';
  if (lg === 4) return 'lg:grid-cols-4';
  return 'lg:grid-cols-3';
}

function getGapClass(gap: 4 | 6 | 8): string {
  if (gap === 4) return 'gap-4';
  if (gap === 8) return 'gap-8';
  return 'gap-6';
}

/**
 * Responsive grid container for blog post cards.
 *
 * Server Component - renders PostCard components in a responsive grid layout.
 */
export function PostGrid({
  posts,
  linkPrefix = '/blog',
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 6,
  cardProps,
  className,
  emptyState,
}: PostGridProps) {
  if (posts.length === 0) {
    return emptyState ?? null;
  }

  const { sm = 1, md = 2, lg = 3 } = columns;

  return (
    <div
      className={cn(
        'grid',
        getSmColumnClass(sm),
        getMdColumnClass(md),
        getLgColumnClass(lg),
        getGapClass(gap),
        className,
      )}
    >
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          linkPrefix={linkPrefix}
          {...cardProps}
        />
      ))}
    </div>
  );
}
