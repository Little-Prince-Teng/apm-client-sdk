import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

export class ResourceErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  enable(): void {
    if (this.enabled) return;

    window.addEventListener('error', this.handleError.bind(this), true);
    this.enabled = true;
  }

  disable(): void {
    window.removeEventListener('error', this.handleError.bind(this), true);
    this.enabled = false;
  }

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

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
