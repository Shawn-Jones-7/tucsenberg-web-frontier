import { CallToAction } from '@/components/home/call-to-action';
import { ComponentShowcase } from '@/components/home/component-showcase';
import { HeroSection } from '@/components/home/hero-section';
import { ProjectOverview } from '@/components/home/project-overview';
import { TechStackSection } from '@/components/home/tech-stack-section';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function Home() {
  return (
    <div className='bg-background text-foreground min-h-screen'>
      <HeroSection />
      <TechStackSection />
      <ComponentShowcase />
      <ProjectOverview />
      <CallToAction />
    </div>
  );
}
