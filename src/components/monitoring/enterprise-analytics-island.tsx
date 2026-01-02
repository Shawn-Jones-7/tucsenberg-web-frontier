'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useLocale } from 'next-intl';
import { useCookieConsentOptional } from '@/lib/cookie-consent';
import { logger } from '@/lib/logger';
import { storeAttributionData } from '@/lib/utm';

const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((mod) => mod.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false },
);

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function useWebVitalsTracking(locale: string, analyticsAllowed: boolean) {
  useEffect(() => {
    if (!analyticsAllowed) return;

    const RUM_ENABLED =
      process.env.NEXT_PUBLIC_RUM === '1' ||
      process.env.NEXT_PUBLIC_RUM === 'true';
    const ROOT_MARGIN =
      process.env.NEXT_PUBLIC_IDLE_ROOTMARGIN ?? '400px 0px 400px 0px';
    const ZH_FAST =
      process.env.NEXT_PUBLIC_FAST_LCP_ZH === '1' ||
      process.env.NEXT_PUBLIC_FAST_LCP_ZH === 'true';

    import('web-vitals')
      .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        const baseDims = () => {
          const [navEntry] = performance.getEntriesByType(
            'navigation',
          ) as PerformanceNavigationTiming[];
          const navType = navEntry?.type ?? 'navigate';
          type NetworkInformation = { effectiveType?: string };
          type NavigatorWithConnection = Navigator & {
            connection?: NetworkInformation;
          };
          const conn =
            (navigator as NavigatorWithConnection).connection?.effectiveType ??
            'unknown';
          const device = window.innerWidth < 768 ? 'mobile' : 'desktop';
          return {
            locale,
            navType,
            conn,
            device,
            rootMargin: ROOT_MARGIN,
            zhFastLcp: ZH_FAST ? '1' : '0',
          } as const;
        };

        const report = async (m: {
          name: string;
          value: number;
          rating: string;
        }) => {
          logger.warn(
            `[Web Vitals] ${m.name}: ${m.value} (${m.rating}) - ${locale}`,
          );
          if (RUM_ENABLED && process.env.NODE_ENV === 'production') {
            try {
              const { track } = await import('@vercel/analytics');
              const dims = baseDims();
              track('web-vital', {
                name: m.name,
                value: Math.round(m.value),
                rating: m.rating,
                locale: dims.locale,
                navType: dims.navType,
                conn: dims.conn,
                device: dims.device,
                rootMargin: dims.rootMargin,
                zhFastLcp: dims.zhFastLcp,
              });
            } catch {
              // ignore any analytics error
            }
          }
        };

        onCLS(report);
        onFCP(report);
        onLCP(report);
        onTTFB(report);
        onINP(report);
      })
      .catch((e) => logger.error('Failed to load web-vitals', e));
  }, [locale, analyticsAllowed]);
}

export function EnterpriseAnalyticsIsland() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProd = process.env.NODE_ENV === 'production';
  const cookieConsent = useCookieConsentOptional();

  const analyticsAllowed = cookieConsent
    ? cookieConsent.ready
      ? cookieConsent.consent.analytics
      : false
    : true;

  const gaEnabled = Boolean(GA_MEASUREMENT_ID) && analyticsAllowed && isProd;

  useEffect(() => {
    storeAttributionData();
  }, []);

  useEffect(() => {
    if (!gaEnabled || typeof window.gtag !== 'function') return;
    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
      page_location: window.location.href,
    });
  }, [pathname, searchParams, gaEnabled]);

  useWebVitalsTracking(locale, analyticsAllowed);

  if (!analyticsAllowed) return null;

  return (
    <>
      {gaEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy='afterInteractive'
          />
          <Script
            id='ga4-init'
            strategy='afterInteractive'
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}
      {isProd && <Analytics />}
      {isProd && <SpeedInsights />}
    </>
  );
}
