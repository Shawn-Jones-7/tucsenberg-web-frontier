import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ReactScanDemoClient } from '@/app/[locale]/react-scan-demo/react-scan-demo-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReactScanDemo' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ReactScanDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReactScanDemo' });

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-6 text-3xl font-bold'>{t('title')}</h1>
        <p className='mb-8 text-lg text-gray-600'>{t('description')}</p>

        <div className='mb-8 rounded-lg bg-blue-50 p-6'>
          <h2 className='mb-4 text-xl font-semibold text-blue-900'>
            {t('instructions.title')}
          </h2>
          <ul className='space-y-2 text-blue-800'>
            <li>• {t('instructions.step1')}</li>
            <li>• {t('instructions.step2')}</li>
            <li>• {t('instructions.step3')}</li>
            <li>• {t('instructions.step4')}</li>
          </ul>
        </div>

        <ReactScanDemoClient />
      </div>
    </div>
  );
}
