# Next.js 16 + next-intl 4 + Cache Components：PPR / dynamicIO / i18n 路由未来升级入口点清单

## 〇、当前实现状态摘要

| 特性 | 状态 | 说明 |
|------|------|------|
| **Cache Components** | ✅ 已启用 | `cacheComponents: true` |
| **`"use cache"` + `cacheLife()`** | ✅ 已使用 | 首页 hero、联系页文案等数据函数 |
| **显式 locale 传参** | ✅ 已规范 | 避免隐式 request 依赖 |
| **`setRequestLocale`** | ✅ 已调用 | `[locale]/layout.tsx` |
| **PPR** | ❌ 暂未启用 | 等待 next-intl 官方支持 |
| **dynamicIO** | ❌ 暂未启用 | 等待 next-intl 官方支持 |
| **`cacheTag()` / `revalidateTag()`** | ❌ 未实现 | 当前场景不需要细粒度失效 |

---

## 一、背景说明

### 1. 当前技术组合

- **Next.js 版本**：16（App Router）
- **i18n 方案**：`next-intl` 4
- **组件级缓存**：已开启 **Cache Components** 模式
  - `next.config.ts` 中：

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    inlineCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // ppr: 'incremental', // 暂未启用
  },
};
```

### 2. 已启用的特性

- **Cache Components**：
  - 采用“**数据函数级** `"use cache" + cacheLife()`”模式，而不是直接在 `page.tsx` 上缓存整页。
  - 典型用法：

```ts
// src/app/[locale]/page.tsx
async function getHomeHeroMessages(locale: 'en' | 'zh') {
  'use cache';
  cacheLife('days');
  // 依赖显式 locale + 外部 JSON 消息
}
```

- **next-intl 集成模式**：
  - 通过 `getRequestConfig` + `requestLocale` 推断当前语言；
  - 在 `[locale]/layout.tsx` 中调用 `setRequestLocale(locale)`；
  - 上层数据函数和页面组件尽量使用**显式传入 `locale` 的 API**。

### 3. 暂未启用的特性及原因

- **Partial Prerendering（PPR）**：暂未启用
- **dynamicIO**：暂未启用

原因概述：

- next-intl 维护者当前仍在探索 **PPR + dynamicIO + i18n 路由** 的最佳实践；
- 官方 issue（`next-intl` #1493）中提到：
  - 需要新的顶层参数 API（如 `rootParams`）；
  - `setRequestLocale` 在 dynamicIO 模式下存在问题；
- 为保证 B2B 官网稳定性，目前只使用“已知稳定”的组合：
  - Cache Components + 显式 `locale` 参数；
  - 不叠加 PPR / dynamicIO。

---

## 二、升级入口点清单

> 这一节是“将来要升级 PPR / dynamicIO / i18n 路由时，需要重点检查和改动的代码位置”索引。

### A. i18n 配置与初始化

#### 1. `src/i18n/request.ts` 中的 `getRequestConfig`

- **文件路径**：`src/i18n/request.ts`
- **作用**：
  - 作为 next-intl 插件入口，利用 `requestLocale` 推断当前语言；
  - 从外部化 JSON 加载 critical messages，并写入配置。
- **关键代码示例（节选）**：

```ts
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = requestLocale ?? 'en';
  const messages = await loadCriticalMessages(locale);

  return {
    locale,
    messages,
  };
});
```

- **未来升级影响**：
  - 若 Next.js 提供 `rootParams` 或新的顶层 params API，用于在 PPR/dynamicIO 下安全读取 `[locale]`，此处可能需要：
    - 从 `requestLocale` 切换到新的 params 来源；
    - 或调整“locale 推断优先级”（URL vs cookies vs headers）。

#### 2. `src/app/[locale]/layout.tsx` 中的 `setRequestLocale`

- **文件路径**：`src/app/[locale]/layout.tsx`
- **作用**：
  - 验证 URL 中的 `locale` 是否在支持列表内；
  - 调用 `setRequestLocale(locale)`，为后续 `Link` / `useRouter` / `useTranslations` 等提供正确上下文。
- **关键代码示例（节选）**：

```tsx
export default function LocaleLayout({ params }: Props) {
  const locale = validateLocale(params.locale);

  setRequestLocale(locale);

  return (
    <Suspense>
      <AsyncLocaleLayoutContent locale={locale} />
    </Suspense>
  );
}
```

- **未来升级影响**：
  - 在 dynamicIO + i18n 路由场景下，next-intl 维护者已经指出：
    - `setRequestLocale` 目前不能在 dynamicIO 模式下正常工作；
    - 预计未来会通过 `rootParams` 等新 API 替代部分职责。
  - 因此，一旦准备开启 PPR / dynamicIO：
    - 这里是**必须重新审查和调整**的入口点之一；
    - 有可能迁移为“在新的顶层 params API 里设置 locale 决策”，再传入布局/数据层。

---

### B. `"use cache"` 相关的 i18n 函数

> 仅列出**同时满足**：
> - 使用了 `"use cache"`；
> - 与 i18n（locale / messages / translations）直接相关的函数。

#### 1. 首页 hero 文案：`getHomeHeroMessages`

- **文件路径**：`src/app/[locale]/page.tsx`
- **函数签名**：

```ts
async function getHomeHeroMessages(
  locale: 'en' | 'zh',
): Promise<TranslationMessages> {
  'use cache';
  cacheLife('days');
  const messages = await loadCriticalMessages(locale);
  // 提取 home.hero 命名空间内容
}
```

- **说明**：
  - 只依赖显式 `locale` 参数和外部 JSON 消息；
  - 不访问 `headers()` / `cookies()` / `getLocale()` / 无参 `getTranslations()`；
  - 在未来升级中，此类函数通常**无需大改**，只要上游 locale 来源保持一致即可。

#### 2. 联系页文案：`getContactCopy`

- **文件路径**：`src/lib/contact/getContactCopy.ts`
- **函数签名**：

```ts
export async function getContactCopy(locale: Locale): Promise<ContactCopyModel> {
  'use cache';
  cacheLife('days');

  const t = await getTranslationsCached({
    locale,
    namespace: 'underConstruction.pages.contact',
  });

  // 使用 t(...) 组装结构化文案模型
}
```

- **说明**：
  - 与首页 hero 一致，依赖显式 `locale` + 命名空间；
  - 使用的是 `getTranslationsCached({ locale, namespace })`，不会隐式读取 request；
  - 升级到 PPR/dynamicIO 时，这类数据函数通常只需保证：
    - `locale` 仍然是调用方显式传入；
    - 不注入新的 request-scoped 依赖，即可继续复用。

> 备注：项目内其他出现 `"use cache"` 字样的地方，多为文档或 TODO 描述，并非实际运行中的数据函数。

---

### C. 消息加载与缓存层

#### 1. `src/lib/load-messages.ts`：`loadCriticalMessages` / `loadDeferredMessages`

- **文件路径**：`src/lib/load-messages.ts`
- **作用**：
  - 从 `public/messages/[locale]/critical.json` / `deferred.json` 等外部 JSON 加载翻译；
  - 使用 `unstable_cache` 做基础缓存；
  - 被 `getRequestConfig`、`getHomeHeroMessages` 等上层函数调用。
- **未来升级影响**：
  - 若 Next.js 在 Cache Components / dynamicIO 下对 `unstable_cache` 或消息文件加载策略有调整，此处是核心落点之一；
  - 也可能在引入 `cacheTag` / `revalidateTag` 时复用或替换部分逻辑。

#### 2. `src/lib/i18n-performance.ts`：基于 React `cache()` 的缓存

- **文件路径**：`src/lib/i18n-performance.ts`
- **作用**：
  - 使用 React `cache()` 封装：
    - `getCachedMessages(locale)`
    - `getCachedTranslations(locale, namespace?)`
  - 为服务端渲染和预加载提供内存级缓存能力。
- **未来升级影响**：
  - 若引入 dynamicIO / PPR，需要确认这些 `cache()` 包装是否与新的渲染/缓存模型协同工作；
  - 可能需要根据官方推荐，调整缓存 key 设计或失效策略。

#### 3. `src/lib/i18n/server/getTranslationsCached.ts`

- **文件路径**：`src/lib/i18n/server/getTranslationsCached.ts`
- **作用**：
  - 将 `next-intl` 的 `getTranslations` 用 React `cache()` 包一层，提供带缓存的 `getTranslationsCached`：

```ts
export const getTranslationsCached = cache(getTranslations);
```

- **未来升级影响**：
  - 若 Next.js/next-intl 在 PPR/dynamicIO 场景下对 `getTranslations` 行为或缓存策略有更新，这里是一个需要同步调整的集中点；
  - 由于调用方（如 `getContactCopy`）已经使用显式 `locale` 参数，迁移成本相对可控。

---

## 三、待办事项（TODO）清单

### 1. 可选（中长期）：引入 `cacheTag` / `revalidateTag` 细粒度失效

- **必要性**：
  - 对当前 B2B 官网并非刚需；
  - 当内容更新频率提高、需要“后台改一条 → 前台只刷新对应内容”时，会变得有价值。
- **工作量**：
  - 取决于后续内容架构和 CMS/后台设计；
  - 需要为 blog/products 等内容设计合适的 tag 命名和失效策略。
- **建议**：
  - 目前以 `cacheLife('days')` 为主即可，满足大部分文案类场景；
  - 等引入更复杂的内容系统后，再在 blog/products 等 wrapper 层为数据函数添加 `cacheTag`，配合管理端使用 `revalidateTag` 精确失效。

### 3. 可选（团队协作）：编写 next-intl API 使用清单文档

- **必要性**：
  - 对单人维护不是刚需；
  - 对多人协作非常有帮助，可减少误用 request 依赖 API 的风险（例如误将无参 `getTranslations()` 写进 `"use cache"` 函数）。
- **工作量**：很小（主要是文档）。
- **建议**：
  - 若预期项目会有第二个长期维护者，建议补一份简短文档，说明：
    - 哪些 next-intl API 可以安全用于 `"use cache"` 段（显式 `locale` 参数）；
    - 哪些 API 只能用于普通 Server Component 或 layout；
  - 若短期仍以单人维护为主，可先记录在 backlog 中，待需要时补充。

---

## 四、参考资源

- **next-intl GitHub issue #1493：Support for `cacheComponents`**
  - 链接：https://github.com/amannn/next-intl/issues/1493
  - 讨论了 next-intl 与 Cache Components / PPR / dynamicIO 的适配现状和已知限制。
- **Next.js 官方文档**：
  - Cache Components / `"use cache"` / `cacheLife`：
    - https://nextjs.org/docs/app/building-your-application/caching
  - PPR（Partial Prerendering）：
    - https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering
  - dynamicIO 与异步请求 API：
    - https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change

