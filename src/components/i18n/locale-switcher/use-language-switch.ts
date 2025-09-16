import { useState, useTransition } from 'react';
import { MAGIC_2000 } from '@/constants/magic-numbers';

import type { Locale } from '@/types/i18n';
import { useLocaleStorage } from '@/lib/locale-storage';
import { TRANSITION_TIMEOUT } from '@/components/i18n/locale-switcher/config';

export const useLanguageSwitch = () => {
  const [switchingTo, setSwitchingTo] = useState<Locale | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setUserOverride } = useLocaleStorage();

  const handleLanguageSwitch = (newLocale: Locale) => {
    setSwitchingTo(newLocale);
    setSwitchSuccess(false);

    // 保存用户选择
    setUserOverride(newLocale);

    startTransition(() => {
      setTimeout(() => {
        setSwitchingTo(null);
        setSwitchSuccess(true);
        setTimeout(() => setSwitchSuccess(false), MAGIC_2000);
      }, TRANSITION_TIMEOUT);
    });
  };

  return {
    switchingTo,
    switchSuccess,
    isPending,
    handleLanguageSwitch,
  };
};
