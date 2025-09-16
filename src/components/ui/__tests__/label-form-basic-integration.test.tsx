/**
 * @vitest-environment jsdom
 */

/**
 * Label Form Basic Integration - Main Tests
 *
 * 主要表单集成测试，包括：
 * - 核心表单集成验证
 * - 基本表单测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - label-form-basic-integration-core.test.tsx - 核心表单集成测试
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Form Basic Integration - Main Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心表单集成验证', () => {
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

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(messageInput).toBeInTheDocument();

      // Fill out the form
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Hello world');

      // Submit the form
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles form validation with required fields', async () => {
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
            <Label htmlFor='number-input'>Number Input</Label>
            <input
              id='number-input'
              type='number'
            />
          </div>
          <div>
            <Label htmlFor='date-input'>Date Input</Label>
            <input
              id='date-input'
              type='date'
            />
          </div>
          <div>
            <Label htmlFor='time-input'>Time Input</Label>
            <input
              id='time-input'
              type='time'
            />
          </div>
          <div>
            <Label htmlFor='url-input'>URL Input</Label>
            <input
              id='url-input'
              type='url'
            />
          </div>
          <div>
            <Label htmlFor='tel-input'>Tel Input</Label>
            <input
              id='tel-input'
              type='tel'
            />
          </div>
          <div>
            <Label htmlFor='search-input'>Search Input</Label>
            <input
              id='search-input'
              type='search'
            />
          </div>
          <div>
            <Label htmlFor='color-input'>Color Input</Label>
            <input
              id='color-input'
              type='color'
            />
          </div>
          <div>
            <Label htmlFor='range-input'>Range Input</Label>
            <input
              id='range-input'
              type='range'
            />
          </div>
          <div>
            <Label htmlFor='file-input'>File Input</Label>
            <input
              id='file-input'
              type='file'
            />
          </div>
        </form>,
      );

      // Test that all inputs are properly associated with their labels
      expect(screen.getByLabelText('Text Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Password Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Number Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Date Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Time Input')).toBeInTheDocument();
      expect(screen.getByLabelText('URL Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Tel Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Search Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Color Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Range Input')).toBeInTheDocument();
      expect(screen.getByLabelText('File Input')).toBeInTheDocument();

      // Test clicking on a label focuses the input
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
              <Label htmlFor='newsletter-checkbox'>
                <input
                  id='newsletter-checkbox'
                  type='checkbox'
                />
                Subscribe to newsletter
              </Label>
            </div>
            <div>
              <Label htmlFor='notifications-checkbox'>
                <input
                  id='notifications-checkbox'
                  type='checkbox'
                />
                Enable notifications
              </Label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Theme</legend>
            <div>
              <Label htmlFor='theme-light'>
                <input
                  id='theme-light'
                  type='radio'
                  name='theme'
                  value='light'
                />
                Light
              </Label>
            </div>
            <div>
              <Label htmlFor='theme-dark'>
                <input
                  id='theme-dark'
                  type='radio'
                  name='theme'
                  value='dark'
                />
                Dark
              </Label>
            </div>
          </fieldset>
        </form>,
      );

      const newsletterCheckbox = screen.getByLabelText(
        'Subscribe to newsletter',
      );
      const notificationsCheckbox = screen.getByLabelText(
        'Enable notifications',
      );
      const lightRadio = screen.getByLabelText('Light');
      const darkRadio = screen.getByLabelText('Dark');

      expect(newsletterCheckbox).toBeInTheDocument();
      expect(notificationsCheckbox).toBeInTheDocument();
      expect(lightRadio).toBeInTheDocument();
      expect(darkRadio).toBeInTheDocument();

      // Test checkbox interactions
      await user.click(newsletterCheckbox);
      expect(newsletterCheckbox).toBeChecked();

      await user.click(notificationsCheckbox);
      expect(notificationsCheckbox).toBeChecked();

      // Test radio button interactions
      await user.click(darkRadio);
      expect(darkRadio).toBeChecked();
      expect(lightRadio).not.toBeChecked();
    });
  });

  describe('错误处理验证', () => {
    it('handles missing htmlFor gracefully', () => {
      expect(() => {
        render(<Label>Label without htmlFor</Label>);
      }).not.toThrow();
    });

    it('handles empty htmlFor gracefully', () => {
      expect(() => {
        render(<Label htmlFor=''>Label with empty htmlFor</Label>);
      }).not.toThrow();
    });

    it('handles missing input gracefully', () => {
      expect(() => {
        render(
          <Label htmlFor='non-existent-input'>
            Label without matching input
          </Label>,
        );
      }).not.toThrow();
    });
  });
});
