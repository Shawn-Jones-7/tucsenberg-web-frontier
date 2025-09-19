'use client';

import { memo } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import type { DateFormatOptions } from '@/types/i18n-enhanced';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_PAIR,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';

interface FormatDateProps {
  date: Date | string | number;
  format?: 'short' | 'long' | 'relative';
  className?: string;
}

const MILLISECONDS_PER_DAY =
  ANIMATION_DURATION_VERY_SLOW *
  SECONDS_PER_MINUTE *
  SECONDS_PER_MINUTE *
  HOURS_PER_DAY;

const buildNumberOptions = (
  base: Record<string, unknown>,
  minimum?: number,
  maximum?: number,
): Record<string, unknown> => {
  const opts: Record<string, unknown> = { ...base };
  if (typeof minimum === 'number') opts.minimumFractionDigits = minimum;
  if (typeof maximum === 'number') opts.maximumFractionDigits = maximum;
  return opts;
};

const resolveCurrency = (locale: string, fallback: string) =>
  locale === 'zh' ? 'CNY' : fallback;

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

  const formatValue = (): string => {
    if (type === 'currency') {
      const options = buildNumberOptions(
        {
          style: 'currency',
          currency: resolveCurrency(locale, currency),
        },
        minimumFractionDigits,
        maximumFractionDigits,
      );
      const num = formatter.number as unknown as (
        v: number,
        o?: Record<string, unknown>,
      ) => string;
      return num(value, options);
    }

    if (type === 'percentage') {
      const options = buildNumberOptions(
        {
          style: 'percent',
        },
        minimumFractionDigits,
        maximumFractionDigits,
      );
      const num = formatter.number as unknown as (
        v: number,
        o?: Record<string, unknown>,
      ) => string;
      return num(value / PERCENTAGE_FULL, options);
    }

    const options = buildNumberOptions(
      {},
      minimumFractionDigits,
      maximumFractionDigits,
    );
    const num = formatter.number as unknown as (
      v: number,
      o?: Record<string, unknown>,
    ) => string;
    return num(value, options);
  };

  const formattedNumber = formatValue();

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

  const getPluralKey = (value: number): 'zero' | 'one' | 'other' => {
    if (value === ZERO) return 'zero';
    if (value === ONE) return 'one';
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
  const processText = (rawText: string): React.ReactNode => {
    // Replace {key} with values
    let processed = rawText;
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const placeholder = `{${key}}`;
        processed = processed.split(placeholder).join(String(value));
      }
    });

    // Process basic markdown-like formatting
    return processed.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index}>{part.slice(COUNT_PAIR, -COUNT_PAIR)}</strong>
        );
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
