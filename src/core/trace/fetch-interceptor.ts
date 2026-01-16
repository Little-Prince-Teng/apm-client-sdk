import { TraceTrackingOptions, SegmentFields } from '../types';

export class FetchInterceptor {
  constructor(
    private options: TraceTrackingOptions,
    private segments: SegmentFields[]
  ) {}

  enable(): void {
    // TODO: Implement Fetch interception logic
  }

  disable(): void {
    // TODO: Implement Fetch cleanup logic
  }

  updateConfig(options: TraceTrackingOptions): void {
    this.options = options;
  }
}
