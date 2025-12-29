import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  HeadphonesIcon,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { generateMetadataForPath, type Locale } from '@/lib/seo-metadata';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { generateLocaleStaticParams } from '@/app/[locale]/generate-static-params';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'about',
  });

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: 'about',
    path: '/about',
    config: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    },
  });
}

// Hero section component
interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

function HeroSection({ title, subtitle, description }: HeroSectionProps) {
  return (
    <section className='relative overflow-hidden bg-muted/30 py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl'>
          <h1 className='text-heading mb-4'>{title}</h1>
          <p className='mb-4 text-xl font-medium text-primary'>{subtitle}</p>
          <p className='text-body text-muted-foreground'>{description}</p>
        </div>
      </div>
    </section>
  );
}

// Mission section component
interface MissionSectionProps {
  title: string;
  content: string;
}

function MissionSection({ title, content }: MissionSectionProps) {
  return (
    <section className='py-12 md:py-16'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-3xl text-center'>
          <h2 className='mb-6 text-2xl font-bold'>{title}</h2>
          <p className='text-body leading-relaxed text-muted-foreground'>
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

// Value card component
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          {icon}
        </div>
        <CardTitle className='text-lg'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className='text-sm leading-relaxed'>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

// Values section component
interface ValuesSectionProps {
  title: string;
  values: {
    quality: { title: string; description: string };
    innovation: { title: string; description: string };
    service: { title: string; description: string };
    integrity: { title: string; description: string };
  };
}

function ValuesSection({ title, values }: ValuesSectionProps) {
  // nosemgrep: object-injection-sink-spread-operator
  // Reason: values is derived from controlled translation/config objects
  // and only used to render UI content (title/description/icons). It never
  // flows into persistence, command execution, or other sensitive sinks.
  const valueItems = [
    { key: 'quality', icon: <Award className='h-6 w-6' />, ...values.quality },
    {
      key: 'innovation',
      icon: <Lightbulb className='h-6 w-6' />,
      ...values.innovation,
    },
    {
      key: 'service',
      icon: <HeadphonesIcon className='h-6 w-6' />,
      ...values.service,
    },
    {
      key: 'integrity',
      icon: <ShieldCheck className='h-6 w-6' />,
      ...values.integrity,
    },
  ];

  return (
    <section className='bg-muted/30 py-12 md:py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='mb-10 text-center text-2xl font-bold'>{title}</h2>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {valueItems.map((item) => (
            <ValueCard
              key={item.key}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats section component
interface StatsSectionProps {
  stats: {
    yearsExperience: string;
    countriesServed: string;
    happyClients: string;
    productsDelivered: string;
  };
}

function StatsSection({ stats }: StatsSectionProps) {
  const statItems = [
    { key: 'years', value: '15+', label: stats.yearsExperience },
    { key: 'countries', value: '50+', label: stats.countriesServed },
    { key: 'clients', value: '1000+', label: stats.happyClients },
    { key: 'products', value: '10M+', label: stats.productsDelivered },
  ];

  return (
    <section className='py-12 md:py-16'>
      <div className='container mx-auto px-4'>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {statItems.map((item) => (
            <div
              key={item.key}
              className='text-center'
            >
              <div className='mb-2 text-4xl font-bold text-primary'>
                {item.value}
              </div>
              <div className='text-sm text-muted-foreground'>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA section component
interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  locale: string;
}

function CTASection({
  title,
  description,
  buttonText,
  locale,
}: CTASectionProps) {
  return (
    <section className='bg-primary py-12 md:py-16'>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='mb-4 text-2xl font-bold text-primary-foreground'>
          {title}
        </h2>
        <p className='mx-auto mb-8 max-w-2xl text-primary-foreground/80'>
          {description}
        </p>
        <Button
          asChild
          size='lg'
          variant='secondary'
        >
          <Link href={`/${locale}/contact`}>
            {buttonText}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: 'about',
  });

  const heroProps = {
    title: t('hero.title'),
    subtitle: t('hero.subtitle'),
    description: t('hero.description'),
  };

  const missionProps = {
    title: t('mission.title'),
    content: t('mission.content'),
  };

  const valuesProps = {
    title: t('values.title'),
    values: {
      quality: {
        title: t('values.quality.title'),
        description: t('values.quality.description'),
      },
      innovation: {
        title: t('values.innovation.title'),
        description: t('values.innovation.description'),
      },
      service: {
        title: t('values.service.title'),
        description: t('values.service.description'),
      },
      integrity: {
        title: t('values.integrity.title'),
        description: t('values.integrity.description'),
      },
    },
  };

  const statsProps = {
    stats: {
      yearsExperience: t('stats.yearsExperience'),
      countriesServed: t('stats.countriesServed'),
      happyClients: t('stats.happyClients'),
      productsDelivered: t('stats.productsDelivered'),
    },
  };

  const ctaProps = {
    title: t('cta.title'),
    description: t('cta.description'),
    buttonText: t('cta.button'),
    locale,
  };

  return (
    <main>
      <HeroSection {...heroProps} />
      <MissionSection {...missionProps} />
      <ValuesSection {...valuesProps} />
      <StatsSection {...statsProps} />
      <CTASection {...ctaProps} />
    </main>
  );
}
