import { TraceTrackingOptions, SegmentFields } from '../types';

export class XHRInterceptor {
  constructor(
    private options: TraceTrackingOptions,
    private segments: SegmentFields[]
  ) {}

  enable(): void {
    // TODO: Implement XHR interception logic
  }

  disable(): void {
    // TODO: Implement XHR cleanup logic
  }

  updateConfig(options: TraceTrackingOptions): void {
    this.options = options;
  }
}
