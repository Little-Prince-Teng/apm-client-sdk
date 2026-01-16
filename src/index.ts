import { createLegacyClient } from './core/legacy';
import { APMClient } from './core/monitor';
import { APMOptions, ErrorTrackingOptions, PerformanceTrackingOptions, TraceTrackingOptions, TagOption } from './core/types';

const ClientMonitor = createLegacyClient();

if (typeof window !== 'undefined') {
  (window as any).ClientMonitor = ClientMonitor;
}

export default ClientMonitor;

export { APMClient };
export type {
  APMOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
  TraceTrackingOptions,
  TagOption
};
