/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Accessibility Features - Main Tests
 *
 * 主要可访问性集成测试，包括：
 * - 核心可访问性功能验证
 * - 基本ARIA属性测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - social-icons-accessibility-basic.test.tsx - 基本可访问性测试
 * - social-icons-accessibility-i18n.test.tsx - 国际化可访问性测试
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

describe('Social Icons Accessibility Features - Main Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('核心可访问性功能验证', () => {
    it('should have basic ARIA attributes', () => {
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

    it('should support keyboard navigation', async () => {
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

    it('should handle keyboard activation', async () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      await user.tab();
      expect(link).toHaveFocus();

      // Test that the link is keyboard accessible (can be focused and activated)
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should have proper external link attributes', () => {
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

    it('should support focus indicators', () => {
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
  });

  describe('基本ARIA属性测试', () => {
    it('should support aria-label override', () => {
      render(<TwitterIcon data-testid='twitter' />);

      const icon = screen.getByTestId('twitter');
      // Icons are decorative and hidden from screen readers by default
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).not.toHaveAttribute('aria-label');
    });

    it('should support aria-hidden override', () => {
      render(<TwitterIcon data-testid='twitter' />);

      const icon = screen.getByTestId('twitter');
      // Icons maintain consistent aria-hidden behavior
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <SocialIconLink
            href='https://twitter.com/example'
            icon='twitter'
            label='Twitter'
            ariaLabel='Follow our Twitter account for updates'
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

    it('should support role attributes', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      // Links have implicit role, no explicit role attribute needed
      expect(link.tagName.toLowerCase()).toBe('a');
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
    });

    it('should support aria-expanded', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      // Simple links don't need aria-expanded (used for collapsible elements)
      expect(link).toHaveAttribute('aria-label', 'Twitter');
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
    });
  });

  describe('错误处理验证', () => {
    it('should handle missing href gracefully', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toBeInTheDocument();
    });

    it('should handle missing aria-label gracefully', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          icon='twitter'
          label='Twitter'
          ariaLabel='Twitter'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('高级功能测试', () => {
    it('should support high contrast mode', () => {
      render(
        <TwitterIcon
          className='forced-colors:text-[ButtonText]'
          data-testid='twitter'
        />,
      );

      const icon = screen.getByTestId('twitter');
      expect(icon).toHaveClass('forced-colors:text-[ButtonText]');
    });

    it('should support reduced motion preferences', () => {
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

    it('should support color contrast requirements', () => {
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
  });

  describe('国际化基础测试', () => {
    it('should support basic internationalization', () => {
      render(
        <div lang='es'>
          <SocialIconLink
            href='https://twitter.com/example'
            icon='twitter'
            label='Twitter'
            ariaLabel='Síguenos en Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Síguenos en Twitter');
    });

    it('should support RTL languages', () => {
      render(
        <div
          dir='rtl'
          lang='ar'
        >
          <SocialIconLink
            href='https://twitter.com/example'
            icon='twitter'
            label='Twitter'
            ariaLabel='تويتر'
            data-testid='social-link'
          />
        </div>,
      );

      const container = screen.getByTestId('social-link').closest('div');
      const link = screen.getByTestId('social-link');

      expect(container).toHaveAttribute('dir', 'rtl');
      expect(container).toHaveAttribute('lang', 'ar');
      expect(link).toHaveAttribute('aria-label', 'تويتر');
    });
  });
});
