/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label - Advanced Form Association Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Complex Form Integration Scenarios', () => {
    it('handles dynamic form generation with labels', async () => {
      const fields = [
        { id: 'field-1', label: 'Dynamic Field 1', type: 'text' },
        { id: 'field-2', label: 'Dynamic Field 2', type: 'email' },
        { id: 'field-3', label: 'Dynamic Field 3', type: 'password' },
      ];

      render(
        <form>
          {fields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              <input
                id={field.id}
                type={field.type}
              />
            </div>
          ))}
        </form>,
      );

      // Test all dynamic labels are properly associated
      for (const field of fields) {
        const label = screen.getByText(field.label);
        const input = screen.getByLabelText(field.label);

        expect(label).toHaveAttribute('for', field.id);
        expect(input).toHaveAttribute('id', field.id);

        // Test click behavior
        await user.click(label);
        expect(input).toHaveFocus();
      }
    });

    it('handles complex nested form structures', async () => {
      render(
        <form>
          <fieldset>
            <legend>Personal Information</legend>
            <div>
              <Label htmlFor='nested-name'>Full Name</Label>
              <input
                id='nested-name'
                type='text'
              />
            </div>
            <div>
              <Label htmlFor='nested-email'>Email Address</Label>
              <input
                id='nested-email'
                type='email'
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Preferences</legend>
            <div>
              <Label htmlFor='nested-newsletter'>Subscribe to Newsletter</Label>
              <input
                id='nested-newsletter'
                type='checkbox'
              />
            </div>
          </fieldset>
        </form>,
      );

      // Test nested form structure maintains proper associations
      const nameLabel = screen.getByText('Full Name');
      const emailLabel = screen.getByText('Email Address');
      const newsletterLabel = screen.getByText('Subscribe to Newsletter');

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const newsletterInput = screen.getByLabelText('Subscribe to Newsletter');

      // Test all associations work in nested structure
      await user.click(nameLabel);
      expect(nameInput).toHaveFocus();

      await user.click(emailLabel);
      expect(emailInput).toHaveFocus();

      await user.click(newsletterLabel);
      expect(newsletterInput).toBeChecked();
    });
  });

  describe('Select Element Association', () => {
    it('associates with select element', async () => {
      render(
        <div>
          <Label htmlFor='select-test'>Select Label</Label>
          <select id='select-test'>
            <option value='1'>Option 1</option>
            <option value='2'>Option 2</option>
          </select>
        </div>,
      );

      const label = screen.getByText('Select Label');
      const select = screen.getByRole('combobox');

      await user.click(label);
      expect(select).toHaveFocus();
    });

    it('associates with textarea element', async () => {
      render(
        <div>
          <Label htmlFor='textarea-input'>Textarea Label</Label>
          <textarea id='textarea-input' />
        </div>,
      );

      const label = screen.getByText('Textarea Label');
      const textarea = screen.getByRole('textbox');

      await user.click(label);
      expect(textarea).toHaveFocus();
    });

    it('works with nested input elements', async () => {
      render(
        <Label data-testid='nested-label'>
          Nested Input
          <input type='checkbox' />
        </Label>,
      );

      const label = screen.getByTestId('nested-label');
      const checkbox = screen.getByRole('checkbox');

      await user.click(label);
      expect(checkbox).toBeChecked();
    });

    it('supports form attribute', () => {
      render(
        <div>
          <form id='test-form'>
            <input
              id='form-input'
              type='text'
            />
          </form>
          <Label
            htmlFor='form-input'
            form='test-form'
          >
            Form Label
          </Label>
        </div>,
      );

      const label = screen.getByText('Form Label');
      expect(label).toHaveAttribute('form', 'test-form');
    });

    it('handles multiple labels for same input', async () => {
      render(
        <div>
          <Label htmlFor='multi-input'>First Label</Label>
          <Label htmlFor='multi-input'>Second Label</Label>
          <input
            id='multi-input'
            type='text'
          />
        </div>,
      );

      const firstLabel = screen.getByText('First Label');
      const secondLabel = screen.getByText('Second Label');
      const input = screen.getByRole('textbox');

      await user.click(firstLabel);
      expect(input).toHaveFocus();

      await user.click(secondLabel);
      expect(input).toHaveFocus();
    });

    it('works with custom input components', async () => {
      const CustomInput = React.forwardRef<HTMLInputElement, { id: string }>(
        ({ id }, ref) => (
          <input
            ref={ref}
            id={id}
            type='text'
          />
        ),
      );
      CustomInput.displayName = 'CustomInput';

      render(
        <div>
          <Label htmlFor='custom-input'>Custom Input Label</Label>
          <CustomInput id='custom-input' />
        </div>,
      );

      const label = screen.getByText('Custom Input Label');
      const input = screen.getByRole('textbox');

      await user.click(label);
      expect(input).toHaveFocus();
    });

    it('handles complex form scenarios', async () => {
      render(
        <form>
          <fieldset>
            <legend>User Information</legend>
            <div>
              <Label htmlFor='user-name'>Name</Label>
              <input
                id='user-name'
                type='text'
                required
              />
            </div>
            <div>
              <Label htmlFor='user-email'>Email</Label>
              <input
                id='user-email'
                type='email'
                required
              />
            </div>
          </fieldset>
        </form>,
      );

      const nameLabel = screen.getByText('Name');
      const emailLabel = screen.getByText('Email');
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      await user.click(nameLabel);
      expect(nameInput).toHaveFocus();

      await user.click(emailLabel);
      expect(emailInput).toHaveFocus();
    });

    it('works with disabled form elements', async () => {
      render(
        <div>
          <Label htmlFor='disabled-input'>Disabled Input</Label>
          <input
            id='disabled-input'
            type='text'
            disabled
          />
        </div>,
      );

      const label = screen.getByText('Disabled Input');
      const input = screen.getByRole('textbox');

      expect(input).toBeDisabled();

      // Clicking disabled input's label should not focus it
      await user.click(label);
      expect(input).not.toHaveFocus();
    });

    it('handles form validation states', () => {
      render(
        <div>
          <Label
            htmlFor='validation-input'
            aria-invalid='true'
          >
            Invalid Input
          </Label>
          <input
            id='validation-input'
            type='text'
            aria-invalid='true'
          />
        </div>,
      );

      const label = screen.getByText('Invalid Input');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports required field indicators', () => {
      render(
        <div>
          <Label htmlFor='required-input'>
            Required Field <span aria-label='required'>*</span>
          </Label>
          <input
            id='required-input'
            type='text'
            required
          />
        </div>,
      );

      const label = screen.getByText(/Required Field/);
      const requiredIndicator = screen.getByLabelText('required');

      expect(label).toContainElement(requiredIndicator);
    });

    it('works with input groups', async () => {
      render(
        <div
          role='group'
          aria-labelledby='group-label'
        >
          <Label id='group-label'>Contact Information</Label>
          <div>
            <Label htmlFor='phone'>Phone</Label>
            <input
              id='phone'
              type='tel'
            />
          </div>
          <div>
            <Label htmlFor='fax'>Fax</Label>
            <input
              id='fax'
              type='tel'
            />
          </div>
        </div>,
      );

      const groupLabel = screen.getByText('Contact Information');
      const phoneLabel = screen.getByText('Phone');
      const phoneInput = screen.getByLabelText('Phone');

      expect(groupLabel).toHaveAttribute('id', 'group-label');

      await user.click(phoneLabel);
      expect(phoneInput).toHaveFocus();
    });

    it('handles dynamic form associations', async () => {
      const DynamicForm = ({ inputId }: { inputId: string }) => (
        <div>
          <Label htmlFor={inputId}>Dynamic Label</Label>
          <input
            id={inputId}
            type='text'
          />
        </div>
      );

      const { rerender } = render(<DynamicForm inputId='input-1' />);

      let label = screen.getByText('Dynamic Label');
      let input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'input-1');
      expect(input).toHaveAttribute('id', 'input-1');

      rerender(<DynamicForm inputId='input-2' />);

      label = screen.getByText('Dynamic Label');
      input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'input-2');
      expect(input).toHaveAttribute('id', 'input-2');
    });
  });
});
