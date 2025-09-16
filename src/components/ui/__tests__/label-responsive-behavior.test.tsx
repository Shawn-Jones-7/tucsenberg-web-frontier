/**
 * @vitest-environment jsdom
 */

/**
 * Label Responsive Behavior - Main Tests
 *
 * 主要响应式行为集成测试，包括：
 * - 核心响应式功能验证
 * - 基本响应式测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - label-responsive-basic.test.tsx - 基本响应式功能测试
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Responsive Behavior - Main Tests', () => {
  describe('核心响应式功能验证', () => {
    it('maintains consistent styling across screen sizes', () => {
      render(
        <Label
          className='text-sm md:text-base lg:text-lg'
          data-testid='responsive-label'
        >
          Responsive Label
        </Label>,
      );

      const label = screen.getByTestId('responsive-label');
      expect(label).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
    });

    it('handles responsive spacing', () => {
      render(
        <Label
          className='p-2 md:p-4 lg:p-6'
          data-testid='spacing-label'
        >
          Spacing Label
        </Label>,
      );

      const label = screen.getByTestId('spacing-label');
      expect(label).toHaveClass('p-2', 'md:p-4', 'lg:p-6');
    });

    it('adapts to container constraints', () => {
      render(
        <div style={{ width: '200px' }}>
          <Label
            className='w-full truncate'
            data-testid='constrained-label'
          >
            Very long label text that should be truncated
          </Label>
        </div>,
      );

      const label = screen.getByTestId('constrained-label');
      expect(label).toHaveClass('w-full', 'truncate');
    });

    it('handles mobile touch targets', () => {
      render(
        <Label
          className='flex min-h-[44px] min-w-[44px] items-center'
          data-testid='touch-target'
        >
          Touch Target
        </Label>,
      );

      const label = screen.getByTestId('touch-target');
      expect(label).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('supports dark mode variants', () => {
      render(
        <Label
          className='text-gray-900 dark:text-gray-100'
          data-testid='dark-mode'
        >
          Dark Mode Label
        </Label>,
      );

      const label = screen.getByTestId('dark-mode');
      expect(label).toHaveClass('text-gray-900', 'dark:text-gray-100');
    });
  });

  describe('基本响应式测试', () => {
    it('handles responsive margins', () => {
      render(
        <Label
          className='m-1 sm:m-2 md:m-3 lg:m-4 xl:m-5'
          data-testid='responsive-margins'
        >
          Responsive Margins
        </Label>,
      );

      const label = screen.getByTestId('responsive-margins');
      expect(label).toHaveClass('m-1', 'sm:m-2', 'md:m-3', 'lg:m-4', 'xl:m-5');
    });

    it('handles responsive padding', () => {
      render(
        <Label
          className='px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3'
          data-testid='responsive-padding'
        >
          Responsive Padding
        </Label>,
      );

      const label = screen.getByTestId('responsive-padding');
      expect(label).toHaveClass(
        'px-2',
        'py-1',
        'sm:px-3',
        'sm:py-2',
        'md:px-4',
        'md:py-3',
      );
    });

    it('handles responsive font weights', () => {
      render(
        <Label
          className='font-normal md:font-medium lg:font-semibold'
          data-testid='responsive-weight'
        >
          Responsive Weight
        </Label>,
      );

      const label = screen.getByTestId('responsive-weight');
      expect(label).toHaveClass(
        'font-normal',
        'md:font-medium',
        'lg:font-semibold',
      );
    });

    it('handles responsive colors', () => {
      render(
        <Label
          className='text-gray-600 md:text-gray-700 lg:text-gray-800'
          data-testid='responsive-colors'
        >
          Responsive Colors
        </Label>,
      );

      const label = screen.getByTestId('responsive-colors');
      expect(label).toHaveClass(
        'text-gray-600',
        'md:text-gray-700',
        'lg:text-gray-800',
      );
    });

    it('handles responsive borders', () => {
      render(
        <Label
          className='border border-gray-200 md:border-gray-300 lg:border-gray-400'
          data-testid='responsive-borders'
        >
          Responsive Borders
        </Label>,
      );

      const label = screen.getByTestId('responsive-borders');
      expect(label).toHaveClass(
        'border',
        'border-gray-200',
        'md:border-gray-300',
        'lg:border-gray-400',
      );
    });

    it('handles responsive shadows', () => {
      render(
        <Label
          className='shadow-sm md:shadow-md lg:shadow-lg'
          data-testid='responsive-shadows'
        >
          Responsive Shadows
        </Label>,
      );

      const label = screen.getByTestId('responsive-shadows');
      expect(label).toHaveClass('shadow-sm', 'md:shadow-md', 'lg:shadow-lg');
    });

    it('handles responsive rounded corners', () => {
      render(
        <Label
          className='rounded-sm md:rounded-md lg:rounded-lg'
          data-testid='responsive-rounded'
        >
          Responsive Rounded
        </Label>,
      );

      const label = screen.getByTestId('responsive-rounded');
      expect(label).toHaveClass('rounded-sm', 'md:rounded-md', 'lg:rounded-lg');
    });

    it('handles responsive display properties', () => {
      render(
        <Label
          className='block md:inline-block lg:flex'
          data-testid='responsive-display'
        >
          Responsive Display
        </Label>,
      );

      const label = screen.getByTestId('responsive-display');
      expect(label).toHaveClass('block', 'md:inline-block', 'lg:flex');
    });

    it('handles responsive positioning', () => {
      render(
        <Label
          className='relative md:absolute lg:fixed'
          data-testid='responsive-position'
        >
          Responsive Position
        </Label>,
      );

      const label = screen.getByTestId('responsive-position');
      expect(label).toHaveClass('relative', 'md:absolute', 'lg:fixed');
    });

    it('handles responsive width and height', () => {
      render(
        <Label
          className='h-auto w-full md:h-12 md:w-1/2 lg:h-16 lg:w-1/3'
          data-testid='responsive-dimensions'
        >
          Responsive Dimensions
        </Label>,
      );

      const label = screen.getByTestId('responsive-dimensions');
      expect(label).toHaveClass(
        'w-full',
        'md:w-1/2',
        'lg:w-1/3',
        'h-auto',
        'md:h-12',
        'lg:h-16',
      );
    });
  });

  describe('错误处理验证', () => {
    it('handles responsive flexbox properties', () => {
      render(
        <Label
          className='flex-col justify-start md:flex-row md:justify-center lg:flex-col lg:justify-end'
          data-testid='responsive-flex'
        >
          Responsive Flex
        </Label>,
      );

      const label = screen.getByTestId('responsive-flex');
      expect(label).toHaveClass(
        'flex-col',
        'md:flex-row',
        'lg:flex-col',
        'justify-start',
        'md:justify-center',
        'lg:justify-end',
      );
    });

    it('handles responsive grid properties', () => {
      render(
        <Label
          className='col-span-1 md:col-span-2 lg:col-span-3'
          data-testid='responsive-grid'
        >
          Responsive Grid
        </Label>,
      );

      const label = screen.getByTestId('responsive-grid');
      expect(label).toHaveClass('col-span-1', 'md:col-span-2', 'lg:col-span-3');
    });

    it('handles responsive opacity', () => {
      render(
        <Label
          className='opacity-50 md:opacity-75 lg:opacity-100'
          data-testid='responsive-opacity'
        >
          Responsive Opacity
        </Label>,
      );

      const label = screen.getByTestId('responsive-opacity');
      expect(label).toHaveClass(
        'opacity-50',
        'md:opacity-75',
        'lg:opacity-100',
      );
    });

    it('handles responsive transforms', () => {
      render(
        <Label
          className='scale-90 md:scale-95 lg:scale-100'
          data-testid='responsive-transform'
        >
          Responsive Transform
        </Label>,
      );

      const label = screen.getByTestId('responsive-transform');
      expect(label).toHaveClass('scale-90', 'md:scale-95', 'lg:scale-100');
    });

    it('handles responsive z-index', () => {
      render(
        <Label
          className='z-10 md:z-20 lg:z-30'
          data-testid='responsive-z-index'
        >
          Responsive Z-Index
        </Label>,
      );

      const label = screen.getByTestId('responsive-z-index');
      expect(label).toHaveClass('z-10', 'md:z-20', 'lg:z-30');
    });

    it('handles responsive overflow', () => {
      render(
        <Label
          className='overflow-hidden md:overflow-visible lg:overflow-auto'
          data-testid='responsive-overflow'
        >
          Responsive Overflow
        </Label>,
      );

      const label = screen.getByTestId('responsive-overflow');
      expect(label).toHaveClass(
        'overflow-hidden',
        'md:overflow-visible',
        'lg:overflow-auto',
      );
    });

    it('handles responsive cursor', () => {
      render(
        <Label
          className='cursor-default md:cursor-pointer lg:cursor-help'
          data-testid='responsive-cursor'
        >
          Responsive Cursor
        </Label>,
      );

      const label = screen.getByTestId('responsive-cursor');
      expect(label).toHaveClass(
        'cursor-default',
        'md:cursor-pointer',
        'lg:cursor-help',
      );
    });

    it('handles responsive user select', () => {
      render(
        <Label
          className='select-none md:select-text lg:select-all'
          data-testid='responsive-select'
        >
          Responsive Select
        </Label>,
      );

      const label = screen.getByTestId('responsive-select');
      expect(label).toHaveClass(
        'select-none',
        'md:select-text',
        'lg:select-all',
      );
    });

    it('handles responsive pointer events', () => {
      render(
        <Label
          className='pointer-events-none md:pointer-events-auto'
          data-testid='responsive-pointer'
        >
          Responsive Pointer Events
        </Label>,
      );

      const label = screen.getByTestId('responsive-pointer');
      expect(label).toHaveClass(
        'pointer-events-none',
        'md:pointer-events-auto',
      );
    });

    it('handles responsive visibility', () => {
      render(
        <Label
          className='visible md:invisible lg:visible'
          data-testid='responsive-visibility'
        >
          Responsive Visibility
        </Label>,
      );

      const label = screen.getByTestId('responsive-visibility');
      expect(label).toHaveClass('visible', 'md:invisible', 'lg:visible');
    });
  });
});
