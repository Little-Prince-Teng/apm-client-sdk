import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { CustomReportOptions } from '../types';

class VueErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions, Vue: any) {
    this.infoOpt = options;
    if (!(Vue && Vue.config)) {
      return;
    }
    Vue.config.errorHandler = (error: Error, vm: any, info: string) => {
      this.logInfo = {
        ...this.infoOpt,
        uniqueId: uuid(),
        category: ErrorsCategory.VUE_ERROR,
        grade: GradeTypeEnum.ERROR,
        errorUrl: location.href,
        message: info,
        collector: options.collector,
        stack: error.stack,
      };
      this.traceInfo();
    };
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}

export default new VueErrors();
