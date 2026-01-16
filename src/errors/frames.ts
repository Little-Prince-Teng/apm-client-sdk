import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { CustomReportOptions } from '../types';

class FrameErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions, error: Error) {
    this.infoOpt = options;
    this.logInfo = {
      ...this.infoOpt,
      uniqueId: uuid(),
      category: ErrorsCategory.JS_ERROR,
      grade: GradeTypeEnum.ERROR,
      errorUrl: error.name || location.href,
      message: error.message,
      collector: options.collector || location.origin,
      stack: error.stack,
    };
    this.traceInfo();
  }
}
export default new FrameErrors();
