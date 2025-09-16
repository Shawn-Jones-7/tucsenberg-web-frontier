'use client';

import { ArrowRight, ExternalLink, Github, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { ActionCards } from '@/components/home/cta/action-cards';
import { CommunitySection } from '@/components/home/cta/community-section';
import { getCallToActionData } from '@/components/home/cta/data';
import { StatsDisplay } from '@/components/home/cta/stats-display';

// UI常量
const UI_CONSTANTS = {
  /** 长动画持续时间: 700ms */
  LONG_ANIMATION_DURATION: 700,
  /** 交叉观察器阈值 */
  INTERSECTION_THRESHOLD: 0.2,
} as const;

export function CallToAction() {
  const t = useTranslations('home.cta');

  // 动画Hook
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: UI_CONSTANTS.INTERSECTION_THRESHOLD,
    triggerOnce: true,
  });

  const { actions, stats } = getCallToActionData(t);

  return (
    <section className='from-primary/5 via-background to-secondary/5 bg-gradient-to-br py-20'>
      <div className='container mx-auto px-4'>
        <div
          ref={ref}
          className={`mx-auto max-w-4xl transition-all duration-[${UI_CONSTANTS.LONG_ANIMATION_DURATION}ms] ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {/* 主要行动号召 */}
          <div className='mb-16 text-center'>
            <div className='mb-6'>
              <Badge className='mb-4 px-4 py-2 text-sm font-medium'>
                <Star className='mr-2 h-4 w-4' />
                {t('badge')}
              </Badge>
            </div>

            <h2 className='mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
              {t('title')}
            </h2>

            <p className='text-muted-foreground mx-auto mb-8 max-w-2xl text-lg sm:text-xl'>
              {t('subtitle')}
            </p>

            {/* 主要按钮 */}
            <div className='mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Button
                size='lg'
                className='group px-8 py-4 text-lg'
                asChild
              >
                <a
                  href='https://github.com/tucsenberg/web-frontier'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2'
                >
                  <Github className='h-5 w-5' />
                  {t('primary.github')}
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </a>
              </Button>

              <Button
                variant='outline'
                size='lg'
                className='px-8 py-4 text-lg'
                asChild
              >
                <a
                  href='#demo'
                  className='flex items-center gap-2'
                >
                  {t('primary.demo')}
                  <ExternalLink className='h-4 w-4' />
                </a>
              </Button>
            </div>

            {/* 统计数据 */}
            <StatsDisplay stats={stats} />
          </div>

          {/* 行动选项 */}
          <ActionCards
            t={t}
            actions={actions}
          />

          <CommunitySection t={t} />
        </div>
      </div>
    </section>
  );
}
