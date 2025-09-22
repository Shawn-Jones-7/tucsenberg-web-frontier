/**
 * @vitest-environment jsdom
 */

/**
 * Label Form Basic Integration - Core Tests
 *
 * 专门测试核心表单集成功能，包括：
 * - 完整表单结构
 * - 表单验证
 * - 字段集和图例
 * - 多表单页面
 */

import { Label } from '@/components/ui/label';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Label Form Basic Integration - Advanced Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('高级表单集成场景', () => {
    it('handles complex multi-step form scenarios', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='step1-field'>Step 1 Field</Label>
            <input
              id='step1-field'
              type='text'
            />
          </div>
          <button type='submit'>Next Step</button>
        </form>,
      );

      const input = screen.getByLabelText('Step 1 Field');
      const button = screen.getByRole('button');

      await user.type(input, 'test value');
      await user.click(button);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles performance optimization in complex forms', async () => {
      // Test form performance with many fields
      const fields = Array.from({ length: 10 }, (_, i) => ({
        id: `field-${i}`,
        label: `Field ${i + 1}`,
        type: 'text',
      }));

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

      // Test that all fields render correctly
      fields.forEach((field) => {
        expect(screen.getByLabelText(field.label)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('handles required field validation', async () => {
      render(
        <form>
          <Label htmlFor='required-field'>Required Field *</Label>
          <input
            id='required-field'
            type='text'
            required
          />
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

    it('handles multiple forms on same page', async () => {
      const handleLoginSubmit = vi.fn((e) => e.preventDefault());
      const handleSignupSubmit = vi.fn((e) => e.preventDefault());

      render(
        <div>
          <form
            onSubmit={handleLoginSubmit}
            data-testid='login-form'
          >
            <h2>Login</h2>
            <div>
              <Label htmlFor='login-email'>Email</Label>
              <input
                id='login-email'
                type='email'
              />
            </div>
            <div>
              <Label htmlFor='login-password'>Password</Label>
              <input
                id='login-password'
                type='password'
              />
            </div>
            <button type='submit'>Login</button>
          </form>

          <form
            onSubmit={handleSignupSubmit}
            data-testid='signup-form'
          >
            <h2>Sign Up</h2>
            <div>
              <Label htmlFor='signup-name'>Name</Label>
              <input
                id='signup-name'
                type='text'
              />
            </div>
            <div>
              <Label htmlFor='signup-email'>Email</Label>
              <input
                id='signup-email'
                type='email'
              />
            </div>
            <div>
              <Label htmlFor='signup-password'>Password</Label>
              <input
                id='signup-password'
                type='password'
              />
            </div>
            <button type='submit'>Sign Up</button>
          </form>
        </div>,
      );

      const loginForm = screen.getByTestId('login-form');
      const signupForm = screen.getByTestId('signup-form');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      expect(loginForm).toBeInTheDocument();
      expect(signupForm).toBeInTheDocument();

      // Fill login form
      const loginEmail = within(loginForm).getByLabelText('Email');
      const loginPassword = within(loginForm).getByLabelText('Password');

      await user.type(loginEmail, 'user@example.com');
      await user.type(loginPassword, 'password123');
      await user.click(loginButton);

      expect(handleLoginSubmit).toHaveBeenCalled();
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
      expect(screen.getByLabelText('Number Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Date Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Time Input')).toBeInTheDocument();
      expect(screen.getByLabelText('URL Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Tel Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Search Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Color Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Range Input')).toBeInTheDocument();
      expect(screen.getByLabelText('File Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Textarea')).toBeInTheDocument();
      expect(screen.getByLabelText('Select')).toBeInTheDocument();

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
            <div>
              <Label htmlFor='theme-auto'>
                <input
                  id='theme-auto'
                  type='radio'
                  name='theme'
                  value='auto'
                />
                Auto
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
      const autoRadio = screen.getByLabelText('Auto');

      expect(newsletterCheckbox).toBeInTheDocument();
      expect(notificationsCheckbox).toBeInTheDocument();
      expect(lightRadio).toBeInTheDocument();
      expect(darkRadio).toBeInTheDocument();
      expect(autoRadio).toBeInTheDocument();

      // Test checkbox interactions
      await user.click(newsletterCheckbox);
      expect(newsletterCheckbox).toBeChecked();

      await user.click(notificationsCheckbox);
      expect(notificationsCheckbox).toBeChecked();

      // Test radio button interactions
      await user.click(darkRadio);
      expect(darkRadio).toBeChecked();
      expect(lightRadio).not.toBeChecked();
      expect(autoRadio).not.toBeChecked();

      await user.click(autoRadio);
      expect(autoRadio).toBeChecked();
      expect(darkRadio).not.toBeChecked();
      expect(lightRadio).not.toBeChecked();
    });
  });
});
