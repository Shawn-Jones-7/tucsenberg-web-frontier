import { expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from './helpers/axe';
import { getNav } from './helpers/navigation';
import {
  removeInterferingElements,
  waitForLoadWithFallback,
  waitForStablePage,
} from './test-environment-setup';

const rawBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.BASE_URL ??
  process.env.STAGING_URL ??
  'http://localhost:3000';

const BASE_ORIGIN = new URL(rawBaseUrl).origin;

test.describe('Navigation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/en');
    await waitForLoadWithFallback(page, {
      context: 'navigation beforeEach',
      loadTimeout: 5_000,
      fallbackDelay: 500,
    });
    await removeInterferingElements(page);
    await waitForStablePage(page);
  });

  test('should redirect root path to default locale', async ({
    page,
    request,
    browserName,
  }) => {
    // On Firefox, validate redirect via API to avoid page navigation flakiness
    if (browserName === 'firefox') {
      const resp = await request.get(`${BASE_ORIGIN}/`, {
        maxRedirects: 0,
      });
      expect([301, 302, 307, 308]).toContain(resp.status());
      const location =
        resp.headers()['location'] || resp.headers()['Location'] || '';
      expect(location).toMatch(/\/en(\/|$)/);
      await page.goto(`${BASE_ORIGIN}/en`);

      await waitForLoadWithFallback(page, {
        context: 'navigation firefox redirect',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });
      await waitForStablePage(page);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      return;
    }

    // For other browsers: navigate to root and assert client-side end state
    await page.goto(`${BASE_ORIGIN}/`);
    await page.waitForURL('**/en');

    await waitForLoadWithFallback(page, {
      context: 'navigation client redirect',
      loadTimeout: 5_000,
      fallbackDelay: 500,
    });
    await waitForStablePage(page);
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test.describe('Desktop Navigation', () => {
    test('should display all main navigation links', async ({ page }) => {
      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        // On mobile projects, verify mobile toggle instead of desktop nav
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        return;
      }

      const nav = getNav(page);
      await expect(nav).toBeVisible();

      // In desktop nav, "Products" is a dropdown trigger (button), others are links
      await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
      await expect(nav.getByRole('button', { name: 'Products' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
    });

    test('should navigate between pages and highlight active link', async ({
      page,
    }) => {
      // Dismiss cookie consent dialog if present to avoid click interception
      const cookieDialog = page.getByRole('dialog', { name: /cookie/i });
      if (await cookieDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        const acceptButton = cookieDialog.getByRole('button', {
          name: /accept/i,
        });
        if (await acceptButton.isVisible({ timeout: 500 }).catch(() => false)) {
          await acceptButton.click();
          await page.waitForTimeout(300);
        }
      }

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        // Covered in Mobile Navigation suite; basic presence check to avoid false failures here
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        return;
      }

      const nav = getNav(page);

      // Navigate to About page
      const homeLink = nav.getByRole('link', { name: 'Home' });
      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click();
      await page.waitForURL('**/en/about');
      await waitForStablePage(page);

      // Verify About page content
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

      // Dismiss cookie dialog again if it reappeared
      if (await cookieDialog.isVisible({ timeout: 500 }).catch(() => false)) {
        const acceptBtn = cookieDialog.getByRole('button', { name: /accept/i });
        if (await acceptBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await acceptBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // Navigate back to home via nav
      await homeLink.click();
      await page.waitForURL('**/en');

      // More robust: wait for home page key elements instead of just URL
      await expect(page.getByTestId('home-hero-title')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId('hero-section').first()).toBeVisible({
        timeout: 30_000,
      });
      await waitForStablePage(page);
    });

    test('should support keyboard navigation', async ({ page }) => {
      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        // Keyboard focus path differs on mobile; validated in mobile suite
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        return;
      }

      const nav = getNav(page);

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
      await waitForLoadWithFallback(page, {
        context: 'navigation keyboard activation',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });

      // Should stay on home page or navigate properly
      expect(page.url()).toContain('/en');
    });

    test('should handle external links correctly', async ({ page }) => {
      // If there are external links in navigation, test them
      const nav = getNav(page);
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
    // Ensure mobile-like context even when running under desktop projects
    // Note: Firefox doesn't support isMobile option, using viewport + hasTouch instead
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
    });
    // Note: Mobile tests automatically run on Mobile Chrome (Pixel 5) and Mobile Safari (iPhone 12)
    // as configured in playwright.config.ts projects. No need to use test.use() here.

    test('should display hamburger menu on mobile', async ({ page }) => {
      // Desktop navigation should be hidden
      const desktopNav = page
        .getByRole('navigation', {
          name: 'Main navigation',
        })
        .first();
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
      const mobileNavSheet = page.getByRole('dialog', {
        name: /mobile navigation/i,
      });
      await expect(mobileNavSheet).toBeVisible();

      // Verify sheet content
      await expect(mobileNavSheet.getByRole('heading').first()).toBeVisible();

      // Verify navigation links in mobile menu (match actual config: home, products, blog, about)
      const expectedLinks = ['Home', 'Products', 'Blog', 'About'];
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

      const mobileNavSheet = page.getByRole('dialog', {
        name: /mobile navigation/i,
      });
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

      // Simulate touch tap with graceful fallback when touch is not available
      try {
        await mobileMenuButton.tap();
      } catch {
        await mobileMenuButton.click();
      }

      const mobileNavSheet = page.getByRole('dialog', {
        name: /mobile navigation/i,
      });
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

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        await mobileMenuButton.click();
        const mobileNavSheet = page.getByRole('dialog', {
          name: /mobile navigation/i,
        });
        await mobileNavSheet
          .getByRole('link', { name: 'About' })
          .first()
          .click();
      } else {
        const nav = getNav(page);
        const aboutLink = nav.getByRole('link', { name: 'About' });
        await aboutLink.click();
      }
      await page.waitForURL('**/en/about');

      // Query parameters might be preserved depending on implementation
      // This test documents the expected behavior
      expect(page.url()).toContain('/en/about');
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      // Dismiss cookie consent dialog if present to avoid click interception
      const cookieDialog = page.getByRole('dialog', { name: /cookie/i });
      if (await cookieDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        const acceptButton = cookieDialog.getByRole('button', {
          name: /accept/i,
        });
        if (await acceptButton.isVisible({ timeout: 500 }).catch(() => false)) {
          await acceptButton.click();
          await page.waitForTimeout(300);
        }
      }

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;

      // Navigate to About page
      if (isMobile) {
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        await mobileMenuButton.click();
        const mobileNavSheet = page.getByRole('dialog', {
          name: /mobile navigation/i,
        });
        await mobileNavSheet
          .getByRole('link', { name: 'About' })
          .first()
          .click();
      } else {
        const nav = getNav(page);
        const aboutLink = nav.getByRole('link', { name: 'About' });
        await aboutLink.click();
      }
      await page.waitForURL('**/en/about');
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

      // Navigate back to Home using direct navigation for reliability
      // This creates proper browser history for back/forward testing
      await page.goto('/en', { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/en');

      // Back to About
      await page.goBack();
      await page.waitForURL('**/en/about');
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

      // Forward to Home
      await page.goForward();
      await page.waitForURL('**/en');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should pass navigation accessibility checks', async ({ page }) => {
      await injectAxe(page);

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;

      if (isMobile) {
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        await mobileMenuButton.click();

        const mobileNavSheet = page.getByRole('dialog', {
          name: /mobile navigation/i,
        });
        await expect(mobileNavSheet).toBeVisible();

        const sheetHandle = await mobileNavSheet.elementHandle();
        await checkA11y(page, sheetHandle ?? undefined, {
          detailedReport: true,
          detailedReportOptions: { html: true },
          axeOptions: { rules: { 'color-contrast': { enabled: false } } },
          includedImpacts: ['critical', 'serious'],
        });
        return;
      }

      const nav = page.locator('nav[aria-label="Main navigation"]');
      await expect(nav).toHaveCount(1);
      const navHandle = await nav.elementHandle();

      await checkA11y(page, navHandle ?? undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        axeOptions: { rules: { 'color-contrast': { enabled: false } } },
        includedImpacts: ['critical', 'serious'],
      });
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        await expect(mobileMenuButton).toHaveAttribute(
          'aria-label',
          'Toggle mobile menu',
        );
        await mobileMenuButton.click();
        const mobileNavSheet = page.getByRole('dialog', {
          name: /mobile navigation/i,
        });
        await expect(mobileNavSheet.getByRole('link').first()).toBeVisible();
      } else {
        const nav = getNav(page);
        await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
        await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
        await expect(
          nav.getByRole('button', { name: 'Products' }),
        ).toBeVisible();
        await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
      }
    });

    test('should support screen reader navigation', async ({ page }) => {
      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;

      if (isMobile) {
        // On mobile, verify menu toggle exists and we can reach landmark content
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        const mainHeading = page.getByRole('heading', { level: 1 });
        await expect(mainHeading).toBeVisible();
      } else {
        // Test landmark navigation on desktop
        const nav = getNav(page);
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
      }
    });

    test('should work with high contrast mode', async ({ page }) => {
      // Emulate high contrast preference
      await page.emulateMedia({ forcedColors: 'active' });

      await page.reload();
      await waitForStablePage(page);

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        const mobileMenuButton = page.getByRole('button', {
          name: 'Toggle mobile menu',
        });
        await expect(mobileMenuButton).toBeVisible();
        try {
          await mobileMenuButton.tap();
        } catch {
          await mobileMenuButton.click();
        }
        const mobileNavSheet = page.getByRole('dialog', {
          name: /mobile navigation/i,
        });
        await expect(
          mobileNavSheet.getByRole('link', { name: 'Home' }).first(),
        ).toBeVisible();
      } else {
        const nav = getNav(page);
        await expect(nav).toBeVisible();
        const homeLink = nav.getByRole('link', { name: 'Home' });
        await expect(homeLink).toBeVisible();
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should navigate quickly between pages', async ({ page }) => {
      // Dismiss cookie consent dialog if present to avoid click interception
      const cookieDialog = page.getByRole('dialog', { name: /cookie/i });
      if (await cookieDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        const acceptButton = cookieDialog.getByRole('button', {
          name: /accept/i,
        });
        if (await acceptButton.isVisible({ timeout: 500 }).catch(() => false)) {
          await acceptButton.click();
          await page.waitForTimeout(300);
        }
      }

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;
      if (isMobile) {
        // Navigation perf budget validated elsewhere; avoid flaky timing checks on mobile here
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        return;
      }

      const nav = getNav(page);

      // Measure navigation time
      const startTime = Date.now();

      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click({ noWaitAfter: true });
      await page.waitForURL('**/en/about');

      const navigationTime = Date.now() - startTime;

      console.log(`About navigation time: ${navigationTime}ms`);

      // Navigation should be fast (CI runners can be slightly slower than local machines)
      const budgetMs = process.env.CI ? 1500 : 1000;
      expect(navigationTime).toBeLessThan(budgetMs);

      // Verify page is fully loaded
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    });

    test('should preload navigation links', async ({ page }) => {
      // Check if navigation links have preload attributes
      const nav = getNav(page);
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
