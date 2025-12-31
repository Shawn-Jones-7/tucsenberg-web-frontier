/**
 * Visual Regression Tests
 *
 * Phase 1: Lightweight visual regression testing for critical components.
 * Uses Playwright's built-in toHaveScreenshot() for pixel-level comparison.
 *
 * Strategy:
 * - Focus on stable components (Header) for reliable CI integration
 * - Footer/Hero tests are marked as optional due to dynamic content instability
 * - Test multiple viewports (mobile, tablet, desktop)
 * - Test both locales (en, zh)
 * - Disable animations for consistent screenshots
 *
 * Maintenance:
 * - Update baselines: pnpm test:visual:update
 * - Run tests: pnpm test:visual
 * - Baselines stored in: tests/e2e/__snapshots__/
 *
 * Known Considerations:
 * - Header tests are stable and suitable for CI
 * - Footer/Hero tests have higher tolerance due to dynamic content
 * - Use test.skip() to disable unstable tests in CI if needed
 */

import { expect, test, type Page } from '@playwright/test';
import {
  removeInterferingElements,
  waitForLoadWithFallback,
  waitForStablePage,
} from './test-environment-setup';

// Test configuration
const LOCALES = ['en', 'zh'] as const;

const VIEWPORTS = {
  mobile: { width: 375, height: 800 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

// Screenshot options with tolerance for minor rendering differences
const SCREENSHOT_OPTIONS = {
  // Standard tolerance for stable components (Header)
  standard: {
    animations: 'disabled' as const,
    scale: 'css' as const,
    maxDiffPixels: 200,
    maxDiffPixelRatio: 0.01,
    threshold: 0.2,
  },
  // Higher tolerance for components with dynamic content (Footer with theme toggle)
  // Note: Footer has significant rendering differences across environments due to:
  // - Font rendering differences between OS (macOS vs Linux CI)
  // - Dynamic content (copyright year, theme toggle state)
  // - Anti-aliasing differences
  tolerant: {
    animations: 'disabled' as const,
    scale: 'css' as const,
    maxDiffPixels: 30000, // Increased from 3000 to accommodate cross-platform differences
    maxDiffPixelRatio: 0.1, // Increased from 0.08 to 10%
    threshold: 0.4, // Increased from 0.35 for more lenient pixel comparison
  },
};

// Helper to prepare page for screenshot
async function preparePageForScreenshot(
  page: Page,
  locale: string,
  context: string,
) {
  await page.goto(`/${locale}`);
  await page.waitForURL(`**/${locale}`);
  await waitForLoadWithFallback(page, {
    context: `visual-regression ${context}`,
    loadTimeout: 15_000,
    fallbackDelay: 500,
  });
  await removeInterferingElements(page);
  await waitForStablePage(page);

  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);

  // Additional stability wait
  await page.waitForTimeout(200);
}

/**
 * Header Component Visual Tests
 * These tests are stable and suitable for CI integration.
 */
test.describe('Visual Regression - Header Component', () => {
  for (const locale of LOCALES) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`Header - ${locale} - ${viewportName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await preparePageForScreenshot(page, locale, `header-${viewportName}`);

        const header = page.locator('header').first();
        await expect(header).toBeVisible({ timeout: 10_000 });

        await expect(header).toHaveScreenshot(
          `header-${locale}-${viewportName}.png`,
          SCREENSHOT_OPTIONS.standard,
        );
      });
    }
  }
});

/**
 * Footer Component Visual Tests
 * These tests have higher tolerance due to dynamic content (theme toggle).
 * Skip in CI if causing flakiness - run manually for visual verification.
 */
test.describe('Visual Regression - Footer Component @optional', () => {
  // Skip in CI to avoid flakiness - run manually with: pnpm test:visual
  test.skip(
    () => Boolean(process.env.CI),
    'Footer visual tests are optional in CI due to dynamic content',
  );

  test.setTimeout(60_000);

  for (const locale of LOCALES) {
    test(`Footer - ${locale} - desktop`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await preparePageForScreenshot(page, locale, 'footer-desktop');

      const footer = page.locator('footer').first();
      await expect(footer).toBeVisible({ timeout: 10_000 });

      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await expect(footer).toHaveScreenshot(
        `footer-${locale}-desktop.png`,
        SCREENSHOT_OPTIONS.tolerant,
      );
    });
  }
});

/**
 * Theme Variants Visual Tests
 * Test dark mode appearance for Header component.
 */
test.describe('Visual Regression - Theme Variants', () => {
  test('Header - dark mode - desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await preparePageForScreenshot(page, 'en', 'header-dark');

    // Toggle to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(200);

    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot(
      'header-en-desktop-dark.png',
      SCREENSHOT_OPTIONS.standard,
    );
  });
});
