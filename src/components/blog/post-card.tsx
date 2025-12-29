import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { PostSummary } from '@/types/content.types';
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

export interface PostCardProps {
  post: PostSummary;
  /** Prefix for the link, e.g. "/en/blog" or "/zh/blog" */
  linkPrefix?: string;
  /** Whether to show cover image */
  showCoverImage?: boolean;
  /** Whether to show tags */
  showTags?: boolean;
  /** Whether to show reading time */
  showReadingTime?: boolean;
  /** Maximum number of tags to display */
  maxTags?: number;
  /** Custom class name */
  className?: string;
  /** Reading time unit label */
  readingTimeLabel?: string;
}

interface CoverImageProps {
  src: string;
  alt: string;
}

function CoverImage({ src, alt }: CoverImageProps) {
  return (
    <div className='relative aspect-[16/9] w-full overflow-hidden'>
      <Image
        src={src}
        alt={alt}
        fill
        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
        className='object-cover transition-transform duration-300 group-hover:scale-105'
        {...getBlurPlaceholder('neutral')}
      />
    </div>
  );
}

interface TagListProps {
  tags: string[];
  maxTags: number;
}

function TagList({ tags, maxTags }: TagListProps) {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  return (
    <div className='flex flex-wrap gap-1.5'>
      {displayTags.map((tag) => (
        <Badge
          key={tag}
          variant='secondary'
          className='text-xs'
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant='outline'
          className='text-xs'
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

interface PostMetaProps {
  publishedAt: string;
  readingTime: number | undefined;
  readingTimeLabel: string;
  showReadingTime: boolean;
}

function PostMeta({
  publishedAt,
  readingTime,
  readingTimeLabel,
  showReadingTime,
}: PostMetaProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <CardFooter className='mt-auto gap-4 text-xs text-muted-foreground'>
      <time
        dateTime={publishedAt}
        className='flex items-center gap-1'
      >
        <Calendar
          className='h-3.5 w-3.5'
          aria-hidden='true'
        />
        {formattedDate}
      </time>
      {showReadingTime && readingTime !== undefined && (
        <span className='flex items-center gap-1'>
          <Clock
            className='h-3.5 w-3.5'
            aria-hidden='true'
          />
          {readingTime} {readingTimeLabel}
        </span>
      )}
    </CardFooter>
  );
}

/**
 * Blog post card component for displaying post summaries in a grid layout.
 *
 * Designed as a Server Component - no client-side interactivity required.
 */
export function PostCard({
  post,
  linkPrefix = '/blog',
  showCoverImage = true,
  showTags = true,
  showReadingTime = true,
  maxTags = 3,
  className,
  readingTimeLabel = 'min read',
}: PostCardProps) {
  const {
    slug,
    title,
    description,
    excerpt,
    publishedAt,
    coverImage,
    tags,
    readingTime,
  } = post;

  const displayText = description ?? excerpt;
  const shouldShowCoverImage = showCoverImage && coverImage !== undefined;
  const shouldShowTags = showTags && tags !== undefined && tags.length > 0;

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
          {shouldShowCoverImage && (
            <CoverImage
              src={coverImage}
              alt={title}
            />
          )}

          <CardHeader className='gap-3'>
            {shouldShowTags && (
              <TagList
                tags={tags}
                maxTags={maxTags}
              />
            )}
            <CardTitle className='line-clamp-2 text-lg leading-snug transition-colors group-hover:text-primary'>
              {title}
            </CardTitle>
          </CardHeader>

          {displayText !== undefined && (
            <CardContent className='pt-0'>
              <CardDescription className='line-clamp-3'>
                {displayText}
              </CardDescription>
            </CardContent>
          )}

          <PostMeta
            publishedAt={publishedAt}
            readingTime={readingTime}
            readingTimeLabel={readingTimeLabel}
            showReadingTime={showReadingTime}
          />
        </Card>
      </Link>
    </article>
  );
}
