import { TraceTrackingOptions, SegmentFields } from '../types';

export class FetchInterceptor {
  constructor(private options: TraceTrackingOptions, private segments: SegmentFields[]) {}
  
  enable(): void {}
  
  disable(): void {}
  
  updateConfig(options: TraceTrackingOptions): void {
    this.options = options;
  }
}
