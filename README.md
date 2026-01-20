# @power/apm-client-js

[![npm version](https://badge.fury.io/js/%40power%2Fapm-client-js.svg)](https://badge.fury.io/js/%40power%2Fapm-client-js)
[![Build Status](https://github.com/your-org/apm-client-js/workflows/CI/badge.svg)](https://github.com/your-org/apm-client-js/actions)
[![codecov](https://codecov.io/gh/your-org/apm-client-js/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/apm-client-js)

APM Client SDK - 前端应用性能监控SDK，支持Vue2/Vue3，提供错误监控、性能追踪、链路追踪等功能

## 🚀 特性

- ✅ **错误监控** - JS、Promise、Vue、Ajax、资源加载错误
- ✅ **性能监控** - Performance API、FMP首次有效绘制
- ✅ **链路追踪** - XHR、Fetch请求拦截与追踪
- ✅ **Vue2/Vue3支持** - 兼容Vue2和Vue3，提供专用插件
- ✅ **TypeScript支持** - 完整的类型定义
- ✅ **向后兼容** - 无缝升级，无需修改现有代码
- ✅ **轻量级** - 零依赖，体积小巧
- ✅ **易于集成** - 简单配置即可开始使用

---

## 📦 安装

```bash
# 使用 npm
npm install @power/apm-client-js

# 使用 yarn
yarn add @power/apm-client-js

# 使用 pnpm
pnpm add @power/apm-client-js
```

## 🚀 快速开始

### 基础使用

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

### Vue3 集成

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

### Vue3 Composition API

```typescript
import { useAPM } from '@power/apm-client-js/vue3'

export default {
  setup() {
    const { captureError, trackPerformance } = useAPM()
    
    const handleError = () => {
      try {
        // 可能出错的操作
      } catch (error) {
        captureError(error)
      }
    }
    
    return { handleError }
  }
}
```

## 📖 API 文档

### 配置选项

| 配置名         | 类型                 | 必填 | 默认值 | 描述                                                     |
| -------------- | -------------------- | ---- | ------ | -------------------------------------------------------- |
| collector      | string               | 是   | -      | 上报的 OAP 服务器地址（一般固定 12800 端口）            |
| service        | string               | 是   | -      | 自定义的客户端服务名                                     |
| serviceVersion | string               | 是   | -      | 自定义的服务端实例版本                                   |
| pagePath       | string               | 是   | -      | 自定义的服务端端点, 常指页面路由                         |
| loginUser      | string \| ()=>string | 否   | -      | 上报当前用户名                                           |
| customFetch    | typeof fetch         | 否   | -      | 自定义 fetch 引用，MicroApp 等沙箱场景推荐传入原生 fetch |

### 错误追踪

| 错误名         | 类别         | 实现方式                                                                                                                               |
| -------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| JSErrors       | JS执行错误   | 使用 `window.onerror` 监听 JS 执行错误并上报                                                                                          |
| PromiseErrors  | Promise错误  | 使用 `unhandledrejection` 事件监听未处理 reject 并上报                                                                                 |
| VueErrors      | Vue内部错误  | 使用 `Vue.config.errorHandler` 监听错误                                                                                               |
| AjaxErrors     | 网络请求错误 | XHR 请求使用 `xhrReadyStateChange` 事件拦截；fetch 请求重写 fetch 方法拦截响应，根据 response.status 判断是否发生错误                   |
| ResourceErrors | 资源加载错误 | 在 window 上设置 error 监听，判断错误事件是否来源于 HTMLScriptElement, HTMLLinkElement, HTMLImageElement；如果是，则判断为资源加载错误 |
| FrameErrors    | 框架错误     | 非全局自动监听，需要手动传入 error 对象                                                                                                |

### 配置方法

#### register(options)

初始化并配置 APM 监控。

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

#### catchErrors(options)

配置错误追踪模块，不会改变全局通用配置。

```js
ClientMonitor.catchErrors({
  // 基础配置
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  serviceVersion: 'v1.0.0',
  pagePath: window.location.href,

  // 错误监听
  jsErrors: true,        // 启用JSErrors, PromiseErrors错误的监听
  apiErrors: true,       // 启用AjaxErrors错误的监听
  resourceErrors: true,  // 启用ResourceErrors错误的监听
  vue: true,             // 启用VueErrors错误的监听
});
```

| 配置名         | 类型    | 默认值 | 描述                                      |
| -------------- | ------- | ------ | ----------------------------------------- |
| jsErrors       | boolean | true   | 启用 JSErrors, PromiseErrors 错误的监听  |
| apiErrors      | boolean | true   | 启用 AjaxErrors 错误的监听               |
| resourceErrors | boolean | true   | 启用 ResourceErrors 错误的监听            |
| vue            | boolean | true   | 启用 VueErrors 错误的监听                 |

#### reportFrameErrors(options, error)

手动上报框架产生的错误。

```js
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

### 性能追踪

#### performance(options)

配置性能追踪模块，不会改变全局通用配置。

```js
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

| 配置名        | 类型    | 默认值 | 描述                                                                 |
| ------------- | ------- | ------ | -------------------------------------------------------------------- |
| autoTracePerf | boolean | true   | 是否开启自动追踪，开启后才会去 window.performance 拿取性能数据       |
| useFmp        | boolean | false  | 是否收集 FMP 首次有效绘制性能指标，需要 autoTracePerf 开启才有用     |
| enableSPA     | boolean | false  | 是否开启单页应用模式，开启后会在每次 window.onhashchange 事件中上报 |

#### setPerformance(options)

同时配置错误追踪和性能追踪，会改变全局通用配置。

```js
ClientMonitor.setPerformance({
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

### 网络追踪

网络请求追踪，会记录网络请求情况并上报，该项功能只能由 register 配置项完成。

| 配置名           | 类型    | 默认值 | 描述                                      |
| ---------------- | ------- | ------ | ----------------------------------------- |
| traceSDKInternal | boolean | false  | 是否追踪自己的上报请求                    |
| detailMode       | boolean | false  | 是否开启详细模式，在 span 中添加更多 tag |

### 其他方法

#### setCustomTags(tags)

设置自定义标签，用于上报数据时附加额外信息。

```js
ClientMonitor.setCustomTags([
  { key: 'key1', value: 'value1' },
  { key: 'key2', value: 'value2' },
]);
```

## 🌰 使用示例

### React 项目

```jsx
import React, { useEffect } from 'react';
import ClientMonitor from '@power/apm-client-js';

function App() {
  useEffect(() => {
    ClientMonitor.register({
      collector: 'http://127.0.0.1:12800',
      service: 'react-app',
      serviceVersion: '1.0.0',
      pagePath: window.location.pathname,
    });
  }, []);

  return <div>My App</div>;
}

export default App;
```

### 单页应用路由监听

```js
// React Router
import { useHistory } from 'react-router-dom';

function RouteTracker() {
  const history = useHistory();
  
  useEffect(() => {
    const unlisten = history.listen((location) => {
      ClientMonitor.setCustomTags([
        { key: 'route', value: location.pathname },
      ]);
    });
    
    return unlisten;
  }, [history]);
  
  return null;
}

// Vue Router
router.afterEach((to) => {
  ClientMonitor.setCustomTags([
    { key: 'route', value: to.path },
  ]);
});
```

### 手动错误上报

```js
try {
  // 可能出错的代码
  riskyOperation();
} catch (error) {
  // 手动上报错误
  ClientMonitor.reportFrameErrors(
    {
      collector: 'http://127.0.0.1:12800',
      service: 'my-app',
      pagePath: window.location.pathname,
      serviceVersion: '1.0.0',
    },
    error
  );
}
```

## 🛠️ 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-org/apm-client-js.git
cd apm-client-js

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建项目
npm run build
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage

# 运行测试并查看UI
npm run test:ui
```

## 🤝 贡献

欢迎贡献代码！请阅读 [贡献指南](CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

[MIT](LICENSE)

## 📚 相关文档

- [迁移指南](./MIGRATION.md)
- [更新日志](./CHANGELOG.md)
- [重构实施细节](./UPDATE.md)
