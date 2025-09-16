/**
 * 翻译预加载策略 - 主入口
 * 重新导出所有预加载策略相关模块
 */

// 重新导出策略管理器
export { PreloadStrategyManager } from '@/lib/i18n-preloader-strategies/manager';

// 重新导出基础策略
export {
  immediateStrategy,
  smartStrategy,
  progressiveStrategy,
  priorityStrategy,
  lazyStrategy,
} from './i18n-preloader-strategies/basic-strategies';

// 重新导出高级策略
export {
  batchStrategy,
  adaptiveStrategy,
  networkAwareStrategy,
  timeAwareStrategy,
  memoryAwareStrategy,
} from './i18n-preloader-strategies/advanced-strategies';

// 重新导出策略配置
export { strategyConfigs } from '@/lib/i18n-preloader-strategies/configs';

// 重新导出策略集合和工厂函数
export {
  PreloadStrategies,
  createStrategyManager,
  getRecommendedStrategy,
} from './i18n-preloader-strategies/factory';

// 重新导出工具函数
export { StrategyUtils } from '@/lib/i18n-preloader-strategies/utils';
