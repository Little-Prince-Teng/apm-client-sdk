# @power/apm-client-js

APM Client SDK - 前端应用性能监控SDK，支持Vue2/Vue3，提供错误监控、性能追踪、链路追踪等功能

## 📊 技术框架

### 当前技术栈
- **语言**: TypeScript 4.9.5
- **构建工具**: Webpack 5.75.0
- **代码规范**: TSLint 5.20.1 + Prettier 2.1.1
- **Git钩子**: Husky 8.0.3 + lint-staged 13.2.1
- **核心依赖**: js-base64 3.6.0

### 重构后技术栈（推荐）
- **语言**: TypeScript 5.3.0
- **构建工具**: Vite 5.0.0 + tsup 8.0.0
- **代码规范**: ESLint 8.54.0 + Prettier 3.1.0
- **测试框架**: Vitest 1.0.0 + @vitest/ui 1.0.0
- **Git钩子**: Husky 8.0.3 + lint-staged 15.1.0
- **核心依赖**: js-base64 3.7.0
- **Vue支持**: Vue 3.3.0 + @vue/test-utils 2.4.0

### 核心特性
- ✅ 错误监控（JS、Promise、Vue、Ajax、资源）
- ✅ 性能监控（Performance API、FMP）
- ✅ 链路追踪（XHR、Fetch拦截）
- ✅ Vue2/Vue3支持
- ✅ Composition API
- ✅ TypeScript支持
- ✅ 完全向后兼容

---

## 🚀 重构兼容方案实施链路

### 整体流程概览

```
阶段一：环境准备与基础设施升级 (Week 1)
  ↓
阶段二：核心功能重构 (Week 2-3)
  ↓
阶段三：兼容层实现 (Week 3-4)
  ↓
阶段四：Vue3插件开发 (Week 4-5)
  ↓
阶段五：测试与验证 (Week 5-6)
  ↓
阶段六：文档与发布 (Week 6-7)
```

---

## 📦 阶段一：环境准备与基础设施升级

### 步骤1.1：备份当前代码

```bash
# 创建备份分支
git checkout -b backup/before-refactor
git push origin backup/before-refactor

# 创建开发分支
git checkout -b feature/refactor-vue3
```

### 步骤1.2：更新package.json依赖

更新后的核心依赖配置：

```json
{
  "name": "@power/apm-client-js",
  "version": "0.12.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./vue3": {
      "import": "./dist/vue3.mjs",
      "require": "./dist/vue3.js",
      "types": "./dist/vue3.d.ts"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "npm run build:lib && npm run build:types",
    "build:lib": "vite build",
    "build:types": "vue-tsc --declaration --emitDeclarationOnly",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "type-check": "vue-tsc --noEmit",
    "prepare": "husky install",
    "release": "standard-version",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "vue": "^2.6.0 || ^3.0.0"
  }
}
```

### 步骤1.3：创建新的配置文件

**vite.config.ts** - Vite构建配置
**tsconfig.json** - TypeScript严格模式配置
**.eslintrc.js** - ESLint配置
**.prettierrc** - Prettier配置
**vitest.config.ts** - 测试配置

### 步骤1.4：安装依赖

```bash
# 清理旧依赖
rm -rf node_modules package-lock.json

# 安装新依赖
npm install

# 验证安装
npm run type-check
```

---

## 🏗️ 阶段二：核心功能重构

### 步骤2.1：重构目录结构

```
src/
├── core/              # 核心功能（不依赖框架）
│   ├── monitor.ts     # 主监控类
│   ├── errors/        # 错误处理
│   ├── performance/   # 性能监控
│   ├── trace/         # 链路追踪
│   ├── services/      # 基础服务
│   └── types/         # 类型定义
├── plugins/           # 框架插件
│   ├── vue2.ts        # Vue2支持（向后兼容）
│   └── vue3.ts        # Vue3支持
├── composables/       # Vue3 Composables
└── utils/             # 工具函数
```

### 步骤2.2：定义核心类型

创建 `src/core/types/index.ts`，定义完整的类型接口：
- `APMOptions` - 基础配置选项
- `ErrorTrackingOptions` - 错误追踪选项
- `PerformanceTrackingOptions` - 性能追踪选项
- `TraceTrackingOptions` - 链路追踪选项
- `ErrorInfo` - 错误信息
- `PerformanceData` - 性能数据
- `SpanFields` - 链路追踪Span
- `SegmentFields` - 链路追踪Segment

### 步骤2.3：重构核心监控类

创建 `src/core/monitor.ts`，实现 `APMClient` 类：
- `init()` - 初始化监控
- `updateConfig()` - 更新配置
- `captureError()` - 捕获错误
- `trackPerformance()` - 追踪性能
- `setCustomTags()` - 设置自定义标签

### 步骤2.4：重构错误追踪模块

创建 `src/core/errors/index.ts`，实现 `ErrorTracker` 类：
- `JSErrors` - JS执行错误
- `PromiseErrors` - Promise错误
- `AjaxErrors` - Ajax请求错误
- `ResourceErrors` - 资源加载错误
- `VueErrors` - Vue错误

### 步骤2.5：重构性能追踪模块

创建 `src/core/performance/index.ts`，实现 `PerformanceTracker` 类：
- `track()` - 追踪性能
- `calculateFMP()` - 计算首次有效绘制

### 步骤2.6：重构链路追踪模块

创建 `src/core/trace/index.ts`，实现 `TraceTracker` 类：
- `XHRInterceptor` - XHR请求拦截
- `FetchInterceptor` - Fetch请求拦截
- `setupReportTimer()` - 设置上报定时器
- `setupUnloadHandler()` - 设置页面卸载处理

### 步骤2.7：重构服务层

创建 `src/core/services/report.ts`，实现 `ReportService` 类：
- `sendError()` - 发送错误数据
- `sendPerformance()` - 发送性能数据
- `sendSegments()` - 发送链路数据
- `sendSegmentsByBeacon()` - 使用Beacon发送

---

## 🔗 阶段三：兼容层实现

### 步骤3.1：创建兼容层

创建 `src/core/legacy.ts`，实现 `createLegacyClient()` 函数：
- 保持所有旧API方法签名
- 将旧API调用映射到新的APMClient实例
- 保持 `customOptions` 对象
- 保持所有验证逻辑

### 步骤3.2：创建主入口文件

创建 `src/index.ts`，导出兼容层和新的API：
- 默认导出 `ClientMonitor`（兼容层）
- 导出 `APMClient` 类（新API）
- 导出所有类型定义

---

## 🎨 阶段四：Vue3插件开发

### 步骤4.1：创建Vue3插件

创建 `src/plugins/vue3.ts`，实现：
- `createAPMPlugin()` - Vue3插件函数
- `useAPM()` - Composition API Hook
- 自动错误处理集成
- 依赖注入支持

### 步骤4.2：创建Vue3 Composables

创建 `src/composables/useAPM.ts`，实现：
- `useAPM()` - 基础Hook
- `useErrorTracking()` - 错误追踪Hook
- `usePerformanceTracking()` - 性能追踪Hook
- `usePageTracking()` - 页面追踪Hook

---

## 🧪 阶段五：测试与验证

### 步骤5.1：创建测试配置

创建 `tests/setup.ts`，配置测试环境：
- Mock `fetch` API
- 清理Mock

### 步骤5.2：创建兼容性测试

创建 `tests/compatibility/legacy-api.test.ts`，测试：
- 所有旧API方法导出
- `register()` 方法
- `setPerformance()` 方法
- `setCustomTags()` 方法
- `validateTags()` 方法
- `validateOptions()` 方法
- `window.ClientMonitor` 挂载

### 步骤5.3：创建核心功能测试

创建 `tests/unit/monitor.test.ts`，测试：
- `APMClient` 实例创建
- 配置更新
- 错误捕获
- 自定义标签设置

### 步骤5.4：创建Vue3插件测试

创建 `tests/integration/vue3-plugin.test.ts`，测试：
- 插件安装
- 依赖注入
- `useAPM` Composable

### 步骤5.5：运行测试

```bash
# 运行所有测试
npm test

# 运行测试并查看UI
npm run test:ui

# 运行测试并生成覆盖率报告
npm run test:coverage
```

---

## 📚 阶段六：文档与发布

### 步骤6.1：创建迁移指南

创建 `MIGRATION.md`，包含：
- 从 v0.11.x 升级到 v0.12.0 的步骤
- 新功能介绍
- Vue3使用示例
- 常见问题解答

### 步骤6.2：更新README

更新 `README.md`，添加：
- 项目标题和描述
- 技术框架列表
- 重构方案文档
- 快速开始指南
- 完整API文档

### 步骤6.3：创建发布脚本

创建 `scripts/release.sh`，实现：
- 版本更新
- 测试运行
- 构建执行
- Git提交和标签
- npm发布

### 步骤6.4：创建CHANGELOG

更新 `CHANGELOG.md`，记录：
- 新增功能
- 变更内容
- 修复问题
- 废弃警告

---

## 🚀 完整执行流程

### 执行命令汇总

```bash
# ===== 阶段一：环境准备与基础设施升级 =====
# 1. 备份当前代码
git checkout -b backup/before-refactor
git push origin backup/before-refactor
git checkout -b feature/refactor-vue3

# 2. 更新package.json（手动编辑）

# 3. 创建配置文件
mkdir -p config tests/{unit,integration,compatibility}

# 4. 创建配置文件（使用上面的代码）

# 5. 安装依赖
rm -rf node_modules package-lock.json
npm install

# 6. 验证安装
npm run type-check

# ===== 阶段二：核心功能重构 =====
# 7. 创建目录结构
mkdir -p src/core/{errors,performance,trace,services,types}
mkdir -p src/plugins
mkdir -p src/utils

# 8. 创建核心文件

# ===== 阶段三：兼容层实现 =====
# 9. 创建兼容层

# ===== 阶段四：Vue3插件开发 =====
# 10. 创建Vue3插件

# ===== 阶段五：测试与验证 =====
# 11. 创建测试文件

# 12. 运行测试
npm test
npm run test:coverage

# ===== 阶段六：文档与发布 =====
# 13. 创建文档

# 14. 构建项目
npm run build

# 15. 运行完整检查
npm run lint
npm run type-check
npm test

# 16. 提交代码
git add .
git commit -m "feat: refactor with Vue3 support and backward compatibility"

# 17. 推送到远程
git push origin feature/refactor-vue3

# 18. 创建Pull Request

# 19. 发布版本
chmod +x scripts/release.sh
./scripts/release.sh 0.12.0
```

---

## 📊 验证清单

### 兼容性验证

```bash
# 1. 创建测试项目
mkdir test-legacy-project
cd test-legacy-project
npm init -y
npm install ../apm-client-sdk

# 2. 创建测试文件并运行
```

### Vue3验证

```bash
# 1. 创建Vue3测试项目
npm create vue@latest test-vue3-project
cd test-vue3-project
npm install ../apm-client-sdk

# 2. 修改main.ts并运行
```

---

## ✅ 完成检查清单

- [ ] 阶段一：环境准备与基础设施升级
  - [ ] 备份当前代码
  - [ ] 更新package.json
  - [ ] 创建配置文件
  - [ ] 安装依赖
  - [ ] 验证安装

- [ ] 阶段二：核心功能重构
  - [ ] 重构目录结构
  - [ ] 定义核心类型
  - [ ] 重构核心监控类
  - [ ] 重构错误追踪模块
  - [ ] 重构性能追踪模块
  - [ ] 重构链路追踪模块
  - [ ] 重构服务层

- [ ] 阶段三：兼容层实现
  - [ ] 创建兼容层
  - [ ] 创建主入口文件

- [ ] 阶段四：Vue3插件开发
  - [ ] 创建Vue3插件
  - [ ] 创建Vue3 Composables

- [ ] 阶段五：测试与验证
  - [ ] 创建测试配置
  - [ ] 创建兼容性测试
  - [ ] 创建核心功能测试
  - [ ] 创建Vue3插件测试
  - [ ] 运行测试

- [ ] 阶段六：文档与发布
  - [ ] 创建迁移指南
  - [ ] 更新README
  - [ ] 创建发布脚本
  - [ ] 创建CHANGELOG
  - [ ] 构建项目
  - [ ] 运行完整检查
  - [ ] 提交代码
  - [ ] 发布版本

---

## 🎉 兼容性保证

### 现有项目升级

```bash
# 现有项目直接升级，无需修改代码
npm install @power/apm-client-js@latest
```

### 使用方式对比

**现有项目（无需修改）**：
```javascript
import ClientMonitor from '@power/apm-client-js';

ClientMonitor.register({
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  serviceVersion: 'v1.0.0',
  pagePath: window.location.href,
  loginUser: 'test-user',
});
```

**新项目（推荐方式）**：
```typescript
import { createAPMPlugin } from '@power/apm-client-js/vue3'
import { createApp } from 'vue'

const app = createApp(App)

app.use(createAPMPlugin({
  collector: 'http://127.0.0.1:12800',
  service: 'vue3-app',
  serviceVersion: '1.0.0',
  pagePath: window.location.pathname
}))

app.mount('#app')
```

---

## 基本使用

```js
import ClientMonitor from '@power/apm-client-js';

ClientMonitor.register({
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  serviceVersion: 'v1.0.0',
  pagePath: window.location.href,
  loginUser: 'test-user',
});
```

`ClientMonitor` 内部定义了以下八种方法, 我们将其区分为配置方法和内部方法, 汇总如下：

配置方法：

- register
- catchErrors
- setPerformance
- reportFrameErrors
- setCustomTags
- performance

内部方法：

- validateTags
- validateOptions

> 配置方法即由我们调用来进行配置的方法, 内部方法我们虽然可以进行调用, 但没有什么实际作用, 在这里的两个内部方法都是由其它配置方法调用, 辅助进行参数校验。

## 基础配置项

| 配置名         | 类型                 | 备注                                                     |
| -------------- | -------------------- | -------------------------------------------------------- |
| collector      | string               | 上报的的 OAP 服务器地址（一般固定 12800 端口）           |
| service        | string               | 自定义的客户端服务名                                     |
| serviceVersion | string               | 自定义的服务端实例版本                                   |
| pagePath       | string               | 自定义的服务端端点, 常指页面路由                         |
| loginUser      | string \| ()=>string | 上报当前用户名                                           |
| customFetch    | typeof fetch         | 自定义 fetch 引用，MicroApp 等沙箱场景推荐传入原生 fetch |

## 错误追踪

| 错误名               | 类别         | 实现方式                                                                                                                                               |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| JSErrorsJS           | 执行错误使用 | window.onerror 监听 JS 执行错误并上报                                                                                                                  |
| PromiseErrorsPromise | Reject       | 错误使用 unhandledrejection 事件监听未处理 reject 并上报                                                                                               |
| VueErrorsVue         | 内部错误使用 | Vue.config.errorHandler 监听错误                                                                                                                       |
| AjaxErrorsAjax       | 网络请求错误 | XHR 请求类型使用 xhrReadyStateChange 事件拦截并判断是否发生错误；fetch 请求则是重写 fetch 方法拦截响应 response, 根据 response.status 判断是否发生错误 |
| ResourceErrors       | 资源加载错误 | 在 window 上设置 error 监听, 并判断 error 事件是否来源于 HTMLScriptElement, HTMLLinkElement, HTMLImageElement；如果是, 则判断未资源加载错误            |
| FrameErrors          | 框架错误     | 非全局自动监听, 需要自己手动传入 error 对象                                                                                                            |

> 错误追踪功能会在发生以上错误时, 收集 error 信息, 并以 1min 的固定频率进行上报。在这些错误类型中, 前 5 种由 catchErrors 进行全局配置, 而最后一种由 reportFrameErrors 进行捕获

### catchErrors 配置方法

该配置方法需要传入通用配置和监听的错误类型配置, 且其基础配置不会改变全局通用配置, 仅作用于错误追踪模块：

```ts
ClientMonitor.catchErrors({
  // 基础配置（错误上报的地址）
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  serviceVersion: 'v1.0.0',
  pagePath: window.location.href,

  // 错误监听
  jsErrors: true, // 启用JSErrors, PromiseErrors错误的监听
  apiErrors: true, // 启用AjaxErrors错误的监听
  resourceErrors: true, // 启用ResourceErrors错误的监听
  vue: true, // 启用VueErrors错误的监听
});
```

| 配置名         | 类型    | 备注                                    |
| -------------- | ------- | --------------------------------------- |
| jsErrors       | boolean | 启用 JSErrors, PromiseErrors 错误的监听 |
| apiErrors      | boolean | 启用 AjaxErrors 错误的监听              |
| resourceErrors | boolean | 启用 ResourceErrors 错误的监听          |
| vue            | boolean | 启用 VueErrors 错误的监听               |

### reportFrameErrors 配置方法

该配置方法用于标记框架产生的错误, `ClientMonitor` 本身只支持了 `Vue` 的错误捕获, 其余框架可能的错误, 需要我们手动调用该方法进行上报, 并传入产生的 error 对象, 同样不会改变全局通用配置:

```ts
ClientMonitor.reportFrameErrors(
  {
    // 基础配置
    collector: 'http://127.0.0.1:12800',
    service: 'vue-demo',
    pagePath: '/app',
    serviceVersion: 'v1.0.0',
  },
  error,
);
```

## 性能追踪

性能追踪采取的是 `window.performance` 原生方案, 其配置由 `setPerformance` 和 `performance` 方法实现，追踪页面初次加载中的各项性能参数

### performance

该配置方法做的事情很简单，他会判断调用时页面是否加载完毕，如果已加载完成会立即调用内部的 tracePerf.getPerf 方法，传入配置项并立即进行性能数据的收集和上报，如果还未加载完成会添加 window.onLoad 监听，等到加载完成后再执行上述操作。

performance 才是实现性能追踪的主要方法，其配置项直接作用于性能追踪模块，不会改变全局配置，配置如下：

```ts
ClientMonitor.performance({
  // 基础配置
  collector: 'http://127.0.0.1:12800',
  service: 'FE_instance',
  serviceVersion: '1.0.0',
  pagePath: window.location.href,

  // 性能追踪
  autoTracePerf: true,
  useFmp: true,
  enableSPA: false,
});
```

仅有简单的三个配置项，他们的作用于 tracePerf.getPerf 方法，使用如下：

| 配置名        | 类型    | 备注                                                                                                |
| ------------- | ------- | --------------------------------------------------------------------------------------------------- |
| autoTracePerf | boolean | 是否开启自动追踪，开启后才会去 window.performance 拿取性能数据，否则上报的内容中仅有通用配置的数据  |
| useFmp        | boolean | 是否收集 FMP 首次有效绘制性能指标，需要 autoTracePerf 开启才有用，会向上报数据添加一个 fmpTime 字段 |
| enableSPA     | boolean | 是否开启单页应用模式，开启后会在每次 window.onhashchange 事件中均发生性能数据                       |

### setPerformance

该方法会调用 performance 来配置错误追踪，但他做了更多的工作，首先其会改变全局通用配置（如果你没有设置 useFmp，该方法会将其置为 false），并对我们传入的配置参数进行校验，随后会调用 performance 方法，最后还会根据全局配置重新设置一遍错误追踪（不包括框架错误追踪）

也就是说 setPerformance 可以同时配置错误追踪和性能追踪，且会改变全局配置：

```ts
ClientMonitor.register({
  // 基础配置
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  serviceVersion: '1.0.0',
  pagePath: window.location.href,

  // 错误追踪
  jsErrors: true,
  apiErrors: true,
  resourceErrors: true,
  vue: true,

  // 性能追踪
  autoTracePerf: true,
  useFmp: true,
  enableSPA: true,
});
```

## 网络追踪

网络请求追踪，会记录你的网络请求情况并上报，该项功能只能由 register 配置项完成，其也是最综合的配置项，三个功能模块均能配置

| 配置名            | 类型     | 备注                                                           |
| ----------------- | -------- | -------------------------------------------------------------- |
| traceSDKInternal  | boolean  | 是否追踪自己的上报请求                                         |
| detailMode        | boolean  | 设置是否开启详细模式，开启后会在 span 中添加更多详细信息的 tag |
| noTraceOrigins    | string[] | 排除追踪的请求列表                                             |
| traceTimeInterval | number   | 设置循环定时器轮询的时间，默认 1min，单位 ms                   |

```ts
ClientMonitor.register({
  // 基础配置
  collector: 'http://127.0.0.1:12800',
  service: 'FE_instance',
  serviceVersion: '1.0.0',
  pagePath: window.location.href,

  // 错误追踪
  jsErrors: true,
  apiErrors: true,
  resourceErrors: true,
  vue: true,

  // 性能追踪
  autoTracePerf: true,
  useFmp: true,
  enableSPA: true,

  // 网络追踪
  traceSDKInternal: false,
  detailMode: false,
  noTraceOrigins: [],
  traceTimeInterval: 60000,
  // MicroApp 场景：传入基座 window 的原始 fetch，避免沙箱替换
  customFetch: window.rawWindow?.fetch || (window as any).__MICRO_APP_BASE_WINDOW__?.fetch || window.fetch,
});
```

## 示例

### Collect Metrics Manually

```js
ClientMonitor.setPerformance({
  collector: 'http://127.0.0.1:12800',
  service: 'browser-app',
  serviceVersion: '1.0.0',
  pagePath: location.href,
  useFmp: true,
});
```

### SPA Page

```js
app.on('routeChange', function (next) {
  ClientMonitor.setPerformance({
    collector: 'http://127.0.0.1:12800',
    service: 'browser-app',
    serviceVersion: '1.0.0',
    pagePath: location.href,
    useFmp: true,
  });
});
```

### Catching errors in frames, including React, Angular, Vue.

```js
// Angular
export class AppGlobalErrorhandler implements ErrorHandler {
  handleError(error) {
    ClientMonitor.reportFrameErrors({
      collector: 'http://127.0.0.1:12800',
      service: 'angular-demo',
      pagePath: '/app',
      serviceVersion: 'v1.0.0',
    }, error);
  }
}
@NgModule({
  ...
  providers: [{provide: ErrorHandler, useClass: AppGlobalErrorhandler}]
})
class AppModule {}
```

```js
// React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    ClientMonitor.reportFrameErrors(
      {
        collector: 'http://127.0.0.1:12800',
        service: 'react-demo',
        pagePath: '/app',
        serviceVersion: 'v1.0.0',
      },
      error,
    );
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>;
```

```js
// Vue
Vue.config.errorHandler = (error) => {
  ClientMonitor.reportFrameErrors(
    {
      collector: 'http://127.0.0.1:12800',
      service: 'vue-demo',
      pagePath: '/app',
      serviceVersion: 'v1.0.0',
    },
    error,
  );
};
```

### According to different pages or modules, add custom tags to spans.

```js
app.on('routeChange', function () {
  ClientMonitor.setCustomTags([
    { key: 'key1', value: 'value1' },
    { key: 'key2', value: 'value2' },
  ]);
});
```
