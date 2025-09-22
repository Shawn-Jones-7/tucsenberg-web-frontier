/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../dropdown-menu';

describe('DropdownMenu - Advanced Features', () => {
  describe('DropdownMenuSub Components', () => {
    it('renders sub menu', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid='sub-trigger'>
                Sub Menu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent data-testid='sub-content'>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const subTrigger = screen.getByTestId('sub-trigger');
      expect(subTrigger).toBeInTheDocument();
      expect(subTrigger).toHaveTextContent('Sub Menu');
    });

    it('applies default classes to sub trigger', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid='sub-trigger'>
                Sub Menu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const subTrigger = screen.getByTestId('sub-trigger');
      expect(subTrigger).toHaveClass(
        'flex',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'px-2',
        'py-1.5',
        'text-sm',
        'outline-hidden',
      );
    });

    it('supports inset prop on sub trigger', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                inset
                data-testid='sub-trigger'
              >
                Inset Sub Menu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const subTrigger = screen.getByTestId('sub-trigger');
      expect(subTrigger).toHaveAttribute('data-inset', 'true');
      // 验证条件类是否存在
      expect(subTrigger).toHaveClass('data-[inset]:pl-8');
    });

    it('applies custom className to sub components', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className='custom-sub-trigger'
                data-testid='sub-trigger'
              >
                Sub Menu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className='custom-sub-content'
                data-testid='sub-content'
              >
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const subTrigger = screen.getByTestId('sub-trigger');
      expect(subTrigger).toHaveClass('custom-sub-trigger');
    });

    it('renders nested sub menus', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid='sub-trigger-1'>
                Level 1
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger data-testid='sub-trigger-2'>
                    Level 2
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem data-testid='nested-item'>
                      Nested Item
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const subTrigger1 = screen.getByTestId('sub-trigger-1');
      expect(subTrigger1).toBeInTheDocument();
      expect(subTrigger1).toHaveTextContent('Level 1');

      // 嵌套的子菜单内容默认不会渲染，只有在交互后才显示
      // 所以我们只验证第一级子菜单触发器存在
    });
  });
});
