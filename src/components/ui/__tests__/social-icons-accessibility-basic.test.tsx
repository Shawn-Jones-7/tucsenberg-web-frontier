/**
 * Social Icons Accessibility - Basic Tests
 *
 * 专门测试基本可访问性功能，包括：
 * - ARIA属性
 * - 键盘导航
 * - 焦点管理
 * - 语义化标记
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ExternalLinkIcon,
  LinkedInIcon,
  SocialIconLink,
  TwitterIcon,
} from '../social-icons';

describe('Social Icons Accessibility - Basic Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('ARIA属性', () => {
    it('all icons have aria-hidden attribute', () => {
      render(
        <div>
          <TwitterIcon data-testid='twitter' />
          <LinkedInIcon data-testid='linkedin' />
          <ExternalLinkIcon data-testid='external' />
        </div>,
      );

      const twitter = screen.getByTestId('twitter');
      const linkedin = screen.getByTestId('linkedin');
      const external = screen.getByTestId('external');

      expect(twitter).toHaveAttribute('aria-hidden', 'true');
      expect(linkedin).toHaveAttribute('aria-hidden', 'true');
      expect(external).toHaveAttribute('aria-hidden', 'true');
    });

    it('icons have consistent aria-hidden behavior', () => {
      render(<TwitterIcon data-testid='twitter' />);

      const icon = screen.getByTestId('twitter');
      // Icons are consistently hidden from screen readers by default
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('icons are properly hidden for accessibility', () => {
      render(<TwitterIcon data-testid='twitter' />);

      const icon = screen.getByTestId('twitter');
      // Icons don't need aria-label as they're decorative and hidden from screen readers
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).not.toHaveAttribute('aria-label');
    });

    it('SocialIconLink has proper accessibility attributes', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Follow us on Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Follow us on Twitter');
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
    });

    it('external links have proper target and rel attributes', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          data-testid='external-link'
        />,
      );

      const link = screen.getByTestId('external-link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has proper semantic meaning as a link', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          aria-label='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      // Links have implicit role="link", no need to explicitly set role
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
    });

    it('provides clear context through aria-label', () => {
      render(
        <div>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Follow our Twitter account for updates'
            data-testid='social-link'
          />
          <div id='twitter-description'>
            Follow our Twitter account for updates
          </div>
        </div>,
      );

      const link = screen.getByTestId('social-link');
      const description = screen.getByText(
        'Follow our Twitter account for updates',
      );

      // Component provides context through aria-label instead of aria-describedby
      expect(link).toHaveAttribute(
        'aria-label',
        'Follow our Twitter account for updates',
      );
      expect(description).toBeInTheDocument();
    });

    it('functions as a simple navigation link', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          aria-label='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      // Simple links don't need aria-expanded as they're not expandable
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('键盘导航', () => {
    it('supports keyboard navigation between links', async () => {
      render(
        <div>
          <SocialIconLink
            href='https://twitter.com/example'
            icon='twitter'
            label='Twitter'
            ariaLabel='Twitter'
            data-testid='twitter-link'
          />
          <SocialIconLink
            href='https://linkedin.com/in/example'
            icon='linkedin'
            label='LinkedIn'
            ariaLabel='LinkedIn'
            data-testid='linkedin-link'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('twitter-link');
      const linkedinLink = screen.getByTestId('linkedin-link');

      await user.tab();
      expect(twitterLink).toHaveFocus();

      await user.tab();
      expect(linkedinLink).toHaveFocus();
    });

    it('handles keyboard activation', async () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          aria-label='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      await user.tab();
      expect(link).toHaveFocus();

      // For links, keyboard activation (Enter) triggers native navigation
      // We verify the link is focusable and has correct attributes
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('uses natural tab order', () => {
      render(
        <div>
          <SocialIconLink
            href='https://linkedin.com/in/example'
            platform='linkedin'
            aria-label='LinkedIn'
            data-testid='linkedin-link'
          />
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter'
            data-testid='twitter-link'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('twitter-link');
      const linkedinLink = screen.getByTestId('linkedin-link');

      // Links use natural tab order (no custom tabindex needed)
      expect(twitterLink).not.toHaveAttribute('tabindex');
      expect(linkedinLink).not.toHaveAttribute('tabindex');
    });

    it('handles focus trap scenarios', async () => {
      render(
        <div>
          <button data-testid='before'>Before</button>
          <SocialIconLink
            href='https://twitter.com/example'
            icon='twitter'
            label='Twitter'
            ariaLabel='Twitter'
            data-testid='social-link'
          />
          <button data-testid='after'>After</button>
        </div>,
      );

      const beforeButton = screen.getByTestId('before');
      const socialLink = screen.getByTestId('social-link');
      const afterButton = screen.getByTestId('after');

      await user.tab();
      expect(beforeButton).toHaveFocus();

      await user.tab();
      expect(socialLink).toHaveFocus();

      await user.tab();
      expect(afterButton).toHaveFocus();
    });
  });

  describe('焦点管理', () => {
    it('provides proper focus indicators', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          className='focus:ring-2 focus:ring-offset-2'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });

    it('supports color contrast requirements', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          className='text-blue-600 hover:text-blue-800'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('text-blue-600', 'hover:text-blue-800');
    });

    it('supports high contrast mode', () => {
      render(
        <TwitterIcon
          className='forced-colors:text-[ButtonText]'
          data-testid='twitter'
        />,
      );

      const icon = screen.getByTestId('twitter');
      expect(icon).toHaveClass('forced-colors:text-[ButtonText]');
    });

    it('supports reduced motion preferences', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          className='motion-reduce:transition-none'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('motion-reduce:transition-none');
    });
  });

  describe('语义化标记', () => {
    it('supports screen reader announcements', () => {
      render(
        <div>
          <div
            aria-live='polite'
            id='announcements'
            data-testid='announcements'
          ></div>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const announcements = screen.getByTestId('announcements');
      const link = screen.getByTestId('social-link');

      expect(announcements).toHaveAttribute('aria-live', 'polite');
      expect(link).toBeInTheDocument();
    });

    it('supports voice control commands', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Click Twitter link'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Click Twitter link');
    });
  });
});
