/**
 * @vitest-environment jsdom
 */

/**
 * Label Events & States Tests - Index
 *
 * Basic integration tests for the Label component events and states.
 * For comprehensive testing, see:
 * - label-event-handling.test.tsx - Event handling tests
 * - label-state-management.test.tsx - State management tests
 * - label-responsive-behavior.test.tsx - Responsive behavior tests
 * - label-edge-cases.test.tsx - Edge cases tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Events & States Tests - Index', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Event Handling', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(
        <Label
          onClick={handleClick}
          data-testid='clickable-label'
        >
          Clickable Label
        </Label>,
      );

      const label = screen.getByTestId('clickable-label');
      await user.click(label);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles double click events', async () => {
      const handleDoubleClick = vi.fn();
      render(
        <Label
          onDoubleClick={handleDoubleClick}
          data-testid='double-click-label'
        >
          Double Click Label
        </Label>,
      );

      const label = screen.getByTestId('double-click-label');
      await user.dblClick(label);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events', async () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      render(
        <Label
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-testid='mouse-events-label'
        >
          Mouse Events Label
        </Label>,
      );

      const label = screen.getByTestId('mouse-events-label');

      await user.hover(label);
      expect(handleMouseEnter).toHaveBeenCalled();

      await user.unhover(label);
      expect(handleMouseLeave).toHaveBeenCalled();
    });

    it('handles focus events', async () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Label
          tabIndex={0}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid='focus-label'
        >
          Focus Label
        </Label>,
      );

      const label = screen.getByTestId('focus-label');

      await user.click(label);
      expect(handleFocus).toHaveBeenCalled();

      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    it('handles event with associated input', async () => {
      const handleLabelClick = vi.fn();
      const handleInputFocus = vi.fn();

      render(
        <div>
          <Label
            htmlFor='event-input'
            onClick={handleLabelClick}
          >
            Event Label
          </Label>
          <input
            id='event-input'
            type='text'
            onFocus={handleInputFocus}
          />
        </div>,
      );

      const label = screen.getByText('Event Label');
      await user.click(label);

      expect(handleLabelClick).toHaveBeenCalled();
      expect(handleInputFocus).toHaveBeenCalled();
    });

    it('prevents event propagation when needed', async () => {
      const parentClick = vi.fn();
      const labelClick = vi.fn((_e: React.MouseEvent) => {
        _e.stopPropagation();
      });

      render(
        <div onClick={parentClick}>
          <Label
            onClick={labelClick}
            data-testid='stop-propagation'
          >
            Stop Propagation
          </Label>
        </div>,
      );

      const label = screen.getByTestId('stop-propagation');
      await user.click(label);

      expect(labelClick).toHaveBeenCalled();
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('handles custom event handlers', async () => {
      const customHandler = vi.fn();

      render(
        <Label
          data-testid='custom-event'
          onClick={(e: any) => {
            customHandler(e.type, e.target);
          }}
        >
          Custom Event
        </Label>,
      );

      const label = screen.getByTestId('custom-event');
      await user.click(label);

      expect(customHandler).toHaveBeenCalledWith('click', label);
    });
  });

  describe('Basic State Management', () => {
    it('handles disabled state correctly', () => {
      render(<Label data-testid='disabled-label'>Disabled Label</Label>);

      const label = screen.getByTestId('disabled-label');
      expect(label).toHaveClass(
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-50',
      );
    });

    it('disables associated input when label is disabled', async () => {
      render(
        <div>
          <Label
            htmlFor='disabled-input'
            data-testid='disabled-label'
          >
            Disabled Input Label
          </Label>
          <input
            id='disabled-input'
            type='text'
            disabled
          />
        </div>,
      );

      const label = screen.getByTestId('disabled-label');
      const input = screen.getByRole('textbox');

      expect(input).toBeDisabled();

      // Clicking disabled input's label should not focus it
      await user.click(label);
      expect(input).not.toHaveFocus();
    });

    it('handles conditional disabled state', () => {
      const ConditionalLabel = ({ isDisabled }: { isDisabled: boolean }) => (
        <Label
          className={isDisabled ? 'cursor-not-allowed opacity-50' : ''}
          data-testid='conditional-disabled'
        >
          Conditional Label
        </Label>
      );

      const { rerender } = render(<ConditionalLabel isDisabled={false} />);

      let label = screen.getByTestId('conditional-disabled');
      expect(label).not.toHaveClass('opacity-50');

      rerender(<ConditionalLabel isDisabled={true} />);
      label = screen.getByTestId('conditional-disabled');
      expect(label).toHaveClass('opacity-50');
    });

    it('handles form context disabled state', () => {
      render(
        <form>
          <fieldset disabled>
            <Label
              htmlFor='form-input'
              data-testid='form-label'
            >
              Form Label
            </Label>
            <input
              id='form-input'
              type='text'
            />
          </fieldset>
        </form>,
      );

      const label = screen.getByTestId('form-label');
      const input = screen.getByRole('textbox');

      expect(input).toBeDisabled();
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    });
  });

  describe('Basic Responsive Behavior', () => {
    it('maintains consistent styling across screen sizes', () => {
      render(
        <Label
          className='text-sm md:text-base lg:text-lg'
          data-testid='responsive-label'
        >
          Responsive Label
        </Label>,
      );

      const label = screen.getByTestId('responsive-label');
      expect(label).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
    });

    it('handles responsive spacing', () => {
      render(
        <Label
          className='p-2 md:p-4 lg:p-6'
          data-testid='spacing-label'
        >
          Spacing Label
        </Label>,
      );

      const label = screen.getByTestId('spacing-label');
      expect(label).toHaveClass('p-2', 'md:p-4', 'lg:p-6');
    });

    it('handles mobile touch targets', () => {
      render(
        <Label
          className='flex min-h-[44px] min-w-[44px] items-center'
          data-testid='touch-target'
        >
          Touch
        </Label>,
      );

      const label = screen.getByTestId('touch-target');
      expect(label).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('supports dark mode variants', () => {
      render(
        <Label
          className='text-gray-900 dark:text-gray-100'
          data-testid='dark-mode'
        >
          Dark Mode Label
        </Label>,
      );

      const label = screen.getByTestId('dark-mode');
      expect(label).toHaveClass('text-gray-900', 'dark:text-gray-100');
    });

    it('adapts to container constraints', () => {
      render(
        <div style={{ width: '200px' }}>
          <Label
            className='w-full truncate'
            data-testid='constrained-label'
          >
            Very long label text that should be truncated
          </Label>
        </div>,
      );

      const label = screen.getByTestId('constrained-label');
      expect(label).toHaveClass('w-full', 'truncate');
    });
  });

  describe('Basic Edge Cases', () => {
    it('renders empty label', () => {
      render(<Label data-testid='empty-label'></Label>);

      const label = screen.getByTestId('empty-label');
      expect(label).toBeInTheDocument();
      expect(label).toBeEmptyDOMElement();
    });

    it('handles very long text content', () => {
      const longText = 'A'.repeat(100);
      render(<Label data-testid='long-text'>{longText}</Label>);

      const label = screen.getByTestId('long-text');
      expect(label).toHaveTextContent(longText);
    });

    it('handles special characters and unicode', () => {
      const specialText = '🚀 Special chars: @#$%^&*()_+';
      render(<Label>{specialText}</Label>);

      const label = screen.getByText(specialText);
      expect(label).toHaveTextContent(specialText);
    });

    it('handles rapid state changes', async () => {
      const StateChangingLabel = () => {
        const [count, setCount] = React.useState(0);

        return (
          <Label
            onClick={() => setCount((c) => c + 1)}
            data-testid='state-changing'
          >
            Count: {count}
          </Label>
        );
      };

      render(<StateChangingLabel />);

      const label = screen.getByTestId('state-changing');

      // Rapidly click multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(label);
      }

      expect(label).toHaveTextContent('Count: 5');
    });

    it('handles null and undefined props gracefully', () => {
      render(
        <Label
          className={undefined}
          style={null as any}
          onClick={undefined}
          data-testid='null-props'
        >
          Null Props
        </Label>,
      );

      const label = screen.getByTestId('null-props');
      expect(label).toBeInTheDocument();
    });
  });
});
