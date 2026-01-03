/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InquiryDrawer } from '../inquiry-drawer';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
    />
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (_key: string) => 'Inquiry drawer description',
}));

vi.mock('@/lib/image', () => ({
  getBlurPlaceholder: () => ({}),
}));

vi.mock('@/components/products/product-inquiry-form', () => ({
  ProductInquiryForm: ({ productName }: { productName: string }) => (
    <div data-testid='product-inquiry-form'>{productName}</div>
  ),
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sheet'>{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sheet-content'>{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sheet-header'>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sheet-title'>{children}</div>
  ),
  SheetDescription: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
  }) => (
    <div
      data-testid='sheet-description'
      id={id}
    >
      {children}
    </div>
  ),
}));

describe('InquiryDrawer', () => {
  it('does not mount the inquiry form when closed', () => {
    render(
      <InquiryDrawer
        open={false}
        onOpenChange={vi.fn()}
        productSlug='test-product'
        productName='Test Product'
      />,
    );

    expect(screen.queryByTestId('product-inquiry-form')).toBeNull();
  });

  it('mounts the inquiry form when open', () => {
    render(
      <InquiryDrawer
        open
        onOpenChange={vi.fn()}
        productSlug='test-product'
        productName='Test Product'
      />,
    );

    expect(screen.getByTestId('product-inquiry-form')).toHaveTextContent(
      'Test Product',
    );
    expect(screen.getByTestId('sheet-description')).toHaveTextContent(
      'Inquiry drawer description',
    );
  });
});
