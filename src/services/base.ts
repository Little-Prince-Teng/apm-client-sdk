import Task from './task';
import { ErrorsCategory, GradeTypeEnum } from './constant';
import { ErrorInfoFields, ReportFields } from './types';

let pageHasjsError: { [key: string]: boolean } = {};
let interval: NodeJS.Timeout;
export default class Base {
  public logInfo: ErrorInfoFields & ReportFields & { collector: string } = {
    uniqueId: '',
    service: '',
    serviceVersion: '',
    pagePath: '',
    category: ErrorsCategory.UNKNOWN_ERROR,
    grade: GradeTypeEnum.INFO,
    errorUrl: '',
    line: 0,
    col: 0,
    message: '',
    firstReportedError: false,
    collector: '',
  };

  public traceInfo(logInfo?: ErrorInfoFields & ReportFields & { collector: string }) {
    this.logInfo = logInfo || this.logInfo;
    const ExcludeErrorTypes: string[] = [
      ErrorsCategory.AJAX_ERROR,
      ErrorsCategory.RESOURCE_ERROR,
      ErrorsCategory.UNKNOWN_ERROR,
    ];
    // mark js error pv
    if (!pageHasjsError[location.href] && !ExcludeErrorTypes.includes(this.logInfo.category)) {
      pageHasjsError = {
        [location.href]: true,
      };
      this.logInfo.firstReportedError = true;
    }
    const collector = this.logInfo.collector;

    delete this.logInfo.collector;
    Task.addTask(this.logInfo, collector);
    Task.finallyFireTasks();
    if (interval) {
      return;
    }
    // report errors within 1min
    interval = setInterval(() => {
      Task.fireTasks();
    }, 60000);
  }
}
