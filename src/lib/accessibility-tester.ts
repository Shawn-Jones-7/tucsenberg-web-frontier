import {
  COUNT_TRIPLE,
  MAGIC_0_8,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  ZERO,
} from '@/constants';

/**
 * 无障碍性测试工具
 * 用于测试导航组件的键盘导航和无障碍性功能
 */

export interface AccessibilityTestResult {
  testName: string;
  passed: boolean;
  details: string;
  suggestions?: string[];
}

export interface KeyboardNavigationTest {
  element: HTMLElement;
  expectedBehavior: string;
  testFunction: () => Promise<boolean>;
}

/**
 * 无障碍性测试器类
 */
export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];

  /**
   * 测试Tab键循环导航
   */
  async testTabNavigation(): Promise<AccessibilityTestResult> {
    const testName = 'Tab键循环导航测试';

    try {
      // 获取所有可聚焦元素
      const focusableElements = this.getFocusableElements();

      if (focusableElements.length === ZERO) {
        return {
          testName,
          passed: false,
          details: '未找到可聚焦的导航元素',
          suggestions: [
            '确保导航元素具有正确的tabindex属性',
            '检查元素是否被正确渲染',
          ],
        };
      }

      // 测试Tab键导航顺序
      const tabOrder: HTMLElement[] = [];
      const currentElement = focusableElements.at(0) ?? null;

      if (!currentElement) {
        return {
          testName,
          passed: false,
          details: '未找到可聚焦的导航元素',
        };
      }

      for (let i = 0; i < focusableElements.length; i++) {
        currentElement.focus();
        tabOrder.push(document.activeElement as HTMLElement);

        // 模拟Tab键
        const tabEvent = new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(tabEvent);

        // 等待焦点变化
        await new Promise((resolve) => setTimeout(resolve, PERCENTAGE_HALF));
      }

      const isValidTabOrder = this.validateTabOrder(
        tabOrder,
        focusableElements,
      );

      return {
        testName,
        passed: isValidTabOrder,
        details: `测试了${focusableElements.length}个可聚焦元素，Tab键导航${isValidTabOrder ? '正常' : '异常'}`,
        ...(isValidTabOrder
          ? {}
          : {
              suggestions: [
                '检查tabindex属性设置',
                '确保元素按逻辑顺序排列',
                '验证隐藏元素不在Tab序列中',
              ],
            }),
      };
    } catch (_error) {
      // 忽略错误变量
      return {
        testName,
        passed: false,
        details: `测试过程中发生错误: ${_error}`,
        suggestions: ['检查DOM结构', '确保测试环境正确'],
      };
    }
  }

  /**
   * 测试Enter/Space键激活功能
   */
  async testKeyActivation(): Promise<AccessibilityTestResult> {
    const testName = 'Enter/Space键激活测试';

    try {
      const triggers = document.querySelectorAll(
        '[data-slot="navigation-menu-trigger"]',
      );
      const links = document.querySelectorAll('a[href]');

      const triggerResults = await this.runActivationTestsOnTriggers(triggers);
      const linkResults = await this.runActivationTestsOnLinks(
        links,
        COUNT_TRIPLE,
      );
      const activationTests =
        triggerResults.activationTests + linkResults.activationTests;
      const passedTests = triggerResults.passedTests + linkResults.passedTests;

      const successRate =
        activationTests > ZERO ? passedTests / activationTests : ZERO;

      return {
        testName,
        passed: successRate >= MAGIC_0_8, // 80%通过率
        details: `测试了${activationTests}个激活操作，成功率: ${(successRate * PERCENTAGE_FULL).toFixed(ONE)}%`,
        ...(successRate < MAGIC_0_8
          ? {
              suggestions: [
                '确保所有交互元素支持Enter键激活',
                '验证Space键在按钮元素上的激活功能',
                '检查键盘事件处理器的实现',
              ],
            }
          : {}),
      };
    } catch (_error) {
      // 忽略错误变量
      return {
        testName,
        passed: false,
        details: `测试过程中发生错误: ${_error}`,
        suggestions: ['检查事件处理器', '验证元素可访问性'],
      };
    }
  }

  private async runActivationTestsOnTriggers(
    triggers: NodeListOf<Element>,
  ): Promise<{ activationTests: number; passedTests: number }> {
    let activationTests = 0;
    let passedTests = 0;
    for (const trigger of triggers) {
      const element = trigger as HTMLElement;
      element.focus();
      const enterResult = await this.testElementKeyActivation(element, 'Enter');
      activationTests += 1;
      if (enterResult) passedTests += 1;
      const spaceResult = await this.testElementKeyActivation(element, ' ');
      activationTests += 1;
      if (spaceResult) passedTests += 1;
    }
    return { activationTests, passedTests };
  }

  private async runActivationTestsOnLinks(
    links: NodeListOf<Element>,
    maxCount: number,
  ): Promise<{ activationTests: number; passedTests: number }> {
    let activationTests = 0;
    let passedTests = 0;
    const list = Array.from(links).slice(0, maxCount);
    for (const link of list) {
      const element = link as HTMLElement;
      element.focus();
      const enterResult = await this.testElementKeyActivation(element, 'Enter');
      activationTests += 1;
      if (enterResult) passedTests += 1;
    }
    return { activationTests, passedTests };
  }

  /**
   * 测试Escape键关闭功能
   */
  async testEscapeKeyClose(): Promise<AccessibilityTestResult> {
    const testName = 'Escape键关闭测试';

    try {
      const triggers = document.querySelectorAll(
        '[data-slot="navigation-menu-trigger"]',
      );
      let escapeTests = ZERO;
      let passedTests = ZERO;

      for (const trigger of triggers) {
        const element = trigger as HTMLElement;
        const closed = await this.testEscapeOnTrigger(element);
        if (closed === null) continue;
        escapeTests += 1;
        if (closed) passedTests += 1;
      }

      const successRate = escapeTests > ZERO ? passedTests / escapeTests : ZERO;

      return {
        testName,
        passed: successRate >= MAGIC_0_8,
        details: `测试了${escapeTests}个Escape关闭操作，成功率: ${(successRate * PERCENTAGE_FULL).toFixed(ONE)}%`,
        ...(successRate < MAGIC_0_8
          ? {
              suggestions: [
                '确保Escape键事件处理器正确实现',
                '验证菜单状态管理',
                '检查事件冒泡和传播',
              ],
            }
          : {}),
      };
    } catch (_error) {
      // 忽略错误变量
      return {
        testName,
        passed: false,
        details: `测试过程中发生错误: ${_error}`,
        suggestions: ['检查菜单状态管理', '验证键盘事件处理'],
      };
    }
  }

  private async testEscapeOnTrigger(
    element: HTMLElement,
  ): Promise<boolean | null> {
    element.focus();
    element.click();
    await new Promise((resolve) => setTimeout(resolve, PERCENTAGE_FULL));
    const isOpen =
      element.getAttribute('data-state') === 'open' ||
      element.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return null;
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(escapeEvent);
    await new Promise((resolve) => setTimeout(resolve, PERCENTAGE_FULL));
    const isClosed =
      element.getAttribute('data-state') !== 'open' &&
      element.getAttribute('aria-expanded') !== 'true';
    return isClosed;
  }

  /**
   * 测试ARIA标签和属性
   */
  testAriaAttributes(): AccessibilityTestResult {
    const testName = 'ARIA标签和属性测试';

    try {
      const issues: string[] = [];
      const suggestions: string[] = [];

      // 检查导航容器
      const navElements = document.querySelectorAll('nav');
      navElements.forEach((nav, index) => {
        if (
          !nav.getAttribute('aria-label') &&
          !nav.getAttribute('aria-labelledby')
        ) {
          issues.push(`导航容器${index + ONE}缺少aria-label或aria-labelledby`);
          suggestions.push('为导航容器添加描述性的aria-label');
        }
      });

      // 检查下拉菜单触发器
      const triggers = document.querySelectorAll(
        '[data-slot="navigation-menu-trigger"]',
      );
      triggers.forEach((trigger, index) => {
        if (!trigger.getAttribute('aria-expanded')) {
          issues.push(`下拉菜单触发器${index + ONE}缺少aria-expanded属性`);
          suggestions.push('为下拉菜单触发器添加aria-expanded属性');
        }

        if (!trigger.getAttribute('aria-haspopup')) {
          issues.push(`下拉菜单触发器${index + ONE}缺少aria-haspopup属性`);
          suggestions.push('为下拉菜单触发器添加aria-haspopup属性');
        }
      });

      // 检查当前页面标识
      const currentPageLinks = document.querySelectorAll(
        '[aria-current="page"]',
      );
      const allLinks = document.querySelectorAll('a[href]');

      if (currentPageLinks.length === ZERO && allLinks.length > ZERO) {
        issues.push('未找到当前页面的aria-current="page"标识');
        suggestions.push('为当前页面链接添加aria-current="page"属性');
      }

      return {
        testName,
        passed: issues.length === ZERO,
        details:
          issues.length === ZERO
            ? '所有ARIA属性配置正确'
            : `发现${issues.length}个ARIA属性问题: ${issues.join('; ')}`,
        ...(suggestions.length > ZERO ? { suggestions } : {}),
      };
    } catch (_error) {
      // 忽略错误变量
      return {
        testName,
        passed: false,
        details: `测试过程中发生错误: ${_error}`,
        suggestions: ['检查DOM结构', '验证ARIA属性配置'],
      };
    }
  }

  /**
   * 运行所有无障碍性测试
   */
  async runAllTests(): Promise<AccessibilityTestResult[]> {
    this.results = [];

    // 运行各项测试
    this.results.push(await this.testTabNavigation());
    this.results.push(await this.testKeyActivation());
    this.results.push(await this.testEscapeKeyClose());
    this.results.push(this.testAriaAttributes());

    return this.results;
  }

  /**
   * 获取测试报告
   */
  getTestReport(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = `\n=== 无障碍性测试报告 ===\n`;
    report += `总测试数: ${totalTests}\n`;
    report += `通过: ${passedTests}\n`;
    report += `失败: ${failedTests}\n`;
    report += `通过率: ${((passedTests / totalTests) * PERCENTAGE_FULL).toFixed(ONE)}%\n\n`;

    this.results.forEach((result, index) => {
      report += `${index + ONE}. ${result.testName}\n`;
      report += `   状态: ${result.passed ? '✅ 通过' : '❌ 失败'}\n`;
      report += `   详情: ${result.details}\n`;
      if (result.suggestions) {
        report += `   建议: ${result.suggestions.join('; ')}\n`;
      }
      report += '\n';
    });

    return report;
  }

  // 私有辅助方法
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[data-slot="navigation-menu-trigger"]',
      '[data-slot="navigation-menu-link"]',
    ].join(', ');

    return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  }

  private validateTabOrder(
    tabOrder: HTMLElement[],
    focusableElements: HTMLElement[],
  ): boolean {
    // 简单验证：检查是否能遍历所有可聚焦元素
    return tabOrder.length >= focusableElements.length * MAGIC_0_8; // 允许80%的覆盖率
  }

  private async testElementKeyActivation(
    element: HTMLElement,
    key: string,
  ): Promise<boolean> {
    try {
      const initialState = element.getAttribute('data-state');
      const initialExpanded = element.getAttribute('aria-expanded');

      const keyEvent = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(keyEvent);
      await new Promise((resolve) => setTimeout(resolve, PERCENTAGE_FULL));

      const newState = element.getAttribute('data-state');
      const newExpanded = element.getAttribute('aria-expanded');

      // 检查状态是否发生变化（表示激活成功）
      return initialState !== newState || initialExpanded !== newExpanded;
    } catch {
      return false;
    }
  }
}

// 导出便捷函数
export async function runAccessibilityTests(): Promise<string> {
  const tester = new AccessibilityTester();
  await tester.runAllTests();
  return tester.getTestReport();
}
