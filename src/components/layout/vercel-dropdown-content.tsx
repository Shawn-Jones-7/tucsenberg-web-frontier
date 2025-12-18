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
              'inline-flex rounded-lg px-3 py-2 leading-none no-underline select-none',
              // Default state - Vercel exact colors (reuse nav variables)
              'text-vercel-nav-light-default dark:text-vercel-nav-dark-default',
              // Hover state - Vercel exact colors (no background change)
              'hover:text-vercel-nav-light-hover dark:hover:text-vercel-nav-dark-hover',
              // Focus ring - dual layer (inner + outer), disable default ring
              '!focus-visible:ring-0 !focus-visible:ring-offset-0',
              'focus-visible:outline-none',
              'focus-visible:shadow-[0_0_0_2px_var(--color-vercel-nav-focus-inner),0_0_0_4px_var(--color-vercel-nav-focus-outer)]',
              // Vercel timing: 90ms with ease
              'transition-colors duration-[90ms] ease-[ease]',
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
