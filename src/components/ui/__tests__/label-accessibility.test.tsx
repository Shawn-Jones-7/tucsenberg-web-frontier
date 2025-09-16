/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label - Accessibility', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('supports aria attributes', () => {
    render(
      <Label
        aria-label='Accessible label'
        aria-describedby='description'
        data-testid='aria-label'
      >
        ARIA Label
      </Label>,
    );

    const label = screen.getByTestId('aria-label');
    expect(label).toHaveAttribute('aria-label', 'Accessible label');
    expect(label).toHaveAttribute('aria-describedby', 'description');
  });

  it('supports aria-required for required fields', () => {
    render(
      <Label
        aria-required='true'
        htmlFor='required-input'
      >
        Required Field
      </Label>,
    );

    const label = screen.getByText('Required Field');
    expect(label).toHaveAttribute('aria-required', 'true');
  });

  it('supports aria-invalid for error states', () => {
    render(
      <Label
        aria-invalid='true'
        htmlFor='error-input'
      >
        Error Field
      </Label>,
    );

    const label = screen.getByText('Error Field');
    expect(label).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports aria-labelledby for complex labeling', () => {
    render(
      <div>
        <Label
          id='label-1'
          aria-labelledby='label-2'
        >
          Primary Label
        </Label>
        <Label id='label-2'>Secondary Label</Label>
      </div>,
    );

    const primaryLabel = screen.getByText('Primary Label');
    expect(primaryLabel).toHaveAttribute('aria-labelledby', 'label-2');
  });

  it('supports screen reader text', () => {
    render(
      <Label data-testid='sr-label'>
        Visible text
        <span className='sr-only'>Screen reader only text</span>
      </Label>,
    );

    const label = screen.getByTestId('sr-label');
    expect(label).toHaveTextContent('Visible textScreen reader only text');
  });

  it('handles keyboard navigation', async () => {
    const handleKeyDown = vi.fn();
    render(
      <Label
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        Keyboard Label
      </Label>,
    );

    const label = screen.getByText('Keyboard Label');
    label.focus();

    await user.keyboard('{Enter}');
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('supports high contrast mode', () => {
    render(
      <Label
        className='high-contrast'
        data-testid='contrast-label'
      >
        High Contrast Label
      </Label>,
    );

    const label = screen.getByTestId('contrast-label');
    expect(label).toHaveClass('high-contrast');
  });

  it('supports reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<Label data-testid='motion-label'>Reduced Motion Label</Label>);

    const label = screen.getByTestId('motion-label');
    expect(label).toBeInTheDocument();
  });

  it('provides proper focus indicators', async () => {
    render(
      <Label
        tabIndex={0}
        data-testid='focusable-label'
      >
        Focusable Label
      </Label>,
    );

    const label = screen.getByTestId('focusable-label');

    await user.tab();
    expect(label).toHaveFocus();
  });

  it('supports touch targets for mobile', () => {
    render(
      <Label
        style={{ minHeight: '44px', minWidth: '44px' }}
        data-testid='touch-label'
      >
        Touch Target
      </Label>,
    );

    const label = screen.getByTestId('touch-label');
    expect(label).toHaveStyle('min-height: 44px');
    expect(label).toHaveStyle('min-width: 44px');
  });

  it('handles focus management with associated inputs', async () => {
    render(
      <div>
        <Label
          htmlFor='focus-input'
          tabIndex={0}
        >
          Focus Label
        </Label>
        <input
          id='focus-input'
          type='text'
        />
      </div>,
    );

    const label = screen.getByText('Focus Label');
    const input = screen.getByRole('textbox');

    // Focus label first
    label.focus();
    expect(label).toHaveFocus();

    // Click label should focus input
    await user.click(label);
    expect(input).toHaveFocus();
  });

  it('supports role attribute for semantic meaning', () => {
    render(
      <Label
        role='heading'
        aria-level={2}
      >
        Heading Label
      </Label>,
    );

    const label = screen.getByRole('heading', { level: 2 });
    expect(label).toBeInTheDocument();
  });

  it('handles complex accessibility scenarios', () => {
    render(
      <div>
        <Label
          htmlFor='complex-input'
          aria-describedby='help-text error-text'
          aria-required='true'
          data-testid='complex-label'
        >
          Complex Field
        </Label>
        <input
          id='complex-input'
          type='text'
          aria-invalid='true'
        />
        <div id='help-text'>Help text</div>
        <div id='error-text'>Error message</div>
      </div>,
    );

    const label = screen.getByTestId('complex-label');
    expect(label).toHaveAttribute('aria-describedby', 'help-text error-text');
    expect(label).toHaveAttribute('aria-required', 'true');
  });

  it('supports WCAG compliance features', () => {
    render(
      <Label
        className='text-lg font-semibold'
        style={{ lineHeight: '1.5' }}
        data-testid='wcag-label'
      >
        WCAG Compliant Label
      </Label>,
    );

    const label = screen.getByTestId('wcag-label');
    expect(label).toHaveClass('text-lg', 'font-semibold');
    expect(label).toHaveStyle('line-height: 1.5');
  });

  it('handles assistive technology announcements', () => {
    render(
      <Label
        aria-live='polite'
        aria-atomic='true'
        data-testid='live-label'
      >
        Live Region Label
      </Label>,
    );

    const label = screen.getByTestId('live-label');
    expect(label).toHaveAttribute('aria-live', 'polite');
    expect(label).toHaveAttribute('aria-atomic', 'true');
  });

  it('supports internationalization attributes', () => {
    render(
      <Label
        lang='en'
        dir='ltr'
        data-testid='i18n-label'
      >
        International Label
      </Label>,
    );

    const label = screen.getByTestId('i18n-label');
    expect(label).toHaveAttribute('lang', 'en');
    expect(label).toHaveAttribute('dir', 'ltr');
  });
});
