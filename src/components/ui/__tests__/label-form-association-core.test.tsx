/**
 * @vitest-environment jsdom
 */

import { Label } from '@/components/ui/label';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Label - Core Form Association Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Form Association', () => {
    it('associates with input using htmlFor', () => {
      render(
        <div>
          <Label htmlFor='test-input'>Test Label</Label>
          <input
            id='test-input'
            type='text'
          />
        </div>,
      );

      const label = screen.getByText('Test Label');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('associates with textarea using htmlFor', () => {
      render(
        <div>
          <Label htmlFor='test-textarea'>Message</Label>
          <textarea id='test-textarea' />
        </div>,
      );

      const label = screen.getByText('Message');
      const textarea = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'test-textarea');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
    });

    it('associates with select using htmlFor', () => {
      render(
        <div>
          <Label htmlFor='test-select'>Choose Option</Label>
          <select id='test-select'>
            <option value='1'>Option 1</option>
            <option value='2'>Option 2</option>
          </select>
        </div>,
      );

      const label = screen.getByText('Choose Option');
      const select = screen.getByRole('combobox');

      expect(label).toHaveAttribute('for', 'test-select');
      expect(select).toHaveAttribute('id', 'test-select');
    });

    it('associates with checkbox using htmlFor', () => {
      render(
        <div>
          <Label htmlFor='test-checkbox'>Accept Terms</Label>
          <input
            id='test-checkbox'
            type='checkbox'
          />
        </div>,
      );

      const label = screen.getByText('Accept Terms');
      const checkbox = screen.getByRole('checkbox');

      expect(label).toHaveAttribute('for', 'test-checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    });

    it('associates with radio button using htmlFor', () => {
      render(
        <div>
          <Label htmlFor='test-radio'>Option A</Label>
          <input
            id='test-radio'
            type='radio'
            name='options'
            value='a'
          />
        </div>,
      );

      const label = screen.getByText('Option A');
      const radio = screen.getByRole('radio');

      expect(label).toHaveAttribute('for', 'test-radio');
      expect(radio).toHaveAttribute('id', 'test-radio');
    });
  });

  describe('Click Behavior', () => {
    it('focuses input when label is clicked', async () => {
      render(
        <div>
          <Label htmlFor='clickable-input'>Clickable Label</Label>
          <input
            id='clickable-input'
            type='text'
          />
        </div>,
      );

      const label = screen.getByText('Clickable Label');
      const input = screen.getByRole('textbox');

      await user.click(label);
      expect(input).toHaveFocus();
    });

    it('focuses textarea when label is clicked', async () => {
      render(
        <div>
          <Label htmlFor='clickable-textarea'>Clickable Textarea</Label>
          <textarea id='clickable-textarea' />
        </div>,
      );

      const label = screen.getByText('Clickable Textarea');
      const textarea = screen.getByRole('textbox');

      await user.click(label);
      expect(textarea).toHaveFocus();
    });

    it('toggles checkbox when label is clicked', async () => {
      render(
        <div>
          <Label htmlFor='clickable-checkbox'>Toggle Me</Label>
          <input
            id='clickable-checkbox'
            type='checkbox'
          />
        </div>,
      );

      const label = screen.getByText('Toggle Me');
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();

      await user.click(label);
      expect(checkbox).toBeChecked();

      await user.click(label);
      expect(checkbox).not.toBeChecked();
    });

    it('selects radio button when label is clicked', async () => {
      render(
        <div>
          <Label htmlFor='radio-1'>Option 1</Label>
          <input
            id='radio-1'
            type='radio'
            name='test'
            value='1'
          />
          <Label htmlFor='radio-2'>Option 2</Label>
          <input
            id='radio-2'
            type='radio'
            name='test'
            value='2'
          />
        </div>,
      );

      const label1 = screen.getByText('Option 1');
      const label2 = screen.getByText('Option 2');
      const radio1 = screen.getByDisplayValue('1');
      const radio2 = screen.getByDisplayValue('2');

      await user.click(label1);
      expect(radio1).toBeChecked();
      expect(radio2).not.toBeChecked();

      await user.click(label2);
      expect(radio1).not.toBeChecked();
      expect(radio2).toBeChecked();
    });
  });

  describe('Accessibility Features', () => {
    it('provides accessible name for form controls', () => {
      render(
        <div>
          <Label htmlFor='accessible-input'>Accessible Input</Label>
          <input
            id='accessible-input'
            type='text'
          />
        </div>,
      );

      const input = screen.getByLabelText('Accessible Input');
      expect(input).toBeInTheDocument();
    });

    it('supports screen reader navigation', () => {
      render(
        <div>
          <Label htmlFor='sr-input'>Screen Reader Label</Label>
          <input
            id='sr-input'
            type='text'
            aria-describedby='sr-help'
          />
          <div id='sr-help'>Additional help text</div>
        </div>,
      );

      const input = screen.getByLabelText('Screen Reader Label');
      expect(input).toHaveAttribute('aria-describedby', 'sr-help');
    });

    it('maintains focus management', async () => {
      render(
        <div>
          <Label htmlFor='focus-input'>Focus Test</Label>
          <input
            id='focus-input'
            type='text'
          />
          <button type='button'>Next Field</button>
        </div>,
      );

      const label = screen.getByText('Focus Test');
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      // Click label should focus input
      await user.click(label);
      expect(input).toHaveFocus();

      // Tab should move to next focusable element
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Form Validation Integration', () => {
    it('works with required fields', () => {
      render(
        <div>
          <Label htmlFor='required-input'>Required Field *</Label>
          <input
            id='required-input'
            type='text'
            required
          />
        </div>,
      );

      const input = screen.getByLabelText('Required Field *');
      expect(input).toBeRequired();
    });

    it('works with validation states', () => {
      render(
        <div>
          <Label htmlFor='invalid-input'>Invalid Field</Label>
          <input
            id='invalid-input'
            type='text'
            aria-invalid='true'
          />
        </div>,
      );

      const input = screen.getByLabelText('Invalid Field');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports error message association', () => {
      render(
        <div>
          <Label htmlFor='error-input'>Field with Error</Label>
          <input
            id='error-input'
            type='text'
            aria-describedby='error-msg'
          />
          <div
            id='error-msg'
            role='alert'
          >
            This field has an error
          </div>
        </div>,
      );

      const input = screen.getByLabelText('Field with Error');
      const errorMsg = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', 'error-msg');
      expect(errorMsg).toHaveTextContent('This field has an error');
    });
  });

  describe('Multiple Form Controls', () => {
    it('handles multiple labels correctly', () => {
      render(
        <form>
          <div>
            <Label htmlFor='first-name'>First Name</Label>
            <input
              id='first-name'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='last-name'>Last Name</Label>
            <input
              id='last-name'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <input
              id='email'
              type='email'
            />
          </div>
        </form>,
      );

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('maintains unique associations', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='input-1'>Input 1</Label>
            <input
              id='input-1'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='input-2'>Input 2</Label>
            <input
              id='input-2'
              type='text'
            />
          </div>
        </form>,
      );

      const label1 = screen.getByText('Input 1');
      const label2 = screen.getByText('Input 2');
      const input1 = screen.getByLabelText('Input 1');
      const input2 = screen.getByLabelText('Input 2');

      await user.click(label1);
      expect(input1).toHaveFocus();

      await user.click(label2);
      expect(input2).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing htmlFor gracefully', () => {
      render(<Label>Label without htmlFor</Label>);

      const label = screen.getByText('Label without htmlFor');
      expect(label).toBeInTheDocument();
      expect(label).not.toHaveAttribute('for');
    });

    it('handles non-existent target ID', () => {
      render(<Label htmlFor='non-existent'>Orphaned Label</Label>);

      const label = screen.getByText('Orphaned Label');
      expect(label).toHaveAttribute('for', 'non-existent');
    });

    it('handles empty htmlFor', () => {
      render(<Label htmlFor=''>Empty htmlFor</Label>);

      const label = screen.getByText('Empty htmlFor');
      expect(label).toHaveAttribute('for', '');
    });
  });
});
