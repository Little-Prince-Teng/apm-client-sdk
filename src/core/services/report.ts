import { ErrorInfo, PerformanceData, SegmentFields } from '../types';

export class ReportService {
  private buildURL(type: string, collector: string): string {
    const paths: Record<string, string> = {
      ERROR: '/error',
      ERRORS: '/errors',
      PERF: '/perf',
      SEGMENT: '/segment',
      SEGMENTS: '/segments',
    };
    return `${collector}${paths[type] || ''}`;
  }

  sendError(error: ErrorInfo): void {
    const url = this.buildURL('ERROR', error.collector);
    this.sendByFetch(url, error);
  }

  sendPerformance(perf: PerformanceData): void {
    const url = this.buildURL('PERF', perf.collector);
    this.sendByFetch(url, perf);
  }

  sendSegments(segments: SegmentFields[]): void {
    const url = this.buildURL('SEGMENTS', segments[0]?.service || '');
    this.sendByFetch(url, segments);
  }

  sendSegmentsByBeacon(segments: SegmentFields[]): void {
    const url = this.buildURL('SEGMENTS', segments[0]?.service || '');
    this.sendByBeacon(url, segments);
  }

  private sendByFetch(url: string, data: unknown): void {
    if (!url) return;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status >= 400) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      })
      .catch((error) => {
        console.warn('Report error:', error);
      });
  }

  private sendByBeacon(url: string, data: unknown): void {
    if (!url) return;

    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url, new Blob([JSON.stringify(data)], { type: 'application/json' }));
    } else {
      this.sendByFetch(url, data);
    }
  }
}
