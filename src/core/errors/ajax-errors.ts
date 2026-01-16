import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

export class AjaxErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  enable(): void {
    if (this.enabled) return;
    
    this.interceptXHR();
    this.interceptFetch();
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  private interceptXHR(): void {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(...args) {
      (this as any)._method = args[0];
      (this as any)._url = args[1];
      return originalOpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener('load', () => {
        if (this.status >= 400) {
          const errorInfo: ErrorInfo = {
            uniqueId: generateUUID(),
            service: 'apm-client',
            serviceVersion: '1.0.0',
            pagePath: window.location.pathname,
            category: 'AJAX_ERROR',
            grade: 'ERROR',
            errorUrl: (this as any)._url || '',
            message: `Status: ${this.status}`,
            collector: 'http://localhost:12800'
          };
          new ReportService().sendError(errorInfo);
        }
      });
      return originalSend.apply(this, args);
    };
  }

  private interceptFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status >= 400) {
        const errorInfo: ErrorInfo = {
          uniqueId: generateUUID(),
          service: 'apm-client',
          serviceVersion: '1.0.0',
          pagePath: window.location.pathname,
          category: 'AJAX_ERROR',
          grade: 'ERROR',
          errorUrl: response.url,
          message: `Status: ${response.status}`,
          collector: 'http://localhost:12800'
        };
        new ReportService().sendError(errorInfo);
      }
      
      return response;
    };
  }

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
