/**
 * @vitest-environment jsdom
 */

/**
 * Label Integration Tests - Index
 *
 * Basic integration tests for the Label component.
 * For comprehensive testing, see:
 * - label-form-integration.test.tsx - Form integration tests
 * - label-validation-scenarios.test.tsx - Validation scenarios tests
 * - label-component-composition.test.tsx - Component composition tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Integration Tests - Index', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('integrates with basic form structure', async () => {
    render(
      <form>
        <div>
          <Label htmlFor='integration-name'>Name</Label>
          <input
            id='integration-name'
            type='text'
          />
        </div>
        <div>
          <Label htmlFor='integration-email'>Email</Label>
          <input
            id='integration-email'
            type='email'
          />
        </div>
      </form>,
    );

    const nameLabel = screen.getByText('Name');
    const emailLabel = screen.getByText('Email');
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');

    // Test label associations
    await user.click(nameLabel);
    expect(nameInput).toHaveFocus();

    await user.click(emailLabel);
    expect(emailInput).toHaveFocus();
  });

  it('works with multiple input types', () => {
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
          <Label htmlFor='textarea-input'>Textarea</Label>
          <textarea id='textarea-input' />
        </div>
        <div>
          <Label htmlFor='select-input'>Select</Label>
          <select id='select-input'>
            <option value='option1'>Option 1</option>
            <option value='option2'>Option 2</option>
          </select>
        </div>
      </form>,
    );

    expect(screen.getByLabelText('Text Input')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Input')).toBeInTheDocument();
    expect(screen.getByLabelText('Textarea')).toBeInTheDocument();
    expect(screen.getByLabelText('Select')).toBeInTheDocument();
  });

  it('handles label clicking for focus', async () => {
    render(
      <div>
        <Label htmlFor='clickable-input'>Clickable Label</Label>
        <input
          id='clickable-input'
          type='text'
        />
      </div>,
    );

    const label = screen.getByText('Clickable Label');
    const input = screen.getByLabelText('Clickable Label');

    expect(input).not.toHaveFocus();

    await user.click(label);
    expect(input).toHaveFocus();
  });

  it('works with nested components', () => {
    const FormGroup = ({ children }: { children: React.ReactNode }) => (
      <div className='form-group'>{children}</div>
    );

    render(
      <FormGroup>
        <Label htmlFor='nested-input'>Nested Input</Label>
        <input
          id='nested-input'
          type='text'
        />
      </FormGroup>,
    );

    const label = screen.getByText('Nested Input');
    const input = screen.getByLabelText('Nested Input');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label.closest('.form-group')).toBeInTheDocument();
  });

  it('supports conditional rendering', () => {
    const ConditionalForm = ({ showField }: { showField: boolean }) => (
      <form>
        <div>
          <Label htmlFor='always-visible'>Always Visible</Label>
          <input
            id='always-visible'
            type='text'
          />
        </div>
        {showField && (
          <div>
            <Label htmlFor='conditional-field'>Conditional Field</Label>
            <input
              id='conditional-field'
              type='text'
            />
          </div>
        )}
      </form>
    );

    const { rerender } = render(<ConditionalForm showField={false} />);

    expect(screen.getByText('Always Visible')).toBeInTheDocument();
    expect(screen.queryByText('Conditional Field')).not.toBeInTheDocument();

    rerender(<ConditionalForm showField={true} />);

    expect(screen.getByText('Always Visible')).toBeInTheDocument();
    expect(screen.getByText('Conditional Field')).toBeInTheDocument();
  });

  it('handles dynamic content', () => {
    const DynamicForm = ({ prefix }: { prefix: string }) => (
      <div>
        <Label htmlFor='dynamic-input'>{prefix} Input</Label>
        <input
          id='dynamic-input'
          type='text'
        />
      </div>
    );

    const { rerender } = render(<DynamicForm prefix='First' />);

    expect(screen.getByText('First Input')).toBeInTheDocument();

    rerender(<DynamicForm prefix='Second' />);

    expect(screen.getByText('Second Input')).toBeInTheDocument();
    expect(screen.queryByText('First Input')).not.toBeInTheDocument();
  });

  it('works with form validation states', () => {
    render(
      <form>
        <div>
          <Label
            htmlFor='required-input'
            className='required'
          >
            Required Field *
          </Label>
          <input
            id='required-input'
            type='text'
            required
          />
        </div>
        <div>
          <Label htmlFor='optional-input'>Optional Field</Label>
          <input
            id='optional-input'
            type='text'
          />
        </div>
      </form>,
    );

    const requiredLabel = screen.getByText('Required Field *');
    const requiredInput = screen.getByLabelText('Required Field *');
    const optionalInput = screen.getByLabelText('Optional Field');

    expect(requiredLabel).toHaveClass('required');
    expect(requiredInput).toBeRequired();
    expect(optionalInput).not.toBeRequired();
  });

  it('supports accessibility features', () => {
    render(
      <form>
        <div>
          <Label htmlFor='accessible-input'>Accessible Input</Label>
          <input
            id='accessible-input'
            type='text'
            aria-describedby='input-help'
          />
          <div id='input-help'>This is help text for the input</div>
        </div>
      </form>,
    );

    const input = screen.getByLabelText('Accessible Input');
    const helpText = screen.getByText('This is help text for the input');

    expect(input).toHaveAttribute('aria-describedby', 'input-help');
    expect(helpText).toHaveAttribute('id', 'input-help');
  });

  it('works with controlled components', async () => {
    const ControlledInput = () => {
      const [value, setValue] = React.useState('');

      return (
        <div>
          <Label htmlFor='controlled-input'>Controlled Input</Label>
          <input
            id='controlled-input'
            type='text'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div data-testid='current-value'>{value}</div>
        </div>
      );
    };

    render(<ControlledInput />);

    const input = screen.getByLabelText('Controlled Input');
    const valueDisplay = screen.getByTestId('current-value');

    await user.type(input, 'test');

    expect(input).toHaveValue('test');
    expect(valueDisplay).toHaveTextContent('test');
  });

  it('supports custom styling and classes', () => {
    render(
      <div>
        <Label
          htmlFor='styled-input'
          className='custom-label-class'
        >
          Styled Label
        </Label>
        <input
          id='styled-input'
          type='text'
        />
      </div>,
    );

    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('custom-label-class');
  });
});
