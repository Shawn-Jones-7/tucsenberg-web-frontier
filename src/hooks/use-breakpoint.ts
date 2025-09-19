'use client';

import { useEffect, useState } from 'react';
import {
  BREAKPOINT_MD,
  BREAKPOINT_SM,
  BREAKPOINT_XL,
  BYTES_PER_KB,
  ONE,
  ZERO,
} from '@/constants';
import { COUNT_1536 } from '@/constants/count';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  'sm': BREAKPOINT_SM,
  'md': BREAKPOINT_MD,
  'lg': BYTES_PER_KB,
  'xl': BREAKPOINT_XL,
  '2xl': COUNT_1536,
};

export interface UseBreakpointReturn {
  currentBreakpoint: Breakpoint;
  isAbove: (_breakpoint: Breakpoint) => boolean;
  isBelow: (_breakpoint: Breakpoint) => boolean;
  isExactly: (_breakpoint: Breakpoint) => boolean;
  width: number;
}

export function useBreakpoint(
  customBreakpoints?: Partial<BreakpointConfig>,
): UseBreakpointReturn {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return ZERO;
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWidth(window.innerWidth);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // Return empty cleanup function for server-side rendering
    return undefined;
  }, []);

  const getCurrentBreakpoint = (currentWidth: number): Breakpoint => {
    if (currentWidth >= breakpoints['2xl']) return '2xl';
    if (currentWidth >= breakpoints.xl) return 'xl';
    if (currentWidth >= breakpoints.lg) return 'lg';
    if (currentWidth >= breakpoints.md) return 'md';
    return 'sm';
  };

  const currentBreakpoint = getCurrentBreakpoint(width);

  const isAbove = (breakpoint: Breakpoint): boolean => {
    const safeBreakpoints = new Map(Object.entries(breakpoints));
    const breakpointValue = safeBreakpoints.get(breakpoint);
    return breakpointValue !== undefined ? width >= breakpointValue : false;
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    const safeBreakpoints = new Map(Object.entries(breakpoints));
    const breakpointValue = safeBreakpoints.get(breakpoint);
    return breakpointValue !== undefined ? width < breakpointValue : false;
  };

  const isExactly = (breakpoint: Breakpoint): boolean => {
    const breakpointKeys: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointKeys.indexOf(breakpoint);

    if (currentIndex === -ONE) return false;

    const safeBreakpoints = new Map(Object.entries(breakpoints));
    const currentValue = safeBreakpoints.get(breakpoint);
    if (currentValue === undefined) return false;

    const nextBreakpoint = breakpointKeys[currentIndex + ONE];
    const nextValue = nextBreakpoint
      ? safeBreakpoints.get(nextBreakpoint) || Infinity
      : Infinity;

    return width >= currentValue && width < nextValue;
  };

  return {
    currentBreakpoint,
    isAbove,
    isBelow,
    isExactly,
    width,
  };
}
