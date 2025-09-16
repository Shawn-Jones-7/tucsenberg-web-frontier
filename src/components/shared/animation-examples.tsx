/**
 * 动画效果实现示例 - 主入口
 * 重新导出所有动画组件
 */

// 重新导出图标和标题动画
export { AnimatedHeroIcon, AnimatedTitle } from '@/components/shared/animations/icon-title';

// 重新导出卡片和按钮动画
export { AnimatedButton, AnimatedCard } from '@/components/shared/animations/card-button';

// 重新导出表单和状态动画
export {
  AnimatedInput,
  AnimatedProgress,
  AnimatedSuccess,
} from './animations/form-status';

// 重新导出社交和交互动画
export {
  AnimatedCollapsible,
  AnimatedSkeleton,
  AnimatedSocialLink,
} from './animations/social-interactive';

// 重新导出示例和配置
export {
  AnimationShowcase,
  customAnimations,
} from './animations/showcase-config';
