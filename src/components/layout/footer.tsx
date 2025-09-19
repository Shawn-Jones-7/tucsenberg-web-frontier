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
        className={`inline-flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 ${className}`}
      >
        {linkText}
        <ExternalLinkIcon size={COUNT_14} />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={`text-gray-600 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 ${className}`}
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
      <h3 className='text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-gray-100'>
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

// Social Section Component
const SocialSection: FC = () => {
  const t = useTranslations();
  const { socialLinks } = FOOTER_CONFIG;

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-gray-100'>
        {t('footer.sections.social.title')}
      </h3>
      <div className='space-y-3'>
        {socialLinks.map((social) => (
          <SocialIconLink
            key={social.key}
            href={social.href}
            icon={social.icon}
            label={social.label}
            ariaLabel={social.ariaLabel}
          />
        ))}
      </div>
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

          {/* Social Section */}
          <div className='md:col-span-1'>
            <SocialSection />
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-12 border-t border-gray-200 pt-8 dark:border-gray-800'>
          <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
            {getCopyrightText(locale)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
