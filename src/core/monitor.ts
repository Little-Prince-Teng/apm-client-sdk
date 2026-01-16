import {
  APMOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
  TraceTrackingOptions,
  TagOption,
  ErrorInfo,
} from './types';
import { ErrorTracker } from './errors';
import { PerformanceTracker } from './performance';
import { TraceTracker } from './trace';

export type { APMOptions, TagOption };

/**
 * APM 客户端核心类
 *
 * 功能：
 * - 统一管理错误追踪、性能追踪、链路追踪
 * - 提供初始化和配置接口
 * - 支持动态更新配置
 * - 提供手动捕获错误和追踪性能的接口
 *
 * 管理的追踪器：
 * - ErrorTracker：错误追踪器
 * - PerformanceTracker：性能追踪器
 * - TraceTracker：链路追踪器
 *
 * 使用场景：
 * - 初始化 APM 客户端
 * - 启用/禁用各种追踪功能
 * - 手动捕获错误
 * - 手动追踪性能
 * - 设置自定义标签
 *
 * 使用示例：
 * ```typescript
 * import { APMClient } from '@power/apm-client-js';
 *
 * const apm = new APMClient();
 * apm.init({
 *   collector: 'https://collector.example.com',
 *   service: 'my-app',
 *   serviceVersion: '1.0.0',
 *   jsErrors: true,
 *   apiErrors: true,
 *   resourceErrors: true,
 *   autoTracePerf: true,
 * });
 * ```
 */
export class APMClient {
  private options: APMOptions;
  private errorTracker: ErrorTracker;
  private performanceTracker: PerformanceTracker;
  private traceTracker: TraceTracker;

  /**
   * 构造函数
   *
   * 初始化 APM 客户端，创建各个追踪器实例
   *
   * @param options - APM 配置选项（可选）
   *
   * 默认配置：
   * - collector: 当前页面的 origin
   * - service: 空字符串
   * - serviceVersion: 空字符串
   * - pagePath: 当前页面的 pathname
   */
  constructor(options?: Partial<APMOptions>) {
    this.options = {
      collector: typeof window !== 'undefined' ? window.location.origin : '',
      service: '',
      serviceVersion: '',
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      ...options,
    };

    this.errorTracker = new ErrorTracker(this.options);
    this.performanceTracker = new PerformanceTracker(this.options);
    this.traceTracker = new TraceTracker(this.options);
  }

  /**
   * 初始化 APM 客户端
   *
   * 根据配置启用各种追踪功能
   *
   * @param options - 完整的 APM 配置选项
   *
   * 启用的追踪功能：
   * - jsErrors: JavaScript 和 Promise 错误追踪
   * - apiErrors: AJAX 请求错误追踪
   * - resourceErrors: 资源加载错误追踪
   * - autoTracePerf: 自动性能追踪（仅在非 SPA 模式下）
   * - 链路追踪：始终启用
   *
   * 注意：
   * - 在 SPA 模式下（enableSPA: true），不会自动追踪性能
   * - 需要手动调用 trackPerformance 方法追踪 SPA 性能
   */
  init(
    options: APMOptions & ErrorTrackingOptions & PerformanceTrackingOptions & TraceTrackingOptions
  ): void {
    this.options = { ...this.options, ...options };
    this.validateOptions();

    if (
      (options.jsErrors ?? false) ||
      (options.apiErrors ?? false) ||
      (options.resourceErrors ?? false)
    ) {
      this.errorTracker.enable(options);
    }

    if ((options.autoTracePerf ?? false) && !(options.enableSPA ?? false)) {
      this.performanceTracker.track();
    }

    this.traceTracker.enable(options);
  }

  /**
   * 更新配置
   *
   * 动态更新 APM 配置，同步到所有追踪器
   *
   * @param options - 要更新的配置选项
   */
  updateConfig(options: Partial<APMOptions>): void {
    this.options = { ...this.options, ...options };
    this.errorTracker.updateConfig(this.options);
    this.performanceTracker.updateConfig(this.options);
    this.traceTracker.updateConfig(this.options);
  }

  /**
   * 手动捕获错误
   *
   * 用于在 try-catch 块中手动上报错误
   *
   * @param error - Error 对象
   * @param context - 额外的上下文信息（可选）
   *
   * 使用示例：
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   apm.captureError(error, { customField: 'value' });
   * }
   * ```
   */
  captureError(error: Error, context?: Partial<ErrorInfo>): void {
    this.errorTracker.capture(error, context);
  }

  /**
   * 手动追踪性能
   *
   * 用于手动触发性能数据收集和上报
   *
   * @param options - 性能追踪配置选项（可选）
   *
   * 使用场景：
   * - SPA 应用中手动追踪页面性能
   * - 在特定时机收集性能数据
   */
  trackPerformance(options?: Partial<PerformanceTrackingOptions>): void {
    if (options) {
      this.updateConfig(options);
    }
    this.performanceTracker.track();
  }

  /**
   * 设置自定义标签
   *
   * 为所有链路数据添加自定义标签
   *
   * @param tags - 自定义标签数组
   *
   * 使用示例：
   * ```typescript
   * apm.setCustomTags([
   *   { key: 'userId', value: '123' },
   *   { key: 'version', value: '1.0.0' }
   * ]);
   * ```
   */
  setCustomTags(tags: TagOption[]): void {
    if (this.validateTags(tags)) {
      this.traceTracker.setCustomTags(tags);
    }
  }

  /**
   * 验证配置选项
   *
   * 确保配置选项的类型正确，提供默认值
   *
   * 验证的选项：
   * - collector: 必须是字符串，否则使用当前页面的 origin
   * - service: 必须是字符串，否则使用空字符串
   * - pagePath: 必须是字符串，否则使用当前页面的 pathname
   * - serviceVersion: 必须是字符串，否则使用空字符串
   */
  private validateOptions(): void {
    const { collector, service, pagePath, serviceVersion } = this.options;

    if (typeof collector !== 'string') {
      this.options.collector = typeof window !== 'undefined' ? window.location.origin : '';
    }
    if (typeof service !== 'string') {
      this.options.service = '';
    }
    if (typeof pagePath !== 'string') {
      this.options.pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
    }
    if (typeof serviceVersion !== 'string') {
      this.options.serviceVersion = '';
    }
  }

  /**
   * 验证自定义标签
   *
   * 确保自定义标签的格式正确
   *
   * @param tags - 自定义标签数组
   * @returns 是否验证通过
   *
   * 验证规则：
   * - 必须是数组
   * - 每个标签必须有 key 和 value 属性
   * - key 和 value 必须是字符串
   */
  private validateTags(tags?: TagOption[]): boolean {
    if (!tags) {
      return false;
    }
    if (!Array.isArray(tags)) {
      console.warn('customTags must be an array');
      return false;
    }
    const isValid = tags.every(
      (tag) => tag && typeof tag.key === 'string' && typeof tag.value === 'string'
    );
    if (!isValid) {
      console.warn('customTags format error');
    }
    return isValid;
  }

  /**
   * 获取当前配置
   *
   * 返回只读的当前配置对象
   *
   * @returns 只读的 APM 配置对象
   */
  getOptions(): Readonly<APMOptions> {
    return this.options;
  }
}
