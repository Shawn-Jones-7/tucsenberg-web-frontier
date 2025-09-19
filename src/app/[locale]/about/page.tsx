import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UnderConstruction } from '@/components/shared/under-construction';
import { COUNT_PAIR } from '@/constants';

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'underConstruction.pages.about',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function AboutPage() {
  return (
    <UnderConstruction
      pageType='about'
      currentStep={COUNT_PAIR}
      expectedDate='2024年第二季度'
      showProgress={true}
    />
  );
}
