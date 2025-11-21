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
function setupIntegrationTest() {
  const user = userEvent.setup();
  return { user };
}

describe('Sheet - Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    const setup = setupIntegrationTest();
    user = setup.user;
  });

  it('works with complete sheet structure', async () => {
    render(
      <Sheet>
        <SheetTrigger data-testid='sheet-trigger'>
          Open Complete Sheet
        </SheetTrigger>
        <SheetContent data-testid='sheet-content'>
          <SheetHeader>
            <SheetTitle>Complete Sheet Example</SheetTitle>
            <SheetDescription>
              This sheet demonstrates all components working together
            </SheetDescription>
          </SheetHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label
                htmlFor='name'
                className='text-right'
              >
                Name
              </label>
              <input
                id='name'
                data-testid='name-input'
                className='col-span-3'
                placeholder='Enter your name'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label
                htmlFor='email'
                className='text-right'
              >
                Email
              </label>
              <input
                id='email'
                data-testid='email-input'
                type='email'
                className='col-span-3'
                placeholder='Enter your email'
              />
            </div>
          </div>

          <SheetFooter>
            <SheetClose data-testid='cancel-button'>Cancel</SheetClose>
            <button data-testid='save-button'>Save changes</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    // Open sheet
    const trigger = screen.getByTestId('sheet-trigger');
    await user.click(trigger);

    await waitFor(() => {
      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();

      // Check all components are rendered
      expect(screen.getByText('Complete Sheet Example')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This sheet demonstrates all components working together',
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    // Test form interaction
    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');

    // Close with cancel button
    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('sheet-content')).not.toBeInTheDocument();
    });
  });

  it('handles multiple sheets', async () => {
    render(
      <div>
        <Sheet>
          <SheetTrigger data-testid='sheet-1-trigger'>
            Open Sheet 1
          </SheetTrigger>
          <SheetContent data-testid='sheet-1-content'>
            <SheetTitle>Sheet 1</SheetTitle>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger data-testid='sheet-2-trigger'>
            Open Sheet 2
          </SheetTrigger>
          <SheetContent data-testid='sheet-2-content'>
            <SheetTitle>Sheet 2</SheetTitle>
          </SheetContent>
        </Sheet>
      </div>,
    );

    // Open first sheet
    const trigger1 = screen.getByTestId('sheet-1-trigger');
    await user.click(trigger1);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('sheet-2-content')).not.toBeInTheDocument();
    });

    // Close first sheet
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByTestId('sheet-1-content')).not.toBeInTheDocument();
    });

    // Open second sheet
    const trigger2 = screen.getByTestId('sheet-2-trigger');
    await user.click(trigger2);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-2-content')).toBeInTheDocument();
      expect(screen.queryByTestId('sheet-1-content')).not.toBeInTheDocument();
    });
  });

  it('handles nested interactive elements', async () => {
    render(
      <Sheet>
        <SheetTrigger data-testid='sheet-trigger'>Open Form Sheet</SheetTrigger>
        <SheetContent data-testid='sheet-content'>
          <SheetHeader>
            <SheetTitle>Form Sheet</SheetTitle>
          </SheetHeader>

          <form data-testid='sheet-form'>
            <div className='space-y-4'>
              <input
                data-testid='input-1'
                placeholder='Input 1'
              />
              <select data-testid='select-1'>
                <option value='option1'>Option 1</option>
                <option value='option2'>Option 2</option>
              </select>
              <textarea
                data-testid='textarea-1'
                placeholder='Textarea'
              />
              <button
                type='button'
                data-testid='form-button'
              >
                Form Button
              </button>
            </div>
          </form>

          <SheetFooter>
            <SheetClose data-testid='close-button'>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByTestId('sheet-trigger');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });

    // Test all form elements are interactive
    const input1 = screen.getByTestId('input-1');
    const select1 = screen.getByTestId('select-1');
    const textarea1 = screen.getByTestId('textarea-1');
    const formButton = screen.getByTestId('form-button');

    await user.type(input1, 'test input');
    expect(input1).toHaveValue('test input');

    await user.selectOptions(select1, 'option2');
    expect(select1).toHaveValue('option2');

    await user.type(textarea1, 'test textarea');
    expect(textarea1).toHaveValue('test textarea');

    await user.click(formButton);
    // Form button should be clickable without closing the sheet
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
  });
});
