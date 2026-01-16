import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

/**
 * Promise 错误追踪类
 *
 * 功能：
 * - 监听全局 unhandledrejection 事件捕获未处理的 Promise 拒绝
 * - 自动上报 Promise 拒绝错误到收集器
 *
 * 使用场景：
 * - 追踪未处理的 Promise 错误
 * - 捕获 async/await 中未捕获的异常
 * - 收集 Promise 错误信息用于问题排查
 *
 * 注意：
 * - 只捕获未处理的 Promise 拒绝
 * - 已被 catch 的 Promise 错误不会触发
 */
export class PromiseErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  /**
   * 启用 Promise 错误追踪
   *
   * 监听全局 unhandledrejection 事件，自动捕获未处理的 Promise 拒绝
   */
  enable(): void {
    if (this.enabled) return;

    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    this.enabled = true;
  }

  /**
   * 禁用 Promise 错误追踪
   *
   * 移除 unhandledrejection 事件监听器
   */
  disable(): void {
    window.removeEventListener('unhandledrejection', this.handleRejection.bind(this));
    this.enabled = false;
  }

  /**
   * 处理未处理的 Promise 拒绝事件
   *
   * 当 Promise 被 reject 且没有对应的 catch 处理时触发
   * 收集错误信息包括：
   * - 拒绝原因（reason）
   * - 错误消息
   * - 错误堆栈
   * - 服务信息和页面路径
   */
  private handleRejection(event: PromiseRejectionEvent): void {
    const errorInfo: ErrorInfo = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      category: 'PROMISE_ERROR',
      grade: 'ERROR',
      errorUrl: window.location.href,
      message: event.reason?.message || 'Unhandled Promise Rejection',
      collector: this.options.collector,
      stack: event.reason?.stack,
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
