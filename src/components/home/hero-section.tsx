// Re-export shim for backward compatibility
// New code should import from '@/components/blocks/hero/hero-split-block'

export {
  HeroSplitBlock as HeroSection,
  HeroSplitBlockStatic as HeroSectionStatic,
} from '@/components/blocks/hero/hero-split-block';

export type {
  HeroSplitBlockMessages as HeroSectionMessages,
  HeroSplitBlockProps as HeroSectionProps,
} from '@/components/blocks/hero/hero-split-block';
