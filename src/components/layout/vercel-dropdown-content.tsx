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
    <ul className='grid w-[400px] grid-cols-2 gap-2 p-3'>
      {items.map((child: NavigationItem) => (
        <li
          key={child.key}
          className='flex justify-center'
        >
          <Link
            href={child.href as ValidPathname}
            className={cn(
              'inline-flex select-none rounded-xl px-3 py-2 leading-none no-underline outline-none transition-colors',
              'text-foreground/90 hover:text-foreground',
              'hover:bg-zinc-950/[.03] dark:hover:bg-white/10',
              'dark:focus:bg-white/12 focus:bg-zinc-950/[.05]',
              'font-medium',
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
