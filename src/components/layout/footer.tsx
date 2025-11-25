/**
 * Enterprise Footer Component (legacy)
 *
 * Modern, responsive footer component based on an early reference design.
 *
 * @deprecated
 * This layout-level Footer is kept only for historical tests and conductor templates.
 * The actual application layout now uses `@/components/footer/Footer` with
 * configuration-driven columns and design tokens. Do not use this component
 * for new pages or layouts.
 */

import type { FC } from 'react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  FOOTER_CONFIG,
  getCopyrightText,
  type FooterLink,
  type FooterSection,
} from '@/lib/footer-config';
import { logger } from '@/lib/logger';
import {
  ExternalLinkIcon,
  SocialIconMapper,
} from '@/components/ui/social-icons';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { ZERO } from '@/constants';
import { COUNT_14 } from '@/constants/count';

function createSafeTranslator(
  translator: (key: string) => string,
): (key: string) => string {
  return (key: string) => {
    try {
      const value = translator(key);
      return typeof value === 'string' ? value : key;
    } catch (error) {
      logger.warn('Footer translation fallback triggered', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return key;
    }
  };
}

// Footer Link Component
interface FooterLinkComponentProps {
  link: FooterLink;
  className?: string;
  t: (key: string) => string;
}

const FooterLinkComponent: FC<FooterLinkComponentProps> = ({
  link,
  className = '',
  t,
}) => {
  const linkText = t(link.translationKey);

  if (link.external) {
    return (
      <a
        href={link.href}
        target='_blank'
        rel='noopener noreferrer'
        className={`inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-[15px] font-medium text-foreground outline-none transition-colors duration-150 hover:text-foreground/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:hover:text-white/50 ${className}`}
      >
        {linkText}
        <ExternalLinkIcon size={COUNT_14} />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={`inline-flex rounded-xl px-4 py-2.5 text-[15px] font-medium text-foreground outline-none transition-colors duration-150 hover:text-foreground/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:hover:text-white/50 ${className}`}
    >
      {linkText}
    </Link>
  );
};

// Footer Section Component
interface FooterSectionComponentProps {
  section: FooterSection;
}

const FooterSectionComponent: FC<
  FooterSectionComponentProps & { t: (k: string) => string }
> = ({ section, t }) => {
  const sectionTitle = t(section.titleKey);

  return (
    <div className='space-y-4'>
      {/* 使用 h2 提升标题层级，避免从 h1 直接跳到 h3 造成 heading-order 违规；
          同时提高前景色不透明度以满足对比度要求 */}
      <h2 className='text-[14px] font-semibold text-foreground/85'>
        {sectionTitle}
      </h2>
      <ul className='space-y-3'>
        {section.links.map((link) => (
          <li key={link.key}>
            <FooterLinkComponent
              link={link}
              t={t}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Social Section Component (icons row, right aligned on desktop)
const SocialSection: FC = () => {
  const { socialLinks } = FOOTER_CONFIG;

  return (
    <div
      aria-label='Social links'
      className='flex items-center justify-center gap-3 sm:justify-end'
    >
      {socialLinks.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={social.ariaLabel}
          className='flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        >
          <SocialIconMapper
            platform={social.icon}
            size={16}
          />
          <span className='sr-only'>{social.label}</span>
        </a>
      ))}
    </div>
  );
};

// Company Logo Component
const CompanyLogo: FC = () => {
  const { company } = FOOTER_CONFIG;

  return (
    <div className='flex items-center'>
      <Link
        href='/'
        className='flex items-center space-x-2 text-foreground transition-opacity duration-200 hover:opacity-80'
        aria-label={`${company.name} homepage`}
      >
        {/* Logo placeholder - replace with actual logo */}
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-foreground'>
          <span className='text-sm font-bold text-background'>
            {company.name.charAt(ZERO)}
          </span>
        </div>
        <span className='text-lg font-semibold'>{company.name}</span>
      </Link>
    </div>
  );
};

// Main Footer Component (legacy)
/**
 * @deprecated Use `@/components/footer/Footer` from `src/components/footer/Footer.tsx`
 * instead. This server component remains only to support legacy tests and
 * templates and should not be imported in new layouts.
 */
export async function Footer() {
  const { sections } = FOOTER_CONFIG;
  let translator: (key: string) => string;

  try {
    translator = await getTranslations();
  } catch (error) {
    logger.error('Failed to load footer translations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    translator = (key) => key;
  }

  const t = createSafeTranslator(translator);
  const locale = (await getLocale()) as 'en' | 'zh';

  return (
    <footer className='border-t border-border bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          {/* Company Logo */}
          <div className='md:col-span-1'>
            <CompanyLogo />
          </div>

          {/* Navigation Sections */}
          {sections.map((section) => (
            <div
              key={section.key}
              className='md:col-span-1'
            >
              <FooterSectionComponent
                section={section}
                t={t}
              />
            </div>
          ))}
        </div>

        {/* Copyright, socials, and theme */}
        <div className='mt-12 border-t border-border pt-8'>
          <div className='flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-center text-sm text-muted-foreground sm:text-left'>
              {getCopyrightText(locale)}
            </p>
            <div className='flex items-center justify-center gap-4 sm:justify-end'>
              <SocialSection />
              <div className='hidden h-5 w-px bg-border sm:block' />
              <ThemeSwitcher data-testid='theme-toggle' />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
