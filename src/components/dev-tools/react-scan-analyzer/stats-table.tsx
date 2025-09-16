import React from 'react';
import type { ComponentStats } from '@/components/dev-tools/react-scan-analyzer/data-reader';

interface StatsTableProps {
  componentStats: ComponentStats[];
}

/**
 * 组件统计表格
 */
export function StatsTable({ componentStats }: StatsTableProps) {
  if (!componentStats.length) {
    return (
      <div className='text-muted-foreground py-8 text-center'>暂无组件数据</div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse'>
        <thead>
          <tr className='border-b'>
            <th className='p-2 text-left font-medium'>组件名称</th>
            <th className='p-2 text-right font-medium'>渲染次数</th>
            <th className='p-2 text-right font-medium'>总时间(ms)</th>
            <th className='p-2 text-right font-medium'>平均时间(ms)</th>
            <th className='p-2 text-right font-medium'>效率分数</th>
          </tr>
        </thead>
        <tbody>
          {componentStats.map((stat, index) => (
            <tr
              key={`${stat.name}-${index}`}
              className='hover:bg-muted/50 border-b'
            >
              <td className='p-2 font-mono text-sm'>{stat.name}</td>
              <td className='p-2 text-right'>{stat.renderCount}</td>
              <td className='p-2 text-right'>{stat.renderTime.toFixed(2)}</td>
              <td className='p-2 text-right'>
                {stat.avgRenderTime.toFixed(2)}
              </td>
              <td className='p-2 text-right'>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    stat.efficiency >= 80
                      ? 'bg-green-100 text-green-800'
                      : stat.efficiency >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {stat.efficiency.toFixed(0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
