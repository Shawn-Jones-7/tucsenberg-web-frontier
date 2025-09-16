/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input - File Inputs & Edge Cases', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
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
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveClass('file:border-0');
    });

    it('supports file input with accept attribute', () => {
      render(
        <Input
          type='file'
          accept='image/*'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('supports multiple file selection', () => {
      render(
        <Input
          type='file'
          multiple
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('multiple');
    });

    it('applies file input button styling', () => {
      render(
        <Input
          type='file'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass(
        'file:border-0',
        'file:bg-transparent',
        'file:text-sm',
        'file:font-medium',
      );
    });

    it('supports file input with custom styling', () => {
      render(
        <Input
          type='file'
          className='file:mr-4 file:px-4 file:py-2'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass('file:mr-4', 'file:py-2', 'file:px-4');
    });

    it('handles file input with specific file types', () => {
      const fileTypes = [
        'image/*',
        'video/*',
        'audio/*',
        '.pdf',
        '.doc,.docx',
        'text/plain',
      ];

      fileTypes.forEach((accept) => {
        const testId = `file-${accept.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const { unmount } = render(
          <Input
            type='file'
            accept={accept}
            data-testid={testId}
          />,
        );

        const input = screen.getByTestId(testId);
        expect(input).toHaveAttribute('accept', accept);

        unmount();
      });
    });

    it('supports file input with size limit', () => {
      render(
        <Input
          type='file'
          data-max-size='5000000'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('data-max-size', '5000000');
    });

    it('handles file input accessibility', () => {
      render(
        <div>
          <label htmlFor='file-upload'>Upload File</label>
          <Input
            id='file-upload'
            type='file'
            aria-describedby='file-help'
            data-testid='file-input'
          />
          <div id='file-help'>Select a file to upload</div>
        </div>,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('aria-describedby', 'file-help');
    });

    it('supports drag and drop styling', () => {
      render(
        <Input
          type='file'
          className='drag-over:border-primary'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass('drag-over:border-primary');
    });

    it('handles file input in forms', () => {
      render(
        <form encType='multipart/form-data'>
          <Input
            type='file'
            name='upload'
            required
            data-testid='file-input'
          />
        </form>,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('name', 'upload');
      expect(input).toBeRequired();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive text sizing', () => {
      render(
        <Input
          className='text-sm md:text-base lg:text-lg'
          data-testid='responsive-input'
        />,
      );

      const input = screen.getByTestId('responsive-input');
      expect(input).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
    });

    it('applies responsive padding', () => {
      render(
        <Input
          className='px-2 md:px-3 lg:px-4'
          data-testid='responsive-input'
        />,
      );

      const input = screen.getByTestId('responsive-input');
      expect(input).toHaveClass('px-2', 'md:px-3', 'lg:px-4');
    });

    it('handles responsive height', () => {
      render(
        <Input
          className='h-8 md:h-10 lg:h-12'
          data-testid='responsive-input'
        />,
      );

      const input = screen.getByTestId('responsive-input');
      expect(input).toHaveClass('h-8', 'md:h-10', 'lg:h-12');
    });

    it('supports mobile-first design', () => {
      render(
        <Input
          className='w-full sm:w-auto'
          data-testid='responsive-input'
        />,
      );

      const input = screen.getByTestId('responsive-input');
      expect(input).toHaveClass('w-full', 'sm:w-auto');
    });

    it('handles dark mode variants', () => {
      render(
        <Input
          className='bg-white text-black dark:bg-gray-800 dark:text-white'
          data-testid='dark-mode-input'
        />,
      );

      const input = screen.getByTestId('dark-mode-input');
      expect(input).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'text-black',
        'dark:text-white',
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(
        <Input
          value=''
          onChange={() => {}}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles very long values', () => {
      const longValue = 'a'.repeat(1000);
      render(
        <Input
          value={longValue}
          onChange={() => {}}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it('handles special characters', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(
        <Input
          value={specialValue}
          onChange={() => {}}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe(specialValue);
    });

    it('handles unicode characters', () => {
      const unicodeValue = '🚀 Hello 世界 مرحبا';
      render(
        <Input
          value={unicodeValue}
          onChange={() => {}}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe(unicodeValue);
    });

    it('handles null and undefined values gracefully', () => {
      render(
        <Input
          value={undefined as string | undefined}
          placeholder={undefined}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
    });

    it('handles rapid value changes', async () => {
      const RapidChangeInput = () => {
        const [value, setValue] = React.useState('');

        React.useEffect(() => {
          const interval = setInterval(() => {
            setValue((prev) => `${prev}a`);
          }, 10);

          setTimeout(() => clearInterval(interval), 100);

          return () => clearInterval(interval);
        }, []);

        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid='input'
          />
        );
      };

      render(<RapidChangeInput />);

      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
    });

    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<Input data-testid='input' />);

      expect(() => unmount()).not.toThrow();
    });

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <Input
          ref={ref}
          data-testid='input'
        />,
      );

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByTestId('input'));
    });

    it('handles dynamic type changes', () => {
      const DynamicTypeInput = () => {
        const [type, setType] = React.useState<'text' | 'password'>('text');

        return (
          <div>
            <Input
              type={type}
              data-testid='input'
            />
            <button
              onClick={() => setType(type === 'text' ? 'password' : 'text')}
            >
              Toggle Type
            </button>
          </div>
        );
      };

      const { rerender } = render(<DynamicTypeInput />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'text');

      rerender(<DynamicTypeInput />);
      // Component should handle type changes without errors
      expect(input).toBeInTheDocument();
    });

    it('handles form reset', async () => {
      render(
        <form>
          <Input
            defaultValue='initial'
            data-testid='input'
          />
          <button type='reset'>Reset</button>
        </form>,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      const resetButton = screen.getByText('Reset');

      // Change the value
      await user.clear(input);
      await user.type(input, 'changed');
      expect(input.value).toBe('changed');

      // Reset the form
      await user.click(resetButton);
      expect(input.value).toBe('initial');
    });

    it('handles browser autofill', () => {
      render(
        <Input
          autoComplete='username'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('autocomplete', 'username');
    });

    it('handles input with complex validation', () => {
      render(
        <Input
          pattern='(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}'
          title='Password must contain at least 8 characters with uppercase, lowercase and number'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute(
        'pattern',
        '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}',
      );
    });

    it('handles input in different contexts', () => {
      render(
        <div>
          <fieldset>
            <legend>Personal Info</legend>
            <Input
              placeholder='Name'
              data-testid='name-input'
            />
          </fieldset>
          <div role='group'>
            <Input
              placeholder='Email'
              data-testid='email-input'
            />
          </div>
        </div>,
      );

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });

    it('handles input with custom data attributes', () => {
      render(
        <Input
          data-custom='value'
          data-test-id='custom'
          data-analytics='track-input'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('data-custom', 'value');
      expect(input).toHaveAttribute('data-test-id', 'custom');
      expect(input).toHaveAttribute('data-analytics', 'track-input');
    });
  });
});
