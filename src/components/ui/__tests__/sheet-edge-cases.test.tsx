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
  SheetDescription,
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
function setupEdgeCasesTest() {
  const user = userEvent.setup();
  return { user };
}

describe('Sheet - Edge Cases', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    const setup = setupEdgeCasesTest();
    user = setup.user;
  });

  it('handles sheet without header', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <div>Content without header</div>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content without header');
    });
  });

  it('handles sheet without footer', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <SheetHeader>
            <SheetTitle>Title Only</SheetTitle>
          </SheetHeader>
          <div>Content without footer</div>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Title Only');
      expect(content).toHaveTextContent('Content without footer');
    });
  });

  it('handles empty sheet content', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content' />
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('handles sheet with only title', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <SheetTitle>Minimal Sheet</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Minimal Sheet');
    });
  });

  it('handles sheet with only description', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <SheetDescription>Just a description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Just a description');
    });
  });

  it('handles rapid open/close operations', async () => {
    render(
      <Sheet>
        <SheetTrigger data-testid='sheet-trigger'>Open Sheet</SheetTrigger>
        <SheetContent data-testid='sheet-content'>
          <SheetTitle>Rapid Test</SheetTitle>
          <SheetClose data-testid='close-button'>Close</SheetClose>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByTestId('sheet-trigger');

    // Rapid open/close operations
    for (let i = 0; i < 3; i++) {
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('close-button');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
      });
    }
  });

  it('handles sheet with complex nested content', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <SheetHeader>
            <SheetTitle>Complex Content</SheetTitle>
            <SheetDescription>Sheet with nested elements</SheetDescription>
          </SheetHeader>

          <div className='nested-container'>
            <div className='level-1'>
              <div className='level-2'>
                <div className='level-3'>
                  <span data-testid='deeply-nested'>Deeply nested content</span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      const nestedContent = screen.getByTestId('deeply-nested');

      expect(content).toBeInTheDocument();
      expect(nestedContent).toBeInTheDocument();
      expect(nestedContent).toHaveTextContent('Deeply nested content');
    });
  });

  it('handles sheet with very long content', async () => {
    const longContent = Array.from(
      { length: 50 },
      (_, i) =>
        `Paragraph ${i + 1}: This is a very long paragraph with lots of text content that should test how the sheet handles scrolling and overflow.`,
    ).join(' ');

    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <SheetHeader>
            <SheetTitle>Long Content Test</SheetTitle>
          </SheetHeader>
          <div data-testid='long-content'>{longContent}</div>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      const longContentElement = screen.getByTestId('long-content');

      expect(content).toBeInTheDocument();
      expect(longContentElement).toBeInTheDocument();
      expect(longContentElement).toHaveTextContent(/Paragraph 1:/);
      expect(longContentElement).toHaveTextContent(/Paragraph 50:/);
    });
  });

  it('handles sheet with special characters and unicode', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent data-testid='sheet-content'>
          <SheetHeader>
            <SheetTitle>Special Characters: 🚀 ñáéíóú ©®™</SheetTitle>
            <SheetDescription>
              Unicode test: 中文 العربية русский 日本語 🎉🎊✨
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Special Characters: 🚀 ñáéíóú ©®™');
      expect(content).toHaveTextContent(
        'Unicode test: 中文 العربية русский 日本語 🎉🎊✨',
      );
    });
  });

  it('handles sheet with dynamic content updates', async () => {
    const DynamicSheet = () => {
      const [count, setCount] = React.useState(0);

      return (
        <Sheet defaultOpen>
          <SheetContent data-testid='sheet-content'>
            <SheetHeader>
              <SheetTitle>Dynamic Content</SheetTitle>
            </SheetHeader>
            <div data-testid='counter'>Count: {count}</div>
            <button
              data-testid='increment-button'
              onClick={() => setCount((c) => c + 1)}
            >
              Increment
            </button>
          </SheetContent>
        </Sheet>
      );
    };

    render(<DynamicSheet />);

    await waitFor(() => {
      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('Count: 0');
    });

    const incrementButton = screen.getByTestId('increment-button');
    await user.click(incrementButton);

    await waitFor(() => {
      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('Count: 1');
    });

    await user.click(incrementButton);
    await user.click(incrementButton);

    await waitFor(() => {
      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('Count: 3');
    });
  });
});
