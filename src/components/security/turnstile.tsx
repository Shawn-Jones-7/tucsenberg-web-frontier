'use client';

import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { env } from '../../../env.mjs';

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
    if (process.env.NODE_ENV === 'development') {
      console.warn('Turnstile site key not configured. Bot protection is disabled.');
    }
    return null;
  }

  // Don't render in test environment
  if (env.NEXT_PUBLIC_TEST_MODE) {
    return (
      <div
        className={`turnstile-mock ${className || ''}`}
        data-testid="turnstile-mock"
      >
        <div className="text-sm text-muted-foreground">
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
    console.error('Turnstile error:', error);
    if (onError) {
      onError(error);
    }
  };

  const handleExpire = () => {
    console.warn('Turnstile token expired');
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
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        onLoad={handleLoad}
        options={{
          theme,
          size,
          tabindex: tabIndex,
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
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleVerify = React.useCallback((verificationToken: string) => {
    setToken(verificationToken);
    setIsVerified(true);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = React.useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsVerified(false);
    setToken(null);
    setIsLoading(false);
  }, []);

  const handleExpire = React.useCallback(() => {
    setIsVerified(false);
    setToken(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleLoad = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setIsVerified(false);
    setToken(null);
    setError(null);
    setIsLoading(false);
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
