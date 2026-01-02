import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/types/content.types';
import { getAllPostsCached } from '@/lib/content/blog';
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from '@/lib/seo-metadata';
import { PostGrid } from '@/components/blog';
import { generateLocaleStaticParams } from '@/app/[locale]/generate-static-params';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface BlogPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'blog',
  });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: 'blog',
    path: '/blog',
    config: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    },
  });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: 'blog',
  });

  const posts = await getAllPostsCached(locale as Locale, {
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    draft: false,
  });

  const linkPrefix = `/${locale}/blog`;

  return (
    <main className='container mx-auto px-4 py-8 md:py-12'>
      {/* Page Header */}
      <header className='mb-8 md:mb-12'>
        <h1 className='text-heading mb-4'>{t('pageTitle')}</h1>
        <p className='text-body max-w-2xl text-muted-foreground'>
          {t('pageDescription')}
        </p>
      </header>

      {/* Post Grid */}
      <PostGrid
        posts={posts}
        linkPrefix={linkPrefix}
        locale={locale}
        cardProps={{
          readingTimeLabel: t('readingTime'),
        }}
        emptyState={
          <div className='py-12 text-center'>
            <p className='text-muted-foreground'>{t('emptyState')}</p>
          </div>
        }
      />
    </main>
  );
}
