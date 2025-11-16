'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PROJECT_STATS } from '@/lib/site-config';
import {
  BadgeShowcase,
  ButtonShowcase,
  FormShowcase,
  InteractiveShowcase,
  ResponsiveShowcase,
  ThemeShowcase,
} from '@/components/home/showcase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ONE } from '@/constants';
import { MAGIC_0_2 } from '@/constants/decimal';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

export function ComponentShowcase() {
  const t = useTranslations('home.showcase');
  const [likeCount, setLikeCount] = useState<number>(
    PROJECT_STATS.community.initialLikeCount,
  );
  const [isLiked, setIsLiked] = useState(false);

  // 动画Hook
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: MAGIC_0_2,
    triggerOnce: true,
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - ONE : prev + ONE));
  };

  return (
    <section
      id='demo'
      className='cv-1000 bg-muted/30 py-20'
    >
      <div className='container mx-auto px-4'>
        <div
          ref={ref}
          className={`mx-auto max-w-6xl transition-all duration-700 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {/* 标题 */}
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
              {t('title')}
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              {t('subtitle')}
            </p>
          </div>

          <Tabs
            defaultValue='components'
            className='w-full'
          >
            <TabsList className='mb-8 grid w-full grid-cols-3'>
              <TabsTrigger value='components'>
                {t('tabs.components')}
              </TabsTrigger>
              <TabsTrigger value='themes'>{t('tabs.themes')}</TabsTrigger>
              <TabsTrigger value='responsive'>
                {t('tabs.responsive')}
              </TabsTrigger>
            </TabsList>

            {/* 组件演示 */}
            <TabsContent
              value='components'
              className='space-y-6'
            >
              <div className='grid gap-6 lg:grid-cols-2'>
                <ButtonShowcase t={t} />
                <FormShowcase t={t} />
                <InteractiveShowcase
                  t={t}
                  likeCount={likeCount}
                  isLiked={isLiked}
                  handleLike={handleLike}
                />
                <BadgeShowcase t={t} />
              </div>
            </TabsContent>

            <ThemeShowcase t={t} />
            <ResponsiveShowcase t={t} />
          </Tabs>
        </div>
      </div>
    </section>
  );
}
