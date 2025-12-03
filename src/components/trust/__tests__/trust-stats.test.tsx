/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrustStats, type TrustStat } from '@/components/trust';

describe('TrustStats', () => {
  it('stats 为空时不渲染 section', () => {
    const { container } = render(
      <TrustStats
        title='Business metrics'
        stats={[]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('在非动画模式下渲染传入的 value 和 label', () => {
    const stats: TrustStat[] = [
      {
        id: 'experience',
        value: '15+',
        label: 'Years of experience',
        numericValue: 15,
        suffix: '+',
      },
      {
        id: 'on-time',
        value: '98%',
        label: 'On-time delivery',
        numericValue: undefined,
        suffix: undefined,
      },
    ];

    render(
      <TrustStats
        title='Trusted by global buyers'
        stats={stats}
        animated={false}
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Trusted by global buyers',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('Years of experience')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('On-time delivery')).toBeInTheDocument();
  });
});
