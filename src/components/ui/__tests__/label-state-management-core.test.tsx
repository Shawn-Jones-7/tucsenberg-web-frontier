/**
 * @vitest-environment jsdom
 */

/**
 * Label State Management - Core Tests
 *
 * 专门测试核心状态管理功能，包括：
 * - 禁用状态
 * - 活动状态
 * - 悬停状态
 * - 焦点状态
 * - 访问状态
 * - 选中状态
 * - 无效状态
 * - 必填状态
 * - 只读状态
 * - 占位符状态
 */

import { Label } from '@/components/ui/label';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Label State Management - Core Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心状态管理功能', () => {
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

      // Clicking disabled input's label should not focus it
      await user.click(label);
      expect(input).not.toHaveFocus();
    });

    it('applies custom disabled styling', () => {
      render(
        <Label
          className='disabled:opacity-50'
          data-testid='custom-disabled'
        >
          Custom Disabled
        </Label>,
      );

      const label = screen.getByTestId('custom-disabled');
      expect(label).toHaveClass('disabled:opacity-50');
    });

    it('handles disabled state in form context', () => {
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

    it('handles active state styling', async () => {
      render(
        <Label
          className='active:scale-95'
          data-testid='active-label'
        >
          Active Label
        </Label>,
      );

      const label = screen.getByTestId('active-label');
      expect(label).toHaveClass('active:scale-95');
    });

    it('handles hover state styling', async () => {
      render(
        <Label
          className='hover:bg-gray-100'
          data-testid='hover-label'
        >
          Hover Label
        </Label>,
      );

      const label = screen.getByTestId('hover-label');
      expect(label).toHaveClass('hover:bg-gray-100');
    });

    it('handles focus state styling', async () => {
      render(
        <Label
          className='focus:ring-2'
          tabIndex={0}
          data-testid='focus-label'
        >
          Focus Label
        </Label>,
      );

      const label = screen.getByTestId('focus-label');
      expect(label).toHaveClass('focus:ring-2');
    });

    it('handles visited state for links', () => {
      render(
        <Label
          className='visited:text-purple-600'
          data-testid='visited-label'
        >
          <a href='#'>Visited Link Label</a>
        </Label>,
      );

      const label = screen.getByTestId('visited-label');
      expect(label).toHaveClass('visited:text-purple-600');
    });

    it('handles checked state for form controls', () => {
      render(
        <div>
          <input
            type='checkbox'
            id='checkbox-input'
          />
          <Label
            htmlFor='checkbox-input'
            className='peer-checked:font-bold'
            data-testid='checked-label'
          >
            Checkbox Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('checked-label');
      expect(label).toHaveClass('peer-checked:font-bold');
    });

    it('handles invalid state styling', () => {
      render(
        <div>
          <input
            type='email'
            id='email-input'
            required
          />
          <Label
            htmlFor='email-input'
            className='peer-invalid:text-red-500'
            data-testid='invalid-label'
          >
            Email Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('invalid-label');
      expect(label).toHaveClass('peer-invalid:text-red-500');
    });

    it('handles required state styling', () => {
      render(
        <div>
          <input
            type='text'
            id='required-input'
            required
          />
          <Label
            htmlFor='required-input'
            className='peer-required:after:content-["*"]'
            data-testid='required-label'
          >
            Required Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('required-label');
      expect(label).toHaveClass('peer-required:after:content-["*"]');
    });

    it('handles readonly state styling', () => {
      render(
        <div>
          <input
            type='text'
            id='readonly-input'
            readOnly
          />
          <Label
            htmlFor='readonly-input'
            className='peer-read-only:opacity-75'
            data-testid='readonly-label'
          >
            Readonly Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('readonly-label');
      expect(label).toHaveClass('peer-read-only:opacity-75');
    });

    it('handles placeholder-shown state', () => {
      render(
        <div>
          <input
            type='text'
            id='placeholder-input'
            placeholder='Enter text'
          />
          <Label
            htmlFor='placeholder-input'
            className='peer-placeholder-shown:text-gray-400'
            data-testid='placeholder-label'
          >
            Placeholder Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('placeholder-label');
      expect(label).toHaveClass('peer-placeholder-shown:text-gray-400');
    });

    it('handles multiple state combinations', () => {
      render(
        <div>
          <input
            type='email'
            id='multi-state-input'
            required
            disabled
          />
          <Label
            htmlFor='multi-state-input'
            className='peer-invalid:text-red-500 peer-disabled:opacity-50 peer-required:after:content-["*"]'
            data-testid='multi-state-label'
          >
            Multi State Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('multi-state-label');
      expect(label).toHaveClass(
        'peer-required:after:content-["*"]',
        'peer-disabled:opacity-50',
        'peer-invalid:text-red-500',
      );
    });

    it('handles dynamic state changes', async () => {
      const DynamicStateLabel = () => {
        const [isActive, setIsActive] = React.useState(false);

        return (
          <Label
            className={isActive ? 'bg-blue-100' : 'bg-gray-100'}
            onClick={() => setIsActive(!isActive)}
            data-testid='dynamic-label'
          >
            Dynamic State: {isActive ? 'Active' : 'Inactive'}
          </Label>
        );
      };

      render(<DynamicStateLabel />);

      const label = screen.getByTestId('dynamic-label');
      expect(label).toHaveClass('bg-gray-100');
      expect(label).toHaveTextContent('Dynamic State: Inactive');

      await user.click(label);

      expect(label).toHaveClass('bg-blue-100');
      expect(label).toHaveTextContent('Dynamic State: Active');
    });

    it('handles state persistence across re-renders', () => {
      const StatefulLabel = ({ count }: { count: number }) => (
        <Label
          className={count > 5 ? 'text-red-500' : 'text-green-500'}
          data-testid='stateful-label'
        >
          Count: {count}
        </Label>
      );

      const { rerender } = render(<StatefulLabel count={3} />);
      let label = screen.getByTestId('stateful-label');
      expect(label).toHaveClass('text-green-500');

      rerender(<StatefulLabel count={7} />);
      label = screen.getByTestId('stateful-label');
      expect(label).toHaveClass('text-red-500');
    });

    it('handles loading state', () => {
      render(
        <Label
          className='animate-pulse'
          data-testid='loading-label'
        >
          Loading...
        </Label>,
      );

      const label = screen.getByTestId('loading-label');
      expect(label).toHaveClass('animate-pulse');
    });

    it('handles error state', () => {
      render(
        <Label
          className='border-red-500 text-red-500'
          data-testid='error-label'
        >
          Error State
        </Label>,
      );

      const label = screen.getByTestId('error-label');
      expect(label).toHaveClass('text-red-500', 'border-red-500');
    });
  });
});
