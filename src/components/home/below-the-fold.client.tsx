'use client';

import dynamic from 'next/dynamic';

// Dynamic imports use leaf module paths directly to ensure optimal code splitting
// Importing from barrel (@/components/blocks) risks chunk size bloat
const TechStackSection = dynamic(() =>
  import('@/components/blocks/tech/tech-tabs-block').then(
    (m) => m.TechTabsBlock,
  ),
);
const ComponentShowcase = dynamic(() =>
  import('@/components/home/component-showcase').then(
    (m) => m.ComponentShowcase,
  ),
);
const ProjectOverview = dynamic(() =>
  import('@/components/blocks/features/features-grid-block').then(
    (m) => m.FeaturesGridBlock,
  ),
);
const CallToAction = dynamic(() =>
  import('@/components/blocks/cta/cta-banner-block').then(
    (m) => m.CTABannerBlock,
  ),
);

export function BelowTheFoldClient() {
  return (
    <>
      <TechStackSection enableContentVisibility={false} />
      <ComponentShowcase />
      <ProjectOverview />
      <CallToAction />
    </>
  );
}
