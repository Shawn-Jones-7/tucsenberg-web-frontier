import {
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TRIPLE,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  ZERO,
} from '@/constants';

/**
 * 性能监控核心工具冲突检查
 * Performance Monitoring Core Tool Conflict Detection
 *
 * 负责检测和解决性能监控工具之间的冲突问题
 */

/**
 * 工具冲突检查结果
 * Tool conflict check result
 */
export interface ToolConflictResult {
  hasConflicts: boolean;
  conflicts: string[];
  warnings: string[];
  recommendations: string[];
  detectedTools: string[];
}

/**
 * 工具冲突检查器
 * Tool conflict checker
 */
export class PerformanceToolConflictChecker {
  // 删除未使用的 _knownTools 以消除 no-underscore-dangle 与 no-unused-vars

  /**
   * 检查工具冲突
   * Check tool conflicts
   */
  checkToolConflicts(): ToolConflictResult {
    const conflicts: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const detectedTools: string[] = [];

    // 检查全局对象中的工具
    this.detectGlobalTools(detectedTools);

    // 检查性能API冲突
    this.checkPerformanceAPIConflicts(conflicts, warnings);

    // 检查开发者工具冲突
    this.checkDevToolsConflicts(conflicts, warnings);

    // 检查第三方监控工具冲突
    this.checkThirdPartyToolConflicts(detectedTools, conflicts, warnings);

    // 生成建议
    this.generateRecommendations(detectedTools, conflicts, recommendations);

    return {
      hasConflicts: conflicts.length > ZERO,
      conflicts,
      warnings,
      recommendations,
      detectedTools,
    };
  }

  /**
   * 检测全局工具
   * Detect global tools
   */
  private detectGlobalTools(detectedTools: string[]): void {
    if (typeof window === 'undefined') return;

    const checks: Array<{ name: string; test: () => boolean }> = [
      {
        name: 'React DevTools',
        test: () => '__REACT_DEVTOOLS_GLOBAL_HOOK__' in window,
      },
      {
        name: 'Redux DevTools',
        test: () => '__REDUX_DEVTOOLS_EXTENSION__' in window,
      },
      {
        name: 'Vue DevTools',
        test: () => '__VUE_DEVTOOLS_GLOBAL_HOOK__' in window,
      },
      { name: 'Angular DevTools', test: () => 'ng' in window },
      {
        name: 'Sentry',
        test: () => 'Sentry' in window || '__SENTRY__' in window,
      },
      {
        name: 'Google Analytics',
        test: () => 'gtag' in window || 'ga' in window || 'dataLayer' in window,
      },
      { name: 'LogRocket', test: () => 'LogRocket' in window },
      { name: 'FullStory', test: () => 'FS' in window },
      { name: 'Hotjar', test: () => 'hj' in window },
      { name: 'Mixpanel', test: () => 'mixpanel' in window },
      { name: 'Amplitude', test: () => 'amplitude' in window },
    ];

    for (const c of checks) {
      if (c.test()) detectedTools.push(c.name);
    }
  }

  /**
   * 检查性能API冲突
   * Check Performance API conflicts
   */
  private checkPerformanceAPIConflicts(
    conflicts: string[],
    warnings: string[],
  ): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // 检查PerformanceObserver是否被多次使用
    const performanceObserverCount = this.countPerformanceObservers();
    if (performanceObserverCount > COUNT_TRIPLE) {
      warnings.push(
        `检测到 ${performanceObserverCount} 个 PerformanceObserver 实例，可能影响性能`,
      );
    }

    // 检查User Timing API使用情况
    const userTimingMarks = performance.getEntriesByType('mark').length;
    const userTimingMeasures = performance.getEntriesByType('measure').length;

    if (userTimingMarks > PERCENTAGE_FULL) {
      warnings.push(`检测到 ${userTimingMarks} 个性能标记，建议定期清理`);
    }

    if (userTimingMeasures > PERCENTAGE_HALF) {
      warnings.push(`检测到 ${userTimingMeasures} 个性能测量，建议定期清理`);
    }

    // 检查是否有其他工具在监听性能事件
    if (this.hasMultiplePerformanceListeners()) {
      conflicts.push('检测到多个工具在监听性能事件，可能导致数据重复或冲突');
    }
  }

  /**
   * 检查开发者工具冲突
   * Check DevTools conflicts
   */
  private checkDevToolsConflicts(
    conflicts: string[],
    warnings: string[],
  ): void {
    if (typeof window === 'undefined') return;

    // 检查是否在开发模式
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      let devToolsCount = ZERO;

      if ('__REACT_DEVTOOLS_GLOBAL_HOOK__' in window) devToolsCount += ONE;
      if ('__REDUX_DEVTOOLS_EXTENSION__' in window) devToolsCount += ONE;
      if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) devToolsCount += ONE;

      if (devToolsCount > COUNT_PAIR) {
        warnings.push(
          `开发环境中检测到 ${devToolsCount} 个开发者工具，可能影响性能测试准确性`,
        );
      }
    }

    // 检查生产环境中的开发工具
    if (!isDevelopment) {
      const prodDevTools: string[] = [];

      if ('__REACT_DEVTOOLS_GLOBAL_HOOK__' in window)
        prodDevTools.push('React DevTools');
      if ('__REDUX_DEVTOOLS_EXTENSION__' in window)
        prodDevTools.push('Redux DevTools');

      if (prodDevTools.length > ZERO) {
        conflicts.push(`生产环境中检测到开发工具: ${prodDevTools.join(', ')}`);
      }
    }
  }

  /**
   * 检查第三方监控工具冲突
   * Check third-party monitoring tool conflicts
   */
  private checkThirdPartyToolConflicts(
    detectedTools: string[],
    conflicts: string[],
    warnings: string[],
  ): void {
    const monitoringTools = detectedTools.filter((tool) =>
      ['Sentry', 'LogRocket', 'FullStory', 'New Relic', 'DataDog'].includes(
        tool,
      ),
    );

    if (monitoringTools.length > COUNT_PAIR) {
      warnings.push(
        `检测到多个监控工具: ${monitoringTools.join(', ')}，可能导致性能开销`,
      );
    }

    const analyticsTools = detectedTools.filter((tool) =>
      ['Google Analytics', 'Adobe Analytics', 'Mixpanel', 'Amplitude'].includes(
        tool,
      ),
    );

    if (analyticsTools.length > COUNT_PAIR) {
      warnings.push(
        `检测到多个分析工具: ${analyticsTools.join(', ')}，建议整合数据收集`,
      );
    }

    // 检查工具间的已知冲突
    this.checkKnownConflicts(detectedTools, conflicts);
  }

  /**
   * 检查已知冲突
   * Check known conflicts
   */
  private checkKnownConflicts(
    detectedTools: string[],
    conflicts: string[],
  ): void {
    // LogRocket 和 FullStory 可能冲突
    if (
      detectedTools.includes('LogRocket') &&
      detectedTools.includes('FullStory')
    ) {
      conflicts.push('LogRocket 和 FullStory 同时使用可能导致会话录制冲突');
    }

    // 多个性能监控工具可能冲突
    const performanceTools = detectedTools.filter((tool) =>
      ['New Relic', 'DataDog', 'AppDynamics', 'Dynatrace'].includes(tool),
    );

    if (performanceTools.length > ONE) {
      conflicts.push(`多个APM工具可能冲突: ${performanceTools.join(', ')}`);
    }
  }

  /**
   * 生成建议
   * Generate recommendations
   */
  private generateRecommendations(
    detectedTools: string[],
    conflicts: string[],
    recommendations: string[],
  ): void {
    if (conflicts.length > ZERO) {
      recommendations.push('建议审查和整合监控工具，避免功能重复');
      recommendations.push('考虑使用统一的监控平台来减少工具冲突');
    }

    if (detectedTools.length > COUNT_FIVE) {
      recommendations.push('检测到较多监控工具，建议评估每个工具的必要性');
      recommendations.push('考虑使用条件加载来减少生产环境的工具数量');
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    if (
      !isDevelopment &&
      detectedTools.some((tool) => tool.includes('DevTools'))
    ) {
      recommendations.push('生产环境中应移除开发者工具以提高性能');
    }

    if (detectedTools.length === ZERO) {
      recommendations.push('未检测到明显的工具冲突，当前配置良好');
    }
  }

  /**
   * 计算PerformanceObserver数量
   * Count PerformanceObserver instances
   */
  private countPerformanceObservers(): number {
    // 这是一个估算，实际实现可能需要更复杂的检测逻辑
    if (typeof window === 'undefined' || !window.PerformanceObserver)
      return ZERO;

    // 检查常见的性能监控库是否在使用PerformanceObserver
    let count = ZERO;

    // 检查Web Vitals
    if ((window as { webVitals?: unknown }).webVitals) count += ONE;

    // 检查其他可能的监控工具
    const performanceObservers = (
      window as typeof window & {
        __PERFORMANCE_OBSERVERS__?: unknown;
      }
    ).__PERFORMANCE_OBSERVERS__;

    if (Array.isArray(performanceObservers)) {
      count += performanceObservers.length;
    }

    return count;
  }

  /**
   * 检查是否有多个性能监听器
   * Check if there are multiple performance listeners
   */
  private hasMultiplePerformanceListeners(): boolean {
    if (typeof window === 'undefined') return false;

    // 检查是否有多个工具在监听load事件
    const loadListeners = this.getEventListenerCount('load');
    const performanceListeners = this.getEventListenerCount('DOMContentLoaded');

    return loadListeners > COUNT_PAIR || performanceListeners > COUNT_PAIR;
  }

  /**
   * 获取事件监听器数量
   * Get event listener count
   */
  private getEventListenerCount(
    eventType: 'load' | 'DOMContentLoaded',
  ): number {
    // 这是一个简化的实现，实际可能需要更复杂的检测
    if (typeof window === 'undefined') return ZERO;

    try {
      // 尝试获取事件监听器信息（仅在开发环境中可用）
      const listenersMap = (
        window as {
          getEventListeners?: (target: unknown) => {
            load?: unknown[];
            DOMContentLoaded?: unknown[];
          };
        }
      ).getEventListeners?.(window);

      if (!listenersMap) return ZERO;

      if (eventType === 'load') {
        return Array.isArray(listenersMap.load)
          ? listenersMap.load.length
          : ZERO;
      }
      // eventType === 'DOMContentLoaded'
      return Array.isArray(listenersMap.DOMContentLoaded)
        ? listenersMap.DOMContentLoaded.length
        : ZERO;
    } catch {
      return ZERO;
    }
  }

  /**
   * 获取工具详细信息
   * Get tool details
   */
  getToolDetails(toolName: string): {
    name: string;
    detected: boolean;
    version?: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  } | null {
    if (typeof window === 'undefined') return null;

    type KnownTool =
      | 'React DevTools'
      | 'Redux DevTools'
      | 'Sentry'
      | 'Google Analytics';

    const toolDetailsMap = new Map<
      KnownTool,
      {
        detected: boolean;
        impact: 'low' | 'medium' | 'high';
        description: string;
      }
    >([
      [
        'React DevTools',
        {
          detected: '__REACT_DEVTOOLS_GLOBAL_HOOK__' in window,
          impact: 'low',
          description: 'React 开发者工具，用于调试 React 组件',
        },
      ],
      [
        'Redux DevTools',
        {
          detected: '__REDUX_DEVTOOLS_EXTENSION__' in window,
          impact: 'low',
          description: 'Redux 开发者工具，用于调试状态管理',
        },
      ],
      [
        'Sentry',
        {
          detected: 'Sentry' in window,
          impact: 'medium',
          description: '错误监控和性能监控平台',
        },
      ],
      [
        'Google Analytics',
        {
          detected: 'gtag' in window || 'ga' in window,
          impact: 'medium',
          description: '网站分析和用户行为跟踪工具',
        },
      ],
    ]);

    const isKnownTool = (name: string): name is KnownTool =>
      (
        [
          'React DevTools',
          'Redux DevTools',
          'Sentry',
          'Google Analytics',
        ] as const
      ).includes(name as KnownTool);

    if (!isKnownTool(toolName)) return null;

    const tool = toolDetailsMap.get(toolName);
    if (!tool) return null;

    return { name: toolName, ...tool };
  }

  /**
   * 生成冲突解决方案
   * Generate conflict resolution
   */
  generateResolutionPlan(conflicts: string[]): {
    priority: 'high' | 'medium' | 'low';
    actions: string[];
    timeline: string;
  }[] {
    return conflicts.map((conflict) => {
      if (conflict.includes('生产环境') || conflict.includes('APM工具')) {
        return {
          priority: 'high' as const,
          actions: [
            '立即审查生产环境配置',
            '移除不必要的开发工具',
            '整合监控工具功能',
          ],
          timeline: '1-COUNT_PAIR 天内完成',
        };
      }

      if (conflict.includes('多个工具') || conflict.includes('性能事件')) {
        return {
          priority: 'medium' as const,
          actions: ['评估工具的必要性', '实施条件加载策略', '优化工具配置'],
          timeline: '1 周内完成',
        };
      }

      return {
        priority: 'low' as const,
        actions: ['监控工具使用情况', '定期检查工具冲突', '优化工具配置'],
        timeline: 'COUNT_PAIR 周内完成',
      };
    });
  }
}

/**
 * 创建工具冲突检查器
 * Create tool conflict checker
 */
export function createConflictChecker(): PerformanceToolConflictChecker {
  return new PerformanceToolConflictChecker();
}

/**
 * 快速检查工具冲突
 * Quick check for tool conflicts
 */
export function quickConflictCheck(): ToolConflictResult {
  const checker = new PerformanceToolConflictChecker();
  return checker.checkToolConflicts();
}
