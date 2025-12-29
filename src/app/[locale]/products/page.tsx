import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/types/content.types';
import {
  getAllProductsCached,
  getProductCategoriesCached,
} from '@/lib/content/products';
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from '@/lib/seo-metadata';
import { ProductGrid } from '@/components/products';
import { generateLocaleStaticParams } from '@/app/[locale]/generate-static-params';
import { ProductCategoryFilter } from '@/app/[locale]/products/product-category-filter';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface ProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'products',
  });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: 'products',
    path: '/products',
    config: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    },
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { category } = await searchParams;
  const t = await getTranslations({
    locale,
    namespace: 'products',
  });

  // Fetch products and categories
  const productOptions = category !== undefined ? { category } : {};
  const [products, categories] = await Promise.all([
    getAllProductsCached(locale as Locale, productOptions),
    getProductCategoriesCached(locale as Locale),
  ]);

  const linkPrefix = `/${locale}/products`;

  const cardLabels = {
    moq: t('card.moq'),
    leadTime: t('card.leadTime'),
    supplyCapacity: t('card.supplyCapacity'),
    featured: t('featured'),
  };

  return (
    <main className='container mx-auto px-4 py-8 md:py-12'>
      {/* Page Header */}
      <header className='mb-8 md:mb-12'>
        <h1 className='text-heading mb-4'>{t('pageTitle')}</h1>
        <p className='text-body max-w-2xl text-muted-foreground'>
          {t('pageDescription')}
        </p>
      </header>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ProductCategoryFilter
          categories={categories}
          currentCategory={category}
          allCategoriesLabel={t('allCategories')}
          className='mb-8'
        />
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <ProductGrid
          products={products}
          linkPrefix={linkPrefix}
          labels={cardLabels}
          lg={3}
          md={2}
          sm={1}
          gap={6}
        />
      ) : (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>{t('emptyState')}</p>
        </div>
      )}
    </main>
  );
}
