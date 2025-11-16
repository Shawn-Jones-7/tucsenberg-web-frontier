/**
 * 自动化测试组件
 */
interface AutomatedTestSectionProps {
  testResults: string;
  isRunning: boolean;
  onRunTests: () => void;
}

export function AutomatedTestSection({
  testResults,
  isRunning,
  onRunTests,
}: AutomatedTestSectionProps) {
  return (
    <div className='mb-8 rounded-lg border bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-xl font-semibold text-gray-900'>自动化测试</h2>
      <button
        onClick={onRunTests}
        disabled={isRunning}
        className='rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {isRunning ? '正在测试...' : '运行无障碍性测试'}
      </button>

      {testResults && (
        <div className='mt-6'>
          <h3 className='mb-2 font-medium text-gray-900'>测试结果：</h3>
          <pre className='overflow-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100'>
            {testResults}
          </pre>
        </div>
      )}
    </div>
  );
}
