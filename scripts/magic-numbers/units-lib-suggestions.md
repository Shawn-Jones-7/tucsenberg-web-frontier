# 单位工具库使用建议

## 使用说明
使用 src/lib/units.ts 中的单位转换函数替代以下魔法数字：


### 82 → percent(82)
- **文件**: src/lib/translation-benchmarks.ts
- **原因**: 百分比，使用单位工具库
- **替换**: `percent(82)`

### 83 → percent(83)
- **文件**: src/lib/translation-benchmarks.ts
- **原因**: 百分比，使用单位工具库
- **替换**: `percent(83)`

### 84 → percent(84)
- **文件**: src/lib/translation-benchmarks.ts
- **原因**: 百分比，使用单位工具库
- **替换**: `percent(84)`

### 87 → percent(87)
- **文件**: src/lib/translation-benchmarks.ts
- **原因**: 百分比，使用单位工具库
- **替换**: `percent(87)`

### 88 → percent(88)
- **文件**: src/lib/translation-benchmarks.ts
- **原因**: 百分比，使用单位工具库
- **替换**: `percent(88)`

### 600 → seconds(0.6)
- **文件**: src/lib/i18n-preloader-strategies/configs.ts
- **原因**: 时间相关，使用单位工具库
- **替换**: `seconds(0.6)`


## 应用方式
1. 导入单位工具库: `import { percent, seconds } from '@/lib/units';`
2. 替换魔法数字为单位函数调用
3. 确保语义清晰和类型安全
