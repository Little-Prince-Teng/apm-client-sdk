

import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { CustomReportOptions } from '../types';
class JSErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions) {
    this.infoOpt = options;
    window.onerror = (message, url, line, col, error) => {
      this.logInfo = {
        ...this.infoOpt,
        uniqueId: uuid(),
        category: ErrorsCategory.JS_ERROR,
        grade: GradeTypeEnum.ERROR,
        errorUrl: url,
        line,
        col,
        message,
        collector: options.collector,
        stack: error ? error.stack : '',
      };
      this.traceInfo();
    };
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}
export default new JSErrors();
