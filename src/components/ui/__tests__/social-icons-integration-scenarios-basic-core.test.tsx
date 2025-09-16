/**
 * @vitest-environment jsdom
 */

/**
 * Social Icons Integration Scenarios - Core Basic Tests
 *
 * 核心基本集成测试，专注于最重要的功能：
 * - 基本导航菜单集成
 * - 核心页脚集成
 * - 基本平台映射
 * - 基础响应式布局
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SocialIconLink, SocialIconMapper } from '@/components/ui/social-icons';

describe('Social Icons Integration Scenarios - Core Basic Tests', () => {
  describe('核心导航菜单集成', () => {
    it('works in basic navigation menus', () => {
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
      expect(twitterLink).toHaveAttribute(
        'href',
        'https://twitter.com/example',
      );
      expect(linkedinLink).toHaveAttribute(
        'href',
        'https://linkedin.com/in/example',
      );
    });

    it('maintains accessibility in navigation context', () => {
      render(
        <nav aria-label='Social media links'>
          <SocialIconLink
            href='https://github.com/example'
            platform='github'
            aria-label='GitHub Profile'
            data-testid='nav-github'
          />
        </nav>,
      );

      const githubLink = screen.getByTestId('nav-github');
      expect(githubLink).toHaveAttribute('aria-label', 'GitHub Profile');
      expect(githubLink).toHaveAttribute('role', 'link');
    });
  });

  describe('核心页脚集成', () => {
    it('works in basic footer layouts', () => {
      render(
        <footer>
          <div className='social-links'>
            <SocialIconLink
              href='https://twitter.com/company'
              platform='twitter'
              iconSize={16}
              aria-label='Follow us on Twitter'
              data-testid='footer-twitter'
            />
            <SocialIconLink
              href='https://github.com/company'
              platform='github'
              iconSize={16}
              aria-label='Follow us on GitHub'
              data-testid='footer-github'
            />
          </div>
        </footer>,
      );

      const twitterLink = screen.getByTestId('footer-twitter');
      const githubLink = screen.getByTestId('footer-github');

      expect(twitterLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
      expect(twitterLink).toHaveClass('h-4', 'w-4');
      expect(githubLink).toHaveClass('h-4', 'w-4');
    });

    it('handles footer responsive sizing', () => {
      render(
        <footer>
          <SocialIconLink
            href='https://linkedin.com/company/example'
            platform='linkedin'
            iconSize={32}
            className='md:h-8 md:w-8'
            aria-label='Connect with us on LinkedIn'
            data-testid='footer-linkedin'
          />
        </footer>,
      );

      const linkedinLink = screen.getByTestId('footer-linkedin');
      expect(linkedinLink).toHaveClass('h-6', 'w-6', 'md:h-8', 'md:w-8');
    });
  });

  describe('核心平台映射', () => {
    it('maps basic platforms correctly', () => {
      const platforms = ['twitter', 'github', 'linkedin'] as const;

      platforms.forEach((platform) => {
        render(
          <SocialIconMapper
            platform={platform}
            data-testid={`mapper-${platform}`}
          />,
        );

        const icon = screen.getByTestId(`mapper-${platform}`);
        expect(icon).toBeInTheDocument();
      });
    });

    it('handles unknown platforms gracefully', () => {
      render(
        <SocialIconMapper
          platform='unknown'
          data-testid='mapper-unknown'
        />,
      );

      const icon = screen.getByTestId('mapper-unknown');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('基础响应式布局', () => {
    it('applies responsive classes correctly', () => {
      render(
        <div className='flex space-x-2 md:space-x-4'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            iconSize={20}
            className='md:h-6 md:w-6'
            aria-label='Follow us on Twitter'
            data-testid='responsive-twitter'
          />
          <SocialIconLink
            href='https://github.com/example'
            platform='github'
            iconSize={20}
            className='md:h-6 md:w-6'
            aria-label='Follow us on GitHub'
            data-testid='responsive-github'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('responsive-twitter');
      const githubLink = screen.getByTestId('responsive-github');

      expect(twitterLink).toHaveClass('h-4', 'w-4', 'md:h-6', 'md:w-6');
      expect(githubLink).toHaveClass('h-4', 'w-4', 'md:h-6', 'md:w-6');
    });

    it('maintains layout structure in responsive containers', () => {
      render(
        <div className='grid grid-cols-3 gap-2 md:flex md:space-x-4'>
          <SocialIconLink
            href='https://twitter.com/example'
            platform='twitter'
            aria-label='Follow us on Twitter'
            data-testid='grid-twitter'
          />
          <SocialIconLink
            href='https://github.com/example'
            platform='github'
            aria-label='Follow us on GitHub'
            data-testid='grid-github'
          />
          <SocialIconLink
            href='https://linkedin.com/in/example'
            platform='linkedin'
            aria-label='Connect with us on LinkedIn'
            data-testid='grid-linkedin'
          />
        </div>,
      );

      const twitterLink = screen.getByTestId('grid-twitter');
      const githubLink = screen.getByTestId('grid-github');
      const linkedinLink = screen.getByTestId('grid-linkedin');

      expect(twitterLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
      expect(linkedinLink).toBeInTheDocument();
    });
  });

  describe('基础主题定制', () => {
    it('applies custom theme classes', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          className='text-blue-500 hover:text-blue-600'
          aria-label='Follow us on Twitter'
          data-testid='themed-twitter'
        />,
      );

      const twitterLink = screen.getByTestId('themed-twitter');
      expect(twitterLink).toHaveClass('text-blue-500', 'hover:text-blue-600');
    });

    it('supports dark mode classes', () => {
      render(
        <SocialIconLink
          href='https://github.com/example'
          platform='github'
          className='text-gray-600 dark:text-gray-300'
          aria-label='Follow us on GitHub'
          data-testid='dark-github'
        />,
      );

      const githubLink = screen.getByTestId('dark-github');
      expect(githubLink).toHaveClass('text-gray-600', 'dark:text-gray-300');
    });
  });

  describe('边缘情况测试', () => {
    it('handles empty href gracefully', () => {
      render(
        <SocialIconLink
          href=''
          platform='twitter'
          aria-label='Follow us on Twitter'
          data-testid='empty-href'
        />,
      );

      const link = screen.getByTestId('empty-href');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '');
    });

    it('handles missing platform gracefully', () => {
      render(
        <SocialIconLink
          href='https://example.com'
          platform=''
          aria-label='Follow us'
          data-testid='missing-platform'
        />,
      );

      const link = screen.getByTestId('missing-platform');
      expect(link).toBeInTheDocument();
    });

    it('handles invalid size values', () => {
      render(
        <SocialIconLink
          href='https://twitter.com/example'
          platform='twitter'
          iconSize={20}
          aria-label='Follow us on Twitter'
          data-testid='invalid-size'
        />,
      );

      const link = screen.getByTestId('invalid-size');
      expect(link).toBeInTheDocument();
    });
  });
});
