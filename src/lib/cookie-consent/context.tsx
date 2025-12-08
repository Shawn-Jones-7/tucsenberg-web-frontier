'use client';

/**
 * Cookie Consent React Context
 *
 * Provides cookie consent state and actions throughout the app.
 * Uses useSyncExternalStore for SSR-safe hydration from localStorage.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  clearConsent,
  createAcceptAllConsent,
  createRejectAllConsent,
  loadConsent,
  saveConsent,
} from '@/lib/cookie-consent/storage';
import {
  DEFAULT_CONSENT,
  type CookieCategory,
  type CookieConsent,
  type CookieConsentContextValue,
} from '@/lib/cookie-consent/types';

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

// External store for consent state (enables useSyncExternalStore pattern)
type ConsentListener = () => void;
let consentListeners: ConsentListener[] = [];
let cachedConsent: CookieConsent = DEFAULT_CONSENT;
let cachedHasConsented = false;
// Cached snapshot object to maintain referential stability for useSyncExternalStore
let cachedSnapshot = {
  consent: cachedConsent,
  hasConsented: cachedHasConsented,
};

function emitChange() {
  for (const listener of consentListeners) {
    listener();
  }
}

function subscribeToConsent(listener: ConsentListener): () => void {
  consentListeners = [...consentListeners, listener];
  return () => {
    consentListeners = consentListeners.filter((l) => l !== listener);
  };
}

function getConsentSnapshot(): {
  consent: CookieConsent;
  hasConsented: boolean;
} {
  return cachedSnapshot;
}

// Server snapshot is constant - prevents hydration mismatches
const SERVER_SNAPSHOT: {
  consent: CookieConsent;
  hasConsented: boolean;
} = {
  consent: DEFAULT_CONSENT,
  hasConsented: false,
};

function getServerSnapshot(): {
  consent: CookieConsent;
  hasConsented: boolean;
} {
  return SERVER_SNAPSHOT;
}

// Initialize from localStorage (client-side only)
if (typeof window !== 'undefined') {
  const stored = loadConsent();
  if (stored) {
    cachedConsent = stored.consent;
    cachedHasConsented = true;
    cachedSnapshot = {
      consent: cachedConsent,
      hasConsented: cachedHasConsented,
    };
  }
}

function updateConsentStore(
  newConsent: CookieConsent,
  newHasConsented: boolean,
) {
  cachedConsent = newConsent;
  cachedHasConsented = newHasConsented;
  cachedSnapshot = {
    consent: cachedConsent,
    hasConsented: cachedHasConsented,
  };
  emitChange();
}

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({
  children,
}: CookieConsentProviderProps) {
  const { consent, hasConsented } = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerSnapshot,
  );

  const acceptAll = useCallback(() => {
    const newConsent = createAcceptAllConsent();
    saveConsent(newConsent);
    updateConsentStore(newConsent, true);
  }, []);

  const rejectAll = useCallback(() => {
    const newConsent = createRejectAllConsent();
    saveConsent(newConsent);
    updateConsentStore(newConsent, true);
  }, []);

  const updateConsent = useCallback(
    (category: Exclude<CookieCategory, 'necessary'>, value: boolean) => {
      const newConsent = { ...cachedConsent, [category]: value };
      saveConsent(newConsent);
      updateConsentStore(newConsent, true);
    },
    [],
  );

  const savePreferences = useCallback(
    (preferences: Partial<Omit<CookieConsent, 'necessary'>>) => {
      const newConsent = {
        ...cachedConsent,
        ...preferences,
        necessary: true as const,
      };
      saveConsent(newConsent);
      updateConsentStore(newConsent, true);
    },
    [],
  );

  const resetConsent = useCallback(() => {
    clearConsent();
    updateConsentStore(DEFAULT_CONSENT, false);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasConsented,
      ready: true, // Always ready with useSyncExternalStore
      acceptAll,
      rejectAll,
      updateConsent,
      savePreferences,
      resetConsent,
    }),
    [
      consent,
      hasConsented,
      acceptAll,
      rejectAll,
      updateConsent,
      savePreferences,
      resetConsent,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/** Hook to access cookie consent state and actions */
export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      'useCookieConsent must be used within CookieConsentProvider',
    );
  }
  return context;
}

/** Optional hook that returns null if outside provider (for conditional use) */
export function useCookieConsentOptional(): CookieConsentContextValue | null {
  return useContext(CookieConsentContext);
}
