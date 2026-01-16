export declare class APMClient {
    private options;
    private errorTracker;
    private performanceTracker;
    private traceTracker;
    constructor(options?: Partial<APMOptions>);
    init(options: APMOptions & ErrorTrackingOptions & PerformanceTrackingOptions & TraceTrackingOptions): void;
    updateConfig(options: Partial<APMOptions>): void;
    captureError(error: Error, context?: Partial<ErrorInfo>): void;
    trackPerformance(options?: Partial<PerformanceTrackingOptions>): void;
    setCustomTags(tags: TagOption[]): void;
    private validateOptions;
    private validateTags;
    getOptions(): Readonly<APMOptions>;
}

export declare interface APMOptions {
    collector: string;
    service: string;
    serviceVersion: string;
    pagePath: string;
    loginUser?: string | (() => string);
    customFetch?: typeof fetch;
}

declare const ClientMonitor: {
    customOptions: LegacyOptions;
    register(configs: LegacyOptions): void;
    setPerformance(configs: PerformanceTrackingOptions): void;
    catchErrors(options: ErrorTrackingOptions): void;
    reportFrameErrors(configs: APMOptions, error: Error): void;
    setCustomTags(tags: TagOption[]): void;
    validateTags(customTags?: TagOption[]): boolean;
    validateOptions(): void;
    performance(configs: PerformanceTrackingOptions): void;
};
export default ClientMonitor;

declare interface ErrorInfo {
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

export declare interface ErrorTrackingOptions extends APMOptions {
    jsErrors?: boolean;
    apiErrors?: boolean;
    resourceErrors?: boolean;
    vue?: VueInstance;
}

declare interface LegacyOptions extends APMOptions, ErrorTrackingOptions, PerformanceTrackingOptions, TraceTrackingOptions {
    vue?: VueInstance;
}

export declare interface PerformanceTrackingOptions extends APMOptions {
    autoTracePerf?: boolean;
    useFmp?: boolean;
    enableSPA?: boolean;
}

export declare interface TagOption {
    key: string;
    value: string;
}

export declare interface TraceTrackingOptions extends APMOptions {
    traceSDKInternal?: boolean;
    detailMode?: boolean;
    noTraceOrigins?: (string | RegExp)[];
    traceTimeInterval?: number;
    customTags?: TagOption[];
}

declare interface VueInstance {
    config: {
        errorHandler: (error: Error, vm: unknown, info: string) => void;
    };
}

export { }


declare global {
    interface Window {
        __APM__?: APMClient;
    }
}

