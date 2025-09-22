/**
 * @vitest-environment jsdom
 */

/**
 * Label Form Advanced Integration Core Tests
 *
 * 核心高级表单集成测试，专注于最重要的集成场景：
 * - 动态表单字段
 * - 表单重置功能
 * - 受控组件
 * - 表单提交处理
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Form Advanced Integration Core Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心高级表单集成', () => {
    it('works with dynamic form fields', async () => {
      const DynamicForm = () => {
        const [fields, setFields] = React.useState([{ id: 1, value: '' }]);

        const addField = () => {
          const newId = Math.max(...fields.map((f) => f.id)) + 1;
          setFields([...fields, { id: newId, value: '' }]);
        };

        const removeField = (id: number) => {
          setFields(fields.filter((f) => f.id !== id));
        };

        const updateField = (id: number, value: string) => {
          setFields(fields.map((f) => (f.id === id ? { ...f, value } : f)));
        };

        return (
          <form>
            {fields.map((field, index) => (
              <div key={field.id}>
                <Label htmlFor={`field-${field.id}`}>Field {index + 1}</Label>
                <input
                  id={`field-${field.id}`}
                  value={field.value}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  data-testid={`input-${field.id}`}
                />
                {fields.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeField(field.id)}
                    data-testid={`remove-${field.id}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={addField}
              data-testid='add-field'
            >
              Add Field
            </button>
          </form>
        );
      };

      render(<DynamicForm />);

      // Initial state
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByTestId('input-1')).toBeInTheDocument();

      // Add a field
      await user.click(screen.getByTestId('add-field'));
      expect(screen.getByText('Field 2')).toBeInTheDocument();
      expect(screen.getByTestId('input-2')).toBeInTheDocument();

      // Type in fields
      await user.type(screen.getByTestId('input-1'), 'First field');
      await user.type(screen.getByTestId('input-2'), 'Second field');

      expect(screen.getByTestId('input-1')).toHaveValue('First field');
      expect(screen.getByTestId('input-2')).toHaveValue('Second field');

      // Remove a field
      await user.click(screen.getByTestId('remove-2'));
      expect(screen.queryByText('Field 2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('input-2')).not.toBeInTheDocument();
    });

    it('handles form reset correctly', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='reset-input'>Reset Test</Label>
            <input
              id='reset-input'
              defaultValue='initial'
              data-testid='reset-input'
            />
          </div>
          <button
            type='reset'
            data-testid='reset-button'
          >
            Reset
          </button>
        </form>,
      );

      const input = screen.getByTestId('reset-input');
      expect(input).toHaveValue('initial');

      await user.clear(input);
      await user.type(input, 'changed');
      expect(input).toHaveValue('changed');

      await user.click(screen.getByTestId('reset-button'));
      expect(input).toHaveValue('initial');
    });

    it('works with controlled components', async () => {
      const ControlledForm = () => {
        const [value, setValue] = React.useState('');

        return (
          <form>
            <Label htmlFor='controlled-input'>Controlled Input</Label>
            <input
              id='controlled-input'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid='controlled-input'
            />
            <div data-testid='display-value'>Value: {value}</div>
          </form>
        );
      };

      render(<ControlledForm />);

      const input = screen.getByTestId('controlled-input');
      const display = screen.getByTestId('display-value');

      expect(input).toHaveValue('');
      expect(display).toHaveTextContent('Value:');

      await user.type(input, 'controlled');
      expect(input).toHaveValue('controlled');
      expect(display).toHaveTextContent('Value: controlled');
    });

    it('handles form submission with preventDefault', async () => {
      const handleSubmit = vi.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        return formData.get('submit-input');
      });

      render(
        <form onSubmit={handleSubmit}>
          <Label htmlFor='submit-input'>Submit Test</Label>
          <input
            id='submit-input'
            name='submit-input'
            defaultValue='test value'
            data-testid='submit-input'
          />
          <button
            type='submit'
            data-testid='submit-button'
          >
            Submit
          </button>
        </form>,
      );

      await user.click(screen.getByTestId('submit-button'));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('works with complex nested form structures', async () => {
      render(
        <form>
          <div>
            <fieldset>
              <legend>Personal Information</legend>
              <div>
                <Label htmlFor='nested-name'>Name</Label>
                <input
                  id='nested-name'
                  data-testid='nested-name'
                />
              </div>
              <div>
                <Label htmlFor='nested-email'>Email</Label>
                <input
                  id='nested-email'
                  type='email'
                  data-testid='nested-email'
                />
              </div>
            </fieldset>
            <fieldset>
              <legend>Address</legend>
              <div>
                <Label htmlFor='nested-street'>Street</Label>
                <input
                  id='nested-street'
                  data-testid='nested-street'
                />
              </div>
              <div>
                <Label htmlFor='nested-city'>City</Label>
                <input
                  id='nested-city'
                  data-testid='nested-city'
                />
              </div>
            </fieldset>
          </div>
        </form>,
      );

      // Test all nested inputs are accessible
      expect(screen.getByTestId('nested-name')).toBeInTheDocument();
      expect(screen.getByTestId('nested-email')).toBeInTheDocument();
      expect(screen.getByTestId('nested-street')).toBeInTheDocument();
      expect(screen.getByTestId('nested-city')).toBeInTheDocument();

      // Test labels are properly associated
      expect(screen.getByLabelText('Name')).toBe(
        screen.getByTestId('nested-name'),
      );
      expect(screen.getByLabelText('Email')).toBe(
        screen.getByTestId('nested-email'),
      );
      expect(screen.getByLabelText('Street')).toBe(
        screen.getByTestId('nested-street'),
      );
      expect(screen.getByLabelText('City')).toBe(
        screen.getByTestId('nested-city'),
      );

      // Test form interaction
      await user.type(screen.getByTestId('nested-name'), 'John Doe');
      await user.type(screen.getByTestId('nested-email'), 'john@example.com');
      await user.type(screen.getByTestId('nested-street'), '123 Main St');
      await user.type(screen.getByTestId('nested-city'), 'Anytown');

      expect(screen.getByTestId('nested-name')).toHaveValue('John Doe');
      expect(screen.getByTestId('nested-email')).toHaveValue(
        'john@example.com',
      );
      expect(screen.getByTestId('nested-street')).toHaveValue('123 Main St');
      expect(screen.getByTestId('nested-city')).toHaveValue('Anytown');
    });
  });

  describe('边缘情况处理', () => {
    it('handles empty form gracefully', async () => {
      render(
        <form data-testid='empty-form'>
          <Label>Empty Form Label</Label>
        </form>,
      );

      expect(screen.getByTestId('empty-form')).toBeInTheDocument();
      expect(screen.getByText('Empty Form Label')).toBeInTheDocument();
    });

    it('handles form with only labels', async () => {
      render(
        <form>
          <Label>Label 1</Label>
          <Label>Label 2</Label>
          <Label>Label 3</Label>
        </form>,
      );

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
    });
  });
});
