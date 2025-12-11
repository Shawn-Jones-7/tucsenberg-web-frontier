'use client';

/**
 * Cookie Consent Banner
 *
 * GDPR/CCPA compliant cookie consent banner with:
 * - Accept All / Reject All quick actions
 * - Manage preferences panel
 * - Smooth slide-in animation
 * - Responsive design (bottom bar on mobile, floating on desktop)
 * - CSS variable coordination with floating elements (--cookie-banner-height)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCookieConsent } from '@/lib/cookie-consent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CSS_VAR_BANNER_HEIGHT = '--cookie-banner-height';

interface CookieBannerProps {
  className?: string;
}

/**
 * Update --cookie-banner-height CSS variable on document root
 */
function setCookieBannerHeight(height: number): void {
  document.documentElement.style.setProperty(
    CSS_VAR_BANNER_HEIGHT,
    `${height}px`,
  );
}

/**
 * Reset --cookie-banner-height to 0 when banner is dismissed
 */
function resetCookieBannerHeight(): void {
  document.documentElement.style.setProperty(CSS_VAR_BANNER_HEIGHT, '0px');
}

export function CookieBanner({ className }: CookieBannerProps) {
  const t = useTranslations('cookie');
  const { hasConsented, ready, acceptAll, rejectAll, savePreferences } =
    useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Update CSS variable when banner size changes
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || hasConsented) {
      resetCookieBannerHeight();
      return undefined;
    }

    const updateHeight = () => {
      const { height } = banner.getBoundingClientRect();
      setCookieBannerHeight(height);
    };

    // Initial measurement
    updateHeight();

    // Observe size changes (e.g., preferences panel toggle)
    const observer = new ResizeObserver(updateHeight);
    observer.observe(banner);

    return () => {
      observer.disconnect();
      resetCookieBannerHeight();
    };
  }, [hasConsented]);

  const handleSavePreferences = useCallback(() => {
    savePreferences({ analytics, marketing });
    setShowPreferences(false);
  }, [analytics, marketing, savePreferences]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
  }, [acceptAll]);

  const handleRejectAll = useCallback(() => {
    rejectAll();
  }, [rejectAll]);

  // Don't render until hydrated or if already consented
  if (!ready || hasConsented) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      role='dialog'
      aria-modal='false'
      aria-label={t('title')}
      className={cn(
        'animate-in slide-in-from-bottom fixed inset-x-0 bottom-0 z-[100] duration-300',
        'border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'shadow-lg',
        className,
      )}
    >
      <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
        {showPreferences ? (
          <PreferencesPanel
            t={t}
            analytics={analytics}
            marketing={marketing}
            onAnalyticsChange={setAnalytics}
            onMarketingChange={setMarketing}
            onSave={handleSavePreferences}
            onClose={() => setShowPreferences(false)}
          />
        ) : (
          <MainBanner
            t={t}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
            onManage={() => setShowPreferences(true)}
          />
        )}
      </div>
    </div>
  );
}

interface MainBannerProps {
  t: ReturnType<typeof useTranslations<'cookie'>>;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onManage: () => void;
}

function MainBanner({
  t,
  onAcceptAll,
  onRejectAll,
  onManage,
}: MainBannerProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex-1 space-y-1'>
        <p className='text-sm font-medium text-foreground'>{t('title')}</p>
        <p className='text-xs text-muted-foreground sm:text-sm'>
          {t('description')}{' '}
          <Link
            href='/privacy'
            className='underline underline-offset-4 hover:text-foreground'
          >
            {t('learnMore')}
          </Link>
        </p>
      </div>
      <div className='flex flex-wrap items-center gap-2 sm:flex-nowrap'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onManage}
          className='text-xs'
        >
          {t('manage')}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={onRejectAll}
          className='text-xs'
        >
          {t('rejectAll')}
        </Button>
        <Button
          variant='default'
          size='sm'
          onClick={onAcceptAll}
          className='text-xs'
        >
          {t('acceptAll')}
        </Button>
      </div>
    </div>
  );
}

interface PreferencesPanelProps {
  t: ReturnType<typeof useTranslations<'cookie'>>;
  analytics: boolean;
  marketing: boolean;
  onAnalyticsChange: (value: boolean) => void;
  onMarketingChange: (value: boolean) => void;
  onSave: () => void;
  onClose: () => void;
}

function PreferencesPanel({
  t,
  analytics,
  marketing,
  onAnalyticsChange,
  onMarketingChange,
  onSave,
  onClose,
}: PreferencesPanelProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-sm font-medium text-foreground'>
            {t('preferences.title')}
          </p>
          <p className='text-xs text-muted-foreground'>
            {t('preferences.description')}
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='h-8 w-8 shrink-0'
          aria-label={t('close')}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        {/* Necessary - Always enabled, onChange is no-op since disabled */}
        <CategoryToggle
          label={t('categories.necessary')}
          description={t('categories.necessaryDesc')}
          checked={true}
          disabled={true}
          onChange={Function.prototype as unknown as (value: boolean) => void}
        />

        {/* Analytics */}
        <CategoryToggle
          label={t('categories.analytics')}
          description={t('categories.analyticsDesc')}
          checked={analytics}
          onChange={onAnalyticsChange}
        />

        {/* Marketing */}
        <CategoryToggle
          label={t('categories.marketing')}
          description={t('categories.marketingDesc')}
          checked={marketing}
          onChange={onMarketingChange}
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onClose}
        >
          {t('cancel')}
        </Button>
        <Button
          variant='default'
          size='sm'
          onClick={onSave}
        >
          {t('savePreferences')}
        </Button>
      </div>
    </div>
  );
}

interface CategoryToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function CategoryToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: CategoryToggleProps) {
  const id = `cookie-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
        disabled ? 'cursor-not-allowed bg-muted/50' : 'hover:bg-muted/50',
        checked && !disabled && 'border-primary/50 bg-primary/5',
      )}
    >
      <input
        id={id}
        type='checkbox'
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className='mt-0.5 h-4 w-4 rounded border-input accent-primary disabled:cursor-not-allowed disabled:opacity-50'
      />
      <div className='flex-1 space-y-0.5'>
        <p className='text-xs leading-none font-medium text-foreground'>
          {label}
        </p>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>
    </label>
  );
}
