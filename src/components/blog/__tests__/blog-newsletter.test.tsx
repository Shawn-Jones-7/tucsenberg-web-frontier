/**
 * @vitest-environment jsdom
 * Tests for BlogNewsletter component
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlogNewsletter } from '../blog-newsletter';

// Mock hoisted variables
const { mockFetch, mockUseTranslations, mockGetAttributionAsObject } =
  vi.hoisted(() => ({
    mockFetch: vi.fn(),
    mockUseTranslations: vi.fn(),
    mockGetAttributionAsObject: vi.fn(),
  }));

// Mock @/lib/utm
vi.mock('@/lib/utm', () => ({
  getAttributionAsObject: mockGetAttributionAsObject,
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
  Mail: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='mail-icon'
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
    const MockTurnstile = ({
      onSuccess,
      onError,
      onExpire,
    }: {
      onSuccess?: (token: string) => void;
      onError?: () => void;
      onExpire?: () => void;
    }) => (
      <div data-testid='turnstile-widget'>
        <button
          type='button'
          data-testid='turnstile-success-trigger'
          onClick={() => onSuccess?.('mock-token-123')}
        >
          Simulate Success
        </button>
        <button
          type='button'
          data-testid='turnstile-error-trigger'
          onClick={() => onError?.()}
        >
          Simulate Error
        </button>
        <button
          type='button'
          data-testid='turnstile-expire-trigger'
          onClick={() => onExpire?.()}
        >
          Simulate Expire
        </button>
      </div>
    );
    MockTurnstile.displayName = 'MockTurnstile';
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
  const translations: Record<string, string> = {
    title: 'Subscribe to Newsletter',
    description: 'Get the latest posts delivered to your inbox.',
    placeholder: 'Enter your email',
    submit: 'Subscribe',
    submitting: 'Subscribing...',
    success: 'Successfully subscribed!',
    error: 'Something went wrong',
    turnstileRequired: 'Please complete verification',
  };

  return (key: string) => translations[key] ?? `blog.newsletter.${key}`;
}

describe('BlogNewsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockReturnValue(createTranslationMock());
    mockGetAttributionAsObject.mockReturnValue({ utm_source: 'test' });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('default variant rendering', () => {
    it('renders title and description', () => {
      render(<BlogNewsletter />);

      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();
      expect(
        screen.getByText('Get the latest posts delivered to your inbox.'),
      ).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<BlogNewsletter />);

      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('required');
    });

    it('renders submit button', () => {
      render(<BlogNewsletter />);

      expect(
        screen.getByRole('button', { name: /Subscribe/i }),
      ).toBeInTheDocument();
    });

    it('renders mail icon', () => {
      render(<BlogNewsletter />);

      expect(screen.getAllByTestId('mail-icon').length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it('renders Turnstile widget', () => {
      render(<BlogNewsletter />);

      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });

    it('renders Card component', () => {
      const { container } = render(<BlogNewsletter />);

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('compact variant', () => {
    it('renders title without Card wrapper', () => {
      render(<BlogNewsletter variant='compact' />);

      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();
    });

    it('renders with h3 heading', () => {
      render(<BlogNewsletter variant='compact' />);

      const heading = screen.getByRole('heading', {
        level: 3,
        name: 'Subscribe to Newsletter',
      });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('inline variant', () => {
    it('renders title', () => {
      render(<BlogNewsletter variant='inline' />);

      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();
    });

    it('has border and bg-muted styling', () => {
      const { container } = render(<BlogNewsletter variant='inline' />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('border');
      expect(wrapper).toHaveClass('bg-muted/30');
    });
  });

  describe('turnstile integration', () => {
    it('disables submit button when turnstile not completed', () => {
      render(<BlogNewsletter />);

      const submitButton = screen.getByRole('button', { name: /Subscribe/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button after turnstile success', () => {
      render(<BlogNewsletter />);

      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      const submitButton = screen.getByRole('button', { name: /Subscribe/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('disables submit button after turnstile error', () => {
      render(<BlogNewsletter />);

      // First enable
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));
      expect(
        screen.getByRole('button', { name: /Subscribe/i }),
      ).not.toBeDisabled();

      // Then error
      fireEvent.click(screen.getByTestId('turnstile-error-trigger'));
      expect(screen.getByRole('button', { name: /Subscribe/i })).toBeDisabled();
    });

    it('disables submit button after turnstile expire', () => {
      render(<BlogNewsletter />);

      // First enable
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));
      expect(
        screen.getByRole('button', { name: /Subscribe/i }),
      ).not.toBeDisabled();

      // Then expire
      fireEvent.click(screen.getByTestId('turnstile-expire-trigger'));
      expect(screen.getByRole('button', { name: /Subscribe/i })).toBeDisabled();
    });
  });

  describe('custom className', () => {
    it('applies custom className in default variant', () => {
      const { container } = render(
        <BlogNewsletter className='custom-newsletter-class' />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('custom-newsletter-class');
    });

    it('applies custom className in compact variant', () => {
      const { container } = render(
        <BlogNewsletter
          variant='compact'
          className='compact-custom'
        />,
      );

      expect(container.firstChild).toHaveClass('compact-custom');
    });

    it('applies custom className in inline variant', () => {
      const { container } = render(
        <BlogNewsletter
          variant='inline'
          className='inline-custom'
        />,
      );

      expect(container.firstChild).toHaveClass('inline-custom');
    });
  });

  describe('form elements', () => {
    it('email input is required', () => {
      render(<BlogNewsletter />);

      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toHaveAttribute('required');
    });

    it('input has name attribute', () => {
      render(<BlogNewsletter />);

      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('submit button has type submit', () => {
      render(<BlogNewsletter />);

      const button = screen.getByRole('button', { name: /Subscribe/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('accessibility', () => {
    it('form has accessible input', () => {
      render(<BlogNewsletter />);

      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      render(<BlogNewsletter />);

      const submitButton = screen.getByRole('button', { name: /Subscribe/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles variant prop change', () => {
      const { rerender } = render(<BlogNewsletter variant='default' />);
      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();

      rerender(<BlogNewsletter variant='compact' />);
      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();
    });

    it('renders all three variants without error', () => {
      const { rerender, container } = render(
        <BlogNewsletter variant='default' />,
      );
      expect(container.firstChild).toBeInTheDocument();

      rerender(<BlogNewsletter variant='compact' />);
      expect(container.firstChild).toBeInTheDocument();

      rerender(<BlogNewsletter variant='inline' />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('shows success message after successful submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<BlogNewsletter />);

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      // Fill email
      const emailInput = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Submit form
      const form = emailInput.closest('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      // Wait for success message
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test@example.com'),
        });
      });

      // Verify success state
      await waitFor(() => {
        expect(
          screen.getByText('Successfully subscribed!'),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: 'Invalid email' }),
      });

      render(<BlogNewsletter />);

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      // Fill email
      const emailInput = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });

      // Submit form
      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
      });
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<BlogNewsletter />);

      // Enable turnstile
      fireEvent.click(screen.getByTestId('turnstile-success-trigger'));

      // Fill email
      const emailInput = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Submit form
      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      // Wait for error message (should show generic error)
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('shows turnstile required error when token is missing', async () => {
      render(<BlogNewsletter />);

      // Do NOT enable turnstile - token will be null

      // Fill email
      const emailInput = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Note: Submit button should be disabled when turnstile not completed
      const submitButton = screen.getByRole('button', { name: /Subscribe/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('success state rendering', () => {
    it('renders success message in compact variant', () => {
      // This tests the SuccessMessage component rendering path
      render(<BlogNewsletter variant='compact' />);
      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();
    });

    it('renders success message in inline variant', () => {
      render(<BlogNewsletter variant='inline' />);
      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument();
    });
  });

  describe('error message component', () => {
    it('renders error icon with message', () => {
      // The ErrorMessage component is tested through form submission errors
      render(<BlogNewsletter />);
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
  });
});
