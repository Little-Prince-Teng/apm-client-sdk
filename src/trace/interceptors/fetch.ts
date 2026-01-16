import { encode } from 'js-base64';
import uuid from '../../services/uuid';
import { SegmentFields, SpanFields } from '../type';
import { CustomOptionsType } from '../../types';
import Base from '../../services/base';
import { ComponentId, ReportTypes, SpanLayer, SpanType, ErrorsCategory, GradeTypeEnum } from '../../services/constant';
let customConfig: any = {};
export default function windowFetch(options: CustomOptionsType, segments: SegmentFields[]) {
  setFetchOptions(options);
  const originFetch: any =
    options.customFetch ||
    (window as any).rawWindow?.fetch ||
    (window as any).__MICRO_APP_BASE_WINDOW__?.fetch ||
    globalThis.fetch ||
    window.fetch;

  if (typeof originFetch !== 'function') {
    return;
  }

  const wrappedFetch = async (...args: any) => {
    const loginUser = typeof options.loginUser === 'function' ? options.loginUser() : options.loginUser;
    const startTime = new Date().getTime();
    const traceId = uuid();
    const traceSegmentId = uuid();
    let segment = {
      traceId: '',
      service: customConfig.service,
      spans: [],
      serviceInstance: customConfig.serviceVersion,
      traceSegmentId: '',
      loginUser,
    } as SegmentFields;
    let url = {} as URL;
    // for args[0] is Request object see: https://developer.mozilla.org/zh-CN/docs/Web/API/fetch
    if (Object.prototype.toString.call(args[0]) === '[object Request]') {
      url = new URL(args[0].url);
    } else {
      if (args[0].startsWith('http://') || args[0].startsWith('https://')) {
        url = new URL(args[0]);
      } else if (args[0].startsWith('//')) {
        url = new URL(`${window.location.protocol}${args[0]}`);
      } else {
        url = new URL(window.location.href);
        url.pathname = args[0];
      }
    }

    const noTraceOrigins = customConfig.noTraceOrigins.some((rule: string | RegExp) => {
      if (typeof rule === 'string') {
        if (rule === url.origin) {
          return true;
        }
      } else if (rule instanceof RegExp) {
        if (rule.test(url.origin)) {
          return true;
        }
      }
    });
    const cURL = new URL(customConfig.collector);
    const pathname = cURL.pathname === '/' ? url.pathname : url.pathname.replace(new RegExp(`^${cURL.pathname}`), '');
    const internals = [ReportTypes.ERROR, ReportTypes.ERRORS, ReportTypes.PERF, ReportTypes.SEGMENTS] as string[];
    const isSDKInternal = internals.includes(pathname);
    const hasTrace = !noTraceOrigins || (isSDKInternal && customConfig.traceSDKInternal);

    if (hasTrace) {
      const traceIdStr = String(encode(traceId));
      const segmentId = String(encode(traceSegmentId));
      const service = String(encode(segment.service));
      const instance = String(encode(segment.serviceInstance));
      const endpoint = String(encode(customConfig.pagePath));
      const peer = String(encode(url.host));
      const newLoginUser = loginUser ? String(encode(loginUser)) : '';
      const index = segment.spans.length;
      const values = `${1}-${traceIdStr}-${segmentId}-${index}-${service}-${instance}-${endpoint}-${peer}-${newLoginUser}`;

      if (!args[1]) {
        args[1] = {};
      }
      if (!args[1].headers) {
        args[1].headers = {};
      }
      args[1].headers.sw8 = values;
    }

    const response = await originFetch(...args);

    try {
      if (response && (response.status === 0 || response.status >= 400)) {
        const logInfo = {
          uniqueId: uuid(),
          service: customConfig.service,
          serviceVersion: customConfig.serviceVersion,
          pagePath: customConfig.pagePath,
          category: ErrorsCategory.AJAX_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: (response && response.url) || `${url.protocol}//${url.host}${url.pathname}`,
          message: `status: ${response ? response.status : 0}; statusText: ${response && response.statusText};`,
          collector: customConfig.collector,
          stack: 'Fetch: ' + response && response.statusText,
        };
        new Base().traceInfo(logInfo);
      }
      if (hasTrace) {
        const tags = [
          {
            key: 'http.method',
            value: args[1].method || 'GET',
          },
          {
            key: 'url',
            value: (response && response.url) || `${url.protocol}//${url.host}${url.pathname}`,
          },
        ];
        const endTime = new Date().getTime();
        const exitSpan: SpanFields = {
          operationName: customConfig.pagePath,
          startTime,
          endTime,
          spanId: segment.spans.length,
          spanLayer: SpanLayer,
          spanType: SpanType,
          // when requests failed, the status is 0
          isError: response && (response.status === 0 || response.status >= 400),
          parentSpanId: segment.spans.length - 1,
          componentId: ComponentId,
          peer: url.host,
          tags: customConfig.detailMode
            ? customConfig.customTags
              ? [...tags, ...customConfig.customTags]
              : tags
            : undefined,
        };
        segment = {
          ...segment,
          traceId,
          traceSegmentId,
        };
        segment.spans.push(exitSpan);
        segments.push(segment);
      }
    } catch (e) {
      throw e;
    }
    return response.clone();
  };

  // 覆盖当前 window 与 globalThis，防止 MicroApp 再次切换 window 导致丢失
  window.fetch = wrappedFetch;
  // globalThis 可能与 window 不同，防止沙箱替换
  (globalThis as any).fetch = wrappedFetch;
}
export function setFetchOptions(opt: CustomOptionsType) {
  customConfig = { ...customConfig, ...opt };
}
