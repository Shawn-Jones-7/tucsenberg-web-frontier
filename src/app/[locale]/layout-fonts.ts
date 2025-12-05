import localFont from 'next/font/local';

/**
 * Geist Sans Latin 子集字体配置
 * P2-1 Phase 3：使用本地 Latin 子集替代完整 Geist Sans，节省 ~32KB
 * 子集包含：ASCII (U+0020-007E) + Latin-1 Supplement (U+00A0-00FF)
 * License: SIL Open Font License（允许子集化和再分发）
 */
export const geistSans = localFont({
  src: './GeistSans-Latin.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
  weight: '100 900',
});

/**
 * Geist Mono 不再全局加载（P2-1 Phase 2）
 * 等宽字体使用系统字体栈：ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
 * 如需在特定组件中使用，可单独导入：import { GeistMono } from 'geist/font/mono';
 */

/**
 * 获取字体类名字符串，应用到 body 元素
 * P2-1 Phase 3：使用本地 Latin 子集（~25KB）替代完整 Geist Sans（~58KB）
 */
export function getFontClassNames(): string {
  return geistSans.variable;
}
