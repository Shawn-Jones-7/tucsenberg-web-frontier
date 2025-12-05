'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ProductInquiryForm } from '@/components/products/product-inquiry-form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export interface InquiryDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Product slug for API submission */
  productSlug: string;
  /** Product name to display */
  productName: string;
  /** Product thumbnail image URL */
  productImage?: string;
  /** Product SKU/model number */
  productSku?: string;
  /** Custom class name */
  className?: string;
}

/**
 * Product header section in the drawer
 */
function DrawerProductHeader({
  productName,
  productImage,
  productSku,
}: {
  productName: string;
  productImage: string | undefined;
  productSku: string | undefined;
}) {
  return (
    <div className='flex items-start gap-4'>
      {productImage && (
        <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted'>
          <Image
            src={productImage}
            alt={productName}
            fill
            className='object-cover'
            sizes='64px'
          />
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <SheetTitle className='truncate text-base'>{productName}</SheetTitle>
        {productSku && (
          <p className='mt-1 text-xs text-muted-foreground'>
            SKU: {productSku}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Inquiry Drawer Component
 *
 * A right-side drawer that contains the product inquiry form.
 * Shows product context at the top with a scrollable form body.
 */
export function InquiryDrawer({
  open,
  onOpenChange,
  productSlug,
  productName,
  productImage,
  productSku,
  className,
}: InquiryDrawerProps) {
  const t = useTranslations('products.inquiry');

  function handleSuccess() {
    // Keep drawer open to show success message
    // User can close manually
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side='right'
        className={cn('flex w-full flex-col sm:max-w-md', className)}
        aria-describedby='inquiry-drawer-description'
      >
        <SheetHeader className='border-b pb-4'>
          <DrawerProductHeader
            productName={productName}
            productImage={productImage}
            productSku={productSku}
          />
          <SheetDescription
            id='inquiry-drawer-description'
            className='sr-only'
          >
            {t('description')}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable form container */}
        <div className='flex-1 overflow-y-auto py-4'>
          <ProductInquiryForm
            productName={productName}
            productSlug={productSlug}
            onSuccess={handleSuccess}
            className='border-0 shadow-none'
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
