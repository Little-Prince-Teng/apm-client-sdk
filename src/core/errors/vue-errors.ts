import { ErrorTrackingOptions, ErrorInfo, VueInstance } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

export class VueErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  enable(vue: VueInstance): void {
    if (this.enabled) return;

    if (vue && vue.config) {
      vue.config.errorHandler = (error: Error, vm: unknown, info: string) => {
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

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
