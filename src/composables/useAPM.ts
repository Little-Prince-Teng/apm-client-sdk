import { inject, onMounted, onUnmounted, Ref, ref } from 'vue';
import type { APMClient } from '../core/monitor';
import type { TagOption } from '../core/types';

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

export function useErrorTracking() {
  const { captureError } = useAPM();
  
  const wrapAsync = async <T>(fn: () => Promise<T>, context?: string): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      captureError(error as Error, { context: context || 'async-operation' });
      return null;
    }
  };
  
  return {
    captureError,
    wrapAsync
  };
}

export function usePerformanceTracking() {
  const { trackPerformance, setCustomTags } = useAPM();
  const startTime: Ref<number> = ref(0);
  
  const startMeasure = () => {
    startTime.value = performance.now();
  };
  
  const endMeasure = (name: string) => {
    const duration = performance.now() - startTime.value;
    setCustomTags([{ key: name, value: `${duration.toFixed(2)}ms` }]);
  };
  
  return {
    trackPerformance,
    setCustomTags,
    startMeasure,
    endMeasure
  };
}

export function usePageTracking() {
  const { trackPerformance, setCustomTags } = useAPM();
  
  onMounted(() => {
    trackPerformance();
  });
  
  const trackPageChange = (pagePath: string) => {
    setCustomTags([{ key: 'pagePath', value: pagePath }]);
    trackPerformance();
  };
  
  return {
    trackPageChange
  };
}
