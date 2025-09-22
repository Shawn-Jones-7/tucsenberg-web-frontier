/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';

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
function setupTextComponentsTest() {
  const user = userEvent.setup();
  return { user };
}

describe('Sheet - Text Components', () => {
  beforeEach(() => {
    setupTextComponentsTest();
  });

  describe('SheetTitle', () => {
    it('renders sheet title', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle data-testid='sheet-title'>Test Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('Test Title');
      });
    });

    it('applies default classes', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle data-testid='sheet-title'>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toHaveClass('font-semibold', 'text-foreground');
      });
    });

    it('applies custom className', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle
              className='custom-title'
              data-testid='sheet-title'
            >
              Title
            </SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toHaveClass('custom-title');
      });
    });

    it('supports different heading levels', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle
              asChild
              data-testid='sheet-title'
            >
              <h1>Main Title</h1>
            </SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title.tagName).toBe('H1');
        expect(title).toHaveTextContent('Main Title');
      });
    });

    it('handles long titles gracefully', async () => {
      const longTitle =
        'This is a very long title that should wrap properly and not break the layout of the sheet component';

      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle data-testid='sheet-title'>{longTitle}</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toHaveTextContent(longTitle);
      });
    });

    it('supports HTML content', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle data-testid='sheet-title'>
              <span>Formatted</span> <strong>Title</strong>
            </SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toHaveTextContent('Formatted Title');
        expect(title.querySelector('span')).toBeInTheDocument();
        expect(title.querySelector('strong')).toBeInTheDocument();
      });
    });
  });

  describe('SheetDescription', () => {
    it('renders sheet description', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription data-testid='sheet-description'>
              Test Description
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent('Test Description');
      });
    });

    it('applies default classes', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription data-testid='sheet-description'>
              Description
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveClass('text-sm', 'text-muted-foreground');
      });
    });

    it('applies custom className', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription
              className='custom-description'
              data-testid='sheet-description'
            >
              Description
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveClass('custom-description');
      });
    });

    it('handles long descriptions', async () => {
      const longDescription =
        'This is a very long description that provides detailed information about the sheet content and what the user can expect to find or do within this dialog. It should wrap properly and maintain good readability.';

      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription data-testid='sheet-description'>
              {longDescription}
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveTextContent(longDescription);
      });
    });

    it('supports HTML content', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription data-testid='sheet-description'>
              This description has <em>emphasized</em> and{' '}
              <strong>strong</strong> text.
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveTextContent(
          'This description has emphasized and strong text.',
        );
        expect(description.querySelector('em')).toBeInTheDocument();
        expect(description.querySelector('strong')).toBeInTheDocument();
      });
    });

    it('supports multiple paragraphs', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription data-testid='sheet-description'>
              <p>First paragraph of the description.</p>
              <p>Second paragraph with more details.</p>
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveTextContent(
          'First paragraph of the description.Second paragraph with more details.',
        );
        expect(description.querySelectorAll('p')).toHaveLength(2);
      });
    });

    it('works without title', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetDescription data-testid='sheet-description'>
              Standalone description without title
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
          'Standalone description without title',
        );
      });
    });
  });

  describe('Title and Description Together', () => {
    it('renders both title and description', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle data-testid='sheet-title'>Combined Title</SheetTitle>
            <SheetDescription data-testid='sheet-description'>
              Combined Description
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        const description = screen.getByTestId('sheet-description');

        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
        expect(title).toHaveTextContent('Combined Title');
        expect(description).toHaveTextContent('Combined Description');
      });
    });

    it('maintains proper semantic hierarchy', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle data-testid='sheet-title'>Main Title</SheetTitle>
            <SheetDescription data-testid='sheet-description'>
              Supporting description
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        const description = screen.getByTestId('sheet-description');

        // Title should come before description in DOM order
        expect(title.compareDocumentPosition(description)).toBe(
          Node.DOCUMENT_POSITION_FOLLOWING,
        );
      });
    });
  });
});
