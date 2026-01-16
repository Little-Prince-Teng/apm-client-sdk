import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APMClient } from '../../src/core/monitor';

describe('APMClient', () => {
  let client: APMClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new APMClient({
      collector: 'http://test.com',
      service: 'test-service',
      serviceVersion: '1.0.0',
      pagePath: '/test'
    });
  });

  it('should create instance with default options', () => {
    expect(client).toBeDefined();
    const options = client.getOptions();
    expect(options.service).toBe('test-service');
    expect(options.serviceVersion).toBe('1.0.0');
    expect(options.pagePath).toBe('/test');
  });

  it('should update config', () => {
    client.updateConfig({
      service: 'updated-service',
      pagePath: '/updated'
    });

    const options = client.getOptions();
    expect(options.service).toBe('updated-service');
    expect(options.pagePath).toBe('/updated');
  });

  it('should capture error', () => {
    const error = new Error('Test error');
    const captureSpy = vi.spyOn(client as any, 'captureError');
    
    client.captureError(error);

    expect(captureSpy).toHaveBeenCalledWith(error, undefined);
  });

  it('should set custom tags', () => {
    const tags = [{ key: 'test', value: 'value' }];
    const setTagsSpy = vi.spyOn(client as any, 'setCustomTags');
    
    client.setCustomTags(tags);

    expect(setTagsSpy).toHaveBeenCalledWith(tags);
  });
});
