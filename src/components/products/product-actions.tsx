'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InquiryDrawer } from '@/components/products/inquiry-drawer';
import { Button } from '@/components/ui/button';

export interface ProductActionsProps {
  /** Product slug for API submission */
  productSlug: string;
  /** Product name to display */
  productName: string;
  /** Product thumbnail image URL */
  productImage?: string;
  /** Product SKU/model number */
  productSku?: string;
  /** PDF download URL */
  pdfHref?: string;
  /** Label for Request Quote button */
  requestQuoteLabel: string;
  /** Label for Download PDF button */
  downloadPdfLabel?: string;
  /** Custom class name */
  className?: string;
}

/**
 * Main CTA buttons group
 */
function ActionButtons({
  onRequestQuote,
  pdfHref,
  requestQuoteLabel,
  downloadPdfLabel,
  size = 'lg',
  fullWidth = false,
}: {
  onRequestQuote: () => void;
  pdfHref: string | undefined;
  requestQuoteLabel: string;
  downloadPdfLabel: string | undefined;
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
}) {
  return (
    <div className={cn('flex gap-3', fullWidth && 'flex-1')}>
      <Button
        size={size}
        onClick={onRequestQuote}
        className={cn(fullWidth && 'flex-1')}
      >
        <MessageSquare className='mr-2 h-4 w-4' />
        {requestQuoteLabel}
      </Button>

      {pdfHref !== undefined && downloadPdfLabel !== undefined && (
        <Button
          size={size}
          variant='outline'
          asChild
          className={cn(fullWidth && 'flex-1')}
        >
          <Link
            href={pdfHref}
            target='_blank'
            rel='noreferrer'
          >
            <Download className='mr-2 h-4 w-4' />
            {downloadPdfLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}

/**
 * Sticky bottom bar that appears when main CTA scrolls out of view
 */
function StickyBar({
  visible,
  productName,
  onRequestQuote,
  pdfHref,
  requestQuoteLabel,
  downloadPdfLabel,
}: {
  visible: boolean;
  productName: string;
  onRequestQuote: () => void;
  pdfHref: string | undefined;
  requestQuoteLabel: string;
  downloadPdfLabel: string | undefined;
}) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition-transform duration-300 supports-[backdrop-filter]:bg-background/80',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className='container mx-auto flex items-center justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{productName}</p>
        </div>
        <ActionButtons
          onRequestQuote={onRequestQuote}
          pdfHref={pdfHref}
          requestQuoteLabel={requestQuoteLabel}
          downloadPdfLabel={downloadPdfLabel}
          size='default'
        />
      </div>
    </div>
  );
}

/**
 * Product Actions Component
 *
 * CTA buttons for product pages with sticky bottom bar behavior.
 * When the main CTA scrolls out of view, a sticky bar appears at the bottom.
 */
export function ProductActions({
  productSlug,
  productName,
  productImage,
  productSku,
  pdfHref,
  requestQuoteLabel,
  downloadPdfLabel,
  className,
}: ProductActionsProps) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleRequestQuote = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  // Intersection Observer to detect when main CTA is out of view
  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state, react-hooks/set-state-in-effect -- hydration-safe mount flag to avoid SSR useId() mismatches in Radix-based drawer
    setMounted(true);
    const ctaElement = ctaRef.current;
    if (ctaElement === null) {
      return undefined;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry !== undefined) {
        // Show sticky bar when main CTA is not visible
        setShowStickyBar(!entry.isIntersecting);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0,
      rootMargin: '-64px 0px 0px 0px', // Account for header height
    });

    // Observe is a valid pattern for IntersectionObserver - not initializing from props
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    observer.observe(ctaElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Main CTA Buttons */}
      <div
        ref={ctaRef}
        className={cn('flex flex-col gap-3 sm:flex-row', className)}
      >
        <ActionButtons
          onRequestQuote={handleRequestQuote}
          pdfHref={pdfHref}
          requestQuoteLabel={requestQuoteLabel}
          downloadPdfLabel={downloadPdfLabel}
          size='lg'
        />
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBar
        visible={showStickyBar}
        productName={productName}
        onRequestQuote={handleRequestQuote}
        pdfHref={pdfHref}
        requestQuoteLabel={requestQuoteLabel}
        downloadPdfLabel={downloadPdfLabel}
      />

      {/* Inquiry Drawer */}
      {mounted ? (
        <InquiryDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          productSlug={productSlug}
          productName={productName}
          {...(productImage !== undefined && { productImage })}
          {...(productSku !== undefined && { productSku })}
        />
      ) : null}
    </>
  );
}
