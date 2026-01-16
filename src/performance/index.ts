import { CustomOptionsType } from '../types';
import Report from '../services/report';
import pagePerf from './perf';
import FMP from './fmp';
import { IPerfDetail } from './type';

class TracePerf {
  private perfConfig = {
    perfDetail: {},
  } as { perfDetail: IPerfDetail };

  public getPerf(options: CustomOptionsType) {
    this.recordPerf(options);
    if (options.enableSPA) {
      // hash router
      window.addEventListener(
        'hashchange',
        () => {
          this.recordPerf(options);
        },
        false
      );
    }
  }

  public async recordPerf(options: CustomOptionsType) {
    let fmp: { fmpTime: number | undefined } = { fmpTime: undefined };
    if (options.autoTracePerf && options.useFmp) {
      fmp = await new FMP();
    }
    // auto report pv and perf data
    setTimeout(() => {
      if (options.autoTracePerf) {
        this.perfConfig.perfDetail = new pagePerf().getPerfTiming();
      }
      const perfDetail = options.autoTracePerf
        ? {
            ...this.perfConfig.perfDetail,
            fmpTime: options.useFmp ? parseInt(String(fmp.fmpTime), 10) : undefined,
          }
        : undefined;
      const perfInfo = {
        ...perfDetail,
        pagePath: options.pagePath,
        serviceVersion: options.serviceVersion,
        service: options.service,
      };
      new Report('PERF', options.collector).sendByXhr(perfInfo);
      // clear perf data
      this.clearPerf();
    }, 6000);
  }

  private clearPerf() {
    if (!(window.performance && window.performance.clearResourceTimings)) {
      return;
    }
    window.performance.clearResourceTimings();
    this.perfConfig = {
      perfDetail: {},
    } as { perfDetail: IPerfDetail };
  }
}

export default new TracePerf();
