/**
 * 动画示例和配置
 */

import { AnimatedButton, AnimatedCard } from '@/components/shared/animations/card-button';
import { AnimatedProgress, AnimatedSuccess } from '@/components/shared/animations/form-status';
import { AnimatedHeroIcon, AnimatedTitle } from '@/components/shared/animations/icon-title';
import { CardContent } from '@/components/ui/card';
import { MAGIC_75 } from "@/constants/count";

// 使用示例组件
export const AnimationShowcase = () => (
  <div className='space-y-8 p-8'>
    <AnimatedHeroIcon />
    <AnimatedTitle>建设中页面</AnimatedTitle>
    <AnimatedCard>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <AnimatedProgress value={MAGIC_75} />
          <AnimatedButton>点击按钮</AnimatedButton>
          <AnimatedSuccess message='订阅成功！' />
        </div>
      </CardContent>
    </AnimatedCard>
  </div>
);

// CSS 动画类扩展 (添加到 globals.css)
export const customAnimations = `
/* 自定义动画关键帧 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(var(--primary), 0.2); }
  50% { box-shadow: 0 0 20px rgba(var(--primary), 0.4); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 自定义动画类 */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .animate-bounce,
  .animate-spin,
  .animate-ping,
  .animate-float,
  .animate-glow,
  .animate-shimmer {
    animation: none;
  }

  .transition-all,
  .transition-transform,
  .transition-opacity {
    transition: none;
  }
}
`;
