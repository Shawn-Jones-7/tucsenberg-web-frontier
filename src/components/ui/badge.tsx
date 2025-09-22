import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
        outline: 'text-foreground hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  // 支持额外的HTML属性，即使它们不是div的标准属性
  disabled?: boolean;
  form?: string;
  name?: string;
  value?: string;
  autoComplete?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
