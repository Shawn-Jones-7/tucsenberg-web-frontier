import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UnderConstruction } from '@/components/shared/under-construction';
import { ONE } from '@/constants';

interface ProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'underConstruction.pages.products',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function ProductsPage() {
  return (
    <UnderConstruction
      pageType='products'
      currentStep={ONE}
      expectedDate='2024年第二季度'
      showProgress={true}
    />
  );
}
