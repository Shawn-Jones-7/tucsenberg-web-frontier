import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale, PostDetail } from '@/types/content.types';
import { getStaticParamsForType } from '@/lib/content-manifest';
import { getPostBySlugCached } from '@/lib/content/blog';
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from '@/lib/seo-metadata';
import { generateLocalizedStructuredData } from '@/lib/structured-data';
import type { ArticleData } from '@/lib/structured-data-types';
import { MDXContent } from '@/components/mdx';
import { JsonLdScript } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { SITE_CONFIG } from '@/config/paths';

interface BlogDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getStaticParamsForType('posts');
}

function buildBlogDetailSEOConfig(
  post: PostDetail,
): NonNullable<Parameters<typeof generateMetadataForPath>[0]['config']> {
  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.description ?? post.excerpt;

  const config: NonNullable<
    Parameters<typeof generateMetadataForPath>[0]['config']
  > = {
    title,
    type: 'article',
    publishedTime: post.publishedAt,
  };

  if (description !== undefined) config.description = description;
  if (post.seo?.keywords !== undefined) config.keywords = post.seo.keywords;
  if (post.seo?.ogImage !== undefined) {
    config.image = post.seo.ogImage;
  } else if (post.coverImage !== undefined) {
    config.image = post.coverImage;
  }
  if (post.updatedAt !== undefined) config.modifiedTime = post.updatedAt;
  if (post.categories?.[0] !== undefined) config.section = post.categories[0];

  return config;
}

function buildArticleSchema(
  locale: Locale,
  slug: string,
  post: PostDetail,
): Promise<Record<string, unknown>> {
  const canonicalUrl = new URL(
    `/${locale}/blog/${slug}`,
    SITE_CONFIG.baseUrl,
  ).toString();
  const title = post.seo?.title ?? post.title;
  const description =
    post.seo?.description ??
    post.description ??
    post.excerpt ??
    SITE_CONFIG.seo.defaultDescription;

  const imageCandidate = post.seo?.ogImage ?? post.coverImage;
  const imageUrl =
    imageCandidate !== undefined
      ? new URL(imageCandidate, SITE_CONFIG.baseUrl).toString()
      : undefined;

  const articleData: ArticleData = {
    title,
    description,
    publishedTime: post.publishedAt,
    url: canonicalUrl,
  };

  if (post.updatedAt !== undefined) articleData.modifiedTime = post.updatedAt;
  if (imageUrl !== undefined) articleData.image = imageUrl;
  if (post.categories?.[0] !== undefined)
    articleData.section = post.categories[0];

  return generateLocalizedStructuredData(locale, 'Article', articleData);
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const post = await getPostBySlugCached(locale as Locale, slug);
    return generateMetadataForPath({
      locale: locale as SeoLocale,
      pageType: 'blog',
      path: `/blog/${slug}`,
      config: buildBlogDetailSEOConfig(post),
    });
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

function ArticleExcerpt({ excerpt }: { excerpt: string | undefined }) {
  if (!excerpt) return null;
  return <p className='text-body text-muted-foreground'>{excerpt}</p>;
}

function ArticleFooter({
  tags,
  authorLabel,
}: {
  tags: string[] | undefined;
  authorLabel: string;
}) {
  if (!tags || tags.length === 0) return null;

  return (
    <footer className='mt-12 border-t pt-6'>
      <div className='flex items-center gap-2'>
        <User className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>
          {authorLabel}{' '}
          <span className='font-medium text-foreground'>Tucsenberg Team</span>
        </span>
      </div>
    </footer>
  );
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(localeParam);

  const t = await getTranslations({ locale, namespace: 'blog' });

  const post = await getPostBySlugCached(locale, slug).catch(() => notFound());
  const articleSchema = await buildArticleSchema(locale, slug, post);

  return (
    <main className='container mx-auto px-4 py-8 md:py-12'>
      <JsonLdScript data={articleSchema} />
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
          <ArticleExcerpt excerpt={post.excerpt} />
          <ArticleMeta
            post={post}
            publishedLabel={t('publishedOn')}
            readingTimeLabel={t('readingTime')}
          />
        </header>

        <MDXContent
          type='posts'
          locale={locale}
          slug={slug}
          className='prose max-w-none prose-neutral dark:prose-invert'
        />

        <ArticleFooter
          tags={post.tags}
          authorLabel={t('author')}
        />
      </article>
    </main>
  );
}
