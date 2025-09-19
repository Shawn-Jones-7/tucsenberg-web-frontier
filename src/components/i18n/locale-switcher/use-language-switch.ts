'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { Locale } from '@/types/i18n';
import { useLocaleStorage } from '@/lib/locale-storage';
import { TRANSITION_TIMEOUT } from '@/components/i18n/locale-switcher/config';
import { MAGIC_2000 } from '@/constants/count';

export const useLanguageSwitch = () => {
  const [switchingTo, setSwitchingTo] = useState<Locale | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setUserOverride } = useLocaleStorage();

  type TimeoutHandle = ReturnType<typeof setTimeout>;

  const transitionTimeoutRef = useRef<TimeoutHandle | null>(null);
  const resetTimeoutRef = useRef<TimeoutHandle | null>(null);

  const clearTimers = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const clearSuccess = useCallback(() => {
    setSwitchSuccess(false);
  }, []);

  const handleResetTimeout = useCallback(() => {
    clearSuccess();
    resetTimeoutRef.current = null;
  }, [clearSuccess]);

  const scheduleReset = useCallback(() => {
    resetTimeoutRef.current = setTimeout(handleResetTimeout, MAGIC_2000);
  }, [handleResetTimeout]);

  const finalizeSwitch = useCallback(() => {
    setSwitchingTo(null);
    setSwitchSuccess(true);
    scheduleReset();
  }, [scheduleReset]);

  const handleTransitionTimeout = useCallback(() => {
    finalizeSwitch();
    transitionTimeoutRef.current = null;
  }, [finalizeSwitch]);

  const scheduleTransition = useCallback(() => {
    transitionTimeoutRef.current = setTimeout(
      handleTransitionTimeout,
      TRANSITION_TIMEOUT,
    );
  }, [handleTransitionTimeout]);

  const handleLanguageSwitch = useCallback(
    (newLocale: Locale) => {
      clearTimers();
      setSwitchingTo(newLocale);
      setSwitchSuccess(false);
      setUserOverride(newLocale);

      startTransition(scheduleTransition);
    },
    [clearTimers, scheduleTransition, setUserOverride, startTransition],
  );

  useEffect(() => clearTimers, [clearTimers]);

  return {
    switchingTo,
    switchSuccess,
    isPending,
    handleLanguageSwitch,
  };
};
