/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
function setupSheetTest() {
  const user = userEvent.setup();
  return { user };
}

describe('Sheet - Basic Components', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    const setup = setupSheetTest();
    user = setup.user;
  });

  describe('Sheet', () => {
    it('renders sheet root component', () => {
      render(
        <Sheet>
          <SheetTrigger data-testid='sheet-trigger'>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open Sheet');
    });

    it('renders with default props', () => {
      render(
        <Sheet data-testid='sheet-root'>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toBeInTheDocument();
    });

    it('accepts custom props', () => {
      render(
        <Sheet modal={false}>
          <SheetTrigger data-testid='custom-trigger'>Custom</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('handles controlled state', () => {
      const TestComponent = ({ open }: { open: boolean }) => (
        <Sheet open={open}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent data-testid='sheet-content'>Content</SheetContent>
        </Sheet>
      );

      const { rerender } = render(<TestComponent open={false} />);
      expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();

      rerender(<TestComponent open={true} />);
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });
  });

  describe('SheetTrigger', () => {
    it('renders sheet trigger button', () => {
      render(
        <Sheet>
          <SheetTrigger data-testid='sheet-trigger'>Open Sheet</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveRole('button');
      expect(trigger).toHaveTextContent('Open Sheet');
    });

    it('applies custom className', () => {
      render(
        <Sheet>
          <SheetTrigger
            className='custom-trigger'
            data-testid='sheet-trigger'
          >
            Open
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('passes through additional props', () => {
      render(
        <Sheet>
          <SheetTrigger
            data-testid='sheet-trigger'
            aria-label='Open sheet dialog'
            disabled
          >
            Open
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Open sheet dialog');
      expect(trigger).toBeDisabled();
    });

    it('opens sheet when clicked', async () => {
      render(
        <Sheet>
          <SheetTrigger data-testid='sheet-trigger'>Open Sheet</SheetTrigger>
          <SheetContent data-testid='sheet-content'>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');

      // Initially content should not be visible
      expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();

      // Click trigger to open sheet
      await user.click(trigger);

      // Content should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });
    });

    it('supports keyboard activation', async () => {
      render(
        <Sheet>
          <SheetTrigger data-testid='sheet-trigger'>Open Sheet</SheetTrigger>
          <SheetContent data-testid='sheet-content'>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      trigger.focus();

      // Press Enter to open sheet
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });
    });

    it('supports space key activation', async () => {
      render(
        <Sheet>
          <SheetTrigger data-testid='sheet-trigger'>Open Sheet</SheetTrigger>
          <SheetContent data-testid='sheet-content'>Content</SheetContent>
        </Sheet>,
      );

      const trigger = screen.getByTestId('sheet-trigger');
      trigger.focus();

      // Press Space to open sheet
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });
    });
  });

  describe('SheetHeader', () => {
    it('renders sheet header', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader data-testid='sheet-header'>
              <SheetTitle>Header Title</SheetTitle>
              <SheetDescription>Header Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const header = screen.getByTestId('sheet-header');
        expect(header).toBeInTheDocument();
        expect(header).toHaveTextContent('Header Title');
        expect(header).toHaveTextContent('Header Description');
      });
    });

    it('applies default classes', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader data-testid='sheet-header'>
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const header = screen.getByTestId('sheet-header');
        expect(header).toHaveClass('flex', 'flex-col', 'gap-1.5', 'p-4');
      });
    });

    it('applies custom className', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader
              className='custom-header'
              data-testid='sheet-header'
            >
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const header = screen.getByTestId('sheet-header');
        expect(header).toHaveClass('custom-header');
      });
    });
  });

  describe('SheetFooter', () => {
    it('renders sheet footer', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetFooter data-testid='sheet-footer'>
              <button>Cancel</button>
              <button>Save</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const footer = screen.getByTestId('sheet-footer');
        expect(footer).toBeInTheDocument();
        expect(footer).toHaveTextContent('Cancel');
        expect(footer).toHaveTextContent('Save');
      });
    });

    it('applies default classes', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetFooter data-testid='sheet-footer'>
              <button>Action</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const footer = screen.getByTestId('sheet-footer');
        expect(footer).toHaveClass(
          'mt-auto',
          'flex',
          'flex-col',
          'gap-2',
          'p-4',
        );
      });
    });

    it('applies custom className', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetFooter
              className='custom-footer'
              data-testid='sheet-footer'
            >
              <button>Action</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const footer = screen.getByTestId('sheet-footer');
        expect(footer).toHaveClass('custom-footer');
      });
    });
  });
});
