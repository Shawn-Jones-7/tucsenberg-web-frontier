/**
 * @vitest-environment jsdom
 */

/**
 * Card Structure and Components Tests
 *
 * Tests for Card component structure and component composition including:
 * - Complete card structure rendering
 * - Component hierarchy validation
 * - Nested component behavior
 * - Card layout variations
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

describe('Card Structure and Components Tests', () => {
  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(
        screen.getByText('This is the main content of the card.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Footer Action')).toBeInTheDocument();
    });

    it('maintains proper hierarchy with nested components', () => {
      render(
        <Card data-testid='card'>
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

      const card = screen.getByTestId('card');
      const header = screen.getByTestId('header');
      const title = screen.getByTestId('title');
      const description = screen.getByTestId('description');
      const content = screen.getByTestId('content');
      const footer = screen.getByTestId('footer');

      expect(card).toContainElement(header);
      expect(card).toContainElement(content);
      expect(card).toContainElement(footer);
      expect(header).toContainElement(title);
      expect(header).toContainElement(description);
    });

    it('renders minimal card with just content', () => {
      render(
        <Card>
          <CardContent>Simple content</CardContent>
        </Card>,
      );

      expect(screen.getByText('Simple content')).toBeInTheDocument();
    });

    it('renders card with only header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
          </CardHeader>
          <CardContent>Content without footer</CardContent>
        </Card>,
      );

      expect(screen.getByText('Header Only')).toBeInTheDocument();
      expect(screen.getByText('Content without footer')).toBeInTheDocument();
    });

    it('renders card with complex nested content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complex Card</CardTitle>
            <CardDescription>
              This card contains multiple nested elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3>Section 1</h3>
              <p>First paragraph</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
            <div>
              <h3>Section 2</h3>
              <p>Second paragraph</p>
            </div>
          </CardContent>
          <CardFooter>
            <button>Primary</button>
            <button>Secondary</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Complex Card')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });

    it('handles multiple cards in a container', () => {
      render(
        <div>
          <Card data-testid='card-1'>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
            </CardHeader>
            <CardContent>Content 1</CardContent>
          </Card>
          <Card data-testid='card-2'>
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
            </CardHeader>
            <CardContent>Content 2</CardContent>
          </Card>
        </div>,
      );

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });

    it('supports custom content in header actions', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Action Card</CardTitle>
            <CardAction>
              <div>
                <button>Edit</button>
                <button>Delete</button>
                <span>More options</span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>Card with multiple header actions</CardContent>
        </Card>,
      );

      expect(screen.getByText('Action Card')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('More options')).toBeInTheDocument();
    });

    it('renders card with image content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Image Card</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src='/test-image.jpg'
              alt='Test image'
            />
            <p>Card with image content</p>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Image Card')).toBeInTheDocument();
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
      expect(screen.getByText('Card with image content')).toBeInTheDocument();
    });

    it('handles empty components gracefully', () => {
      render(
        <Card data-testid='empty-card'>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>,
      );

      // Should render without errors even with empty content
      const card = screen.getByTestId('empty-card');
      expect(card).toBeInTheDocument();
    });

    it('supports conditional rendering of components', () => {
      const ConditionalCard = ({ showFooter }: { showFooter: boolean }) => (
        <Card>
          <CardHeader>
            <CardTitle>Conditional Card</CardTitle>
          </CardHeader>
          <CardContent>Content is always shown</CardContent>
          {showFooter && (
            <CardFooter>
              <button>Conditional Footer</button>
            </CardFooter>
          )}
        </Card>
      );

      const { rerender } = render(<ConditionalCard showFooter={false} />);

      expect(screen.getByText('Conditional Card')).toBeInTheDocument();
      expect(screen.getByText('Content is always shown')).toBeInTheDocument();
      expect(screen.queryByText('Conditional Footer')).not.toBeInTheDocument();

      rerender(<ConditionalCard showFooter={true} />);

      expect(screen.getByText('Conditional Footer')).toBeInTheDocument();
    });

    it('maintains component order regardless of rendering order', () => {
      render(
        <Card data-testid='ordered-card'>
          <CardFooter data-testid='footer-first'>
            Footer rendered first
          </CardFooter>
          <CardHeader data-testid='header-middle'>
            <CardTitle>Header rendered middle</CardTitle>
          </CardHeader>
          <CardContent data-testid='content-last'>
            Content rendered last
          </CardContent>
        </Card>,
      );

      const card = screen.getByTestId('ordered-card');
      const footer = screen.getByTestId('footer-first');
      const header = screen.getByTestId('header-middle');
      const content = screen.getByTestId('content-last');

      expect(card).toContainElement(footer);
      expect(card).toContainElement(header);
      expect(card).toContainElement(content);
    });

    it('supports nested card structures', () => {
      render(
        <Card data-testid='outer-card'>
          <CardHeader>
            <CardTitle>Outer Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card data-testid='inner-card'>
              <CardHeader>
                <CardTitle>Inner Card</CardTitle>
              </CardHeader>
              <CardContent>Nested card content</CardContent>
            </Card>
          </CardContent>
        </Card>,
      );

      const outerCard = screen.getByTestId('outer-card');
      const innerCard = screen.getByTestId('inner-card');

      expect(outerCard).toContainElement(innerCard);
      expect(screen.getByText('Outer Card')).toBeInTheDocument();
      expect(screen.getByText('Inner Card')).toBeInTheDocument();
      expect(screen.getByText('Nested card content')).toBeInTheDocument();
    });

    it('handles dynamic content updates', () => {
      const DynamicCard = ({ title }: { title: string }) => (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>Dynamic content for {title}</CardContent>
        </Card>
      );

      const { rerender } = render(<DynamicCard title='Initial Title' />);

      expect(screen.getByText('Initial Title')).toBeInTheDocument();
      expect(
        screen.getByText('Dynamic content for Initial Title'),
      ).toBeInTheDocument();

      rerender(<DynamicCard title='Updated Title' />);

      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(
        screen.getByText('Dynamic content for Updated Title'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Initial Title')).not.toBeInTheDocument();
    });

    it('supports cards with different layouts', () => {
      render(
        <div>
          <Card
            data-testid='horizontal-card'
            className='horizontal'
          >
            <CardContent>Horizontal layout</CardContent>
          </Card>
          <Card
            data-testid='vertical-card'
            className='vertical'
          >
            <CardContent>Vertical layout</CardContent>
          </Card>
          <Card
            data-testid='grid-card'
            className='grid'
          >
            <CardContent>Grid layout</CardContent>
          </Card>
        </div>,
      );

      expect(screen.getByTestId('horizontal-card')).toHaveClass('horizontal');
      expect(screen.getByTestId('vertical-card')).toHaveClass('vertical');
      expect(screen.getByTestId('grid-card')).toHaveClass('grid');
    });
  });
});
