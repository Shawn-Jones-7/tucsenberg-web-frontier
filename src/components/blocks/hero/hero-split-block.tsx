import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface HeroSplitBlockMessages extends Record<string, unknown> {
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

export interface HeroSplitBlockProps {
  showBg?: boolean;
  technologies?: string[];
  stats?: Array<{ value: string; labelKey: string }>;
  demoHref?: string;
  githubHref?: string;
}

// Hero Badge Component
function HeroBadge({ version }: { version: string }) {
  return (
    <div className='mb-8 flex justify-center'>
      <Badge className='bg-foreground px-4 py-2 text-sm font-medium text-background'>
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
      className='mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl'
      data-testid='home-hero-title'
      {...(id ? { id } : {})}
    >
      <span className='block'>{line1}</span>
      <span className='block text-foreground'>{line2}</span>
    </h1>
  );
}

// Tech Stack Badges Component
function TechStackBadges({ technologies }: { technologies: string[] }) {
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
  t,
  demoHref,
  githubHref,
}: {
  t: (key: string) => string;
  demoHref: string;
  githubHref: string;
}) {
  return (
    <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
      <Button
        size='lg'
        className='group bg-foreground px-8 py-3 text-lg text-background hover:bg-foreground/90'
        asChild
      >
        <a
          href={demoHref}
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
          href={githubHref}
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
function HeroStats({
  t,
  stats,
}: {
  t: (key: string) => string;
  stats: Array<{ value: string; labelKey: string }>;
}) {
  return (
    <div className='mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4'>
      {stats.map((stat, index) => (
        <div
          key={`stat-${stat.labelKey}-${index}`}
          className='text-center'
        >
          <div className='text-3xl font-bold text-foreground'>{stat.value}</div>
          <div className='text-sm text-foreground/80'>
            {t(`stats.${stat.labelKey}`)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Default values
const DEFAULT_TECHNOLOGIES = [
  'Next.js 15',
  'React 19',
  'TypeScript 5.8',
  'Tailwind CSS 4',
  'shadcn/ui',
  'next-intl',
];

const DEFAULT_STATS = [
  { value: '22+', labelKey: 'technologies' },
  { value: '100%', labelKey: 'typescript' },
  { value: 'A+', labelKey: 'performance' },
  { value: '2', labelKey: 'languages' },
];

const DEFAULT_DEMO_HREF = '#demo';
const DEFAULT_GITHUB_HREF = '[GITHUB_URL]';

function HeroSplitBlockBody({
  t,
  showBg,
  technologies,
  stats,
  demoHref,
  githubHref,
}: {
  t: (key: string) => string;
  showBg: boolean;
  technologies: string[];
  stats: Array<{ value: string; labelKey: string }>;
  demoHref: string;
  githubHref: string;
}) {
  return (
    <section
      data-testid='hero-section'
      className='relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32'
      aria-labelledby='hero-heading'
    >
      {showBg ? (
        <>
          <div className='absolute inset-0 -z-10 bg-background md:hidden' />
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

          <p className='mx-auto mb-10 max-w-2xl text-lg text-foreground/80 sm:text-xl'>
            {t('subtitle')}
          </p>

          <TechStackBadges technologies={technologies} />

          <HeroActionButtons
            t={t}
            demoHref={demoHref}
            githubHref={githubHref}
          />

          <HeroStats
            t={t}
            stats={stats}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * HeroSplitBlock - Server Component
 * Uses getTranslations for server-side i18n
 */
export async function HeroSplitBlock({
  showBg = true,
  technologies = DEFAULT_TECHNOLOGIES,
  stats = DEFAULT_STATS,
  demoHref = DEFAULT_DEMO_HREF,
  githubHref = DEFAULT_GITHUB_HREF,
}: HeroSplitBlockProps = {}) {
  const tNs = await getTranslations('home.hero');
  const t = (key: string) => tNs(key);

  return (
    <HeroSplitBlockBody
      t={t}
      showBg={showBg}
      technologies={technologies}
      stats={stats}
      demoHref={demoHref}
      githubHref={githubHref}
    />
  );
}

// Type for nested translation messages (unknown depth; narrowed at runtime)
type TranslationMessages = HeroSplitBlockMessages;

// Helper to get nested path from messages object
function getByPath(source: TranslationMessages, path: string): string {
  const parts = path.split('.');
  let cur: unknown = source;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) {
      return '';
    }

    const record = cur as Record<string, unknown>;
    let next: unknown;
    for (const [key, value] of Object.entries(record)) {
      if (key === p) {
        next = value;
        break;
      }
    }

    if (next === undefined) {
      return '';
    }

    cur = next;
  }
  return typeof cur === 'string' ? cur : '';
}

/**
 * HeroSplitBlockStatic - Static variant for LCP optimization
 * Accepts pre-loaded messages via props, avoids NextIntlClientProvider dependency
 */
export function HeroSplitBlockStatic({
  messages,
  showBg = true,
  technologies = DEFAULT_TECHNOLOGIES,
  stats = DEFAULT_STATS,
  demoHref = DEFAULT_DEMO_HREF,
  githubHref = DEFAULT_GITHUB_HREF,
}: HeroSplitBlockProps & { messages: HeroSplitBlockMessages }) {
  const t = (key: string) => getByPath(messages, key);
  return (
    <HeroSplitBlockBody
      t={t}
      showBg={showBg}
      technologies={technologies}
      stats={stats}
      demoHref={demoHref}
      githubHref={githubHref}
    />
  );
}
