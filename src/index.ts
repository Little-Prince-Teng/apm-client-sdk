import { createLegacyClient } from './core/legacy';
import { APMClient } from './core/monitor';
import {
  APMOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
  TraceTrackingOptions,
  TagOption,
} from './core/types';

/**
 * 创建遗留客户端实例
 *
 * 使用 createLegacyClient 函数创建一个遗留客户端实例
 * 该实例提供向后兼容的 API 接口
 */
const ClientMonitor = createLegacyClient();

/**
 * 将 ClientMonitor 挂载到 window 对象
 *
 * 在浏览器环境中，将 ClientMonitor 挂载到 window 对象上
 * 这样可以在任何地方通过 window.ClientMonitor 访问 APM 客户端
 *
 * 使用场景：
 * - 在全局范围内访问 APM 客户端
 * - 在不使用模块系统的环境中使用 APM
 *
 * 使用示例：
 * ```typescript
 * // 在任何地方访问 APM 客户端
 * window.ClientMonitor.register({
 *   collector: 'https://collector.example.com',
 *   service: 'my-app',
 * });
 * ```
 */
if (typeof window !== 'undefined') {
  (window as any).ClientMonitor = ClientMonitor;
}

/**
 * 默认导出 ClientMonitor
 *
 * 导出遗留客户端实例，用于向后兼容
 *
 * 使用示例：
 * ```typescript
 * import ClientMonitor from '@power/apm-client-js';
 *
 * ClientMonitor.register({
 *   collector: 'https://collector.example.com',
 *   service: 'my-app',
 *   jsErrors: true,
 *   apiErrors: true,
 * });
 * ```
 */
export default ClientMonitor;

/**
 * 导出 APMClient 类
 *
 * 新版 APM 客户端类，推荐使用
 *
 * 使用示例：
 * ```typescript
 * import { APMClient } from '@power/apm-client-js';
 *
 * const apm = new APMClient();
 * apm.init({
 *   collector: 'https://collector.example.com',
 *   service: 'my-app',
 *   jsErrors: true,
 *   apiErrors: true,
 * });
 * ```
 */
export { APMClient };

/**
 * 导出类型定义
 *
 * 导出 APM 相关的类型定义，用于类型检查
 *
 * 类型说明：
 * - APMOptions: 基础 APM 配置选项
 * - ErrorTrackingOptions: 错误追踪配置选项
 * - PerformanceTrackingOptions: 性能追踪配置选项
 * - TraceTrackingOptions: 链路追踪配置选项
 * - TagOption: 自定义标签选项
 *
 * 使用示例：
 * ```typescript
 * import type { APMOptions, ErrorTrackingOptions } from '@power/apm-client-js';
 *
 * const options: APMOptions & ErrorTrackingOptions = {
 *   collector: 'https://collector.example.com',
 *   service: 'my-app',
 *   jsErrors: true,
 *   apiErrors: true,
 * };
 * ```
 */
export type {
  APMOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
  TraceTrackingOptions,
  TagOption,
};
