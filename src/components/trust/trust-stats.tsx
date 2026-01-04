import { cn } from '@/lib/utils';
import { AnimatedStatItem } from '@/components/trust/animated-stat-item';
import type { TrustStat } from '@/components/trust/trust-types';

export type { TrustStat } from '@/components/trust/trust-types';

export interface TrustStatsProps {
  /** Section title */
  title: string | undefined;
  /** Stats to display */
  stats: TrustStat[];
  /** Use animated counters */
  animated?: boolean;
  /** Custom class name */
  className?: string;
}

function StaticStatItem({ stat }: { stat: TrustStat }) {
  return (
    <div className='text-center'>
      <div className='mb-2 text-4xl font-bold text-primary'>{stat.value}</div>
      <div className='text-sm text-muted-foreground'>{stat.label}</div>
    </div>
  );
}

/**
 * Trust stats section component (Server Component).
 * Displays key business metrics with optional animation.
 */
export function TrustStats({
  title,
  stats,
  animated = false,
  className,
}: TrustStatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className={cn('bg-muted/30 py-12 md:py-16', className)}>
      <div className='container mx-auto px-4'>
        {title !== undefined && (
          <h2 className='mb-10 text-center text-2xl font-bold'>{title}</h2>
        )}

        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) =>
            animated ? (
              <AnimatedStatItem
                key={stat.id}
                stat={stat}
              />
            ) : (
              <StaticStatItem
                key={stat.id}
                stat={stat}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
