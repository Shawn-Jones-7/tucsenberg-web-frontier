# 局部常量定义建议

## 使用说明
在相应文件中定义以下局部常量，替代魔法数字：


### src/lib/colors/dark-theme.ts
```typescript
// 颜色计算因子，定义局部常量
const COLOR_LIGHTNESS_FACTOR = 184.704;
```

### src/constants/security-constants.ts
```typescript
// RGB最大值，定义局部常量
const MAX_RGB_VALUE = 255;
```

### src/constants/security-constants.ts
```typescript
// 安全RGB值，定义局部常量
const MAX_SAFE_RGB = 254;
```

### src/constants/i18n-constants.ts
```typescript
// 年天数，定义局部常量
const DAYS_PER_YEAR = 365;
```

### src/app/api/whatsapp/webhook/route.ts
```typescript
// HTTP状态码，定义局部常量
const HTTP_FORBIDDEN = 403;
```

### src/app/api/contact/route.ts
```typescript
// HTTP状态码，定义局部常量
const HTTP_TOO_MANY_REQUESTS = 429;
```

### src/app/api/whatsapp/send/route.ts
```typescript
// HTTP状态码，定义局部常量
const HTTP_SERVICE_UNAVAILABLE = 503;
```

### src/constants/performance.ts
```typescript
// 性能阈值，定义局部常量
const PERFORMANCE_THRESHOLD = 130;
```

### src/types/whatsapp-api-config/errors.ts
```typescript
// WhatsApp错误码基数，定义局部常量
const WHATSAPP_ERROR_BASE = 131;
```

### src/types/whatsapp-api-config/errors.ts
```typescript
// WhatsApp参数错误，定义局部常量
const WHATSAPP_ERROR_PARAM = 132;
```

### src/types/whatsapp-api-config/errors.ts
```typescript
// WhatsApp格式错误，定义局部常量
const WHATSAPP_ERROR_FORMAT = 133;
```

### src/types/whatsapp-api-config/errors.ts
```typescript
// WhatsApp限制错误，定义局部常量
const WHATSAPP_ERROR_LIMIT = 136;
```

### src/types/whatsapp-api-config/errors.ts
```typescript
// WhatsApp媒体错误，定义局部常量
const WHATSAPP_ERROR_MEDIA = 368;
```

### src/app/api/analytics/web-vitals/route.ts
```typescript
// 分析阈值，定义局部常量
const ANALYTICS_THRESHOLD = 450;
```

### src/app/api/analytics/i18n/route.ts
```typescript
// i18n分析限制，定义局部常量
const I18N_ANALYTICS_LIMIT = 890;
```

### src/constants/app-constants.ts
```typescript
// 应用版本码，定义局部常量
const APP_VERSION_CODE = 1005;
```

### src/constants/app-constants.ts
```typescript
// 应用构建号，定义局部常量
const APP_BUILD_NUMBER = 1010;
```

### src/constants/app-constants.ts
```typescript
// 应用发布码，定义局部常量
const APP_RELEASE_CODE = 1020;
```

### src/lib/web-vitals/constants.ts
```typescript
// HD高度，定义局部常量
const HD_HEIGHT = 1080;
```

### src/app/api/analytics/web-vitals/route.ts
```typescript
// Web Vitals阈值，定义局部常量
const WEB_VITALS_THRESHOLD = 1180;
```

### src/app/api/analytics/i18n/route.ts
```typescript
// 分析批次大小，定义局部常量
const ANALYTICS_BATCH_SIZE = 1250;
```

### src/constants/app-constants.ts
```typescript
// 扩展超时，定义局部常量
const EXTENDED_TIMEOUT = 1300;
```

### src/constants/app-constants.ts
```typescript
// 最大内容长度，定义局部常量
const MAX_CONTENT_LENGTH = 1400;
```

### src/app/api/analytics/i18n/route.ts
```typescript
// i18n缓存大小，定义局部常量
const I18N_CACHE_SIZE = 1412;
```

### src/constants/app-constants.ts
```typescript
// 缓冲区大小，定义局部常量
const BUFFER_SIZE = 1450;
```

### src/app/api/analytics/web-vitals/route.ts
```typescript
// Vitals最大阈值，定义局部常量
const VITALS_MAX_THRESHOLD = 1900;
```

### src/app/api/analytics/web-vitals/route.ts
```typescript
// 性能上限，定义局部常量
const PERFORMANCE_CEILING = 2200;
```

### src/app/api/analytics/web-vitals/route.ts
```typescript
// 关键阈值，定义局部常量
const CRITICAL_THRESHOLD = 2800;
```

### src/constants/app-constants.ts
```typescript
// 扩展成功码，定义局部常量
const EXTENDED_SUCCESS_CODE = 200100;
```


## 应用方式
1. 在文件顶部定义常量
2. 替换文件中的魔法数字
3. 添加适当的注释说明
