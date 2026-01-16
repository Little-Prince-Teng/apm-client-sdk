import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { CustomReportOptions } from '../types';

class PromiseErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions) {
    this.infoOpt = options;
    window.addEventListener('unhandledrejection', (event) => {
      try {
        let url = '';
        if (!event || !event.reason) {
          return;
        }
        if (event.reason.config && event.reason.config.url) {
          url = event.reason.config.url;
        }
        this.logInfo = {
          ...this.infoOpt,
          uniqueId: uuid(),
          category: ErrorsCategory.PROMISE_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: url || location.href,
          message: event.reason.message,
          stack: event.reason.stack,
          collector: options.collector,
        };

        this.traceInfo();
      } catch (error) {
        console.log(error);
      }
    });
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}
export default new PromiseErrors();
