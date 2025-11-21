/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../sheet';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  XIcon: ({ className, ...props }: React.ComponentProps<'svg'>) => (
    <svg
      data-testid='x-icon'
      className={className}
      {...props}
    >
      <path d='M18 6L6 18M6 6l12 12' />
    </svg>
  ),
}));

// Shared test setup function
function setupSheetContentTest() {
  const user = userEvent.setup();
  return { user };
}

describe('Sheet - Content & Interactions', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    const setup = setupSheetContentTest();
    user = setup.user;
  });

  describe('SheetContent', () => {
    it('renders sheet content with default right side', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
            </SheetHeader>
            <div>Sheet content goes here</div>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toBeInTheDocument();
        expect(content).toHaveTextContent('Sheet Title');
        expect(content).toHaveTextContent('Sheet content goes here');
      });
    });

    it('renders with different sides', async () => {
      const sides = ['top', 'right', 'bottom', 'left'] as const;

      for (const side of sides) {
        const { unmount } = render(
          <Sheet defaultOpen>
            <SheetContent
              side={side}
              data-testid={`sheet-content-${side}`}
            >
              <SheetTitle>Sheet {side}</SheetTitle>
            </SheetContent>
          </Sheet>,
        );

        await waitFor(() => {
          const content = screen.getByTestId(`sheet-content-${side}`);
          expect(content).toBeInTheDocument();
          expect(content).toHaveAttribute('data-side', side);
        });

        unmount();
      }
    });

    it('applies default classes', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetTitle>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass(
          'fixed',
          'z-50',
          'gap-4',
          'bg-background',
          'p-6',
          'shadow-lg',
        );
      });
    });

    it('applies custom className', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent
            className='custom-content'
            data-testid='sheet-content'
          >
            <SheetTitle>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass('custom-content');
      });
    });

    it('includes close button by default', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetTitle>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();

        const xIcon = screen.getByTestId('x-icon');
        expect(xIcon).toBeInTheDocument();
      });
    });

    it('closes when close button is clicked', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetTitle>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
      });
    });

    it('closes when Escape key is pressed', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetTitle>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('SheetClose', () => {
    it('renders sheet close button', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
            <SheetClose data-testid='custom-close'>Custom Close</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const closeButton = screen.getByTestId('custom-close');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveTextContent('Custom Close');
      });
    });

    it('closes sheet when clicked', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
            <SheetClose data-testid='custom-close'>Close Sheet</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('custom-close');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
      });
    });

    it('applies custom className', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetClose
              className='custom-close'
              data-testid='close-button'
            >
              Close
            </SheetClose>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const closeButton = screen.getByTestId('close-button');
        expect(closeButton).toHaveClass('custom-close');
      });
    });

    it('supports asChild prop', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetClose asChild>
              <button data-testid='custom-button'>Custom Button</button>
            </SheetClose>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const customButton = screen.getByTestId('custom-button');
        expect(customButton).toBeInTheDocument();
        expect(customButton).toHaveTextContent('Custom Button');
      });

      await user.click(screen.getByTestId('custom-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
      });
    });
  });
});
