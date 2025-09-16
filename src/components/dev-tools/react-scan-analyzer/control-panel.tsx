import React from 'react';
import { Download, Play, RotateCcw, Square } from 'lucide-react';
import type { ComponentStats } from '@/components/dev-tools/react-scan-analyzer/data-reader';

interface ControlPanelProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearData: () => void;
  onExportData: () => void;
  recordingHistory: ComponentStats[];
}

/**
 * 控制面板组件
 */
export function ControlPanel({
  isRecording,
  onStartRecording,
  onStopRecording,
  onClearData,
  onExportData,
  recordingHistory,
}: ControlPanelProps) {
  return (
    <div className='bg-muted/50 flex flex-wrap gap-2 rounded-lg p-4'>
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-colors ${
          isRecording
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isRecording ? (
          <>
            <Square className='h-4 w-4' />
            停止记录
          </>
        ) : (
          <>
            <Play className='h-4 w-4' />
            开始记录
          </>
        )}
      </button>

      <button
        onClick={onClearData}
        className='flex items-center gap-2 rounded-md bg-gray-500 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600'
      >
        <RotateCcw className='h-4 w-4' />
        清除数据
      </button>

      <button
        onClick={onExportData}
        disabled={!recordingHistory.length}
        className='flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500'
      >
        <Download className='h-4 w-4' />
        导出数据
      </button>

      {isRecording && (
        <div className='flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-red-800'>
          <div className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
          <span className='text-sm font-medium'>正在记录...</span>
        </div>
      )}
    </div>
  );
}
