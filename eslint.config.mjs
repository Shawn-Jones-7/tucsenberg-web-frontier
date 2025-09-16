import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import security from 'eslint-plugin-security';
import securityNode from 'eslint-plugin-security-node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Next.js configuration using compat
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),

  // React You Might Not Need An Effect configuration
  {
    name: 'react-you-might-not-need-an-effect-config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
    },
    rules: {
      // 🔴 Enabled as error - Detects unnecessary useEffect patterns
      'react-you-might-not-need-an-effect/no-empty-effect': 'error',
      'react-you-might-not-need-an-effect/no-reset-all-state-when-a-prop-changes':
        'error',
      'react-you-might-not-need-an-effect/no-event-handler': 'error',
      'react-you-might-not-need-an-effect/no-pass-live-state-to-parent':
        'error',
      'react-you-might-not-need-an-effect/no-pass-data-to-parent': 'error',
      'react-you-might-not-need-an-effect/no-manage-parent': 'error',
      'react-you-might-not-need-an-effect/no-initialize-state': 'error',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'error',
      'react-you-might-not-need-an-effect/no-derived-state': 'error',
    },
  },

  // Security configuration
  {
    name: 'security-config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',
    },
  },

  // Node.js Security configuration (补充规则 - 仅保留 eslint-plugin-security 未覆盖的功能)
  {
    name: 'security-node-supplementary-config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'security-node': securityNode,
    },
    rules: {
      // === security-node 核心规则（无 Semgrep 替代方案） ===

      // NoSQL注入防护
      'security-node/detect-nosql-injection': 'error',
      // 不当异常处理
      'security-node/detect-improper-exception-handling': 'error',
      // 未处理的事件错误
      'security-node/detect-unhandled-event-errors': 'error',
      // Cookie安全配置错误
      'security-node/detect-security-missconfiguration-cookie': 'error',
      // SSL禁用检测
      'security-node/disable-ssl-across-node-server': 'error',

      // === 已迁移到 eslint-plugin-security 的规则（禁用避免重复） ===

      // 已迁移：security/detect-non-literal-regexp
      'security-node/non-literal-reg-expr': 'off',
      // 已迁移：security/detect-pseudoRandomBytes
      'security-node/detect-insecure-randomness': 'off',
      // 已迁移：security/detect-eval-with-expression
      'security-node/detect-eval-with-expr': 'off',
      // 已迁移：security/detect-non-literal-require
      'security-node/detect-non-literal-require-calls': 'off',
      // 已迁移：security/detect-possible-timing-attacks
      'security-node/detect-possible-timing-attacks': 'off',

      // === 已迁移到 Semgrep 的规则（禁用避免重复） ===

      // 已迁移：semgrep sql-injection-risk 规则覆盖
      'security-node/detect-sql-injection': 'off',
      // 已迁移：semgrep nextjs-unsafe-html-injection 规则覆盖
      'security-node/detect-html-injection': 'off',
      // 已迁移：semgrep nextjs-unsafe-redirect 规则覆盖
      'security-node/detect-dangerous-redirects': 'off',

      // === 有bug的规则（禁用） ===

      // 插件bug：TypeError: Cannot read properties of undefined (reading 'start')
      'security-node/detect-unhandled-async-errors': 'off',
    },
  },

  // 超严格质量保障配置 - 零妥协标准
  {
    name: 'ultra-strict-quality-config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // 🔒 复杂度控制：企业级标准
      'complexity': ['error', 15], // 企业级标准：复杂度限制15
      'max-depth': ['error', 3], // 降低到3层，强制扁平化
      'max-lines-per-function': [
        'error',
        { max: 120, skipBlankLines: true, skipComments: true },
      ], // 企业级标准：函数长度限制120行（跳过空行与注释）
      'max-params': ['error', 3], // 降低到3个参数，强制对象传参
      'max-nested-callbacks': ['error', 2], // 降低到2层，强制Promise/async
      'max-lines': [
        'error',
        { max: 500, skipBlankLines: true, skipComments: true },
      ], // 调整到500行并跳过空行与注释
      'max-statements': ['error', 20], // 降低到20个语句，强制逻辑简化
      'max-statements-per-line': ['error', { max: 1 }], // 每行最大语句数

      // 🔒 代码质量规则：零容忍标准
      'no-console': 'error', // 完全禁止console，强制使用logger
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',

      // 🔒 新增严格规则：强制代码质量
      'no-empty': 'error', // 禁止空代码块
      'no-empty-function': 'error', // 禁止空函数
      'no-implicit-coercion': 'error', // 禁止隐式类型转换
      'no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1], // 仅允许最基本的数字
          ignoreArrayIndexes: false, // 数组索引也要常量化
          ignoreDefaultValues: false, // 默认值也要常量化
          enforceConst: true,
          detectObjects: true, // 检测对象中的魔法数字
        },
      ],

      // Best practices (最严格)
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'radix': 'error',
      'yoda': 'error',

      // 安全相关 (最严格)
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'require-await': 'error',

      // 代码风格 (最严格)
      'array-callback-return': 'error',
      'block-scoped-var': 'error',
      'consistent-return': 'error',
      'default-case': 'error', // 升级为error - switch语句必须有default case
      'default-case-last': 'error',
      'dot-notation': [
        'error',
        {
          allowKeywords: true,
          allowPattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*$', // Allow flexible property access for better DX
        },
      ],
      'guard-for-in': 'error',
      'no-caller': 'error',
      'no-constructor-return': 'error',
      'no-else-return': 'error',
      'no-empty-function': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-floating-decimal': 'error',
      'no-implicit-coercion': 'error',
      'no-implicit-globals': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-magic-numbers': [
        'error', // 升级为error - 魔法数字必须定义为常量
        {
          ignore: [
            0, 1, -1, 100, 200, 201, 400, 401, 403, 404, 500, 502, 503, 1000,
            3000, 5000, 8080, 3001,
          ], // 扩展常见端口和状态码
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true, // Allow magic numbers in default parameters
          enforceConst: true, // Encourage constant definitions for business logic
        },
      ],
      'no-multi-assign': 'error',
      'no-new': 'error',
      'no-new-object': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': 'error',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ],
      'no-shadow': 'error',
      'no-ternary': 'off', // 允许三元运算符，但要谨慎使用
      'no-underscore-dangle': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-private-class-members': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: false, // 允许数组索引访问，如 arr[0]
          object: true, // 仍然要求对象解构
        },
      ],
      'prefer-exponentiation-operator': 'error',
      'prefer-object-spread': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // 🔴 全TypeScript项目：严格禁止any类型
      '@typescript-eslint/no-explicit-any': 'error',
      // Note: no-unsafe-* rules require type information, handled by Next.js config

      // Note: Some TypeScript rules requiring type information are handled by Next.js config
    },
  },

  // 精简的i18n文件配置 - 仅豁免必要规则
  {
    name: 'i18n-overrides',
    files: [
      'src/lib/i18n-*.ts',
      'src/lib/translation-*.ts',
      'src/lib/locale-*.ts',
      'src/components/i18n/*.tsx',
      'src/types/i18n.ts',
      'src/components/language-toggle.tsx',
    ],
    rules: {
      // 仅豁免i18n特定的必要规则
      'no-magic-numbers': 'off', // i18n配置中的数字常量
      'max-lines-per-function': [
        'warn',
        { max: 200, skipBlankLines: true, skipComments: true },
      ], // i18n函数可能较长（跳过空行与注释）
      'complexity': ['warn', 20], // i18n逻辑可能复杂
      'security/detect-object-injection': 'error', // i18n动态键访问，统一为error级别
      'dot-notation': 'off', // i18n键名可能包含特殊字符
      'no-console': ['warn', { allow: ['warn', 'error'] }], // 允许i18n调试

      // 保持严格的类型安全和基本规则
      '@typescript-eslint/no-explicit-any': 'error', // 恢复严格类型检查
      'no-undef': 'error', // 恢复未定义变量检查
      'security/detect-non-literal-regexp': 'error', // 恢复安全检查
    },
  },

  // 渐进式统一严格标准 - 测试文件适度豁免
  {
    name: 'progressive-unified-test-config',
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      'tests/**/*.{js,jsx,ts,tsx}',
      'src/test/**/*.{js,jsx,ts,tsx}',
      'src/testing/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
    rules: {
      // 🎯 渐进式标准：测试文件保持合理限制
      'max-lines-per-function': [
        'warn',
        { max: 600, skipBlankLines: true, skipComments: true },
      ], // 调整为600行并跳过空行与注释，适应大型测试describe块
      'complexity': ['warn', 20], // 从25降到20，保持测试逻辑清晰
      'max-nested-callbacks': ['warn', 6], // 从8降到6，控制嵌套深度
      'max-lines': [
        'warn',
        { max: 800, skipBlankLines: true, skipComments: true },
      ], // 从1200降到800，并跳过空行与注释
      'max-statements': ['warn', 50], // 从80降到50，鼓励测试分解
      'max-params': ['warn', 8], // 从10降到8，合理参数数量

      // 测试文件必要的特殊模式（保持不变）
      'no-magic-numbers': 'off', // 测试数据需要具体数值
      'no-plusplus': 'off', // 循环计数器在测试中常见
      'prefer-arrow-callback': 'off', // function表达式在测试中更清晰
      'no-unused-expressions': 'off', // expect().toBe() 断言语句
      'no-empty-function': 'off', // 空mock函数是合理的
      'prefer-destructuring': 'off', // 测试中直接属性访问更直观
      'no-new': 'off', // mock对象创建需要
      'require-await': 'off', // async测试模式
      'no-throw-literal': 'off', // 测试异常抛出
      'no-underscore-dangle': 'off', // 私有属性测试访问

      // 🎯 行业标准：测试文件允许any类型（Mock对象复杂性）
      '@typescript-eslint/no-explicit-any': 'off', // 测试文件允许any类型 - 符合行业标准
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // 严格清理未使用变量
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // 保持代码整洁
      '@typescript-eslint/no-require-imports': 'off', // 测试中可能需要require导入

      // 安全规则统一为error级别
      'security/detect-object-injection': 'error', // 测试数据访问，统一为error级别
      'security/detect-unsafe-regex': 'warn', // 测试正则表达式
      'no-script-url': 'off', // 测试URL可能需要

      // 保持严格的基本语法规则
      'no-undef': 'error', // 未定义变量必须修复
      'no-shadow': 'warn', // 变量遮蔽警告
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }], // 允许测试调试输出
      '@next/next/no-img-element': 'off', // 测试中允许使用原生 img 元素
    },
  },

  // 渐进式统一严格标准 - 开发工具最小豁免
  {
    name: 'progressive-unified-dev-tools-config',
    files: [
      // 构建脚本和配置文件（真正需要豁免的）
      'scripts/**/*.{js,ts}',
      'src/scripts/**/*.{js,ts}',
      'config/**/*.{js,ts}',
      '.size-limit.js',
      'next.config.ts',
      'tailwind.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      '*.config.{js,ts,mjs}',

      // 开发者工具（应用渐进式标准）
      'src/components/dev-tools/**/*.{ts,tsx}',
      'src/app/**/dev-tools/**/*.{ts,tsx}',
      'src/app/**/react-scan-demo/**/*.{ts,tsx}',
      'src/app/**/diagnostics/**/*.{ts,tsx}',
      'src/lib/react-scan-config.ts',
      'src/lib/dev-tools-positioning.ts',
      'src/lib/performance-monitoring-coordinator.ts',
      'src/constants/dev-tools.ts',
      'src/constants/test-*.ts',
    ],
    rules: {
      // 🎯 渐进式改进：开发工具保持基本质量标准
      'max-lines-per-function': [
        'warn',
        { max: 250, skipBlankLines: true, skipComments: true },
      ], // 调整为250行并跳过空行与注释，适应开发工具复杂性
      'complexity': ['warn', 18], // 从无限制改为18复杂度警告
      'max-lines': [
        'warn',
        { max: 800, skipBlankLines: true, skipComments: true },
      ], // 调整到800行并跳过空行与注释，适应开发工具复杂性

      // 构建脚本必要豁免（保持不变）
      'no-console': 'off', // 构建脚本需要console输出
      'no-magic-numbers': 'off', // 配置文件需要具体数值
      'no-implicit-coercion': 'off', // 配置文件类型转换

      // 🔄 渐进改进：开发工具TypeScript规则收紧
      '@typescript-eslint/no-explicit-any': 'warn', // 开发工具允许适度使用any（全局对象访问）
      '@typescript-eslint/ban-ts-comment': 'warn', // 开发工具允许@ts-nocheck（仅开发环境）

      // 开发工具特定但合理的豁免
      'no-underscore-dangle': [
        'error',
        { allow: ['__REACT_SCAN__', '__DEV__'] },
      ],
      'security/detect-object-injection': 'error', // 开发工具动态访问，统一为error级别
      'no-empty-function': 'warn', // 开发工具占位符
      'consistent-return': 'warn', // 开发工具复杂逻辑
      'no-param-reassign': 'warn', // 开发工具参数修改
      'prefer-destructuring': 'warn', // 开发工具属性访问

      // 保持严格的基本语法检查
      'no-undef': ['error', { typeof: true }], // 未定义变量检查
      'no-unused-vars': 'warn', // 清理未使用变量

      // 🚀 ESLint修复专用：scripts目录特殊规则
      '@typescript-eslint/no-require-imports': 'off', // scripts中允许require导入
      'no-restricted-imports': 'off', // scripts中禁用相对路径限制（Node.js环境）
      'security/detect-non-literal-fs-filename': 'warn', // 文件系统操作降级为警告
      'security/detect-non-literal-regexp': 'warn', // 动态正则表达式降级为警告
      'max-statements': ['warn', 35], // scripts中允许更多语句
      'max-depth': ['warn', 4], // scripts中允许更深嵌套
      'max-nested-callbacks': ['warn', 4], // scripts中允许更多回调嵌套
      'no-plusplus': 'off', // scripts中允许++操作符
      'prefer-template': 'warn', // scripts中字符串拼接降级为警告
      'radix': 'warn', // parseInt缺少radix参数降级为警告
      'no-useless-escape': 'warn', // 不必要的转义字符降级为警告
      'require-await': 'warn', // async函数无await降级为警告
      'default-case': 'warn', // switch缺少default降级为警告
      'no-else-return': 'warn', // else return降级为警告
    },
  },

  // 🎯 架构重构专用规则 - 禁止新增export *
  {
    name: 'architecture-refactor-rules',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // 禁止新增export *重新导出 - 架构重构期间临时规则
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            '🚫 架构重构期间禁止新增 export * 重新导出。请使用命名导出：export { specificExport } from "./module"',
        },
      ],

      // 禁止相对路径导入（强制使用@/别名）
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message:
                '🚫 请使用 @/ 路径别名替代相对路径导入，例如：import { something } from "@/lib/module"',
            },
          ],
        },
      ],
    },
  },

  // 🎯 渐进式统一严格标准 - 核心配置增强
  {
    name: 'progressive-unified-enhancements',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // AI编码质量保障增强
      'prefer-const': 'error', // AI容易生成let，强制使用const
      'no-var': 'error', // 严格禁止var
      'no-duplicate-imports': 'error', // AI可能重复导入

      // React特化规则（针对AI编码）
      'react-hooks/exhaustive-deps': 'warn', // AI容易遗漏依赖，警告提醒

      // 函数命名和结构
      'func-names': ['warn', 'as-needed'], // 鼓励命名函数，便于调试
      'no-anonymous-default-export': 'off', // 允许匿名默认导出（React组件）

      // 渐进式质量提升
      'max-statements-per-line': ['error', { max: 1 }], // 每行最多一个语句
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }], // 控制空行数量

      // 安全增强（针对AI编码）
      'no-eval': 'error', // 严格禁止eval
      'no-implied-eval': 'error', // 禁止隐式eval
      'no-new-func': 'error', // 禁止Function构造函数

      // 类型安全增强（仅适用于TypeScript文件）
      '@typescript-eslint/no-unused-expressions': 'error', // 禁止未使用的表达式
      // 注意：prefer-nullish-coalescing 和 prefer-optional-chain 需要类型信息
      // 这些规则由 Next.js TypeScript 配置处理
    },
  },

  // TypeScript files: disable base rules that duplicate TS-aware checks
  // 目的：避免在TS文件上同时触发基础 no-unused-vars/no-undef 与 TS 规则的重复报错
  {
    name: 'ts-core-overrides',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },

  // Prettier configuration (must be last to override conflicting rules)
  prettierConfig,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '*.config.js',
      '*.config.mjs',
      'public/**',
      '.env*',
      'coverage/**',
      '*.d.ts',
      'reports/**',
      'backups/**', // 忽略备份文件，减少非目标代码噪声
      'jest.setup.js',
      'jest.config.js',
      'tina/__generated__/**', // 忽略TinaCMS生成的文件
    ],
  },
];
