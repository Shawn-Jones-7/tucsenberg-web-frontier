'use client';

import * as React from 'react';
import { ProgressProvider } from '@bprogress/next/app';

interface NavigationProgressBarProps {
  children: React.ReactNode;
}

/**
 * Progress bar provider component for page navigation
 * Uses @bprogress/next with theme integration
 */
export function NavigationProgressBar({ children }: NavigationProgressBarProps) {
  return (
    <ProgressProvider
      height="2px"
      color="hsl(var(--primary))"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
