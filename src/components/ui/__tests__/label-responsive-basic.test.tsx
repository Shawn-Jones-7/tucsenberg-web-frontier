/**
 * @vitest-environment jsdom
 */

/**
 * Label Responsive - Advanced Tests
 *
 * 高级响应式功能测试，专注于复杂场景：
 * - 高级视觉效果
 * - 复杂交互响应
 * - 特殊布局情况
 * 基础功能测试请参考 label-responsive-basic-core.test.tsx
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Responsive - Advanced Tests', () => {
  describe('高级视觉效果', () => {
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

  describe('高级响应式颜色', () => {
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
  });

  describe('高级交互响应式', () => {
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
