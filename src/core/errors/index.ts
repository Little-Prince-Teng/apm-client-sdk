import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { JSErrors } from './js-errors';
import { PromiseErrors } from './promise-errors';
import { AjaxErrors } from './ajax-errors';
import { ResourceErrors } from './resource-errors';
import { VueErrors } from './vue-errors';

/**
 * 错误追踪统一管理类
 *
 * 功能：
 * - 统一管理所有类型的错误追踪器
 * - 根据配置启用/禁用不同的错误追踪
 * - 提供统一的错误捕获接口
 * - 支持动态更新配置
 *
 * 管理的错误类型：
 * - JavaScript 错误（JSErrors）
 * - Promise 错误（PromiseErrors）
 * - AJAX 请求错误（AjaxErrors）
 * - 资源加载错误（ResourceErrors）
 * - Vue 组件错误（VueErrors）
 *
 * 使用场景：
 * - 统一配置和管理所有错误追踪
 * - 根据需要启用/禁用特定类型的错误追踪
 * - 提供统一的错误捕获接口
 */
export class ErrorTracker {
  private options: ErrorTrackingOptions;
  private jsErrors: JSErrors;
  private promiseErrors: PromiseErrors;
  private ajaxErrors: AjaxErrors;
  private resourceErrors: ResourceErrors;
  private vueErrors: VueErrors;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.jsErrors = new JSErrors(options);
    this.promiseErrors = new PromiseErrors(options);
    this.ajaxErrors = new AjaxErrors(options);
    this.resourceErrors = new ResourceErrors(options);
    this.vueErrors = new VueErrors(options);
  }

  /**
   * 启用错误追踪
   *
   * 根据配置启用不同类型的错误追踪：
   * - jsErrors: 启用 JavaScript 和 Promise 错误追踪
   * - apiErrors: 启用 AJAX 请求错误追踪
   * - resourceErrors: 启用资源加载错误追踪
   * - vue: 启用 Vue 组件错误追踪（需要提供 Vue 实例）
   *
   * @param options - 错误追踪配置选项
   */
  enable(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };

    if (options.jsErrors ?? false) {
      this.jsErrors.enable();
      this.promiseErrors.enable();
      if (options.vue) {
        this.vueErrors.enable(options.vue);
      }
    }

    if (options.apiErrors ?? false) {
      this.ajaxErrors.enable();
    }

    if (options.resourceErrors ?? false) {
      this.resourceErrors.enable();
    }
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
  capture(error: Error, context?: Partial<ErrorInfo>): void {
    this.jsErrors.capture(error, context);
  }

  /**
   * 更新配置
   *
   * 更新所有错误追踪器的配置
   *
   * @param options - 新的错误追踪配置选项
   */
  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.jsErrors.updateConfig(options);
    this.promiseErrors.updateConfig(options);
    this.ajaxErrors.updateConfig(options);
    this.resourceErrors.updateConfig(options);
    this.vueErrors.updateConfig(options);
  }
}
