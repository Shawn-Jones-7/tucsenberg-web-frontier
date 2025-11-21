/**
 * @vitest-environment jsdom
 */

/**
 * Label Event Handling - Main Tests
 *
 * 主要事件处理集成测试，包括：
 * - 核心事件处理功能验证
 * - 基本事件处理测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - label-event-handling-basic.test.tsx - 基本事件处理功能测试
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Event Handling - Main Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心事件处理功能验证', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(
        <Label
          onClick={handleClick}
          data-testid='clickable-label'
        >
          Clickable Label
        </Label>,
      );

      const label = screen.getByTestId('clickable-label');
      await user.click(label);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles double click events', async () => {
      const handleDoubleClick = vi.fn();
      render(
        <Label
          onDoubleClick={handleDoubleClick}
          data-testid='double-click-label'
        >
          Double Click Label
        </Label>,
      );

      const label = screen.getByTestId('double-click-label');
      await user.dblClick(label);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events', async () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      const handleMouseOver = vi.fn();
      const handleMouseOut = vi.fn();

      render(
        <Label
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          data-testid='mouse-label'
        >
          Mouse Label
        </Label>,
      );

      const label = screen.getByTestId('mouse-label');

      await user.hover(label);
      expect(handleMouseEnter).toHaveBeenCalled();
      expect(handleMouseOver).toHaveBeenCalled();

      await user.unhover(label);
      expect(handleMouseLeave).toHaveBeenCalled();
      expect(handleMouseOut).toHaveBeenCalled();
    });

    it('handles keyboard events', async () => {
      const handleKeyDown = vi.fn();
      const handleKeyUp = vi.fn();
      const handleKeyPress = vi.fn();

      render(
        <Label
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onKeyPress={handleKeyPress}
          tabIndex={0}
          data-testid='keyboard-label'
        >
          Keyboard Label
        </Label>,
      );

      const label = screen.getByTestId('keyboard-label');
      label.focus();
      await user.keyboard('{Enter}');

      expect(handleKeyDown).toHaveBeenCalled();
      expect(handleKeyUp).toHaveBeenCalled();
    });

    it('handles focus events', async () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Label
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
          data-testid='focus-label'
        >
          Focus Label
        </Label>,
      );

      const label = screen.getByTestId('focus-label');
      await user.click(label);
      expect(handleFocus).toHaveBeenCalled();

      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    it('handles context menu events', async () => {
      const handleContextMenu = vi.fn();
      render(
        <Label
          onContextMenu={handleContextMenu}
          data-testid='context-label'
        >
          Context Menu Label
        </Label>,
      );

      const label = screen.getByTestId('context-label');
      await user.pointer({ keys: '[MouseRight]', target: label });

      expect(handleContextMenu).toHaveBeenCalled();
    });
  });

  describe('基本事件处理测试', () => {
    it('prevents event propagation when needed', async () => {
      const parentClick = vi.fn();
      const labelClick = vi.fn((_e: React.MouseEvent) => {
        _e.stopPropagation();
      });

      render(
        <div onClick={parentClick}>
          <Label
            onClick={labelClick}
            data-testid='propagation-label'
          >
            Propagation Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('propagation-label');
      await user.click(label);

      expect(labelClick).toHaveBeenCalled();
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('handles event with associated input', async () => {
      const handleLabelClick = vi.fn();
      const handleInputFocus = vi.fn();

      render(
        <div>
          <Label
            htmlFor='test-input'
            onClick={handleLabelClick}
          >
            Test Label
          </Label>
          <input
            id='test-input'
            onFocus={handleInputFocus}
          />
        </div>,
      );

      const label = screen.getByText('Test Label');
      await user.click(label);

      expect(handleLabelClick).toHaveBeenCalled();
      expect(handleInputFocus).toHaveBeenCalled();
    });

    it('handles custom event handlers', async () => {
      const customHandler = vi.fn();

      render(
        <Label
          data-testid='custom-event'
          onClick={(e: any) => customHandler('click', e.currentTarget)}
        >
          Custom Event Label
        </Label>,
      );

      const label = screen.getByTestId('custom-event');
      await user.click(label);

      expect(customHandler).toHaveBeenCalledWith('click', label);
    });

    it('handles multiple event handlers on same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      render(
        <Label
          data-testid='multiple-handlers'
          onClick={(_e: any) => {
            handler1();
            handler2();
          }}
        >
          Multiple Handlers Label
        </Label>,
      );

      const label = screen.getByTestId('multiple-handlers');
      await user.click(label);

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('handles event with preventDefault', async () => {
      const handleClick = vi.fn((e: React.MouseEvent) => {
        e.preventDefault();
      });

      render(
        <Label
          onClick={handleClick}
          data-testid='prevent-default-label'
        >
          Prevent Default Label
        </Label>,
      );

      const label = screen.getByTestId('prevent-default-label');
      await user.click(label);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('错误处理验证', () => {
    it('handles composition events', async () => {
      const handleCompositionStart = vi.fn();
      const handleCompositionEnd = vi.fn();

      render(
        <Label
          contentEditable
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          data-testid='composition-label'
        >
          Composition Label
        </Label>,
      );

      const label = screen.getByTestId('composition-label');
      expect(label).toHaveAttribute('contentEditable', 'true');
    });

    it('handles event bubbling correctly', async () => {
      const grandparentClick = vi.fn();
      const parentClick = vi.fn();
      const labelClick = vi.fn();

      render(
        <div onClick={grandparentClick}>
          <div onClick={parentClick}>
            <Label
              onClick={labelClick}
              data-testid='bubbling-label'
            >
              Bubbling Label
            </Label>
          </div>
        </div>,
      );

      const label = screen.getByTestId('bubbling-label');
      await user.click(label);

      expect(labelClick).toHaveBeenCalled();
      expect(parentClick).toHaveBeenCalled();
      expect(grandparentClick).toHaveBeenCalled();
    });

    it('handles event capturing', async () => {
      const captureHandler = vi.fn();
      const bubbleHandler = vi.fn();

      render(
        <div onClickCapture={captureHandler}>
          <Label
            onClick={bubbleHandler}
            data-testid='capture-label'
          >
            Capture Label
          </Label>
        </div>,
      );

      const label = screen.getByTestId('capture-label');
      await user.click(label);

      expect(captureHandler).toHaveBeenCalled();
      expect(bubbleHandler).toHaveBeenCalled();
    });
  });
});
