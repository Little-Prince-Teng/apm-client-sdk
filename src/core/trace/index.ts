import { TraceTrackingOptions, SegmentFields, TagOption } from '../types';
import { XHRInterceptor } from './xhr-interceptor';
import { FetchInterceptor } from './fetch-interceptor';
import { ReportService } from '../services/report';

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

  enable(options: TraceTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.xhrInterceptor.enable();
    this.fetchInterceptor.enable();
    this.setupReportTimer();
    this.setupUnloadHandler();
  }

  disable(): void {
    this.xhrInterceptor.disable();
    this.fetchInterceptor.disable();
    this.clearReportTimer();
  }

  private setupReportTimer(): void {
    if (this.timer != null) clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      if (this.segments.length > 0) {
        this.reportService.sendSegments([...this.segments]);
        this.segments.splice(0, this.segments.length);
      }
    }, this.options.traceTimeInterval ?? 60000);
  }

  private clearReportTimer(): void {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      if (this.segments.length > 0) {
        this.reportService.sendSegmentsByBeacon([...this.segments]);
      }
    });
  }

  setCustomTags(tags: TagOption[]): void {
    this.options.customTags = tags;
    this.xhrInterceptor.updateConfig(this.options);
    this.fetchInterceptor.updateConfig(this.options);
  }

  updateConfig(options: TraceTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.xhrInterceptor.updateConfig(this.options);
    this.fetchInterceptor.updateConfig(this.options);
  }
}
