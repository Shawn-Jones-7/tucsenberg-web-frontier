'use client';

import { PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import { cn } from '@/lib/utils';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'bg-secondary relative h-4 w-full overflow-hidden rounded-full',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className='bg-primary h-full w-full flex-1 transition-all'
      style={{ transform: `translateX(-${PERCENTAGE_FULL - (value || ZERO)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
