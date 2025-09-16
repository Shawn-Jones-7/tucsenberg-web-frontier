import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders input with default props', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('renders input with placeholder', () => {
      render(<Input placeholder='Enter text here' />);

      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('applies default input styles', () => {
      render(<Input data-testid='styled-input' />);

      const input = screen.getByTestId('styled-input');
      expect(input).toHaveClass(
        'flex',
        'h-9',
        'w-full',
        'min-w-0',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-1',
        'text-base',
        'shadow-xs',
      );
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      // HTML input elements don't have type="text" attribute when it's the default
      expect(input.getAttribute('type')).toBe(null);
    });

    it('renders email input', () => {
      render(<Input type='email' />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(
        <Input
          type='password'
          data-testid='password-input'
        />,
      );

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input', () => {
      render(<Input type='number' />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders search input', () => {
      render(<Input type='search' />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('renders tel input', () => {
      render(<Input type='tel' />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      render(<Input type='url' />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders file input', () => {
      render(
        <Input
          type='file'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Input
          className='custom-input'
          data-testid='custom'
        />,
      );

      const input = screen.getByTestId('custom');
      expect(input).toHaveClass('custom-input');
    });

    it('passes through HTML input props', () => {
      render(
        <Input
          id='test-input'
          name='testName'
          value='test value'
          maxLength={50}
          required
          data-testid='props-input'
          readOnly
        />,
      );

      const input = screen.getByTestId('props-input');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testName');
      expect(input).toHaveValue('test value');
      expect(input).toHaveAttribute('maxlength', '50');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('readonly');
    });

    it('handles disabled state', () => {
      render(
        <Input
          disabled
          data-testid='disabled-input'
        />,
      );

      const input = screen.getByTestId('disabled-input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass(
        'disabled:pointer-events-none',
        'disabled:opacity-50',
      );
    });

    it('handles readonly state', () => {
      render(
        <Input
          readOnly
          value='readonly value'
          data-testid='readonly-input'
        />,
      );

      const input = screen.getByTestId('readonly-input');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('readonly value');
    });
  });

  describe('Event Handling', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('handles onFocus events', () => {
      const handleFocus = vi.fn();

      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', () => {
      const handleBlur = vi.fn();

      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles onKeyDown events', () => {
      const handleKeyDown = vi.fn();

      render(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('does not trigger events when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleFocus = vi.fn();

      render(
        <Input
          disabled
          onChange={handleChange}
          onFocus={handleFocus}
        />,
      );

      const input = screen.getByRole('textbox');

      // Try to interact with disabled input
      await user.click(input);
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
      expect(handleFocus).not.toHaveBeenCalled();
    });
  });

  describe('Focus and Validation States', () => {
    it('applies focus styles', () => {
      render(<Input data-testid='focus-input' />);

      const input = screen.getByTestId('focus-input');
      expect(input).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]',
      );
    });

    it('handles aria-invalid state', () => {
      render(
        <Input
          aria-invalid='true'
          data-testid='invalid-input'
        />,
      );

      const input = screen.getByTestId('invalid-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveClass(
        'aria-invalid:ring-destructive/20',
        'aria-invalid:border-destructive',
      );
    });

    it('handles valid state', () => {
      render(
        <Input
          aria-invalid='false'
          data-testid='valid-input'
        />,
      );

      const input = screen.getByTestId('valid-input');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label='Search input' />);

      const input = screen.getByLabelText('Search input');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby='help-text' />
          <div id='help-text'>Help text</div>
        </div>,
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('supports aria-required', () => {
      render(<Input aria-required='true' />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('works with labels', () => {
      render(
        <div>
          <label htmlFor='labeled-input'>Input Label</label>
          <Input id='labeled-input' />
        </div>,
      );

      const input = screen.getByLabelText('Input Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'labeled-input');
    });
  });

  describe('File Input Specific', () => {
    it('applies file input styles', () => {
      render(
        <Input
          type='file'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass(
        'file:text-foreground',
        'file:inline-flex',
        'file:h-7',
        'file:border-0',
        'file:bg-transparent',
        'file:text-sm',
        'file:font-medium',
      );
    });

    it('handles file selection', () => {
      const handleChange = vi.fn();

      render(
        <Input
          type='file'
          onChange={handleChange}
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive text sizing', () => {
      render(<Input data-testid='responsive-input' />);

      const input = screen.getByTestId('responsive-input');
      expect(input).toHaveClass('text-base', 'md:text-sm');
    });

    it('maintains consistent height across screen sizes', () => {
      render(<Input data-testid='height-input' />);

      const input = screen.getByTestId('height-input');
      expect(input).toHaveClass('h-9');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(
        <Input
          value=''
          data-testid='empty-input'
        />,
      );

      const input = screen.getByTestId('empty-input');
      expect(input).toHaveValue('');
    });

    it('handles undefined type gracefully', () => {
      render(
        <Input
          type={undefined}
          data-testid='undefined-type'
        />,
      );

      const input = screen.getByTestId('undefined-type');
      // When type is undefined, HTML input defaults to text but doesn't show the attribute
      expect(input.getAttribute('type')).toBe(null);
    });

    it('handles special characters in value', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(
        <Input
          value={specialValue}
          data-testid='special-chars'
        />,
      );

      const input = screen.getByTestId('special-chars');
      expect(input).toHaveValue(specialValue);
    });

    it('handles very long values', () => {
      const longValue = 'a'.repeat(1000);
      render(
        <Input
          value={longValue}
          data-testid='long-value'
        />,
      );

      const input = screen.getByTestId('long-value');
      expect(input).toHaveValue(longValue);
    });
  });
});
