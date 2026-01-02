'use client';

/**
 * UTM Parameter Tracking Utility
 * Captures marketing attribution data from URL parameters and stores in sessionStorage
 * Uses first-touch attribution model (only stores if no existing data)
 */

const UTM_STORAGE_KEY = 'marketing_attribution';

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface ClickIds {
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
}

export interface AttributionData extends UtmParams, ClickIds {
  landingPage?: string;
  capturedAt?: string;
}

function sanitizeParam(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 256);
  // Only allow alphanumeric, underscore, hyphen
  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : undefined;
}

export function captureUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(window.location.search);
  const params: UtmParams = {};

  // Use explicit property assignment to avoid object injection
  const utmSource = sanitizeParam(searchParams.get('utm_source'));
  const utmMedium = sanitizeParam(searchParams.get('utm_medium'));
  const utmCampaign = sanitizeParam(searchParams.get('utm_campaign'));
  const utmTerm = sanitizeParam(searchParams.get('utm_term'));
  const utmContent = sanitizeParam(searchParams.get('utm_content'));

  if (utmSource) params.utmSource = utmSource;
  if (utmMedium) params.utmMedium = utmMedium;
  if (utmCampaign) params.utmCampaign = utmCampaign;
  if (utmTerm) params.utmTerm = utmTerm;
  if (utmContent) params.utmContent = utmContent;

  return params;
}

export function captureClickIds(): ClickIds {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(window.location.search);
  const ids: ClickIds = {};

  // Use explicit property assignment to avoid object injection
  const gclid = sanitizeParam(searchParams.get('gclid'));
  const fbclid = sanitizeParam(searchParams.get('fbclid'));
  const msclkid = sanitizeParam(searchParams.get('msclkid'));

  if (gclid) ids.gclid = gclid;
  if (fbclid) ids.fbclid = fbclid;
  if (msclkid) ids.msclkid = msclkid;

  return ids;
}

export function storeAttributionData(): void {
  if (typeof window === 'undefined') return;

  // First-touch: only store if no existing data
  const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (existing) return;

  const utmParams = captureUtmParams();
  const clickIds = captureClickIds();

  // Only store if we have any attribution data
  const hasData =
    Object.values(utmParams).some(Boolean) ||
    Object.values(clickIds).some(Boolean);

  if (!hasData) return;

  const data: AttributionData = {
    ...utmParams,
    ...clickIds,
    landingPage: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
}

export function getAttributionSnapshot(): AttributionData {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AttributionData;
    }
  } catch {
    // Ignore parse errors
  }

  // Fallback to current URL params if no stored data
  return {
    ...captureUtmParams(),
    ...captureClickIds(),
  };
}

export function appendAttributionToFormData(formData: FormData): void {
  const attribution = getAttributionSnapshot();

  if (attribution.utmSource)
    formData.append('utmSource', attribution.utmSource);
  if (attribution.utmMedium)
    formData.append('utmMedium', attribution.utmMedium);
  if (attribution.utmCampaign)
    formData.append('utmCampaign', attribution.utmCampaign);
  if (attribution.utmTerm) formData.append('utmTerm', attribution.utmTerm);
  if (attribution.utmContent)
    formData.append('utmContent', attribution.utmContent);
  if (attribution.gclid) formData.append('gclid', attribution.gclid);
  if (attribution.fbclid) formData.append('fbclid', attribution.fbclid);
  if (attribution.msclkid) formData.append('msclkid', attribution.msclkid);
}

export function getAttributionAsObject(): Record<string, string> {
  const attribution = getAttributionSnapshot();
  const result: Record<string, string> = {};

  if (attribution.utmSource) result.utmSource = attribution.utmSource;
  if (attribution.utmMedium) result.utmMedium = attribution.utmMedium;
  if (attribution.utmCampaign) result.utmCampaign = attribution.utmCampaign;
  if (attribution.utmTerm) result.utmTerm = attribution.utmTerm;
  if (attribution.utmContent) result.utmContent = attribution.utmContent;
  if (attribution.gclid) result.gclid = attribution.gclid;
  if (attribution.fbclid) result.fbclid = attribution.fbclid;
  if (attribution.msclkid) result.msclkid = attribution.msclkid;

  return result;
}
