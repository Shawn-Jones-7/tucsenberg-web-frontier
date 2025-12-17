'use client';

import dynamic from 'next/dynamic';

const MobileNavigation = dynamic(
  () =>
    import('@/components/layout/mobile-navigation').then(
      (m) => m.MobileNavigation,
    ),
  { ssr: false },
);

const NavSwitcher = dynamic(
  () => import('@/components/layout/nav-switcher').then((m) => m.NavSwitcher),
  { ssr: false },
);

const LanguageToggle = dynamic(
  () => import('@/components/language-toggle').then((m) => m.LanguageToggle),
  { ssr: false },
);

export function MobileNavigationIsland() {
  return <MobileNavigation />;
}

export function NavSwitcherIsland() {
  return <NavSwitcher />;
}

export function LanguageToggleIsland({ locale }: { locale: 'en' | 'zh' }) {
  // Pass current locale down to avoid next-intl dependency in this island
  return <LanguageToggle locale={locale} />;
}
