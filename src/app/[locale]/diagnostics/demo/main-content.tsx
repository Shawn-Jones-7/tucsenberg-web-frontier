import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AnalysisResults, LogDisplay, MetricsGrid } from '@/app/[locale]/diagnostics/demo/components';
import type { TestResults } from '@/app/[locale]/diagnostics/demo/utils';

// 子组件：总体评分卡片
interface OverallScoreProps {
  testResults: TestResults;
}

function OverallScore({ testResults }: OverallScoreProps) {
  const SCORE_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 70,
    AVERAGE: 50,
  } as const;

  const getScoreVariant = (
    score: number,
  ): 'default' | 'secondary' | 'destructive' => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'default';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'secondary';
    return 'destructive';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return '优秀';
    if (score >= SCORE_THRESHOLDS.GOOD) return '良好';
    if (score >= SCORE_THRESHOLDS.AVERAGE) return '一般';
    return '需要改进';
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>总体性能评分</CardTitle>
        <CardDescription>
          基于 Web Vitals 指标的综合评分 (测试时间:{' '}
          {new Date(testResults.timestamp).toLocaleString()})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-4'>
          <div className='text-4xl font-bold'>{testResults.analysis.score}</div>
          <Badge
            variant={getScoreVariant(testResults.analysis.score)}
            className='px-3 py-1 text-lg'
          >
            {getScoreLabel(testResults.analysis.score)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// 主内容组件
interface MainContentProps {
  testResults: TestResults | null;
  logs: string[];
}

export function MainContent({ testResults, logs }: MainContentProps) {
  return (
    <>
      {testResults && (
        <>
          <OverallScore testResults={testResults} />
          <MetricsGrid testResults={testResults} />
          <AnalysisResults testResults={testResults} />
        </>
      )}
      <LogDisplay logs={logs} />
    </>
  );
}
