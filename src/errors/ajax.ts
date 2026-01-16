

import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory, ReportTypes } from '../services/constant';
import { CustomReportOptions } from '../types';

class AjaxErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  // get http error info
  public handleError(options: CustomReportOptions) {
    // XMLHttpRequest Object
    if (!window.XMLHttpRequest) {
      return;
    }
    this.infoOpt = options;
    window.addEventListener(
      'xhrReadyStateChange',
      (event: CustomEvent<XMLHttpRequest & { getRequestConfig: any[] }>) => {
        const detail = event.detail;

        if (detail.readyState !== 4) {
          return;
        }
        if (detail.getRequestConfig[1] === options.collector + ReportTypes.ERRORS) {
          return;
        }
        if (detail.status !== 0 && detail.status < 400) {
          return;
        }

        this.logInfo = {
          ...this.infoOpt,
          uniqueId: uuid(),
          category: ErrorsCategory.AJAX_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: detail.getRequestConfig[1],
          message: `status: ${detail.status}; statusText: ${detail.statusText};`,
          collector: options.collector,
          stack: detail.responseText,
        };
        this.traceInfo();
      },
    );
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}

export default new AjaxErrors();
