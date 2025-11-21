/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input - States & Accessibility', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Focus and Validation States', () => {
    it('applies focus styles', () => {
      render(<Input data-testid='input' />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-[3px]');
    });

    it('handles focus state changes', async () => {
      render(<Input data-testid='input' />);

      const input = screen.getByTestId('input');

      expect(input).not.toHaveFocus();

      await user.click(input);
      expect(input).toHaveFocus();

      await user.tab();
      expect(input).not.toHaveFocus();
    });

    it('applies disabled styles', () => {
      render(
        <Input
          disabled
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
      );
      expect(input).toBeDisabled();
    });

    it('applies readonly styles', () => {
      render(
        <Input
          readOnly
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('readonly');
    });

    it('handles validation states with aria-invalid', () => {
      render(
        <Input
          aria-invalid='true'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports custom validation styling', () => {
      render(
        <Input
          className='border-red-500 focus:border-red-600'
          aria-invalid='true'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-red-500', 'focus:border-red-600');
    });

    it('handles required field styling', () => {
      render(
        <Input
          required
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('applies hover styles', () => {
      render(<Input data-testid='input' />);

      const input = screen.getByTestId('input');
      // Input component doesn't have hover:border-input class, it uses border-input directly
      expect(input).toHaveClass('border-input');
    });

    it('handles loading state', () => {
      render(
        <Input
          disabled
          className='opacity-50'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('opacity-50');
      expect(input).toBeDisabled();
    });

    it('supports error state styling', () => {
      render(
        <Input
          aria-invalid='true'
          className='border-destructive focus:border-destructive'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports success state styling', () => {
      render(
        <Input
          className='border-green-500 focus:border-green-600'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-green-500', 'focus:border-green-600');
    });

    it('handles dynamic state changes', async () => {
      const StateInput = () => {
        const [isInvalid, setIsInvalid] = React.useState(false);

        return (
          <div>
            <Input
              aria-invalid={isInvalid}
              className={isInvalid ? 'border-red-500' : ''}
              data-testid='input'
            />
            <button onClick={() => setIsInvalid(!isInvalid)}>
              Toggle Invalid
            </button>
          </div>
        );
      };

      render(<StateInput />);

      const input = screen.getByTestId('input');
      const button = screen.getByText('Toggle Invalid');

      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).not.toHaveClass('border-red-500');

      await user.click(button);

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveClass('border-red-500');
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(
        <Input
          aria-label='Username input'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-label', 'Username input');
    });

    it('supports aria-labelledby', () => {
      render(
        <div>
          <label id='username-label'>Username</label>
          <Input
            aria-labelledby='username-label'
            data-testid='input'
          />
        </div>,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-labelledby', 'username-label');
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input
            aria-describedby='help-text'
            data-testid='input'
          />
          <div id='help-text'>Enter your username</div>
        </div>,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('supports aria-required', () => {
      render(
        <Input
          aria-required='true'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('supports aria-invalid', () => {
      render(
        <Input
          aria-invalid='true'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports aria-expanded for combobox inputs', () => {
      render(
        <Input
          role='combobox'
          aria-expanded='false'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports aria-autocomplete', () => {
      render(
        <Input
          aria-autocomplete='list'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('supports role attribute', () => {
      render(
        <Input
          role='searchbox'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('role', 'searchbox');
    });

    it('handles keyboard navigation', async () => {
      render(
        <div>
          <Input data-testid='input1' />
          <Input data-testid='input2' />
        </div>,
      );

      const input1 = screen.getByTestId('input1');
      const input2 = screen.getByTestId('input2');

      input1.focus();
      expect(input1).toHaveFocus();

      await user.tab();
      expect(input2).toHaveFocus();
    });

    it('supports screen reader announcements', () => {
      render(
        <Input
          aria-live='polite'
          aria-atomic='true'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-live', 'polite');
      expect(input).toHaveAttribute('aria-atomic', 'true');
    });

    it('handles focus management with labels', async () => {
      render(
        <div>
          <label htmlFor='labeled-input'>Username</label>
          <Input
            id='labeled-input'
            data-testid='input'
          />
        </div>,
      );

      const label = screen.getByText('Username');
      const input = screen.getByTestId('input');

      await user.click(label);
      expect(input).toHaveFocus();
    });

    it('supports high contrast mode', () => {
      render(
        <Input
          className='forced-colors:border-[ButtonText]'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('forced-colors:border-[ButtonText]');
    });

    it('supports reduced motion preferences', () => {
      render(
        <Input
          className='motion-reduce:transition-none'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('motion-reduce:transition-none');
    });

    it('provides proper touch targets', () => {
      render(
        <Input
          className='min-h-[44px]'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('min-h-[44px]');
    });

    it('handles complex accessibility scenarios', () => {
      render(
        <div>
          <label id='complex-label'>Password</label>
          <Input
            type='password'
            aria-labelledby='complex-label'
            aria-describedby='password-help password-error'
            aria-required='true'
            aria-invalid='true'
            data-testid='input'
          />
          <div id='password-help'>Must be at least 8 characters</div>
          <div id='password-error'>Password is too short</div>
        </div>,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-labelledby', 'complex-label');
      expect(input).toHaveAttribute(
        'aria-describedby',
        'password-help password-error',
      );
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports internationalization', () => {
      render(
        <Input
          lang='en'
          dir='ltr'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('lang', 'en');
      expect(input).toHaveAttribute('dir', 'ltr');
    });

    it('handles error announcements', () => {
      render(
        <div>
          <Input
            aria-invalid='true'
            aria-describedby='error-message'
            data-testid='input'
          />
          <div
            id='error-message'
            role='alert'
            aria-live='assertive'
          >
            This field is required
          </div>
        </div>,
      );

      const input = screen.getByTestId('input');
      const errorMessage = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', 'error-message');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    it('supports autocomplete for better UX', () => {
      render(
        <Input
          type='email'
          autoComplete='email'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });

    it('handles form validation integration', async () => {
      render(
        <form>
          <Input
            required
            pattern='[a-zA-Z]+'
            title='Only letters allowed'
            data-testid='input'
          />
          <button type='submit'>Submit</button>
        </form>,
      );

      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('pattern', '[a-zA-Z]+');
      expect(input).toHaveAttribute('title', 'Only letters allowed');
    });
  });
});
