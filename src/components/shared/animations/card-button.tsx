/**
 * 卡片和按钮动画组件
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. 卡片悬浮动画
export const AnimatedCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Card
    className={cn(
      'border-primary/20 bg-card/50 backdrop-blur-sm',
      'hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5',
      'transition-all duration-300 ease-out',
      'hover:border-primary/30',
      className,
    )}
  >
    {children}
  </Card>
);

// 4. 按钮交互动画
export const AnimatedButton = ({
  children,
  variant = 'default',
  isLoading = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  isLoading?: boolean;
  className?: string;
} & React.ComponentProps<typeof Button>) => (
  <Button
    variant={variant}
    disabled={isLoading}
    className={cn(
      'transition-all duration-200 ease-out',
      'hover:scale-105 active:scale-95',
      'hover:shadow-lg hover:shadow-primary/20',
      variant === 'default' && 'hover:bg-primary/90',
      variant === 'outline' && 'hover:bg-primary/5',
      variant === 'ghost' && 'hover:bg-primary/10',
      className,
    )}
    {...props}
  >
    {isLoading ? (
      <>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        处理中...
      </>
    ) : (
      children
    )}
  </Button>
);
