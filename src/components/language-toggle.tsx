'use client';

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Check, Globe, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ANIMATION_DURATION_VERY_SLOW } from '@/constants';
import { MAGIC_2000 } from '@/constants/count';
import { Link, usePathname } from '@/i18n/routing';

const TRANSITION_TIMEOUT = ANIMATION_DURATION_VERY_SLOW; // 1 second timeout for language switch

// Custom hook for language switching logic
const useLanguageSwitch = () => {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  type TimeoutHandle = ReturnType<typeof setTimeout>;

  const transitionTimeoutRef = useRef<TimeoutHandle | null>(null);
  const successResetRef = useRef<TimeoutHandle | null>(null);

  const clearTimers = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (successResetRef.current !== null) {
      clearTimeout(successResetRef.current);
      successResetRef.current = null;
    }
  }, []);

  const resetSuccessState = useCallback(() => {
    setSwitchSuccess(false);
    successResetRef.current = null;
  }, []);

  const scheduleSuccessReset = useCallback(() => {
    successResetRef.current = setTimeout(resetSuccessState, MAGIC_2000);
  }, [resetSuccessState]);

  const finalizeSwitch = useCallback(() => {
    setSwitchingTo(null);
    setSwitchSuccess(true);
    scheduleSuccessReset();
    transitionTimeoutRef.current = null;
  }, [scheduleSuccessReset]);

  const scheduleTransition = useCallback(() => {
    transitionTimeoutRef.current = setTimeout(
      finalizeSwitch,
      TRANSITION_TIMEOUT,
    );
  }, [finalizeSwitch]);

  const handleLanguageSwitch = useCallback(
    (newLocale: string) => {
      clearTimers();
      setSwitchingTo(newLocale);
      setSwitchSuccess(false);
      startTransition(scheduleTransition);
    },
    [clearTimers, scheduleTransition],
  );

  useEffect(() => clearTimers, [clearTimers]);

  return {
    switchingTo,
    switchSuccess,
    isPending,
    handleLanguageSwitch,
  };
};

export const LanguageToggle = memo(() => {
  const locale = useLocale();
  const pathname = usePathname();
  const { switchingTo, isPending, handleLanguageSwitch } = useLanguageSwitch();
  const [isOpen, setIsOpen] = useState(false);

  // Get current language display name
  const currentLanguageName = locale === 'en' ? 'English' : '简体中文';

  return (
    <div data-testid='language-switcher'>
      <DropdownMenu
        data-testid='language-dropdown-menu'
        onOpenChange={setIsOpen}
      >
      <DropdownMenuTrigger
        asChild
        data-testid='language-dropdown-trigger'
      >
        <Button
          variant='ghost'
          disabled={isPending}
          data-testid='language-toggle-button'
          aria-label={locale === 'en' ? 'Toggle Language' : '切换语言'}
          className={cn(
            // 胶囊形容器：更紧凑的高度32px，圆角16px（完全胶囊）
            'h-8 rounded-full px-3',
            // 加粗边框（2px）
            'border-border border-2',
            // 背景：纯白色（悬停时保持纯白）
            'bg-background hover:bg-background',
            // 文字与图标：深灰黑
            'text-[#111827]',
            // 间距：更紧凑
            'gap-1.5',
            // 过渡动画：140ms
            'transition-all duration-[140ms] ease-in-out',
          )}
        >
          <Globe
            className='text-foreground/70 h-3.5 w-3.5'
            data-testid='globe-icon'
          />
          <span className='text-foreground/70 text-xs font-medium'>
            {currentLanguageName}
          </span>
          {isPending ? (
            <Loader2 className='text-foreground/70 h-3.5 w-3.5 animate-spin' />
          ) : (
            <svg
              className={cn(
                'text-foreground/70 h-3.5 w-3.5',
                // 箭头旋转：展开180°，收起0°，160ms过渡
                'transition-transform duration-[160ms] ease-in-out',
                isOpen && 'rotate-180',
              )}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        data-testid='language-dropdown-content'
        className={cn(
          // 最小宽度180px，上下内边距10-12px
          'min-w-[180px] px-0 py-2.5',
          // 外圆角10-12px
          'rounded-xl',
          // 背景：暖白/浅灰
          'bg-[#FAFAFA]',
          // 边框：浅灰1px
          'border border-[#E5E7EB]',
          // 双层阴影：柔和投影
          'shadow-[0_2px_6px_rgba(0,0,0,0.08),0_10px_24px_rgba(0,0,0,0.08)]',
        )}
      >
        <DropdownMenuItem
          asChild
          data-testid='language-dropdown-item'
          className='p-0'
        >
          <Link
            href={pathname}
            locale='en'
            className={cn(
              // 列表项：左对齐，行高24-28px，行间距6-8px
              'flex w-full items-center justify-between px-3.5 py-2',
              // Vercel 风格：浅灰文字 + 椭圆灰色背景悬停
              'text-foreground/70 font-medium',
              'hover:text-foreground hover:bg-[#F5F5F5] dark:hover:bg-white/8',
              'rounded-md',
              // 过渡：120ms
              'transition-all duration-[120ms] ease-in-out',
              'cursor-pointer',
            )}
            onClick={() => handleLanguageSwitch('en')}
            data-testid='language-link-en'
            data-locale='en'
            role='menuitem'
          >
            <span className='text-xs'>English</span>
            {switchingTo === 'en' && (
              <Loader2 className='h-4 w-4 animate-spin' />
            )}
            {locale === 'en' && switchingTo !== 'en' && (
              <Check
                className='text-foreground h-4 w-4'
                data-testid='check-icon'
              />
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          data-testid='language-dropdown-item'
          className='p-0'
        >
          <Link
            href={pathname}
            locale='zh'
            className={cn(
              // 列表项：左对齐，行高24-28px，行间距6-8px
              'flex w-full items-center justify-between px-3.5 py-2',
              // Vercel 风格：浅灰文字 + 椭圆灰色背景悬停
              'text-foreground/70 font-medium',
              'hover:text-foreground hover:bg-[#F5F5F5] dark:hover:bg-white/8',
              'rounded-md',
              // 过渡：120ms
              'transition-all duration-[120ms] ease-in-out',
              'cursor-pointer',
            )}
            onClick={() => handleLanguageSwitch('zh')}
            data-testid='language-link-zh'
            data-locale='zh'
            role='menuitem'
          >
            <span className='text-xs'>简体中文</span>
            {switchingTo === 'zh' && (
              <Loader2 className='h-4 w-4 animate-spin' />
            )}
            {locale === 'zh' && switchingTo !== 'zh' && (
              <Check
                className='text-foreground h-4 w-4'
                data-testid='check-icon'
              />
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
});

LanguageToggle.displayName = 'LanguageToggle';
