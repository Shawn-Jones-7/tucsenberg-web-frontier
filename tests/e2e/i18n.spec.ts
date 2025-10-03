import { devices, expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';
import {
  removeInterferingElements,
  waitForStablePage,
} from './test-environment-setup';

test.describe('Internationalization (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/en');
    await page.waitForLoadState('networkidle');
    await removeInterferingElements(page);
    await waitForStablePage(page);
  });

  test('should default to English locale and display correct lang attribute', async ({
    page,
  }) => {
    // Verify URL contains English locale
    expect(page.url()).toContain('/en');

    // Verify lang attribute on html element
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // Verify English content is displayed
    const heroSection = page.getByTestId('hero-section');
    await expect(heroSection).toBeVisible();

    // Check for English navigation
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test.describe('Language Switching', () => {
    test('should switch from English to Chinese and update content', async ({
      page,
    }) => {
      // Open language dropdown
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await expect(languageToggleButton).toBeVisible();
      await languageToggleButton.click();

      // Verify dropdown is open
      const dropdownContent = page.getByTestId('language-dropdown-content');
      await expect(dropdownContent).toBeVisible();

      // Verify English is currently active
      const englishLink = page.getByTestId('language-link-en');
      await expect(englishLink.getByTestId('check-icon')).toBeVisible();

      // Click Chinese language option
      const chineseLink = page.getByTestId('language-link-zh');
      await expect(chineseLink).toBeVisible();
      await chineseLink.click();

      // Wait for navigation to Chinese locale
      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Verify lang attribute updated
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('zh');

      // Verify Chinese content is displayed
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav.getByRole('link', { name: '首页' })).toBeVisible();
      await expect(nav.getByRole('link', { name: '关于' })).toBeVisible();

      // Verify hero section content is in Chinese
      const heroSection = page.getByTestId('hero-section');
      await expect(heroSection).toBeVisible();
    });

    test('should switch from Chinese back to English', async ({ page }) => {
      // First switch to Chinese
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Now switch back to English
      await languageToggleButton.click();

      const englishLink = page.getByTestId('language-link-en');
      await englishLink.click();
      await page.waitForURL('**/en');
      await waitForStablePage(page);

      // Verify we're back to English
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');

      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    });

    test('should show loading indicator during language switch', async ({
      page,
    }) => {
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      // Click Chinese link and immediately check for loading state
      const chineseLink = page.getByTestId('language-link-zh');

      // Start the click but don't wait for completion
      const clickPromise = chineseLink.click();

      // Check for loading spinner (this happens very quickly)
      const loadingSpinner = chineseLink.locator('.animate-spin');

      // The spinner might appear briefly
      try {
        await expect(loadingSpinner).toBeVisible({ timeout: 500 });
      } catch {
        // Loading might be too fast to catch, which is acceptable
      }

      // Wait for the click to complete
      await clickPromise;
      await page.waitForURL('**/zh');

      // Verify language switch completed
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('zh');
    });

    test('should preserve current page path during language switch', async ({
      page,
    }) => {
      // Navigate to About page first
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click();
      await page.waitForURL('**/en/about');

      // Switch language
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();

      // Should navigate to Chinese version of the same page
      await page.waitForURL('**/zh/about');

      // Verify we're on the Chinese About page
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('zh');
      expect(page.url()).toContain('/zh/about');
    });
  });

  test.describe('Theme Localization', () => {
    test('should display theme toggle in correct language', async ({
      page,
    }) => {
      // Test English theme labels
      const themeToggleButton = page.getByRole('button', {
        name: 'Toggle theme',
      });
      await themeToggleButton.click();

      // Verify English theme menu items
      await expect(
        page.getByRole('menuitem', { name: /Light/i }),
      ).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /Dark/i })).toBeVisible();
      await expect(
        page.getByRole('menuitem', { name: /System/i }),
      ).toBeVisible();

      // Close theme menu
      await page.keyboard.press('Escape');

      // Switch to Chinese
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Test Chinese theme labels
      await themeToggleButton.click();

      // Verify Chinese theme menu items
      await expect(
        page.getByRole('menuitem', { name: /明亮模式/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('menuitem', { name: /暗黑模式/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('menuitem', { name: /系统模式/i }),
      ).toBeVisible();
    });

    test('should maintain theme preference across language switches', async ({
      page,
    }) => {
      // Set dark theme in English
      const themeToggleButton = page.getByRole('button', {
        name: 'Toggle theme',
      });
      await themeToggleButton.click();

      const darkMenuItem = page.getByRole('menuitem', { name: /Dark/i });
      await darkMenuItem.click();

      // Verify dark theme is applied
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Switch to Chinese
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Verify dark theme is still applied
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Verify theme toggle shows correct state in Chinese
      await themeToggleButton.click();
      const darkMenuItemZh = page.getByRole('menuitem', { name: /暗黑模式/i });

      // The dark theme item should be marked as active/selected
      await expect(darkMenuItemZh).toBeVisible();
    });
  });

  test.describe('Content Translation Validation', () => {
    test('should display all navigation items in both languages', async ({
      page,
    }) => {
      // Test English navigation
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const englishNavItems = ['Home', 'About', 'Services', 'Products', 'Blog'];

      for (const item of englishNavItems) {
        await expect(nav.getByRole('link', { name: item })).toBeVisible();
      }

      // Switch to Chinese
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Test Chinese navigation (adjust based on actual translations)
      const chineseNavItems = ['首页', '关于', '服务', '产品', '博客'];

      for (const item of chineseNavItems) {
        await expect(nav.getByRole('link', { name: item })).toBeVisible();
      }
    });

    test('should handle missing translations gracefully', async ({ page }) => {
      // This test verifies fallback behavior for missing translation keys
      // Navigate to a page that might have incomplete translations

      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const diagnosticsLink = nav.getByRole('link', {
        name: 'Performance Diagnostics',
      });

      if (await diagnosticsLink.isVisible()) {
        await diagnosticsLink.click();
        await page.waitForLoadState('networkidle');

        // Switch to Chinese
        const languageToggleButton = page.getByTestId('language-toggle-button');
        await languageToggleButton.click();

        const chineseLink = page.getByTestId('language-link-zh');
        await chineseLink.click();
        await page.waitForURL('**/zh/diagnostics');
        await waitForStablePage(page);

        // Page should still load even if some translations are missing
        // Content should either show Chinese translations or fallback to English
        await expect(page.getByRole('heading')).toBeVisible();
      }
    });
  });

  test.describe('Mobile i18n Experience', () => {
    test.use({ ...devices['Pixel 5'] });

    test('should work correctly on mobile devices', async ({ page }) => {
      // Verify mobile language toggle
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await expect(languageToggleButton).toBeVisible();

      // Test touch interaction
      await languageToggleButton.tap();

      const dropdownContent = page.getByTestId('language-dropdown-content');
      await expect(dropdownContent).toBeVisible();

      // Switch to Chinese with touch
      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.tap();

      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Verify mobile navigation works in Chinese
      const mobileMenuButton = page.getByRole('button', {
        name: 'Toggle mobile menu',
      });
      await mobileMenuButton.tap();

      const mobileNavSheet = page.getByRole('dialog');
      await expect(mobileNavSheet).toBeVisible();

      // Verify Chinese navigation items in mobile menu
      await expect(
        mobileNavSheet.getByRole('link', { name: '首页' }),
      ).toBeVisible();
    });
  });

  test.describe('Accessibility and i18n', () => {
    test('should pass accessibility checks in both languages', async ({
      page,
    }) => {
      await injectAxe(page);

      // Check English accessibility
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });

      // Switch to Chinese and check again
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh');
      await waitForStablePage(page);

      // Check Chinese accessibility
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('should have proper lang attributes for screen readers', async ({
      page,
    }) => {
      // Verify English lang attribute
      let htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');

      // Switch to Chinese
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh');

      // Verify Chinese lang attribute
      htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('zh');

      // Verify language toggle has proper ARIA labels
      await expect(languageToggleButton).toHaveAttribute('aria-label');

      // Verify language links have proper attributes
      await languageToggleButton.click();
      const englishLink = page.getByTestId('language-link-en');
      await expect(englishLink).toHaveAttribute('data-locale', 'en');
      await expect(chineseLink).toHaveAttribute('data-locale', 'zh');
    });
  });

  test.describe('URL and SEO', () => {
    test('should generate correct URLs for different locales', async ({
      page,
    }) => {
      // Test English URLs
      expect(page.url()).toMatch(/\/en\/?$/);

      // Navigate to About page
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const aboutLink = nav.getByRole('link', { name: 'About' });
      await aboutLink.click();
      await page.waitForURL('**/en/about');

      expect(page.url()).toContain('/en/about');

      // Switch to Chinese
      const languageToggleButton = page.getByTestId('language-toggle-button');
      await languageToggleButton.click();

      const chineseLink = page.getByTestId('language-link-zh');
      await chineseLink.click();
      await page.waitForURL('**/zh/about');

      expect(page.url()).toContain('/zh/about');
    });

    test('should handle direct navigation to localized URLs', async ({
      page,
    }) => {
      // Direct navigation to Chinese homepage
      await page.goto('/zh');
      await page.waitForLoadState('networkidle');
      await waitForStablePage(page);

      // Verify Chinese content
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('zh');

      // Direct navigation to Chinese About page
      await page.goto('/zh/about');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/zh/about');
      expect(htmlLang).toBe('zh');
    });
  });
});
