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

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with default props', () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('applies default card styles', () => {
      render(<Card>Styled Card</Card>);

      const card = screen.getByText('Styled Card');
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

    it('applies custom className', () => {
      render(<Card className='custom-card'>Custom Card</Card>);

      const card = screen.getByText('Custom Card');
      expect(card).toHaveClass('custom-card');
    });

    it('passes through HTML div props', () => {
      render(
        <Card
          id='test-card'
          data-testid='card-element'
          role='article'
        >
          Props Test
        </Card>,
      );

      const card = screen.getByText('Props Test');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('data-testid', 'card-element');
      expect(card).toHaveAttribute('role', 'article');
    });
  });

  describe('CardHeader', () => {
    it('renders card header with default props', () => {
      render(<CardHeader>Header Content</CardHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('applies default header styles', () => {
      render(<CardHeader>Header Styles</CardHeader>);

      const header = screen.getByText('Header Styles');
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

    it('applies custom className', () => {
      render(<CardHeader className='custom-header'>Custom Header</CardHeader>);

      const header = screen.getByText('Custom Header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('renders card title with default props', () => {
      render(<CardTitle>Title Text</CardTitle>);

      const title = screen.getByText('Title Text');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('applies default title styles', () => {
      render(<CardTitle>Styled Title</CardTitle>);

      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('leading-none', 'font-semibold');
    });

    it('applies custom className', () => {
      render(<CardTitle className='custom-title'>Custom Title</CardTitle>);

      const title = screen.getByText('Custom Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('renders card description with default props', () => {
      render(<CardDescription>Description text</CardDescription>);

      const description = screen.getByText('Description text');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'card-description');
    });

    it('applies default description styles', () => {
      render(<CardDescription>Styled Description</CardDescription>);

      const description = screen.getByText('Styled Description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('applies custom className', () => {
      render(
        <CardDescription className='custom-desc'>
          Custom Description
        </CardDescription>,
      );

      const description = screen.getByText('Custom Description');
      expect(description).toHaveClass('custom-desc');
    });
  });

  describe('CardAction', () => {
    it('renders card action with default props', () => {
      render(<CardAction>Action Content</CardAction>);

      const action = screen.getByText('Action Content');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('applies default action styles', () => {
      render(<CardAction>Styled Action</CardAction>);

      const action = screen.getByText('Styled Action');
      expect(action).toHaveClass(
        'col-start-2',
        'row-span-2',
        'row-start-1',
        'self-start',
        'justify-self-end',
      );
    });

    it('applies custom className', () => {
      render(<CardAction className='custom-action'>Custom Action</CardAction>);

      const action = screen.getByText('Custom Action');
      expect(action).toHaveClass('custom-action');
    });
  });

  describe('CardContent', () => {
    it('renders card content with default props', () => {
      render(<CardContent>Content text</CardContent>);

      const content = screen.getByText('Content text');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('applies default content styles', () => {
      render(<CardContent>Styled Content</CardContent>);

      const content = screen.getByText('Styled Content');
      expect(content).toHaveClass('px-6');
    });

    it('applies custom className', () => {
      render(
        <CardContent className='custom-content'>Custom Content</CardContent>,
      );

      const content = screen.getByText('Custom Content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('renders card footer with default props', () => {
      render(<CardFooter>Footer Content</CardFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('applies default footer styles', () => {
      render(<CardFooter>Styled Footer</CardFooter>);

      const footer = screen.getByText('Styled Footer');
      expect(footer).toHaveClass('flex', 'items-center', 'px-6');
    });

    it('applies custom className', () => {
      render(<CardFooter className='custom-footer'>Custom Footer</CardFooter>);

      const footer = screen.getByText('Custom Footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid='complete-card'>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>,
      );

      const card = screen.getByTestId('complete-card');
      const title = screen.getByText('Card Title');
      const description = screen.getByText('Card description text');
      const actionButton = screen.getByRole('button', { name: 'Action' });
      const content = screen.getByText('This is the main content of the card.');
      const footerButton = screen.getByRole('button', {
        name: 'Footer Button',
      });

      expect(card).toContainElement(title);
      expect(card).toContainElement(description);
      expect(card).toContainElement(actionButton);
      expect(card).toContainElement(content);
      expect(card).toContainElement(footerButton);
    });

    it('maintains proper component hierarchy', () => {
      render(
        <Card>
          <CardHeader data-testid='header'>
            <CardTitle data-testid='title'>Title</CardTitle>
            <CardDescription data-testid='description'>
              Description
            </CardDescription>
          </CardHeader>
          <CardContent data-testid='content'>Content</CardContent>
          <CardFooter data-testid='footer'>Footer</CardFooter>
        </Card>,
      );

      const header = screen.getByTestId('header');
      const title = screen.getByTestId('title');
      const description = screen.getByTestId('description');
      const content = screen.getByTestId('content');
      const footer = screen.getByTestId('footer');

      expect(header).toContainElement(title);
      expect(header).toContainElement(description);
      expect(header).not.toContainElement(content);
      expect(header).not.toContainElement(footer);
    });
  });

  describe('Accessibility', () => {
    it('supports semantic HTML structure', () => {
      render(
        <Card role='article'>
          <CardHeader>
            <CardTitle
              role='heading'
              aria-level={2}
            >
              Accessible Title
            </CardTitle>
            <CardDescription>Accessible description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Accessible content</p>
          </CardContent>
        </Card>,
      );

      const card = screen.getByRole('article');
      const title = screen.getByRole('heading', { level: 2 });

      expect(card).toBeInTheDocument();
      expect(title).toHaveTextContent('Accessible Title');
    });

    it('supports ARIA attributes', () => {
      render(
        <Card
          aria-labelledby='card-title'
          aria-describedby='card-desc'
        >
          <CardHeader>
            <CardTitle id='card-title'>ARIA Title</CardTitle>
            <CardDescription id='card-desc'>ARIA Description</CardDescription>
          </CardHeader>
        </Card>,
      );

      const card = screen.getByLabelText('ARIA Title');
      expect(card).toHaveAttribute('aria-describedby', 'card-desc');
    });
  });
});
