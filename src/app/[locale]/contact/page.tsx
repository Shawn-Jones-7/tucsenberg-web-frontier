import type { Metadata } from 'next';
import { getTranslationsCached } from '@/lib/i18n/server/getTranslationsCached';
import { ContactForm } from '@/components/contact/contact-form';
import { Card } from '@/components/ui/card';
import { generateLocaleStaticParams } from '@/app/[locale]/generate-static-params';
import { COUNT_PAIR } from '@/constants';

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslationsCached({
    locale,
    namespace: 'underConstruction.pages.contact',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

// 页面标题组件
function ContactPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='mb-12 text-center'>
      <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl'>
        <span className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
          {title}
        </span>
      </h1>
      <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
        {description}
      </p>
    </div>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const t = await getTranslationsCached({
    locale,
    namespace: 'underConstruction.pages.contact',
  });

  return (
    <main className='min-h-[80vh] px-4 py-16'>
      <div className='mx-auto max-w-4xl'>
        <ContactPageHeader
          title={t('title')}
          description={t('description')}
        />

        <div className='grid gap-8 md:grid-cols-2'>
          <ContactForm />

          {/* 联系信息 */}
          <div className='space-y-6'>
            <Card className='p-6'>
              <h3 className='mb-4 text-xl font-semibold'>
                {t('panel.contactTitle')}
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                    <svg
                      className='h-5 w-5 text-primary'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={COUNT_PAIR}
                        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='font-medium'>{t('panel.email')}</p>
                    <p className='text-muted-foreground'>
                      contact@tucsenberg.com
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                    <svg
                      className='h-5 w-5 text-primary'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={COUNT_PAIR}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='font-medium'>{t('panel.phone')}</p>
                    <p className='text-muted-foreground'>+1-555-0123</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <h3 className='mb-4 text-xl font-semibold'>
                {t('panel.hoursTitle')}
              </h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>{t('panel.weekdays')}</span>
                  <span className='text-muted-foreground'>9:00 - 18:00</span>
                </div>
                <div className='flex justify-between'>
                  <span>{t('panel.saturday')}</span>
                  <span className='text-muted-foreground'>10:00 - 16:00</span>
                </div>
                <div className='flex justify-between'>
                  <span>{t('panel.sunday')}</span>
                  <span className='text-muted-foreground'>
                    {t('panel.closed')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
