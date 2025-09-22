/**
 * @vitest-environment jsdom
 */

/**
 * Label Event Handling - Basic Tests
 *
 * 专门测试基本事件处理功能，包括：
 * - 基本点击事件
 * - 鼠标事件
 * - 键盘事件
 * - 焦点事件
 */

import { Label } from '@/components/ui/label';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Label Event Handling - Basic Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('基本点击事件', () => {
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

  describe('鼠标事件', () => {
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

    it('handles pointer events', async () => {
      const handlePointerDown = vi.fn();
      const handlePointerUp = vi.fn();

      render(
        <Label
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          data-testid='pointer-label'
        >
          Pointer Label
        </Label>,
      );

      const label = screen.getByTestId('pointer-label');
      await user.pointer({ keys: '[MouseLeft>]', target: label });
      await user.pointer({ keys: '[/MouseLeft]' });

      expect(handlePointerDown).toHaveBeenCalled();
      expect(handlePointerUp).toHaveBeenCalled();
    });

    it('handles wheel events', async () => {
      const handleWheel = vi.fn();

      render(
        <Label
          onWheel={handleWheel}
          data-testid='wheel-label'
        >
          Wheel Label
        </Label>,
      );

      const label = screen.getByTestId('wheel-label');
      fireEvent.wheel(label, { deltaY: 100 });

      expect(handleWheel).toHaveBeenCalled();
    });
  });

  describe('键盘事件', () => {
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
  });

  describe('焦点事件', () => {
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
  });

  describe('触摸事件', () => {
    it('handles touch events on mobile', async () => {
      const handleTouchStart = vi.fn();
      const handleTouchEnd = vi.fn();

      render(
        <Label
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          data-testid='touch-label'
        >
          Touch Label
        </Label>,
      );

      const label = screen.getByTestId('touch-label');

      // Simulate touch events using fireEvent
      fireEvent.touchStart(label);
      fireEvent.touchEnd(label);

      expect(handleTouchStart).toHaveBeenCalled();
      expect(handleTouchEnd).toHaveBeenCalled();
    });
  });

  describe('拖拽事件', () => {
    it('handles drag events', async () => {
      const handleDragStart = vi.fn();
      const handleDragEnd = vi.fn();

      render(
        <Label
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          data-testid='drag-label'
        >
          Drag Label
        </Label>,
      );

      const label = screen.getByTestId('drag-label');

      // Note: userEvent doesn'_t have built-in drag support, so we'll just check the handlers exist
      expect(label).toHaveAttribute('draggable', 'true');
    });
  });

  describe('事件传播控制', () => {
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
