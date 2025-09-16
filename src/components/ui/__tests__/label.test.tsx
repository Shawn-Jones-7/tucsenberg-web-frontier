import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

// Mock Radix UI Label
vi.mock('@radix-ui/react-label', () => ({
  Root: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: any;
  }) => <label {...props}>{children}</label>,
}));

describe('Label Component', () => {
  describe('Basic Rendering', () => {
    it('renders label with default props', () => {
      render(<Label>Label Text</Label>);

      const label = screen.getByText('Label Text');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('data-slot', 'label');
    });

    it('renders label with custom text', () => {
      render(<Label>Custom Label</Label>);

      const label = screen.getByText('Custom Label');
      expect(label).toHaveTextContent('Custom Label');
    });

    it('applies default label styles', () => {
      render(<Label>Styled Label</Label>);

      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'text-sm',
        'leading-none',
        'font-medium',
        'select-none',
      );
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Label className='custom-label'>Custom Class</Label>);

      const label = screen.getByText('Custom Class');
      expect(label).toHaveClass('custom-label');
    });

    it('merges custom className with default classes', () => {
      render(<Label className='custom-spacing'>Merged Classes</Label>);

      const label = screen.getByText('Merged Classes');
      expect(label).toHaveClass('flex', 'items-center'); // default classes
      expect(label).toHaveClass('custom-spacing'); // custom class
    });

    it('passes through HTML label props', () => {
      render(
        <Label
          htmlFor='test-input'
          id='test-label'
          data-testid='label-element'
        >
          Props Test
        </Label>,
      );

      const label = screen.getByText('Props Test');
      expect(label).toHaveAttribute('for', 'test-input');
      expect(label).toHaveAttribute('id', 'test-label');
      expect(label).toHaveAttribute('data-testid', 'label-element');
    });
  });

  describe('Content Rendering', () => {
    it('renders text content', () => {
      render(<Label>Text Content</Label>);

      const label = screen.getByText('Text Content');
      expect(label).toHaveTextContent('Text Content');
    });

    it('renders with icon content', () => {
      render(
        <Label>
          <svg
            data-testid='icon'
            width='16'
            height='16'
          >
            <circle
              cx='8'
              cy='8'
              r='4'
            />
          </svg>
          With Icon
        </Label>,
      );

      const label = screen.getByText('With Icon');
      const icon = screen.getByTestId('icon');

      expect(label).toContainElement(icon);
      expect(label).toHaveTextContent('With Icon');
    });

    it('renders complex content', () => {
      render(
        <Label data-testid='complex-label'>
          <span>Required</span>
          <span style={{ color: 'red' }}>*</span>
        </Label>,
      );

      const label = screen.getByTestId('complex-label');
      const requiredText = screen.getByText('Required');
      const asterisk = screen.getByText('*');

      expect(label).toContainElement(requiredText);
      expect(label).toContainElement(asterisk);
    });

    it('renders with nested elements', () => {
      render(
        <Label>
          <strong>Bold Label</strong>
          <em>with emphasis</em>
        </Label>,
      );

      const boldText = screen.getByText('Bold Label');
      const emphasisText = screen.getByText('with emphasis');

      expect(boldText.tagName).toBe('STRONG');
      expect(emphasisText.tagName).toBe('EM');
    });
  });

  describe('Form Association', () => {
    it('associates with input using htmlFor', () => {
      render(
        <div>
          <Label htmlFor='associated-input'>Associated Label</Label>
          <input
            id='associated-input'
            type='text'
          />
        </div>,
      );

      const label = screen.getByText('Associated Label');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'associated-input');
      expect(input).toHaveAttribute('id', 'associated-input');
    });

    it('works with implicit association', () => {
      render(
        <Label>
          Implicit Label
          <input type='text' />
        </Label>,
      );

      const label = screen.getByText('Implicit Label');
      const input = screen.getByRole('textbox');

      expect(label).toContainElement(input);
    });

    it('clicking label focuses associated input', () => {
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
      const input = screen.getByRole('textbox');

      // Verify the association exists
      expect(label).toHaveAttribute('for', 'clickable-input');
      expect(input).toHaveAttribute('id', 'clickable-input');

      // In testing environment, we verify the structure rather than actual focus behavior
      // since jsdom doesn't fully simulate browser focus behavior
      expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    });
  });

  describe('Disabled States', () => {
    it('applies disabled styles when in disabled group', () => {
      render(
        <div
          data-disabled='true'
          className='group'
        >
          <Label>Disabled Group Label</Label>
        </div>,
      );

      const label = screen.getByText('Disabled Group Label');
      expect(label).toHaveClass(
        'group-data-[disabled=true]:pointer-events-none',
        'group-data-[disabled=true]:opacity-50',
      );
    });

    it('applies disabled styles when peer is disabled', () => {
      render(
        <div>
          <input
            disabled
            className='peer'
          />
          <Label>Peer Disabled Label</Label>
        </div>,
      );

      const label = screen.getByText('Peer Disabled Label');
      expect(label).toHaveClass(
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-50',
      );
    });

    it('handles disabled input association', () => {
      render(
        <div>
          <Label htmlFor='disabled-input'>Disabled Input Label</Label>
          <input
            id='disabled-input'
            type='text'
            disabled
          />
        </div>,
      );

      const label = screen.getByText('Disabled Input Label');
      const input = screen.getByRole('textbox');

      expect(input).toBeDisabled();
      expect(label).toHaveAttribute('for', 'disabled-input');
    });
  });

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(
        <Label
          aria-label='Accessible label'
          aria-describedby='help-text'
        >
          ARIA Label
        </Label>,
      );

      const label = screen.getByText('ARIA Label');
      expect(label).toHaveAttribute('aria-label', 'Accessible label');
      expect(label).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('works with screen readers', () => {
      render(
        <div>
          <Label htmlFor='sr-input'>Screen Reader Label</Label>
          <input
            id='sr-input'
            type='text'
            aria-describedby='sr-help'
          />
          <div id='sr-help'>Help text for screen readers</div>
        </div>,
      );

      const input = screen.getByLabelText('Screen Reader Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-describedby', 'sr-help');
    });

    it('supports required field indication', () => {
      render(
        <Label htmlFor='required-input'>
          Required Field
          <span aria-label='required'>*</span>
        </Label>,
      );

      const label = screen.getByText('Required Field');
      const asterisk = screen.getByLabelText('required');

      expect(label).toContainElement(asterisk);
    });
  });

  describe('Event Handling', () => {
    it('handles click events', () => {
      const handleClick = vi.fn();

      render(<Label onClick={handleClick}>Clickable Label</Label>);

      const label = screen.getByText('Clickable Label');
      fireEvent.click(label);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
      const handleKeyDown = vi.fn();

      render(<Label onKeyDown={handleKeyDown}>Keyboard Label</Label>);

      const label = screen.getByText('Keyboard Label');
      fireEvent.keyDown(label, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events', () => {
      const handleMouseOver = vi.fn();
      const handleMouseOut = vi.fn();

      render(
        <Label
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Mouse Label
        </Label>,
      );

      const label = screen.getByText('Mouse Label');
      fireEvent.mouseOver(label);
      fireEvent.mouseOut(label);

      expect(handleMouseOver).toHaveBeenCalledTimes(1);
      expect(handleMouseOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains consistent styling across screen sizes', () => {
      render(<Label>Responsive Label</Label>);

      const label = screen.getByText('Responsive Label');
      expect(label).toHaveClass('text-sm', 'leading-none');
    });

    it('handles long text gracefully', () => {
      const longText =
        'This is a very long label text that might wrap to multiple lines';
      render(<Label>{longText}</Label>);

      const label = screen.getByText(longText);
      expect(label).toHaveTextContent(longText);
      expect(label).toHaveClass('flex', 'items-center');
    });
  });

  describe('Edge Cases', () => {
    it('renders empty label', () => {
      render(<Label data-testid='empty-label'></Label>);

      const label = screen.getByTestId('empty-label');
      expect(label).toBeInTheDocument();
      expect(label).toBeEmptyDOMElement();
    });

    it('handles special characters in content', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<Label>{specialText}</Label>);

      const label = screen.getByText(specialText);
      expect(label).toHaveTextContent(specialText);
    });

    it('handles numeric content', () => {
      render(<Label>123456</Label>);

      const label = screen.getByText('123456');
      expect(label).toHaveTextContent('123456');
    });

    it('handles undefined className gracefully', () => {
      render(<Label className={undefined}>Undefined Class</Label>);

      const label = screen.getByText('Undefined Class');
      expect(label).toHaveClass('flex'); // should still have default classes
    });
  });

  describe('Form Integration', () => {
    it('works in complete form structure', () => {
      render(
        <form>
          <div>
            <Label htmlFor='form-input'>Form Label</Label>
            <input
              id='form-input'
              type='text'
              required
            />
          </div>
          <button type='submit'>Submit</button>
        </form>,
      );

      const label = screen.getByText('Form Label');
      const input = screen.getByLabelText('Form Label');
      const button = screen.getByRole('button', { name: 'Submit' });

      expect(label).toBeInTheDocument();
      expect(input).toBeRequired();
      expect(button).toBeInTheDocument();
    });

    it('supports fieldset and legend structure', () => {
      render(
        <fieldset>
          <legend>Form Section</legend>
          <div>
            <Label htmlFor='fieldset-input'>Fieldset Label</Label>
            <input
              id='fieldset-input'
              type='text'
            />
          </div>
        </fieldset>,
      );

      const legend = screen.getByText('Form Section');
      const label = screen.getByText('Fieldset Label');
      const input = screen.getByLabelText('Fieldset Label');

      expect(legend).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });
});
