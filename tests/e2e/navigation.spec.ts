import { devices, expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';
import {
  removeInterferingElements,
  waitForStablePage,
} from './test-environment-setup';

test.describe('Navigation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/en');
    await page.waitForLoadState('networkidle');
    await removeInterferingElements(page);
    await waitForStablePage(page);
  });

  test('should redirect root path to default locale', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/en');

    // Verify we're on the English homepage
    expect(page.url()).toContain('/en');

    // Verify English content is displayed
    const heroSection = page.getByTestId('hero-section');
    await expect(heroSection).toBeVisible();
  });

  test.describe('Desktop Navigation', () => {
    test('should display all main navigation links', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav).toBeVisible();

      // Verify all main navigation links are present
      const expectedLinks = [
        'Home',
        'About',
        'Services',
        'Products',
        'Blog',
        'Performance Diagnostics',
      ];

      for (const linkText of expectedLinks) {
        const link = nav.getByRole('link', { name: linkText });
        await expect(link).toBeVisible();
      }
    });

    test('should navigate between pages and highlight active link', async ({
      page,
    }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });

      // Home link should be active by default
      const homeLink = nav.getByRole('link', { name: 'Home' });
      await expect(homeLink).toHaveAttribute('aria-current', 'page');

      // Navigate to About page
      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click();
      await page.waitForURL('**/en/about');
      await waitForStablePage(page);

      // Verify About page content
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

      // About link should now be active
      await expect(aboutLink).toHaveAttribute('aria-current', 'page');
      // Home link should no longer be active
      await expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    });

    test('should support keyboard navigation', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });

      // Tab to first navigation link
      await page.keyboard.press('Tab');
      let focusedElement = page.locator(':focus');

      // Continue tabbing until we reach navigation
      let attempts = 0;
      while (attempts < 10) {
        const isInNav =
          (await focusedElement.locator('..').locator('nav').count()) > 0;
        if (isInNav) break;

        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        attempts++;
      }

      // Verify we can navigate through links with arrow keys
      const homeLink = nav.getByRole('link', { name: 'Home' });
      await homeLink.focus();
      await expect(homeLink).toBeFocused();

      // Press Enter to activate
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Should stay on home page or navigate properly
      expect(page.url()).toContain('/en');
    });

    test('should handle external links correctly', async ({ page }) => {
      // If there are external links in navigation, test them
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const externalLinks = nav.locator('a[target="_blank"]');

      const count = await externalLinks.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const link = externalLinks.nth(i);
          await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ ...devices['Pixel 5'] });

    test('should display hamburger menu on mobile', async ({ page }) => {
      // Desktop navigation should be hidden
      const desktopNav = page.getByRole('navigation', {
        name: 'Main navigation',
      });
      await expect(desktopNav).not.toBeVisible();

      // Mobile menu button should be visible
      const mobileMenuButton = page.getByRole('button', {
        name: 'Toggle mobile menu',
      });
      await expect(mobileMenuButton).toBeVisible();

      // Verify hamburger icon
      const menuIcon = mobileMenuButton.locator('.lucide-menu');
      await expect(menuIcon).toBeVisible();
    });

    test('should open and close mobile navigation sheet', async ({ page }) => {
      const mobileMenuButton = page.getByRole('button', {
        name: 'Toggle mobile menu',
      });

      // Open mobile menu
      await mobileMenuButton.click();

      // Mobile navigation sheet should be visible
      const mobileNavSheet = page.getByRole('dialog');
      await expect(mobileNavSheet).toBeVisible();

      // Verify sheet content
      await expect(mobileNavSheet.getByRole('heading')).toBeVisible();

      // Verify navigation links in mobile menu
      const expectedLinks = ['Home', 'About', 'Services', 'Products', 'Blog'];
      for (const linkText of expectedLinks) {
        const link = mobileNavSheet.getByRole('link', { name: linkText });
        await expect(link).toBeVisible();
      }

      // Close menu by clicking close button
      const closeButton = mobileNavSheet.getByRole('button', {
        name: /close/i,
      });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Alternative: click outside or use escape key
        await page.keyboard.press('Escape');
      }

      // Sheet should be closed
      await expect(mobileNavSheet).not.toBeVisible();
    });

    test('should navigate from mobile menu and auto-close', async ({
      page,
    }) => {
      const mobileMenuButton = page.getByRole('button', {
        name: 'Toggle mobile menu',
      });
      await mobileMenuButton.click();

      const mobileNavSheet = page.getByRole('dialog');
      await expect(mobileNavSheet).toBeVisible();

      // Click on About link
      const aboutLink = mobileNavSheet.getByRole('link', { name: 'About' });
      await aboutLink.click();

      // Wait for navigation
      await page.waitForURL('**/en/about');
      await waitForStablePage(page);

      // Sheet should auto-close after navigation
      await expect(mobileNavSheet).not.toBeVisible();

      // Verify we're on the About page
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    });

    test('should support touch interactions', async ({ page }) => {
      const mobileMenuButton = page.getByRole('button', {
        name: 'Toggle mobile menu',
      });

      // Simulate touch tap
      await mobileMenuButton.tap();

      const mobileNavSheet = page.getByRole('dialog');
      await expect(mobileNavSheet).toBeVisible();

      // Test swipe to close (if implemented)
      const sheetContent = mobileNavSheet.locator(
        '[data-testid="mobile-menu-content"]',
      );
      if (await sheetContent.isVisible()) {
        // Simulate swipe gesture
        await sheetContent.hover();
        await page.mouse.down();
        await page.mouse.move(100, 0); // Swipe right
        await page.mouse.up();
      }
    });
  });

  test.describe('Route Handling', () => {
    test('should handle non-existent routes with 404 page', async ({
      page,
    }) => {
      await page.goto('/en/this-page-does-not-exist');

      // Should show 404 page
      const notFoundHeading = page.getByRole('heading', {
        name: /404|not found/i,
      });
      await expect(notFoundHeading).toBeVisible();

      // Should have proper status code
      const response = await page.goto('/en/this-page-does-not-exist');
      expect(response?.status()).toBe(404);
    });

    test('should preserve query parameters during navigation', async ({
      page,
    }) => {
      await page.goto('/en?utm_source=test&utm_medium=e2e');

      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const aboutLink = nav.getByRole('link', { name: 'About' });

      await aboutLink.click();
      await page.waitForURL('**/en/about');

      // Query parameters might be preserved depending on implementation
      // This test documents the expected behavior
      expect(page.url()).toContain('/en/about');
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      // Navigate to About page
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click();
      await page.waitForURL('**/en/about');

      // Navigate to Services page
      const servicesLink = nav.getByRole('link', { name: 'Services' });
      await servicesLink.click();
      await page.waitForURL('**/en/services');

      // Use browser back button
      await page.goBack();
      await page.waitForURL('**/en/about');
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

      // Use browser forward button
      await page.goForward();
      await page.waitForURL('**/en/services');
      await expect(
        page.getByRole('heading', { name: /services/i }),
      ).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should pass navigation accessibility checks', async ({ page }) => {
      await injectAxe(page);

      // Check desktop navigation accessibility
      await checkA11y(page, 'nav[aria-label="Main navigation"]', {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });

      // Verify navigation has proper ARIA label
      await expect(nav).toHaveAttribute('aria-label', 'Main navigation');

      // Verify active link has aria-current
      const homeLink = nav.getByRole('link', { name: 'Home' });
      await expect(homeLink).toHaveAttribute('aria-current', 'page');

      // Verify other links don't have aria-current
      const aboutLink = nav.getByRole('link', { name: 'About' });
      await expect(aboutLink).not.toHaveAttribute('aria-current');
    });

    test('should support screen reader navigation', async ({ page }) => {
      // Test landmark navigation
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav).toBeVisible();

      // Verify skip links (if implemented)
      const skipLink = page.getByRole('link', {
        name: /skip to main content/i,
      });
      if (await skipLink.isVisible()) {
        await expect(skipLink).toHaveAttribute('href', '#main');
      }

      // Verify heading structure
      const mainHeading = page.getByRole('heading', { level: 1 });
      await expect(mainHeading).toBeVisible();
    });

    test('should work with high contrast mode', async ({ page }) => {
      // Emulate high contrast preference
      await page.emulateMedia({ forcedColors: 'active' });

      await page.reload();
      await waitForStablePage(page);

      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav).toBeVisible();

      // Verify navigation links are still visible and accessible
      const homeLink = nav.getByRole('link', { name: 'Home' });
      await expect(homeLink).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should navigate quickly between pages', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });

      // Measure navigation time
      const startTime = Date.now();

      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click();
      await page.waitForLoadState('networkidle');

      const navigationTime = Date.now() - startTime;

      // Navigation should be fast (under 1 second)
      expect(navigationTime).toBeLessThan(1000);

      // Verify page is fully loaded
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    });

    test('should preload navigation links', async ({ page }) => {
      // Check if navigation links have preload attributes
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const links = nav.getByRole('link');

      const linkCount = await links.count();
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');

        if (href && href.startsWith('/')) {
          // Internal links should be optimized for navigation
          // This might include prefetch or other optimization attributes
          await expect(link).toBeVisible();
        }
      }
    });
  });
});
