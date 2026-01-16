import { ErrorTrackingOptions, ErrorInfo } from '../types';
import { JSErrors } from './js-errors';
import { PromiseErrors } from './promise-errors';
import { AjaxErrors } from './ajax-errors';
import { ResourceErrors } from './resource-errors';
import { VueErrors } from './vue-errors';

export class ErrorTracker {
  private options: ErrorTrackingOptions;
  private jsErrors: JSErrors;
  private promiseErrors: PromiseErrors;
  private ajaxErrors: AjaxErrors;
  private resourceErrors: ResourceErrors;
  private vueErrors: VueErrors;

  constructor(options: ErrorTrackingOptions) {
    this.options = options;
    this.jsErrors = new JSErrors(options);
    this.promiseErrors = new PromiseErrors(options);
    this.ajaxErrors = new AjaxErrors(options);
    this.resourceErrors = new ResourceErrors(options);
    this.vueErrors = new VueErrors(options);
  }

  enable(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };

    if (options.jsErrors) {
      this.jsErrors.enable();
      this.promiseErrors.enable();
      if (options.vue) {
        this.vueErrors.enable(options.vue);
      }
    }

    if (options.apiErrors) {
      this.ajaxErrors.enable();
    }

    if (options.resourceErrors) {
      this.resourceErrors.enable();
    }
  }

  capture(error: Error, context?: Partial<ErrorInfo>): void {
    this.jsErrors.capture(error, context);
  }

  updateConfig(options: ErrorTrackingOptions): void {
    this.options = { ...this.options, ...options };
    this.jsErrors.updateConfig(options);
    this.promiseErrors.updateConfig(options);
    this.ajaxErrors.updateConfig(options);
    this.resourceErrors.updateConfig(options);
    this.vueErrors.updateConfig(options);
  }
}
