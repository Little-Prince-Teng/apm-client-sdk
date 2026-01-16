import { APMClient } from './monitor';
import {
  APMOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
  TraceTrackingOptions,
  TagOption,
  VueInstance,
} from './types';

/**
 * 遗留配置接口
 *
 * 扩展自所有配置选项，用于向后兼容旧版 API
 *
 * 包含的配置：
 * - APMOptions: 基础 APM 配置
 * - ErrorTrackingOptions: 错误追踪配置
 * - PerformanceTrackingOptions: 性能追踪配置
 * - TraceTrackingOptions: 链路追踪配置
 * - vue: Vue 实例（可选）
 */
export interface LegacyOptions
  extends APMOptions, ErrorTrackingOptions, PerformanceTrackingOptions, TraceTrackingOptions {
  vue?: VueInstance;
}

/**
 * 创建遗留客户端
 *
 * 功能：
 * - 提供向后兼容的 API 接口
 * - 包装新的 APMClient 以支持旧版方法
 * - 提供与旧版 API 相同的方法签名
 *
 * 使用场景：
 * - 从旧版 API 迁移到新版 API
 * - 保持与现有代码的兼容性
 *
 * 提供的方法：
 * - register: 注册配置并初始化 APM
 * - setPerformance: 设置性能追踪
 * - catchErrors: 捕获错误
 * - reportFrameErrors: 上报框架错误
 * - setCustomTags: 设置自定义标签
 * - validateTags: 验证自定义标签
 * - validateOptions: 验证配置选项
 * - performance: 追踪性能
 *
 * @returns 遗留客户端对象
 */
export function createLegacyClient() {
  const client = new APMClient();

  const legacyClient = {
    customOptions: {} as LegacyOptions,

    /**
     * 注册配置
     *
     * 合并配置并初始化 APM 客户端
     *
     * @param configs - 遗留配置选项
     *
     * 使用示例：
     * ```typescript
     * const apm = createLegacyClient();
     * apm.register({
     *   collector: 'https://collector.example.com',
     *   service: 'my-app',
     *   jsErrors: true,
     *   apiErrors: true,
     * });
     * ```
     */
    register(configs: LegacyOptions): void {
      this.customOptions = { ...this.customOptions, ...configs };
      client.init(configs);
    },

    /**
     * 设置性能追踪
     *
     * 更新配置并追踪性能
     *
     * @param configs - 性能追踪配置选项
     *
     * 注意：
     * - 会禁用 FMP 追踪（useFmp: false）
     */
    setPerformance(configs: PerformanceTrackingOptions): void {
      this.customOptions = { ...this.customOptions, ...configs, useFmp: false };
      client.updateConfig(this.customOptions);
      client.trackPerformance(this.customOptions);
    },

    /**
     * 捕获错误
     *
     * 初始化错误追踪功能
     *
     * @param options - 错误追踪配置选项
     *
     * 逻辑：
     * - 合并配置选项
     * - 使用自定义选项作为默认值
     * - 初始化错误追踪
     */
    catchErrors(options: ErrorTrackingOptions): void {
      const { service, pagePath, serviceVersion, collector } = options;
      const errorOptions: ErrorTrackingOptions = {
        ...options,
        service: service || this.customOptions.service,
        pagePath: pagePath || this.customOptions.pagePath,
        serviceVersion: serviceVersion || this.customOptions.serviceVersion,
        collector: collector || this.customOptions.collector,
      };
      client.init(errorOptions);
    },

    /**
     * 上报框架错误
     *
     * 手动上报框架错误到收集器
     *
     * @param configs - APM 配置选项
     * @param error - Error 对象
     *
     * 使用场景：
     * - 在框架错误处理器中上报错误
     * - 手动捕获并上报错误
     */
    reportFrameErrors(configs: APMOptions, error: Error): void {
      client.captureError(error, {
        service: configs.service,
        pagePath: configs.pagePath,
        serviceVersion: configs.serviceVersion,
        collector: configs.collector,
      });
    },

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
        this.customOptions.customTags = tags;
        client.setCustomTags(tags);
      }
    },

    /**
     * 验证自定义标签
     *
     * 确保自定义标签的格式正确
     *
     * @param customTags - 自定义标签数组
     * @returns 是否验证通过
     *
     * 验证规则：
     * - 必须是数组
     * - 每个标签必须有 key 和 value 属性
     */
    validateTags(customTags?: TagOption[]): boolean {
      if (!customTags) {
        return false;
      }
      if (!Array.isArray(customTags)) {
        this.customOptions.customTags = undefined;
        console.warn('customTags error');
        return false;
      }
      let isValid = true;
      for (const tag of customTags) {
        if (!(tag && tag.key && tag.value)) {
          isValid = false;
        }
      }
      if (!isValid) {
        this.customOptions.customTags = undefined;
        console.warn('customTags error');
      }
      return isValid;
    },

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
     * - jsErrors: 必须是布尔值，否则使用 true
     * - apiErrors: 必须是布尔值，否则使用 true
     * - resourceErrors: 必须是布尔值，否则使用 true
     * - autoTracePerf: 必须是布尔值，否则使用 true
     * - useFmp: 必须是布尔值，否则使用 false
     * - enableSPA: 必须是布尔值，否则使用 false
     * - traceSDKInternal: 必须是布尔值，否则使用 false
     * - detailMode: 必须是布尔值，否则使用 true
     * - noTraceOrigins: 必须是数组，否则使用空数组
     * - traceTimeInterval: 必须是数字，否则使用 60000
     * - vue: 必须是函数，否则使用 undefined
     */
    validateOptions(): void {
      const {
        collector,
        service,
        pagePath,
        serviceVersion,
        jsErrors,
        apiErrors,
        resourceErrors,
        autoTracePerf,
        useFmp,
        enableSPA,
        traceSDKInternal,
        detailMode,
        noTraceOrigins,
        traceTimeInterval,
        vue,
      } = this.customOptions;

      this.validateTags(this.customOptions.customTags);

      if (typeof collector !== 'string') {
        this.customOptions.collector = typeof window !== 'undefined' ? window.location.origin : '';
      }
      if (typeof service !== 'string') {
        this.customOptions.service = '';
      }
      if (typeof pagePath !== 'string') {
        this.customOptions.pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
      }
      if (typeof serviceVersion !== 'string') {
        this.customOptions.serviceVersion = '';
      }
      if (typeof jsErrors !== 'boolean') {
        this.customOptions.jsErrors = true;
      }
      if (typeof apiErrors !== 'boolean') {
        this.customOptions.apiErrors = true;
      }
      if (typeof resourceErrors !== 'boolean') {
        this.customOptions.resourceErrors = true;
      }
      if (typeof autoTracePerf !== 'boolean') {
        this.customOptions.autoTracePerf = true;
      }
      if (typeof useFmp !== 'boolean') {
        this.customOptions.useFmp = false;
      }
      if (typeof enableSPA !== 'boolean') {
        this.customOptions.enableSPA = false;
      }
      if (typeof traceSDKInternal !== 'boolean') {
        this.customOptions.traceSDKInternal = false;
      }
      if (typeof detailMode !== 'boolean') {
        this.customOptions.detailMode = true;
      }
      if (!Array.isArray(noTraceOrigins)) {
        this.customOptions.noTraceOrigins = [];
      }
      if (typeof traceTimeInterval !== 'number') {
        this.customOptions.traceTimeInterval = 60000;
      }
      if (typeof vue !== 'function') {
        this.customOptions.vue = undefined;
      }
    },

    /**
     * 追踪性能
     *
     * 手动触发性能数据收集和上报
     *
     * @param configs - 性能追踪配置选项
     *
     * 使用场景：
     * - SPA 应用中手动追踪页面性能
     * - 在特定时机收集性能数据
     */
    performance(configs: PerformanceTrackingOptions): void {
      client.trackPerformance(configs);
    },
  };

  return legacyClient;
}
