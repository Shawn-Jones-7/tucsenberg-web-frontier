'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MAGIC_0_3 } from "@/constants/decimal";
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Hero Badge Component
function HeroBadge({
  badgeRef,
  badgeVisible,
  version,
}: {
  badgeRef: (_node: HTMLDivElement | null) => void;
  badgeVisible: boolean;
  version: string;
}) {
  return (
    <div
      ref={badgeRef}
      className={`mb-8 flex justify-center transition-all duration-700 ease-out ${
        badgeVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <Badge
        variant='secondary'
        className='px-4 py-2 text-sm font-medium'
      >
        <span className='mr-2'>🚀</span>
        {version}
      </Badge>
    </div>
  );
}

// Hero Title Component
function HeroTitle({
  titleRef,
  titleVisible,
  line1,
  line2,
}: {
  titleRef: (_node: HTMLHeadingElement | null) => void;
  titleVisible: boolean;
  line1: string;
  line2: string;
}) {
  return (
    <h1
      ref={titleRef}
      className={`text-foreground mb-6 text-4xl font-bold tracking-tight transition-all delay-200 duration-700 ease-out sm:text-6xl lg:text-7xl ${
        titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <span className='block'>{line1}</span>
      <span className='from-primary to-secondary block bg-gradient-to-r bg-clip-text text-transparent'>
        {line2}
      </span>
    </h1>
  );
}

// Tech Stack Badges Component
function TechStackBadges() {
  const technologies = [
    'Next.js 15',
    'React 19',
    'TypeScript 5.8',
    'Tailwind CSS 4',
    'shadcn/ui',
    'next-intl',
  ];

  return (
    <div className='mb-10 flex flex-wrap justify-center gap-3'>
      {technologies.map((tech, index) => (
        <Badge
          key={`tech-${index}`}
          variant='outline'
          className='px-3 py-1 text-sm'
        >
          {tech}
        </Badge>
      ))}
    </div>
  );
}

// Hero Action Buttons Component
function HeroActionButtons({
  buttonsRef,
  buttonsVisible,
  t,
}: {
  buttonsRef: (_node: HTMLDivElement | null) => void;
  buttonsVisible: boolean;
  t: (_key: string) => string;
}) {
  return (
    <div
      ref={buttonsRef}
      className={`flex flex-col items-center gap-4 transition-all delay-400 duration-700 ease-out sm:flex-row sm:justify-center ${
        buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <Button
        size='lg'
        className='group px-8 py-3 text-lg'
        asChild
      >
        <a
          href='#demo'
          className='flex items-center gap-2'
        >
          {t('cta.demo')}
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </a>
      </Button>

      <Button
        variant='outline'
        size='lg'
        className='px-8 py-3 text-lg'
        asChild
      >
        <a
          href='https://github.com/tucsenberg/web-frontier'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2'
        >
          <Github className='h-4 w-4' />
          {t('cta.github')}
          <ExternalLink className='h-3 w-3' />
        </a>
      </Button>
    </div>
  );
}

// Hero Stats Component
function HeroStats({ t }: { t: (_key: string) => string }) {
  const stats = [
    { value: '22+', key: 'technologies' },
    { value: '100%', key: 'typescript' },
    { value: 'A+', key: 'performance' },
    { value: '2', key: 'languages' },
  ];

  return (
    <div className='mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4'>
      {stats.map((stat, index) => (
        <div
          key={`stat-${stat.key}-${index}`}
          className='text-center'
        >
          <div className='text-foreground text-3xl font-bold'>{stat.value}</div>
          <div className='text-muted-foreground text-sm'>
            {t(`stats.${stat.key}`)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations('home.hero');

  // 动画Hook
  const { ref: badgeRef, isVisible: badgeVisible } =
    useIntersectionObserver<HTMLDivElement>({
      threshold: MAGIC_0_3,
      triggerOnce: true,
    });

  const { ref: titleRef, isVisible: titleVisible } =
    useIntersectionObserver<HTMLHeadingElement>({
      threshold: MAGIC_0_3,
      triggerOnce: true,
    });

  const { ref: buttonsRef, isVisible: buttonsVisible } =
    useIntersectionObserver<HTMLDivElement>({
      threshold: MAGIC_0_3,
      triggerOnce: true,
    });

  return (
    <section className='from-background via-background to-muted/20 relative overflow-hidden bg-gradient-to-br py-20 sm:py-32'>
      {/* 背景装饰 */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 transform'>
          <div className='from-primary/10 to-secondary/10 h-[600px] w-[600px] rounded-full bg-gradient-to-r blur-3xl' />
        </div>
      </div>

      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <HeroBadge
            badgeRef={badgeRef}
            badgeVisible={badgeVisible}
            version={t('version')}
          />

          <HeroTitle
            titleRef={titleRef}
            titleVisible={titleVisible}
            line1={t('title.line1')}
            line2={t('title.line2')}
          />

          {/* 副标题 */}
          <p className='text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl'>
            {t('subtitle')}
          </p>

          <TechStackBadges />

          <HeroActionButtons
            buttonsRef={buttonsRef}
            buttonsVisible={buttonsVisible}
            t={t}
          />

          <HeroStats t={t} />
        </div>
      </div>
    </section>
  );
}
