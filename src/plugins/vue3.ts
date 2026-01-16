import { App, Plugin, inject } from 'vue';
import { APMClient, APMOptions, TagOption } from '../core/monitor';

declare global {
  interface Window {
    __APM__?: APMClient;
  }
}

/**
 * APM Vue3 插件选项
 *
 * 扩展自 APMOptions，添加 Vue3 特定的配置选项
 *
 * 配置项：
 * - enableErrorTracking: 是否启用错误追踪
 * - enablePerformanceTracking: 是否启用性能追踪
 * - enableTraceTracking: 是否启用链路追踪
 * - errorTrackingOptions: 错误追踪详细配置
 * - performanceTrackingOptions: 性能追踪详细配置
 * - traceTrackingOptions: 链路追踪详细配置
 */
export interface APMPluginOptions extends APMOptions {
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableTraceTracking?: boolean;
  errorTrackingOptions?: {
    jsErrors?: boolean;
    apiErrors?: boolean;
    resourceErrors?: boolean;
  };
  performanceTrackingOptions?: {
    autoTracePerf?: boolean;
    useFmp?: boolean;
    enableSPA?: boolean;
  };
  traceTrackingOptions?: {
    traceSDKInternal?: boolean;
    detailMode?: boolean;
    noTraceOrigins?: (string | RegExp)[];
    traceTimeInterval?: number;
  };
}

/**
 * 创建 APM Vue3 插件
 *
 * 功能：
 * - 创建 Vue3 插件，集成 APM 功能到 Vue 应用
 * - 自动捕获 Vue 组件错误
 * - 提供 useAPM composable 用于在组件中使用 APM
 * - 将 APM 客户端实例挂载到 window 对象
 *
 * 使用场景：
 * - 在 Vue3 应用中集成 APM 监控
 * - 自动追踪 Vue 组件错误
 * - 在组件中使用 APM 功能
 *
 * 使用示例：
 * ```typescript
 * import { createApp } from 'vue';
 * import { createAPMPlugin } from '@power/apm-client-js';
 *
 * const app = createApp(App);
 * app.use(createAPMPlugin({
 *   collector: 'https://collector.example.com',
 *   service: 'my-vue-app',
 *   enableErrorTracking: true,
 *   enablePerformanceTracking: true,
 * }));
 * app.mount('#app');
 * ```
 *
 * @param options - APM 插件配置选项
 * @returns Vue3 插件对象
 */
export const createAPMPlugin = (options: APMPluginOptions): Plugin => {
  const client = new APMClient(options);

  return {
    /**
     * 安装插件
     *
     * 在 Vue 应用中安装 APM 插件
     *
     * @param app - Vue 应用实例
     *
     * 执行的操作：
     * 1. 合并配置选项
     * 2. 初始化 APM 客户端
     * 3. 设置 Vue 全局错误处理器
     * 4. 提供 APM 客户端实例
     * 5. 将 APM 客户端挂载到 window 对象
     */
    install(app: App): void {
      const apmOptions = {
        ...options,
        jsErrors: options.enableErrorTracking
          ? (options.errorTrackingOptions?.jsErrors ?? true)
          : false,
        apiErrors: options.enableErrorTracking
          ? (options.errorTrackingOptions?.apiErrors ?? true)
          : false,
        resourceErrors: options.enableErrorTracking
          ? (options.errorTrackingOptions?.resourceErrors ?? true)
          : false,
        autoTracePerf: options.enablePerformanceTracking
          ? (options.performanceTrackingOptions?.autoTracePerf ?? true)
          : false,
        useFmp: options.enablePerformanceTracking
          ? (options.performanceTrackingOptions?.useFmp ?? false)
          : false,
        enableSPA: options.enablePerformanceTracking
          ? (options.performanceTrackingOptions?.enableSPA ?? false)
          : false,
        traceSDKInternal: options.enableTraceTracking
          ? (options.traceTrackingOptions?.traceSDKInternal ?? false)
          : false,
        detailMode: options.enableTraceTracking
          ? (options.traceTrackingOptions?.detailMode ?? true)
          : false,
        noTraceOrigins: options.enableTraceTracking
          ? (options.traceTrackingOptions?.noTraceOrigins ?? [])
          : [],
        traceTimeInterval: options.enableTraceTracking
          ? (options.traceTrackingOptions?.traceTimeInterval ?? 60000)
          : 60000,
      };

      client.init(apmOptions);

      /**
       * 设置 Vue 全局错误处理器
       *
       * 自动捕获 Vue 组件中的错误并上报到 APM
       *
       * @param err - 错误对象
       * @param instance - Vue 组件实例
       * @param info - 错误信息字符串
       */
      app.config.errorHandler = (err, instance, info) => {
        client.captureError(err as Error, {
          context: { info, component: instance?.$options?.name },
        });
      };

      app.provide('$apm', client);

      if (typeof window !== 'undefined') {
        window.__APM__ = client;
      }
    },
  };
};

/**
 * useAPM Composable
 *
 * 在 Vue 组件中使用 APM 功能
 *
 * 功能：
 * - 提供对 APM 客户端的访问
 * - 提供常用的 APM 方法
 *
 * 使用场景：
 * - 在 Vue 组件中手动捕获错误
 * - 在 Vue 组件中追踪性能
 * - 在 Vue 组件中设置自定义标签
 *
 * 使用示例：
 * ```typescript
 * import { useAPM } from '@power/apm-client-js';
 *
 * export default {
 *   setup() {
 *     const { captureError, trackPerformance, setCustomTags } = useAPM();
 *
 *     const handleClick = async () => {
 *       try {
 *         await riskyOperation();
 *       } catch (error) {
 *         captureError(error, { action: 'handleClick' });
 *       }
 *     };
 *
 *     return { handleClick };
 *   }
 * };
 * ```
 *
 * @returns APM 方法对象
 * @throws 如果 APM 插件未安装，抛出错误
 */
export function useAPM() {
  const apm = inject<APMClient>('$apm');

  if (!apm) {
    throw new Error('APM plugin not installed. Please use app.use(createAPMPlugin(options))');
  }

  return {
    captureError: apm.captureError.bind(apm),
    trackPerformance: apm.trackPerformance.bind(apm),
    setCustomTags: apm.setCustomTags.bind(apm),
    updateConfig: apm.updateConfig.bind(apm),
    getOptions: apm.getOptions.bind(apm),
  };
}

export { APMClient };
export type { APMOptions, TagOption };
