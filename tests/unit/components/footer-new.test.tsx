import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/footer/Footer';
import { FOOTER_COLUMNS, FOOTER_STYLE_TOKENS } from '@/config/footer-links';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      {...rest}
    >
      {children}
    </a>
  ),
}));

describe('Footer (Vercel style)', () => {
  it('渲染默认四列导航并暴露可访问性元数据', () => {
    render(<Footer />);

    const navigation = screen.getByRole('navigation', {
      name: /footer navigation/i,
    });
    expect(navigation).toBeInTheDocument();

    FOOTER_COLUMNS.forEach((column) => {
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: column.title,
        }),
      ).toBeInTheDocument();

      column.links.forEach((link) => {
        const matchingLinks = screen.getAllByRole('link', {
          name: link.label,
        });

        expect(matchingLinks.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  it('支持自定义 tokens、插槽与 data-theme', () => {
    const customTokens = {
      ...FOOTER_STYLE_TOKENS,
      layout: {
        ...FOOTER_STYLE_TOKENS.layout,
        maxWidthPx: 960,
        minColumnWidthPx: 120,
      },
      typography: {
        ...FOOTER_STYLE_TOKENS.typography,
        title: {
          ...FOOTER_STYLE_TOKENS.typography.title,
          fontSizePx: 16,
        },
      },
    };

    render(
      <Footer
        dataTheme='dark'
        statusSlot={
          <span data-testid='status-slot'>All systems operational</span>
        }
        themeToggleSlot={<button type='button'>Toggle</button>}
        tokens={customTokens}
      />,
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('data-theme', 'dark');

    const nav = screen.getByRole('navigation', { name: /footer navigation/i });
    expect(nav).toHaveStyle(
      'grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))',
    );

    const container = nav.parentElement;
    expect(container).toHaveStyle({ maxWidth: '960px' });

    expect(screen.getByTestId('status-slot')).toBeInTheDocument();
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('外部链接带 target/rel，内部链接保持可点击', () => {
    render(<Footer />);

    const externalItem = FOOTER_COLUMNS[0]?.links.find((item) => item.external);
    if (!externalItem) {
      throw new Error('Expected at least one external footer link');
    }

    const externalLink = screen.getByRole('link', {
      name: externalItem.label,
    });
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noreferrer noopener');

    const internal = document.querySelector('a[href="/ "]') || undefined;
    if (internal) {
      expect(internal).not.toHaveAttribute('target');
    }
  });
});
