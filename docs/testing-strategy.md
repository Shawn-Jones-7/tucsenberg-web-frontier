# 测试策略与性能优化指南

## 测试分离策略

### 1. 单元测试 (vitest.config.ts)

**适用场景：**
- 纯函数测试
- 组件逻辑测试（无复杂DOM交互）
- 工具函数测试
- API函数测试
- 状态管理测试

**文件命名规范：**
- `*.test.{js,jsx,ts,tsx}`
- `*.spec.{js,jsx,ts,tsx}`
- `__tests__/**/*.{js,jsx,ts,tsx}`

**性能配置：**
- 最大线程数：3（优化后）
- 测试超时：8秒
- Hook超时：4秒
- 环境：jsdom

### 2. 浏览器测试 (vitest.config.browser.ts)

**适用场景：**
- 复杂DOM交互测试
- 视觉回归测试
- 性能监控测试
- 响应式布局测试
- 真实浏览器API测试

**文件命名规范：**
- `*.browser.test.{js,jsx,ts,tsx}`
- `*.browser.{js,jsx,ts,tsx}`
- `tests/browser/**/*.{test,spec}.{js,jsx,ts,tsx}`
- `visual-regression/**/*.{test,spec}.{js,jsx,ts,tsx}`
- `performance/**/*.{test,spec}.{js,jsx,ts,tsx}`

**性能配置：**
- 最大线程数：2（浏览器资源消耗大）
- 测试超时：20秒（优化后）
- Hook超时：8秒
- 环境：Playwright + Chromium
- 重试次数：2

## 性能优化措施

### 1. 并发配置优化

```typescript
// 单元测试
poolOptions: {
  threads: {
    maxThreads: 3, // 从4降低到3，减少资源竞争
    useAtomics: true, // 启用原子操作
  },
}

// 浏览器测试
poolOptions: {
  threads: {
    maxThreads: 2, // 保持2个线程
    useAtomics: true,
    isolate: true, // 确保测试隔离
  },
}
```

### 2. 超时时间优化

```typescript
// 单元测试
testTimeout: 8000,  // 从10秒降低到8秒
hookTimeout: 4000,  // 从5秒降低到4秒

// 浏览器测试
testTimeout: 20000, // 从30秒降低到20秒
hookTimeout: 8000,  // 从10秒降低到8秒
```

### 3. 智能缓存策略

```typescript
// 缓存配置
cache: {
  dir: 'node_modules/.vitest', // 单元测试缓存
  // dir: 'node_modules/.vitest-browser', // 浏览器测试缓存
},

// 依赖优化
deps: {
  optimizer: {
    web: { enabled: true },
    ssr: { enabled: true }, // 仅单元测试
  },
  inline: [
    'next-intl',
    '@radix-ui/react-*',
    'lucide-react',
    '@testing-library/*', // 仅浏览器测试
  ],
}
```

## 性能监控机制

### 1. 性能阈值

```javascript
const PERFORMANCE_THRESHOLDS = {
  unit: {
    total: 30,      // 总执行时间不超过30秒
    average: 0.1,   // 平均每个测试不超过0.1秒
    warning: 25,    // 警告阈值25秒
  },
  browser: {
    total: 60,      // 总执行时间不超过60秒
    average: 2,     // 平均每个测试不超过2秒
    warning: 50,    // 警告阈值50秒
  },
  coverage: {
    total: 45,      // 总执行时间不超过45秒
    warning: 40,    // 警告阈值40秒
  }
};
```

### 2. 监控命令

```bash
# 运行性能监控
pnpm test:performance

# 持续监控（开发模式）
pnpm test:performance:watch

# 查看性能报告
cat reports/performance-report.json

# 查看性能历史
cat reports/performance-history.json
```

### 3. 性能评分系统

- **90-100分**：优秀，性能表现良好
- **80-89分**：良好，可接受的性能水平
- **70-79分**：一般，需要关注性能优化
- **60-69分**：较差，需要立即优化
- **<60分**：很差，存在严重性能问题

## 最佳实践

### 1. 测试文件组织

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── __tests__/
│   │   │   ├── button.test.tsx          # 单元测试
│   │   │   └── button.browser.test.tsx  # 浏览器测试
│   └── layout/
│       ├── header.tsx
│       └── __tests__/
│           ├── header.test.tsx
│           └── header.browser.test.tsx
tests/
├── unit/           # 额外的单元测试
├── browser/        # 额外的浏览器测试
├── integration/    # 集成测试
└── e2e/           # E2E测试（Playwright）
```

### 2. 测试选择指南

**使用单元测试当：**
- 测试纯函数逻辑
- 测试组件props和状态
- 测试工具函数
- 测试API调用逻辑
- 不需要真实DOM交互

**使用浏览器测试当：**
- 需要测试复杂用户交互
- 需要测试CSS样式和布局
- 需要测试浏览器API
- 需要进行视觉回归测试
- 需要测试性能指标

### 3. 性能优化建议

1. **减少测试并发数**：避免资源竞争
2. **优化测试用例**：移除不必要的等待和延迟
3. **使用精确选择器**：提高元素查找效率
4. **合理使用Mock**：减少外部依赖
5. **定期清理缓存**：避免缓存污染
6. **监控性能趋势**：及时发现性能回归

## 故障排除

### 常见性能问题

1. **测试超时**
   - 检查网络请求是否被正确Mock
   - 确认异步操作是否正确等待
   - 考虑增加特定测试的超时时间

2. **内存泄漏**
   - 检查是否正确清理事件监听器
   - 确认组件卸载后状态清理
   - 使用`afterEach`清理测试状态

3. **并发冲突**
   - 减少并发线程数
   - 使用测试隔离
   - 避免全局状态污染

### 性能调优步骤

1. 运行性能监控：`pnpm test:performance`
2. 分析性能报告：查看瓶颈所在
3. 调整配置参数：根据报告优化设置
4. 重新测试验证：确认优化效果
5. 持续监控：建立性能基线

## 配置文件说明

- `vitest.config.ts`：单元测试和集成测试配置
- `vitest.config.browser.ts`：浏览器测试专用配置
- `scripts/test-performance-monitor.js`：性能监控脚本
- `reports/performance-*.json`：性能监控报告
