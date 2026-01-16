

import uuid from '../services/uuid';
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';
import { CustomReportOptions } from '../types';

class ResourceErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions) {
    this.infoOpt = options;
    window.addEventListener('error', (event) => {
      try {
        if (!event) {
          return;
        }
        const target: any = event.target;
        const isElementTarget =
          target instanceof HTMLScriptElement ||
          target instanceof HTMLLinkElement ||
          target instanceof HTMLImageElement;

        if (!isElementTarget) {
          // return js error
          return;
        }
        this.logInfo = {
          ...this.infoOpt,
          uniqueId: uuid(),
          category: ErrorsCategory.RESOURCE_ERROR,
          grade: target.tagName === 'IMG' ? GradeTypeEnum.WARNING : GradeTypeEnum.ERROR,
          errorUrl: (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || location.href,
          message: `load ${target.tagName} resource error`,
          collector: options.collector,
          stack: `load ${target.tagName} resource error`,
        };
        this.traceInfo();
      } catch (error) {
        throw error;
      }
    });
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}
export default new ResourceErrors();
