import { expect, test, type Locator } from '@playwright/test';
import { getHeaderMobileMenuButton, getNav } from './helpers/navigation';
import {
  removeInterferingElements,
  waitForLoadWithFallback,
  waitForStablePage,
} from './test-environment-setup';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function boxesOverlap(a: Box, b: Box, padding = 1): boolean {
  const leftA = a.x + padding;
  const rightA = a.x + a.width - padding;
  const topA = a.y + padding;
  const bottomA = a.y + a.height - padding;

  const leftB = b.x + padding;
  const rightB = b.x + b.width - padding;
  const topB = b.y + padding;
  const bottomB = b.y + b.height - padding;

  const overlapX = leftA < rightB && rightA > leftB;
  const overlapY = topA < bottomB && bottomA > topB;
  return overlapX && overlapY;
}

async function expectBoundingBox(locator: Locator, name: string): Promise<Box> {
  await expect(locator, `${name} should be visible`).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${name} should have a bounding box`).not.toBeNull();
  return box as Box;
}

const LOCALES = ['en', 'zh'] as const;

const VIEWPORTS = [
  {
    name: 'mobile',
    viewport: { width: 375, height: 800 },
    expectMobileHeader: true,
  },
  {
    // Regression guard: was previously treated as "desktop" at md (768) and caused overlap.
    name: 'tablet',
    viewport: { width: 900, height: 800 },
    expectMobileHeader: true,
  },
  {
    // Desktop navigation is visible from 1024px (lg). CTA may still be hidden below wider breakpoints.
    name: 'desktop-1024',
    viewport: { width: 1024, height: 800 },
    expectMobileHeader: false,
  },
  {
    name: 'desktop-1280',
    viewport: { width: 1280, height: 800 },
    expectMobileHeader: false,
  },
] as const;

test.describe('Header layout (bbox regression)', () => {
  for (const locale of LOCALES) {
    for (const { name, viewport, expectMobileHeader } of VIEWPORTS) {
      test(`${locale} / ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/${locale}`);
        await page.waitForURL(`**/${locale}`);
        await waitForLoadWithFallback(page, {
          context: `header-layout ${locale} ${name}`,
          loadTimeout: 10_000,
          fallbackDelay: 500,
        });
        await removeInterferingElements(page);
        await waitForStablePage(page);

        const mobileMenuButton = getHeaderMobileMenuButton(page);
        const nav = getNav(page);

        if (expectMobileHeader) {
          await expect(mobileMenuButton).toBeVisible({ timeout: 10_000 });
          await expect(nav).not.toBeVisible({ timeout: 10_000 });
          return;
        }

        await expect(nav).toBeVisible({ timeout: 10_000 });
        await expect(mobileMenuButton).not.toBeVisible({ timeout: 10_000 });

        const logoLink = page
          .getByRole('link', { name: /B2B Web Template/ })
          .first();

        const logoBox = await expectBoundingBox(logoLink, 'Logo link');
        const navBox = await expectBoundingBox(nav, 'Desktop navigation');

        expect(
          boxesOverlap(logoBox, navBox),
          'Logo should not overlap desktop navigation',
        ).toBe(false);

        // CTA is intentionally hidden on narrower desktop viewports.
        const cta = page.getByTestId('header-cta').first();
        if (await cta.isVisible().catch(() => false)) {
          const ctaBox = await expectBoundingBox(cta, 'Header CTA');
          expect(
            boxesOverlap(navBox, ctaBox),
            'Desktop navigation should not overlap CTA',
          ).toBe(false);
          expect(
            boxesOverlap(logoBox, ctaBox),
            'Logo should not overlap CTA',
          ).toBe(false);
        }

        // Optional: if the language toggle button is already hydrated, assert it doesn't overlap.
        const languageToggle = page
          .getByTestId('language-toggle-button')
          .first();
        if (await languageToggle.isVisible().catch(() => false)) {
          const languageBox = await expectBoundingBox(
            languageToggle,
            'Language toggle',
          );
          expect(
            boxesOverlap(navBox, languageBox),
            'Desktop navigation should not overlap language toggle',
          ).toBe(false);
        }
      });
    }
  }
});
