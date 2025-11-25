'use client';

import type { NavigationItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

type ValidPathname = Parameters<typeof Link>[0] extends { href: infer H }
  ? H
  : never;

export function DropdownContent({
  items,
  t,
}: {
  items: NavigationItem[];
  t: (key: string) => string;
}) {
  return (
    <ul className='grid w-[min(420px,calc(100vw-48px))] grid-cols-2 gap-2 p-3'>
      {items.map((child: NavigationItem) => (
        <li
          key={child.key}
          className='flex justify-center'
        >
          <Link
            href={child.href as ValidPathname}
            className={cn(
              'inline-flex select-none rounded-lg px-3 py-2 leading-none no-underline outline-none transition-colors',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-muted/80 dark:hover:bg-foreground/10',
              'dark:focus-visible:bg-foreground/12 focus-visible:bg-muted/80',
              'font-normal',
            )}
          >
            <div className='text-sm leading-none'>
              {t(child.translationKey)}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
