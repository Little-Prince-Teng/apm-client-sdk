export interface CustomOptionsType extends CustomReportOptions {
  jsErrors?: boolean;
  apiErrors?: boolean;
  resourceErrors?: boolean;
  autoTracePerf?: boolean;
  useFmp?: boolean;
  enableSPA?: boolean;
  vue?: any;
  traceSDKInternal?: boolean;
  detailMode?: boolean;
  noTraceOrigins?: (string | RegExp)[];
  traceTimeInterval?: number;
  customTags?: TagOption[];
  loginUser?: (() => string) | string;
  /**
   * 原生 fetch 引用，供 MicroApp 等沙箱场景覆盖使用
   */
  customFetch?: typeof fetch;
}

export interface CustomReportOptions {
  collector?: string;
  service: string;
  pagePath: string;
  serviceVersion: string;
}

export type TagOption = {
  key: string;
  value: string;
};


export interface ICalScore {
  dpss: ICalScore[];
  st: number;
  els: ElementList;
  root?: Element;
}
export type ElementList = Array<{
  ele: Element;
  st: number;
  weight: number;
}>;
export type IPerfDetail = {
  redirectTime: number | undefined; // Time of redirection
  dnsTime: number | undefined; // DNS query time
  ttfbTime: number | undefined; // Time to First Byte
  tcpTime: number | undefined; // Tcp connection time
  transTime: number | undefined; // Content transfer time
  domAnalysisTime: number | undefined; // Dom parsing time
  fptTime: number | undefined; // First Paint Time or Blank Screen Time
  domReadyTime: number | undefined; // Dom ready time
  loadPageTime: number | undefined; // Page full load time
  resTime: number | undefined; // Synchronous load resources in the page
  sslTime: number | undefined; // Only valid for HTTPS
  ttlTime: number | undefined; // Time to interact
  firstPackTime: number | undefined; // first pack time
  fmpTime: number | undefined; // First Meaningful Paint
};



export interface ErrorInfoFields {
  uniqueId: string;
  category: string;
  grade: string;
  message: any;
  errorUrl: string;
  line?: number;
  col?: number;
  stack?: string;
  firstReportedError?: boolean;
}

export interface ReportFields {
  service: string;
  serviceVersion: string;
  pagePath: string;
}



export interface SegmentFields {
  traceId: string;
  service: string;
  spans: SpanFields[];
  serviceInstance: string;
  traceSegmentId: string;
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
  componentId: number;
  peer: string;
  tags?: any;
}
