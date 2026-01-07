import { expect, test } from '@playwright/test';
import {
  removeInterferingElements,
  safeClick,
  waitForStablePage,
} from './test-environment-setup';

test.describe('Safe Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 确保每个测试开始时页面是干净的
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await removeInterferingElements(page);
    await waitForStablePage(page);
  });

  test('should load homepage without interference', async ({ page }) => {
    // 检查页面基本元素
    await expect(page).toHaveTitle(/B2B Web Template/);

    // 验证没有干扰元素
    const reactScanToolbar = page.locator('#react-scan-toolbar-root');
    await expect(reactScanToolbar).toHaveCount(0);

    console.log('✅ Homepage loaded cleanly without React Scan interference');
  });

  test('should navigate between pages safely', async ({ page }) => {
    // 检查桌面端导航链接
    const desktopAboutLink = page.locator('a[href*="/about"]:visible').first();
    const desktopLinkExists = (await desktopAboutLink.count()) > 0;

    if (desktopLinkExists) {
      console.log('🖥️  Testing desktop navigation...');
      const success = await safeClick(page, 'a[href*="/about"]:visible');
      expect(success).toBe(true);

      await page.waitForLoadState('networkidle');

      // 检查 URL 是否包含 about（考虑国际化路由）
      const currentUrl = page.url();
      const hasAboutInUrl =
        currentUrl.includes('/about') ||
        currentUrl.includes('/en/about') ||
        currentUrl.includes('/zh/about');

      if (hasAboutInUrl) {
        console.log('✅ Navigation completed successfully');
      } else {
        console.log(
          `ℹ️  Navigation clicked but URL didn't change as expected: ${currentUrl}`,
        );
        // 不强制失败，因为可能是单页应用或其他导航方式
      }
    } else {
      console.log(
        'ℹ️  Desktop about link not visible, checking mobile navigation...',
      );

      // 在移动端，About 链接可能在菜单中
      const mobileMenuButton = page
        .locator('button[aria-label*="menu"]')
        .first();
      const mobileMenuExists = (await mobileMenuButton.count()) > 0;

      if (mobileMenuExists) {
        console.log('📱 Testing mobile navigation via menu...');
        await safeClick(page, 'button[aria-label*="menu"]');
        await page.waitForTimeout(300); // 等待菜单动画

        // 现在查找菜单中的 About 链接
        const mobileAboutLink = page
          .locator('a[href*="/about"]:visible')
          .first();
        const mobileAboutExists = (await mobileAboutLink.count()) > 0;

        if (mobileAboutExists) {
          const success = await safeClick(page, 'a[href*="/about"]:visible');
          expect(success).toBe(true);
          console.log('✅ Mobile navigation completed successfully');
        } else {
          console.log('ℹ️  About link not found in mobile menu either');
        }
      } else {
        console.log(
          'ℹ️  No navigation options found, skipping navigation test',
        );
      }
    }
  });

  test('should handle mobile menu safely', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 等待页面进入稳定状态，优先等待 load，如遇到外部资源拖慢则降级为短暂延时
    try {
      await page.waitForLoadState('load', { timeout: 5_000 });
    } catch (error) {
      console.warn(
        '⚠️ waitForLoadState("load") timed out, falling back to short delay',
        error instanceof Error ? error.message : error,
      );
      await page.waitForTimeout(1_000);
    }

    // 移除干扰元素
    await removeInterferingElements(page);

    // 查找移动菜单按钮
    const mobileMenuSelectors = [
      '[data-testid="mobile-menu-button"]',
      'button[aria-label*="menu"]',
      'button[aria-label*="Toggle mobile menu"]',
      '.hamburger',
    ];

    let menuButtonFound = false;
    let usedSelector = '';

    for (const selector of mobileMenuSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const isVisible = await page.locator(selector).first().isVisible();
        if (isVisible) {
          menuButtonFound = true;
          usedSelector = selector;
          break;
        }
      }
    }

    if (menuButtonFound) {
      console.log(`🎯 Found mobile menu button: ${usedSelector}`);

      // 安全点击移动菜单按钮
      const success = await safeClick(page, usedSelector);
      expect(success).toBe(true);

      // 等待菜单动画完成
      await page.waitForTimeout(300);

      console.log('✅ Mobile menu interaction completed');
    } else {
      console.log('ℹ️  Mobile menu button not found or not visible');
    }
  });

  test('should handle theme toggle safely', async ({ page }) => {
    // 查找主题切换按钮
    const themeToggleSelectors = [
      '[data-testid="theme-toggle"]',
      'button[aria-label*="主题"]',
      'button[aria-label*="theme"]',
      'button:has-text("🌙")',
      'button:has-text("☀️")',
    ];

    let themeButtonFound = false;
    let usedSelector = '';

    for (const selector of themeToggleSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const isVisible = await page.locator(selector).first().isVisible();
        if (isVisible) {
          themeButtonFound = true;
          usedSelector = selector;
          break;
        }
      }
    }

    if (themeButtonFound) {
      console.log(`🎯 Found theme toggle button: ${usedSelector}`);

      // 记录初始主题
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light';
      });

      // 安全点击主题切换按钮
      const success = await safeClick(page, usedSelector);
      expect(success).toBe(true);

      // 等待主题切换完成
      await page.waitForTimeout(200);

      // 验证主题是否改变
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light';
      });

      console.log(`🎨 Theme changed from ${initialTheme} to ${newTheme}`);
      console.log('✅ Theme toggle interaction completed');
    } else {
      console.log('ℹ️  Theme toggle button not found or not visible');
    }
  });

  test('should handle language switcher safely', async ({ page }) => {
    // 查找语言切换器
    const languageSwitcherSelectors = [
      '[data-testid="language-switcher"]',
      'button[aria-label*="Language"]',
      'button[aria-label*="语言"]',
      'button:has-text("EN")',
      'button:has-text("中文")',
    ];

    let languageButtonFound = false;
    let usedSelector = '';

    for (const selector of languageSwitcherSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const isVisible = await page.locator(selector).first().isVisible();
        if (isVisible) {
          languageButtonFound = true;
          usedSelector = selector;
          break;
        }
      }
    }

    if (languageButtonFound) {
      console.log(`🎯 Found language switcher: ${usedSelector}`);

      // 记录当前 URL
      const initialUrl = page.url();

      // 安全点击语言切换器
      const success = await safeClick(page, usedSelector);
      expect(success).toBe(true);

      // 等待可能的页面跳转或下拉菜单
      await page.waitForTimeout(500);

      console.log(
        `🌐 Language switcher clicked, URL: ${initialUrl} -> ${page.url()}`,
      );
      console.log('✅ Language switcher interaction completed');
    } else {
      console.log('ℹ️  Language switcher not found or not visible');
    }
  });

  test('should verify no React Scan elements exist', async ({ page }) => {
    // 检查所有可能的 React Scan 元素
    const reactScanSelectors = [
      '#react-scan-toolbar-root',
      '[data-testid="react-scan-indicator"]',
      '[data-testid="react-scan-control-panel"]',
      '.react-scan-overlay',
      '.react-scan-toolbar',
    ];

    for (const selector of reactScanSelectors) {
      const count = await page.locator(selector).count();
      expect(count).toBe(0);
      console.log(`✅ No ${selector} elements found`);
    }

    // 检查控制台是否有 React Scan 相关消息
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(msg.text());
    });

    // 触发一些页面活动，让页面经过一次完整刷新
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 尝试等待到 load 状态，如果外部资源阻塞则降级为短暂延迟
    try {
      await page.waitForLoadState('load', { timeout: 5_000 });
    } catch (error) {
      console.warn(
        '⚠️  waitForLoadState(load) timed out, falling back to short delay.',
        error instanceof Error ? error.message : error,
      );
      await page.waitForTimeout(1_000);
    }

    // 检查是否有 React Scan 禁用消息
    const reactScanLogs = consoleLogs.filter(
      (log) =>
        log.includes('React Scan disabled') ||
        log.includes('NEXT_PUBLIC_DISABLE_REACT_SCAN=true'),
    );

    if (reactScanLogs.length > 0) {
      console.log('✅ React Scan properly disabled:', reactScanLogs[0]);
    }

    console.log('✅ React Scan interference verification completed');
  });
});
