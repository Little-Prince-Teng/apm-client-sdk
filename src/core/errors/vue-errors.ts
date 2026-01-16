import { ErrorTrackingOptions, ErrorInfo, VueInstance } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

/**
 * Vue 错误追踪类
 *
 * 功能：
 * - 集成到 Vue 的全局错误处理器
 * - 自动上报 Vue 组件中的错误到收集器
 *
 * 使用场景：
 * - 追踪 Vue 组件生命周期错误
 * - 追踪模板渲染错误
 * - 追踪事件处理器错误
 * - 收集 Vue 错误信息用于问题排查
 *
 * 注意：
 * - 需要在 Vue 应用初始化后调用 enable 方法
 * - 会覆盖 Vue.config.errorHandler
 * - 只捕获 Vue 组件内部的错误
 */
export class VueErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  /**
   * 启用 Vue 错误追踪
   *
   * 设置 Vue 的全局错误处理器（Vue.config.errorHandler）
   *
   * @param vue - Vue 实例（Vue 2 或 Vue 3）
   *
   * 使用示例：
   * ```typescript
   * import { createApp } from 'vue';
   * import { apm } from '@power/apm-client-js';
   *
   * const app = createApp(App);
   * apm.init({ vue: app });
   * ```
   */
  enable(vue: VueInstance): void {
    if (this.enabled) return;

    if (vue && vue.config) {
      vue.config.errorHandler = (error: Error, _vm: unknown, info: string) => {
        const errorInfo: ErrorInfo = {
          uniqueId: generateUUID(),
          service: this.options.service,
          serviceVersion: this.options.serviceVersion,
          pagePath: this.options.pagePath,
          category: 'VUE_ERROR',
          grade: 'ERROR',
          errorUrl: window.location.href,
          message: info,
          collector: this.options.collector,
          stack: error.stack,
        };

        this.reportService.sendError(errorInfo);
      };
    }

    this.enabled = true;
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
