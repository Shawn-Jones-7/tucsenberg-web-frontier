// Block Library - Explicit named exports only
// Dynamic imports should use leaf module paths directly, not this barrel

// Hero blocks
export {
  HeroSplitBlock,
  HeroSplitBlockStatic,
} from '@/components/blocks/hero/hero-split-block';
export type {
  HeroSplitBlockProps,
  HeroSplitBlockMessages,
} from '@/components/blocks/hero/hero-split-block';

// Feature blocks
export { FeaturesGridBlock } from '@/components/blocks/features/features-grid-block';
export type { FeaturesGridBlockProps } from '@/components/blocks/features/features-grid-block';

// CTA blocks
export { CTABannerBlock } from '@/components/blocks/cta/cta-banner-block';
export type { CTABannerBlockProps } from '@/components/blocks/cta/cta-banner-block';

// Tech blocks
export { TechTabsBlock } from '@/components/blocks/tech/tech-tabs-block';
export type { TechTabsBlockProps } from '@/components/blocks/tech/tech-tabs-block';
