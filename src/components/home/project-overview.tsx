'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MAGIC_0_2 } from "@/constants/decimal";
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { PROJECT_STATS, TECH_ARCHITECTURE } from '@/lib/site-config';
import {
  ArrowRight,
  CheckCircle,
  Code,
  ExternalLink,
  Globe,
  Palette,
  Rocket,
  Shield,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

function FeatureGrid({ t }: { t: (_key: string) => string }) {
  const features = [
    {
      icon: Zap,
      title: t('features.performance.title'),
      description: t('features.performance.description'),
      badge: PROJECT_STATS.performance.grade,
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
      badge: PROJECT_STATS.performance.securityScore,
    },
    {
      icon: Globe,
      title: t('features.i18n.title'),
      description: t('features.i18n.description'),
      badge: `${PROJECT_STATS.performance.languages} 语言`,
    },
    {
      icon: Palette,
      title: t('features.themes.title'),
      description: t('features.themes.description'),
      badge: PROJECT_STATS.performance.themes,
    },
    {
      icon: Code,
      title: t('features.typescript.title'),
      description: t('features.typescript.description'),
      badge: PROJECT_STATS.performance.typescriptVersion,
    },
    {
      icon: Rocket,
      title: t('features.deployment.title'),
      description: t('features.deployment.description'),
      badge: PROJECT_STATS.performance.deployment,
    },
  ];

  return (
    <div className='mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card
            key={index}
            className='group hover:shadow-primary/5 transition-all duration-200 hover:shadow-lg'
          >
            <CardHeader>
              <div className='flex items-center justify-between'>
                <Icon className='text-primary h-8 w-8' />
                <Badge variant='secondary'>{feature.badge}</Badge>
              </div>
              <CardTitle className='text-xl'>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

function ProjectHighlights({ t }: { t: (_key: string) => string }) {
  const highlights = [
    t('highlights.modern'),
    t('highlights.scalable'),
    t('highlights.accessible'),
    t('highlights.performant'),
    t('highlights.secure'),
    t('highlights.maintainable'),
  ];

  return (
    <div className='mb-16'>
      <Card className='from-primary/5 to-secondary/5 bg-gradient-to-br'>
        <CardHeader>
          <CardTitle className='text-2xl'>{t('highlights.title')}</CardTitle>
          <CardDescription className='text-lg'>
            {t('highlights.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className='flex items-center gap-2'
              >
                <CheckCircle className='h-5 w-5 text-green-500' />
                <span className='text-sm font-medium'>{highlight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TechnicalArchitecture({ t }: { t: (_key: string) => string }) {
  return (
    <div className='mb-16'>
      <h3 className='mb-8 text-center text-2xl font-bold'>
        {t('architecture.title')}
      </h3>
      <div className='grid gap-6 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-blue-500'></div>
              {t('architecture.frontend.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-muted-foreground text-sm'>
              {t('architecture.frontend.description')}
            </div>
            <div className='flex flex-wrap gap-1'>
              {TECH_ARCHITECTURE.frontend.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant='outline'
                  className='text-xs'
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-green-500'></div>
              {t('architecture.ui.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-muted-foreground text-sm'>
              {t('architecture.ui.description')}
            </div>
            <div className='flex flex-wrap gap-1'>
              {TECH_ARCHITECTURE.ui.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant='outline'
                  className='text-xs'
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-purple-500'></div>
              {t('architecture.tooling.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-muted-foreground text-sm'>
              {t('architecture.tooling.description')}
            </div>
            <div className='flex flex-wrap gap-1'>
              {TECH_ARCHITECTURE.tooling.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant='outline'
                  className='text-xs'
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProjectOverview() {
  const t = useTranslations('home.overview');

  // 动画Hook
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: MAGIC_0_2,
    triggerOnce: true,
  });

  return (
    <section className='py-20'>
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
            <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
              {t('subtitle')}
            </p>
          </div>

          <FeatureGrid t={t} />
          <ProjectHighlights t={t} />

          <TechnicalArchitecture t={t} />

          {/* 行动号召 */}
          <div className='text-center'>
            <Card className='from-primary/10 to-secondary/10 mx-auto max-w-2xl bg-gradient-to-r'>
              <CardHeader>
                <CardTitle className='text-2xl'>{t('cta.title')}</CardTitle>
                <CardDescription className='text-lg'>
                  {t('cta.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                  <Button
                    size='lg'
                    className='group'
                  >
                    {t('cta.getStarted')}
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </Button>
                  <Button
                    variant='outline'
                    size='lg'
                    asChild
                  >
                    <a
                      href='https://github.com/tucsenberg/web-frontier'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2'
                    >
                      {t('cta.viewSource')}
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
