const UUID_RADIX = 16;
const UUID_MASK_3 = 3;
const UUID_MASK_8 = 8;
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * UUID_RADIX | 0;
    const v = c === "x" ? r : r & UUID_MASK_3 | UUID_MASK_8;
    return v.toString(UUID_RADIX);
  });
}
const ERROR_STATUS_CODE = 400;
class ReportService {
  buildURL(type, collector) {
    const paths = {
      ERROR: "/error",
      ERRORS: "/errors",
      PERF: "/perf",
      SEGMENT: "/segment",
      SEGMENTS: "/segments"
    };
    return `${collector}${paths[type] || ""}`;
  }
  sendError(error) {
    const url = this.buildURL("ERROR", error.collector);
    this.sendByFetch(url, error);
  }
  sendPerformance(perf) {
    const url = this.buildURL("PERF", perf.collector);
    this.sendByFetch(url, perf);
  }
  sendSegments(segments) {
    var _a;
    const url = this.buildURL("SEGMENTS", ((_a = segments[0]) == null ? void 0 : _a.service) || "");
    this.sendByFetch(url, segments);
  }
  sendSegmentsByBeacon(segments) {
    var _a;
    const url = this.buildURL("SEGMENTS", ((_a = segments[0]) == null ? void 0 : _a.service) || "");
    this.sendByBeacon(url, segments);
  }
  sendByFetch(url, data) {
    if (!url) return;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then((response) => {
      if (response.status >= ERROR_STATUS_CODE) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }).catch((error) => {
      console.warn("Report error:", error);
    });
  }
  sendByBeacon(url, data) {
    if (!url) return;
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([JSON.stringify(data)], { type: "application/json" }));
    } else {
      this.sendByFetch(url, data);
    }
  }
}
class JSErrors {
  constructor(options) {
    this.enabled = false;
    this.options = options;
    this.reportService = new ReportService();
  }
  enable() {
    if (this.enabled) return;
    window.addEventListener("error", this.handleError.bind(this));
    this.enabled = true;
  }
  disable() {
    window.removeEventListener("error", this.handleError.bind(this));
    this.enabled = false;
  }
  handleError(event) {
    var _a;
    const errorInfo = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      category: "JS_ERROR",
      grade: "ERROR",
      errorUrl: event.filename || window.location.href,
      message: event.message,
      collector: this.options.collector,
      stack: (_a = event.error) == null ? void 0 : _a.stack
    };
    this.reportService.sendError(errorInfo);
  }
  capture(error, context) {
    const errorInfo = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      category: "JS_ERROR",
      grade: "ERROR",
      errorUrl: window.location.href,
      message: error.message,
      collector: this.options.collector,
      stack: error.stack,
      ...context
    };
    this.reportService.sendError(errorInfo);
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
  }
}
class PromiseErrors {
  constructor(options) {
    this.enabled = false;
    this.options = options;
    this.reportService = new ReportService();
  }
  enable() {
    if (this.enabled) return;
    window.addEventListener("unhandledrejection", this.handleRejection.bind(this));
    this.enabled = true;
  }
  disable() {
    window.removeEventListener("unhandledrejection", this.handleRejection.bind(this));
    this.enabled = false;
  }
  handleRejection(event) {
    var _a, _b;
    const errorInfo = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      category: "PROMISE_ERROR",
      grade: "ERROR",
      errorUrl: window.location.href,
      message: ((_a = event.reason) == null ? void 0 : _a.message) || "Unhandled Promise Rejection",
      collector: this.options.collector,
      stack: (_b = event.reason) == null ? void 0 : _b.stack
    };
    this.reportService.sendError(errorInfo);
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
  }
}
class AjaxErrors {
  constructor(options) {
    this.enabled = false;
    this.originalXHROpen = null;
    this.originalXHRSend = null;
    this.options = options;
    this.reportService = new ReportService();
  }
  enable() {
    if (this.enabled) return;
    this.interceptXHR();
    this.enabled = true;
  }
  disable() {
    if (!this.enabled) return;
    this.restoreXHR();
    this.enabled = false;
  }
  interceptXHR() {
    const self = this;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
      const xhr = this;
      xhr._apmMethod = method;
      xhr._apmUrl = url.toString();
      xhr._apmStartTime = Date.now();
      return self.originalXHROpen.call(this, method, url, async ?? false, username, password);
    };
    XMLHttpRequest.prototype.send = function(body) {
      const xhr = this;
      xhr.addEventListener("error", function() {
        const errorInfo = {
          uniqueId: generateUUID(),
          service: self.options.service,
          serviceVersion: self.options.serviceVersion,
          pagePath: self.options.pagePath,
          category: "AJAX_ERROR",
          grade: "ERROR",
          errorUrl: xhr._apmUrl || window.location.href,
          message: `AJAX request failed: ${xhr._apmMethod} ${xhr._apmUrl}`,
          collector: self.options.collector,
          stack: void 0
        };
        self.reportService.sendError(errorInfo);
      });
      xhr.addEventListener("timeout", function() {
        const errorInfo = {
          uniqueId: generateUUID(),
          service: self.options.service,
          serviceVersion: self.options.serviceVersion,
          pagePath: self.options.pagePath,
          category: "AJAX_ERROR",
          grade: "ERROR",
          errorUrl: xhr._apmUrl || window.location.href,
          message: `AJAX request timeout: ${xhr._apmMethod} ${xhr._apmUrl}`,
          collector: self.options.collector,
          stack: void 0
        };
        self.reportService.sendError(errorInfo);
      });
      return self.originalXHRSend.call(this, body);
    };
  }
  restoreXHR() {
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
    }
    if (this.originalXHRSend) {
      XMLHttpRequest.prototype.send = this.originalXHRSend;
    }
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
  }
}
class ResourceErrors {
  constructor(options) {
    this.enabled = false;
    this.options = options;
    this.reportService = new ReportService();
  }
  enable() {
    if (this.enabled) return;
    window.addEventListener("error", this.handleError.bind(this), true);
    this.enabled = true;
  }
  disable() {
    window.removeEventListener("error", this.handleError.bind(this), true);
    this.enabled = false;
  }
  handleError(event) {
    const target = event.target;
    if (target instanceof HTMLScriptElement) {
      const errorInfo = {
        uniqueId: generateUUID(),
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        category: "RESOURCE_ERROR",
        grade: "ERROR",
        errorUrl: target.src || window.location.href,
        message: `Resource load error: ${target.tagName}`,
        collector: this.options.collector
      };
      this.reportService.sendError(errorInfo);
    } else if (target instanceof HTMLLinkElement) {
      const errorInfo = {
        uniqueId: generateUUID(),
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        category: "RESOURCE_ERROR",
        grade: "ERROR",
        errorUrl: target.href || window.location.href,
        message: `Resource load error: ${target.tagName}`,
        collector: this.options.collector
      };
      this.reportService.sendError(errorInfo);
    } else if (target instanceof HTMLImageElement) {
      const errorInfo = {
        uniqueId: generateUUID(),
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        category: "RESOURCE_ERROR",
        grade: "ERROR",
        errorUrl: target.src || window.location.href,
        message: `Resource load error: ${target.tagName}`,
        collector: this.options.collector
      };
      this.reportService.sendError(errorInfo);
    }
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
  }
}
class VueErrors {
  constructor(options) {
    this.enabled = false;
    this.options = options;
    this.reportService = new ReportService();
  }
  enable(vue) {
    if (this.enabled) return;
    if (vue && vue.config) {
      vue.config.errorHandler = (error, _vm, info) => {
        const errorInfo = {
          uniqueId: generateUUID(),
          service: this.options.service,
          serviceVersion: this.options.serviceVersion,
          pagePath: this.options.pagePath,
          category: "VUE_ERROR",
          grade: "ERROR",
          errorUrl: window.location.href,
          message: info,
          collector: this.options.collector,
          stack: error.stack
        };
        this.reportService.sendError(errorInfo);
      };
    }
    this.enabled = true;
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
  }
}
class ErrorTracker {
  constructor(options) {
    this.options = options;
    this.jsErrors = new JSErrors(options);
    this.promiseErrors = new PromiseErrors(options);
    this.ajaxErrors = new AjaxErrors(options);
    this.resourceErrors = new ResourceErrors(options);
    this.vueErrors = new VueErrors(options);
  }
  enable(options) {
    this.options = { ...this.options, ...options };
    if (options.jsErrors ?? false) {
      this.jsErrors.enable();
      this.promiseErrors.enable();
      if (options.vue) {
        this.vueErrors.enable(options.vue);
      }
    }
    if (options.apiErrors ?? false) {
      this.ajaxErrors.enable();
    }
    if (options.resourceErrors ?? false) {
      this.resourceErrors.enable();
    }
  }
  capture(error, context) {
    this.jsErrors.capture(error, context);
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
    this.jsErrors.updateConfig(options);
    this.promiseErrors.updateConfig(options);
    this.ajaxErrors.updateConfig(options);
    this.resourceErrors.updateConfig(options);
    this.vueErrors.updateConfig(options);
  }
}
class PerformanceTracker {
  constructor(options) {
    this.options = options;
    this.reportService = new ReportService();
  }
  track() {
    if (document.readyState === "complete") {
      this.collectAndReport();
    } else {
      window.addEventListener("load", () => this.collectAndReport(), { once: true });
    }
  }
  collectAndReport() {
    if (!(this.options.autoTracePerf ?? false)) return;
    const performanceData = {
      uniqueId: generateUUID(),
      service: this.options.service,
      serviceVersion: this.options.serviceVersion,
      pagePath: this.options.pagePath,
      collector: this.options.collector,
      timing: performance.timing
    };
    if (this.options.useFmp ?? false) {
      performanceData.fmpTime = this.calculateFMP();
    }
    this.reportService.sendPerformance(performanceData);
  }
  calculateFMP() {
    return 0;
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
  }
}
class XHRInterceptor {
  constructor() {
  }
  enable() {
  }
  disable() {
  }
  updateConfig(_options) {
  }
}
class FetchInterceptor {
  constructor() {
  }
  enable() {
  }
  disable() {
  }
  updateConfig(_options) {
  }
}
class TraceTracker {
  constructor(options) {
    this.segments = [];
    this.timer = null;
    this.options = options;
    this.reportService = new ReportService();
    this.xhrInterceptor = new XHRInterceptor();
    this.fetchInterceptor = new FetchInterceptor();
  }
  enable(options) {
    this.options = { ...this.options, ...options };
    this.xhrInterceptor.enable();
    this.fetchInterceptor.enable();
    this.setupReportTimer();
    this.setupUnloadHandler();
  }
  disable() {
    this.xhrInterceptor.disable();
    this.fetchInterceptor.disable();
    this.clearReportTimer();
  }
  setupReportTimer() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      if (this.segments.length > 0) {
        this.reportService.sendSegments([...this.segments]);
        this.segments.splice(0, this.segments.length);
      }
    }, this.options.traceTimeInterval ?? 6e4);
  }
  clearReportTimer() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  setupUnloadHandler() {
    window.addEventListener("beforeunload", () => {
      if (this.segments.length > 0) {
        this.reportService.sendSegmentsByBeacon([...this.segments]);
      }
    });
  }
  setCustomTags(tags) {
    this.options.customTags = tags;
    this.xhrInterceptor.updateConfig(this.options);
    this.fetchInterceptor.updateConfig(this.options);
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
    this.xhrInterceptor.updateConfig(this.options);
    this.fetchInterceptor.updateConfig(this.options);
  }
}
class APMClient {
  constructor(options) {
    this.options = {
      collector: typeof window !== "undefined" ? window.location.origin : "",
      service: "",
      serviceVersion: "",
      pagePath: typeof window !== "undefined" ? window.location.pathname : "",
      ...options
    };
    this.errorTracker = new ErrorTracker(this.options);
    this.performanceTracker = new PerformanceTracker(this.options);
    this.traceTracker = new TraceTracker(this.options);
  }
  init(options) {
    this.options = { ...this.options, ...options };
    this.validateOptions();
    if ((options.jsErrors ?? false) || (options.apiErrors ?? false) || (options.resourceErrors ?? false)) {
      this.errorTracker.enable(options);
    }
    if ((options.autoTracePerf ?? false) && !(options.enableSPA ?? false)) {
      this.performanceTracker.track();
    }
    this.traceTracker.enable(options);
  }
  updateConfig(options) {
    this.options = { ...this.options, ...options };
    this.errorTracker.updateConfig(this.options);
    this.performanceTracker.updateConfig(this.options);
    this.traceTracker.updateConfig(this.options);
  }
  captureError(error, context) {
    this.errorTracker.capture(error, context);
  }
  trackPerformance(options) {
    if (options) {
      this.updateConfig(options);
    }
    this.performanceTracker.track();
  }
  setCustomTags(tags) {
    if (this.validateTags(tags)) {
      this.traceTracker.setCustomTags(tags);
    }
  }
  validateOptions() {
    const { collector, service, pagePath, serviceVersion } = this.options;
    if (typeof collector !== "string") {
      this.options.collector = typeof window !== "undefined" ? window.location.origin : "";
    }
    if (typeof service !== "string") {
      this.options.service = "";
    }
    if (typeof pagePath !== "string") {
      this.options.pagePath = typeof window !== "undefined" ? window.location.pathname : "";
    }
    if (typeof serviceVersion !== "string") {
      this.options.serviceVersion = "";
    }
  }
  validateTags(tags) {
    if (!tags) {
      return false;
    }
    if (!Array.isArray(tags)) {
      console.warn("customTags must be an array");
      return false;
    }
    const isValid = tags.every(
      (tag) => tag && typeof tag.key === "string" && typeof tag.value === "string"
    );
    if (!isValid) {
      console.warn("customTags format error");
    }
    return isValid;
  }
  getOptions() {
    return this.options;
  }
}
function createLegacyClient() {
  const client = new APMClient();
  const legacyClient = {
    customOptions: {},
    register(configs) {
      this.customOptions = { ...this.customOptions, ...configs };
      client.init(configs);
    },
    setPerformance(configs) {
      this.customOptions = { ...this.customOptions, ...configs, useFmp: false };
      client.updateConfig(this.customOptions);
      client.trackPerformance(this.customOptions);
    },
    catchErrors(options) {
      const { service, pagePath, serviceVersion, collector } = options;
      const errorOptions = {
        ...options,
        service: service || this.customOptions.service,
        pagePath: pagePath || this.customOptions.pagePath,
        serviceVersion: serviceVersion || this.customOptions.serviceVersion,
        collector: collector || this.customOptions.collector
      };
      client.init(errorOptions);
    },
    reportFrameErrors(configs, error) {
      client.captureError(error, {
        service: configs.service,
        pagePath: configs.pagePath,
        serviceVersion: configs.serviceVersion,
        collector: configs.collector
      });
    },
    setCustomTags(tags) {
      if (this.validateTags(tags)) {
        this.customOptions.customTags = tags;
        client.setCustomTags(tags);
      }
    },
    validateTags(customTags) {
      if (!customTags) {
        return false;
      }
      if (!Array.isArray(customTags)) {
        this.customOptions.customTags = void 0;
        console.warn("customTags error");
        return false;
      }
      let isValid = true;
      for (const tag of customTags) {
        if (!(tag && tag.key && tag.value)) {
          isValid = false;
        }
      }
      if (!isValid) {
        this.customOptions.customTags = void 0;
        console.warn("customTags error");
      }
      return isValid;
    },
    validateOptions() {
      const {
        collector,
        service,
        pagePath,
        serviceVersion,
        jsErrors,
        apiErrors,
        resourceErrors,
        autoTracePerf,
        useFmp,
        enableSPA,
        traceSDKInternal,
        detailMode,
        noTraceOrigins,
        traceTimeInterval,
        vue
      } = this.customOptions;
      this.validateTags(this.customOptions.customTags);
      if (typeof collector !== "string") {
        this.customOptions.collector = typeof window !== "undefined" ? window.location.origin : "";
      }
      if (typeof service !== "string") {
        this.customOptions.service = "";
      }
      if (typeof pagePath !== "string") {
        this.customOptions.pagePath = typeof window !== "undefined" ? window.location.pathname : "";
      }
      if (typeof serviceVersion !== "string") {
        this.customOptions.serviceVersion = "";
      }
      if (typeof jsErrors !== "boolean") {
        this.customOptions.jsErrors = true;
      }
      if (typeof apiErrors !== "boolean") {
        this.customOptions.apiErrors = true;
      }
      if (typeof resourceErrors !== "boolean") {
        this.customOptions.resourceErrors = true;
      }
      if (typeof autoTracePerf !== "boolean") {
        this.customOptions.autoTracePerf = true;
      }
      if (typeof useFmp !== "boolean") {
        this.customOptions.useFmp = false;
      }
      if (typeof enableSPA !== "boolean") {
        this.customOptions.enableSPA = false;
      }
      if (typeof traceSDKInternal !== "boolean") {
        this.customOptions.traceSDKInternal = false;
      }
      if (typeof detailMode !== "boolean") {
        this.customOptions.detailMode = true;
      }
      if (!Array.isArray(noTraceOrigins)) {
        this.customOptions.noTraceOrigins = [];
      }
      if (typeof traceTimeInterval !== "number") {
        this.customOptions.traceTimeInterval = 6e4;
      }
      if (typeof vue !== "function") {
        this.customOptions.vue = void 0;
      }
    },
    performance(configs) {
      client.trackPerformance(configs);
    }
  };
  return legacyClient;
}
const ClientMonitor = createLegacyClient();
if (typeof window !== "undefined") {
  window.ClientMonitor = ClientMonitor;
}
export {
  APMClient,
  ClientMonitor as default
};
//# sourceMappingURL=index.mjs.map
