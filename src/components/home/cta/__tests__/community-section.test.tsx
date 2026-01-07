import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SITE_CONFIG } from '@/config/paths/site-config';
import { CommunitySection } from '../community-section';

describe('CommunitySection', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'community.title': 'Join Our Community',
      'community.description': 'Connect with other developers',
      'community.discussions': 'GitHub Discussions',
      'community.issues': 'Report Issues',
    };
    return translations[key] ?? key;
  });

  it('should render community section with title and description', () => {
    render(<CommunitySection t={mockT} />);

    expect(screen.getByText('Join Our Community')).toBeInTheDocument();
    expect(
      screen.getByText('Connect with other developers'),
    ).toBeInTheDocument();
  });

  it('should render discussion and issues links', () => {
    render(<CommunitySection t={mockT} />);

    const discussionsLink = screen.getByRole('link', {
      name: /GitHub Discussions/i,
    });
    const issuesLink = screen.getByRole('link', { name: /Report Issues/i });

    expect(discussionsLink).toHaveAttribute(
      'href',
      `${SITE_CONFIG.social.github}/discussions`,
    );
    expect(issuesLink).toHaveAttribute(
      'href',
      `${SITE_CONFIG.social.github}/issues`,
    );
  });

  it('should have external link attributes for security', () => {
    render(<CommunitySection t={mockT} />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('should call translation function with correct keys', () => {
    render(<CommunitySection t={mockT} />);

    expect(mockT).toHaveBeenCalledWith('community.title');
    expect(mockT).toHaveBeenCalledWith('community.description');
    expect(mockT).toHaveBeenCalledWith('community.discussions');
    expect(mockT).toHaveBeenCalledWith('community.issues');
  });
});
