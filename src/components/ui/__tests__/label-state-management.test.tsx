/**
 * @vitest-environment jsdom
 */

/**
 * Label State Management - Main Tests
 *
 * 主要状态管理测试，包括：
 * - 核心状态管理验证
 * - 基本状态测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - label-state-management-core.test.tsx - 核心状态管理测试
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label State Management - Main Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心状态管理验证', () => {
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

    it('handles success state', () => {
      render(
        <Label
          className='border-green-500 text-green-500'
          data-testid='success-label'
        >
          Success State
        </Label>,
      );

      const label = screen.getByTestId('success-label');
      expect(label).toHaveClass('text-green-500', 'border-green-500');
    });
  });

  describe('错误处理验证', () => {
    it('handles missing state gracefully', () => {
      expect(() => {
        render(<Label data-testid='no-state-label'>Label without state</Label>);
      }).not.toThrow();
    });

    it('handles invalid state gracefully', () => {
      expect(() => {
        render(
          <Label
            className='invalid-state-class'
            data-testid='invalid-state-label'
          >
            Label with invalid state
          </Label>,
        );
      }).not.toThrow();
    });

    it('handles conflicting states gracefully', () => {
      expect(() => {
        render(
          <Label
            className='enabled:opacity-100 disabled:opacity-50'
            data-testid='conflicting-state-label'
          >
            Label with conflicting states
          </Label>,
        );
      }).not.toThrow();
    });
  });
});
