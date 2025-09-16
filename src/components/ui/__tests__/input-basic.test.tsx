/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input - Basic Rendering & Types', () => {
  describe('Basic Rendering', () => {
    it('renders input with default props', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('applies default classes', () => {
      render(<Input data-testid='input' />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm',
        'ring-offset-background',
      );
    });

    it('renders as input element', () => {
      render(<Input data-testid='input' />);

      const input = screen.getByTestId('input');
      expect(input.tagName).toBe('INPUT');
    });

    it('has correct default attributes', () => {
      render(<Input data-testid='input' />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('handles empty props gracefully', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with minimal configuration', () => {
      render(<Input placeholder='Minimal input' />);

      const input = screen.getByPlaceholderText('Minimal input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input data-testid='text-input' />);

      const input = screen.getByTestId('text-input');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(
        <Input
          type='email'
          data-testid='email-input'
        />,
      );

      const input = screen.getByTestId('email-input');
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
      render(
        <Input
          type='number'
          data-testid='number-input'
        />,
      );

      const input = screen.getByTestId('number-input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders tel input', () => {
      render(
        <Input
          type='tel'
          data-testid='tel-input'
        />,
      );

      const input = screen.getByTestId('tel-input');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      render(
        <Input
          type='url'
          data-testid='url-input'
        />,
      );

      const input = screen.getByTestId('url-input');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders search input', () => {
      render(
        <Input
          type='search'
          data-testid='search-input'
        />,
      );

      const input = screen.getByTestId('search-input');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('renders date input', () => {
      render(
        <Input
          type='date'
          data-testid='date-input'
        />,
      );

      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('renders time input', () => {
      render(
        <Input
          type='time'
          data-testid='time-input'
        />,
      );

      const input = screen.getByTestId('time-input');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('renders datetime-local input', () => {
      render(
        <Input
          type='datetime-local'
          data-testid='datetime-input'
        />,
      );

      const input = screen.getByTestId('datetime-input');
      expect(input).toHaveAttribute('type', 'datetime-local');
    });

    it('renders month input', () => {
      render(
        <Input
          type='month'
          data-testid='month-input'
        />,
      );

      const input = screen.getByTestId('month-input');
      expect(input).toHaveAttribute('type', 'month');
    });

    it('renders week input', () => {
      render(
        <Input
          type='week'
          data-testid='week-input'
        />,
      );

      const input = screen.getByTestId('week-input');
      expect(input).toHaveAttribute('type', 'week');
    });

    it('renders color input', () => {
      render(
        <Input
          type='color'
          data-testid='color-input'
        />,
      );

      const input = screen.getByTestId('color-input');
      expect(input).toHaveAttribute('type', 'color');
    });

    it('renders range input', () => {
      render(
        <Input
          type='range'
          data-testid='range-input'
        />,
      );

      const input = screen.getByTestId('range-input');
      expect(input).toHaveAttribute('type', 'range');
    });

    it('renders hidden input', () => {
      render(
        <Input
          type='hidden'
          data-testid='hidden-input'
        />,
      );

      const input = screen.getByTestId('hidden-input');
      expect(input).toHaveAttribute('type', 'hidden');
    });

    it('handles file input type', () => {
      render(
        <Input
          type='file'
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('applies type-specific styling', () => {
      render(
        <Input
          type='search'
          className='search-specific'
          data-testid='search'
        />,
      );

      const input = screen.getByTestId('search');
      expect(input).toHaveClass('search-specific');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('handles invalid input types gracefully', () => {
      // TypeScript would prevent this, but testing runtime behavior
      render(
        <Input
          type={'invalid' as React.HTMLInputTypeAttribute}
          data-testid='invalid-input'
        />,
      );

      const input = screen.getByTestId('invalid-input');
      expect(input).toHaveAttribute('type', 'invalid');
    });

    it('supports all HTML5 input types', () => {
      const types = [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'time',
        'datetime-local',
        'month',
        'week',
        'color',
        'range',
      ];

      types.forEach((type) => {
        const { unmount } = render(
          <Input
            type={type as React.HTMLInputTypeAttribute}
            data-testid={`${type}-input`}
          />,
        );

        const input = screen.getByTestId(`${type}-input`);
        expect(input).toHaveAttribute('type', type);

        unmount();
      });
    });

    it('maintains consistent styling across types', () => {
      const types = ['text', 'email', 'password', 'number'];

      types.forEach((type) => {
        const { unmount } = render(
          <Input
            type={type as React.HTMLInputTypeAttribute}
            data-testid={`${type}-input`}
          />,
        );

        const input = screen.getByTestId(`${type}-input`);
        expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');

        unmount();
      });
    });

    it('handles type changes dynamically', () => {
      const { rerender } = render(
        <Input
          type='text'
          data-testid='dynamic-input'
        />,
      );

      let input = screen.getByTestId('dynamic-input');
      expect(input).toHaveAttribute('type', 'text');

      rerender(
        <Input
          type='email'
          data-testid='dynamic-input'
        />,
      );
      input = screen.getByTestId('dynamic-input');
      expect(input).toHaveAttribute('type', 'email');

      rerender(
        <Input
          type='password'
          data-testid='dynamic-input'
        />,
      );
      input = screen.getByTestId('dynamic-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('supports type-specific attributes', () => {
      render(
        <Input
          type='number'
          min={0}
          max={100}
          step={5}
          data-testid='number-input'
        />,
      );

      const input = screen.getByTestId('number-input');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
      expect(input).toHaveAttribute('step', '5');
    });

    it('supports file input attributes', () => {
      render(
        <Input
          type='file'
          accept='.jpg,.png'
          multiple
          data-testid='file-input'
        />,
      );

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('accept', '.jpg,.png');
      expect(input).toHaveAttribute('multiple');
    });

    it('supports date input attributes', () => {
      render(
        <Input
          type='date'
          min='2023-01-01'
          max='2023-12-31'
          data-testid='date-input'
        />,
      );

      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('min', '2023-01-01');
      expect(input).toHaveAttribute('max', '2023-12-31');
    });

    it('supports text input attributes', () => {
      render(
        <Input
          type='text'
          minLength={3}
          maxLength={50}
          pattern='[A-Za-z]+'
          data-testid='text-input'
        />,
      );

      const input = screen.getByTestId('text-input');
      expect(input).toHaveAttribute('minLength', '3');
      expect(input).toHaveAttribute('maxLength', '50');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
    });
  });
});
