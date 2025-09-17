'use client';

import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import type { DateFormatOptions } from '@/types/i18n-enhanced';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { memo } from 'react';

interface FormatDateProps {
  date: Date | string | number;
  format?: 'short' | 'long' | 'relative';
  className?: string;
}

const MILLISECONDS_PER_DAY = ANIMATION_DURATION_VERY_SLOW * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * HOURS_PER_DAY;

const FormatDateComponent = ({
  date,
  format = 'short',
  className,
}: FormatDateProps) => {
  const formatter = useFormatter();
  const locale = useLocale();
  const t = useTranslations('formatting.date');

  const dateObj = new Date(date);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - dateObj.getTime()) / MILLISECONDS_PER_DAY,
  );

  let formattedDate: string;

  if (format === 'relative') {
    if (diffInDays === ZERO) {
      formattedDate = t('today');
    } else if (diffInDays === ONE) {
      formattedDate = t('yesterday');
    } else if (diffInDays === -ONE) {
      formattedDate = t('tomorrow');
    } else {
      formattedDate = formatter.dateTime(dateObj, {
        dateStyle: 'medium',
      });
    }
  } else {
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: format === 'long' ? 'full' : 'medium',
    };

    if (format === 'long') {
      options.timeStyle = 'short';
    }

    formattedDate = formatter.dateTime(dateObj, options as DateFormatOptions);
  }

  return (
    <time
      dateTime={dateObj.toISOString()}
      className={className}
      lang={locale}
    >
      {formattedDate}
    </time>
  );
};

FormatDateComponent.displayName = 'FormatDate';
export const FormatDate = memo(FormatDateComponent);

interface FormatNumberProps {
  value: number;
  type?: 'currency' | 'percentage' | 'decimal';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

const FormatNumberComponent = ({
  value,
  type = 'decimal',
  currency = 'USD',
  minimumFractionDigits,
  maximumFractionDigits,
  className,
}: FormatNumberProps) => {
  const formatter = useFormatter();
  const locale = useLocale();

  let formattedNumber: string;

  switch (type) {
    case 'currency': {
      const currencyOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: locale === 'zh' ? 'CNY' : currency,
      };
      if (minimumFractionDigits !== undefined) {
        currencyOptions.minimumFractionDigits = minimumFractionDigits;
      }
      if (maximumFractionDigits !== undefined) {
        currencyOptions.maximumFractionDigits = maximumFractionDigits;
      }
      formattedNumber = formatter.number(value, currencyOptions as any);
      break;
    }
    case 'percentage': {
      const percentOptions: Intl.NumberFormatOptions = {
        style: 'percent',
      };
      if (minimumFractionDigits !== undefined) {
        percentOptions.minimumFractionDigits = minimumFractionDigits;
      }
      if (maximumFractionDigits !== undefined) {
        percentOptions.maximumFractionDigits = maximumFractionDigits;
      }
      formattedNumber = formatter.number(value / PERCENTAGE_FULL, percentOptions as any);
      break;
    }
    default: {
      const numberOptions: Intl.NumberFormatOptions = {};
      if (minimumFractionDigits !== undefined) {
        numberOptions.minimumFractionDigits = minimumFractionDigits;
      }
      if (maximumFractionDigits !== undefined) {
        numberOptions.maximumFractionDigits = maximumFractionDigits;
      }
      formattedNumber = formatter.number(value, numberOptions as any);
    }
  }

  return (
    <span
      className={className}
      lang={locale}
    >
      {formattedNumber}
    </span>
  );
};

FormatNumberComponent.displayName = 'FormatNumber';
export const FormatNumber = memo(FormatNumberComponent);

interface PluralProps {
  count: number;
  category: 'items' | 'users' | 'notifications';
  className?: string;
}

const PluralComponent = ({ count, category, className }: PluralProps) => {
  const t = useTranslations(`formatting.plurals.${category}`);

  const getPluralKey = (count: number): 'zero' | 'one' | 'other' => {
    if (count === ZERO) return 'zero';
    if (count === ONE) return 'one';
    return 'other';
  };

  const pluralKey = getPluralKey(count);
  const message = t(pluralKey, { count });

  return <span className={className}>{message}</span>;
};

PluralComponent.displayName = 'Plural';
export const Plural = memo(PluralComponent);

interface RichTextProps {
  text: string;
  values?: Record<string, React.ReactNode>;
  className?: string;
}

const RichTextComponent = ({ text, values = {}, className }: RichTextProps) => {
  // Simple rich text processor for basic formatting
  const processText = (text: string): React.ReactNode => {
    // Replace {key} with values
    let processed = text;
    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (typeof value === 'string' || typeof value === 'number') {
        processed = processed.replace(
          new RegExp(placeholder, 'g'),
          String(value),
        );
      }
    });

    // Process basic markdown-like formatting
    return processed.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(COUNT_PAIR, -COUNT_PAIR)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(ONE, -ONE)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className='bg-muted rounded px-1'
          >
            {part.slice(ONE, -ONE)}
          </code>
        );
      }
      return part;
    });
  };

  return <span className={className}>{processText(text)}</span>;
};

RichTextComponent.displayName = 'RichText';
export const RichText = memo(RichTextComponent);
