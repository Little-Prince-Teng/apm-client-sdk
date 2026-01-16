import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

export class JSErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  enable(): void {
    if (this.enabled) return;

    window.addEventListener('error', this.handleError.bind(this));
    this.enabled = true;
  }

  disable(): void {
    window.removeEventListener('error', this.handleError.bind(this));
    this.enabled = false;
  }

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

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
