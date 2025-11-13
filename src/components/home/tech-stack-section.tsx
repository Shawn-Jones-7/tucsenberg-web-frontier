'use client';

import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  techStackCategories,
  techStackData,
  type TechStackCategory,
} from '@/lib/tech-stack-data';
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

type TFunc = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

function TechStackStats({ t }: { t: TFunc }) {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: MAGIC_0_3,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`bg-card mt-12 rounded-lg border p-6 transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
        <div className='text-center'>
          <div className='text-primary text-2xl font-bold'>
            {techStackData.length}
          </div>
          <div className='text-foreground/85 text-sm'>
            {t('stats.totalTech')}
          </div>
        </div>
        <div className='text-center'>
          <div className='text-primary text-2xl font-bold'>
            {Object.keys(techStackCategories).length}
          </div>
          <div className='text-foreground/85 text-sm'>
            {t('stats.categories')}
          </div>
        </div>
        <div className='text-center'>
          <div className='text-primary text-2xl font-bold'>100%</div>
          <div className='text-foreground/85 text-sm'>{t('stats.modern')}</div>
        </div>
        <div className='text-center'>
          <div className='text-primary text-2xl font-bold'>A+</div>
          <div className='text-foreground/85 text-sm'>{t('stats.quality')}</div>
        </div>
      </div>
    </div>
  );
}

// Tech Stack Title Component
function TechStackTitle({
  titleRef,
  titleVisible,
  title,
  subtitle,
}: {
  titleRef: (_node: HTMLDivElement | null) => void;
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
      <p className='text-foreground/85 mx-auto max-w-2xl text-lg'>{subtitle}</p>
    </div>
  );
}

// Tech Stack Tabs Component
function TechStackTabs({
  selectedCategory,
  setSelectedCategory,
  tabsRef,
  tabsVisible,
  categorizedTech,
  t,
}: {
  selectedCategory: TechStackCategory;
  setSelectedCategory: (_category: TechStackCategory) => void;
  tabsRef: (_node: HTMLDivElement | null) => void;
  tabsVisible: boolean;
  categorizedTech: Record<TechStackCategory, typeof techStackData>;
  t: TFunc;
}) {
  return (
    <Tabs
      value={selectedCategory}
      onValueChange={(value) => setSelectedCategory(value as TechStackCategory)}
      className='w-full'
    >
      <div
        ref={tabsRef}
        className={`transition-all delay-200 duration-700 ease-out ${
          tabsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <TabsList className='mb-8 grid w-full grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-7'>
          {Object.entries(techStackCategories).map(([key]) => (
            <TabsTrigger
              key={key}
              value={key}
              className='text-xs sm:text-sm'
            >
              {t(`categories.${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 技术栈内容 */}
        {Object.entries(categorizedTech).map(([_category, items], index) => (
          <TabsContent
            key={`category-${index}`}
            value={_category}
            className='mt-0'
          >
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {items.map((tech, techIndex) => (
                <Card
                  key={`tech-${techIndex}`}
                  className='group hover:shadow-primary/5 transition-all duration-200 hover:shadow-lg'
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
                          {t('learnMore')}
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

function filterTechByCategory(category: TechStackCategory) {
  const items: typeof techStackData = [];
  for (const tech of techStackData) {
    if (tech.category === category) {
      items.push(tech);
    }
  }
  return items;
}

export function TechStackSection() {
  const t = useTranslations('home.techStack');
  const [selectedCategory, setSelectedCategory] =
    useState<TechStackCategory>('core');

  // 动画Hook
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

  const categorizedTech = useMemo(() => {
    const categories = Object.keys(techStackCategories) as TechStackCategory[];
    const entries: Array<[TechStackCategory, typeof techStackData]> = [];

    for (const category of categories) {
      entries.push([category, filterTechByCategory(category)]);
    }

    return Object.fromEntries(entries) as Record<
      TechStackCategory,
      typeof techStackData
    >;
  }, []);

  return (
    <section
      id='tech-stack'
      className='cv-800 py-20'
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
            t={t}
          />

          <TechStackStats t={t} />
        </div>
      </div>
    </section>
  );
}
