import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Section - Page section wrapper
 *
 * Provides consistent vertical spacing and background variants.
 * Use with Container for full layout control.
 */
const sectionVariants = cva('scroll-mt-20', {
  variants: {
    spacing: {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-20',
    },
    background: {
      default: '',
      muted: 'bg-muted/50',
      gradient: 'bg-gradient-to-br from-background via-background to-muted/20',
    },
  },
  defaultVariants: {
    background: 'default',
  },
});

interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

function Section({ className, spacing, background, ...props }: SectionProps) {
  return (
    <section
      data-slot='section'
      className={cn(sectionVariants({ spacing, background, className }))}
      {...props}
    />
  );
}

export { Section, sectionVariants };
export type { SectionProps };
