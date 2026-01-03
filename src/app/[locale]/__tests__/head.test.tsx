/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('LocaleHead', () => {
  it('renders analytics dns-prefetch link by default', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_CN_FONT_SUBSET', 'false');

    const { default: LocaleHead } = await import('@/app/[locale]/head');
    render(<LocaleHead />);

    const link = document.querySelector(
      'link[rel="dns-prefetch"][href="https://vitals.vercel-insights.com"]',
    );
    expect(link).not.toBeNull();
  });
});
