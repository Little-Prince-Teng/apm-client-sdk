import { PerformanceTrackingOptions, PerformanceData } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

export class PerformanceTracker {
  private options: PerformanceTrackingOptions;
  private reportService: ReportService;

  constructor(options: PerformanceTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  track(): void {
    if (document.readyState === 'complete') {
      this.collectAndReport();
    } else {
      window.addEventListener('load', () => this.collectAndReport(), { once: true });
    }
  }

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

  private calculateFMP(): number {
    return 0;
  }

  updateConfig(options: PerformanceTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
