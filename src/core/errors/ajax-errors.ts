import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

/**
 * 扩展 XMLHttpRequest 接口，添加 APM 追踪所需的属性
 */
interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _apmMethod?: string;
  _apmUrl?: string;
  _apmStartTime?: number;
}

/**
 * AJAX 错误追踪类
 *
 * 功能：
 * - 拦截 XMLHttpRequest 的 open 和 send 方法
 * - 监听 AJAX 请求的 error 和 timeout 事件
 * - 自动上报 AJAX 请求失败和超时错误
 *
 * 使用场景：
 * - 追踪 API 调用失败
 * - 监控网络请求超时
 * - 收集 AJAX 错误信息用于问题排查
 */
export class AjaxErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send | null = null;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  /**
   * 启用 AJAX 错误追踪
   *
   * 拦截 XMLHttpRequest 原型方法以监听所有 AJAX 请求
   */
  enable(): void {
    if (this.enabled) return;

    this.interceptXHR();
    this.enabled = true;
  }

  /**
   * 禁用 AJAX 错误追踪
   *
   * 恢复 XMLHttpRequest 原型方法，停止监听
   */
  disable(): void {
    if (!this.enabled) return;

    this.restoreXHR();
    this.enabled = false;
  }

  /**
   * 拦截 XMLHttpRequest 的 open 和 send 方法
   *
   * 实现原理：
   * 1. 保存原始的 open 和 send 方法
   * 2. 重写 open 方法：记录请求方法、URL 和开始时间
   * 3. 重写 send 方法：添加 error 和 timeout 事件监听器
   * 4. 在事件监听器中收集错误信息并上报
   */
  private interceptXHR(): void {
    this.originalXHROpen = XMLHttpRequest.prototype.open.bind(XMLHttpRequest.prototype);
    this.originalXHRSend = XMLHttpRequest.prototype.send.bind(XMLHttpRequest.prototype);

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      const xhr = this as ExtendedXMLHttpRequest;
      xhr._apmMethod = method;
      xhr._apmUrl = url.toString();
      xhr._apmStartTime = Date.now();
      return XMLHttpRequest.prototype.open.call(
        this,
        method,
        url,
        async ?? false,
        username,
        password
      );
    };

    XMLHttpRequest.prototype.send = function (
      this: ExtendedXMLHttpRequest,
      body?: XMLHttpRequestBodyInit | Document | null
    ) {
      const options = AjaxErrors.prototype['options'];
      const reportService = AjaxErrors.prototype['reportService'];

      this.addEventListener('error', () => {
        const errorInfo: ErrorInfo = {
          uniqueId: generateUUID(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: options.pagePath,
          category: 'AJAX_ERROR',
          grade: 'ERROR',
          errorUrl: this._apmUrl ?? window.location.href,
          message: `AJAX request failed: ${this._apmMethod ?? 'UNKNOWN'} ${this._apmUrl ?? ''}`,
          collector: options.collector,
          stack: undefined,
        };

        reportService.sendError(errorInfo);
      });

      this.addEventListener('timeout', () => {
        const errorInfo: ErrorInfo = {
          uniqueId: generateUUID(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: options.pagePath,
          category: 'AJAX_ERROR',
          grade: 'ERROR',
          errorUrl: this._apmUrl ?? window.location.href,
          message: `AJAX request timeout: ${this._apmMethod ?? 'UNKNOWN'} ${this._apmUrl ?? ''}`,
          collector: options.collector,
          stack: undefined,
        };

        reportService.sendError(errorInfo);
      });

      return XMLHttpRequest.prototype.send.call(this, body);
    };
  }

  /**
   * 恢复 XMLHttpRequest 原型方法
   *
   * 将 open 和 send 方法恢复到拦截前的状态
   */
  private restoreXHR(): void {
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
    }
    if (this.originalXHRSend) {
      XMLHttpRequest.prototype.send = this.originalXHRSend;
    }
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
