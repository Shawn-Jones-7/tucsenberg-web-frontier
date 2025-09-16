/**
 * 翻译预加载器工具函数 - 主入口
 * 重新导出所有预加载器工具相关模块
 */

// 重新导出工厂函数
export { createTranslationPreloader } from '@/lib/i18n-preloader-utils/factory-functions';

// 重新导出预加载器工厂类
export { PreloaderFactory } from '@/lib/i18n-preloader-utils/preloader-factory';

// 重新导出预加载器管理器
export { PreloaderManager } from '@/lib/i18n-preloader-utils/preloader-manager';

// 重新导出工具函数
export { PreloaderUtils } from '@/lib/i18n-preloader-utils/preloader-utils';

// 重新导出全局实例和便捷函数
export {
  globalPreloaderManager,
  globalPreloaderFactory,
  setupPreloader,
  getDefaultPreloader,
  preloadLocale,
  smartPreload,
  cleanupPreloaders,
} from './i18n-preloader-utils/global-instances';
