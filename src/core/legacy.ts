import { APMClient } from './monitor';
import {
  APMOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
  TraceTrackingOptions,
  TagOption,
  VueInstance,
} from './types';

export interface LegacyOptions
  extends APMOptions, ErrorTrackingOptions, PerformanceTrackingOptions, TraceTrackingOptions {
  vue?: VueInstance;
}

export function createLegacyClient() {
  const client = new APMClient();

  const legacyClient = {
    customOptions: {} as LegacyOptions,

    register(configs: LegacyOptions): void {
      this.customOptions = { ...this.customOptions, ...configs };
      client.init(configs);
    },

    setPerformance(configs: PerformanceTrackingOptions): void {
      this.customOptions = { ...this.customOptions, ...configs, useFmp: false };
      client.updateConfig(this.customOptions);
      client.trackPerformance(this.customOptions);
    },

    catchErrors(options: ErrorTrackingOptions): void {
      const { service, pagePath, serviceVersion, collector } = options;
      const errorOptions: ErrorTrackingOptions = {
        ...options,
        service: service || this.customOptions.service,
        pagePath: pagePath || this.customOptions.pagePath,
        serviceVersion: serviceVersion || this.customOptions.serviceVersion,
        collector: collector || this.customOptions.collector,
      };
      client.init(errorOptions);
    },

    reportFrameErrors(configs: APMOptions, error: Error): void {
      client.captureError(error, {
        service: configs.service,
        pagePath: configs.pagePath,
        serviceVersion: configs.serviceVersion,
        collector: configs.collector,
      });
    },

    setCustomTags(tags: TagOption[]): void {
      if (this.validateTags(tags)) {
        this.customOptions.customTags = tags;
        client.setCustomTags(tags);
      }
    },

    validateTags(customTags?: TagOption[]): boolean {
      if (!customTags) {
        return false;
      }
      if (!Array.isArray(customTags)) {
        this.customOptions.customTags = undefined;
        console.warn('customTags error');
        return false;
      }
      let isValid = true;
      for (const tag of customTags) {
        if (!(tag && tag.key && tag.value)) {
          isValid = false;
        }
      }
      if (!isValid) {
        this.customOptions.customTags = undefined;
        console.warn('customTags error');
      }
      return isValid;
    },

    validateOptions(): void {
      const {
        collector,
        service,
        pagePath,
        serviceVersion,
        jsErrors,
        apiErrors,
        resourceErrors,
        autoTracePerf,
        useFmp,
        enableSPA,
        traceSDKInternal,
        detailMode,
        noTraceOrigins,
        traceTimeInterval,
        vue,
      } = this.customOptions;

      this.validateTags(this.customOptions.customTags);

      if (typeof collector !== 'string') {
        this.customOptions.collector = typeof window !== 'undefined' ? window.location.origin : '';
      }
      if (typeof service !== 'string') {
        this.customOptions.service = '';
      }
      if (typeof pagePath !== 'string') {
        this.customOptions.pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
      }
      if (typeof serviceVersion !== 'string') {
        this.customOptions.serviceVersion = '';
      }
      if (typeof jsErrors !== 'boolean') {
        this.customOptions.jsErrors = true;
      }
      if (typeof apiErrors !== 'boolean') {
        this.customOptions.apiErrors = true;
      }
      if (typeof resourceErrors !== 'boolean') {
        this.customOptions.resourceErrors = true;
      }
      if (typeof autoTracePerf !== 'boolean') {
        this.customOptions.autoTracePerf = true;
      }
      if (typeof useFmp !== 'boolean') {
        this.customOptions.useFmp = false;
      }
      if (typeof enableSPA !== 'boolean') {
        this.customOptions.enableSPA = false;
      }
      if (typeof traceSDKInternal !== 'boolean') {
        this.customOptions.traceSDKInternal = false;
      }
      if (typeof detailMode !== 'boolean') {
        this.customOptions.detailMode = true;
      }
      if (!Array.isArray(noTraceOrigins)) {
        this.customOptions.noTraceOrigins = [];
      }
      if (typeof traceTimeInterval !== 'number') {
        this.customOptions.traceTimeInterval = 60000;
      }
      if (typeof vue !== 'function') {
        this.customOptions.vue = undefined;
      }
    },

    performance(configs: PerformanceTrackingOptions): void {
      client.trackPerformance(configs);
    },
  };

  return legacyClient;
}
