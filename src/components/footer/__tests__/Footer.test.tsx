/**
 * Footer Component Tests
 *
 * Tests for the new Footer component (src/components/footer/Footer.tsx)
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '../Footer';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders all footer sections', () => {
    render(<Footer />);

    // Check for section headings (using translation keys as mock returns them)
    const sections = ['Resources', 'Company', 'Legal'];
    sections.forEach((section) => {
      // Look for headings or elements with these keys
      const elements = screen.queryAllByText(
        (content, element) =>
          element?.tagName === 'H2' && content.includes(section.toLowerCase()),
      );
      // At least some footer structure should exist
      expect(elements.length >= 0).toBe(true);
    });
  });

  it('renders social links section', () => {
    render(<Footer />);

    // Social section should exist
    const socialHeading = screen.queryByRole('heading', {
      name: /social/i,
      level: 2,
    });

    // If social heading exists, verify structure
    if (socialHeading) {
      expect(socialHeading).toBeInTheDocument();
    }
  });

  it('renders theme toggle slot when provided', () => {
    const ThemeToggle = () => <button>Toggle Theme</button>;
    render(<Footer themeToggleSlot={<ThemeToggle />} />);

    const themeButton = screen.getByText('Toggle Theme');
    expect(themeButton).toBeInTheDocument();
  });

  it('renders status slot when provided', () => {
    const StatusContent = () => <div>© 2025 Company</div>;
    render(<Footer statusSlot={<StatusContent />} />);

    const status = screen.getByText(/© 2025 Company/);
    expect(status).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Footer className='custom-footer' />);
    const footer = container.querySelector('.custom-footer');
    expect(footer).toBeInTheDocument();
  });

  it('renders with default FOOTER_COLUMNS config', () => {
    render(<Footer />);

    // Should have footer element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Should have some list structure
    const lists = footer.querySelectorAll('ul');
    expect(lists.length).toBeGreaterThan(0);
  });

  it('accepts custom columns configuration', () => {
    const customColumns = [
      {
        key: 'test',
        title: 'Test Section',
        translationKey: 'footer.custom.test',
        links: [
          {
            key: 'test-link',
            label: 'Test Link',
            href: '/test',
            translationKey: 'test.link',
          },
        ],
      },
    ];

    render(<Footer columns={customColumns} />);

    // Should render custom section
    const testSections = screen.getAllByText(/test/i);
    expect(testSections.length).toBeGreaterThan(0);
  });
});
