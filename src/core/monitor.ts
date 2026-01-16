import { APMOptions, ErrorTrackingOptions, PerformanceTrackingOptions, TraceTrackingOptions, TagOption, ErrorInfo } from './types';
import { ErrorTracker } from './errors';
import { PerformanceTracker } from './performance';
import { TraceTracker } from './trace';

export class APMClient {
  private options: APMOptions;
  private errorTracker: ErrorTracker;
  private performanceTracker: PerformanceTracker;
  private traceTracker: TraceTracker;

  constructor(options?: Partial<APMOptions>) {
    this.options = {
      collector: typeof window !== 'undefined' ? window.location.origin : '',
      service: '',
      serviceVersion: '',
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      ...options
    };
    
    this.errorTracker = new ErrorTracker(this.options);
    this.performanceTracker = new PerformanceTracker(this.options);
    this.traceTracker = new TraceTracker(this.options);
  }

  init(options: APMOptions & ErrorTrackingOptions & PerformanceTrackingOptions & TraceTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.validateOptions();
    
    if (options.jsErrors || options.apiErrors || options.resourceErrors) {
      this.errorTracker.enable(options);
    }
    
    if (options.autoTracePerf && !options.enableSPA) {
      this.performanceTracker.track();
    }
    
    this.traceTracker.enable(options);
  }

  updateConfig(options: Partial<APMOptions>): void {
    this.options = { ...this.options, ...options };
    this.errorTracker.updateConfig(this.options);
    this.performanceTracker.updateConfig(this.options);
    this.traceTracker.updateConfig(this.options);
  }

  captureError(error: Error, context?: Partial<ErrorInfo>): void {
    this.errorTracker.capture(error, context);
  }

  trackPerformance(options?: Partial<PerformanceTrackingOptions>): void {
    if (options) {
      this.updateConfig(options);
    }
    this.performanceTracker.track();
  }

  setCustomTags(tags: TagOption[]): void {
    if (this.validateTags(tags)) {
      this.traceTracker.setCustomTags(tags);
    }
  }

  private validateOptions(): void {
    const { collector, service, pagePath, serviceVersion } = this.options;
    
    if (typeof collector !== 'string') {
      this.options.collector = typeof window !== 'undefined' ? window.location.origin : '';
    }
    if (typeof service !== 'string') {
      this.options.service = '';
    }
    if (typeof pagePath !== 'string') {
      this.options.pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
    }
    if (typeof serviceVersion !== 'string') {
      this.options.serviceVersion = '';
    }
  }

  private validateTags(tags?: TagOption[]): boolean {
    if (!tags) {
      return false;
    }
    if (!Array.isArray(tags)) {
      console.error('customTags must be an array');
      return false;
    }
    const isValid = tags.every(tag => tag && typeof tag.key === 'string' && typeof tag.value === 'string');
    if (!isValid) {
      console.error('customTags format error');
    }
    return isValid;
  }

  getOptions(): Readonly<APMOptions> {
    return this.options;
  }
}
