import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from '../container';

describe('Container', () => {
  it('renders with default xl size', () => {
    render(<Container data-testid='container'>Content</Container>);
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-xl');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('px-4');
  });

  it('applies size variants correctly', () => {
    const { rerender } = render(
      <Container
        size='sm'
        data-testid='container'
      >
        Content
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveClass('max-w-screen-sm');

    rerender(
      <Container
        size='md'
        data-testid='container'
      >
        Content
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveClass('max-w-screen-md');

    rerender(
      <Container
        size='lg'
        data-testid='container'
      >
        Content
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveClass('max-w-screen-lg');

    rerender(
      <Container
        size='2xl'
        data-testid='container'
      >
        Content
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveClass('max-w-screen-2xl');

    rerender(
      <Container
        size='full'
        data-testid='container'
      >
        Content
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveClass('max-w-full');
  });

  it('applies uniform px-4 padding', () => {
    render(<Container data-testid='container'>Content</Container>);
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('px-4');
    expect(container).not.toHaveClass('md:px-6');
    expect(container).not.toHaveClass('lg:px-8');
  });

  it('accepts className for overrides', () => {
    render(
      <Container
        className='custom-class'
        data-testid='container'
      >
        Content
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveClass('custom-class');
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Container
        asChild
        data-testid='container'
      >
        <main>Content</main>
      </Container>,
    );
    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('MAIN');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('px-4');
  });

  it('renders as div by default', () => {
    render(<Container data-testid='container'>Content</Container>);
    expect(screen.getByTestId('container').tagName).toBe('DIV');
  });

  it('passes through additional props', () => {
    render(
      <Container
        id='my-container'
        aria-label='Main container'
      >
        Content
      </Container>,
    );
    const container = screen.getByLabelText('Main container');
    expect(container).toHaveAttribute('id', 'my-container');
  });
});
