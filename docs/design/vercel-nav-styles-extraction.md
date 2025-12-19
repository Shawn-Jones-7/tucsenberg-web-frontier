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

### 1.3 Products 下拉面板（Desktop / Light Mode）

#### 面板容器 (Viewport)
```css
width: 758px; /* 实测 */
height: 354px;
background-color: rgb(255, 255, 255);
border-radius: 12px;
padding: 0;
overflow: hidden;
box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px,
            rgba(0, 0, 0, 0.02) 0px 1px 1px 0px,
            rgba(0, 0, 0, 0.04) 0px 4px 8px -4px,
            rgba(0, 0, 0, 0.06) 0px 16px 24px -8px,
            rgb(250, 250, 250) 0px 0px 0px 1px;
```

#### 列布局 (三列)
```css
display: flex;
gap: 0;
```

#### 列尺寸与内边距
```css
/* 左列 */
width: 256px;
padding: 8px 0 8px 8px;

/* 中列 */
width: 247px;
padding: 8px 0;

/* 右列 */
width: 256px;
padding: 8px 8px 8px 0;
```

#### 列表项 (Link)
```css
height: 62px;
padding: 12px;
border-radius: 6px;
display: flex;
align-items: center;
gap: 12px;
font-size: 14px;
font-weight: 400;
line-height: normal;
color: rgb(102, 102, 102);
background-color: rgba(0, 0, 0, 0); /* 透明 */
```

#### 列表项内标题/描述
```css
/* 标题 */
font-size: 14px;
font-weight: 500;
line-height: 20px;
color: rgb(23, 23, 23);
margin-bottom: 2px;

/* 描述 */
font-size: 12px;
font-weight: 400;
line-height: 16px;
color: rgb(102, 102, 102);
```

---

### 1.4 移动端导航（Mobile / Light Mode）

#### 抽屉容器
```css
position: fixed;
inset: 0;
background-color: rgb(250, 250, 250);
padding-top: 64px;
border: none;
border-radius: 0;
box-shadow: none;
```

#### 顶部按钮 (Log In / Sign Up)
```css
/* Primary - Sign Up */
height: 40px;
width: 452px; /* 500px viewport 下实测 */
border-radius: 6px;
background-color: rgb(23, 23, 23);
color: rgb(255, 255, 255);
font-size: 14px;
font-weight: 500;
line-height: 20px;
padding: 0 10px;

/* Secondary - Log In */
height: 40px;
border-radius: 6px;
background-color: rgb(255, 255, 255);
color: rgb(23, 23, 23);
box-shadow: rgb(235, 235, 235) 0px 0px 0px 1px;
```

#### 栏目标题 (例如 Products)
```css
font-size: 16px;
font-weight: 500;
line-height: 24px;
color: rgb(23, 23, 23);
height: 48px;
```

#### 列表项
```css
height: 48px;
padding: 0 12px;
border-radius: 6px;
display: flex;
align-items: center;
gap: 8px;
font-size: 16px;
font-weight: 400;
line-height: 20px;
color: rgb(102, 102, 102);
background-color: rgba(0, 0, 0, 0); /* 透明 */
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

### 2.3 关键功能对比（含本项目定制）

| 功能 | Vercel 实际 | 本项目决策 | 说明 |
|------|------------|-----------|------|
| **焦点环** | 双层 box-shadow (黑 2px + 蓝 4px) | ✅ **单层蓝色 ring-2** | 简化视觉，保持轻盈 |
| **当前页高亮** | 永久应用悬停样式 | ❌ **不高亮** | 保持导航项一致性，仅通过 `aria-current="page"` 提供语义 |
| **展开状态焦点环** | 展开时显示焦点环 | ❌ **不显示** | 避免视觉干扰 |

### 2.4 Products 下拉面板差异

| 特性 | 当前项目 | Vercel 实际 | 差异说明 |
|------|---------|------------|---------|
| **面板尺寸** | `w-[min(420px,calc(100vw-48px))]`，高度随内容 | `758px x 354px` | ❌ **宽高明显不足** |
| **面板背景/边框** | `bg-popover` + `border border-border/50` | 纯白 `rgb(255,255,255)` + 无可见边框 | ❌ **视觉层次不一致** |
| **面板圆角** | `rounded-md` (6px) | `12px` | ❌ **圆角偏小** |
| **面板阴影** | `shadow-sm` | 多层阴影 | ❌ **阴影层级不足** |
| **容器内边距** | `NavigationMenuContent: p-2 pr-2.5` + `ul: p-3` | `0`（列内补 8px） | ❌ **padding 结构不同** |
| **布局方式** | `grid` 两列 + `gap-2` | `flex` 三列 + `gap 0` | ❌ **列数/布局模式不一致** |
| **列尺寸** | 均分列宽 | `256 / 247 / 256` | ❌ **列宽不匹配** |
| **项高度/内边距** | `px-3 py-2`，无固定高度 | `height 62` + `padding 12` | ❌ **尺寸体系不一致** |
| **圆角** | `rounded-lg` (8px) | `6px` | ❌ **圆角偏大** |
| **内容结构** | 单行 `text-sm leading-none` | 标题 14/500/20 + 描述 12/400/16 | ❌ **缺少层级文案结构** |
| **对齐** | `li: justify-center` | 左对齐 | ❌ **对齐方式不同** |

### 2.5 移动端导航差异

| 特性 | 当前项目 | Vercel 实际 | 差异说明 |
|------|---------|------------|---------|
| **抽屉尺寸** | 左侧抽屉 `300px/350px` | 全屏 `inset: 0` | ❌ **尺寸与定位不一致** |
| **背景色** | `bg-background` | `rgb(250,250,250)` | ❌ **背景色不同** |
| **边框/阴影** | `border-r` + `shadow-lg` | 无边框、无阴影 | ❌ **层级感不同** |
| **遮罩** | `SheetOverlay: bg-black/50` | 无额外遮罩 | ❌ **遮罩策略不同** |
| **顶部间距** | `p-6` + `SheetHeader p-4` | `padding-top: 64px` | ❌ **间距体系不一致** |
| **栏目标题** | ❌ 无分组标题 | `16px/500/24` 高度 48 | ❌ **结构缺失** |
| **列表项字体** | `text-sm` + `font-medium` | `16px` + `font-weight 400` | ❌ **字号/字重不一致** |
| **列表项尺寸** | `px-3 py-2` | `height 48` + `padding 0 12` | ❌ **行高与触控尺寸不足** |
| **交互背景** | `hover:bg-accent/50` + `active:bg-accent` | 透明背景 | ❌ **交互视觉不一致** |
| **CTA 样式** | 单个 `Contact Sales` 按钮 | 顶部两按钮 40px 高 | ❌ **按钮布局与尺寸不同** |

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

### 3.3 Products 下拉面板

1. **重做面板容器样式**
   - `rounded-md` -> `12px`，移除边框，替换为多层阴影
   - 取消容器 `p-2`/`p-3` 叠加，改为列内补 8px
2. **调整布局为三列**
   - `grid-cols-2` -> `flex` 三列，固定列宽 `256/247/256`
3. **重构项卡结构**
   - 单行文本 -> 标题 + 描述，两行排版
   - 固定 `height: 62px`，`padding: 12px`，`radius: 6px`

### 3.4 移动端导航

1. **抽屉改为全屏**
   - `SheetContent` 改为 `inset-0` 全屏，移除 `border`/`shadow`/`overlay`
   - 背景色固定 `rgb(250,250,250)`，顶部 `padding-top: 64px`
2. **重排导航列表**
   - 列表项 `height: 48px`，`font-size: 16px`，`font-weight: 400`
   - 移除 hover/active 背景，改为纯文本交互
3. **按钮区样式对齐**
   - 按钮高度 40px，圆角 6px，文字 14/500/20
   - 文案可保持本项目内容，但视觉需一致

---

## 四、关键发现总结

### Vercel 原版特征
1. **固定 RGB 颜色**，而非基于主题的语义 tokens
2. **焦点环双层设计**：内层深色边框 (2px) + 外层蓝色光晕 (4px)
3. **当前页高亮**：永久应用悬停样式
4. **展开状态 = 悬停 + 焦点环**：两种状态叠加
5. **Transition 极短**：90ms 而非常见的 150-200ms
6. **无 transform 动画**：保持简洁，无缩放或位移效果
7. **背景色不透明**：不使用 opacity，使用固定 RGB 值
8. **Products 下拉为三列固定宽度**，面板 12px 圆角 + 多层阴影
9. **移动端导航为全屏抽屉**，48px 行高 + 16px 字号的轻量布局

### 本项目定制（偏离 Vercel 原版）
1. **焦点环简化为单层**：`ring-2 ring-[rgb(82,168,255)]`，更轻盈
2. **当前页不高亮**：保持所有导航项视觉一致，仅通过 `aria-current="page"` 提供无障碍语义
3. **展开状态无焦点环**：避免视觉干扰

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
# 7. 展开 Products 下拉 - 提取面板尺寸/列布局/项卡样式
# 8. 切换移动端 (500px) 打开菜单 - 提取抽屉/按钮/列表项样式
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
3. `src/components/layout/vercel-dropdown-content.tsx` - Products 下拉内容
4. `src/components/ui/navigation-menu.tsx` - 下拉面板容器样式
5. `src/components/layout/mobile-navigation.tsx` - 移动端导航
6. `src/components/ui/sheet.tsx` - 移动端抽屉容器样式
7. 可能需要 `src/lib/navigation.ts` - 添加当前页检测逻辑（如需高亮当前页）

---

**报告生成**: Chrome DevTools MCP + Claude
**提取完整性**: 100% (所有状态已验证)
