import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

/**
 * 资源加载错误追踪类
 *
 * 功能：
 * - 监听资源加载失败事件（script、link、image 等）
 * - 自动上报资源加载错误到收集器
 *
 * 使用场景：
 * - 追踪脚本加载失败
 * - 追踪样式表加载失败
 * - 追踪图片加载失败
 * - 收集资源错误信息用于问题排查
 *
 * 注意：
 * - 使用 capture phase 监听器以捕获资源加载错误
 * - 只追踪特定类型的资源元素（script、link、image）
 */
export class ResourceErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  /**
   * 启用资源错误追踪
   *
   * 监听全局 error 事件，使用 capture phase 以捕获资源加载错误
   */
  enable(): void {
    if (this.enabled) return;

    window.addEventListener('error', this.handleError.bind(this), true);
    this.enabled = true;
  }

  /**
   * 禁用资源错误追踪
   *
   * 移除 error 事件监听器
   */
  disable(): void {
    window.removeEventListener('error', this.handleError.bind(this), true);
    this.enabled = false;
  }

  /**
   * 处理资源加载错误事件
   *
   * 当资源加载失败时触发
   * 支持的资源类型：
   * - HTMLScriptElement（<script> 标签）
   * - HTMLLinkElement（<link> 标签，通常用于样式表）
   * - HTMLImageElement（<img> 标签）
   *
   * 收集错误信息包括：
   * - 资源 URL
   * - 资源类型
   * - 服务信息和页面路径
   */
  private handleError(event: Event): void {
    const target = event.target as HTMLElement;

    if (target instanceof HTMLScriptElement) {
      const errorInfo: ErrorInfo = {
        uniqueId: generateUUID(),
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        category: 'RESOURCE_ERROR',
        grade: 'ERROR',
        errorUrl: target.src || window.location.href,
        message: `Resource load error: ${target.tagName}`,
        collector: this.options.collector,
      };

      this.reportService.sendError(errorInfo);
    } else if (target instanceof HTMLLinkElement) {
      const errorInfo: ErrorInfo = {
        uniqueId: generateUUID(),
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        category: 'RESOURCE_ERROR',
        grade: 'ERROR',
        errorUrl: target.href || window.location.href,
        message: `Resource load error: ${target.tagName}`,
        collector: this.options.collector,
      };

      this.reportService.sendError(errorInfo);
    } else if (target instanceof HTMLImageElement) {
      const errorInfo: ErrorInfo = {
        uniqueId: generateUUID(),
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        category: 'RESOURCE_ERROR',
        grade: 'ERROR',
        errorUrl: target.src || window.location.href,
        message: `Resource load error: ${target.tagName}`,
        collector: this.options.collector,
      };

      this.reportService.sendError(errorInfo);
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
