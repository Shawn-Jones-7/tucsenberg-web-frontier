'use client';

import dynamic from 'next/dynamic';
import {
  CallToActionSkeleton,
  ComponentShowcaseSkeleton,
  ProjectOverviewSkeleton,
  TechStackSkeleton,
} from '@/components/home/below-the-fold-skeleton';

// Dynamic imports use leaf module paths directly to ensure optimal code splitting
// Importing from barrel (@/components/blocks) risks chunk size bloat
const TechStackSection = dynamic(
  () =>
    import('@/components/blocks/tech/tech-tabs-block').then(
      (m) => m.TechTabsBlock,
    ),
  { loading: () => <TechStackSkeleton />, ssr: false },
);
const ComponentShowcase = dynamic(
  () =>
    import('@/components/home/component-showcase').then(
      (m) => m.ComponentShowcase,
    ),
  { loading: () => <ComponentShowcaseSkeleton />, ssr: false },
);
const ProjectOverview = dynamic(
  () =>
    import('@/components/blocks/features/features-grid-block').then(
      (m) => m.FeaturesGridBlock,
    ),
  { loading: () => <ProjectOverviewSkeleton /> },
);
const CallToAction = dynamic(
  () =>
    import('@/components/blocks/cta/cta-banner-block').then(
      (m) => m.CTABannerBlock,
    ),
  { loading: () => <CallToActionSkeleton /> },
);

export function BelowTheFoldClient() {
  return (
    <>
      <TechStackSection enableContentVisibility={true} />
      <ComponentShowcase />
      <ProjectOverview />
      <CallToAction />
    </>
  );
}
