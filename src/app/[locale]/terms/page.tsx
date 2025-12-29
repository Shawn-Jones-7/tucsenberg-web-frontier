import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/types/content.types';
import { getPageBySlug } from '@/lib/content';
import {
  renderLegalContent,
  slugifyHeading,
} from '@/lib/content/render-legal-content';
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from '@/lib/seo-metadata';
import { JsonLdScript } from '@/components/seo';
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from '@/app/[locale]/generate-static-params';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface TermsPageProps {
  params: Promise<LocaleParam>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'terms',
  });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: 'terms',
    path: '/terms',
    config: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    },
  });
}

interface TocItem {
  id: string;
  label: string;
}

const TERMS_SECTION_KEYS = [
  'introduction',
  'acceptance',
  'services',
  'orders',
  'payment',
  'shipping',
  'warranty',
  'liability',
  'ip',
  'confidentiality',
  'termination',
  'governing',
  'disputes',
  'contact',
] as const;

const H2_PREFIX_LENGTH = 3;
const H3_PREFIX_LENGTH = 4;

interface ParsedHeading {
  level: 2 | 3;
  text: string;
}

function extractHeadings(content: string): ParsedHeading[] {
  const lines = content.split('\n');
  const headings: ParsedHeading[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      headings.push({ level: 2, text: trimmed.slice(H2_PREFIX_LENGTH).trim() });
    } else if (trimmed.startsWith('### ')) {
      headings.push({ level: 3, text: trimmed.slice(H3_PREFIX_LENGTH).trim() });
    }
  }

  return headings;
}

function buildTocItems(
  tSections: (key: string) => string,
  headings: ParsedHeading[],
): TocItem[] {
  const items: TocItem[] = [];

  for (const sectionKey of TERMS_SECTION_KEYS) {
    const label = tSections(`sections.${sectionKey}`);

    const match = headings.find((heading) => {
      if (heading.level !== 2) {
        return false;
      }
      const headingText = heading.text;
      return headingText.includes(label) || label.includes(headingText);
    });

    const id =
      match !== undefined ? slugifyHeading(match.text) : slugifyHeading(label);

    items.push({
      id,
      label,
    });
  }

  return items;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = getPageBySlug('terms', locale as Locale);

  const t = await getTranslations({
    locale,
    namespace: 'terms',
  });

  const headings = extractHeadings(page.content);
  const tocItems = buildTocItems((key) => t(key), headings);

  const termsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'inLanguage': locale,
    'name': t('pageTitle'),
    'description': t('pageDescription'),
    'datePublished': page.metadata.publishedAt,
    'dateModified':
      page.metadata.updatedAt ??
      page.metadata.lastReviewed ??
      page.metadata.publishedAt,
  } as const;

  const hasTocItems = tocItems.length > 0;

  return (
    <>
      <JsonLdScript data={termsSchema} />

      <main className='container mx-auto px-4 py-8 md:py-12'>
        <header className='mb-6 md:mb-8'>
          <h1 className='text-heading mb-4'>{t('pageTitle')}</h1>
          <p className='text-body max-w-2xl text-muted-foreground'>
            {t('pageDescription')}
          </p>
        </header>

        <section className='mb-8 flex flex-wrap gap-4 text-xs text-muted-foreground sm:text-sm'>
          {page.metadata.publishedAt !== undefined && (
            <div>
              <span className='font-medium'>{t('effectiveDate')}:</span>{' '}
              <span>{page.metadata.publishedAt}</span>
            </div>
          )}
          {page.metadata.updatedAt !== undefined && (
            <div>
              <span className='font-medium'>{t('lastUpdated')}:</span>{' '}
              <span>{page.metadata.updatedAt}</span>
            </div>
          )}
        </section>

        <div className='grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]'>
          <article className='min-w-0'>
            {renderLegalContent(page.content)}
          </article>

          {hasTocItems && (
            <aside className='order-first rounded-lg border bg-muted/40 p-4 text-sm lg:order-none'>
              <h2 className='mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                {t('tableOfContents')}
              </h2>
              <nav aria-label={t('tableOfContents')}>
                <ol className='space-y-2'>
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className='inline-flex text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm'
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}
