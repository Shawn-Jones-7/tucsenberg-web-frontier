/**
 * @vitest-environment jsdom
 */

/**
 * Label Responsive - Core Basic Tests
 *
 * 核心响应式功能测试，专注于最重要的响应式特性：
 * - 基本响应式样式
 * - 文本大小响应
 * - 间距响应
 * - 容器约束
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Responsive - Core Basic Tests', () => {
  describe('基本响应式样式', () => {
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
      expect(label).toHaveClass(
        'min-h-[44px]',
        'min-w-[44px]',
        'flex',
        'items-center',
      );
    });
  });

  describe('核心间距响应式', () => {
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
  });

  describe('核心视觉效果响应式', () => {
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

  describe('核心布局响应式', () => {
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
  });

  describe('核心文本响应式', () => {
    it('handles responsive line height', () => {
      render(
        <Label
          className='leading-tight md:leading-normal lg:leading-loose'
          data-testid='responsive-leading'
        >
          Responsive Line Height
        </Label>,
      );

      const label = screen.getByTestId('responsive-leading');
      expect(label).toHaveClass(
        'leading-tight',
        'md:leading-normal',
        'lg:leading-loose',
      );
    });

    it('handles responsive text alignment', () => {
      render(
        <Label
          className='text-left md:text-center lg:text-right'
          data-testid='responsive-align'
        >
          Responsive Text Alignment
        </Label>,
      );

      const label = screen.getByTestId('responsive-align');
      expect(label).toHaveClass('text-left', 'md:text-center', 'lg:text-right');
    });

    it('handles responsive text transform', () => {
      render(
        <Label
          className='normal-case md:uppercase lg:lowercase'
          data-testid='responsive-transform-text'
        >
          Responsive Text Transform
        </Label>,
      );

      const label = screen.getByTestId('responsive-transform-text');
      expect(label).toHaveClass('normal-case', 'md:uppercase', 'lg:lowercase');
    });
  });

  describe('边缘情况', () => {
    it('handles empty responsive classes gracefully', () => {
      render(
        <Label
          className=''
          data-testid='empty-classes'
        >
          Empty Classes
        </Label>,
      );

      const label = screen.getByTestId('empty-classes');
      expect(label).toBeInTheDocument();
    });

    it('handles mixed responsive and non-responsive classes', () => {
      render(
        <Label
          className='font-bold text-blue-500 md:text-red-500 lg:text-green-500'
          data-testid='mixed-classes'
        >
          Mixed Classes
        </Label>,
      );

      const label = screen.getByTestId('mixed-classes');
      expect(label).toHaveClass(
        'font-bold',
        'text-blue-500',
        'md:text-red-500',
        'lg:text-green-500',
      );
    });
  });
});
