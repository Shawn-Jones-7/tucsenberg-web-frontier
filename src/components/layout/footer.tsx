/**
 * Enterprise Footer Component
 *
 * Modern, responsive footer component based on the reference design.
 * Features clean layout with company logo, navigation sections, and social links.
 *
 * Converted to a Server Component to reduce client-side JavaScript.
 * Only the interactive ThemeSwitcher remains a Client Component.
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
import { ExternalLinkIcon, SocialIconLink } from '@/components/ui/social-icons';
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
        className={`text-foreground hover:text-foreground/50 focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors duration-150 outline-none focus-visible:ring-[3px] dark:hover:text-white/50 ${className}`}
      >
        {linkText}
        <ExternalLinkIcon size={COUNT_14} />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={`text-foreground hover:text-foreground/50 focus-visible:ring-ring/50 inline-flex rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors duration-150 outline-none focus-visible:ring-[3px] dark:hover:text-white/50 ${className}`}
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
      <h2 className='text-foreground/85 text-[14px] font-semibold'>
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
      className='flex items-start justify-start gap-4 md:justify-end md:pr-8 lg:pr-12'
    >
      {socialLinks.map((social) => (
        <SocialIconLink
          key={social.key}
          href={social.href}
          icon={social.icon}
          label={social.label}
          ariaLabel={social.ariaLabel}
          iconSize={16}
        />
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
        className='flex items-center space-x-2 text-gray-900 transition-opacity duration-200 hover:opacity-80 dark:text-gray-100'
        aria-label={`${company.name} homepage`}
      >
        {/* Logo placeholder - replace with actual logo */}
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 dark:bg-gray-100'>
          <span className='text-sm font-bold text-white dark:text-gray-900'>
            {company.name.charAt(ZERO)}
          </span>
        </div>
        <span className='text-lg font-semibold'>{company.name}</span>
      </Link>
    </div>
  );
};

// Main Footer Component
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
    <footer className='border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-5'>
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

          {/* Social icons column (bottom-right) */}
          <div className='flex items-end justify-end self-end md:col-span-1'>
            <SocialSection />
          </div>
        </div>

        {/* Copyright and Theme Toggle */}
        <div className='mt-12 border-t border-gray-200 pt-8 dark:border-gray-800'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {getCopyrightText(locale)}
            </p>
            {/* Theme Switcher */}
            <ThemeSwitcher data-testid='theme-toggle' />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
