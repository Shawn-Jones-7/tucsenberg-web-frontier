# 配置迁移建议

## 使用说明
将以下数字迁移到 src/config/app.ts 的相应配置中：


### 8888 → DEV_SERVER_CONFIG.MONITORING_PORT
- **文件**: src/lib/performance-monitoring-types.ts
- **原因**: 监控端口，迁移到配置
- **替换**: 使用 `DEV_SERVER_CONFIG.MONITORING_PORT`

### 8900 → DEV_SERVER_CONFIG.API_MONITORING_PORT
- **文件**: src/app/api/monitoring/dashboard/handlers/get-handler.ts
- **原因**: API监控端口，迁移到配置
- **替换**: 使用 `DEV_SERVER_CONFIG.API_MONITORING_PORT`


## 应用方式
1. 确认 src/config/app.ts 中已定义相应配置
2. 在使用文件中导入配置
3. 替换魔法数字为配置引用
