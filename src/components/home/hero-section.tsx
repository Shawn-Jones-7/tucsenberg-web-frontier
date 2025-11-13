import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface HeroSectionMessages extends Record<string, unknown> {
  version?: string;
  title?: {
    line1?: string;
    line2?: string;
  };
  subtitle?: string;
  cta?: {
    demo?: string;
    github?: string;
  };
  stats?: {
    technologies?: string;
    typescript?: string;
    performance?: string;
    languages?: string;
  };
}

// Hero Badge Component
function HeroBadge({ version }: { version: string }) {
  return (
    <div className='mb-8 flex justify-center'>
      {/* 提升对比度：使用高对比配色，避免 secondary 方案在深色主题下对比不足 */}
      <Badge className='bg-foreground text-background px-4 py-2 text-sm font-medium'>
        <span className='mr-2'>🚀</span>
        {version}
      </Badge>
    </div>
  );
}

// Hero Title Component
function HeroTitle({
  line1,
  line2,
  id,
}: {
  line1: string;
  line2: string;
  id?: string;
}) {
  return (
    <h1
      className='text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl'
      {...(id ? { id } : {})}
    >
      <span className='block'>{line1}</span>
      <span className='text-foreground block'>{line2}</span>
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
function HeroActionButtons({ t }: { t: (_key: string) => string }) {
  return (
    <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
      <Button
        size='lg'
        className='group bg-foreground text-background hover:bg-foreground/90 px-8 py-3 text-lg'
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
          <div className='text-foreground/80 text-sm'>
            {t(`stats.${stat.key}`)}
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroSectionBody(props: {
  t: (key: string) => string;
  showBg: boolean;
}) {
  const { t, showBg } = props;

  return (
    <section
      data-testid='hero-section'
      className='from-background via-background to-muted/20 relative overflow-hidden bg-gradient-to-br py-20 sm:py-32'
      aria-labelledby='hero-heading'
    >
      {showBg ? (
        <>
          <div className='bg-background absolute inset-0 -z-10 md:hidden' />
          <div className='absolute inset-0 -z-10 hidden md:block'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 transform'>
              <div className='h-[600px] w-[600px] bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.03)_0%,transparent_32px)]' />
            </div>
          </div>
        </>
      ) : null}

      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <HeroBadge version={t('version')} />

          <HeroTitle
            line1={t('title.line1')}
            line2={t('title.line2')}
            id='hero-heading'
          />

          <p className='text-foreground/80 mx-auto mb-10 max-w-2xl text-lg sm:text-xl'>
            {t('subtitle')}
          </p>

          <TechStackBadges />

          <HeroActionButtons t={t} />

          <HeroStats t={t} />
        </div>
      </div>
    </section>
  );
}

export async function HeroSection() {
  const tNs = await getTranslations('home.hero');
  const t = (key: string) => tNs(key);

  // Server-rendered, minimal-JS variant without client hooks/animations
  return (
    <HeroSectionBody
      t={t}
      showBg={true}
    />
  );
}

// Type for nested translation messages (unknown depth; narrowed at runtime)
type TranslationMessages = HeroSectionMessages;

// Static variant that avoids runtime getTranslations by accepting a minimal
// messages object for the hero namespace. Intended for first paint (LCP) path.
function getByPath(source: TranslationMessages, path: string): string {
  const parts = path.split('.');
  let cur: unknown = source;
  for (const p of parts) {
    if (
      typeof cur === 'object' &&
      cur !== null &&
      p in (cur as Record<string, unknown>)
    ) {
      // eslint-disable-next-line security/detect-object-injection
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return '';
    }
  }
  return typeof cur === 'string' ? cur : '';
}

export function HeroSectionStatic({
  messages,
  showBg = true,
}: {
  messages: HeroSectionMessages;
  showBg?: boolean;
}) {
  const t = (key: string) => getByPath(messages, key);
  return (
    <HeroSectionBody
      t={t}
      showBg={showBg}
    />
  );
}
