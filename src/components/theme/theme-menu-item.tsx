'use client';

import type { LucideIcon } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ThemeMenuItemProps {
  theme: string;
  currentTheme?: string;
  label: string;
  ariaLabel: string;
  icon: LucideIcon;
  supportsViewTransitions: boolean;
  prefersReducedMotion: boolean;
  onClick: (_e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown: (_e: React.KeyboardEvent) => void;
}

export function ThemeMenuItem({
  theme,
  currentTheme,
  label,
  ariaLabel,
  icon: Icon,
  supportsViewTransitions,
  prefersReducedMotion,
  onClick,
  onKeyDown,
}: ThemeMenuItemProps) {
  const isSelected = currentTheme === theme;

  return (
    <DropdownMenuItem
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`focus:bg-accent focus:text-accent-foreground ${supportsViewTransitions && !prefersReducedMotion ? 'transition-all duration-200 hover:bg-accent' : ''} ${isSelected ? 'bg-accent text-accent-foreground' : ''} `}
      role='menuitem'
      aria-label={ariaLabel}
    >
      <Icon
        className='mr-2 h-4 w-4'
        aria-hidden='true'
      />
      <span>{label}</span>
      {isSelected && (
        <span
          className='ml-auto text-xs'
          aria-label='当前选中'
        >
          ●
        </span>
      )}
      {supportsViewTransitions && (
        <span
          className='ml-auto text-xs text-muted-foreground'
          aria-hidden='true'
        >
          ✨
        </span>
      )}
    </DropdownMenuItem>
  );
}
