import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale, ProductDetail } from '@/types/content';
import {
  getAllProductsCached,
  getProductBySlugCached,
} from '@/lib/content/products';
import {
  ProductCertifications,
  ProductGallery,
  ProductInquiryForm,
  ProductSpecs,
  ProductTradeInfo,
} from '@/components/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Generate static params for all products
export async function generateStaticParams() {
  const locales: Locale[] = ['en', 'zh'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const products = await getAllProductsCached(locale);
    for (const product of products) {
      params.push({ locale, slug: product.slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const product = await getProductBySlugCached(locale as Locale, slug);

    return {
      title: product.seo?.title ?? product.title,
      description: product.seo?.description ?? product.description,
      keywords: product.seo?.keywords,
      openGraph: {
        title: product.seo?.title ?? product.title,
        description: product.seo?.description ?? product.description,
        images: product.seo?.ogImage ?? product.coverImage,
      },
    };
  } catch {
    return {
      title: 'Product Not Found',
    };
  }
}

// Sub-component: Quick trade info display
interface QuickTradeInfoProps {
  moq: string | undefined;
  leadTime: string | undefined;
  moqLabel: string;
  leadTimeLabel: string;
}

function QuickTradeInfo({
  moq,
  leadTime,
  moqLabel,
  leadTimeLabel,
}: QuickTradeInfoProps) {
  if (moq === undefined && leadTime === undefined) {
    return null;
  }

  return (
    <div className='flex flex-wrap gap-4 text-sm'>
      {moq !== undefined && (
        <div className='flex items-center gap-1'>
          <span className='font-medium'>{moqLabel}:</span>
          <span className='text-muted-foreground'>{moq}</span>
        </div>
      )}
      {leadTime !== undefined && (
        <div className='flex items-center gap-1'>
          <span className='font-medium'>{leadTimeLabel}:</span>
          <span className='text-muted-foreground'>{leadTime}</span>
        </div>
      )}
    </div>
  );
}

// Sub-component: Product info section
interface ProductInfoSectionProps {
  product: ProductDetail;
  moqLabel: string;
  leadTimeLabel: string;
  certificationsTitle: string;
  requestQuoteLabel: string;
  downloadPdfLabel: string;
  downloadPdfHref: string;
}

function ProductInfoSection({
  product,
  moqLabel,
  leadTimeLabel,
  certificationsTitle,
  requestQuoteLabel,
  downloadPdfLabel,
  downloadPdfHref,
}: ProductInfoSectionProps) {
  const hasCertifications =
    product.certifications !== undefined && product.certifications.length > 0;

  return (
    <div className='space-y-6'>
      <Badge variant='secondary'>{product.category}</Badge>
      <h1 className='text-heading'>{product.title}</h1>

      {product.description !== undefined && (
        <p className='text-body text-muted-foreground'>{product.description}</p>
      )}

      <QuickTradeInfo
        moq={product.moq}
        leadTime={product.leadTime}
        moqLabel={moqLabel}
        leadTimeLabel={leadTimeLabel}
      />

      {hasCertifications && (
        <ProductCertifications
          certifications={product.certifications as string[]}
          title={certificationsTitle}
        />
      )}

      <div className='flex flex-col gap-3 pt-4 sm:flex-row'>
        <Button
          size='lg'
          className='w-full sm:w-auto'
        >
          <MessageSquare className='mr-2 h-4 w-4' />
          {requestQuoteLabel}
        </Button>

        <Button
          size='lg'
          variant='outline'
          className='w-full sm:w-auto'
          asChild
        >
          <Link
            href={downloadPdfHref}
            target='_blank'
            rel='noreferrer'
          >
            <Download className='mr-2 h-4 w-4' />
            {downloadPdfLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Helper to build trade info props
// Uses object spread pattern to build a shallow, display-only map from the
// internal ProductDetail model. All fields originate from controlled content
// sources (MDX/product config), not from user input.
// nosemgrep: object-injection-sink-spread-operator
// Reason: The resulting object is only consumed by the ProductTradeInfo
// component for UI rendering and never passed to DB, filesystem, or exec
// functions.
function buildTradeInfoProps(product: ProductDetail): Record<string, string> {
  return {
    ...(product.moq !== undefined && { moq: product.moq }),
    ...(product.leadTime !== undefined && { leadTime: product.leadTime }),
    ...(product.supplyCapacity !== undefined && {
      supplyCapacity: product.supplyCapacity,
    }),
    ...(product.packaging !== undefined && { packaging: product.packaging }),
    ...(product.portOfLoading !== undefined && {
      portOfLoading: product.portOfLoading,
    }),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations({ locale, namespace: 'products' });

  let product: ProductDetail;
  try {
    product = await getProductBySlugCached(locale, slug);
  } catch {
    notFound();
  }

  const images = [product.coverImage, ...(product.images ?? [])];
  const hasSpecs =
    product.specs !== undefined && Object.keys(product.specs).length > 0;

  const downloadPdfHref = `/pdfs/products/${locale}/${product.slug}.pdf`;

  const tradeInfoLabels = {
    moq: t('detail.labels.moq'),
    leadTime: t('detail.labels.leadTime'),
    supplyCapacity: t('detail.labels.supplyCapacity'),
    packaging: t('detail.labels.packaging'),
    portOfLoading: t('detail.labels.portOfLoading'),
  };

  return (
    <main className='container mx-auto px-4 py-8 md:py-12'>
      <nav className='mb-6'>
        <Link
          href={`/${locale}/products`}
          className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('pageTitle')}
        </Link>
      </nav>

      <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
        <ProductGallery
          images={images}
          title={product.title}
        />
        <ProductInfoSection
          product={product}
          moqLabel={t('card.moq')}
          leadTimeLabel={t('card.leadTime')}
          certificationsTitle={t('detail.certifications')}
          requestQuoteLabel={t('requestQuote')}
          downloadPdfLabel={t('detail.downloadPdf')}
          downloadPdfHref={downloadPdfHref}
        />
      </div>

      <div className='mt-12 grid gap-8 lg:grid-cols-2'>
        {hasSpecs && (
          <ProductSpecs
            specs={product.specs as Record<string, string>}
            title={t('detail.specifications')}
          />
        )}
        <ProductTradeInfo
          {...buildTradeInfoProps(product)}
          labels={tradeInfoLabels}
          title={t('detail.tradeInfo')}
        />
      </div>

      {product.content !== '' && (
        <article className='prose prose-neutral mt-12 max-w-none dark:prose-invert'>
          <div dangerouslySetInnerHTML={{ __html: product.content }} />
        </article>
      )}

      {/* Product Inquiry Form */}
      <section className='mt-12'>
        <ProductInquiryForm
          productName={product.title}
          productSlug={product.slug}
        />
      </section>
    </main>
  );
}
