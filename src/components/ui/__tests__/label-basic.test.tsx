/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label - Basic Rendering', () => {
  describe('Basic Rendering', () => {
    it('renders label with default props', () => {
      render(<Label>Label Text</Label>);

      const label = screen.getByText('Label Text');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('applies default classes', () => {
      render(<Label data-testid='label'>Label Text</Label>);

      const label = screen.getByTestId('label');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'leading-none',
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-70',
      );
    });

    it('renders as label element by default', () => {
      render(<Label>Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label.tagName).toBe('LABEL');
    });

    it('renders with correct default attributes', () => {
      render(<Label data-testid='label'>Test Label</Label>);

      const label = screen.getByTestId('label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Test Label');
    });

    it('handles empty content gracefully', () => {
      render(<Label data-testid='empty-label'></Label>);

      const label = screen.getByTestId('empty-label');
      expect(label).toBeInTheDocument();
      expect(label).toBeEmptyDOMElement();
    });

    it('renders with minimal props', () => {
      render(<Label>Minimal</Label>);

      const label = screen.getByText('Minimal');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Label
          className='custom-class'
          data-testid='label'
        >
          Custom Label
        </Label>,
      );

      const label = screen.getByTestId('label');
      expect(label).toHaveClass('custom-class');
      expect(label).toHaveClass('text-sm'); // Should still have default classes
    });

    it('supports custom id', () => {
      render(<Label id='custom-id'>ID Label</Label>);

      const label = screen.getByText('ID Label');
      expect(label).toHaveAttribute('id', 'custom-id');
    });

    it('supports custom data attributes', () => {
      render(
        <Label
          data-testid='data-label'
          data-custom='value'
        >
          Data Label
        </Label>,
      );

      const label = screen.getByTestId('data-label');
      expect(label).toHaveAttribute('data-custom', 'value');
    });

    it('supports custom style', () => {
      const customStyle = { color: 'red', fontSize: '16px' };
      render(
        <Label
          style={customStyle}
          data-testid='styled-label'
        >
          Styled Label
        </Label>,
      );

      const label = screen.getByTestId('styled-label');
      expect(label).toHaveStyle('color: red');
      expect(label).toHaveStyle('font-size: 16px');
    });

    it('supports title attribute', () => {
      render(<Label title='Tooltip text'>Hover Label</Label>);

      const label = screen.getByText('Hover Label');
      expect(label).toHaveAttribute('title', 'Tooltip text');
    });

    it('supports tabIndex', () => {
      render(<Label tabIndex={0}>Focusable Label</Label>);

      const label = screen.getByText('Focusable Label');
      expect(label).toHaveAttribute('tabIndex', '0');
    });

    it('supports role attribute', () => {
      render(<Label role='button'>Button Label</Label>);

      const label = screen.getByText('Button Label');
      expect(label).toHaveAttribute('role', 'button');
    });

    it('merges multiple classNames correctly', () => {
      render(
        <Label
          className='class1 class2'
          data-testid='multi-class'
        >
          Multi Class
        </Label>,
      );

      const label = screen.getByTestId('multi-class');
      expect(label).toHaveClass('class1', 'class2', 'text-sm');
    });

    it('handles undefined className gracefully', () => {
      render(
        <Label
          className={undefined}
          data-testid='undefined-class'
        >
          Undefined Class
        </Label>,
      );

      const label = screen.getByTestId('undefined-class');
      expect(label).toHaveClass('text-sm'); // Should still have default classes
    });

    it('supports all standard HTML label attributes', () => {
      render(
        <Label
          htmlFor='input-id'
          form='form-id'
          accessKey='l'
          data-testid='full-attrs'
        >
          Full Attributes
        </Label>,
      );

      const label = screen.getByTestId('full-attrs');
      expect(label).toHaveAttribute('for', 'input-id');
      expect(label).toHaveAttribute('form', 'form-id');
      expect(label).toHaveAttribute('accessKey', 'l');
    });
  });

  describe('Content Rendering', () => {
    it('renders text content', () => {
      render(<Label>Simple Text</Label>);

      const label = screen.getByText('Simple Text');
      expect(label).toHaveTextContent('Simple Text');
    });

    it('renders with React elements as children', () => {
      render(
        <Label data-testid='element-label'>
          <span>Nested Element</span>
        </Label>,
      );

      const label = screen.getByTestId('element-label');
      const span = screen.getByText('Nested Element');
      expect(label).toContainElement(span);
    });

    it('renders with multiple children', () => {
      render(
        <Label data-testid='multi-children'>
          <span>First</span>
          <span>Second</span>
        </Label>,
      );

      const label = screen.getByTestId('multi-children');
      expect(label).toContainElement(screen.getByText('First'));
      expect(label).toContainElement(screen.getByText('Second'));
    });

    it('renders with mixed content', () => {
      render(
        <Label data-testid='mixed-content'>
          Text before <strong>bold text</strong> text after
        </Label>,
      );

      const label = screen.getByTestId('mixed-content');
      expect(label).toHaveTextContent('Text before bold text text after');
      expect(label).toContainElement(screen.getByText('bold text'));
    });

    it('renders with complex nested structure', () => {
      render(
        <Label data-testid='complex-structure'>
          <div>
            <span>Nested</span>
            <div>
              <em>Deep nesting</em>
            </div>
          </div>
        </Label>,
      );

      const label = screen.getByTestId('complex-structure');
      expect(label).toContainElement(screen.getByText('Nested'));
      expect(label).toContainElement(screen.getByText('Deep nesting'));
    });

    it('handles special characters in content', () => {
      const specialText = 'Label with & < > " \' characters';
      render(<Label>{specialText}</Label>);

      const label = screen.getByText(specialText);
      expect(label).toHaveTextContent(specialText);
    });

    it('renders with numeric content', () => {
      render(<Label>{123}</Label>);

      const label = screen.getByText('123');
      expect(label).toHaveTextContent('123');
    });

    it('renders with boolean content converted to string', () => {
      render(<Label>{String(true)}</Label>);

      const label = screen.getByText('true');
      expect(label).toHaveTextContent('true');
    });

    it('handles null and undefined children gracefully', () => {
      render(
        <Label data-testid='null-children'>
          {null}
          {undefined}
          Valid text
        </Label>,
      );

      const label = screen.getByTestId('null-children');
      expect(label).toHaveTextContent('Valid text');
    });

    it('renders with conditional content', () => {
      const showExtra = true;
      render(
        <Label data-testid='conditional'>
          Base text
          {showExtra && <span> Extra content</span>}
        </Label>,
      );

      const label = screen.getByTestId('conditional');
      expect(label).toHaveTextContent('Base text Extra content');
    });

    it('preserves whitespace in content', () => {
      render(<Label>{'  Spaced  content  '}</Label>);

      const label = screen.getByText(/Spaced\s+content/);
      expect(label).toBeInTheDocument();
    });

    it('renders with line breaks', () => {
      render(
        <Label data-testid='line-breaks'>
          Line 1<br />
          Line 2
        </Label>,
      );

      const label = screen.getByTestId('line-breaks');
      expect(label).toContainHTML('Line 1<br>Line 2');
    });

    it('renders with HTML entities', () => {
      render(<Label data-testid='entities'>&amp; &lt; &gt;</Label>);

      const label = screen.getByTestId('entities');
      expect(label).toHaveTextContent('& < >');
    });
  });
});
