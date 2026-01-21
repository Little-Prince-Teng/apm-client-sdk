# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

**请始终使用简体中文回复。**

## 项目概述

**@power/apm-client-js** 是一个基于 TypeScript 的 APM（应用性能监控）客户端 SDK，用于前端应用程序。它提供错误监控、性能追踪和请求追踪功能，支持 Vue2/Vue3 框架。

## 常用命令

### 构建和开发
```bash
npm run build          # 构建库（build:lib + build:types）
npm run build:lib      # 构建 JavaScript 模块
npm run build:types    # 生成 TypeScript 类型声明
npm run dev            # 启动开发服务器
```

### 类型检查
```bash
npm run type-check     # TypeScript 类型检查 (vue-tsc --noEmit)
```

### 代码质量
```bash
npm run lint           # ESLint 检查
npm run lint:fix       # ESLint 自动修复
npm run format         # Prettier 格式化
```

### 测试
```bash
npm test               # 运行测试 (Vitest)
npm run test:ui        # 运行测试（带 UI 界面）
npm run test:coverage  # 运行测试并生成覆盖率报告
```

### 发布
```bash
npm run release        # 标准版本升级
```

## 高层架构

### 双层 API 系统

SDK 为向后兼容维护了两层 API：

1. **新 API（基于类）**：`src/core/monitor.ts` 中的 `APMClient`
   - 未来主要实现
   - 基于实例，更现代化的架构

2. **旧 API（函数式）**：`src/core/legacy.ts` 中的 `ClientMonitor`
   - APMClient 的包装器
   - 保持与现有集成的向后兼容性
   - 同时挂载到全局 `window.ClientMonitor`

### 模块化追踪器架构

SDK 使用模块化追踪器系统，每个监控关注点相互独立：

- **错误追踪**（`src/core/errors/`）：JS 错误、Promise 拒绝、AJAX 错误、资源错误和 Vue 错误的独立模块
- **性能追踪**（`src/core/performance/`）：页面加载指标、FMP（首次有效绘制）、SPA 导航追踪
- **请求追踪**（`src/core/trace/`）：用于请求链追踪的 XHR 和 Fetch API 拦截器

### 数据流

1. 配置从 `APMClient` 流向各个追踪器
2. 追踪器从各种源收集数据（window 事件、API 拦截器等）
3. 数据被处理和丰富
4. `ReportService`（`src/core/services/report.ts`）通过 Fetch/Beacon API 将数据发送到收集器

## 核心模块组织

```
src/
├── core/
│   ├── monitor.ts          # APMClient 类（新 API）
│   ├── legacy.ts           # 旧 API 包装器 (ClientMonitor)
│   ├── errors/             # 错误追踪模块
│   ├── performance/         # 性能追踪
│   ├── trace/              # 请求追踪（XHR/Fetch 拦截器）
│   ├── services/
│   │   └── report.ts       # 数据上报后端
│   └── types/              # TypeScript 类型定义
├── plugins/
│   └── vue3.ts             # Vue3 插件，使用 provide/inject
├── composables/
│   └── useAPM.ts           # Vue 组合式函数 (useAPM, useErrorTracking, usePerformanceTracking)
└── utils/
    └── uuid.ts             # UUID 生成
```

### 重要模块

| 模块 | 文件 | 用途 |
|--------|------|---------|
| APMClient | `src/core/monitor.ts` | 主要协调类（新 API） |
| ClientMonitor | `src/core/legacy.ts` | 旧 API 包装器，保持向后兼容 |
| ErrorTracker | `src/core/errors/index.ts` | 协调所有错误追踪模块 |
| PerformanceTracker | `src/core/performance/index.ts` | 性能指标收集 |
| TraceTracker | `src/core/trace/index.ts` | 请求追踪协调器 |
| ReportService | `src/core/services/report.ts` | 发送数据到收集器端点 |
| Vue3 Plugin | `src/plugins/vue3.ts` | 使用 app.use() 模式的 Vue 集成 |

## 重要模式

### 配置模型
- 基础选项包括：`collector`、`service`、`serviceVersion`、`pagePath`、`loginUser`、`customFetch`
- 功能特定标志启用/禁用单个追踪器（例如 `jsErrors`、`apiErrors`、`autoTracePerf`）
- 某些方法改变全局配置（`setPerformance`），其他方法仅影响特定模块（`catchErrors`、`performance`）

### 错误处理
- 优雅降级：如果一个追踪器失败，其他追踪器继续工作
- 生产环境只显示 console 警告（不显示错误）
- Vue 插件使用全局 `app.config.errorHandler` 进行错误捕获

### Vue 集成
- 使用 `app.use(createAPMPlugin(options))` 的插件模式
- 在 Vue 3 中使用 provide/inject 进行依赖注入
- 可用的组合式函数：`useAPM()`、`useErrorTracking()`、`usePerformanceTracking()`

### 测试
- 使用 jsdom 环境的 Vitest
- 核心模块的单元测试
- Vue 插件功能的集成测试

## 构建系统

- **构建工具**：Vite（打包为 ES 模块、CommonJS 和 UMD 格式）
- **TypeScript**：启用严格模式，使用 `vue-tsc` 生成类型定义
- **测试**：使用 V8 覆盖率提供器的 Vitest
- **代码质量**：ESLint + Prettier，配备 Husky pre-commit hooks (lint-staged)
- **包管理器**：npm

## 特殊说明

- **代码风格**：禁用分号（ESLint 配置），使用单引号
- **文档**：带有中文描述的详细 JSDoc 注释
- **浏览器支持**：支持 ES2020 特性的现代浏览器
- **性能**：追踪器的延迟初始化、页面卸载报告使用 Beacon API、追踪数据的采样
