export interface CustomOptionsType extends CustomReportOptions {
  jsErrors?: boolean;
  apiErrors?: boolean;
  resourceErrors?: boolean;
  autoTracePerf?: boolean;
  useFmp?: boolean;
  enableSPA?: boolean;
  vue?: unknown;
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
