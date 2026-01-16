import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

interface XHRWithMetadata extends XMLHttpRequest {
  _method?: string;
  _url?: string;
}

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
    const reportService = this.reportService;

    XMLHttpRequest.prototype.open = function (
      this: XHRWithMetadata,
      method: string,
      url: string | URL,
      async: boolean = true,
      user: string | null = null,
      password: string | null = null
    ): void {
      this._method = method;
      this._url = url.toString();
      originalOpen.call(this, method, url, async, user, password);
    };

    XMLHttpRequest.prototype.send = function (
      this: XHRWithMetadata,
      body?: Document | XMLHttpRequestBodyInit | null
    ): void {
      this.addEventListener('load', () => {
        if (this.status >= 400) {
          const errorInfo: ErrorInfo = {
            uniqueId: generateUUID(),
            service: 'apm-client',
            serviceVersion: '1.0.0',
            pagePath: window.location.pathname,
            category: 'AJAX_ERROR',
            grade: 'ERROR',
            errorUrl: this._url || '',
            message: `Status: ${this.status}`,
            collector: 'http://localhost:12800',
          };
          reportService.sendError(errorInfo);
        }
      });
      originalSend.call(this, body);
    };
  }

  private interceptFetch(): void {
    const originalFetch = window.fetch;
    const reportService = this.reportService;

    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const response = await originalFetch.call(window, input, init);

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
          collector: 'http://localhost:12800',
        };
        reportService.sendError(errorInfo);
      }

      return response;
    };
  }

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
