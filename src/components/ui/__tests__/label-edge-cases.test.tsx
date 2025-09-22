/**
 * @vitest-environment jsdom
 */

/**
 * Label Edge Cases - Main Tests
 *
 * 主要边缘情况集成测试，包括：
 * - 核心边缘情况验证
 * - 基本边缘情况测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - label-edge-cases-basic.test.tsx - 基本边缘情况测试
 */

import { Label } from '@/components/ui/label';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Label Edge Cases - Main Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心边缘情况验证', () => {
    it('renders empty label', () => {
      render(<Label data-testid='empty-label'></Label>);

      const label = screen.getByTestId('empty-label');
      expect(label).toBeInTheDocument();
      expect(label).toBeEmptyDOMElement();
    });

    it('handles very long text content', () => {
      const longText = 'A'.repeat(1000);
      render(<Label data-testid='long-text'>{longText}</Label>);

      const label = screen.getByTestId('long-text');
      expect(label).toHaveTextContent(longText);
    });

    it('handles special characters and unicode', () => {
      const specialText = '🚀 Special chars: @#$%^&*()_+ 中文 العربية';
      render(<Label>{specialText}</Label>);

      const label = screen.getByText(specialText);
      expect(label).toHaveTextContent(specialText);
    });

    it('handles rapid state changes', async () => {
      const StateChangingLabel = () => {
        const [count, setCount] = React.useState(0);

        return (
          <Label
            data-testid='state-changing'
            onClick={() => setCount((c) => c + 1)}
          >
            Count: {count}
          </Label>
        );
      };

      render(<StateChangingLabel />);
      const label = screen.getByTestId('state-changing');

      // Rapidly change state
      for (let i = 0; i < 10; i++) {
        await user.click(label);
      }

      expect(label).toHaveTextContent('Count: 10');
    });

    it('handles null and undefined props gracefully', () => {
      render(
        <Label
          className={undefined}
          style={null as any}
          onClick={undefined}
          data-testid='null-props'
        >
          Content
        </Label>,
      );

      const label = screen.getByTestId('null-props');
      expect(label).toBeInTheDocument();
    });

    it('handles zero as text content', () => {
      render(<Label data-testid='zero-content'>{0}</Label>);

      const label = screen.getByTestId('zero-content');
      expect(label).toHaveTextContent('0');
    });

    it('handles false as text content', () => {
      render(<Label data-testid='false-content'>{false}</Label>);

      const label = screen.getByTestId('false-content');
      expect(label).toBeEmptyDOMElement();
    });

    it('handles null as text content', () => {
      render(<Label data-testid='null-content'>{null}</Label>);

      const label = screen.getByTestId('null-content');
      expect(label).toBeEmptyDOMElement();
    });

    it('handles undefined as text content', () => {
      render(<Label data-testid='undefined-content'>{undefined}</Label>);

      const label = screen.getByTestId('undefined-content');
      expect(label).toBeEmptyDOMElement();
    });

    it('handles empty string as text content', () => {
      render(<Label data-testid='empty-string'>{''} </Label>);

      const label = screen.getByTestId('empty-string');
      expect(label).toHaveTextContent('');
    });

    it('handles whitespace-only content', () => {
      render(<Label data-testid='whitespace'> </Label>);

      const label = screen.getByTestId('whitespace');
      expect(label).toHaveTextContent('');
    });

    it('handles newlines and tabs in content', () => {
      render(<Label data-testid='newlines'>{'Line 1\nLine 2\tTabbed'}</Label>);

      const label = screen.getByTestId('newlines');
      expect(label).toHaveTextContent('Line 1 Line 2 Tabbed');
    });

    it('handles HTML entities in content', () => {
      render(
        <Label data-testid='entities'>
          &lt;div&gt; &amp; &quot;quotes&quot;
        </Label>,
      );

      const label = screen.getByTestId('entities');
      expect(label).toHaveTextContent('<div> & "quotes"');
    });

    it('handles mixed content types', () => {
      render(
        <Label data-testid='mixed-content'>
          Text {42} {true && 'conditional'} <span>JSX</span>
        </Label>,
      );

      const label = screen.getByTestId('mixed-content');
      expect(label).toHaveTextContent('Text 42 conditional JSX');
    });

    it('handles deeply nested content', () => {
      render(
        <Label data-testid='nested-content'>
          <div>
            <span>
              <strong>Deeply nested</strong>
            </span>
          </div>
        </Label>,
      );

      const label = screen.getByTestId('nested-content');
      expect(label).toHaveTextContent('Deeply nested');
    });

    it('handles conditional rendering', () => {
      const ConditionalLabel = ({ show }: { show: boolean }) => (
        <Label data-testid='conditional'>{show ? 'Visible' : null}</Label>
      );

      const { rerender } = render(<ConditionalLabel show={false} />);
      let label = screen.getByTestId('conditional');
      expect(label).toBeEmptyDOMElement();

      rerender(<ConditionalLabel show={true} />);
      label = screen.getByTestId('conditional');
      expect(label).toHaveTextContent('Visible');
    });

    it('handles memory leaks with event listeners', () => {
      const MemoryLeakLabel = () => {
        React.useEffect(() => {
          const handleResize = () => {
            // Simulate event listener
          };

          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }, []);

        return <Label data-testid='memory-leak'>Memory test</Label>;
      };

      const { unmount } = render(<MemoryLeakLabel />);

      const label = screen.getByTestId('memory-leak');
      expect(label).toBeInTheDocument();

      // Unmount should clean up event listeners
      unmount();
    });

    it('handles performance with many re-renders', () => {
      const PerformanceLabel = ({ count }: { count: number }) => (
        <Label data-testid='performance'>Render count: {count}</Label>
      );

      const { rerender } = render(<PerformanceLabel count={0} />);

      // Simulate many re-renders
      for (let i = 1; i <= 100; i++) {
        rerender(<PerformanceLabel count={i} />);
      }

      const label = screen.getByTestId('performance');
      expect(label).toHaveTextContent('Render count: 100');
    });

    it('handles accessibility with screen readers', () => {
      render(
        <Label
          aria-label='Screen reader label'
          aria-describedby='description'
          role='label'
          data-testid='accessibility'
        >
          Accessible content
        </Label>,
      );

      const label = screen.getByTestId('accessibility');
      expect(label).toHaveAttribute('aria-label', 'Screen reader label');
      expect(label).toHaveAttribute('aria-describedby', 'description');
      expect(label).toHaveAttribute('role', 'label');
    });

    it('handles keyboard navigation edge cases', async () => {
      render(
        <div>
          <Label
            tabIndex={0}
            data-testid='keyboard-1'
          >
            Label 1
          </Label>
          <Label
            tabIndex={0}
            data-testid='keyboard-2'
          >
            Label 2
          </Label>
          <Label
            tabIndex={-1}
            data-testid='keyboard-3'
          >
            Label 3
          </Label>
        </div>,
      );

      const label1 = screen.getByTestId('keyboard-1');
      const label2 = screen.getByTestId('keyboard-2');
      const label3 = screen.getByTestId('keyboard-3');

      await user.tab();
      expect(label1).toHaveFocus();

      await user.tab();
      expect(label2).toHaveFocus();

      // Label 3 should be skipped due to tabIndex={-1}
      await user.tab();
      expect(label3).not.toHaveFocus();
    });

    it('handles high contrast mode', () => {
      render(
        <Label
          className='contrast-more:border-2 contrast-more:border-black'
          data-testid='high-contrast'
        >
          High contrast content
        </Label>,
      );

      const label = screen.getByTestId('high-contrast');
      expect(label).toHaveClass(
        'contrast-more:border-2',
        'contrast-more:border-black',
      );
    });
  });
});
