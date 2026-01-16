import { PerformanceTrackingOptions, PerformanceData } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

/**
 * 性能追踪类
 *
 * 功能：
 * - 收集页面性能指标
 * - 计算首次有意义绘制（FMP）时间
 * - 自动上报性能数据到收集器
 *
 * 收集的性能指标：
 * - 页面加载时间（performance.timing）
 * - 首次有意义绘制时间（FMP）
 * - DOM 加载时间
 * - 资源加载时间
 *
 * 使用场景：
 * - 监控页面加载性能
 * - 追踪用户体验指标
 * - 收集性能数据用于优化
 *
 * 注意：
 * - 需要在页面加载完成后调用 track 方法
 * - FMP 计算需要自定义实现
 * - 使用 performance.timing API 获取性能数据
 */
export class PerformanceTracker {
  private options: PerformanceTrackingOptions;
  private reportService: ReportService;

  constructor(options: PerformanceTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  /**
   * 追踪性能数据
   *
   * 根据页面加载状态决定立即收集或等待加载完成
   *
   * 逻辑：
   * 1. 如果页面已加载完成（readyState === 'complete'），立即收集
   * 2. 否则，等待 load 事件触发后收集
   * 3. 收集完成后上报性能数据
   */
  track(): void {
    if (document.readyState === 'complete') {
      this.collectAndReport();
    } else {
      window.addEventListener('load', () => this.collectAndReport(), { once: true });
    }
  }

  /**
   * 收集并上报性能数据
   *
   * 收集性能指标并上报到收集器
   *
   * 收集的数据：
   * - 基础性能数据：service、pagePath、collector 等
   * - 性能时间：performance.timing 对象
   * - FMP 时间：如果启用 useFMP 选项
   *
   * 注意：
   * - 只在 autoTracePerf 为 true 时才收集
   * - FMP 计算需要自定义实现
   */
  private collectAndReport(): void {
    if (!(this.options.autoTracePerf ?? false)) return;

    const performanceData: PerformanceData = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      collector: this.options.collector,
      timing: performance.timing,
    };

    if (this.options.useFmp ?? false) {
      performanceData.fmpTime = this.calculateFMP();
    }

    this.reportService.sendPerformance(performanceData);
  }

  /**
   * 计算首次有意义绘制（FMP）时间
   *
   * TODO: 实现真实的 FMP 计算逻辑
   *
   * FMP 计算方法：
   * 1. 监听 DOM 变化
   * 2. 计算每个时间点的 DOM 变化量
   * 3. 找到 DOM 变化量最大的时间点
   * 4. 返回该时间点作为 FMP
   *
   * @returns FMP 时间（毫秒），当前返回 0 作为占位符
   */
  private calculateFMP(): number {
    return 0;
  }

  /**
   * 更新配置
   *
   * 合并新配置到现有配置中
   *
   * @param options - 新的性能追踪配置选项
   */
  updateConfig(options: PerformanceTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
