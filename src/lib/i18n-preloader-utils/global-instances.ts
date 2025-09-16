/**
 * 全局预加载器实例和便捷函数
 * Global Preloader Instances and Convenience Functions
 */

import type { Locale, Messages } from '@/types/i18n';
import type { CacheStorage, MetricsCollector } from '@/lib/i18n-cache-types';
import type { IPreloader, PreloaderConfig } from '@/lib/i18n-preloader-types';
import { PreloaderFactory } from '@/lib/i18n-preloader-utils/preloader-factory';
import { PreloaderManager } from '@/lib/i18n-preloader-utils/preloader-manager';

/**
 * 全局预加载器管理器实例
 * Global preloader manager instance
 */
export const globalPreloaderManager = new PreloaderManager();

/**
 * 全局预加载器工厂实例
 * Global preloader factory instance
 */
export const globalPreloaderFactory = PreloaderFactory.getInstance();

/**
 * 便捷函数：创建并注册预加载器
 * Convenience function: create and register preloader
 */
export function setupPreloader(
  name: string,
  cache: CacheStorage<Messages>,
  metricsCollector: MetricsCollector,
  config?: Partial<PreloaderConfig>,
): IPreloader {
  const preloader = globalPreloaderFactory.createPreloader(
    cache,
    metricsCollector,
    config,
  );
  globalPreloaderManager.register(name, preloader);
  return preloader;
}

/**
 * 便捷函数：获取默认预加载器
 * Convenience function: get default preloader
 */
export function getDefaultPreloader(): IPreloader | undefined {
  return globalPreloaderManager.get();
}

/**
 * 便捷函数：预加载语言
 * Convenience function: preload locale
 */
export async function preloadLocale(
  locale: Locale,
): Promise<Messages | undefined> {
  const preloader = getDefaultPreloader();
  if (preloader) {
    return await preloader.preloadLocale(locale);
  }
  return undefined;
}

/**
 * 便捷函数：智能预加载
 * Convenience function: smart preload
 */
export async function smartPreload(): Promise<void> {
  const preloader = getDefaultPreloader();
  if (preloader) {
    await preloader.smartPreload();
  }
}

/**
 * 便捷函数：清理所有预加载器
 * Convenience function: cleanup all preloaders
 */
export function cleanupPreloaders(): void {
  globalPreloaderManager.cleanup();
}
