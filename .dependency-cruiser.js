// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '禁止循环依赖 - 防止模块间相互引用导致的架构问题',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: '检测孤立文件 - 识别未被引用的代码文件（已优化减少误报）',
      from: {
        orphan: true,
        pathNot: [
          // 测试文件
          '\\.(d\\.ts|spec\\.ts|test\\.ts|stories\\.ts|stories\\.tsx)$',
          // 类型定义目录和文件
          '^src/types/',
          '.*-types\\.(ts|tsx)$',
          // 测试工具和模板
          '^src/test/',
          '^src/testing/',
          'test-utils\\.(ts|tsx)$',
          'setup\\.(ts|tsx)$',
          // 测试常量
          '^src/constants/test-',
          // Next.js页面文件（文件系统路由）
          '^src/app/.*/page\\.tsx$',
          '^src/app/page\\.tsx$',
          '^src/app/.*/route\\.(ts|tsx)$',
          // Next.js布局和字体配置
          '^src/app/.*/layout-fonts\\.(ts|tsx)$',
          // 配置文件
          '^src/config/',
          // Mock文件
          '/mocks/',
          // 工具文件（可能通过动态导入使用）
          '^src/lib/.*\\.(ts|tsx)$',
          // 常量文件（可能通过动态导入使用）
          '^src/constants/.*\\.(ts|tsx)$',
          // 服务文件（可能通过动态导入使用）
          '^src/services/.*\\.(ts|tsx|js|jsx)$',
          // UI组件（可能通过动态导入使用）
          '^src/components/ui/.*\\.(ts|tsx)$',
          '^src/components/loading-.*\\.(ts|tsx)$',
          '^src/components/theme-provider\\.(ts|tsx)$',
          // 开发工具组件（开发环境专用）
          '^src/components/dev-tools/.*\\.(ts|tsx)$',
          // 展示和演示组件（可能通过动态导入使用）
          '^src/components/examples/.*\\.(ts|tsx)$',
          '^src/components/shared/under-construction.*\\.(ts|tsx)$',
          // CTA组件（可能通过动态导入使用）
          '^src/components/home/cta/.*\\.(ts|tsx)$',
          // Hook文件（可能通过动态导入使用）
          '^src/hooks/.*\\.(ts|tsx)$',
          // 可访问性测试组件（测试专用）
          '^src/app/.*/accessibility-test/.*\\.(ts|tsx)$',
          // React Scan演示相关（开发工具）
          '^src/app/.*/react-scan-demo/.*\\.(ts|tsx)$',
          // 数据和配置文件（可能通过动态导入使用）
          '/data\\.(ts|tsx|js|jsx)$',
          '.*-config\\.(ts|tsx)$',
        ].join('|'),
      },
      to: {},
    },
    {
      name: 'feature-isolation',
      severity: 'error',
      comment: '特性间依赖隔离 - 确保功能模块间的清晰边界',
      from: { path: '^src/features/[^/]+' },
      to: {
        path: '^src/features/(?!\\1)[^/]+',
        pathNot: '^src/(shared|lib|components|utils|types|hooks)',
      },
    },
    {
      name: 'no-external-to-internal',
      severity: 'error',
      comment: '禁止外部依赖直接访问内部模块',
      from: { pathNot: '^src/' },
      to: { path: '^src/lib/internal' },
    },
    {
      name: 'no-test-imports-in-production',
      severity: 'error',
      comment: '禁止生产代码导入测试文件',
      from: {
        pathNot: '\\.(spec|test|stories)\\.(js|ts|tsx)$',
      },
      to: {
        path: '\\.(spec|test|stories)\\.(js|ts|tsx)$',
      },
    },
    {
      name: 'no-dev-dependencies-in-production',
      severity: 'error',
      comment: '禁止生产代码导入开发依赖',
      from: {
        path: '^src/',
        pathNot: '\\.(spec|test|stories)\\.(js|ts|tsx)$',
      },
      to: {
        dependencyTypes: ['npm-dev'],
      },
    },
    // === 跨域依赖规则 - 架构重构专用 ===
    {
      name: 'no-cross-domain-direct-access',
      severity: 'error',
      comment: '禁止跨域直接访问 - 必须通过公开API',
      from: {
        path: '^src/lib/(security|content|accessibility|resend|whatsapp|performance-monitoring|i18n|locale-storage|web-vitals|theme-analytics)/',
      },
      to: {
        path: '^src/lib/(?!\\1)[^/]+/',
        pathNot: '^src/lib/(shared|utils|types|constants)/',
      },
    },
    {
      name: 'no-relative-cross-layer-imports',
      severity: 'error',
      comment: '禁止相对路径跨层导入 - 必须使用@/别名',
      from: { path: '^src/' },
      to: {
        path: '\\.\\./',
        pathNot: '\\.(spec|test|stories)\\.(js|ts|tsx)$',
      },
    },
    {
      name: 'enforce-domain-boundaries',
      severity: 'warn',
      comment: '强制域边界 - 域内文件应优先使用域内依赖',
      from: { path: '^src/lib/([^/]+)/' },
      to: {
        path: '^src/lib/(?!\\1|shared|utils|types|constants)[^/]+/',
        pathNot: '^src/(components|hooks|app)/',
      },
    },
    {
      name: 'no-barrel-export-dependencies',
      severity: 'warn',
      comment: '避免通过barrel导出建立依赖 - 重构期间临时规则',
      from: {},
      to: {
        path: 'index\\.(ts|js)$',
        pathNot: '^src/(app|components)/',
      },
    },
  ],
  options: {
    tsConfig: {
      fileName: path.join(__dirname, 'tsconfig.json'),
    },
    doNotFollow: {
      path: 'node_modules|\\.(spec|test|stories)\\.(js|ts|tsx)$',
    },
    exclude: {
      path: '\\.(spec|test|stories)\\.(js|ts|tsx)$|node_modules',
    },
    tsPreCompilationDeps: true,
    preserveSymlinks: false,
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            bgcolor: 'transparent',
            splines: 'ortho',
            rankdir: 'TB',
            fontname: 'Helvetica',
            fontsize: '9',
          },
          modules: [
            {
              criteria: { source: '^src/app' },
              attributes: { fillcolor: '#ffcccc', style: 'filled' },
            },
            {
              criteria: { source: '^src/components' },
              attributes: { fillcolor: '#ccffcc', style: 'filled' },
            },
            {
              criteria: { source: '^src/lib' },
              attributes: { fillcolor: '#ccccff', style: 'filled' },
            },
            {
              criteria: { source: '^src/features' },
              attributes: { fillcolor: '#ffffcc', style: 'filled' },
            },
          ],
        },
      },
    },
  },
};
