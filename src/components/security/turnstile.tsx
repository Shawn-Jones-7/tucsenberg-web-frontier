'use client';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { Turnstile } from '@marsidev/react-turnstile';
import React from 'react';

/**
 * 使用全局 logger（开发环境输出，生产环境静默）
 */

interface TurnstileProps {
  onVerify?: (_token: string) => void;
  onError?: (_error: string) => void;
  onExpire?: () => void;
  onLoad?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  tabIndex?: number;
  id?: string;
}

/**
 * Cloudflare Turnstile CAPTCHA component
 *
 * This component provides bot protection using Cloudflare's Turnstile service.
 * It's a privacy-focused alternative to reCAPTCHA that doesn't track users.
 *
 * @param onVerify - Callback when CAPTCHA is successfully verified
 * @param onError - Callback when CAPTCHA encounters an error
 * @param onExpire - Callback when CAPTCHA token expires
 * @param onLoad - Callback when CAPTCHA widget loads
 * @param className - Additional CSS classes
 * @param theme - Visual theme (light, dark, auto)
 * @param size - Widget size (normal, compact)
 * @param tabIndex - Tab index for accessibility
 * @param id - HTML id attribute
 */
export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  onLoad,
  className,
  theme = 'auto',
  size = 'normal',
  tabIndex,
  id,
}: TurnstileProps) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Don't render if no site key is configured
  if (!siteKey) {
    logger.warn(
      'Turnstile site key not configured. Bot protection is disabled.',
    );
    return null;
  }

  // Don't render in test environment
  if (env.NEXT_PUBLIC_TEST_MODE) {
    return (
      <div
        className={`turnstile-mock ${className || ''}`}
        data-testid='turnstile-mock'
      >
        <div className='text-muted-foreground text-sm'>
          Bot protection disabled in test mode
        </div>
      </div>
    );
  }

  const handleVerify = (token: string) => {
    if (onVerify) {
      onVerify(token);
    }
  };

  const handleError = (error: string) => {
    logger.error('Turnstile error:', error);
    if (onError) {
      onError(error);
    }
  };

  const handleExpire = () => {
    logger.warn('Turnstile token expired');
    if (onExpire) {
      onExpire();
    }
  };

  const handleLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div className={`turnstile-container ${className || ''}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        onLoad={handleLoad}
        options={{
          theme,
          size,
          tabIndex,
        }}
        id={id}
      />
    </div>
  );
}

/**
 * Hook for managing Turnstile state
 */
export function useTurnstile() {
  const [isVerified, setIsVerified] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [error, _setError] = React.useState<string | null>(null);
  const [isLoading, _setIsLoading] = React.useState(false);

  const handleVerify = React.useCallback((verificationToken: string) => {
    setToken(verificationToken);
    setIsVerified(true);
    _setError(null);
    _setIsLoading(false);
  }, []);

  const handleError = React.useCallback((errorMessage: string) => {
    _setError(errorMessage);
    setIsVerified(false);
    setToken(null);
    _setIsLoading(false);
  }, []);

  const handleExpire = React.useCallback(() => {
    setIsVerified(false);
    setToken(null);
    _setError(null);
    _setIsLoading(false);
  }, []);

  const handleLoad = React.useCallback(() => {
    _setIsLoading(true);
    _setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setIsVerified(false);
    setToken(null);
    _setError(null);
    _setIsLoading(false);
  }, []);

  return {
    isVerified,
    token,
    error,
    isLoading,
    handlers: {
      onVerify: handleVerify,
      onError: handleError,
      onExpire: handleExpire,
      onLoad: handleLoad,
    },
    reset,
  };
}

// Re-export for convenience
export { Turnstile } from '@marsidev/react-turnstile';
