/**
 * @vitest-environment jsdom
 */

/**
 * Badge Content - Basic Tests
 *
 * 专门测试基本内容渲染，包括：
 * - 文本内容
 * - 数字内容
 * - 布尔值内容
 * - JSX内容
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge Content - Basic Tests', () => {
  describe('基本内容渲染', () => {
    it('renders text content', () => {
      render(<Badge>Simple Text</Badge>);

      const badge = screen.getByText('Simple Text');
      expect(badge).toHaveTextContent('Simple Text');
    });

    it('renders numeric content', () => {
      render(<Badge>{42}</Badge>);

      const badge = screen.getByText('42');
      expect(badge).toHaveTextContent('42');
    });

    it('renders zero as content', () => {
      render(<Badge>{0}</Badge>);

      const badge = screen.getByText('0');
      expect(badge).toHaveTextContent('0');
    });

    it('renders boolean content', () => {
      render(<Badge>{String(true)}</Badge>);

      const badge = screen.getByText('true');
      expect(badge).toHaveTextContent('true');
    });

    it('renders JSX content', () => {
      render(
        <Badge>
          <span>JSX Content</span>
        </Badge>,
      );

      const badge = screen.getByText('JSX Content');
      expect(badge).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Badge>
          <span>First</span>
          <span>Second</span>
        </Badge>,
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('renders with icons', () => {
      render(
        <Badge>
          <svg
            data-testid='icon'
            width='12'
            height='12'
          >
            <circle
              cx='6'
              cy='6'
              r='6'
            />
          </svg>
          With Icon
        </Badge>,
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders long text content', () => {
      const longText =
        'This is a very long badge text that might wrap or be truncated';
      render(<Badge>{longText}</Badge>);

      const badge = screen.getByText(longText);
      expect(badge).toHaveTextContent(longText);
    });

    it('renders nested components', () => {
      render(
        <Badge>
          <div>
            <span>Nested</span>
            <strong>Components</strong>
          </div>
        </Badge>,
      );

      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Components')).toBeInTheDocument();
    });

    it('handles whitespace correctly', () => {
      render(<Badge> Whitespace Test </Badge>);

      const badge = screen.getByText('Whitespace Test');
      expect(badge).toHaveTextContent('Whitespace Test');
    });
  });

  describe('条件内容渲染', () => {
    it('renders conditional content', () => {
      const showExtra = true;
      render(
        <Badge>
          Base Content
          {showExtra && <span> Extra</span>}
        </Badge>,
      );

      expect(screen.getByText('Base Content')).toBeInTheDocument();
      expect(screen.getByText('Extra')).toBeInTheDocument();
    });

    it('renders array of elements', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      render(
        <Badge>
          {items.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </Badge>,
      );

      items.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('renders mixed content types', () => {
      render(
        <Badge>
          Text {42} <span>JSX</span> {true}
        </Badge>,
      );

      const badge = screen.getByText(/Text 42/);
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('JSX')).toBeInTheDocument();
    });

    it('renders with React fragments', () => {
      render(
        <Badge>
          <>
            <span>Fragment</span>
            <span>Content</span>
          </>
        </Badge>,
      );

      expect(screen.getByText('Fragment')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with conditional operators', () => {
      const isActive = true;
      render(<Badge>Status: {isActive ? 'Active' : 'Inactive'}</Badge>);

      const badge = screen.getByText('Status: Active');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('空内容处理', () => {
    it('renders empty content gracefully', () => {
      render(<Badge data-testid='empty-badge'></Badge>);

      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it('renders null content gracefully', () => {
      render(<Badge data-testid='null-badge'>{null}</Badge>);

      const badge = screen.getByTestId('null-badge');
      expect(badge).toBeInTheDocument();
    });

    it('renders undefined content gracefully', () => {
      render(<Badge data-testid='undefined-badge'>{undefined}</Badge>);

      const badge = screen.getByTestId('undefined-badge');
      expect(badge).toBeInTheDocument();
    });

    it('renders false content gracefully', () => {
      render(<Badge data-testid='false-badge'>{false}</Badge>);

      const badge = screen.getByTestId('false-badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('格式化内容', () => {
    it('renders content with line breaks', () => {
      render(<Badge>Line 1{'\n'}Line 2</Badge>);

      const badge = screen.getByText(/Line 1.*Line 2/);
      expect(badge).toBeInTheDocument();
    });

    it('renders content with tabs', () => {
      render(<Badge>Tab{'\t'}Separated</Badge>);

      const badge = screen.getByText(/Tab.*Separated/);
      expect(badge).toBeInTheDocument();
    });

    it('renders with template literals', () => {
      const count = 5;
      render(<Badge>{`Count: ${count}`}</Badge>);

      const badge = screen.getByText('Count: 5');
      expect(badge).toHaveTextContent('Count: 5');
    });

    it('renders with function calls', () => {
      const getText = () => 'Function Result';
      render(<Badge>{getText()}</Badge>);

      const badge = screen.getByText('Function Result');
      expect(badge).toHaveTextContent('Function Result');
    });
  });

  describe('特殊内容类型', () => {
    it('renders with regular expressions', () => {
      const regex = /test/g;
      render(<Badge>{regex.toString()}</Badge>);

      const badge = screen.getByText('/test/g');
      expect(badge).toHaveTextContent('/test/g');
    });

    it('renders with JSON strings', () => {
      const obj = { key: 'value' };
      render(<Badge>{JSON.stringify(obj)}</Badge>);

      const badge = screen.getByText('{"key":"value"}');
      expect(badge).toHaveTextContent('{"key":"value"}');
    });

    it('renders with encoded URIs', () => {
      const uri = encodeURIComponent('hello world');
      render(<Badge>{uri}</Badge>);

      const badge = screen.getByText('hello%20world');
      expect(badge).toHaveTextContent('hello%20world');
    });

    it('renders with base64 encoded content', () => {
      const encoded = btoa('hello');
      render(<Badge>{encoded}</Badge>);

      const badge = screen.getByText('aGVsbG8=');
      expect(badge).toHaveTextContent('aGVsbG8=');
    });

    it('renders with CSS class names as content', () => {
      render(<Badge>bg-blue-500 text-white</Badge>);

      const badge = screen.getByText('bg-blue-500 text-white');
      expect(badge).toHaveTextContent('bg-blue-500 text-white');
    });

    it('renders with HTML tag names as content', () => {
      render(<Badge>&lt;div&gt;&lt;/div&gt;</Badge>);

      const badge = screen.getByText('<div></div>');
      expect(badge).toHaveTextContent('<div></div>');
    });

    it('renders with code snippets', () => {
      render(<Badge>const x = 42;</Badge>);

      const badge = screen.getByText('const x = 42;');
      expect(badge).toHaveTextContent('const x = 42;');
    });
  });
});
