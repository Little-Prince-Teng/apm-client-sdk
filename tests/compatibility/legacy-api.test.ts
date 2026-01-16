import { describe, it, expect, beforeEach, vi } from 'vitest';
import ClientMonitor from '../../src/index';

describe('Legacy API Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export ClientMonitor as default', () => {
    expect(ClientMonitor).toBeDefined();
    expect(typeof ClientMonitor.register).toBe('function');
    expect(typeof ClientMonitor.setPerformance).toBe('function');
    expect(typeof ClientMonitor.catchErrors).toBe('function');
    expect(typeof ClientMonitor.reportFrameErrors).toBe('function');
    expect(typeof ClientMonitor.setCustomTags).toBe('function');
    expect(typeof ClientMonitor.validateTags).toBe('function');
    expect(typeof ClientMonitor.validateOptions).toBe('function');
    expect(typeof ClientMonitor.performance).toBe('function');
  });

  it('should support register method', () => {
    const mockConfig = {
      collector: 'http://test.com',
      service: 'test-service',
      serviceVersion: '1.0.0',
      pagePath: '/test',
      jsErrors: true,
      apiErrors: true,
      resourceErrors: true,
      autoTracePerf: true,
      useFmp: false,
      enableSPA: false,
      traceSDKInternal: false,
      detailMode: true,
      noTraceOrigins: [],
      traceTimeInterval: 60000
    };

    ClientMonitor.register(mockConfig);

    expect(ClientMonitor.customOptions.service).toBe('test-service');
    expect(ClientMonitor.customOptions.serviceVersion).toBe('1.0.0');
    expect(ClientMonitor.customOptions.pagePath).toBe('/test');
  });

  it('should support setPerformance method', () => {
    const mockConfig = {
      collector: 'http://test.com',
      service: 'test-service',
      serviceVersion: '1.0.0',
      pagePath: '/test',
      useFmp: true
    };

    ClientMonitor.setPerformance(mockConfig);

    expect(ClientMonitor.customOptions.useFmp).toBe(true);
  });

  it('should support setCustomTags method', () => {
    const tags = [
      { key: 'env', value: 'production' },
      { key: 'version', value: '1.0.0' }
    ];

    ClientMonitor.setCustomTags(tags);

    expect(ClientMonitor.customOptions.customTags).toEqual(tags);
  });

  it('should validate tags correctly', () => {
    const validTags = [{ key: 'test', value: 'value' }];
    const invalidTags = [{ key: 'test' }];

    expect(ClientMonitor.validateTags(validTags)).toBe(true);
    expect(ClientMonitor.validateTags(invalidTags)).toBe(false);
  });

  it('should validate options correctly', () => {
    ClientMonitor.customOptions = {
      collector: 123 as any,
      service: null as any,
      pagePath: undefined as any,
      serviceVersion: true as any,
      jsErrors: 'yes' as any,
      apiErrors: 'no' as any,
      resourceErrors: 1 as any,
      autoTracePerf: 'true' as any,
      useFmp: 'false' as any,
      enableSPA: 'yes' as any,
      traceSDKInternal: 'no' as any,
      detailMode: 'true' as any,
      noTraceOrigins: 'not-array' as any,
      traceTimeInterval: '60000' as any
    };

    ClientMonitor.validateOptions();

    expect(typeof ClientMonitor.customOptions.collector).toBe('string');
    expect(typeof ClientMonitor.customOptions.service).toBe('string');
    expect(typeof ClientMonitor.customOptions.pagePath).toBe('string');
    expect(typeof ClientMonitor.customOptions.serviceVersion).toBe('string');
    expect(typeof ClientMonitor.customOptions.jsErrors).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.apiErrors).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.resourceErrors).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.autoTracePerf).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.useFmp).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.enableSPA).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.traceSDKInternal).toBe('boolean');
    expect(typeof ClientMonitor.customOptions.detailMode).toBe('boolean');
    expect(Array.isArray(ClientMonitor.customOptions.noTraceOrigins)).toBe(true);
    expect(typeof ClientMonitor.customOptions.traceTimeInterval).toBe('number');
  });

  it('should mount to window object', () => {
    expect((window as any).ClientMonitor).toBeDefined();
    expect((window as any).ClientMonitor).toBe(ClientMonitor);
  });
});
