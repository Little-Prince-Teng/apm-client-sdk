import { ErrorInfo, PerformanceData, SegmentFields } from '../types';

const ERROR_STATUS_CODE = 400;

/**
 * 数据上报服务类
 *
 * 功能：
 * - 构建上报 URL
 * - 发送错误数据到收集器
 * - 发送性能数据到收集器
 * - 发送链路数据到收集器
 * - 支持多种上报方式（Fetch API、Beacon API）
 *
 * 上报方式：
 * - Fetch API：用于常规上报，支持错误处理和重试
 * - Beacon API：用于页面卸载时上报，确保数据不丢失
 *
 * 使用场景：
 * - 上报错误信息
 * - 上报性能数据
 * - 上报链路追踪数据
 * - 处理上报失败的情况
 */
export class ReportService {
  /**
   * 构建上报 URL
   *
   * 根据数据类型和收集器地址构建完整的上报 URL
   *
   * @param type - 数据类型（ERROR、PERF、SEGMENT 等）
   * @param collector - 收集器基础地址
   * @returns 完整的上报 URL
   *
   * URL 路径映射：
   * - ERROR: /error
   * - ERRORS: /errors
   * - PERF: /perf
   * - SEGMENT: /segment
   * - SEGMENTS: /segments
   */
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

  /**
   * 发送错误数据
   *
   * 使用 Fetch API 发送错误信息到收集器
   *
   * @param error - 错误信息对象
   *
   * 发送的数据包括：
   * - uniqueId: 唯一标识符
   * - service: 服务名称
   * - serviceVersion: 服务版本
   * - pagePath: 页面路径
   * - category: 错误类别
   * - grade: 错误等级
   * - errorUrl: 错误发生的 URL
   * - message: 错误消息
   * - stack: 错误堆栈
   * - collector: 收集器地址
   */
  sendError(error: ErrorInfo): void {
    const url = this.buildURL('ERROR', error.collector);
    this.sendByFetch(url, error);
  }

  /**
   * 发送性能数据
   *
   * 使用 Fetch API 发送性能数据到收集器
   *
   * @param perf - 性能数据对象
   *
   * 发送的数据包括：
   * - uniqueId: 唯一标识符
   * - service: 服务名称
   * - serviceVersion: 服务版本
   * - pagePath: 页面路径
   * - timing: 性能时间数据
   * - fmpTime: 首次有意义绘制时间（可选）
   * - collector: 收集器地址
   */
  sendPerformance(perf: PerformanceData): void {
    const url = this.buildURL('PERF', perf.collector);
    this.sendByFetch(url, perf);
  }

  /**
   * 发送链路数据
   *
   * 使用 Fetch API 发送链路追踪数据到收集器
   *
   * @param segments - 链路数据数组
   *
   * 发送的数据包括：
   * - 链路追踪信息（请求方法、URL、状态码等）
   * - 自定义标签
   * - 服务信息和页面路径
   */
  sendSegments(segments: SegmentFields[]): void {
    const url = this.buildURL('SEGMENTS', segments[0]?.service || '');
    this.sendByFetch(url, segments);
  }

  /**
   * 使用 Beacon API 发送链路数据
   *
   * 用于页面卸载时上报，确保数据不丢失
   *
   * @param segments - 链路数据数组
   *
   * Beacon API 优势：
   * - 异步发送，不阻塞页面卸载
   * - 即使页面关闭也能发送数据
   * - 不受跨域限制
   *
   * 降级策略：
   * - 如果浏览器不支持 Beacon API，降级使用 Fetch API
   */
  sendSegmentsByBeacon(segments: SegmentFields[]): void {
    const url = this.buildURL('SEGMENTS', segments[0]?.service || '');
    this.sendByBeacon(url, segments);
  }

  /**
   * 使用 Fetch API 发送数据
   *
   * 发送数据到收集器，并处理响应
   *
   * @param url - 上报 URL
   * @param data - 要发送的数据
   *
   * 错误处理：
   * - 如果响应状态码 >= 400，记录警告
   * - 如果请求失败，记录警告
   */
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
        if (response.status >= ERROR_STATUS_CODE) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      })
      .catch((error) => {
        console.warn('Report error:', error);
      });
  }

  /**
   * 使用 Beacon API 发送数据
   *
   * 优先使用 Beacon API，如果不支持则降级到 Fetch API
   *
   * @param url - 上报 URL
   * @param data - 要发送的数据
   *
   * Beacon API 优势：
   * - 异步发送，不阻塞页面卸载
   * - 即使页面关闭也能发送数据
   * - 不受跨域限制
   *
   * 降级策略：
   * - 如果浏览器不支持 Beacon API，使用 Fetch API
   */
  private sendByBeacon(url: string, data: unknown): void {
    if (!url) return;

    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url, new Blob([JSON.stringify(data)], { type: 'application/json' }));
    } else {
      this.sendByFetch(url, data);
    }
  }
}
