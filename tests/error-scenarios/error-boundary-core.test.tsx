/**
 * ErrorBoundary Component Core Error Handling Tests
 *
 * 核心错误边界组件测试，专注于基本错误捕获和恢复功能
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockButtonProps } from '@/types/test-types';
import { ErrorBoundary } from '@/components/error-boundary';

// Mock next-intl
const mockUseTranslations = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    className,
    ...props
  }: MockButtonProps) => (
    <button
      data-testid='error-boundary-button'
      onClick={onClick}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: MockButtonProps) => (
    <div
      data-testid='error-boundary-card'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: MockButtonProps) => (
    <div
      data-testid='error-boundary-card-content'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: MockButtonProps) => (
    <div
      data-testid='error-boundary-card-header'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: MockButtonProps) => (
    <h3
      data-testid='error-boundary-card-title'
      className={className}
      {...props}
    >
      {children}
    </h3>
  ),
}));

// Test component that can throw errors
interface ThrowErrorComponentProps {
  shouldThrow?: boolean;
  errorMessage?: string;
}

function ThrowErrorComponent({
  shouldThrow = false,
  errorMessage = 'Test error',
}: ThrowErrorComponentProps) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid='working-component'>Component works!</div>;
}

describe('ErrorBoundary Core Error Handling Tests', () => {
  const user = userEvent.setup();
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default translations
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        error: 'Error',
        retry: 'Try Again',
        errorMessage: 'Something went wrong. Please try refreshing the page.',
      };

      return translations[key] || key; // key 来自测试数据，安全
    });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('Basic Error Catching', () => {
    it('should catch and display error when child component throws', async () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent
            shouldThrow={true}
            errorMessage='Component crashed'
          />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-card')).toBeInTheDocument();
      });

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Something went wrong. Please try refreshing the page.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary-button')).toBeInTheDocument();
    });

    it('should render children normally when no error occurs', async () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
      expect(screen.getByText('Component works!')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when retry button is clicked', async () => {
      let componentKey = 0;
      let shouldThrow = true;

      const TestWrapper = ({ key }: { key: number }) => (
        <ErrorBoundary key={key}>
          <ThrowErrorComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      const { rerender } = render(<TestWrapper key={componentKey} />);

      // Wait for error to be caught
      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-card')).toBeInTheDocument();
      });

      // Fix the component and retry
      shouldThrow = false;
      componentKey += 1;

      const retryButton = screen.getByTestId('error-boundary-button');
      await user.click(retryButton);

      // Rerender with fixed component
      rerender(<TestWrapper key={componentKey} />);

      await waitFor(() => {
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Fallback Support', () => {
    it('should render custom fallback when provided', async () => {
      const customFallback = (
        <div data-testid='custom-fallback'>Custom error message</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      });
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should use default fallback when custom fallback is not provided', async () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-card')).toBeInTheDocument();
      });
    });
  });

  describe('Basic Error Logging', () => {
    it('should log errors in development environment', async () => {
      // Create a fresh spy for this test
      const localConsoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowErrorComponent
            shouldThrow={true}
            errorMessage='Test error for logging'
          />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-card')).toBeInTheDocument();
      });

      // Check if error was logged
      expect(localConsoleSpy).toHaveBeenCalled();

      localConsoleSpy.mockRestore();
    });
  });

  describe('Basic Accessibility', () => {
    it('should provide proper accessibility attributes', async () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-card')).toBeInTheDocument();
      });

      const errorCard = screen.getByTestId('error-boundary-card');
      expect(errorCard).toHaveAttribute('role', 'alert');
    });

    it('should support keyboard navigation', async () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-button')).toBeInTheDocument();
      });

      const retryButton = screen.getByTestId('error-boundary-button');

      // Focus the button using keyboard
      retryButton.focus();
      expect(retryButton).toHaveFocus();

      // Should be able to activate with Enter key
      await user.keyboard('{Enter}');
      // Button click behavior would be tested in integration tests
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined children gracefully', async () => {
      render(
        <ErrorBoundary>
          {null}
          {undefined}
        </ErrorBoundary>,
      );

      // Should not crash and render nothing
      expect(
        screen.queryByTestId('error-boundary-card'),
      ).not.toBeInTheDocument();
    });

    it('should handle errors with missing error messages', async () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent
            shouldThrow={true}
            errorMessage=''
          />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary-card')).toBeInTheDocument();
      });
    });
  });
});
