import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

export class PromiseErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  enable(): void {
    if (this.enabled) return;

    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    this.enabled = true;
  }

  disable(): void {
    window.removeEventListener('unhandledrejection', this.handleRejection.bind(this));
    this.enabled = false;
  }

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

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
