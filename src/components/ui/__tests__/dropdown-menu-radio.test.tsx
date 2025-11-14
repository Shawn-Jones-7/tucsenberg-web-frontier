/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

// 局部 Mock lucide-react（v4：避免 hoist 导致的集中 Mock 冲突）
vi.mock('lucide-react', () => ({
  CheckIcon: () => null,
  ChevronRightIcon: () => null,
  CircleIcon: () => null,
}));

describe('DropdownMenu - Radio Components', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('DropdownMenuRadioGroup and RadioItem', () => {
    it('renders radio group', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup data-testid='radio-group'>
              <DropdownMenuRadioItem value='option1'>
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='option2'>
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const group = screen.getByTestId('radio-group');
      expect(group).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles value selection', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value='option1'>
              <DropdownMenuRadioItem
                value='option1'
                data-testid='radio-1'
              >
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='option2'
                data-testid='radio-2'
              >
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');

      expect(radio1).toHaveAttribute('data-state', 'checked');
      expect(radio2).toHaveAttribute('data-state', 'unchecked');
    });

    it('handles onValueChange callback', async () => {
      const onValueChange = vi.fn();
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup onValueChange={onValueChange}>
              <DropdownMenuRadioItem
                value='option1'
                data-testid='radio-1'
              >
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='option2'
                data-testid='radio-2'
              >
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const radio2 = screen.getByTestId('radio-2');
      await user.click(radio2);

      expect(onValueChange).toHaveBeenCalledWith('option2');
    });

    it('applies custom className to radio items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem
                value='option1'
                className='custom-radio'
                data-testid='radio-1'
              >
                Option 1
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveClass('custom-radio');
    });

    it('supports disabled radio items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem
                value='option1'
                data-testid='radio-enabled'
              >
                Enabled Option
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='option2'
                disabled
                data-testid='radio-disabled'
              >
                Disabled Option
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const enabledRadio = screen.getByTestId('radio-enabled');
      const disabledRadio = screen.getByTestId('radio-disabled');

      expect(enabledRadio).not.toHaveAttribute('data-disabled');
      expect(disabledRadio).toHaveAttribute('data-disabled');
    });

    it('handles multiple radio groups', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value='size-small'
              data-testid='size-group'
            >
              <DropdownMenuRadioItem
                value='size-small'
                data-testid='size-small'
              >
                Small
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='size-large'
                data-testid='size-large'
              >
                Large
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuRadioGroup
              value='color-red'
              data-testid='color-group'
            >
              <DropdownMenuRadioItem
                value='color-red'
                data-testid='color-red'
              >
                Red
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='color-blue'
                data-testid='color-blue'
              >
                Blue
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const sizeGroup = screen.getByTestId('size-group');
      const colorGroup = screen.getByTestId('color-group');

      expect(sizeGroup).toBeInTheDocument();
      expect(colorGroup).toBeInTheDocument();

      // Check selected states in each group
      expect(screen.getByTestId('size-small')).toHaveAttribute(
        'data-state',
        'checked',
      );
      expect(screen.getByTestId('size-large')).toHaveAttribute(
        'data-state',
        'unchecked',
      );
      expect(screen.getByTestId('color-red')).toHaveAttribute(
        'data-state',
        'checked',
      );
      expect(screen.getByTestId('color-blue')).toHaveAttribute(
        'data-state',
        'unchecked',
      );
    });

    it('supports radio items with complex content', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem
                value='complex'
                data-testid='complex-radio'
              >
                <div>
                  <span>Complex Option</span>
                  <small>With description</small>
                </div>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const complexRadio = screen.getByTestId('complex-radio');
      expect(complexRadio).toBeInTheDocument();
      expect(complexRadio).toHaveTextContent('Complex Option');
      expect(complexRadio).toHaveTextContent('With description');
    });

    it('handles radio group with no initial value', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup data-testid='no-value-group'>
              <DropdownMenuRadioItem
                value='option1'
                data-testid='radio-1'
              >
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='option2'
                data-testid='radio-2'
              >
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');

      // Both should be unchecked when no initial value is set
      expect(radio1).toHaveAttribute('data-state', 'unchecked');
      expect(radio2).toHaveAttribute('data-state', 'unchecked');
    });

    it('supports controlled radio group', async () => {
      const ControlledRadioGroup = () => {
        const [value, setValue] = React.useState('option1');

        return (
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={value}
                onValueChange={setValue}
              >
                <DropdownMenuRadioItem
                  value='option1'
                  data-testid='radio-1'
                >
                  Option 1
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='option2'
                  data-testid='radio-2'
                >
                  Option 2
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <div data-testid='current-value'>Current: {value}</div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };

      render(<ControlledRadioGroup />);

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');
      const currentValue = screen.getByTestId('current-value');

      expect(radio1).toHaveAttribute('data-state', 'checked');
      expect(radio2).toHaveAttribute('data-state', 'unchecked');
      expect(currentValue).toHaveTextContent('Current: option1');

      await user.click(radio2);

      expect(radio1).toHaveAttribute('data-state', 'unchecked');
      expect(radio2).toHaveAttribute('data-state', 'checked');
      expect(currentValue).toHaveTextContent('Current: option2');
    });
  });
});
