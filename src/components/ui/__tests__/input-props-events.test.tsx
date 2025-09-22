/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input - Props & Events', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Input
          className='custom-input'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('flex'); // Should still have default classes
    });

    it('supports custom id', () => {
      render(<Input id='custom-id' />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('supports placeholder text', () => {
      render(<Input placeholder='Enter text here' />);

      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('supports default value', () => {
      render(
        <Input
          defaultValue='Default text'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('Default text');
    });

    it('supports controlled value', () => {
      const { rerender } = render(
        <Input
          value='Controlled'
          onChange={() => {}}
          data-testid='input'
        />,
      );

      let input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('Controlled');

      rerender(
        <Input
          value='Updated'
          onChange={() => {}}
          data-testid='input'
        />,
      );
      input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('Updated');
    });

    it('supports disabled state', () => {
      render(
        <Input
          disabled
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
    });

    it('supports readonly state', () => {
      render(
        <Input
          readOnly
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('readonly');
    });

    it('supports required attribute', () => {
      render(
        <Input
          required
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('supports name attribute', () => {
      render(
        <Input
          name='username'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('supports autoComplete attribute', () => {
      render(
        <Input
          autoComplete='email'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });

    it('supports autoFocus attribute', () => {
      render(
        <Input
          autoFocus
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveFocus();
    });

    it('supports tabIndex', () => {
      render(
        <Input
          tabIndex={5}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('tabIndex', '5');
    });

    it('supports custom style', () => {
      const customStyle = { backgroundColor: 'red', fontSize: '18px' };
      render(
        <Input
          style={customStyle}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(input).toHaveStyle('font-size: 18px');
    });

    it('supports data attributes', () => {
      render(
        <Input
          data-custom='value'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('data-custom', 'value');
    });

    it('supports aria attributes', () => {
      render(
        <Input
          aria-label='Custom input'
          aria-describedby='help-text'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-label', 'Custom input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('merges multiple classNames correctly', () => {
      render(
        <Input
          className='class1 class2'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('class1', 'class2', 'flex');
    });

    it('handles undefined props gracefully', () => {
      render(
        <Input
          className={undefined}
          placeholder={undefined}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
    });

    it('supports form attribute', () => {
      render(
        <Input
          form='my-form'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('form', 'my-form');
    });

    it('supports size attribute for file inputs', () => {
      render(
        <Input
          type='file'
          size={10}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('size', '10');
    });

    it('supports multiple attribute for file inputs', () => {
      render(
        <Input
          type='file'
          multiple
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('multiple');
    });

    it('supports accept attribute for file inputs', () => {
      render(
        <Input
          type='file'
          accept='image/*'
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('Event Handling', () => {
    it('handles onChange events', async () => {
      const handleChange = vi.fn();
      render(
        <Input
          onChange={handleChange}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it('handles onFocus events', async () => {
      const handleFocus = vi.fn();
      render(
        <Input
          onFocus={handleFocus}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', async () => {
      const handleBlur = vi.fn();
      render(
        <Input
          onBlur={handleBlur}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles onKeyDown events', async () => {
      const handleKeyDown = vi.fn();
      render(
        <Input
          onKeyDown={handleKeyDown}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      input.focus();
      await user.keyboard('{Enter}');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('handles onKeyUp events', async () => {
      const handleKeyUp = vi.fn();
      render(
        <Input
          onKeyUp={handleKeyUp}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      input.focus();
      await user.keyboard('a');

      expect(handleKeyUp).toHaveBeenCalled();
    });

    it('handles onKeyPress events', async () => {
      const handleKeyPress = vi.fn();
      render(
        <Input
          onKeyPress={handleKeyPress}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      input.focus();
      await user.keyboard('a');

      expect(handleKeyPress).toHaveBeenCalled();
    });

    it('handles _onClick events', async () => {
      const handleClick = vi.fn();
      render(
        <Input
          onClick={handleClick}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles onDoubleClick events', async () => {
      const handleDoubleClick = vi.fn();
      render(
        <Input
          onDoubleClick={handleDoubleClick}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.dblClick(input);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events', async () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      render(
        <Input
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');

      await user.hover(input);
      expect(handleMouseEnter).toHaveBeenCalled();

      await user.unhover(input);
      expect(handleMouseLeave).toHaveBeenCalled();
    });

    it('handles input events with correct values', async () => {
      const handleChange = vi.fn();
      render(
        <Input
          onChange={handleChange}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.type(input, 'hello');

      const calls = handleChange.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      // Check that the final value is correct
      const lastCall = calls[calls.length - 1];
      expect(lastCall?.[0]?.target?.value).toBe('hello');
    });

    it('prevents events when disabled', async () => {
      const handleChange = vi.fn();
      const handleClick = vi.fn();

      render(
        <Input
          disabled
          onChange={handleChange}
          onClick={handleClick}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');

      await user.click(input);
      expect(handleClick).not.toHaveBeenCalled();

      // Disabled inputs don'_t receive typing events
      await user.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('handles custom event handlers', async () => {
      const customHandler = vi.fn();

      render(
        <Input
          onChange={(e) => customHandler(e.target.value)}
          data-testid='input'
        />,
      );

      const input = screen.getByTestId('input');
      await user.type(input, 'test');

      expect(customHandler).toHaveBeenCalledWith('t');
      expect(customHandler).toHaveBeenCalledWith('te');
      expect(customHandler).toHaveBeenCalledWith('tes');
      expect(customHandler).toHaveBeenCalledWith('test');
    });

    it('handles multiple event handlers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const MultiHandlerInput = () => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          handler1(e.target.value);
          handler2(e.target.value);
        };

        return (
          <Input
            onChange={handleChange}
            data-testid='input'
          />
        );
      };

      render(<MultiHandlerInput />);

      const input = screen.getByTestId('input');
      await user.type(input, 'a');

      expect(handler1).toHaveBeenCalledWith('a');
      expect(handler2).toHaveBeenCalledWith('a');
    });

    it('handles event propagation', async () => {
      const parentClick = vi.fn();
      const inputClick = vi.fn();

      render(
        <div onClick={parentClick}>
          <Input
            onClick={inputClick}
            data-testid='input'
          />
        </div>,
      );

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(inputClick).toHaveBeenCalled();
      expect(parentClick).toHaveBeenCalled();
    });

    it('handles event prevention', async () => {
      const parentClick = vi.fn();
      const inputClick = vi.fn((e: React.MouseEvent) => {
        e.stopPropagation();
      });

      render(
        <div onClick={parentClick}>
          <Input
            onClick={inputClick}
            data-testid='input'
          />
        </div>,
      );

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(inputClick).toHaveBeenCalled();
      expect(parentClick).not.toHaveBeenCalled();
    });
  });
});
