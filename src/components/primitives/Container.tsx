import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Container - Responsive content wrapper
 *
 * Provides consistent max-width and responsive horizontal padding:
 * - Mobile: 16px (px-4)
 * - Tablet: 24px (md:px-6)
 * - Desktop: 32px (lg:px-8)
 */
const containerVariants = cva('mx-auto px-4 md:px-6 lg:px-8', {
  variants: {
    size: {
      'sm': 'max-w-screen-sm',
      'md': 'max-w-screen-md',
      'lg': 'max-w-screen-lg',
      'xl': 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      'full': 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean;
}

function Container({
  className,
  size,
  asChild = false,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot='container'
      className={cn(containerVariants({ size, className }))}
      {...props}
    />
  );
}

export { Container, containerVariants };
export type { ContainerProps };
