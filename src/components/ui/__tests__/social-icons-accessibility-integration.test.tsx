/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Accessibility & Integration Tests - Index
 *
 * Basic integration tests for the Social Icons component accessibility and integration.
 * For comprehensive testing, see:
 * - social-icons-accessibility-features.test.tsx - Accessibility features tests
 * - social-icons-integration-scenarios.test.tsx - Integration scenarios tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ExternalLinkIcon,
  LinkedInIcon,
  SocialIconLink,
  SocialIconMapper,
  TwitterIcon,
} from '../social-icons';

describe('Social Icons Accessibility & Integration - Advanced Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Complex Integration Scenarios', () => {
    it('handles advanced accessibility patterns with screen readers', async () => {
      render(
        <section aria-labelledby='social-heading'>
          <h2 id='social-heading'>Connect With Us</h2>
          <div
            role='list'
            aria-label='Social media links'
          >
            <div role='listitem'>
              <SocialIconLink
                href='https://twitter.com/test'
                platform='twitter'
                aria-label='Follow us on Twitter'
              >
                <TwitterIcon />
              </SocialIconLink>
            </div>
            <div role='listitem'>
              <SocialIconLink
                href='https://linkedin.com/in/test'
                platform='linkedin'
                aria-label='Connect with us on LinkedIn'
              >
                <LinkedInIcon />
              </SocialIconLink>
            </div>
          </div>
        </section>,
      );

      const section = screen.getByRole('region');
      const heading = screen.getByRole('heading', { name: 'Connect With Us' });
      const socialList = screen.getByRole('list', {
        name: 'Social media links',
      });
      const listItems = screen.getAllByRole('listitem');

      expect(section).toHaveAttribute('aria-labelledby', 'social-heading');
      expect(heading).toBeInTheDocument();
      expect(socialList).toBeInTheDocument();
      expect(listItems).toHaveLength(2);

      // Test keyboard navigation through the list
      const links = screen.getAllByRole('link');
      for (const link of links) {
        link.focus();
        expect(link).toHaveFocus();
        await user.tab();
      }
    });

    it('handles complex dynamic social media integration', async () => {
      const socialPlatforms = [
        {
          name: 'twitter',
          url: 'https://twitter.com/company',
          icon: TwitterIcon,
        },
        {
          name: 'linkedin',
          url: 'https://linkedin.com/company/test',
          icon: LinkedInIcon,
        },
        {
          name: 'external',
          url: 'https://blog.company.com',
          icon: ExternalLinkIcon,
        },
      ];

      render(
        <div>
          <h3>Follow Our Journey</h3>
          <div className='social-grid'>
            {socialPlatforms.map(({ name, url, icon: IconComponent }) => (
              <div
                key={name}
                className='social-item'
              >
                <SocialIconLink
                  href={url}
                  platform={name}
                  aria-label={`Follow us on ${name}`}
                >
                  <IconComponent />
                </SocialIconLink>
                <span className='platform-name'>{name}</span>
              </div>
            ))}
          </div>
        </div>,
      );

      // Test all platforms are rendered
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);

      // Test each platform has correct attributes
      socialPlatforms.forEach(({ name, url }) => {
        // 使用字符串包含匹配替代正则表达式，提高安全性
        const links = screen.getAllByRole('link');
        const link = links.find(
          (link) =>
            link
              .getAttribute('aria-label')
              ?.toLowerCase()
              .includes(name.toLowerCase()) ||
            link.textContent?.toLowerCase().includes(name.toLowerCase()),
        );
        expect(link).toBeDefined();
        expect(link).toHaveAttribute('href', url);
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('External Link Attributes', () => {
    it('handles external link attributes correctly', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          aria-label='Twitter'
          data-testid='external-link'
        />,
      );

      const link = screen.getByTestId('external-link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('supports keyboard navigation between links', async () => {
      render(
        <div>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter profile'
            data-testid='twitter-link'
          />
          <SocialIconLink
            href='https://linkedin.com/in/example'
            platform='linkedin'
            aria-label='LinkedIn profile'
            data-testid='linkedin-link'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('twitter-link');
      const linkedinLink = screen.getByTestId('linkedin-link');

      // Should be able to tab between links
      await user.tab();
      expect(twitterLink).toHaveFocus();

      await user.tab();
      expect(linkedinLink).toHaveFocus();
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
          platform='twitter'
          aria-label='Twitter'
          className='motion-reduce:transition-none'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('motion-reduce:transition-none');
    });

    it('provides proper focus indicators', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          aria-label='Twitter'
          className='focus:ring-2 focus:ring-offset-2'
          data-testid='social-link'
        />,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
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

      // For links, keyboard activation (Enter) triggers navigation
      // We can verify the link is focusable and has correct href
      expect(link).toHaveAttribute('href', 'https://twitter.com/example');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('supports internationalization', () => {
      render(
        <div lang='es'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Síguenos en Twitter'
            data-testid='social-link'
          />
        </div>,
      );

      const link = screen.getByTestId('social-link');
      expect(link).toHaveAttribute('aria-label', 'Síguenos en Twitter');
    });

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

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Social media links');

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
                aria-label='Twitter'
                data-testid='footer-twitter'
              />
              <SocialIconLink
                href='https://linkedin.com/in/example'
                platform='linkedin'
                aria-label='LinkedIn'
                data-testid='footer-linkedin'
              />
            </div>
          </section>
        </footer>,
      );

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'social-heading');

      const heading = screen.getByText('Follow Us');
      expect(heading).toBeInTheDocument();

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
            data-testid='themed-link'
          />
        </div>,
      );

      const link = screen.getByTestId('themed-link');
      expect(link).toHaveClass(
        'text-gray-600',
        'dark:text-gray-300',
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
              <label htmlFor='twitter-url'>Twitter URL</label>
              <input
                id='twitter-url'
                type='url'
              />
              <SocialIconMapper
                platform='twitter'
                className='ml-2'
              />
            </div>
            <div>
              <label htmlFor='linkedin-url'>LinkedIn URL</label>
              <input
                id='linkedin-url'
                type='url'
              />
              <SocialIconMapper
                platform='linkedin'
                className='ml-2'
              />
            </div>
          </fieldset>
        </form>,
      );

      const twitterInput = screen.getByLabelText('Twitter URL');
      const linkedinInput = screen.getByLabelText('LinkedIn URL');

      expect(twitterInput).toBeInTheDocument();
      expect(linkedinInput).toBeInTheDocument();
    });

    it('handles error states gracefully', () => {
      // Test with invalid props
      expect(() => {
        render(
          <div>
            <SocialIconMapper platform='' />
            <SocialIconLink
              href=''
              platform='twitter'
              aria-label='Twitter'
            />
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
          <ExternalLinkIcon />
          <SocialIconMapper platform='twitter' />
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Twitter'
          />
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

      const _startTime = performance.now();
      render(<div>{manyIcons}</div>);
      const endTime = performance.now();

      // Should render quickly (less than 100ms for 50 icons)
      expect(endTime - _startTime).toBeLessThan(100);

      // All icons should be present
      expect(screen.getAllByTestId(/^icon-/)).toHaveLength(50);
    });
  });
});
