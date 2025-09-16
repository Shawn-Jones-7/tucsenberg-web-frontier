/**
 * @vitest-environment jsdom
 */

/**
 * Label Form Basic Integration - Essential Tests
 *
 * 专门测试最核心的表单集成功能，包括：
 * - 基本表单结构
 * - 核心验证功能
 * - 基础字段集
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Form Basic Integration - Essential Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('基础表单集成', () => {
    it('works in simple form structure', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='name'>Name</Label>
            <input
              id='name'
              type='text'
              required
            />
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <input
              id='email'
              type='email'
              required
            />
          </div>
          <button type='submit'>Submit</button>
        </form>,
      );

      // Test basic form functionality
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles form validation states', () => {
      render(
        <form>
          <div>
            <Label htmlFor='required-field'>Required Field *</Label>
            <input
              id='required-field'
              type='text'
              required
              aria-invalid='true'
            />
          </div>
          <div>
            <Label htmlFor='optional-field'>Optional Field</Label>
            <input
              id='optional-field'
              type='text'
            />
          </div>
        </form>,
      );

      const requiredInput = screen.getByLabelText('Required Field *');
      const optionalInput = screen.getByLabelText('Optional Field');

      expect(requiredInput).toBeRequired();
      expect(requiredInput).toHaveAttribute('aria-invalid', 'true');
      expect(optionalInput).not.toBeRequired();
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
          </fieldset>
        </form>,
      );

      const fieldset = screen.getByRole('group', {
        name: 'Personal Information',
      });
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      expect(fieldset).toBeInTheDocument();
      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
    });
  });

  describe('表单交互', () => {
    it('handles keyboard navigation', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='field1'>Field 1</Label>
            <input
              id='field1'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='field2'>Field 2</Label>
            <input
              id='field2'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='field3'>Field 3</Label>
            <input
              id='field3'
              type='text'
            />
          </div>
        </form>,
      );

      const field1 = screen.getByLabelText('Field 1');
      const field2 = screen.getByLabelText('Field 2');
      const field3 = screen.getByLabelText('Field 3');

      // Test tab navigation
      field1.focus();
      expect(field1).toHaveFocus();

      await user.tab();
      expect(field2).toHaveFocus();

      await user.tab();
      expect(field3).toHaveFocus();
    });

    it('handles label clicks for focus', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='clickable1'>Clickable Label 1</Label>
            <input
              id='clickable1'
              type='text'
            />
          </div>
          <div>
            <Label htmlFor='clickable2'>Clickable Label 2</Label>
            <input
              id='clickable2'
              type='email'
            />
          </div>
        </form>,
      );

      const label1 = screen.getByText('Clickable Label 1');
      const label2 = screen.getByText('Clickable Label 2');
      const input1 = screen.getByLabelText('Clickable Label 1');
      const input2 = screen.getByLabelText('Clickable Label 2');

      await user.click(label1);
      expect(input1).toHaveFocus();

      await user.click(label2);
      expect(input2).toHaveFocus();
    });
  });

  describe('错误处理', () => {
    it('handles form with error states', () => {
      render(
        <form>
          <div>
            <Label htmlFor='error-field'>Field with Error</Label>
            <input
              id='error-field'
              type='text'
              aria-invalid='true'
              aria-describedby='error-message'
            />
            <div
              id='error-message'
              role='alert'
            >
              This field has an error
            </div>
          </div>
        </form>,
      );

      const input = screen.getByLabelText('Field with Error');
      const errorMessage = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
      expect(errorMessage).toHaveTextContent('This field has an error');
    });

    it('handles missing form elements gracefully', () => {
      render(
        <div>
          <Label htmlFor='missing-input'>Label for Missing Input</Label>
          {/* No corresponding input */}
        </div>,
      );

      const label = screen.getByText('Label for Missing Input');
      expect(label).toHaveAttribute('for', 'missing-input');
    });
  });

  describe('多种输入类型', () => {
    it('works with different input types', async () => {
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
        </form>,
      );

      // Test all input types are properly associated
      expect(screen.getByLabelText('Text Input')).toHaveAttribute(
        'type',
        'text',
      );
      expect(screen.getByLabelText('Email Input')).toHaveAttribute(
        'type',
        'email',
      );
      expect(screen.getByLabelText('Password Input')).toHaveAttribute(
        'type',
        'password',
      );
      expect(screen.getByLabelText('Number Input')).toHaveAttribute(
        'type',
        'number',
      );
    });

    it('works with checkboxes and radios', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='checkbox1'>Checkbox Option</Label>
            <input
              id='checkbox1'
              type='checkbox'
            />
          </div>
          <div>
            <Label htmlFor='radio1'>Radio Option 1</Label>
            <input
              id='radio1'
              type='radio'
              name='radio-group'
              value='1'
            />
          </div>
          <div>
            <Label htmlFor='radio2'>Radio Option 2</Label>
            <input
              id='radio2'
              type='radio'
              name='radio-group'
              value='2'
            />
          </div>
        </form>,
      );

      const checkbox = screen.getByLabelText('Checkbox Option');
      const radio1 = screen.getByLabelText('Radio Option 1');
      const radio2 = screen.getByLabelText('Radio Option 2');

      // Test checkbox behavior
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      // Test radio behavior
      await user.click(radio1);
      expect(radio1).toBeChecked();
      expect(radio2).not.toBeChecked();

      await user.click(radio2);
      expect(radio1).not.toBeChecked();
      expect(radio2).toBeChecked();
    });
  });

  describe('可访问性', () => {
    it('maintains accessibility standards', () => {
      render(
        <form>
          <div>
            <Label htmlFor='accessible-input'>Accessible Input</Label>
            <input
              id='accessible-input'
              type='text'
              aria-describedby='help-text'
              required
            />
            <div id='help-text'>This field is required</div>
          </div>
        </form>,
      );

      const input = screen.getByLabelText('Accessible Input');
      const helpText = screen.getByText('This field is required');

      expect(input).toBeRequired();
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
      expect(helpText).toBeInTheDocument();
    });

    it('supports screen reader navigation', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='sr-input'>Screen Reader Input</Label>
            <input
              id='sr-input'
              type='text'
            />
          </div>
        </form>,
      );

      const input = screen.getByLabelText('Screen Reader Input');

      // Test that input can be found by accessible name
      expect(input).toBeInTheDocument();
      expect(input).toHaveAccessibleName('Screen Reader Input');
    });
  });
});
