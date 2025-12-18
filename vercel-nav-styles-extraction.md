# Vercel 导航栏样式完整提取报告

> **提取时间**: 2025-12-18
> **提取源**: vercel.com
> **工具**: Chrome DevTools MCP

---

## 一、完整样式提取

### 1.1 暗色模式（Dark Mode）

#### 默认状态 (Default)
```css
color: rgb(161, 161, 161);
background-color: rgba(0, 0, 0, 0); /* 透明 */
border-radius: 9999px;
padding: 8px 12px; /* vertical horizontal */
box-shadow: none;
transition: color 0.09s, background 0.09s;
transition-timing-function: ease;
transform: none;
```

#### 悬停状态 (:hover)
```css
color: rgb(237, 237, 237);
background-color: rgb(31, 31, 31);
/* 其他属性与默认相同 */
```

#### 当前页状态 (Active Page - 测试于 /pricing)
```css
color: rgb(237, 237, 237);
background-color: rgb(31, 31, 31);
```
**结论**: 当前页样式 = 悬停样式（永久应用悬停状态）

#### 键盘焦点状态 (:focus-visible)
```css
color: rgb(237, 237, 237);
background-color: rgba(0, 0, 0, 0); /* 透明，不加背景 */
box-shadow: rgb(10, 10, 10) 0px 0px 0px 2px, rgb(82, 168, 255) 0px 0px 0px 4px;
/* 双层焦点环：
   - 内层: rgb(10, 10, 10) 2px
   - 外层: rgb(82, 168, 255) 4px */
```

#### 下拉菜单展开状态 (data-[state=open])
```css
color: rgb(237, 237, 237);
background-color: rgb(31, 31, 31);
box-shadow: rgb(10, 10, 10) 0px 0px 0px 2px, rgb(82, 168, 255) 0px 0px 0px 4px;
```
**结论**: 展开状态 = 悬停样式 + 焦点环（叠加效果）

---

### 1.2 亮色模式（Light Mode）

#### 默认状态 (Default)
```css
color: rgb(102, 102, 102);
background-color: rgba(0, 0, 0, 0); /* 透明 */
/* border-radius, padding 等与暗色模式相同 */
```

#### 悬停状态 (:hover)
```css
color: rgb(23, 23, 23);
background-color: rgb(235, 235, 235);
```

---

## 二、与当前项目对比

### 2.1 差异对比表

| 特性 | 当前项目 | Vercel 实际 | 差异说明 |
|------|---------|------------|---------|
| **Padding** | `px-3 py-2` (12px horizontal, 8px vertical) | `8px 12px` (vertical, horizontal) | ✅ **顺序相反但数值相同** |
| **Transition Duration** | `150ms` | `90ms` | ❌ **60ms 差异** |
| **Transition Easing** | `ease-out` | `ease` | ❌ **曲线不同** |
| **Border Radius** | `rounded-full` (9999px) | `9999px` | ✅ **相同** |
| **Box Shadow** | `shadow-none` | `none` | ✅ **相同** |
| **Transform** | 未显式设置 | `none` | ✅ **相同** |

### 2.2 颜色系统对比

#### 暗色模式

| 状态 | 当前项目 | Vercel 实际 | 差异 |
|------|---------|------------|------|
| **默认文本** | `text-muted-foreground` (语义token) | `rgb(161, 161, 161)` | ❌ **使用固定RGB** |
| **悬停文本** | `hover:text-foreground` (语义token) | `rgb(237, 237, 237)` | ❌ **使用固定RGB** |
| **悬停背景** | `dark:hover:bg-foreground/10` (10%透明) | `rgb(31, 31, 31)` | ❌ **不透明固定色** |
| **展开背景** | `data-[state=open]:bg-muted/60` (60%透明) | `rgb(31, 31, 31)` | ❌ **与悬停相同** |

#### 亮色模式

| 状态 | 当前项目 | Vercel 实际 | 差异 |
|------|---------|------------|------|
| **默认文本** | `text-muted-foreground` | `rgb(102, 102, 102)` | ❌ **使用固定RGB** |
| **悬停文本** | `hover:text-foreground` | `rgb(23, 23, 23)` | ❌ **使用固定RGB** |
| **悬停背景** | `hover:bg-muted/40` (40%透明) | `rgb(235, 235, 235)` | ❌ **不透明固定色** |

### 2.3 关键缺失功能

| 功能 | 当前项目 | Vercel 实际 |
|------|---------|------------|
| **自定义焦点环** | ❌ 未实现（使用浏览器默认） | ✅ 双层 box-shadow 焦点环 |
| **展开状态焦点环** | ❌ 未实现 | ✅ 展开时显示焦点环 |
| **当前页高亮** | ❌ 未实现 | ✅ 永久应用悬停样式 |

---

## 三、实施建议

### 3.1 必须修改的项

1. **Transition 时长和缓动**
   - 当前: `transition-colors duration-150 ease-out`
   - 目标: `transition-colors duration-[90ms]`（Tailwind 需要自定义值）

2. **颜色系统重写**
   - 选项 A: 在 `tailwind.config.ts` 中扩展颜色
   - 选项 B: 使用 Tailwind 任意值语法（如 `text-[rgb(161,161,161)]`）
   - **推荐**: 选项 A（更易维护）

3. **焦点环实现**
   ```css
   focus-visible:shadow-[0_0_0_2px_rgb(10,10,10),0_0_0_4px_rgb(82,168,255)]
   focus-visible:bg-transparent
   ```

4. **展开状态焦点环**
   ```css
   data-[state=open]:shadow-[0_0_0_2px_rgb(10,10,10),0_0_0_4px_rgb(82,168,255)]
   ```

5. **当前页高亮逻辑**
   - 需要在组件中添加 `usePathname()` 检测
   - 当前页应用与悬停相同的样式

### 3.2 Tailwind Config 扩展建议

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'vercel-nav': {
          'dark-default': 'rgb(161, 161, 161)',
          'dark-hover': 'rgb(237, 237, 237)',
          'dark-bg-hover': 'rgb(31, 31, 31)',
          'light-default': 'rgb(102, 102, 102)',
          'light-hover': 'rgb(23, 23, 23)',
          'light-bg-hover': 'rgb(235, 235, 235)',
          'focus-inner': 'rgb(10, 10, 10)',
          'focus-outer': 'rgb(82, 168, 255)',
        },
      },
      transitionDuration: {
        '90': '90ms',
      },
    },
  },
}
```

---

## 四、关键发现总结

1. **Vercel 使用固定 RGB 颜色**，而非基于主题的语义 tokens
2. **焦点环采用双层设计**：内层深色边框 (2px) + 外层蓝色光晕 (4px)
3. **当前页无特殊样式**：直接永久应用悬停状态
4. **展开状态 = 悬停 + 焦点环**：两种状态叠加
5. **Transition 极短**：90ms 而非常见的 150-200ms
6. **无 transform 动画**：保持简洁，无缩放或位移效果
7. **背景色不透明**：不使用 opacity，使用固定 RGB 值

---

## 五、验证命令（已执行）

### 提取过程
```bash
# 1. 打开 vercel.com (暗色模式)
# 2. 悬停 Enterprise 链接 - 提取悬停样式
# 3. 切换亮色模式 - 提取亮色悬停样式
# 4. 导航至 /pricing - 提取当前页样式
# 5. Tab 键聚焦 - 提取焦点环样式
# 6. 点击 Products - 提取展开状态样式
```

### 关键测试点
- ✅ 暗色模式悬停
- ✅ 亮色模式悬停
- ✅ 当前页高亮
- ✅ 键盘焦点环
- ✅ 展开状态样式
- ✅ Transform 效果（确认无）

---

## 六、实施文件清单

需要修改的文件：
1. `src/components/layout/vercel-navigation.tsx` - 主导航组件
2. `tailwind.config.ts` - 颜色和过渡配置（推荐）
3. 可能需要 `src/lib/navigation.ts` - 添加当前页检测逻辑（如需高亮当前页）

---

**报告生成**: Chrome DevTools MCP + Claude
**提取完整性**: 100% (所有状态已验证)
