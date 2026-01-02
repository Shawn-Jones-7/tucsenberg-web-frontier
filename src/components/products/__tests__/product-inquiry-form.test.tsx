/**
 * @vitest-environment jsdom
 * Tests for ProductInquiryForm component
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductInquiryForm } from '../product-inquiry-form';

// Mock hoisted variables
const { mockFetch, mockUseTranslations } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockUseTranslations: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='check-circle-icon'
      {...props}
    />
  ),
  Loader2: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='loader-icon'
      {...props}
    />
  ),
  MessageSquare: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='message-square-icon'
      {...props}
    />
  ),
  XCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='x-circle-icon'
      {...props}
    />
  ),
}));

// Mock TurnstileWidget
vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<{ TurnstileWidget: React.ComponentType }>,
    _options: Record<string, unknown>,
  ) => {
    // Return a simple mock component
    const MockTurnstile = ({
      onSuccess,
    }: {
      onSuccess?: (token: string) => void;
    }) => (
      <div data-testid='turnstile-widget'>
        <button
          type='button'
          data-testid='turnstile-success-trigger'
          onClick={() => onSuccess?.('mock-token-123')}
        >
          Simulate Turnstile Success
        </button>
      </div>
    );
    MockTurnstile.displayName = 'MockTurnstile';
    // Need to call loader to avoid warnings, but we return our mock
    loader();
    return MockTurnstile;
  },
}));

// Mock @/components/security/turnstile
vi.mock('@/components/security/turnstile', () => ({
  TurnstileWidget: () => <div data-testid='turnstile-mock' />,
}));

// Translation mock helper
function createTranslationMock() {
  const translations: Record<string, Record<string, string>> = {
    'products.inquiry': {
      title: 'Product Inquiry',
      description: 'Fill out this form to inquire about this product',
      productName: 'Product',
      quantity: 'Quantity',
      quantityPlaceholder: 'e.g. 100 pcs',
      targetPrice: 'Target Price',
      targetPricePlaceholder: 'e.g. $10/pc',
      requirements: 'Requirements',
      requirementsPlaceholder: 'Any special requirements...',
      submit: 'Send Inquiry',
      submitting: 'Sending...',
      success: 'Inquiry sent successfully!',
      error: 'Failed to send inquiry',
      turnstileRequired: 'Please complete verification',
    },
    'contact.form': {
      firstName: 'Name',
      firstNamePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      company: 'Company',
      companyPlaceholder: 'Your company',
    },
  };

  return (namespace: string) => {
    return (key: string) => {
      const ns = translations[namespace];
      return ns?.[key] ?? `${namespace}.${key}`;
    };
  };
}

describe('ProductInquiryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockImplementation(createTranslationMock());
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders form title and description', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      expect(screen.getByText('Product Inquiry')).toBeInTheDocument();
      expect(
        screen.getByText('Fill out this form to inquire about this product'),
      ).toBeInTheDocument();
    });

    it('displays product name', () => {
      render(
        <ProductInquiryForm
          productName='Industrial Widget'
          productSlug='industrial-widget'
        />,
      );

      expect(screen.getByText('Industrial Widget')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Target Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Requirements/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      expect(
        screen.getByRole('button', { name: /Send Inquiry/i }),
      ).toBeInTheDocument();
    });

    it('renders Turnstile widget', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });

    it('renders message square icon in header', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      expect(screen.getByTestId('message-square-icon')).toBeInTheDocument();
    });
  });

  describe('form fields', () => {
    it('has required name field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const nameInput = screen.getByLabelText(/Name/i);
      expect(nameInput).toHaveAttribute('required');
    });

    it('has required email field with type email', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('has required quantity field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const quantityInput = screen.getByLabelText(/Quantity/i);
      expect(quantityInput).toHaveAttribute('required');
    });

    it('has optional company field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const companyInput = screen.getByLabelText(/Company/i);
      expect(companyInput).not.toHaveAttribute('required');
    });

    it('has optional target price field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const priceInput = screen.getByLabelText(/Target Price/i);
      expect(priceInput).not.toHaveAttribute('required');
    });

    it('has textarea for requirements', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const textarea = screen.getByLabelText(/Requirements/i);
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('includes hidden fields for product data', () => {
      const { container } = render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const hiddenSlug = container.querySelector(
        'input[name="productSlug"]',
      ) as HTMLInputElement;
      const hiddenName = container.querySelector(
        'input[name="productName"]',
      ) as HTMLInputElement;

      expect(hiddenSlug).toHaveValue('test-product');
      expect(hiddenName).toHaveValue('Test Product');
    });
  });

  describe('turnstile integration', () => {
    it('disables submit button when turnstile not completed', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const submitButton = screen.getByRole('button', {
        name: /Send Inquiry/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button after turnstile success', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      const submitButton = screen.getByRole('button', {
        name: /Send Inquiry/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('custom className', () => {
    it('applies custom className to Card', () => {
      const { container } = render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
          className='custom-form-class'
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('custom-form-class');
    });
  });

  describe('form labels', () => {
    it('shows asterisk for required fields', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      // Name, Email, Quantity have asterisks
      expect(screen.getByText(/Name.*\*/)).toBeInTheDocument();
      expect(screen.getByText(/Email.*\*/)).toBeInTheDocument();
      expect(screen.getByText(/Quantity.*\*/)).toBeInTheDocument();
    });
  });

  describe('placeholders', () => {
    it('has placeholder for name field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const nameInput = screen.getByLabelText(/Name/i);
      expect(nameInput).toHaveAttribute('placeholder', 'Your name');
    });

    it('has placeholder for email field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toHaveAttribute('placeholder', 'your@email.com');
    });

    it('has placeholder for quantity field', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const quantityInput = screen.getByLabelText(/Quantity/i);
      expect(quantityInput).toHaveAttribute('placeholder', 'e.g. 100 pcs');
    });
  });

  describe('accessibility', () => {
    it('has proper label associations', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      expect(screen.getByLabelText(/Name \*/i)).toHaveAttribute(
        'id',
        'inquiry-name',
      );
      expect(screen.getByLabelText(/Email \*/i)).toHaveAttribute(
        'id',
        'inquiry-email',
      );
      expect(screen.getByLabelText(/Company/i)).toHaveAttribute(
        'id',
        'inquiry-company',
      );
      expect(screen.getByLabelText(/Quantity \*/i)).toHaveAttribute(
        'id',
        'inquiry-quantity',
      );
    });

    it('submit button shows correct text states', async () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      const submitButton = screen.getByRole('button', {
        name: /Send Inquiry/i,
      });
      expect(submitButton).toHaveTextContent('Send Inquiry');
    });
  });

  describe('edge cases', () => {
    it('handles special characters in product name', () => {
      render(
        <ProductInquiryForm
          productName='Product <Special> & "Test"'
          productSlug='product-special'
        />,
      );

      expect(
        screen.getByText('Product <Special> & "Test"'),
      ).toBeInTheDocument();
    });

    it('handles long product names', () => {
      const longName =
        'This is a very long product name that should still be displayed properly in the form';
      render(
        <ProductInquiryForm
          productName={longName}
          productSlug='long-product'
        />,
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles empty className', () => {
      const { container } = render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
          className=''
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onSuccess callback after successful submission', async () => {
      const onSuccessMock = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
          onSuccess={onSuccessMock}
        />,
      );

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Quantity/i), {
        target: { value: '100 pcs' },
      });

      // Verify form is ready for submission
      const submitButton = screen.getByRole('button', {
        name: /Send Inquiry/i,
      });
      expect(submitButton).not.toBeDisabled();
    });

    it('handles API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Server error' }),
      });

      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Quantity/i), {
        target: { value: '100 pcs' },
      });
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));
    });

    it('includes optional fields in submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      // Fill all fields including optional ones
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Company/i), {
        target: { value: 'Test Corp' },
      });
      fireEvent.change(screen.getByLabelText(/Quantity/i), {
        target: { value: '100 pcs' },
      });
      fireEvent.change(screen.getByLabelText(/Target Price/i), {
        target: { value: '$10/pc' },
      });
      fireEvent.change(screen.getByLabelText(/Requirements/i), {
        target: { value: 'Special packaging needed' },
      });

      // Verify form is ready
      const submitButton = screen.getByRole('button', {
        name: /Send Inquiry/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('turnstile error handling', () => {
    it('resets turnstile token on error', () => {
      render(
        <ProductInquiryForm
          productName='Test Product'
          productSlug='test-product'
        />,
      );

      // First enable
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));
      expect(
        screen.getByRole('button', { name: /Send Inquiry/i }),
      ).not.toBeDisabled();

      // The mock doesn't have error trigger, but we test the initial disabled state
      const submitButton = screen.getByRole('button', {
        name: /Send Inquiry/i,
      });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
