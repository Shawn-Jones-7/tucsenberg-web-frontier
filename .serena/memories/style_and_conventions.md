# 代码风格与约定
- 全部沟通、代码注释与文档使用中文；新增文件需 UTF-8 无 BOM。
- 遵循 Next.js / React 组件语义化结构，类型以 TypeScript 严格模式书写，杜绝 `any`、`unknown` 悬挂；测试与模拟需通过公开 API，而非访问私有字段。
- ESLint（包含 security 规则）+ Prettier 为统一风格；Tailwind 合理使用原子类并结合 `tailwind-merge`；命名遵循驼峰与有意义的模块前缀。
- 测试使用 Vitest + Testing Library，`vi.hoisted` 管理 mock；E2E 采用 Playwright。
- 变更需遵循 AGENTS.md 强制约束：最小变更、中文文档、记录证据，必要时补充观察/迁移方案。