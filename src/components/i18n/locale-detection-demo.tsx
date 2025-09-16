'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LocaleDetectionResult } from '@/lib/locale-detection';
import { useClientLocaleDetection } from '@/lib/locale-detection';
import type { UserLocalePreference } from '@/lib/locale-storage';
import { useLocaleStorage } from '@/lib/locale-storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedLocaleSwitcher } from '@/components/i18n/enhanced-locale-switcher';

// 工具函数
const getConfidenceColor = (confidence: number) => {
  if (confidence > 0.8) return 'bg-green-100 text-green-800';
  if (confidence > 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'user':
      return '👤';
    case 'geo':
      return '🌍';
    case 'browser':
      return '🌐';
    default:
      return '⚙️';
  }
};

// 检测结果显示组件
interface DetectionResultProps {
  detection: LocaleDetectionResult;
}

const DetectionResult = ({ detection }: DetectionResultProps) => (
  <div>
    <h4 className='mb-2 font-semibold'>当前检测结果</h4>
    <div className='grid grid-cols-2 gap-4'>
      <div className='space-y-2'>
        <div className='flex items-center space-x-2'>
          <span>检测语言:</span>
          <Badge variant='outline'>{detection.locale}</Badge>
        </div>
        <div className='flex items-center space-x-2'>
          <span>检测来源:</span>
          <Badge variant='secondary'>
            {getSourceIcon(detection.source)} {detection.source}
          </Badge>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='flex items-center space-x-2'>
          <span>置信度:</span>
          <Badge className={getConfidenceColor(detection.confidence)}>
            {Math.round(detection.confidence * 100)}%
          </Badge>
        </div>
        {detection.details?.browserLanguages && (
          <div className='text-muted-foreground text-sm'>
            浏览器语言: {detection.details.browserLanguages.join(', ')}
          </div>
        )}
      </div>
    </div>
  </div>
);

// 存储状态显示组件
interface StorageStatsProps {
  stats: unknown;
  onClearOverride: () => void;
}

const StorageStats = ({ stats, onClearOverride }: StorageStatsProps) => (
  <div>
    <h4 className='mb-2 font-semibold'>存储状态</h4>
    <div className='grid grid-cols-2 gap-4'>
      <div className='space-y-2'>
        <div className='flex items-center space-x-2'>
          <span>有偏好设置:</span>
          <Badge
            variant={(stats as any).hasPreference ? 'default' : 'secondary'}
          >
            {(stats as any).hasPreference ? '是' : '否'}
          </Badge>
        </div>
        <div className='flex items-center space-x-2'>
          <span>有用户覆盖:</span>
          <Badge variant={(stats as any).hasOverride ? 'default' : 'secondary'}>
            {(stats as any).hasOverride ? '是' : '否'}
          </Badge>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='flex items-center space-x-2'>
          <span>当前语言:</span>
          <Badge variant='outline'>
            {(stats as any).currentLocale || '未设置'}
          </Badge>
        </div>
        <div className='flex items-center space-x-2'>
          <span>检测次数:</span>
          <Badge variant='secondary'>{(stats as any).detectionCount}</Badge>
        </div>
      </div>
    </div>

    {(stats as any).hasOverride && (
      <div className='mt-4'>
        <Button
          onClick={onClearOverride}
          variant='destructive'
          size='sm'
        >
          清除用户覆盖
        </Button>
      </div>
    )}
  </div>
);

// 偏好详情显示组件
interface PreferenceDetailsProps {
  preference: UserLocalePreference;
}

const PreferenceDetails = ({ preference }: PreferenceDetailsProps) => (
  <div>
    <h4 className='mb-2 font-semibold'>偏好详情</h4>
    <div className='bg-muted rounded-md p-3'>
      <div className='grid grid-cols-2 gap-2 text-sm'>
        <div>语言: {preference.locale}</div>
        <div>来源: {preference.source}</div>
        <div>置信度: {Math.round(preference.confidence * 100)}%</div>
        <div>时间: {new Date(preference.timestamp).toLocaleString()}</div>
      </div>
    </div>
  </div>
);

// 浏览器信息显示组件
const BrowserInfo = () => (
  <div>
    <h4 className='mb-2 font-semibold'>浏览器信息</h4>
    <div className='bg-muted space-y-1 rounded-md p-3 text-sm'>
      {typeof navigator !== 'undefined' && (
        <>
          <div>语言: {navigator.language}</div>
          <div>语言列表: {navigator.languages?.join(', ')}</div>
          <div>用户代理: {navigator.userAgent.substring(0, 100)}...</div>
        </>
      )}
    </div>
  </div>
);

const LocaleDetectionDemoComponent = () => {
  const { getStats, getUserPreference, clearUserOverride } = useLocaleStorage();
  const { detectClientLocale } = useClientLocaleDetection();

  const [stats, setStats] = useState<any>(null);
  const [detection, setDetection] = useState<LocaleDetectionResult | null>(
    null,
  );
  const [preference, setPreference] = useState<UserLocalePreference | null>(
    null,
  );

  const refreshData = useCallback(() => {
    setStats(getStats());
    setDetection(detectClientLocale());
    setPreference(getUserPreference());
  }, [getStats, detectClientLocale, getUserPreference]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleClearOverride = () => {
    clearUserOverride();
    refreshData();
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            智能语言检测演示
            <EnhancedLocaleSwitcher showDetectionInfo />
          </CardTitle>
          <CardDescription>
            展示智能语言检测系统的工作状态和检测结果
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button
            onClick={refreshData}
            variant='outline'
            size='sm'
          >
            刷新数据
          </Button>

          {detection && <DetectionResult detection={detection} />}

          <Separator />

          {stats && (
            <StorageStats
              stats={stats}
              onClearOverride={handleClearOverride}
            />
          )}

          <Separator />

          {preference && <PreferenceDetails preference={preference} />}

          <BrowserInfo />
        </CardContent>
      </Card>
    </div>
  );
};

export const LocaleDetectionDemo = LocaleDetectionDemoComponent;
