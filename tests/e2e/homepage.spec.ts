import { expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from './helpers/axe';
import { getNav } from './helpers/navigation';
import {
  removeInterferingElements,
  waitForLoadWithFallback,
  waitForStablePage,
} from './test-environment-setup';

test.describe('Homepage Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for stable state
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/en');
    await waitForLoadWithFallback(page, {
      context: 'homepage beforeEach',
      loadTimeout: 5_000,
      fallbackDelay: 500,
    });
    await removeInterferingElements(page);
    await waitForStablePage(page);
  });

  test('should load homepage with all core sections', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Tucsenberg/);

    // Verify all 5 core sections are present and visible using semantic selectors
    const heroSection = page.getByTestId('hero-section');
    const sections = page.locator('section');

    // Should have at least 6 sections
    await expect(sections).toHaveCount(6);

    // Verify hero section is visible
    await expect(heroSection).toBeVisible();

    // Verify main heading exists
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();

    // Verify navigation is present (desktop or mobile)
    const nav = getNav(page);
    const mobileMenuButton = page.getByRole('button', {
      name: /open.*menu|menu/i,
    });

    // On mobile, check for hamburger menu; on desktop, check for nav
    const isMobile = page.viewportSize()?.width
      ? page.viewportSize()!.width < 768
      : false;
    if (isMobile) {
      await expect(mobileMenuButton).toBeVisible();
    } else {
      await expect(nav).toBeVisible();
    }
  });

  test('should display hero section with correct content and animations', async ({
    page,
  }) => {
    const heroSection = page.getByTestId('hero-section');

    // Verify hero badge with version
    const heroBadge = heroSection.locator('.badge, [class*="badge"]').first();
    if (await heroBadge.isVisible()) {
      await expect(heroBadge).toContainText('🚀');
    }

    // Verify hero title with gradient text
    const heroTitle = page.getByRole('heading', { level: 1 });
    await expect(heroTitle).toBeVisible();

    // Check for gradient text styling
    const gradientText = heroTitle.locator(
      '.bg-gradient-to-r, [class*="gradient"]',
    );
    if ((await gradientText.count()) > 0) {
      await expect(gradientText.first()).toBeVisible();
    }

    // Verify tech stack badges - look for common tech names
    await expect(page.getByText('Next.js').first()).toBeVisible();
    await expect(page.getByText('React').first()).toBeVisible();
    await expect(page.getByText('TypeScript').first()).toBeVisible();
    await expect(page.getByText('Tailwind').first()).toBeVisible();

    // Verify CTA buttons exist
    const buttons = page.getByRole('link');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Look for external links (GitHub)
    const externalLinks = page.locator('a[target="_blank"]');
    const externalCount = await externalLinks.count();
    if (externalCount > 0) {
      await expect(externalLinks.first()).toHaveAttribute('rel', /noopener/);
    }

    // Verify stats section exists
    const statsGrid = heroSection.locator('.grid, [class*="grid"]');
    if ((await statsGrid.count()) > 0) {
      await expect(statsGrid.last()).toBeVisible();
    }
  });

  test('should handle CTA button interactions correctly', async ({ page }) => {
    const heroSection = page.getByTestId('hero-section');

    // Look for buttons/links in hero section
    const links = heroSection.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    // Test for anchor links (demo button)
    const anchorLinks = heroSection.locator('a[href^="#"]');
    if ((await anchorLinks.count()) > 0) {
      const demoButton = anchorLinks.first();
      await expect(demoButton).toBeVisible();
    }

    // Test for external links (GitHub)
    const externalLinks = heroSection.locator('a[target="_blank"]');
    if ((await externalLinks.count()) > 0) {
      const githubButton = externalLinks.first();
      await expect(githubButton).toBeVisible();
      await expect(githubButton).toHaveAttribute('rel', /noopener/);

      // Test hover interaction
      await githubButton.hover();

      // Look for icons
      const icons = githubButton.locator('svg, [class*="lucide"]');
      if ((await icons.count()) > 0) {
        await expect(icons.first()).toBeVisible();
      }
    }
  });

  test.describe('Responsive Design Tests', () => {
    test('should display correctly on desktop (1920x1080)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForLoadWithFallback(page, {
        context: 'desktop viewport reload',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });
      await waitForStablePage(page);

      const heroSection = page.getByTestId('hero-section');

      // Verify desktop layout
      await expect(heroSection).toBeVisible();

      // Check that desktop navigation is visible
      const mainNav = getNav(page);
      await expect(mainNav).toBeVisible();

      // Verify hero content is properly sized
      const heroTitle = page.getByRole('heading', { level: 1 });
      await expect(heroTitle).toBeVisible();

      // Verify responsive classes are applied (check for large text classes)
      const hasLargeText = await heroTitle.evaluate((el) => {
        const classes = el.className;
        return (
          classes.includes('text-4xl') ||
          classes.includes('text-6xl') ||
          classes.includes('text-7xl')
        );
      });
      expect(hasLargeText).toBe(true);
    });

    test('should display correctly on tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForLoadWithFallback(page, {
        context: 'tablet viewport reload',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });
      await waitForStablePage(page);

      const heroSection = page.getByTestId('hero-section');
      await expect(heroSection).toBeVisible();

      // Verify responsive text sizing
      const heroTitle = page.getByRole('heading', { level: 1 });
      await expect(heroTitle).toBeVisible();

      // Check that content is still accessible
      const navigation = getNav(page);
      await expect(navigation).toBeVisible();
    });

    test('should display correctly on mobile (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForLoadWithFallback(page, {
        context: 'mobile viewport reload',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });
      await waitForStablePage(page);

      const heroSection = page.getByTestId('hero-section');
      await expect(heroSection).toBeVisible();

      // Verify mobile navigation is used (look for hamburger menu)
      const mobileMenuButton = page
        .getByRole('button')
        .filter({ hasText: /menu|toggle/i });
      if ((await mobileMenuButton.count()) > 0) {
        await expect(mobileMenuButton.first()).toBeVisible();
      }

      // Verify content is accessible on mobile
      const heroTitle = page.getByRole('heading', { level: 1 });
      await expect(heroTitle).toBeVisible();

      // Verify buttons/links are accessible
      const links = heroSection.getByRole('link');
      if ((await links.count()) > 0) {
        await expect(links.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should load within performance budgets', async ({ page }) => {
      const navigationStart = Date.now();

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/en');
      await waitForLoadWithFallback(page, {
        context: 'performance budget load',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });

      const loadMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;

        if (navigation) {
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd,
            loadEventEnd: navigation.loadEventEnd,
          };
        }

        const { timing } = performance;
        return {
          domContentLoaded:
            timing.domContentLoadedEventEnd - timing.navigationStart,
          loadEventEnd: timing.loadEventEnd - timing.navigationStart,
        };
      });

      const loadTime =
        (loadMetrics.loadEventEnd && loadMetrics.loadEventEnd > 0
          ? loadMetrics.loadEventEnd
          : loadMetrics.domContentLoaded) ?? Date.now() - navigationStart;

      // Verify page loads within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Check Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const webVitals: { lcp?: number; fid?: number; cls?: number } = {};

            entries.forEach((entry) => {
              const perfEntry = entry as unknown as {
                name: string;
                value: number;
              };
              if (perfEntry.name === 'LCP') {
                webVitals.lcp = perfEntry.value;
              }
              if (perfEntry.name === 'FID') {
                webVitals.fid = perfEntry.value;
              }
              if (perfEntry.name === 'CLS') {
                webVitals.cls = perfEntry.value;
              }
            });

            resolve(webVitals);
          }).observe({
            entryTypes: [
              'largest-contentful-paint',
              'first-input',
              'layout-shift',
            ],
          });

          // Fallback timeout
          setTimeout(() => resolve({}), 3000);
        });
      });

      // Verify Core Web Vitals thresholds (if available)
      const typedVitals = vitals as {
        lcp?: number;
        fid?: number;
        cls?: number;
      };
      if (typedVitals.lcp) {
        expect(typedVitals.lcp).toBeLessThan(2500); // LCP < 2.5s
      }
      if (typedVitals.fid) {
        expect(typedVitals.fid).toBeLessThan(100); // FID < 100ms
      }
      if (typedVitals.cls) {
        expect(typedVitals.cls).toBeLessThan(0.1); // CLS < 0.1
      }
    });

    test('should handle slow network conditions gracefully', async ({
      page,
    }) => {
      // Simulate slow 3G network
      await page.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/en');
      await waitForLoadWithFallback(page, {
        context: 'slow network load',
        loadTimeout: 8_000,
        fallbackDelay: 500,
      });

      // Verify core content is still visible
      const heroSection = page.getByTestId('hero-section');
      await expect(heroSection).toBeVisible();

      // Verify loading states are handled properly
      const heroTitle = heroSection.locator('h1');
      await expect(heroTitle).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should pass automated accessibility checks', async ({ page }) => {
      await injectAxe(page);

      // Run axe-core accessibility checks
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('should support keyboard navigation', async ({ page }) => {
      // For cross-browser stability, directly focus a known interactive control
      const demoButton = page.getByRole('link', { name: /demo/i }).first();
      await expect(demoButton).toBeVisible();
      await demoButton.focus();
      await expect(demoButton).toBeFocused();
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA attributes and semantic structure', async ({
      page,
    }) => {
      const heroSection = page.getByTestId('hero-section');

      // Verify semantic structure exists
      await expect(heroSection).toBeVisible();

      // Verify heading hierarchy
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();

      // Verify navigation has proper structure (desktop or mobile)
      const nav = getNav(page);
      const mobileMenuButton = page.getByRole('button', {
        name: /open.*menu|menu/i,
      });

      // On mobile, check for hamburger menu; on desktop, check for nav
      const isMobile = page.viewportSize()?.width
        ? page.viewportSize()!.width < 768
        : false;
      if (isMobile) {
        await expect(mobileMenuButton).toBeVisible();
      } else {
        await expect(nav).toBeVisible();
      }

      // Verify links have href attributes
      const links = page.getByRole('link');
      const linkCount = await links.count();
      if (linkCount > 0) {
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = links.nth(i);
          await expect(link).toHaveAttribute('href');
        }
      }
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/en');
      await waitForLoadWithFallback(page, {
        context: 'reduced motion load',
        loadTimeout: 5_000,
        fallbackDelay: 500,
      });
      await waitForStablePage(page);

      // Verify animations are disabled or reduced
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // Check that elements are immediately visible (no animation delays)
      const heroTitle = page.getByRole('heading', { level: 1 });
      await expect(heroTitle).toBeVisible();

      // Verify content is accessible without animations (desktop or mobile)
      const nav = getNav(page);
      const mobileMenuButton = page.getByRole('button', {
        name: /open.*menu|menu/i,
      });

      // On mobile, check for hamburger menu; on desktop, check for nav
      const isMobile = page.viewportSize()?.width
        ? page.viewportSize()!.width < 768
        : false;
      if (isMobile) {
        await expect(mobileMenuButton).toBeVisible();
      } else {
        await expect(nav).toBeVisible();
      }
    });
  });
});
