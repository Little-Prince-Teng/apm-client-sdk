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
