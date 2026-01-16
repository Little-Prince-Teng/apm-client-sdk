import { inject, onMounted, Ref, ref } from 'vue';
import type { APMClient } from '../core/monitor';

/**
 * useAPM Composable
 *
 * 在 Vue 组件中使用 APM 功能的基础 composable
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

/**
 * useErrorTracking Composable
 *
 * 专门用于错误追踪的 composable
 *
 * 功能：
 * - 提供错误捕获方法
 * - 提供 wrapAsync 方法包装异步操作
 *
 * 使用场景：
 * - 在 Vue 组件中捕获错误
 * - 包装异步操作以自动捕获错误
 *
 * 使用示例：
 * ```typescript
 * import { useErrorTracking } from '@power/apm-client-js';
 *
 * export default {
 *   setup() {
 *     const { captureError, wrapAsync } = useErrorTracking();
 *
 *     const fetchData = async () => {
 *       const result = await wrapAsync(
 *         () => api.getData(),
 *         'fetchData'
 *       );
 *       if (result) {
 *         console.log(result);
 *       }
 *     };
 *
 *     return { fetchData };
 *   }
 * };
 * ```
 *
 * @returns 错误追踪方法对象
 */
export function useErrorTracking() {
  const { captureError } = useAPM();

  /**
   * 包装异步操作
   *
   * 自动捕获异步操作中的错误并上报到 APM
   *
   * @param fn - 异步函数
   * @param context - 错误上下文信息（可选）
   * @returns 异步函数的执行结果，如果出错则返回 null
   *
   * 使用示例：
   * ```typescript
   * const result = await wrapAsync(
   *   () => api.getData(),
   *   'fetchData'
   * );
   * ```
   */
  const wrapAsync = async <T>(fn: () => Promise<T>, context?: string): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      captureError(
        error as Error,
        { context: context ?? 'async-operation' } as Record<string, unknown>
      );
      return null;
    }
  };

  return {
    captureError,
    wrapAsync,
  };
}

/**
 * usePerformanceTracking Composable
 *
 * 专门用于性能追踪的 composable
 *
 * 功能：
 * - 提供性能追踪方法
 * - 提供自定义标签设置方法
 * - 提供性能测量方法
 *
 * 使用场景：
 * - 在 Vue 组件中追踪性能
 * - 测量特定操作的执行时间
 *
 * 使用示例：
 * ```typescript
 * import { usePerformanceTracking } from '@power/apm-client-js';
 *
 * export default {
 *   setup() {
 *     const { startMeasure, endMeasure } = usePerformanceTracking();
 *
 *     const handleClick = async () => {
 *       startMeasure();
 *       await someOperation();
 *       endMeasure('handleClick');
 *     };
 *
 *     return { handleClick };
 *   }
 * };
 * ```
 *
 * @returns 性能追踪方法对象
 */
export function usePerformanceTracking() {
  const { trackPerformance, setCustomTags } = useAPM();
  const startTime: Ref<number> = ref(0);

  /**
   * 开始测量
   *
   * 记录当前时间作为测量的起始时间
   *
   * 使用示例：
   * ```typescript
   * startMeasure();
   * await someOperation();
   * endMeasure('operationName');
   * ```
   */
  const startMeasure = () => {
    startTime.value = performance.now();
  };

  /**
   * 结束测量
   *
   * 计算从 startMeasure 到现在的时间差，并作为自定义标签上报
   *
   * @param name - 测量名称，将作为自定义标签的 key
   *
   * 使用示例：
   * ```typescript
   * startMeasure();
   * await someOperation();
   * endMeasure('operationName');
   * ```
   */
  const endMeasure = (name: string) => {
    const duration = performance.now() - startTime.value;
    setCustomTags([{ key: name, value: `${duration.toFixed(2)}ms` }]);
  };

  return {
    trackPerformance,
    setCustomTags,
    startMeasure,
    endMeasure,
  };
}

/**
 * usePageTracking Composable
 *
 * 专门用于页面追踪的 composable
 *
 * 功能：
 * - 在组件挂载时自动追踪页面性能
 * - 提供页面切换追踪方法
 *
 * 使用场景：
 * - SPA 应用中追踪页面性能
 * - 页面切换时追踪性能
 *
 * 使用示例：
 * ```typescript
 * import { usePageTracking } from '@power/apm-client-js';
 *
 * export default {
 *   setup() {
 *     const { trackPageChange } = usePageTracking();
 *
 *     const navigateTo = (path: string) => {
 *       router.push(path);
 *       trackPageChange(path);
 *     };
 *
 *     return { navigateTo };
 *   }
 * };
 * ```
 *
 * @returns 页面追踪方法对象
 */
export function usePageTracking() {
  const { trackPerformance, setCustomTags } = useAPM();

  /**
   * 组件挂载时自动追踪页面性能
   *
   * 在组件挂载时自动触发性能追踪
   */
  onMounted(() => {
    trackPerformance();
  });

  /**
   * 追踪页面切换
   *
   * 更新页面路径并追踪性能
   *
   * @param pagePath - 新页面的路径
   *
   * 使用示例：
   * ```typescript
   * const navigateTo = (path: string) => {
   *   router.push(path);
   *   trackPageChange(path);
   * };
   * ```
   */
  const trackPageChange = (pagePath: string) => {
    setCustomTags([{ key: 'pagePath', value: pagePath }]);
    trackPerformance();
  };

  return {
    trackPageChange,
  };
}
