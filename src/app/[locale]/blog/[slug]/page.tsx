import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale, PostDetail } from '@/types/content';
import { getAllPostsCached, getPostBySlugCached } from '@/lib/content/blog';
import { Badge } from '@/components/ui/badge';

interface BlogDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const locales: Locale[] = ['en', 'zh'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const posts = await getAllPostsCached(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

function buildPostMetadata(post: PostDetail): Metadata {
  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.description ?? post.excerpt;

  return {
    title,
    description,
    keywords: post.seo?.keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: post.seo?.ogImage ? [post.seo.ogImage] : undefined,
    },
  };
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const post = await getPostBySlugCached(locale as Locale, slug);
    return buildPostMetadata(post);
  } catch {
    return { title: 'Article Not Found' };
  }
}

interface ArticleMetaProps {
  post: PostDetail;
  publishedLabel: string;
  readingTimeLabel: string;
}

function ArticleMeta({
  post,
  publishedLabel,
  readingTimeLabel,
}: ArticleMetaProps) {
  return (
    <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
      <div className='flex items-center gap-1.5'>
        <Calendar className='h-4 w-4' />
        <time dateTime={post.publishedAt}>
          {publishedLabel} {new Date(post.publishedAt).toLocaleDateString()}
        </time>
      </div>
      {post.readingTime !== undefined && (
        <div className='flex items-center gap-1.5'>
          <Clock className='h-4 w-4' />
          <span>
            {post.readingTime} {readingTimeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

interface ArticleTagsProps {
  tags: string[] | undefined;
  categories: string[] | undefined;
}

function ArticleTags({ tags, categories }: ArticleTagsProps) {
  const hasTags = tags !== undefined && tags.length > 0;
  const hasCategories = categories !== undefined && categories.length > 0;

  if (!hasTags && !hasCategories) {
    return null;
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {hasCategories &&
        categories.map((category) => (
          <Badge
            key={category}
            variant='secondary'
          >
            {category}
          </Badge>
        ))}
      {hasTags &&
        tags.map((tag) => (
          <Badge
            key={tag}
            variant='outline'
          >
            <Tag className='mr-1 h-3 w-3' />
            {tag}
          </Badge>
        ))}
    </div>
  );
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(localeParam);

  const t = await getTranslations({ locale, namespace: 'blog' });

  let post: PostDetail;
  try {
    post = await getPostBySlugCached(locale, slug);
  } catch {
    notFound();
  }

  return (
    <main className='container mx-auto px-4 py-8 md:py-12'>
      <nav className='mb-6'>
        <Link
          href={`/${locale}/blog`}
          className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('backToList')}
        </Link>
      </nav>

      <article className='mx-auto max-w-3xl'>
        <header className='mb-8 space-y-4'>
          <ArticleTags
            tags={post.tags}
            categories={post.categories}
          />
          <h1 className='text-heading'>{post.title}</h1>
          {post.excerpt !== undefined && (
            <p className='text-body text-muted-foreground'>{post.excerpt}</p>
          )}
          <ArticleMeta
            post={post}
            publishedLabel={t('publishedOn')}
            readingTimeLabel={t('readingTime')}
          />
        </header>

        <div
          className='prose prose-neutral dark:prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags !== undefined && post.tags.length > 0 && (
          <footer className='mt-12 border-t pt-6'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                {t('author')}{' '}
                <span className='font-medium text-foreground'>
                  Tucsenberg Team
                </span>
              </span>
            </div>
          </footer>
        )}
      </article>
    </main>
  );
}
