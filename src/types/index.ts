/**
 * TypeScript类型定义统一导出
 * 提供项目中所有类型定义的统一入口
 */

// 导出全局类型
export type {
  ApiResponse,
  PaginatedResponse,
  DeepPartial,
  RequiredKeys,
  OptionalKeys,
  Brand,
  UserId,
  Email,
  Theme,
  Locale,
  Environment,
  ErrorType,
  LoadingState,
  FormState,
  FormErrors,
  EventHandler,
  AsyncFunction,
  ConfigOptions,
} from '@/types/global';

// 导出测试相关类型
// 导出测试工具函数
export {
  isMockDOMElement,
  isMockKeyboardEvent,
  isValidThemeMode,
} from '@/types/test-types';
// 导出测试类型定义
export type {
  MockDOMElement,
  MockKeyboardEvent,
  MockMouseEvent,
  MockProcessEnv,
  MockCrypto,
  MockGlobal,
  ThemeMode,
  MockPerformanceMetric,
  MockSwitchPattern,
  MockAnalyticsConfig,
  MockFunction,
  TestCallback,
  TestConfig,
  MockColorData,
  AccessibilityManagerPrivate,
  AccessibilityTestConfig,
  ThemeAnalyticsPrivate,
  ThemeAnalyticsInstance,
  IncompleteThemeColors,
  CSSVariablesTest,
  ExtendedMockFunction,
  SpyFunction,
  TestSuiteConfig,
  PatternMatchResult,
  TestDataGenerator,
  TestAssertion,
  AllTestTypes,
  UnsafeLocaleCode,
  NumberFormatConstructor,
  DateTimeFormatConstructor,
  MockStorageManager,
  MockGeolocation,
} from '@/types/test-types';

// 导出颜色系统类型
export type { ThemeColors } from '@/lib/colors/types';

// 导出React 19 Hook类型
export type {
  ActionState,
  ServerActionFunction,
  UseActionStateReturn,
  UseActionState,
  UseFormStatusReturn,
  UseFormStatus,
  OptimisticUpdateFunction,
  UseOptimisticReturn,
  UseOptimistic,
  UseResource,
  Use,
  FormAction,
  FormProps,
  ButtonProps,
  ServerComponent,
  AsyncServerComponent,
  UseTransitionReturn,
  ErrorInfo,
  ErrorBoundaryProps,
  SuspenseProps,
  React19ComponentProps,
  React19FormComponentProps,
  Awaited,
  FormFieldValue,
  FormDataMap,
  ServerActionResult,
} from '@/types/react19';

// 导出React 19类型守卫函数
export { isPromise, isContext, isFormData } from '@/types/react19';

// 未来可以添加更多类型模块的导出
// export * from '@/types/api';
// export * from '@/types/auth';
// export * from '@/types/forms';
// export * from '@/types/components';
