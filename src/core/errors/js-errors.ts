import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

/**
 * JavaScript 错误追踪类
 *
 * 功能：
 * - 监听全局 window.onerror 事件捕获未捕获的 JavaScript 错误
 * - 提供手动捕获错误的方法（capture）
 * - 自动上报错误信息到收集器
 *
 * 使用场景：
 * - 追踪未捕获的 JavaScript 运行时错误
 * - 手动上报特定错误（如 try-catch 中的错误）
 * - 收集错误堆栈信息用于问题排查
 */
export class JSErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  /**
   * 启用 JavaScript 错误追踪
   *
   * 监听全局 window.onerror 事件，自动捕获未处理的错误
   */
  enable(): void {
    if (this.enabled) return;

    window.addEventListener('error', this.handleError.bind(this));
    this.enabled = true;
  }

  /**
   * 禁用 JavaScript 错误追踪
   *
   * 移除 window.onerror 事件监听器
   */
  disable(): void {
    window.removeEventListener('error', this.handleError.bind(this));
    this.enabled = false;
  }

  /**
   * 处理全局错误事件
   *
   * 当 JavaScript 运行时发生未捕获的错误时触发
   * 收集错误信息包括：
   * - 错误消息
   * - 错误文件名
   * - 错误堆栈
   * - 服务信息和页面路径
   */
  private handleError(event: ErrorEvent): void {
    const errorInfo: ErrorInfo = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      category: 'JS_ERROR',
      grade: 'ERROR',
      errorUrl: event.filename || window.location.href,
      message: event.message,
      collector: this.options.collector,
      stack: event.error?.stack,
    };

    this.reportService.sendError(errorInfo);
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
    const errorInfo: ErrorInfo = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      category: 'JS_ERROR',
      grade: 'ERROR',
      errorUrl: window.location.href,
      message: error.message,
      collector: this.options.collector,
      stack: error.stack,
      ...context,
    };

    this.reportService.sendError(errorInfo);
  }

  /**
   * 更新配置
   *
   * 合并新配置到现有配置中
   */
  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
