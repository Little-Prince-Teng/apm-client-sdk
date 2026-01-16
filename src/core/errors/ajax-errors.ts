import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { generateUUID } from '../../utils/uuid';
import { ReportService } from '../services/report';

interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _apmMethod?: string;
  _apmUrl?: string;
  _apmStartTime?: number;
}

export class AjaxErrors {
  private options: ErrorTrackingOptions;
  private reportService: ReportService;
  private enabled: boolean = false;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send | null = null;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.reportService = new ReportService();
  }

  enable(): void {
    if (this.enabled) return;

    this.interceptXHR();
    this.enabled = true;
  }

  disable(): void {
    if (!this.enabled) return;

    this.restoreXHR();
    this.enabled = false;
  }

  private interceptXHR(): void {
    const self = this;

    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      const xhr = this as ExtendedXMLHttpRequest;
      xhr._apmMethod = method;
      xhr._apmUrl = url.toString();
      xhr._apmStartTime = Date.now();
      return self.originalXHROpen!.call(this, method, url, async ?? false, username, password);
    };

    XMLHttpRequest.prototype.send = function(body?: XMLHttpRequestBodyInit | Document | null) {
      const xhr = this as ExtendedXMLHttpRequest;

      xhr.addEventListener('error', function() {
        const errorInfo: ErrorInfo = {
          uniqueId: generateUUID(),
          service: self.options.service,
          serviceVersion: self.options.serviceVersion,
          pagePath: self.options.pagePath,
          category: 'AJAX_ERROR',
          grade: 'ERROR',
          errorUrl: xhr._apmUrl || window.location.href,
          message: `AJAX request failed: ${xhr._apmMethod} ${xhr._apmUrl}`,
          collector: self.options.collector,
          stack: undefined,
        };

        self.reportService.sendError(errorInfo);
      });

      xhr.addEventListener('timeout', function() {
        const errorInfo: ErrorInfo = {
          uniqueId: generateUUID(),
          service: self.options.service,
          serviceVersion: self.options.serviceVersion,
          pagePath: self.options.pagePath,
          category: 'AJAX_ERROR',
          grade: 'ERROR',
          errorUrl: xhr._apmUrl || window.location.href,
          message: `AJAX request timeout: ${xhr._apmMethod} ${xhr._apmUrl}`,
          collector: self.options.collector,
          stack: undefined,
        };

        self.reportService.sendError(errorInfo);
      });

      return self.originalXHRSend!.call(this, body);
    };
  }

  private restoreXHR(): void {
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
    }
    if (this.originalXHRSend) {
      XMLHttpRequest.prototype.send = this.originalXHRSend;
    }
  }

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
  }
}
