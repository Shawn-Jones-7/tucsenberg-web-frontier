/**
 * @vitest-environment jsdom
 */

/**
 * Label Form Integration Tests - Index
 *
 * Basic integration tests for Label component with forms.
 * For comprehensive testing, see:
 * - label-form-basic-integration.test.tsx - Basic form integration tests
 * - label-form-advanced-integration.test.tsx - Advanced form integration tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Form Integration Tests - Index', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Form Integration', () => {
    it('works in complete form structure', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='name-input'>Name</Label>
            <input
              id='name-input'
              type='text'
              required
            />
          </div>
          <div>
            <Label htmlFor='email-input'>Email</Label>
            <input
              id='email-input'
              type='email'
              required
            />
          </div>
          <div>
            <Label htmlFor='message-input'>Message</Label>
            <textarea
              id='message-input'
              required
            />
          </div>
          <button type='submit'>Submit</button>
        </form>,
      );

      const nameLabel = screen.getByText('Name');
      const emailLabel = screen.getByText('Email');
      const messageLabel = screen.getByText('Message');

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message');

      // Test label associations
      await user.click(nameLabel);
      expect(nameInput).toHaveFocus();

      await user.click(emailLabel);
      expect(emailInput).toHaveFocus();

      await user.click(messageLabel);
      expect(messageInput).toHaveFocus();

      // Test form submission
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Hello world');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles form validation with labels', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='required-input'>Required Field *</Label>
            <input
              id='required-input'
              type='text'
              required
            />
          </div>
          <div>
            <Label htmlFor='optional-input'>Optional Field</Label>
            <input
              id='optional-input'
              type='text'
            />
          </div>
          <button type='submit'>Submit</button>
        </form>,
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Try to submit without filling required field
      await user.click(submitButton);

      // Browser validation should prevent submission
      const requiredInput = screen.getByLabelText('Required Field *');
      expect(requiredInput).toBeInvalid();
    });

    it('works with fieldset and legend', () => {
      render(
        <form>
          <fieldset>
            <legend>Personal Information</legend>
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
          </fieldset>
          <fieldset>
            <legend>Contact Information</legend>
            <div>
              <Label htmlFor='phone'>Phone</Label>
              <input
                id='phone'
                type='tel'
              />
            </div>
            <div>
              <Label htmlFor='address'>Address</Label>
              <textarea id='address' />
            </div>
          </fieldset>
        </form>,
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
    });

    it('supports different input types', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='text-input'>Text Input</Label>
            <input
              id='text-input'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='email-input'>Email Input</Label>
            <input
              id='email-input'
              type='email'
            />
          </div>
          <div>
            <Label htmlFor='password-input'>Password Input</Label>
            <input
              id='password-input'
              type='password'
            />
          </div>
          <div>
            <Label htmlFor='textarea-input'>Textarea</Label>
            <textarea id='textarea-input' />
          </div>
          <div>
            <Label htmlFor='select-input'>Select</Label>
            <select id='select-input'>
              <option value='option1'>Option 1</option>
              <option value='option2'>Option 2</option>
            </select>
          </div>
        </form>,
      );

      // Test that all inputs are properly associated with their labels
      expect(screen.getByLabelText('Text Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Password Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Textarea')).toBeInTheDocument();
      expect(screen.getByLabelText('Select')).toBeInTheDocument();

      // Test clicking labels focuses inputs
      const textLabel = screen.getByText('Text Input');
      const textInput = screen.getByLabelText('Text Input');

      await user.click(textLabel);
      expect(textInput).toHaveFocus();

      const emailLabel = screen.getByText('Email Input');
      const emailInput = screen.getByLabelText('Email Input');

      await user.click(emailLabel);
      expect(emailInput).toHaveFocus();
    });

    it('handles checkbox and radio inputs', async () => {
      render(
        <form>
          <fieldset>
            <legend>Preferences</legend>
            <div>
              <input
                id='newsletter'
                type='checkbox'
              />
              <Label htmlFor='newsletter'>Subscribe to newsletter</Label>
            </div>
            <div>
              <input
                id='terms'
                type='checkbox'
                required
              />
              <Label htmlFor='terms'>Accept terms and conditions</Label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact Method</legend>
            <div>
              <input
                id='contact-email'
                type='radio'
                name='contact'
                value='email'
              />
              <Label htmlFor='contact-email'>Email</Label>
            </div>
            <div>
              <input
                id='contact-phone'
                type='radio'
                name='contact'
                value='phone'
              />
              <Label htmlFor='contact-phone'>Phone</Label>
            </div>
          </fieldset>
        </form>,
      );

      // Test checkbox labels
      const newsletterLabel = screen.getByText('Subscribe to newsletter');
      const newsletterCheckbox = screen.getByLabelText(
        'Subscribe to newsletter',
      );

      await user.click(newsletterLabel);
      expect(newsletterCheckbox).toBeChecked();

      const termsLabel = screen.getByText('Accept terms and conditions');
      const termsCheckbox = screen.getByLabelText(
        'Accept terms and conditions',
      );

      await user.click(termsLabel);
      expect(termsCheckbox).toBeChecked();

      // Test radio labels
      const emailLabel = screen.getByText('Email');
      const emailRadio = screen.getByLabelText('Email');

      await user.click(emailLabel);
      expect(emailRadio).toBeChecked();

      const phoneLabel = screen.getByText('Phone');
      const phoneRadio = screen.getByLabelText('Phone');

      await user.click(phoneLabel);
      expect(phoneRadio).toBeChecked();
      expect(emailRadio).not.toBeChecked(); // Radio buttons are mutually exclusive
    });

    it('works with controlled components', async () => {
      const ControlledForm = () => {
        const [value, setValue] = React.useState('');

        return (
          <form>
            <Label htmlFor='controlled-input'>Controlled Input</Label>
            <input
              id='controlled-input'
              type='text'
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div data-testid='value-display'>{value}</div>
          </form>
        );
      };

      render(<ControlledForm />);

      const input = screen.getByLabelText('Controlled Input');
      const display = screen.getByTestId('value-display');

      await user.type(input, 'test value');

      expect(input).toHaveValue('test value');
      expect(display).toHaveTextContent('test value');
    });

    it('handles form submission with preventDefault', async () => {
      const handleSubmit = vi.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        return formData;
      });

      render(
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='submit-test'>Test Field</Label>
            <input
              id='submit-test'
              name='testField'
              type='text'
            />
          </div>
          <button type='submit'>Submit</button>
        </form>,
      );

      const input = screen.getByLabelText('Test Field');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(input, 'test data');
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
      expect(input).toHaveValue('test data');
    });
  });
});
