/**
 * Enterprise Footer Component
 *
 * Modern, responsive footer component based on the reference design.
 * Features clean layout with company logo, navigation sections, and social links.
 */

'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  FOOTER_CONFIG,
  getCopyrightText,
  type FooterLink,
  type FooterSection,
} from '@/lib/footer-config';
import { ExternalLinkIcon, SocialIconLink } from '@/components/ui/social-icons';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { ZERO } from '@/constants';
import { COUNT_14 } from '@/constants/count';

// Footer Link Component
interface FooterLinkComponentProps {
  link: FooterLink;
  className?: string;
}

const FooterLinkComponent: FC<FooterLinkComponentProps> = ({
  link,
  className = '',
}) => {
  const t = useTranslations();
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

const FooterSectionComponent: FC<FooterSectionComponentProps> = ({
  section,
}) => {
  const t = useTranslations();
  const sectionTitle = t(section.titleKey);

  return (
    <div className='space-y-4'>
      <h3 className='text-foreground/60 text-[14px] font-semibold'>
        {sectionTitle}
      </h3>
      <ul className='space-y-3'>
        {section.links.map((link) => (
          <li key={link.key}>
            <FooterLinkComponent link={link} />
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
export const Footer: FC = () => {
  const { sections } = FOOTER_CONFIG;
  const locale = useLocale() as 'en' | 'zh';

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
              <FooterSectionComponent section={section} />
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
};

export default Footer;
