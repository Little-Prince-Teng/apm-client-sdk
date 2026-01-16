# 迁移指南

## 从 v0.11.x 升级到 v0.12.0

### 无需修改代码

v0.12.0 完全向后兼容，现有项目可以直接升级：

```bash
npm install @power/apm-client-js@latest
```

### 验证升级

运行现有代码，确保所有功能正常工作：

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

### 可选：使用新的Vue3 API

如果你使用Vue3，可以选择使用新的API：

```typescript
// 旧方式（仍然支持）
import ClientMonitor from '@power/apm-client-js';
ClientMonitor.register({...});

// 新方式（推荐）
import { createAPMPlugin } from '@power/apm-client-js/vue3';
import { createApp } from 'vue';

const app = createApp(App);

app.use(createAPMPlugin({
  collector: 'http://127.0.0.1:12800',
  service: 'vue3-app',
  serviceVersion: '1.0.0',
  pagePath: window.location.pathname
}));

app.mount('#app');
```

## 新功能

### Vue3支持

```typescript
import { createAPMPlugin } from '@power/apm-client-js/vue3';

app.use(createAPMPlugin({
  collector: 'http://127.0.0.1:12800',
  service: 'vue3-app',
  serviceVersion: '1.0.0',
  pagePath: window.location.pathname,
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  enableTraceTracking: true
}));
```

### Composition API

```typescript
import { useAPM } from '@power/apm-client-js/vue3';

export default {
  setup() {
    const { captureError, trackPerformance, setCustomTags } = useAPM();

    const handleError = (error: Error) => {
      captureError(error, { context: 'component' });
    };

    return { handleError };
  }
};
```

### Composables

```typescript
import { useErrorTracking, usePerformanceTracking, usePageTracking } from '@power/apm-client-js/vue3';

// 错误追踪
const { captureError, wrapAsync } = useErrorTracking();

// 性能追踪
const { startMeasure, endMeasure } = usePerformanceTracking();

// 页面追踪
const { trackPageChange } = usePageTracking();
```

## 破坏性变更

v0.12.0 没有破坏性变更，所有现有代码都可以正常工作。

## 废弃警告

旧的API仍然支持，但建议新项目使用新的API：

```typescript
// 旧API（仍然支持，但已废弃）
import ClientMonitor from '@power/apm-client-js';
ClientMonitor.register({...});

// 新API（推荐）
import { createAPMPlugin } from '@power/apm-client-js/vue3';
app.use(createAPMPlugin({...}));
```

## 常见问题

### Q: 升级后需要修改代码吗？

A: 不需要，v0.12.0 完全向后兼容。

### Q: 如何使用Vue3的新功能？

A: 使用 `@power/apm-client-js/vue3` 包中的 `createAPMPlugin` 和 `useAPM`。

### Q: 旧的API会被移除吗？

A: 不会，旧的API会继续支持，但建议新项目使用新的API。

### Q: 性能有什么改进？

A: 使用Vite构建，构建速度更快，包体积更小，支持tree-shaking。

## 支持

如有问题，请提交 Issue 或联系维护者。
