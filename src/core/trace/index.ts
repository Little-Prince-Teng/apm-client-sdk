import { TraceTrackingOptions, SegmentFields, TagOption } from '../types';
import { XHRInterceptor } from './xhr-interceptor';
import { FetchInterceptor } from './fetch-interceptor';
import { ReportService } from '../services/report';

/**
 * 链路追踪统一管理类
 *
 * 功能：
 * - 统一管理 HTTP 请求的链路追踪
 * - 定时上报链路数据到收集器
 * - 支持自定义标签
 * - 页面卸载时使用 Beacon API 上报
 *
 * 管理的拦截器：
 * - XHRInterceptor：拦截 XMLHttpRequest 请求
 * - FetchInterceptor：拦截 Fetch API 请求
 *
 * 上报策略：
 * - 定时上报：按照配置的时间间隔批量上报
 * - 页面卸载上报：使用 Beacon API 确保数据不丢失
 *
 * 使用场景：
 * - 追踪所有 HTTP 请求的链路信息
 * - 监控 API 调用性能
 * - 收集请求链路数据用于问题排查
 */
export class TraceTracker {
  private options: TraceTrackingOptions;
  private segments: SegmentFields[] = [];
  private xhrInterceptor: XHRInterceptor;
  private fetchInterceptor: FetchInterceptor;
  private reportService: ReportService;
  private timer: number | null = null;

  constructor(options: TraceTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
    this.xhrInterceptor = new XHRInterceptor();
    this.fetchInterceptor = new FetchInterceptor();
  }

  /**
   * 启用链路追踪
   *
   * 启用 XHR 和 Fetch 拦截器
   * 设置定时上报任务
   * 设置页面卸载处理器
   *
   * @param options - 链路追踪配置选项
   */
  enable(options: TraceTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.xhrInterceptor.enable();
    this.fetchInterceptor.enable();
    this.setupReportTimer();
    this.setupUnloadHandler();
  }

  /**
   * 禁用链路追踪
   *
   * 禁用 XHR 和 Fetch 拦截器
   * 清除定时上报任务
   */
  disable(): void {
    this.xhrInterceptor.disable();
    this.fetchInterceptor.disable();
    this.clearReportTimer();
  }

  /**
   * 设置定时上报任务
   *
   * 按照配置的时间间隔定期上报链路数据
   * 默认间隔：60 秒（60000 毫秒）
   *
   * 上报逻辑：
   * 1. 检查是否有待上报的链路数据
   * 2. 如果有，批量上报到收集器
   * 3. 清空已上报的链路数据
   */
  private setupReportTimer(): void {
    if (this.timer != null) clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      if (this.segments.length > 0) {
        this.reportService.sendSegments([...this.segments]);
        this.segments.splice(0, this.segments.length);
      }
    }, this.options.traceTimeInterval ?? 60000);
  }

  /**
   * 清除定时上报任务
   *
   * 停止定时上报并清理定时器
   */
  private clearReportTimer(): void {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 设置页面卸载处理器
   *
   * 使用 Beacon API 在页面卸载时上报链路数据
   * Beacon API 优势：
   * - 异步发送，不阻塞页面卸载
   * - 即使页面关闭也能发送数据
   * - 不受跨域限制
   */
  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      if (this.segments.length > 0) {
        this.reportService.sendSegmentsByBeacon([...this.segments]);
      }
    });
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
    this.options.customTags = tags;
    this.xhrInterceptor.updateConfig(this.options);
    this.fetchInterceptor.updateConfig(this.options);
  }

  /**
   * 更新配置
   *
   * 更新链路追踪配置并同步到拦截器
   *
   * @param options - 新的链路追踪配置选项
   */
  updateConfig(options: TraceTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.xhrInterceptor.updateConfig(this.options);
    this.fetchInterceptor.updateConfig(this.options);
  }
}
