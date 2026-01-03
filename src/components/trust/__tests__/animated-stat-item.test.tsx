/**
 * @vitest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedStatItem } from '../animated-stat-item';

describe('AnimatedStatItem', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    const MockIntersectionObserver = class {
      private callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe(_target: Element) {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      unobserve(_target: Element) {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    };

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders static value when numericValue is undefined', () => {
    render(
      <AnimatedStatItem
        stat={{
          id: 'customers',
          label: 'Customers',
          value: '1,000+',
          numericValue: undefined,
          suffix: undefined,
        }}
      />,
    );

    expect(screen.getByText('1,000+')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('animates towards numericValue when visible', async () => {
    render(
      <AnimatedStatItem
        stat={{
          id: 'uptime',
          label: 'Uptime',
          value: '99%',
          numericValue: 99,
          suffix: '%',
        }}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('99%')).toBeInTheDocument();
  });
});
