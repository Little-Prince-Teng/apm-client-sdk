import { App, Plugin, inject } from 'vue';
import { APMClient, APMOptions, TagOption } from '../core/monitor';

export interface APMPluginOptions extends APMOptions {
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableTraceTracking?: boolean;
  errorTrackingOptions?: {
    jsErrors?: boolean;
    apiErrors?: boolean;
    resourceErrors?: boolean;
  };
  performanceTrackingOptions?: {
    autoTracePerf?: boolean;
    useFmp?: boolean;
    enableSPA?: boolean;
  };
  traceTrackingOptions?: {
    traceSDKInternal?: boolean;
    detailMode?: boolean;
    noTraceOrigins?: (string | RegExp)[];
    traceTimeInterval?: number;
  };
}

export const createAPMPlugin: (options: APMPluginOptions) => Plugin = (options) => {
  const client = new APMClient(options);
  
  return {
    install(app: App) {
      const apmOptions = {
        ...options,
        jsErrors: options.enableErrorTracking ? options.errorTrackingOptions?.jsErrors ?? true : false,
        apiErrors: options.enableErrorTracking ? options.errorTrackingOptions?.apiErrors ?? true : false,
        resourceErrors: options.enableErrorTracking ? options.errorTrackingOptions?.resourceErrors ?? true : false,
        autoTracePerf: options.enablePerformanceTracking ? options.performanceTrackingOptions?.autoTracePerf ?? true : false,
        useFmp: options.enablePerformanceTracking ? options.performanceTrackingOptions?.useFmp ?? false : false,
        enableSPA: options.enablePerformanceTracking ? options.performanceTrackingOptions?.enableSPA ?? false : false,
        traceSDKInternal: options.enableTraceTracking ? options.traceTrackingOptions?.traceSDKInternal ?? false : false,
        detailMode: options.enableTraceTracking ? options.traceTrackingOptions?.detailMode ?? true : false,
        noTraceOrigins: options.enableTraceTracking ? options.traceTrackingOptions?.noTraceOrigins ?? [] : [],
        traceTimeInterval: options.enableTraceTracking ? options.traceTrackingOptions?.traceTimeInterval ?? 60000 : 60000
      };
      
      client.init(apmOptions);
      
      app.config.errorHandler = (err, instance, info) => {
        client.captureError(err, {
          context: { info, component: instance?.$options?.name }
        });
      };
      
      app.provide('$apm', client);
      
      if (typeof window !== 'undefined') {
        (window as any).__APM__ = client;
      }
    }
  };
};

export function useAPM() {
  const apm = inject<APMClient>('$apm');
  
  if (!apm) {
    throw new Error('APM plugin not installed. Please use app.use(createAPMPlugin(options))');
  }
  
  return {
    captureError: apm.captureError.bind(apm),
    trackPerformance: apm.trackPerformance.bind(apm),
    setCustomTags: apm.setCustomTags.bind(apm),
    updateConfig: apm.updateConfig.bind(apm),
    getOptions: apm.getOptions.bind(apm)
  };
}

export { APMClient };
export type { APMOptions, TagOption };
