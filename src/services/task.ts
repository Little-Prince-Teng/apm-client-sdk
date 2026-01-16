
import { ErrorInfoFields, ReportFields } from './types';
import Report from './report';

class TaskQueue {
  private queues: ((ErrorInfoFields & ReportFields) | undefined)[] = [];
  private collector: string = '';

  public addTask(data: ErrorInfoFields & ReportFields, collector: string) {
    this.queues.push(data);
    this.collector = collector;
  }

  public fireTasks() {
    if (!(this.queues && this.queues.length)) {
      return;
    }

    new Report('ERRORS', this.collector).sendByXhr(this.queues);
    this.queues = [];
  }

  public finallyFireTasks() {
    window.addEventListener('beforeunload', () => {
      if (!this.queues.length) {
        return;
      }
      new Report('ERRORS', this.collector).sendByBeacon(this.queues);
    });
  }
}

export default new TaskQueue();
