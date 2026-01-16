

import xhrInterceptor, { setOptions } from './interceptors/xhr';
import windowFetch, { setFetchOptions } from './interceptors/fetch';
import Report from '../services/report';
import { SegmentFields } from './type';
import { CustomOptionsType } from '../types';

export default function traceSegment(options: CustomOptionsType) {
  const segments = [] as SegmentFields[];
  // inject interceptor
  xhrInterceptor(options, segments);
  windowFetch(options, segments);
  window.addEventListener('beforeunload', () => {
    if (!segments.length) {
      return;
    }
    new Report('SEGMENTS', options.collector).sendByBeacon(segments);
  });
  //report per options.traceTimeInterval min
  setInterval(() => {
    if (!segments.length) {
      return;
    }
    new Report('SEGMENTS', options.collector).sendByXhr(segments);
    segments.splice(0, segments.length);
  }, options.traceTimeInterval);
}

export function setConfig(opt: CustomOptionsType) {
  setOptions(opt);
  setFetchOptions(opt);
}
