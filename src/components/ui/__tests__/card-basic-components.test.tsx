/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';

describe('Card - Basic Components', () => {
  describe('Card', () => {
    it('renders card with default props', () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className='custom-card'>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card Content</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toHaveClass(
        'bg-card',
        'text-card-foreground',
        'flex',
        'flex-col',
        'gap-6',
        'rounded-xl',
        'border',
        'py-6',
        'shadow-sm',
      );
    });

    it('supports additional props', () => {
      render(
        <Card
          data-testid='card'
          role='region'
        >
          Card Content
        </Card>,
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'region');
    });

    it('renders as div element by default', () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card.tagName).toBe('DIV');
    });

    it('handles empty content', () => {
      render(<Card data-testid='empty-card' />);

      const card = screen.getByTestId('empty-card');
      expect(card).toBeInTheDocument();
    });

    it('supports nested content', () => {
      render(
        <Card>
          <div>Nested Content</div>
          <span>Another Element</span>
        </Card>,
      );

      expect(screen.getByText('Nested Content')).toBeInTheDocument();
      expect(screen.getByText('Another Element')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders card header with default props', () => {
      render(<CardHeader>Header Content</CardHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardHeader className='custom-header'>Header Content</CardHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toHaveClass('custom-header');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Header Content</CardHeader>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<CardHeader>Header Content</CardHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toHaveClass(
        '@container/card-header',
        'grid',
        'auto-rows-min',
        'grid-rows-[auto_auto]',
        'items-start',
        'gap-1.5',
        'px-6',
      );
    });

    it('supports additional props', () => {
      render(
        <CardHeader
          data-testid='header'
          role='banner'
        >
          Header Content
        </CardHeader>,
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('role', 'banner');
    });

    it('renders as div element by default', () => {
      render(<CardHeader>Header Content</CardHeader>);

      const header = screen.getByText('Header Content');
      expect(header.tagName).toBe('DIV');
    });

    it('handles empty content', () => {
      render(<CardHeader data-testid='empty-header' />);

      const header = screen.getByTestId('empty-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders card title with default props', () => {
      render(<CardTitle>Title Content</CardTitle>);

      const title = screen.getByText('Title Content');
      expect(title).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardTitle className='custom-title'>Title Content</CardTitle>);

      const title = screen.getByText('Title Content');
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardTitle ref={ref}>Title Content</CardTitle>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<CardTitle>Title Content</CardTitle>);

      const title = screen.getByText('Title Content');
      expect(title).toHaveClass('leading-none', 'font-semibold');
    });

    it('renders as div element by default', () => {
      render(<CardTitle>Title Content</CardTitle>);

      const title = screen.getByText('Title Content');
      expect(title.tagName).toBe('DIV');
    });

    it('supports additional props', () => {
      render(
        <CardTitle
          data-testid='title'
          id='card-title'
        >
          Title Content
        </CardTitle>,
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('id', 'card-title');
    });

    it('handles empty content', () => {
      render(<CardTitle data-testid='empty-title' />);

      const title = screen.getByTestId('empty-title');
      expect(title).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('renders card description with default props', () => {
      render(<CardDescription>Description Content</CardDescription>);

      const description = screen.getByText('Description Content');
      expect(description).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <CardDescription className='custom-description'>
          Description Content
        </CardDescription>,
      );

      const description = screen.getByText('Description Content');
      expect(description).toHaveClass('custom-description');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardDescription ref={ref}>Description Content</CardDescription>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<CardDescription>Description Content</CardDescription>);

      const description = screen.getByText('Description Content');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('renders as div element by default', () => {
      render(<CardDescription>Description Content</CardDescription>);

      const description = screen.getByText('Description Content');
      expect(description.tagName).toBe('DIV');
    });

    it('supports additional props', () => {
      render(
        <CardDescription
          data-testid='description'
          id='card-desc'
        >
          Description Content
        </CardDescription>,
      );

      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('id', 'card-desc');
    });

    it('handles empty content', () => {
      render(<CardDescription data-testid='empty-description' />);

      const description = screen.getByTestId('empty-description');
      expect(description).toBeInTheDocument();
    });

    it('supports long text content', () => {
      const longText =
        'This is a very long description that might wrap to multiple lines and should be handled properly by the component.';
      render(<CardDescription>{longText}</CardDescription>);

      const description = screen.getByText(longText);
      expect(description).toBeInTheDocument();
    });
  });

  describe('CardAction', () => {
    it('renders card action with default props', () => {
      render(<CardAction>Action Content</CardAction>);

      const action = screen.getByText('Action Content');
      expect(action).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardAction className='custom-action'>Action Content</CardAction>);

      const action = screen.getByText('Action Content');
      expect(action).toHaveClass('custom-action');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardAction ref={ref}>Action Content</CardAction>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<CardAction>Action Content</CardAction>);

      const action = screen.getByText('Action Content');
      expect(action).toHaveClass(
        'col-start-2',
        'row-span-2',
        'row-start-1',
        'self-start',
        'justify-self-end',
      );
    });

    it('renders as div element by default', () => {
      render(<CardAction>Action Content</CardAction>);

      const action = screen.getByText('Action Content');
      expect(action.tagName).toBe('DIV');
    });

    it('supports additional props', () => {
      render(
        <CardAction
          data-testid='action'
          role='group'
        >
          Action Content
        </CardAction>,
      );

      const action = screen.getByTestId('action');
      expect(action).toHaveAttribute('role', 'group');
    });

    it('handles empty content', () => {
      render(<CardAction data-testid='empty-action' />);

      const action = screen.getByTestId('empty-action');
      expect(action).toBeInTheDocument();
    });

    it('supports multiple action elements', () => {
      render(
        <CardAction>
          <button>Edit</button>
          <button>Delete</button>
        </CardAction>,
      );

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders card content with default props', () => {
      render(<CardContent>Content Text</CardContent>);

      const content = screen.getByText('Content Text');
      expect(content).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <CardContent className='custom-content'>Content Text</CardContent>,
      );

      const content = screen.getByText('Content Text');
      expect(content).toHaveClass('custom-content');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Content Text</CardContent>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<CardContent>Content Text</CardContent>);

      const content = screen.getByText('Content Text');
      expect(content).toHaveClass('px-6');
    });

    it('renders as div element by default', () => {
      render(<CardContent>Content Text</CardContent>);

      const content = screen.getByText('Content Text');
      expect(content.tagName).toBe('DIV');
    });

    it('supports additional props', () => {
      render(
        <CardContent
          data-testid='content'
          role='main'
        >
          Content Text
        </CardContent>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('role', 'main');
    });

    it('handles empty content', () => {
      render(<CardContent data-testid='empty-content' />);

      const content = screen.getByTestId('empty-content');
      expect(content).toBeInTheDocument();
    });

    it('supports complex nested content', () => {
      render(
        <CardContent>
          <div>
            <h4>Nested Title</h4>
            <p>Nested paragraph</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </div>
        </CardContent>,
      );

      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('renders card footer with default props', () => {
      render(<CardFooter>Footer Content</CardFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardFooter className='custom-footer'>Footer Content</CardFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toHaveClass('custom-footer');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Footer Content</CardFooter>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders with correct default classes', () => {
      render(<CardFooter>Footer Content</CardFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toHaveClass(
        'flex',
        'items-center',
        'px-6',
        '[.border-t]:pt-6',
      );
    });

    it('renders as div element by default', () => {
      render(<CardFooter>Footer Content</CardFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer.tagName).toBe('DIV');
    });

    it('supports additional props', () => {
      render(
        <CardFooter
          data-testid='footer'
          role='contentinfo'
        >
          Footer Content
        </CardFooter>,
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    it('handles empty content', () => {
      render(<CardFooter data-testid='empty-footer' />);

      const footer = screen.getByTestId('empty-footer');
      expect(footer).toBeInTheDocument();
    });

    it('supports action buttons in footer', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>,
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });
});
