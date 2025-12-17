'use client';

import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MAGIC_0_3 } from '@/constants/decimal';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

// Types
export interface TechItem {
  id: string;
  name: string;
  version: string;
  category: string;
  url?: string;
}

export interface TechTabsBlockProps {
  techData?: TechItem[];
  categories?: Record<string, string>;
  defaultCategory?: string;
  i18nNamespace?: string;
  enableContentVisibility?: boolean;
}

type TFunc = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

// Default tech data (matches existing tech-stack-data.ts)
const DEFAULT_TECH_DATA: TechItem[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    version: '15.1.6',
    category: 'core',
    url: 'https://nextjs.org',
  },
  {
    id: 'react',
    name: 'React',
    version: '19.0.0',
    category: 'core',
    url: 'https://react.dev',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    version: '5.8.2',
    category: 'core',
    url: 'https://typescriptlang.org',
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    version: '4.0.0',
    category: 'ui',
    url: 'https://tailwindcss.com',
  },
  {
    id: 'shadcn-ui',
    name: 'shadcn/ui',
    version: 'latest',
    category: 'ui',
    url: 'https://ui.shadcn.com',
  },
  {
    id: 'radix-ui',
    name: 'Radix UI',
    version: 'latest',
    category: 'ui',
    url: 'https://radix-ui.com',
  },
  {
    id: 'next-intl',
    name: 'next-intl',
    version: '3.29.1',
    category: 'i18n',
    url: 'https://next-intl.dev',
  },
  {
    id: 'eslint',
    name: 'ESLint',
    version: '9.18.0',
    category: 'tools',
    url: 'https://eslint.org',
  },
  {
    id: 'prettier',
    name: 'Prettier',
    version: '3.4.2',
    category: 'tools',
    url: 'https://prettier.io',
  },
  {
    id: 'husky',
    name: 'Husky',
    version: '9.1.7',
    category: 'tools',
    url: 'https://typicode.github.io/husky',
  },
  {
    id: 'jest',
    name: 'Jest',
    version: '29.7.0',
    category: 'testing',
    url: 'https://jestjs.io',
  },
  {
    id: 'testing-library',
    name: 'Testing Library',
    version: '16.1.0',
    category: 'testing',
    url: 'https://testing-library.com',
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    version: '10.13.1',
    category: 'dev',
    url: 'https://pnpm.io',
  },
  {
    id: 'turbo',
    name: 'Turbo',
    version: '2.3.3',
    category: 'dev',
    url: 'https://turbo.build',
  },
];

const DEFAULT_CATEGORIES: Record<string, string> = {
  core: 'core',
  ui: 'ui',
  i18n: 'i18n',
  tools: 'tools',
  testing: 'testing',
  dev: 'dev',
  performance: 'performance',
};

// Sub-components
function TechStackStats({
  t,
  techCount,
  categoryCount,
}: {
  t: TFunc;
  techCount: number;
  categoryCount: number;
}) {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: MAGIC_0_3,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`mt-12 rounded-lg border bg-card p-6 transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-primary'>{techCount}</div>
          <div className='text-sm text-foreground/85'>
            {t('stats.totalTech')}
          </div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-primary'>{categoryCount}</div>
          <div className='text-sm text-foreground/85'>
            {t('stats.categories')}
          </div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-primary'>100%</div>
          <div className='text-sm text-foreground/85'>{t('stats.modern')}</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-primary'>A+</div>
          <div className='text-sm text-foreground/85'>{t('stats.quality')}</div>
        </div>
      </div>
    </div>
  );
}

function TechStackTitle({
  titleRef,
  titleVisible,
  title,
  subtitle,
}: {
  titleRef: (node: HTMLDivElement | null) => void;
  titleVisible: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      ref={titleRef}
      className={`mb-12 text-center transition-all duration-700 ease-out ${
        titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
        {title}
      </h2>
      <p className='mx-auto max-w-2xl text-lg text-foreground/85'>{subtitle}</p>
    </div>
  );
}

function TechStackTabs({
  selectedCategory,
  setSelectedCategory,
  tabsRef,
  tabsVisible,
  categorizedTech,
  categories,
  t,
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  tabsRef: (node: HTMLDivElement | null) => void;
  tabsVisible: boolean;
  categorizedTech: Record<string, TechItem[]>;
  categories: Record<string, string>;
  t: TFunc;
}) {
  const categoryKeys = Object.keys(categories);

  return (
    <Tabs
      value={selectedCategory}
      onValueChange={setSelectedCategory}
      className='w-full'
    >
      <div
        ref={tabsRef}
        className={`transition-all delay-200 duration-700 ease-out ${
          tabsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <TabsList className='mb-8 grid w-full grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-7'>
          {categoryKeys.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className='text-xs sm:text-sm'
            >
              {t(`categories.${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tech content */}
        {categoryKeys.map((category, index) => (
          <TabsContent
            key={`category-${index}`}
            value={category}
            className='mt-0'
          >
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {/* eslint-disable-next-line security/detect-object-injection -- category comes from Object.keys(categories), not user input */}
              {(categorizedTech[category] || []).map((tech, techIndex) => (
                <Card
                  key={`tech-${techIndex}`}
                  className='group transition-all duration-200 hover:shadow-lg hover:shadow-primary/5'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg'>{tech.name}</CardTitle>
                      <Badge
                        variant='secondary'
                        className='text-xs'
                      >
                        v{tech.version}
                      </Badge>
                    </div>
                    <CardDescription className='text-sm'>
                      {t(`technologies.${tech.id}`)}
                    </CardDescription>
                  </CardHeader>
                  {tech.url && (
                    <CardContent className='pt-0'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100'
                        asChild
                      >
                        <a
                          href={tech.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1'
                          aria-label={t('learnMoreLabel', {
                            target: tech.name,
                          })}
                        >
                          {t('learnMoreLabel', { target: tech.name })}
                          <ExternalLink className='h-3 w-3' />
                        </a>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

export function TechTabsBlock({
  techData = DEFAULT_TECH_DATA,
  categories = DEFAULT_CATEGORIES,
  defaultCategory = 'core',
  i18nNamespace = 'home.techStack',
  enableContentVisibility = true,
}: TechTabsBlockProps = {}) {
  const t = useTranslations(i18nNamespace);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  // Animation hooks
  const { ref: titleRef, isVisible: titleVisible } =
    useIntersectionObserver<HTMLDivElement>({
      threshold: MAGIC_0_3,
      triggerOnce: true,
    });

  const { ref: tabsRef, isVisible: tabsVisible } =
    useIntersectionObserver<HTMLDivElement>({
      threshold: MAGIC_0_3,
      triggerOnce: true,
    });

  // Categorize tech data
  const categorizedTech = useMemo(() => {
    const result: Record<string, TechItem[]> = {};
    for (const category of Object.keys(categories)) {
      // eslint-disable-next-line security/detect-object-injection -- category comes from Object.keys(categories), not user input
      result[category] = techData.filter((tech) => tech.category === category);
    }
    return result;
  }, [techData, categories]);

  return (
    <section
      id='tech-stack'
      className={cn(enableContentVisibility && 'cv-800', 'py-20')}
    >
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-6xl'>
          <TechStackTitle
            titleRef={titleRef}
            titleVisible={titleVisible}
            title={t('title')}
            subtitle={t('subtitle')}
          />

          <TechStackTabs
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            tabsRef={tabsRef}
            tabsVisible={tabsVisible}
            categorizedTech={categorizedTech}
            categories={categories}
            t={t}
          />

          <TechStackStats
            t={t}
            techCount={techData.length}
            categoryCount={Object.keys(categories).length}
          />
        </div>
      </div>
    </section>
  );
}
