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
