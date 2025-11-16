import type React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// UI常量
const UI_CONSTANTS = {
  /** 动画持续时间: 200ms */
  ANIMATION_DURATION: 200,
} as const;

interface ActionCardsProps {
  t: (_key: string) => string;
  actions: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    href: string;
    primary: boolean;
    external: boolean;
  }>;
}

export function ActionCards({ t, actions }: ActionCardsProps) {
  return (
    <div className='grid gap-6 sm:grid-cols-3'>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Card
            key={index}
            className={`group transition-all duration-[${UI_CONSTANTS.ANIMATION_DURATION}ms] hover:shadow-lg ${
              action.primary
                ? 'border-primary/20 bg-primary/5 hover:shadow-primary/10'
                : 'hover:shadow-primary/5'
            }`}
          >
            <CardHeader className='text-center'>
              <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10'>
                <Icon className='h-6 w-6 text-primary' />
              </div>
              <CardTitle className='text-lg'>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button
                variant={action.primary ? 'default' : 'outline'}
                className='w-full group-hover:shadow-sm'
                asChild
              >
                <a
                  href={action.href}
                  {...(action.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  })}
                  className='flex items-center justify-center gap-2'
                >
                  {action.primary
                    ? t('buttons.getStarted')
                    : t('buttons.learnMore')}
                  {action.external ? (
                    <ExternalLink className='h-4 w-4' />
                  ) : (
                    <ArrowRight className='h-4 w-4' />
                  )}
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
