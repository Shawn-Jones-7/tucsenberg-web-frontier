'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot='accordion'
      className={cn(
        'flex flex-col divide-y divide-border rounded-lg border bg-card text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot='accordion-item'
    className={cn('border-b last:border-b-0', className)}
    {...props}
  />
));

AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className='flex'>
    <AccordionPrimitive.Trigger
      ref={ref}
      data-slot='accordion-trigger'
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&[data-state=open]]:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));

AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot='accordion-content'
    className={cn(
      'overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className,
    )}
    {...props}
  >
    <div className='pb-4 pt-0'>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
