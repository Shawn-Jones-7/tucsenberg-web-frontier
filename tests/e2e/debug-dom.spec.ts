/* eslint-disable max-statements, complexity */
import { expect, test } from '@playwright/test';
import type {
  MockNextHydrationStatus,
  MockPerformanceNavigationEntry,
  MockReactFiberNode,
  MockWindowWithReact,
} from '@/types/test-types';

test.describe('DOM Structure Debug', () => {
  test('should debug page DOM structure and find language switcher', async ({
    page,
  }) => {
    console.log('🔍 Starting DOM structure debug...');

    // 导航到首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待页面稳定
    await page.waitForTimeout(3000);

    console.log('📍 Current URL:', page.url());

    // 检查页面基本结构
    const title = await page.title();
    console.log('📄 Page title:', title);

    // 检查HTML lang属性
    const htmlLang = await page.locator('html').getAttribute('lang');
    console.log('🌐 HTML lang attribute:', htmlLang);

    // 检查body是否存在
    const bodyExists = (await page.locator('body').count()) > 0;
    console.log('📦 Body exists:', bodyExists);

    // 检查header是否存在
    const headerExists = (await page.locator('header').count()) > 0;
    console.log('🏠 Header exists:', headerExists);

    // 如果header不存在，检查整个页面结构
    if (!headerExists) {
      console.log('❌ Header not found! Investigating page structure...');

      // 检查完整的body HTML结构
      const bodyHTML = await page.locator('body').innerHTML();
      console.log('📦 Complete body HTML:');
      console.log(
        bodyHTML.substring(0, 2000) +
          (bodyHTML.length > 2000 ? '...[truncated]' : ''),
      );

      // 检查是否有任何React组件渲染
      const reactElements = await page
        .locator('[data-reactroot], #__next, [id*="react"]')
        .all();
      console.log(`⚛️ React elements found: ${reactElements.length}`);

      // 检查是否有Next.js相关元素
      const nextElements = await page
        .locator('[id*="next"], [class*="next"]')
        .all();
      console.log(`🔄 Next.js elements found: ${nextElements.length}`);

      // 检查main元素
      const mainExists = (await page.locator('main').count()) > 0;
      console.log('📄 Main element exists:', mainExists);

      // 检查footer元素
      const footerExists = (await page.locator('footer').count()) > 0;
      console.log('🦶 Footer element exists:', footerExists);

      // 检查是否有任何导航相关元素
      const navElements = await page.locator('nav').all();
      console.log(`🧭 Navigation elements found: ${navElements.length}`);

      // 检查页面是否完全加载
      const readyState = await page.evaluate(() => document.readyState);
      console.log('📊 Document ready state:', readyState);

      // 检查是否有加载错误
      const networkFailures = await page.evaluate(() => {
        return window.performance
          .getEntriesByType('navigation')
          .map((entry: PerformanceEntry) => ({
            name: entry.name,
            transferSize: (entry as MockPerformanceNavigationEntry)
              .transferSize,
            responseStatus: (entry as MockPerformanceNavigationEntry)
              .responseStatus,
          }));
      });
      console.log('🌐 Network status:', networkFailures);
    }

    if (headerExists) {
      // 获取header的完整HTML
      const headerHTML = await page.locator('header').innerHTML();
      console.log('🏠 Header HTML structure:');
      console.log(headerHTML);

      // 检查header内的所有按钮
      const buttons = await page.locator('header button').all();
      console.log(`🔘 Found ${buttons.length} buttons in header:`);

      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const testId = await button?.getAttribute('data-testid');
        const className = await button?.getAttribute('class');
        const ariaLabel = await button?.getAttribute('aria-label');
        const text = await button?.textContent();

        console.log(`  Button ${i + 1}:`);
        console.log(`    - data-testid: ${testId}`);
        console.log(`    - class: ${className}`);
        console.log(`    - aria-label: ${ariaLabel}`);
        console.log(`    - text: ${text}`);
      }

      // 检查所有带有data-testid的元素
      const elementsWithTestId = await page.locator('[data-testid]').all();
      console.log(
        `🏷️ Found ${elementsWithTestId.length} elements with data-testid:`,
      );

      for (let i = 0; i < elementsWithTestId.length; i++) {
        const element = elementsWithTestId[i];
        const testId = await element?.getAttribute('data-testid');
        const tagName = await element?.evaluate((el) =>
          el.tagName.toLowerCase(),
        );
        const isVisible = await element?.isVisible();

        console.log(
          `  Element ${i + 1}: <${tagName}> data-testid="${testId}" visible=${isVisible}`,
        );
      }

      // 专门检查语言切换相关元素
      console.log('🌐 Checking language switcher elements:');

      // 检查language-dropdown-trigger
      const dropdownTrigger = page.getByTestId('language-dropdown-trigger');
      const triggerCount = await dropdownTrigger.count();
      console.log(`  - language-dropdown-trigger count: ${triggerCount}`);

      if (triggerCount > 0) {
        const isVisible = await dropdownTrigger.isVisible();
        const isEnabled = await dropdownTrigger.isEnabled();
        console.log(
          `  - language-dropdown-trigger visible: ${isVisible}, enabled: ${isEnabled}`,
        );
      }

      // 检查language-toggle-button
      const toggleButton = page.getByTestId('language-toggle-button');
      const toggleCount = await toggleButton.count();
      console.log(`  - language-toggle-button count: ${toggleCount}`);

      if (toggleCount > 0) {
        const isVisible = await toggleButton.isVisible();
        const isEnabled = await toggleButton.isEnabled();
        console.log(
          `  - language-toggle-button visible: ${isVisible}, enabled: ${isEnabled}`,
        );
      }

      // 检查包含"language"的所有元素
      const languageElements = await page
        .locator('[data-testid*="language"]')
        .all();
      console.log(
        `  - Elements with "language" in data-testid: ${languageElements.length}`,
      );

      for (let i = 0; i < languageElements.length; i++) {
        const element = languageElements[i];
        const testId = await element?.getAttribute('data-testid');
        const isVisible = await element?.isVisible();
        console.log(`    - ${testId}: visible=${isVisible}`);
      }

      // 检查可能的语言切换按钮（通过文本）
      const enButtons = await page.locator('button:has-text("EN")').all();
      const zhButtons = await page.locator('button:has-text("中文")').all();
      const globeButtons = await page
        .locator(
          'button:has([class*="lucide-globe"], [class*="lucide-languages"])',
        )
        .all();

      console.log(`  - Buttons with "EN" text: ${enButtons.length}`);
      console.log(`  - Buttons with "中文" text: ${zhButtons.length}`);
      console.log(
        `  - Buttons with globe/languages icon: ${globeButtons.length}`,
      );

      // 检查DropdownMenu相关元素
      const dropdownMenus = await page
        .locator('[data-testid*="dropdown"]')
        .all();
      console.log(`  - Dropdown menu elements: ${dropdownMenus.length}`);

      for (let i = 0; i < dropdownMenus.length; i++) {
        const element = dropdownMenus[i];
        const testId = await element?.getAttribute('data-testid');
        const isVisible = await element?.isVisible();
        console.log(`    - ${testId}: visible=${isVisible}`);
      }
    }

    // 检查是否有JavaScript错误
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // 等待一下看是否有错误
    await page.waitForTimeout(1000);

    if (errors.length > 0) {
      console.log('❌ JavaScript errors found:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No JavaScript errors detected');
    }

    // 检查控制台消息
    const messages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        messages.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    await page.waitForTimeout(1000);

    if (messages.length > 0) {
      console.log('⚠️ Console messages:');
      messages.forEach((message, index) => {
        console.log(`  ${index + 1}. ${message}`);
      });
    }

    // 检查React hydration状态
    const isHydrated = await page.evaluate(() => {
      // 检查React是否已经hydrated
      const reactRoot =
        document.querySelector('[data-reactroot]') ||
        document.querySelector('#__next');
      if (reactRoot) {
        return true;
      }

      // 检查是否有React fiber节点
      const bodyElement = document.body as MockReactFiberNode;
      if (bodyElement && bodyElement._reactInternalFiber) {
        return true;
      }

      // 检查window上的React相关对象
      const windowWithReact = window as MockWindowWithReact;
      return (
        Boolean(windowWithReact.React) ||
        Boolean(windowWithReact.__REACT_DEVTOOLS_GLOBAL_HOOK__)
      );
    });

    console.log('⚛️ React hydration status:', isHydrated);

    // 检查Next.js hydration状态
    const nextHydrationStatus = await page.evaluate(
      (): MockNextHydrationStatus => {
        const windowWithNext = window as MockWindowWithReact;
        return {
          hasNextData: Boolean(windowWithNext.__NEXT_DATA__),
          hasNextRouter: Boolean(windowWithNext.__NEXT_ROUTER__),
          documentReadyState: document.readyState,
          scriptsLoaded: document.querySelectorAll('script[src*="_next"]')
            .length,
        };
      },
    );

    console.log('🔄 Next.js hydration status:', nextHydrationStatus);

    // 等待更长时间看React是否会hydrate
    console.log('⏳ Waiting for potential React hydration...');
    await page.waitForTimeout(5000);

    // 再次检查header
    const headerExistsAfterWait = (await page.locator('header').count()) > 0;
    console.log('🏠 Header exists after wait:', headerExistsAfterWait);

    // 最终验证：页面应该有内容
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.length).toBeGreaterThan(100);

    console.log('✅ DOM structure debug completed');
  });
});
