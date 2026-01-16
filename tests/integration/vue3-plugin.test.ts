import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAPMPlugin, useAPM } from '../../src/plugins/vue3';
import { createApp, inject } from 'vue';

describe('Vue3 Plugin', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp({});
  });

  it('should install plugin', () => {
    const plugin = createAPMPlugin({
      collector: 'http://test.com',
      service: 'test-service',
      serviceVersion: '1.0.0',
      pagePath: '/test',
    });

    expect(() => app.use(plugin)).not.toThrow();
  });

  it('should provide APM instance', () => {
    const plugin = createAPMPlugin({
      collector: 'http://test.com',
      service: 'test-service',
      serviceVersion: '1.0.0',
      pagePath: '/test',
    });

    app.use(plugin);

    const apm = inject('$apm');
    expect(apm).toBeDefined();
  });

  it('should useAPM composable', () => {
    const plugin = createAPMPlugin({
      collector: 'http://test.com',
      service: 'test-service',
      serviceVersion: '1.0.0',
      pagePath: '/test',
    });

    app.use(plugin);

    const { captureError, trackPerformance, setCustomTags } = useAPM();

    expect(captureError).toBeDefined();
    expect(trackPerformance).toBeDefined();
    expect(setCustomTags).toBeDefined();
  });
});
