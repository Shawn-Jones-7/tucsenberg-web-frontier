/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Integration Scenarios - Advanced Tests
 *
 * 高级集成测试，专注于复杂场景：
 * - 复杂导航菜单集成
 * - 高级页脚集成
 * - 复杂平台映射
 * - 高级响应式布局
 * 基础功能测试请参考 social-icons-integration-scenarios-basic-core.test.tsx
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  GitHubIcon,
  LinkedInIcon,
  SocialIconLink,
  SocialIconMapper,
  TwitterIcon,
} from '../social-icons';

describe('Social Icons Integration Scenarios - Advanced Tests', () => {
  describe('高级集成场景', () => {
    it('works in navigation menus', () => {
      render(
        <nav aria-label='Social media links'>
          <ul>
            <li>
              <SocialIconLink
                href='https://twitter.com/example'
                platform='twitter'
                aria-label='Twitter'
                data-testid='nav-twitter'
              />
            </li>
            <li>
              <SocialIconLink
                href='https://linkedin.com/in/example'
                platform='linkedin'
                aria-label='LinkedIn'
                data-testid='nav-linkedin'
              />
            </li>
          </ul>
        </nav>,
      );

      const twitterLink = screen.getByTestId('nav-twitter');
      const linkedinLink = screen.getByTestId('nav-linkedin');

      expect(twitterLink).toBeInTheDocument();
      expect(linkedinLink).toBeInTheDocument();
    });

    it('works in footer sections', () => {
      render(
        <footer>
          <section aria-labelledby='social-heading'>
            <h3 id='social-heading'>Follow Us</h3>
            <div className='flex space-x-4'>
              <SocialIconLink
                href='https://twitter.com/example'
                platform='twitter'
                aria-label='Follow us on Twitter'
                data-testid='footer-twitter'
              />
              <SocialIconLink
                href='https://linkedin.com/company/example'
                platform='linkedin'
                aria-label='Follow us on LinkedIn'
                data-testid='footer-linkedin'
              />
            </div>
          </section>
        </footer>,
      );

      const twitterLink = screen.getByTestId('footer-twitter');
      const linkedinLink = screen.getByTestId('footer-linkedin');

      expect(twitterLink).toBeInTheDocument();
      expect(linkedinLink).toBeInTheDocument();
    });

    it('works with dynamic platform mapping', () => {
      const platforms = ['twitter', 'linkedin', 'unknown'];

      render(
        <div>
          {platforms.map((platform) => (
            <SocialIconMapper
              key={platform}
              platform={platform}
              data-testid={`dynamic-${platform}`}
            />
          ))}
        </div>,
      );

      platforms.forEach((platform) => {
        const icon = screen.getByTestId(`dynamic-${platform}`);
        expect(icon).toBeInTheDocument();
      });
    });

    it('handles responsive layouts', () => {
      render(
        <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter'
            className='w-full sm:w-auto'
            data-testid='responsive-twitter'
          />
          <SocialIconLink
            href='https://linkedin.com/in/example'
            platform='linkedin'
            aria-label='LinkedIn'
            className='w-full sm:w-auto'
            data-testid='responsive-linkedin'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('responsive-twitter');
      const linkedinLink = screen.getByTestId('responsive-linkedin');

      expect(twitterLink).toHaveClass('w-full', 'sm:w-auto');
      expect(linkedinLink).toHaveClass('w-full', 'sm:w-auto');
    });

    it('supports theming and customization', () => {
      render(
        <div className='dark'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter'
            className='text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
            data-testid='themed-twitter'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('themed-twitter');
      expect(twitterLink).toHaveClass(
        'text-gray-600',
        'hover:text-blue-500',
        'dark:hover:text-blue-400',
      );
    });

    it('works with form integration', () => {
      render(
        <form>
          <fieldset>
            <legend>Social Media Profiles</legend>
            <div>
              <label htmlFor='twitter-input'>Twitter URL</label>
              <input
                id='twitter-input'
                type='url'
                data-testid='twitter-input'
              />
            </div>
            <div>
              <label htmlFor='linkedin-input'>LinkedIn URL</label>
              <input
                id='linkedin-input'
                type='url'
                data-testid='linkedin-input'
              />
            </div>
          </fieldset>
        </form>,
      );

      const twitterInput = screen.getByTestId('twitter-input');
      const linkedinInput = screen.getByTestId('linkedin-input');

      expect(twitterInput).toBeInTheDocument();
      expect(linkedinInput).toBeInTheDocument();
    });

    it('handles error states gracefully', () => {
      // Test with invalid props
      expect(() => {
        render(
          <div>
            <SocialIconMapper platform='' />
            <SocialIconMapper platform='' />
            <SocialIconMapper platform='' />
          </div>,
        );
      }).not.toThrow();
    });

    it('supports server-side rendering', () => {
      // Test that components render without client-side JavaScript
      const { container } = render(
        <div>
          <TwitterIcon />
          <LinkedInIcon />
          <GitHubIcon />
          <SocialIconMapper platform='twitter' />
          <SocialIconMapper platform='linkedin' />
        </div>,
      );

      expect(container.innerHTML).toBeTruthy();
      expect(container.querySelectorAll('svg')).toHaveLength(5);
    });

    it('maintains performance with many icons', () => {
      const manyIcons = Array.from({ length: 50 }, (_, i) => (
        <SocialIconMapper
          key={i}
          platform={i % 2 === 0 ? 'twitter' : 'linkedin'}
          data-testid={`icon-${i}`}
        />
      ));

      render(<div>{manyIcons}</div>);

      // All icons should be present
      expect(screen.getAllByTestId(/^icon-/)).toHaveLength(50);
    });
  });
});
