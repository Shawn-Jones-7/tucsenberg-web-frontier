import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from '../section';

describe('Section', () => {
  it('renders as section element', () => {
    render(<Section data-testid='section'>Content</Section>);
    expect(screen.getByTestId('section').tagName).toBe('SECTION');
  });

  it('includes scroll-mt-20 for anchor link offset', () => {
    render(<Section data-testid='section'>Content</Section>);
    expect(screen.getByTestId('section')).toHaveClass('scroll-mt-20');
  });

  it('does not apply spacing class when spacing prop is omitted', () => {
    render(<Section data-testid='section'>Content</Section>);
    const section = screen.getByTestId('section');
    expect(section).not.toHaveClass('py-8');
    expect(section).not.toHaveClass('py-12');
    expect(section).not.toHaveClass('py-16');
    expect(section).not.toHaveClass('py-20');
  });

  it('applies spacing variants correctly', () => {
    const { rerender } = render(
      <Section
        spacing='none'
        data-testid='section'
      >
        Content
      </Section>,
    );
    const section = screen.getByTestId('section');
    expect(section).not.toHaveClass('py-8');
    expect(section).not.toHaveClass('py-12');

    rerender(
      <Section
        spacing='sm'
        data-testid='section'
      >
        Content
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveClass('py-8');

    rerender(
      <Section
        spacing='md'
        data-testid='section'
      >
        Content
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveClass('py-12');

    rerender(
      <Section
        spacing='lg'
        data-testid='section'
      >
        Content
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveClass('py-16');

    rerender(
      <Section
        spacing='xl'
        data-testid='section'
      >
        Content
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveClass('py-20');
  });

  it('defaults to default background only', () => {
    render(<Section data-testid='section'>Content</Section>);
    const section = screen.getByTestId('section');
    expect(section).not.toHaveClass('bg-muted/50');
    expect(section).not.toHaveClass('bg-gradient-to-br');
  });

  it('applies background variants correctly', () => {
    const { rerender } = render(
      <Section
        background='muted'
        data-testid='section'
      >
        Content
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveClass('bg-muted/50');

    rerender(
      <Section
        background='gradient'
        data-testid='section'
      >
        Content
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveClass('bg-gradient-to-br');
  });

  it('accepts className for cv-* and other overrides', () => {
    render(
      <Section
        className='cv-600 custom-class'
        data-testid='section'
      >
        Content
      </Section>,
    );
    const section = screen.getByTestId('section');
    expect(section).toHaveClass('cv-600');
    expect(section).toHaveClass('custom-class');
  });

  it('supports anchor links via id prop', () => {
    render(
      <Section
        id='features'
        data-testid='section'
      >
        Content
      </Section>,
    );
    const section = screen.getByTestId('section');
    expect(section).toHaveAttribute('id', 'features');
    expect(section).toHaveClass('scroll-mt-20');
  });

  it('passes through additional props', () => {
    render(
      <Section
        aria-labelledby='section-heading'
        data-testid='section'
      >
        <h2 id='section-heading'>Title</h2>
      </Section>,
    );
    expect(screen.getByTestId('section')).toHaveAttribute(
      'aria-labelledby',
      'section-heading',
    );
  });
});
