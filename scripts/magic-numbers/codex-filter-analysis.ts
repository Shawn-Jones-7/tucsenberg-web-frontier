#!/usr/bin/env tsx

/**
 * CODEX分层治理：分析过滤后的数字，识别真正有业务语义的常量
 * 
 * 目标：从162个数字中筛选出40-60个有意义的业务常量
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface NumberAnalysis {
  value: string;
  constantName: string;
  fileCount: number;
  category: 'business' | 'config' | 'ui' | 'time' | 'http' | 'test' | 'noise';
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * 分析过滤后的数字，按业务价值分类
 */
function analyzeFilteredNumbers(): NumberAnalysis[] {
  // 从预检输出中提取的数字统计（简化版，实际应该从mapping.json读取）
  const numbersFromPreflight = [
    { value: '0', name: 'ZERO', count: 171 },
    { value: '1', name: 'ONE', count: 118 },
    { value: '2', name: 'COUNT_PAIR', count: 57 },
    { value: '3', name: 'COUNT_TRIPLE', count: 38 },
    { value: '4', name: 'COUNT_QUAD', count: 17 },
    { value: '5', name: 'COUNT_FIVE', count: 47 },
    { value: '10', name: 'COUNT_TEN', count: 54 },
    { value: '24', name: 'HOURS_PER_DAY', count: 34 },
    { value: '25', name: 'PERCENTAGE_QUARTER', count: 8 },
    { value: '30', name: 'DAYS_PER_MONTH', count: 17 },
    { value: '50', name: 'PERCENTAGE_HALF', count: 36 },
    { value: '60', name: 'SECONDS_PER_MINUTE', count: 50 },
    { value: '90', name: 'ANGLE_90_DEG', count: 11 },
    { value: '100', name: 'PERCENTAGE_FULL', count: 101 },
    { value: '200', name: 'HTTP_OK', count: 25 },
    { value: '300', name: 'ANIMATION_DURATION_NORMAL', count: 20 },
    { value: '360', name: 'ANGLE_360_DEG', count: 4 },
    { value: '400', name: 'HTTP_BAD_REQUEST', count: 20 },
    { value: '401', name: 'HTTP_UNAUTHORIZED', count: 2 },
    { value: '500', name: 'ANIMATION_DURATION_SLOW', count: 39 },
    { value: '640', name: 'BREAKPOINT_SM', count: 2 },
    { value: '768', name: 'BREAKPOINT_MD', count: 4 },
    { value: '1000', name: 'ANIMATION_DURATION_VERY_SLOW', count: 93 },
    { value: '1024', name: 'BYTES_PER_KB', count: 22 },
    { value: '1280', name: 'BREAKPOINT_XL', count: 3 },
    { value: '1920', name: 'BREAKPOINT_FULL_HD', count: 2 },
    { value: '3000', name: 'THREE_SECONDS_MS', count: 13 },
    { value: '5000', name: 'FIVE_SECONDS_MS', count: 15 },
    { value: '10000', name: 'TEN_SECONDS_MS', count: 16 },
    { value: '30000', name: 'THIRTY_SECONDS_MS', count: 11 },
    { value: '60000', name: 'MINUTE_MS', count: 12 },
  ];

  const analyses: NumberAnalysis[] = [];

  for (const item of numbersFromPreflight) {
    const analysis = categorizeNumber(item.value, item.name, item.count);
    analyses.push(analysis);
  }

  return analyses.sort((a, b) => {
    // 按优先级和使用频率排序
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.fileCount - a.fileCount;
  });
}

/**
 * 对单个数字进行分类和优先级评估
 */
function categorizeNumber(value: string, constantName: string, fileCount: number): NumberAnalysis {
  const num = parseFloat(value);

  // HTTP状态码 - 高优先级业务常量
  if ([200, 201, 400, 401, 403, 404, 429, 500, 502, 503].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'http',
      priority: 'high',
      reason: 'HTTP状态码，API交互核心常量'
    };
  }

  // 时间相关 - 高优先级业务常量
  if ([60, 1000, 3000, 5000, 10000, 30000, 60000].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'time',
      priority: 'high',
      reason: '时间常量，用户体验和性能相关'
    };
  }

  // 百分比 - 高优先级UI常量
  if ([25, 50, 75, 100].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'ui',
      priority: 'high',
      reason: '百分比常量，UI布局和动画核心'
    };
  }

  // 响应式断点 - 高优先级UI常量
  if ([640, 768, 1024, 1280, 1536, 1920].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'ui',
      priority: 'high',
      reason: '响应式断点，移动端适配核心'
    };
  }

  // 动画持续时间 - 中优先级UI常量
  if ([150, 250, 300, 500, 750, 1000, 1500].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'ui',
      priority: 'medium',
      reason: '动画持续时间，用户体验相关'
    };
  }

  // 基础计数 - 中优先级
  if ([0, 1, 2, 3, 4, 5, 10].includes(num) && fileCount > 20) {
    return {
      value,
      constantName,
      fileCount,
      category: 'business',
      priority: 'medium',
      reason: '高频使用的基础计数，代码可读性重要'
    };
  }

  // 角度 - 中优先级
  if ([45, 90, 180, 270, 360].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'ui',
      priority: 'medium',
      reason: '角度常量，图形和动画相关'
    };
  }

  // 数据大小 - 中优先级配置
  if ([256, 512, 1024, 2048, 4096, 8192].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'config',
      priority: 'medium',
      reason: '数据大小常量，性能和存储相关'
    };
  }

  // 测试数据 - 低优先级
  if (constantName.includes('TEST_') || [1234, 12345, 999].includes(num)) {
    return {
      value,
      constantName,
      fileCount,
      category: 'test',
      priority: 'low',
      reason: '测试数据，可考虑豁免'
    };
  }

  // 其他低频数字 - 噪音
  if (fileCount < 5) {
    return {
      value,
      constantName,
      fileCount,
      category: 'noise',
      priority: 'low',
      reason: '低频使用，可考虑豁免或局部常量'
    };
  }

  // 默认分类
  return {
    value,
    constantName,
    fileCount,
    category: 'business',
    priority: 'medium',
    reason: '中频业务数字，需要评估'
  };
}

/**
 * 生成CODEX推荐的精简常量库
 */
function generateCodexRecommendations(analyses: NumberAnalysis[]): void {
  console.log('🎯 CODEX分层治理：精简常量库推荐');
  console.log('');

  // 高优先级常量（必须保留）
  const highPriority = analyses.filter(a => a.priority === 'high');
  console.log(`🔴 高优先级常量 (${highPriority.length}个) - 必须保留:`);
  highPriority.forEach(item => {
    console.log(`  ${item.value} → ${item.constantName} (${item.fileCount}个文件) - ${item.reason}`);
  });
  console.log('');

  // 中优先级常量（选择性保留）
  const mediumPriority = analyses.filter(a => a.priority === 'medium');
  console.log(`🟡 中优先级常量 (${mediumPriority.length}个) - 选择性保留:`);
  mediumPriority.forEach(item => {
    console.log(`  ${item.value} → ${item.constantName} (${item.fileCount}个文件) - ${item.reason}`);
  });
  console.log('');

  // 低优先级常量（建议豁免）
  const lowPriority = analyses.filter(a => a.priority === 'low');
  console.log(`🟢 低优先级常量 (${lowPriority.length}个) - 建议豁免或局部处理:`);
  lowPriority.forEach(item => {
    console.log(`  ${item.value} → ${item.constantName} (${item.fileCount}个文件) - ${item.reason}`);
  });
  console.log('');

  // 统计建议
  const recommended = highPriority.length + Math.ceil(mediumPriority.length * 0.6);
  console.log(`📊 CODEX建议：保留 ${recommended} 个常量 (高优先级 + 60%中优先级)`);
  console.log(`📈 优化效果：从 ${analyses.length} 个减少到 ${recommended} 个，减少 ${Math.round((1 - recommended / analyses.length) * 100)}%`);
  console.log('');

  // 按类别统计
  console.log('📋 按类别统计:');
  const categories = ['http', 'time', 'ui', 'business', 'config', 'test', 'noise'];
  categories.forEach(category => {
    const items = analyses.filter(a => a.category === category);
    if (items.length > 0) {
      console.log(`  ${category}: ${items.length}个`);
    }
  });
}

// 执行分析
if (require.main === module) {
  const analyses = analyzeFilteredNumbers();
  generateCodexRecommendations(analyses);
}
