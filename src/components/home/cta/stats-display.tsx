interface StatsDisplayProps {
  stats: Array<{ value: string; label: string }>;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
      {stats.map((stat, index) => (
        <div
          key={index}
          className='text-center'
        >
          <div className='text-2xl font-bold text-foreground sm:text-3xl'>
            {stat.value}
          </div>
          <div className='text-sm text-muted-foreground'>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
