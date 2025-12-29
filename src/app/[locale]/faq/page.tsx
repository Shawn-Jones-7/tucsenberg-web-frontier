import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/types/content.types';
import { getPageBySlug } from '@/lib/content';
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from '@/lib/seo-metadata';
import { generateFAQSchema } from '@/lib/structured-data';
import { JsonLdScript } from '@/components/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from '@/app/[locale]/generate-static-params';
import { Link } from '@/i18n/routing';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface FaqPageProps {
  params: Promise<LocaleParam>;
}

export async function generateMetadata({
  params,
}: FaqPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'faq',
  });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: 'support',
    path: '/faq',
    config: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    },
  });
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  categoryTitle: string;
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

function parseFaqContent(rawContent: string): FaqCategory[] {
  const lines = rawContent.split('\n');
  const categories: FaqCategory[] = [];

  let currentCategory: FaqCategory | null = null;
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];

  const flushQuestion = () => {
    if (currentCategory === null || currentQuestion === null) {
      currentAnswerLines = [];
      return;
    }

    const answer = currentAnswerLines.join('\n').trim();
    if (answer === '') {
      currentAnswerLines = [];
      return;
    }

    const item: FaqItem = {
      id: `${currentCategory.id}-${currentCategory.items.length + 1}`,
      question: currentQuestion,
      answer,
      categoryTitle: currentCategory.title,
    };

    currentCategory.items.push(item);
    currentQuestion = null;
    currentAnswerLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '---') {
      // 水平分隔线，对 FAQ 结构无实际影响
      // 不将其纳入问答内容，避免污染答案文本
      // 直接跳过当前行
    } else if (trimmed.startsWith('## ')) {
      // 新的分类标题，先冲刷上一条问题
      flushQuestion();

      const title = trimmed.slice(3).trim();
      const category: FaqCategory = {
        id: `category-${categories.length + 1}`,
        title,
        items: [],
      };

      categories.push(category);
      currentCategory = category;
    } else if (trimmed.startsWith('### ')) {
      // 新的问题标题，先冲刷上一条问题
      flushQuestion();

      currentQuestion = trimmed.slice(4).trim();
      currentAnswerLines = [];
    } else if (currentQuestion !== null) {
      currentAnswerLines.push(line);
    }
  }

  flushQuestion();

  return categories.filter((category) => category.items.length > 0);
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = getPageBySlug('faq', locale as Locale);
  const t = await getTranslations({
    locale,
    namespace: 'faq',
  });

  const parsedCategories = parseFaqContent(page.content);
  const faqItems = parsedCategories.flatMap((category) => category.items);

  const faqSchema = generateFAQSchema(
    faqItems.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    locale as Locale,
  );

  const hasQuestions = faqItems.length > 0;

  return (
    <>
      <JsonLdScript data={faqSchema} />

      <main className='container mx-auto px-4 py-8 md:py-12'>
        <header className='mb-8 md:mb-12'>
          <h1 className='text-heading mb-4'>{t('pageTitle')}</h1>
          <p className='text-body max-w-2xl text-muted-foreground'>
            {t('pageDescription')}
          </p>
        </header>

        {hasQuestions ? (
          <div className='space-y-10'>
            {parsedCategories.map((category) => (
              <section
                key={category.id}
                className='space-y-4'
              >
                {category.title !== '' && (
                  <h2 className='text-lg font-semibold text-foreground'>
                    {category.title}
                  </h2>
                )}

                <Accordion
                  type='single'
                  collapsible
                >
                  {category.items.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                    >
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className='text-sm leading-relaxed whitespace-pre-line'>
                          {item.answer.trim()}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground'>{t('noResults')}</p>
        )}

        <section className='mt-12 rounded-lg border bg-muted/40 px-6 py-5'>
          <h2 className='mb-2 text-base font-semibold'>
            {t('contactCta.title')}
          </h2>
          <p className='mb-4 text-sm text-muted-foreground'>
            {t('contactCta.description')}
          </p>
          <Button asChild>
            <Link href='/contact'>{t('contactCta.button')}</Link>
          </Button>
        </section>
      </main>
    </>
  );
}
