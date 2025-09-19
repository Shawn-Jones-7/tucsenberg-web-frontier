import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UnderConstruction } from '@/components/shared/under-construction';
import { ZERO } from '@/constants';

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
    namespace: 'underConstruction.pages.blog',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function BlogPage() {
  return (
    <UnderConstruction
      pageType='blog'
      currentStep={ZERO}
      expectedDate='2024年第三季度'
      showProgress={true}
    />
  );
}
