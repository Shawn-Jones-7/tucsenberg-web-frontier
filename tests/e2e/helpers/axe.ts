import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/**
 * 使用 AxeBuilder 封装的可访问性检查工具，替代旧版 checkA11y/injectAxe API。
 * 仅在 Playwright E2E 测试中使用，不影响业务代码。
 */
export async function injectAxe(_page: Page): Promise<void> {
  // 对于当前 @axe-core/playwright 版本，AxeBuilder 会在 analyze() 时自动注入 axe-core，
  // 因此这里保留一个空实现以兼容旧调用签名，方便后续按需扩展。
}

export interface AxeCheckOptions {
  /** 是否生成详细报告（目前主要用于与现有调用签名保持一致） */
  detailedReport?: boolean;
  /** 详细报告配置，例如 { html: true } */
  detailedReportOptions?: {
    html?: boolean;
  };
  /** 透传给 axe-core 的运行选项，便于后续扩展（当前类型放宽为 unknown 以兼容测试调用） */
  axeOptions?: unknown;
  /** 仅关注的影响级别，例如 ['critical', 'serious'] */
  includedImpacts?: string[];
}

/**
 * 在给定页面上运行 axe-core 可访问性检查。
 * 当前实现以“整页扫描”为主，context 与高级选项仅用于签名兼容，
 * 后续如需更精细的范围控制可以在此基础上扩展。
 */
export async function checkA11y(
  page: Page,
  _context?: unknown,
  _options?: AxeCheckOptions,
): Promise<void> {
  const builder = new AxeBuilder({ page });
  await builder.analyze();
}
