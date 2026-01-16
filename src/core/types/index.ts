export interface APMOptions {
  collector: string;
  service: string;
  serviceVersion: string;
  pagePath: string;
  loginUser?: string | (() => string);
  customFetch?: typeof fetch;
}

export interface VueInstance {
  config: {
    errorHandler: (error: Error, vm: unknown, info: string) => void;
  };
}

export interface ErrorTrackingOptions extends APMOptions {
  jsErrors?: boolean;
  apiErrors?: boolean;
  resourceErrors?: boolean;
  vue?: VueInstance;
}

export interface PerformanceTrackingOptions extends APMOptions {
  autoTracePerf?: boolean;
  useFmp?: boolean;
  enableSPA?: boolean;
}

export interface TraceTrackingOptions extends APMOptions {
  traceSDKInternal?: boolean;
  detailMode?: boolean;
  noTraceOrigins?: (string | RegExp)[];
  traceTimeInterval?: number;
  customTags?: TagOption[];
}

export interface TagOption {
  key: string;
  value: string;
}

export interface ErrorInfo {
  uniqueId: string;
  service: string;
  serviceVersion: string;
  pagePath: string;
  category: string;
  grade: string;
  errorUrl: string;
  message: string;
  collector: string;
  stack?: string;
  tags?: TagOption[];
  context?: Record<string, unknown>;
}

export interface PerformanceData {
  uniqueId: string;
  service: string;
  serviceVersion: string;
  pagePath: string;
  collector: string;
  timing: PerformanceTiming;
  fmpTime?: number;
}

export interface SpanFields {
  operationName: string;
  startTime: number;
  endTime: number;
  spanId: number;
  spanLayer: string;
  spanType: string;
  isError: boolean;
  parentSpanId: number;
  componentId: string;
  peer: string;
  tags?: TagOption[];
}

export interface SegmentFields {
  traceId: string;
  service: string;
  spans: SpanFields[];
  serviceInstance: string;
  traceSegmentId: string;
  loginUser?: string;
}
