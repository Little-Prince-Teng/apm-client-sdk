import { ReportTypes } from './constant';

class Report {
  private url: string = '';

  constructor(type: string, collector: string) {
    if (type === 'ERROR') {
      this.url = collector + ReportTypes.ERROR;
    } else if (type === 'ERRORS') {
      this.url = collector + ReportTypes.ERRORS;
    } else if (type === 'SEGMENT') {
      this.url = collector + ReportTypes.SEGMENT;
    } else if (type === 'SEGMENTS') {
      this.url = collector + ReportTypes.SEGMENTS;
    } else if (type === 'PERF') {
      this.url = collector + ReportTypes.PERF;
    }
  }

  public sendByFetch(data: unknown): void {
    const dataObj = data as Record<string, unknown>;
    delete dataObj.collector;
    if (!this.url) {
      return;
    }
    const sendRequest = new Request(this.url, {
      method: 'POST',
      body: JSON.stringify(dataObj),
    });

    fetch(sendRequest)
      .then((response) => {
        if (response.status >= 400 || response.status === 0) {
          throw new Error('Something went wrong on api server!');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public sendByXhr(data: unknown): void {
    if (!this.url) {
      return;
    }
    const xhr = new XMLHttpRequest();

    xhr.open('post', this.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status < 400) {
        console.log('Report successfully');
      }
    };
    xhr.send(JSON.stringify(data));
  }

  public sendByBeacon(data: unknown): void {
    if (!this.url) {
      return;
    }
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(
        this.url,
        new Blob([JSON.stringify(data)], {
          type: 'application/json',
        })
      );
      return;
    }

    this.sendByXhr(data);
  }
}

export default Report;
