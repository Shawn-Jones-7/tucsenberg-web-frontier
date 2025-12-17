'use client';

import type React from 'react';
import {
  ArrowRight,
  ExternalLink,
  Github,
  MessageCircle,
  Star,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { COUNT_700 } from '@/constants/count';
import { MAGIC_0_2 } from '@/constants/decimal';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

// Types
export interface ActionItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  primary: boolean;
  external: boolean;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface CTABannerBlockProps {
  actions?: ActionItem[];
  stats?: StatItem[];
  i18nNamespace?: string;
  githubHref?: string;
  demoHref?: string;
  discussionsHref?: string;
  issuesHref?: string;
}

// UI Constants
const UI_CONSTANTS = {
  LONG_ANIMATION_DURATION: COUNT_700,
  INTERSECTION_THRESHOLD: MAGIC_0_2,
  ANIMATION_DURATION: 200,
} as const;

// Sub-components
function StatsDisplay({ stats }: { stats: StatItem[] }) {
  return (
    <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
      {stats.map((stat, index) => (
        <div
          key={index}
          className='text-center'
        >
          <div className='text-2xl font-bold text-foreground sm:text-3xl'>
            {stat.value}
          </div>
          <div className='text-sm text-muted-foreground'>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function ActionCards({
  t,
  actions,
}: {
  t: (key: string) => string;
  actions: ActionItem[];
}) {
  return (
    <div className='grid gap-6 sm:grid-cols-3'>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Card
            key={index}
            className={cn(
              'group transition-all hover:shadow-lg',
              action.primary
                ? 'border-primary/20 bg-primary/5 hover:shadow-primary/10'
                : 'hover:shadow-primary/5',
            )}
            style={{
              transitionDuration: `${UI_CONSTANTS.ANIMATION_DURATION}ms`,
            }}
          >
            <CardHeader className='text-center'>
              <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10'>
                <Icon className='h-6 w-6 text-primary' />
              </div>
              <CardTitle className='text-lg'>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button
                variant={action.primary ? 'default' : 'outline'}
                className='w-full group-hover:shadow-sm'
                asChild
              >
                <a
                  href={action.href}
                  {...(action.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  })}
                  className='flex items-center justify-center gap-2'
                >
                  {action.primary
                    ? t('buttons.getStarted')
                    : t('buttons.learnMore')}
                  {action.external ? (
                    <ExternalLink className='h-4 w-4' />
                  ) : (
                    <ArrowRight className='h-4 w-4' />
                  )}
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CommunitySection({
  t,
  discussionsHref,
  issuesHref,
}: {
  t: (key: string) => string;
  discussionsHref: string;
  issuesHref: string;
}) {
  return (
    <div className='mt-16 text-center'>
      <Card className='bg-muted/50'>
        <CardHeader>
          <CardTitle className='flex items-center justify-center gap-2'>
            <MessageCircle className='h-5 w-5' />
            {t('community.title')}
          </CardTitle>
          <CardDescription className='text-base'>
            {t('community.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              variant='outline'
              asChild
            >
              <a
                href={discussionsHref}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2'
              >
                {t('community.discussions')}
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
            <Button
              variant='outline'
              asChild
            >
              <a
                href={issuesHref}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2'
              >
                {t('community.issues')}
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default data factory (kept internal for block defaults)
function getDefaultData(t: (key: string) => string) {
  return {
    actions: [
      {
        icon: Github,
        title: t('actions.github.title'),
        description: t('actions.github.description'),
        href: 'https://github.com/tucsenberg/web-frontier',
        primary: true,
        external: true,
      },
      {
        icon: Star, // Using Star as placeholder for Download
        title: t('actions.download.title'),
        description: t('actions.download.description'),
        href: 'https://github.com/tucsenberg/web-frontier/archive/main.zip',
        primary: false,
        external: true,
      },
      {
        icon: MessageCircle, // Using MessageCircle as placeholder for BookOpen
        title: t('actions.docs.title'),
        description: t('actions.docs.description'),
        href: '/docs',
        primary: false,
        external: false,
      },
    ],
    stats: [
      { value: '22+', label: t('stats.technologies') },
      { value: '100%', label: t('stats.typescript') },
      { value: 'A+', label: t('stats.performance') },
      { value: '2', label: t('stats.languages') },
    ],
  };
}

export function CTABannerBlock({
  actions,
  stats,
  i18nNamespace = 'home.cta',
  githubHref = 'https://github.com/tucsenberg/web-frontier',
  demoHref = '#demo',
  discussionsHref = 'https://github.com/tucsenberg/web-frontier/discussions',
  issuesHref = 'https://github.com/tucsenberg/web-frontier/issues',
}: CTABannerBlockProps = {}) {
  const t = useTranslations(i18nNamespace);

  // Animation Hook
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: UI_CONSTANTS.INTERSECTION_THRESHOLD,
    triggerOnce: true,
  });

  // Use provided data or defaults
  const defaultData = getDefaultData(t);
  const resolvedActions = actions ?? defaultData.actions;
  const resolvedStats = stats ?? defaultData.stats;

  return (
    <section className='cv-600 bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20'>
      <div className='container mx-auto px-4'>
        <div
          ref={ref}
          className={cn(
            'mx-auto max-w-4xl',
            'transition-all ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{
            transitionDuration: `${UI_CONSTANTS.LONG_ANIMATION_DURATION}ms`,
          }}
        >
          {/* Main CTA */}
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

            <p className='mx-auto mb-8 max-w-2xl text-lg text-foreground/85 sm:text-xl'>
              {t('subtitle')}
            </p>

            {/* Primary buttons */}
            <div className='mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Button
                size='lg'
                className='group px-8 py-4 text-lg'
                asChild
              >
                <a
                  href={githubHref}
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
                  href={demoHref}
                  className='flex items-center gap-2'
                >
                  {t('primary.demo')}
                  <ExternalLink className='h-4 w-4' />
                </a>
              </Button>
            </div>

            {/* Stats */}
            <StatsDisplay stats={resolvedStats} />
          </div>

          {/* Action cards */}
          <ActionCards
            t={t}
            actions={resolvedActions}
          />

          <CommunitySection
            t={t}
            discussionsHref={discussionsHref}
            issuesHref={issuesHref}
          />
        </div>
      </div>
    </section>
  );
}
