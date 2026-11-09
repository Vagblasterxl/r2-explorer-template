import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
import { DurableObject } from "cloudflare:workers";
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, { bigint: function bigint() {
  return BigInt(Date.now() * 1e6);
} });
class ReadStream {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
}
class WriteStream {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
}
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
const NODE_VERSION = "22.14.0";
class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
}
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const workerdProcess = getBuiltinModule("node:process");
const isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
const unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime$1,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
const { exit, features, platform } = workerdProcess;
const {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime2,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
const {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert,
  disconnect,
  mainModule
} = unenvProcess;
const {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
const _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
globalThis.process = _process;
const noop = Object.assign(() => {
}, { __unenv__: true });
const _console = globalThis.console;
const _ignoreErrors = true;
const _stderr = new Writable();
const _stdout = new Writable();
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop;
const _stderrErrorHandler = noop;
const workerdConsole = globalThis["console"];
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
globalThis.console = workerdConsole;
const _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
const _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
const nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
class PerformanceEntry {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}
const PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
class PerformanceMeasure extends PerformanceEntry {
  entryType = "measure";
}
class PerformanceResourceTiming extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
}
class PerformanceObserverEntryList {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
}
class Performance {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
}
class PerformanceObserver {
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
}
const performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  {
    return resStr;
  }
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono$1 = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node$1();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono = class extends Hono$1 {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
const AGENT_COUNT = 15;
const AGENT_CODE = `
import { DurableObject } from "cloudflare:workers";

export class Agent extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS memory (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)"
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, entry TEXT, at TEXT)"
    );
  }

  async fetch(request) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "status";
    const now = new Date().toISOString();

    if (action === "set") {
      const body = await request.json();
      this.ctx.storage.sql.exec(
        "INSERT INTO memory (key, value, updated_at) VALUES (?, ?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        body.key, String(body.value), now
      );
      this.ctx.storage.sql.exec("INSERT INTO log (entry, at) VALUES (?, ?)", "set:" + body.key, now);
      return Response.json({ ok: true, key: body.key, value: body.value });
    }

    if (action === "get") {
      const key = url.searchParams.get("key");
      const rows = this.ctx.storage.sql.exec("SELECT value FROM memory WHERE key = ?", key).toArray();
      return Response.json({ ok: true, key, value: rows.length ? rows[0].value : null });
    }

    if (action === "dump") {
      const memory = this.ctx.storage.sql.exec("SELECT key, value, updated_at FROM memory").toArray();
      const log = this.ctx.storage.sql.exec("SELECT entry, at FROM log ORDER BY id DESC LIMIT 50").toArray();
      return Response.json({ ok: true, memory, log });
    }

    const keys = this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM memory").toArray()[0].n;
    return Response.json({ ok: true, status: "alive", keys });
  }
}
`;
class BorgAgentSupervisor extends DurableObject {
  async fetch(request) {
    const agentId = request.headers.get("X-Agent-Id");
    const n = Number(agentId);
    if (!agentId || !Number.isInteger(n) || n < 1 || n > AGENT_COUNT) {
      return Response.json(
        { ok: false, error: `X-Agent-Id must be an integer 1..${AGENT_COUNT}` },
        { status: 400 }
      );
    }
    const facet = this.ctx.facets.get(`agent-${n}`, async () => {
      const worker = this.env.LOADER.get("borg-agent-v1", async () => ({
        compatibilityDate: "2026-04-01",
        mainModule: "agent.js",
        modules: { "agent.js": AGENT_CODE },
        globalOutbound: null
      }));
      return { class: worker.getDurableObjectClass("Agent") };
    });
    return await facet.fetch(request);
  }
}
class AgentNode extends DurableObject {
  constructor(ctx, env2) {
    super(ctx, env2);
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS memory (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)"
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, entry TEXT, at TEXT)"
    );
  }
  async fetch(request) {
    const url = new URL(request.url);
    const facetName = url.searchParams.get("facet");
    if (facetName) {
      const facet = this.ctx.facets.get(`sub-${facetName}`, async () => {
        const worker = this.env.LOADER.get("borg-agent-v1", async () => ({
          compatibilityDate: "2026-04-01",
          mainModule: "agent.js",
          modules: { "agent.js": AGENT_CODE },
          globalOutbound: null
        }));
        return { class: worker.getDurableObjectClass("Agent") };
      });
      return await facet.fetch(request);
    }
    const action = url.searchParams.get("action") || "status";
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (action === "set") {
      const body = await request.json();
      if (!body.key) {
        return Response.json({ ok: false, error: "key is required" }, { status: 400 });
      }
      this.ctx.storage.sql.exec(
        "INSERT INTO memory (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        body.key,
        String(body.value),
        now
      );
      this.ctx.storage.sql.exec("INSERT INTO log (entry, at) VALUES (?, ?)", "set:" + body.key, now);
      return Response.json({ ok: true, key: body.key, value: body.value });
    }
    if (action === "get") {
      const key = url.searchParams.get("key");
      const rows = this.ctx.storage.sql.exec("SELECT value FROM memory WHERE key = ?", key).toArray();
      return Response.json({ ok: true, key, value: rows.length ? rows[0].value : null });
    }
    if (action === "dump") {
      const memory = this.ctx.storage.sql.exec("SELECT key, value, updated_at FROM memory").toArray();
      const log = this.ctx.storage.sql.exec("SELECT entry, at FROM log ORDER BY id DESC LIMIT 50").toArray();
      return Response.json({ ok: true, memory, log });
    }
    const keys = this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM memory").toArray()[0].n;
    return Response.json({ ok: true, status: "alive", keys });
  }
}
const variables = /* @__PURE__ */ new Map();
const skills = /* @__PURE__ */ new Map();
const webhooks = /* @__PURE__ */ new Map();
const auditLog = [];
const mcpConnections = /* @__PURE__ */ new Map();
const polarEvents = [];
const sseClients = /* @__PURE__ */ new Set();
function addAuditEntry(action, resourceType, resourceId, details = {}) {
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    resourceType,
    resourceId,
    details,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  auditLog.unshift(entry);
  if (auditLog.length > 500) auditLog.length = 500;
  broadcastEvent("audit", entry);
  return entry;
}
function broadcastEvent(type, data) {
  const message = `event: ${type}
data: ${JSON.stringify(data)}

`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);
  for (const controller of sseClients) {
    try {
      controller.enqueue(encoded);
    } catch {
      sseClients.delete(controller);
    }
  }
}
async function dispatchWebhooks(event, payload) {
  const matching = Array.from(webhooks.values()).filter(
    (w) => w.active && w.events.includes(event)
  );
  for (const webhook of matching) {
    try {
      const body = JSON.stringify({
        event,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        payload
      });
      const headers = {
        "Content-Type": "application/json"
      };
      if (webhook.secret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(webhook.secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(body)
        );
        headers["X-Webhook-Signature"] = Array.from(
          new Uint8Array(signature)
        ).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      fetch(webhook.url, { method: "POST", headers, body }).catch(
        () => {
        }
      );
    } catch {
    }
  }
}
function seedData() {
  if (variables.size > 0) return;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  variables.set("greeting", {
    id: "greeting",
    name: "greeting",
    value: "Hello",
    type: "string",
    description: "Default greeting prefix",
    scope: "global",
    createdAt: now,
    updatedAt: now
  });
  variables.set("language", {
    id: "language",
    name: "language",
    value: "English",
    type: "string",
    description: "Target language for translations",
    scope: "global",
    createdAt: now,
    updatedAt: now
  });
  variables.set("max_tokens", {
    id: "max_tokens",
    name: "max_tokens",
    value: "1024",
    type: "number",
    description: "Maximum token limit for responses",
    scope: "global",
    createdAt: now,
    updatedAt: now
  });
  variables.set("model", {
    id: "model",
    name: "model",
    value: "claude-sonnet-4-20250514",
    type: "string",
    description: "Default AI model to use",
    scope: "prod",
    createdAt: now,
    updatedAt: now
  });
  variables.set("temperature", {
    id: "temperature",
    name: "temperature",
    value: "0.7",
    type: "number",
    description: "Default sampling temperature",
    scope: "global",
    createdAt: now,
    updatedAt: now
  });
  skills.set("translate", {
    id: "translate",
    name: "translate",
    description: "Translate text to a target language",
    template: "Translate the following text to {{language}}:\n\n{{text}}",
    parameters: [
      {
        name: "text",
        type: "string",
        description: "The text to translate",
        required: true
      }
    ],
    createdAt: now
  });
  skills.set("greet_user", {
    id: "greet_user",
    name: "greet_user",
    description: "Generate a personalized greeting",
    template: "{{greeting}}, {{user_name}}! Welcome to Polar MCP.",
    parameters: [
      {
        name: "user_name",
        type: "string",
        description: "Name of the user to greet",
        required: true
      }
    ],
    createdAt: now
  });
  skills.set("summarize", {
    id: "summarize",
    name: "summarize",
    description: "Summarize content with configurable detail level",
    template: "Summarize the following content in {{detail_level}} detail (max {{max_tokens}} tokens):\n\n{{content}}",
    parameters: [
      {
        name: "content",
        type: "string",
        description: "Content to summarize",
        required: true
      },
      {
        name: "detail_level",
        type: "string",
        description: "Level of detail: brief, moderate, or thorough",
        required: false
      }
    ],
    createdAt: now
  });
  skills.set("analyze_and_summarize", {
    id: "analyze_and_summarize",
    name: "analyze_and_summarize",
    description: "Analyze code then produce a summary — a chained skill demo",
    template: "Analyze the following for patterns, issues, and structure:\n\n{{content}}",
    parameters: [
      {
        name: "content",
        type: "string",
        description: "Code or text to analyze",
        required: true
      }
    ],
    chain: ["summarize"],
    createdAt: now
  });
}
seedData();
function interpolateTemplate(template, inputs, scope) {
  const variablesUsed = {};
  const resolved = template.replace(
    /\{\{(\w+)\}\}/g,
    (_match, key) => {
      if (key in inputs) {
        return inputs[key];
      }
      const scoped = scope && scope !== "global" ? Array.from(variables.values()).find(
        (v) => v.name === key && v.scope === scope
      ) : void 0;
      const variable = scoped || variables.get(key);
      if (variable) {
        variablesUsed[key] = variable.value;
        return variable.value;
      }
      return `{{${key}}}`;
    }
  );
  return { resolved, variablesUsed };
}
function executeSkillChain(skill, inputs, scope) {
  const steps = [];
  const { resolved, variablesUsed } = interpolateTemplate(
    skill.template,
    inputs,
    scope
  );
  steps.push({
    skillId: skill.id,
    skillName: skill.name,
    resolvedTemplate: resolved,
    variablesUsed
  });
  if (skill.chain) {
    let previousOutput = resolved;
    for (const chainId of skill.chain) {
      const chainSkill = skills.get(chainId);
      if (!chainSkill) continue;
      const chainInputs = {
        ...inputs,
        content: previousOutput,
        previous_output: previousOutput
      };
      const chainResult = interpolateTemplate(
        chainSkill.template,
        chainInputs,
        scope
      );
      steps.push({
        skillId: chainSkill.id,
        skillName: chainSkill.name,
        resolvedTemplate: chainResult.resolved,
        variablesUsed: chainResult.variablesUsed
      });
      previousOutput = chainResult.resolved;
    }
  }
  return { steps };
}
const app = new Hono();
let __stateSchemaReady = false;
async function ensureStateSchema(env2) {
  if (__stateSchemaReady) return;
  await env2.DB.prepare(
    "CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)"
  ).run();
  __stateSchemaReady = true;
}
async function persistState(env2) {
  await ensureStateSchema(env2);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const blobs = {
    variables: JSON.stringify([...variables.values()]),
    skills: JSON.stringify([...skills.values()]),
    webhooks: JSON.stringify([...webhooks.values()]),
    audit: JSON.stringify(auditLog),
    connections: JSON.stringify([...mcpConnections.values()]),
    polar_events: JSON.stringify(polarEvents)
  };
  const stmt = env2.DB.prepare(
    "INSERT INTO state (key, value, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3"
  );
  await env2.DB.batch(Object.entries(blobs).map(([k, v]) => stmt.bind(k, v, now)));
}
async function hydrateState(env2) {
  await ensureStateSchema(env2);
  const { results } = await env2.DB.prepare("SELECT key, value FROM state").all();
  if (!results || results.length === 0) {
    seedData();
    await persistState(env2);
    return;
  }
  const byKey = {};
  for (const r of results)
    byKey[r.key] = r.value;
  const intoMap = (map, json) => {
    map.clear();
    if (json)
      for (const item of JSON.parse(json))
        map.set(item.id, item);
  };
  const intoArr = (arr, json) => {
    arr.length = 0;
    if (json) arr.push(...JSON.parse(json));
  };
  intoMap(variables, byKey.variables);
  intoMap(skills, byKey.skills);
  intoMap(webhooks, byKey.webhooks);
  intoArr(auditLog, byKey.audit);
  intoMap(mcpConnections, byKey.connections);
  intoArr(polarEvents, byKey.polar_events);
}
app.use("*", async (c, next) => {
  try {
    await hydrateState(c.env);
  } catch (e) {
    console.error("hydrateState failed", e);
  }
  await next();
  const m = c.req.method;
  if (m === "POST" || m === "PUT" || m === "DELETE" || m === "PATCH") {
    try {
      await persistState(c.env);
    } catch (e) {
      console.error("persistState failed", e);
    }
  }
});
app.get(
  "/api/",
  (c) => c.json({
    name: "Polar MCP",
    version: "3.0.0",
    status: "running",
    capabilities: [
      "variables",
      "skills",
      "skill-chaining",
      "webhooks",
      "audit-log",
      "sse-streaming",
      "mcp-protocol",
      "mcp-connections",
      "scoped-variables",
      "polar-webhooks",
      "openapi-docs",
      "integration-mem",
      "integration-obsidian",
      "integration-slack",
      "integration-google"
    ]
  })
);
app.get("/api/events", (_c) => {
  const stream = new ReadableStream({
    start(controller) {
      sseClients.add(controller);
      const ping = `event: connected
data: ${JSON.stringify({ message: "SSE connected", timestamp: (/* @__PURE__ */ new Date()).toISOString() })}

`;
      controller.enqueue(new TextEncoder().encode(ping));
    },
    cancel() {
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
});
app.get("/api/variables", (c) => {
  const scope = c.req.query("scope");
  let result = Array.from(variables.values());
  if (scope) {
    result = result.filter(
      (v) => v.scope === scope || v.scope === "global"
    );
  }
  return c.json(result);
});
app.post("/api/variables", async (c) => {
  const body = await c.req.json();
  if (!body.name || body.value === void 0) {
    return c.json({ error: "name and value are required" }, 400);
  }
  const id = body.name.toLowerCase().replace(/\s+/g, "_");
  if (variables.has(id)) {
    return c.json({ error: `Variable '${id}' already exists` }, 409);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const variable = {
    id,
    name: body.name,
    value: String(body.value),
    type: body.type || "string",
    description: body.description || "",
    scope: body.scope || "global",
    createdAt: now,
    updatedAt: now
  };
  variables.set(id, variable);
  addAuditEntry("created", "variable", id, {
    name: variable.name,
    value: variable.value,
    scope: variable.scope
  });
  dispatchWebhooks("variable.created", {
    variable: { id, name: variable.name, value: variable.value }
  });
  broadcastEvent("variable.created", variable);
  return c.json(variable, 201);
});
app.put("/api/variables/:id", async (c) => {
  const id = c.req.param("id");
  const existing = variables.get(id);
  if (!existing) {
    return c.json({ error: "Variable not found" }, 404);
  }
  const body = await c.req.json();
  const oldValue = existing.value;
  const updated = {
    ...existing,
    value: body.value !== void 0 ? String(body.value) : existing.value,
    type: body.type || existing.type,
    description: body.description !== void 0 ? body.description : existing.description,
    scope: body.scope || existing.scope,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  variables.set(id, updated);
  addAuditEntry("updated", "variable", id, {
    oldValue,
    newValue: updated.value,
    scope: updated.scope
  });
  dispatchWebhooks("variable.updated", {
    variable: { id, name: updated.name, oldValue, newValue: updated.value }
  });
  broadcastEvent("variable.updated", updated);
  return c.json(updated);
});
app.delete("/api/variables/:id", (c) => {
  const id = c.req.param("id");
  const existing = variables.get(id);
  if (!existing) {
    return c.json({ error: "Variable not found" }, 404);
  }
  variables.delete(id);
  addAuditEntry("deleted", "variable", id, { name: existing.name });
  dispatchWebhooks("variable.deleted", {
    variable: { id, name: existing.name }
  });
  broadcastEvent("variable.deleted", { id });
  return c.json({ deleted: true });
});
app.get("/api/skills", (c) => {
  return c.json(Array.from(skills.values()));
});
app.post("/api/skills", async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.template) {
    return c.json({ error: "name and template are required" }, 400);
  }
  const id = body.name.toLowerCase().replace(/\s+/g, "_");
  if (skills.has(id)) {
    return c.json({ error: `Skill '${id}' already exists` }, 409);
  }
  const skill = {
    id,
    name: body.name,
    description: body.description || "",
    template: body.template,
    parameters: body.parameters || [],
    chain: body.chain,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  skills.set(id, skill);
  addAuditEntry("created", "skill", id, { name: skill.name });
  dispatchWebhooks("skill.created", { skill: { id, name: skill.name } });
  broadcastEvent("skill.created", skill);
  return c.json(skill, 201);
});
app.put("/api/skills/:id", async (c) => {
  const id = c.req.param("id");
  const existing = skills.get(id);
  if (!existing) {
    return c.json({ error: "Skill not found" }, 404);
  }
  const body = await c.req.json();
  const updated = {
    ...existing,
    name: body.name || existing.name,
    description: body.description !== void 0 ? body.description : existing.description,
    template: body.template || existing.template,
    parameters: body.parameters || existing.parameters,
    chain: body.chain !== void 0 ? body.chain : existing.chain
  };
  skills.set(id, updated);
  addAuditEntry("updated", "skill", id, { name: updated.name });
  return c.json(updated);
});
app.delete("/api/skills/:id", (c) => {
  const id = c.req.param("id");
  if (!skills.has(id)) {
    return c.json({ error: "Skill not found" }, 404);
  }
  const skill = skills.get(id);
  skills.delete(id);
  addAuditEntry("deleted", "skill", id, { name: skill.name });
  dispatchWebhooks("skill.deleted", { skill: { id, name: skill.name } });
  broadcastEvent("skill.deleted", { id });
  return c.json({ deleted: true });
});
app.post("/api/skills/:id/execute", async (c) => {
  const id = c.req.param("id");
  const skill = skills.get(id);
  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  const body = await c.req.json();
  const inputs = body.inputs || {};
  const scope = body.scope;
  for (const param of skill.parameters) {
    if (param.required && !(param.name in inputs)) {
      if (!variables.has(param.name)) {
        return c.json(
          { error: `Missing required parameter: ${param.name}` },
          400
        );
      }
    }
  }
  const result = executeSkillChain(skill, inputs, scope);
  addAuditEntry("executed", "skill", id, {
    name: skill.name,
    inputs,
    scope,
    chainLength: result.steps.length
  });
  dispatchWebhooks("skill.executed", {
    skill: { id, name: skill.name },
    inputs,
    stepsCount: result.steps.length
  });
  return c.json({
    skillId: skill.id,
    skillName: skill.name,
    resolvedTemplate: result.steps[result.steps.length - 1].resolvedTemplate,
    inputs,
    variablesUsed: result.steps[0].variablesUsed,
    chain: result.steps.length > 1 ? result.steps : void 0,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/webhooks", (c) => {
  return c.json(Array.from(webhooks.values()));
});
app.post("/api/webhooks", async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.url || !body.events?.length) {
    return c.json(
      { error: "name, url, and at least one event are required" },
      400
    );
  }
  const id = body.name.toLowerCase().replace(/\s+/g, "_");
  if (webhooks.has(id)) {
    return c.json({ error: `Webhook '${id}' already exists` }, 409);
  }
  const webhook = {
    id,
    name: body.name,
    url: body.url,
    events: body.events,
    active: body.active !== false,
    secret: body.secret,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  webhooks.set(id, webhook);
  addAuditEntry("created", "webhook", id, {
    name: webhook.name,
    url: webhook.url,
    events: webhook.events
  });
  return c.json(webhook, 201);
});
app.put("/api/webhooks/:id", async (c) => {
  const id = c.req.param("id");
  const existing = webhooks.get(id);
  if (!existing) {
    return c.json({ error: "Webhook not found" }, 404);
  }
  const body = await c.req.json();
  const updated = {
    ...existing,
    name: body.name || existing.name,
    url: body.url || existing.url,
    events: body.events || existing.events,
    active: body.active !== void 0 ? body.active : existing.active,
    secret: body.secret !== void 0 ? body.secret : existing.secret
  };
  webhooks.set(id, updated);
  addAuditEntry("updated", "webhook", id, { name: updated.name });
  return c.json(updated);
});
app.delete("/api/webhooks/:id", (c) => {
  const id = c.req.param("id");
  if (!webhooks.has(id)) {
    return c.json({ error: "Webhook not found" }, 404);
  }
  webhooks.delete(id);
  addAuditEntry("deleted", "webhook", id);
  return c.json({ deleted: true });
});
app.post("/api/webhooks/:id/test", async (c) => {
  const id = c.req.param("id");
  const webhook = webhooks.get(id);
  if (!webhook) {
    return c.json({ error: "Webhook not found" }, 404);
  }
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "webhook.test",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        payload: { message: "Test ping from Polar MCP" }
      })
    });
    return c.json({
      success: true,
      status: res.status,
      statusText: res.statusText
    });
  } catch (err) {
    return c.json({
      success: false,
      error: err instanceof Error ? err.message : "Request failed"
    });
  }
});
app.get("/api/audit", (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const resourceType = c.req.query("type");
  const action = c.req.query("action");
  let results = auditLog;
  if (resourceType) {
    results = results.filter((e) => e.resourceType === resourceType);
  }
  if (action) {
    results = results.filter((e) => e.action === action);
  }
  return c.json(results.slice(0, limit));
});
function b64ToBytes(b64) {
  try {
    const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}
function hexToBytes(hex) {
  if (hex.length < 2 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
async function hmacDigests(keyBytes, msg) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg)));
  let bin = "";
  for (const b of sig) bin += String.fromCharCode(b);
  return {
    b64: btoa(bin),
    hex: Array.from(sig).map((b) => b.toString(16).padStart(2, "0")).join("")
  };
}
async function verifyPolarSignature(body, signature, secret, webhookId, webhookTimestamp) {
  if (!secret) return "no_secret";
  if (!signature) return "invalid";
  const enc = new TextEncoder();
  const idx = secret.indexOf("whsec_");
  const afterPrefix = idx >= 0 ? secret.slice(idx + 6) : secret;
  const keys = [enc.encode(secret), enc.encode(afterPrefix)];
  const asB64 = b64ToBytes(afterPrefix);
  if (asB64 && asB64.length) keys.push(asB64);
  const asHex = hexToBytes(afterPrefix);
  if (asHex && asHex.length) keys.push(asHex);
  const msgs = [];
  if (webhookId && webhookTimestamp) msgs.push(`${webhookId}.${webhookTimestamp}.${body}`);
  msgs.push(body);
  const presented = /* @__PURE__ */ new Set();
  for (const part of signature.split(/\s+/)) {
    if (!part) continue;
    presented.add(part);
    const comma = part.indexOf(",");
    if (comma >= 0) presented.add(part.slice(comma + 1));
  }
  for (const k of keys) {
    for (const m of msgs) {
      const d = await hmacDigests(k, m);
      if (presented.has(d.b64) || presented.has(d.hex)) return "valid";
    }
  }
  return "invalid";
}
function capsFromProduct(product) {
  const benefits = product?.benefits || [];
  const caps = [];
  for (const bft of benefits) {
    if (!bft || bft.type !== "feature_flag") continue;
    const meta = bft.metadata || {};
    if (typeof meta.cap === "string" && meta.cap) caps.push(meta.cap);
  }
  return caps;
}
const POLAR_ACTIVE_STATUSES = /* @__PURE__ */ new Set(["active", "trialing"]);
async function syncPolarCustomerState(env2, parsed, eventType, eventId) {
  const data = parsed.data;
  if (!data) return [];
  const customerId = typeof data.id === "string" ? data.id : null;
  if (!customerId) return [];
  const grants = data.granted_benefits || [];
  const caps = [];
  for (const g of grants) {
    if (!g || g.benefit_type !== "feature_flag") continue;
    const meta = g.benefit_metadata || {};
    if (typeof meta.cap === "string" && meta.cap && !caps.includes(meta.cap)) caps.push(meta.cap);
  }
  const capsJson = JSON.stringify(caps);
  const occurredAt = typeof parsed.timestamp === "string" ? parsed.timestamp : null;
  const now = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const subs = data.active_subscriptions || [];
  const touched = [];
  for (const sub of subs) {
    const subId = typeof sub?.id === "string" ? sub.id : null;
    if (!subId) continue;
    const status = typeof sub.status === "string" ? sub.status : "unknown";
    const active = POLAR_ACTIVE_STATUSES.has(status) ? 1 : 0;
    await env2.DB.prepare(
      `INSERT INTO polar_entitlements
			 (subscription_id, customer_id, external_customer_id, customer_name, product_id,
			  product_name, status, active, capabilities, source, event_type, event_id,
			  occurred_at, updated_at)
			 VALUES (?1,?2,?3,?4,?5,NULL,?6,?7,?8,'webhook',?9,?10,?11,?12)
			 ON CONFLICT(subscription_id) DO UPDATE SET
			   customer_id=excluded.customer_id,
			   external_customer_id=excluded.external_customer_id,
			   customer_name=excluded.customer_name,
			   product_id=excluded.product_id,
			   product_name=COALESCE(polar_entitlements.product_name, excluded.product_name),
			   status=excluded.status,
			   active=excluded.active,
			   capabilities=excluded.capabilities,
			   source='webhook',
			   event_type=excluded.event_type,
			   event_id=excluded.event_id,
			   occurred_at=excluded.occurred_at,
			   updated_at=excluded.updated_at`
    ).bind(
      subId,
      customerId,
      data.external_id ?? null,
      data.name ?? null,
      String(sub.product_id ?? ""),
      status,
      active,
      capsJson,
      eventType,
      eventId,
      occurredAt,
      now
    ).run();
    touched.push(subId);
  }
  if (touched.length) {
    const marks = touched.map((_, i) => `?${i + 3}`).join(",");
    await env2.DB.prepare(
      `UPDATE polar_entitlements SET active=0, status='inactive', updated_at=?2
			 WHERE customer_id=?1 AND subscription_id NOT IN (${marks})`
    ).bind(customerId, now, ...touched).run();
  } else {
    await env2.DB.prepare(
      "UPDATE polar_entitlements SET active=0, status='inactive', updated_at=?2 WHERE customer_id=?1"
    ).bind(customerId, now).run();
  }
  return touched;
}
async function upsertPolarEntitlement(env2, parsed, eventType, eventId) {
  const data = parsed.data;
  if (!data) return null;
  const subId = typeof data.id === "string" ? data.id : null;
  const product = data.product;
  const customer = data.customer;
  if (!subId || !product || !customer) return null;
  const status = typeof data.status === "string" ? data.status : "unknown";
  const revoked = eventType === "subscription.revoked" || eventType === "subscription.canceled";
  const active = !revoked && POLAR_ACTIVE_STATUSES.has(status) ? 1 : 0;
  const caps = JSON.stringify(capsFromProduct(product));
  const occurredAt = typeof parsed.timestamp === "string" ? parsed.timestamp : null;
  const now = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
  await env2.DB.prepare(
    `INSERT INTO polar_entitlements
		 (subscription_id, customer_id, external_customer_id, customer_name, product_id,
		  product_name, status, active, capabilities, source, event_type, event_id,
		  occurred_at, updated_at)
		 VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'webhook',?10,?11,?12,?13)
		 ON CONFLICT(subscription_id) DO UPDATE SET
		   customer_id=excluded.customer_id,
		   external_customer_id=excluded.external_customer_id,
		   customer_name=excluded.customer_name,
		   product_id=excluded.product_id,
		   product_name=excluded.product_name,
		   status=excluded.status,
		   active=excluded.active,
		   capabilities=excluded.capabilities,
		   source='webhook',
		   event_type=excluded.event_type,
		   event_id=excluded.event_id,
		   occurred_at=excluded.occurred_at,
		   updated_at=excluded.updated_at`
  ).bind(
    subId,
    String(customer.id ?? data.customer_id ?? ""),
    customer.external_id ?? null,
    customer.name ?? null,
    String(product.id ?? data.product_id ?? ""),
    product.name ?? null,
    status,
    active,
    caps,
    eventType,
    eventId,
    occurredAt,
    now
  ).run();
  return subId;
}
// ============================================================================
// PATCH A — fail-closed Polar webhook (verify BEFORE the dedupe INSERT)
// ----------------------------------------------------------------------------
// Replaces the whole `app.post("/api/polar/webhook", ...)` handler in the live
// polar-mcp Worker. Anchors:
//   START  line that reads exactly:  app.post("/api/polar/webhook", async (c) => {
//   END    the line *before*:        app.get("/api/polar/events", (c) => {
//
// What changes vs. live:
//   1. If the signature is not "valid", we return BEFORE touching D1 or the
//      in-memory event list. Previously the dedupe INSERT ran first, so an
//      unsigned POST burned the webhook-id and got a 200 — a later legitimate
//      retry with that id was then dropped as a duplicate.
//   2. no_secret  -> 503  (our misconfiguration, never permission to trust)
//      invalid    -> 401  (Polar retries on non-2xx, so nothing is lost)
//   3. Every rejection writes a `polar_webhook_rejected` audit entry with the
//      reason, so `GET /api/audit?action=polar_webhook_rejected` shows them.
//
// Everything after the gate is the live code unchanged, except that the
// now-redundant `&& verified === "valid"` is dropped from the entitlement gate.
// ============================================================================
app.post("/api/polar/webhook", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("webhook-signature") || c.req.header("X-Polar-Signature");
  const webhookId = c.req.header("webhook-id");
  const webhookTimestamp = c.req.header("webhook-timestamp");
  const polarSecret = c.env.POLAR_WEBHOOK_SECRET;
  const verified = await verifyPolarSignature(body, signature, polarSecret, webhookId, webhookTimestamp);
  // --- PATCH A gate: nothing below this line runs for an unverified delivery.
  if (verified !== "valid") {
    const reason = verified === "no_secret"
      ? "secret_not_configured"
      : (!signature ? "missing_signature" : "signature_mismatch");
    addAuditEntry("polar_webhook_rejected", "polar", webhookId || "unknown", {
      reason,
      verified,
      hasWebhookId: !!webhookId,
      hasTimestamp: !!webhookTimestamp,
      bodyBytes: body.length
    });
    if (verified === "no_secret") {
      console.error("Polar webhook rejected: POLAR_WEBHOOK_SECRET is not set; deliveries are being refused.");
      return c.json(
        { received: false, error: "Webhook verification is not configured; delivery refused.", reason },
        503
      );
    }
    console.warn(`Polar webhook rejected: ${reason}`);
    return c.json({ received: false, error: `Invalid signature: ${reason}`, reason }, 401);
  }
  // --- end PATCH A gate. Below is the live handler, verified deliveries only.
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const eventType = parsed.type || parsed.event || "unknown";
  const eventId = webhookId || `polar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const env2 = c.env;
  let persisted = false;
  let duplicate = false;
  let entitlement = null;
  try {
    const ins = await env2.DB.prepare(
      "INSERT OR IGNORE INTO polar_webhook_events (webhook_id, event_type, received_at) VALUES (?1, ?2, ?3)"
    ).bind(eventId, eventType, (/* @__PURE__ */ new Date()).toISOString()).run();
    persisted = true;
    duplicate = (ins.meta?.changes ?? 0) === 0;
    if (!duplicate) {
      if (eventType === "customer.state_changed") {
        const touched = await syncPolarCustomerState(env2, parsed, eventType, eventId);
        entitlement = touched.length ? touched.join(",") : null;
      } else {
        entitlement = await upsertPolarEntitlement(env2, parsed, eventType, eventId);
      }
    }
  } catch (err) {
    addAuditEntry("polar_webhook_persist_failed", "polar", eventId, {
      error: err instanceof Error ? err.message : String(err)
    });
  }
  const polarEvent = {
    id: eventId,
    type: eventType,
    verified,
    payload: parsed,
    receivedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  polarEvents.unshift(polarEvent);
  if (polarEvents.length > 200) polarEvents.length = 200;
  addAuditEntry("polar_webhook", "polar", eventId, {
    eventType,
    verified,
    persisted,
    duplicate,
    entitlement,
    keys: Object.keys(parsed)
  });
  broadcastEvent("polar.event", polarEvent);
  dispatchWebhooks("polar.event_received", {
    eventId,
    eventType,
    verified,
    payload: parsed
  });
  return c.json({ received: true, id: eventId, verified, persisted, duplicate, entitlement });
});
app.get("/api/polar/events", (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const type = c.req.query("type");
  let results = polarEvents;
  if (type) {
    results = results.filter((e) => e.type === type);
  }
  return c.json(results.slice(0, limit));
});
function shapeEntitlement(r) {
  let caps = [];
  try {
    caps = JSON.parse(r.capabilities);
  } catch {
    caps = [];
  }
  return {
    subscriptionId: r.subscription_id,
    agent: r.external_customer_id,
    name: r.customer_name,
    customerId: r.customer_id,
    product: { id: r.product_id, name: r.product_name },
    status: r.status,
    active: r.active === 1,
    capabilities: caps,
    source: r.source,
    eventType: r.event_type,
    occurredAt: r.occurred_at,
    updatedAt: r.updated_at
  };
}
app.get("/api/polar/entitlements", async (c) => {
  const env2 = c.env;
  const agent = c.req.query("agent");
  const cap = c.req.query("cap");
  const activeOnly = c.req.query("active") === "1";
  const where = [];
  const binds = [];
  if (agent) {
    binds.push(agent);
    where.push(`external_customer_id = ?${binds.length}`);
  }
  if (activeOnly) where.push("active = 1");
  const sql = "SELECT * FROM polar_entitlements" + (where.length ? ` WHERE ${where.join(" AND ")}` : "") + " ORDER BY updated_at DESC";
  try {
    const stmt = binds.length ? env2.DB.prepare(sql).bind(...binds) : env2.DB.prepare(sql);
    const { results } = await stmt.all();
    let items = (results || []).map(shapeEntitlement);
    if (cap) items = items.filter((i) => i.capabilities.includes(cap));
    return c.json({ count: items.length, items });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
app.get("/api/polar/entitlements/check", async (c) => {
  const env2 = c.env;
  const agent = c.req.query("agent");
  const cap = c.req.query("cap");
  if (!agent || !cap) return c.json({ error: "agent and cap are required" }, 400);
  try {
    const { results } = await env2.DB.prepare(
      "SELECT * FROM polar_entitlements WHERE external_customer_id = ?1 AND active = 1"
    ).bind(agent).all();
    const rows = (results || []).map(shapeEntitlement);
    const granting = rows.filter((r) => r.capabilities.includes(cap));
    const all = /* @__PURE__ */ new Set();
    for (const r of rows) for (const x of r.capabilities) all.add(x);
    return c.json({
      agent,
      cap,
      allowed: granting.length > 0,
      via: granting.map((g) => ({ subscriptionId: g.subscriptionId, product: g.product.name })),
      capabilities: Array.from(all).sort()
    });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
app.get("/api/connections", (c) => {
  return c.json(Array.from(mcpConnections.values()));
});
app.post("/api/connections", async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.url) {
    return c.json({ error: "name and url are required" }, 400);
  }
  const id = body.name.toLowerCase().replace(/\s+/g, "_");
  if (mcpConnections.has(id)) {
    return c.json({ error: `Connection '${id}' already exists` }, 409);
  }
  let status = "disconnected";
  let tools;
  try {
    const res = await fetch(body.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {}
      })
    });
    if (res.ok) {
      status = "connected";
      const toolsRes = await fetch(body.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {}
        })
      });
      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        tools = toolsData.result?.tools;
      }
    }
  } catch {
    status = "error";
  }
  const connection = {
    id,
    name: body.name,
    url: body.url,
    status,
    tools,
    lastPing: status === "connected" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  mcpConnections.set(id, connection);
  addAuditEntry("created", "mcp", id, {
    name: connection.name,
    url: connection.url,
    status
  });
  return c.json(connection, 201);
});
app.post("/api/connections/:id/ping", async (c) => {
  const id = c.req.param("id");
  const connection = mcpConnections.get(id);
  if (!connection) {
    return c.json({ error: "Connection not found" }, 404);
  }
  try {
    const res = await fetch(connection.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {}
      })
    });
    connection.status = res.ok ? "connected" : "error";
    connection.lastPing = (/* @__PURE__ */ new Date()).toISOString();
    if (res.ok) {
      const toolsRes = await fetch(connection.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {}
        })
      });
      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        connection.tools = toolsData.result?.tools;
      }
    }
  } catch {
    connection.status = "error";
  }
  mcpConnections.set(id, connection);
  return c.json(connection);
});
app.post("/api/connections/:id/call", async (c) => {
  const id = c.req.param("id");
  const connection = mcpConnections.get(id);
  if (!connection) {
    return c.json({ error: "Connection not found" }, 404);
  }
  const body = await c.req.json();
  try {
    const res = await fetch(connection.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: body.method,
        params: body.params || {}
      })
    });
    const result = await res.json();
    addAuditEntry("proxied_call", "mcp", id, {
      connection: connection.name,
      method: body.method
    });
    return c.json(result);
  } catch (err) {
    return c.json(
      {
        error: err instanceof Error ? err.message : "Connection failed"
      },
      502
    );
  }
});
app.delete("/api/connections/:id", (c) => {
  const id = c.req.param("id");
  if (!mcpConnections.has(id)) {
    return c.json({ error: "Connection not found" }, 404);
  }
  mcpConnections.delete(id);
  return c.json({ deleted: true });
});
// claude-chat 2026-09-26: MCP spec - a server that does not offer a listening stream on GET must answer 405.
// The phone app (Ktor/Kotlin MCP client) opens this right after connecting; a 404 made it drop the connection.
app.get("/api/mcp", (c) => c.body(null, 405, { Allow: "POST" }));
app.delete("/api/mcp", (c) => c.body(null, 405, { Allow: "POST" }));
app.post("/api/mcp", async (c) => {
  const request = await c.req.json();
  // claude-chat 2026-09-25: JSON-RPC notifications (no id) get an empty 202 per the MCP spec.
  // Strict clients (Google AI Edge Gallery) reject a reply that has no id.
  if (request && !Array.isArray(request) && (request.id === undefined || request.id === null) &&
      typeof request.method === "string" && request.method.startsWith("notifications/")) {
    return new Response(null, { status: 202 });
  }
  if (request.jsonrpc !== "2.0") {
    return c.json(
      {
        jsonrpc: "2.0",
        id: request.id,
        error: { code: -32600, message: "Invalid JSON-RPC version" }
      },
      400
    );
  }
  switch (request.method) {
    case "ping": {
      return c.json({ jsonrpc: "2.0", id: request.id, result: {} });
    }
    case "initialize": {
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: true, listChanged: true },
            prompts: { listChanged: true }
          },
          serverInfo: {
            name: "polar-mcp",
            version: "2.0.0"
          }
        }
      });
    }
    case "notifications/initialized": {
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {}
      });
    }
    case "tools/list": {
      const tools = Array.from(skills.values()).map((skill) => ({
        name: skill.name,
        description: skill.description + (skill.chain ? ` [chains → ${skill.chain.join(" → ")}]` : ""),
        inputSchema: {
          type: "object",
          properties: Object.fromEntries(
            skill.parameters.map((p) => [
              p.name,
              { type: p.type, description: p.description }
            ])
          ),
          required: skill.parameters.filter((p) => p.required).map((p) => p.name)
        }
      }));
      tools.push(
        {
          name: "polar_set_variable",
          description: "Create or update a dynamic variable in the Polar MCP store",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Variable name"
              },
              value: {
                type: "string",
                description: "Variable value"
              },
              scope: {
                type: "string",
                description: "Scope: global, dev, staging, or prod"
              }
            },
            required: ["name", "value"]
          }
        },
        {
          name: "polar_get_variable",
          description: "Read a dynamic variable from the Polar MCP store",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Variable name to retrieve"
              }
            },
            required: ["name"]
          }
        },
        {
          name: "polar_list_variables",
          description: "List all dynamic variables, optionally filtered by scope",
          inputSchema: {
            type: "object",
            properties: {
              scope: {
                type: "string",
                description: "Filter by scope"
              }
            },
            required: []
          }
        },
        {
          name: "polar_list_skills",
          description: "List all available skills and their templates",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "polar_get_audit_log",
          description: "Retrieve recent audit log entries for observability",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Max entries to return (default 20)"
              },
              type: {
                type: "string",
                description: "Filter by resource type: variable, skill, webhook, mcp, polar"
              }
            },
            required: []
          }
        },
        {
          name: "polar_get_events",
          description: "Retrieve recent Polar.sh webhook events received by this server",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Max events to return (default 20)"
              },
              type: {
                type: "string",
                description: "Filter by event type (e.g. subscription.created, order.completed)"
              }
            },
            required: []
          }
        },
        {
          name: "polar_server_status",
          description: "Get the current status of this Polar MCP server — counts of variables, skills, webhooks, connections, and recent Polar events",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        // --- Integration Tools ---
        {
          name: "polar_mem_push",
          description: "Push a note to mem.ai. Requires MEM_API_KEY secret.",
          inputSchema: {
            type: "object",
            properties: {
              content: { type: "string", description: "Markdown content for the mem note" },
              context: { type: "string", description: "Optional context/instructions for Mem AI" }
            },
            required: ["content"]
          }
        },
        {
          name: "polar_mem_sync",
          description: "Sync the full Polar MCP server state (variables, skills, webhooks, connections, audit) to mem.ai as a note. Requires MEM_API_KEY.",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "polar_obsidian_export",
          description: "Export full server state as Obsidian-compatible markdown with YAML frontmatter",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "polar_slack_notify",
          description: "Send a notification to a Slack channel via incoming webhook. Requires SLACK_WEBHOOK_URL.",
          inputSchema: {
            type: "object",
            properties: {
              text: { type: "string", description: "Message text (supports Slack mrkdwn)" },
              channel: { type: "string", description: "Optional channel override" }
            },
            required: ["text"]
          }
        },
        // --- Skill Management Tools ---
        {
          name: "polar_create_skill",
          description: "Create a new skill with a template and parameters. Skills are reusable prompt templates with {{variable}} interpolation.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Unique skill name" },
              description: { type: "string", description: "What the skill does" },
              template: { type: "string", description: "Template string with {{placeholder}} syntax" },
              parameters: { type: "string", description: 'JSON array of parameter objects: [{"name":"x","type":"string","description":"...","required":true}]' },
              chain: { type: "string", description: "JSON array of skill IDs to chain after this skill" }
            },
            required: ["name", "template"]
          }
        },
        {
          name: "polar_execute_skill",
          description: "Execute a skill by name with inputs. Variables from the store are auto-interpolated into the template.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Skill name/ID to execute" },
              inputs: { type: "string", description: "JSON object of input key-value pairs" },
              scope: { type: "string", description: "Variable scope: global, dev, staging, or prod" }
            },
            required: ["name"]
          }
        },
        {
          name: "polar_delete_skill",
          description: "Delete a skill by name/ID",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Skill name/ID to delete" }
            },
            required: ["name"]
          }
        },
        // --- Webhook Management Tools ---
        {
          name: "polar_create_webhook",
          description: "Register a new webhook for event notifications. Events: variable.created, variable.updated, variable.deleted, skill.executed, skill.created, skill.deleted, mcp.tool_called, polar.event_received",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Unique webhook name" },
              url: { type: "string", description: "URL to POST notifications to" },
              events: { type: "string", description: 'JSON array of event names, e.g. ["variable.updated","skill.executed"]' },
              secret: { type: "string", description: "Optional HMAC-SHA256 signing secret" }
            },
            required: ["name", "url", "events"]
          }
        },
        {
          name: "polar_list_webhooks",
          description: "List all registered webhooks with event subscriptions and status",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "polar_delete_webhook",
          description: "Delete a webhook by name/ID",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Webhook name/ID to delete" }
            },
            required: ["name"]
          }
        },
        {
          name: "polar_test_webhook",
          description: "Send a test ping to a webhook to verify it is reachable",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Webhook name/ID to test" }
            },
            required: ["name"]
          }
        },
        // --- MCP Connection Tools ---
        {
          name: "polar_list_connections",
          description: "List all registered external MCP server connections with status and discovered tools",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        // --- Batch Orchestration ---
        {
          name: "polar_batch_execute",
          description: "Execute a skill N times with different input sets in one call. Mini orchestration engine — pass an array of input objects and get all results back. Great for bulk operations like processing multiple orders.",
          inputSchema: {
            type: "object",
            properties: {
              skill: { type: "string", description: "Skill name to execute" },
              batch: { type: "string", description: 'JSON array of input objects, e.g. [{"customer":"alice","qty":"2"},{"customer":"bob","qty":"1"}]' },
              scope: { type: "string", description: "Variable scope for interpolation" }
            },
            required: ["skill", "batch"]
          }
        },
        {
          name: "polar_ai_chat",
          description: "Run a prompt through Workers AI (Llama 3.3 70B) right on this server. Returns the model's response. Requires the AI binding to be deployed.",
          inputSchema: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "The prompt to send to the model" },
              max_tokens: { type: "string", description: "Max tokens in the response (default 1024)" }
            },
            required: ["prompt"]
          }
        },
        {
          name: "polar_vector_search",
          description: "Semantic search over the polar-vectors Vectorize index. Embeds the query and returns the closest stored memories with scores. Requires VECTORS + AI bindings.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Natural-language search query" },
              top_k: { type: "string", description: "How many matches to return (default 5)" }
            },
            required: ["query"]
          }
        }
      );
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: { tools }
      });
    }
    case "tools/call": {
      const params = request.params;
      addAuditEntry("tool_called", "mcp", params.name, {
        arguments: params.arguments
      });
      dispatchWebhooks("mcp.tool_called", {
        tool: params.name,
        arguments: params.arguments
      });
      if (params.name === "polar_set_variable") {
        const args = params.arguments || {};
        const name = args.name;
        const value = args.value;
        if (!name || value === void 0) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32602,
              message: "name and value are required"
            }
          });
        }
        const id = name.toLowerCase().replace(/\s+/g, "_");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const existing = variables.get(id);
        const variable = {
          id,
          name,
          value: String(value),
          type: "string",
          description: existing?.description || "",
          scope: args.scope || existing?.scope || "global",
          createdAt: existing?.createdAt || now,
          updatedAt: now
        };
        variables.set(id, variable);
        addAuditEntry(
          existing ? "updated" : "created",
          "variable",
          id,
          { via: "mcp_tool", value }
        );
        broadcastEvent("variable.updated", variable);
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: `Variable '${name}' ${existing ? "updated" : "created"} with value '${value}' in scope '${variable.scope}'`
              }
            ]
          }
        });
      }
      if (params.name === "polar_get_variable") {
        const args = params.arguments || {};
        const variable = variables.get(
          args.name?.toLowerCase().replace(/\s+/g, "_") || ""
        );
        if (!variable) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Variable '${args.name}' not found`
                }
              ],
              isError: true
            }
          });
        }
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(variable, null, 2)
              }
            ]
          }
        });
      }
      if (params.name === "polar_list_variables") {
        const args = params.arguments || {};
        let vars = Array.from(variables.values());
        if (args.scope) {
          vars = vars.filter(
            (v) => v.scope === args.scope || v.scope === "global"
          );
        }
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(vars, null, 2)
              }
            ]
          }
        });
      }
      if (params.name === "polar_list_skills") {
        const allSkills = Array.from(skills.values()).map((s) => ({
          name: s.name,
          description: s.description,
          template: s.template,
          parameters: s.parameters,
          chain: s.chain
        }));
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(allSkills, null, 2)
              }
            ]
          }
        });
      }
      if (params.name === "polar_get_audit_log") {
        const args = params.arguments || {};
        const limit = parseInt(args.limit || "20");
        let results = auditLog;
        if (args.type) {
          results = results.filter(
            (e) => e.resourceType === args.type
          );
        }
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  results.slice(0, limit),
                  null,
                  2
                )
              }
            ]
          }
        });
      }
      if (params.name === "polar_get_events") {
        const args = params.arguments || {};
        const limit = parseInt(args.limit || "20");
        let results = polarEvents;
        if (args.type) {
          results = results.filter((e) => e.type === args.type);
        }
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  results.slice(0, limit),
                  null,
                  2
                )
              }
            ]
          }
        });
      }
      if (params.name === "polar_server_status") {
        const status = {
          variables: variables.size,
          skills: skills.size,
          webhooks: webhooks.size,
          mcpConnections: mcpConnections.size,
          auditEntries: auditLog.length,
          polarEvents: polarEvents.length,
          sseClients: sseClients.size,
          recentPolarEvents: polarEvents.slice(0, 5).map((e) => ({
            id: e.id,
            type: e.type,
            verified: e.verified,
            receivedAt: e.receivedAt
          })),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(status, null, 2)
              }
            ]
          }
        });
      }
      if (params.name === "polar_mem_push") {
        const args = params.arguments || {};
        const apiKey = getEnv(c, "MEM_API_KEY");
        if (!apiKey) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{ type: "text", text: "MEM_API_KEY not configured. Set via: wrangler secret put MEM_API_KEY" }],
              isError: true
            }
          });
        }
        if (!args.content) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "content is required" } });
        }
        const memContent = args.context ? `${args.content}

---
Context: ${args.context}` : args.content;
        const resp = await fetch("https://api.mem.ai/v0/mems", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ content: memContent })
        });
        const memResult = await resp.json();
        addAuditEntry("mem_push", "mcp", "mem.ai", { via: "mcp_tool", status: resp.status });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ ok: resp.ok, status: resp.status, result: memResult }, null, 2) }]
          }
        });
      }
      if (params.name === "polar_mem_sync") {
        const apiKey = getEnv(c, "MEM_API_KEY");
        if (!apiKey) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{ type: "text", text: "MEM_API_KEY not configured. Set via: wrangler secret put MEM_API_KEY" }],
              isError: true
            }
          });
        }
        const allVars = Array.from(variables.values());
        const allSkills = Array.from(skills.values());
        const allWh = Array.from(webhooks.values());
        const allConns = Array.from(mcpConnections.values());
        const content = [
          `# Polar MCP State Sync`,
          `Synced: ${(/* @__PURE__ */ new Date()).toISOString()}`,
          ``,
          `## Variables (${allVars.length})`,
          ...allVars.map((v) => `- **${v.name}** = \`${v.value}\` (${v.scope}/${v.type})`),
          ``,
          `## Skills (${allSkills.length})`,
          ...allSkills.map((s) => `- **${s.name}**: ${s.description}`),
          ``,
          `## Webhooks (${allWh.length})`,
          ...allWh.map((w) => `- **${w.name}** → ${w.url} (${w.active ? "active" : "inactive"})`),
          ``,
          `## Connections (${allConns.length})`,
          ...allConns.map((mc) => `- **${mc.name}** → ${mc.url} (${mc.status})`),
          ``,
          `## Recent Audit (last 20)`,
          ...auditLog.slice(0, 20).map((a) => `- ${a.timestamp} ${a.action} on ${a.resourceType}/${a.resourceId}`)
        ].join("\n");
        const resp = await fetch("https://api.mem.ai/v0/mems", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ content })
        });
        const syncResult = await resp.json();
        addAuditEntry("mem_sync", "mcp", "mem.ai", { via: "mcp_tool", status: resp.status });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ ok: resp.ok, status: resp.status, result: syncResult }, null, 2) }]
          }
        });
      }
      if (params.name === "polar_obsidian_export") {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const vars = Array.from(variables.values());
        const sk = Array.from(skills.values());
        const wh = Array.from(webhooks.values());
        let md = `---
title: Polar MCP Server State
date: ${now}
tags: [polar-mcp, auto-sync]
---

# Polar MCP Server State

> Exported ${now}

## Variables (${vars.length})

| Name | Value | Scope | Type |
|------|-------|-------|------|
`;
        for (const v of vars) md += `| ${v.name} | \`${v.value}\` | ${v.scope} | ${v.type} |
`;
        md += `
## Skills (${sk.length})

`;
        for (const s of sk) {
          md += `### ${s.name}
${s.description}
- Template: \`${s.template}\`
`;
          if (s.chain?.length) md += `- Chain: ${s.chain.join(" → ")}
`;
          md += "\n";
        }
        md += `## Webhooks (${wh.length})

`;
        for (const w of wh) md += `- **${w.name}** — ${w.active ? "active" : "inactive"} — ${w.events.join(", ")}
`;
        md += `
## Audit Log (last 10 of ${auditLog.length})

`;
        for (const a of auditLog.slice(0, 10)) md += `- \`${a.action}\` on ${a.resourceType}/${a.resourceId} — ${a.timestamp}
`;
        addAuditEntry("obsidian_export", "mcp", "obsidian", { via: "mcp_tool" });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: md }] }
        });
      }
      if (params.name === "polar_slack_notify") {
        const args = params.arguments || {};
        const slackWebhookUrl = getEnv(c, "SLACK_WEBHOOK_URL");
        if (!slackWebhookUrl) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{ type: "text", text: "SLACK_WEBHOOK_URL not configured. Set via: wrangler secret put SLACK_WEBHOOK_URL" }],
              isError: true
            }
          });
        }
        if (!args.text) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "text is required" } });
        }
        const payload = { text: args.text };
        if (args.channel) payload.channel = args.channel;
        const resp = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        addAuditEntry("slack_notify", "mcp", "slack", { via: "mcp_tool", status: resp.status });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ ok: resp.ok, status: resp.status }, null, 2) }]
          }
        });
      }
      if (params.name === "polar_create_skill") {
        const args = params.arguments || {};
        if (!args.name || !args.template) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "name and template are required" } });
        }
        const skillId = args.name.toLowerCase().replace(/\s+/g, "_");
        if (skills.has(skillId)) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Skill '${skillId}' already exists` }], isError: true }
          });
        }
        let parsedParams = [];
        if (args.parameters) {
          try {
            parsedParams = JSON.parse(args.parameters);
          } catch {
            return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "parameters must be valid JSON array" } });
          }
        }
        let parsedChain;
        if (args.chain) {
          try {
            parsedChain = JSON.parse(args.chain);
          } catch {
            return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "chain must be valid JSON array" } });
          }
        }
        const newSkill = {
          id: skillId,
          name: args.name,
          description: args.description || "",
          template: args.template,
          parameters: parsedParams,
          chain: parsedChain,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        skills.set(skillId, newSkill);
        addAuditEntry("created", "skill", skillId, { via: "mcp_tool" });
        dispatchWebhooks("skill.created", { skill: { id: skillId, name: newSkill.name } });
        broadcastEvent("skill.created", newSkill);
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: JSON.stringify(newSkill, null, 2) }] }
        });
      }
      if (params.name === "polar_execute_skill") {
        const args = params.arguments || {};
        const skillId = (args.name || "").toLowerCase().replace(/\s+/g, "_");
        const targetSkill = skills.get(skillId);
        if (!targetSkill) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Skill '${args.name}' not found` }], isError: true }
          });
        }
        let inputs2 = {};
        if (args.inputs) {
          try {
            inputs2 = JSON.parse(args.inputs);
          } catch {
            return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "inputs must be valid JSON object" } });
          }
        }
        const execResult = executeSkillChain(targetSkill, inputs2, args.scope);
        addAuditEntry("executed", "skill", skillId, { via: "mcp_tool", inputs: inputs2 });
        dispatchWebhooks("skill.executed", { skill: { id: skillId, name: targetSkill.name }, inputs: inputs2 });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                skill: targetSkill.name,
                output: execResult.steps[execResult.steps.length - 1].resolvedTemplate,
                variablesUsed: execResult.steps[0].variablesUsed,
                chain: execResult.steps.length > 1 ? execResult.steps.map((s) => s.skillName) : void 0
              }, null, 2)
            }]
          }
        });
      }
      if (params.name === "polar_delete_skill") {
        const args = params.arguments || {};
        const skillId = (args.name || "").toLowerCase().replace(/\s+/g, "_");
        if (!skills.has(skillId)) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Skill '${args.name}' not found` }], isError: true }
          });
        }
        const deleted = skills.get(skillId);
        skills.delete(skillId);
        addAuditEntry("deleted", "skill", skillId, { via: "mcp_tool" });
        dispatchWebhooks("skill.deleted", { skill: { id: skillId, name: deleted.name } });
        broadcastEvent("skill.deleted", { id: skillId });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: `Skill '${deleted.name}' deleted` }] }
        });
      }
      if (params.name === "polar_create_webhook") {
        const args = params.arguments || {};
        if (!args.name || !args.url || !args.events) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "name, url, and events are required" } });
        }
        let parsedEvents;
        try {
          parsedEvents = JSON.parse(args.events);
        } catch {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "events must be valid JSON array" } });
        }
        const whId = args.name.toLowerCase().replace(/\s+/g, "_");
        if (webhooks.has(whId)) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Webhook '${whId}' already exists` }], isError: true }
          });
        }
        const newWh = {
          id: whId,
          name: args.name,
          url: args.url,
          events: parsedEvents,
          active: true,
          secret: args.secret,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        webhooks.set(whId, newWh);
        addAuditEntry("created", "webhook", whId, { via: "mcp_tool", url: args.url });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: JSON.stringify(newWh, null, 2) }] }
        });
      }
      if (params.name === "polar_list_webhooks") {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: JSON.stringify(Array.from(webhooks.values()), null, 2) }] }
        });
      }
      if (params.name === "polar_delete_webhook") {
        const args = params.arguments || {};
        const whId = (args.name || "").toLowerCase().replace(/\s+/g, "_");
        if (!webhooks.has(whId)) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Webhook '${args.name}' not found` }], isError: true }
          });
        }
        webhooks.delete(whId);
        addAuditEntry("deleted", "webhook", whId, { via: "mcp_tool" });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: `Webhook '${args.name}' deleted` }] }
        });
      }
      if (params.name === "polar_test_webhook") {
        const args = params.arguments || {};
        const whId = (args.name || "").toLowerCase().replace(/\s+/g, "_");
        const wh = webhooks.get(whId);
        if (!wh) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Webhook '${args.name}' not found` }], isError: true }
          });
        }
        try {
          const res = await fetch(wh.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "webhook.test",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              payload: { message: "Test ping from Polar MCP (via MCP tool)" }
            })
          });
          addAuditEntry("webhook_test", "webhook", whId, { via: "mcp_tool", status: res.status });
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{ type: "text", text: JSON.stringify({ success: true, status: res.status }, null, 2) }]
            }
          });
        } catch (err) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{ type: "text", text: JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Request failed" }, null, 2) }],
              isError: true
            }
          });
        }
      }
      if (params.name === "polar_list_connections") {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: JSON.stringify(Array.from(mcpConnections.values()), null, 2) }] }
        });
      }
      if (params.name === "polar_batch_execute") {
        const args = params.arguments || {};
        const skillName = (args.skill || "").toLowerCase().replace(/\s+/g, "_");
        const batchSkill = skills.get(skillName);
        if (!batchSkill) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Skill '${args.skill}' not found` }], isError: true }
          });
        }
        let batch;
        try {
          batch = JSON.parse(args.batch || "[]");
        } catch {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "batch must be valid JSON array" } });
        }
        if (!Array.isArray(batch) || batch.length === 0) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "batch must be a non-empty array of input objects" } });
        }
        const cap = 100;
        if (batch.length > cap) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: `Batch size ${batch.length} exceeds cap of ${cap}` } });
        }
        const startTime = Date.now();
        const batchResults = batch.map((inputs2, i) => {
          try {
            const result2 = executeSkillChain(batchSkill, inputs2, args.scope);
            return {
              index: i,
              ok: true,
              output: result2.steps[result2.steps.length - 1].resolvedTemplate,
              variablesUsed: result2.steps[0].variablesUsed
            };
          } catch (err) {
            return { index: i, ok: false, error: String(err) };
          }
        });
        const elapsed = Date.now() - startTime;
        const succeeded = batchResults.filter((r) => r.ok).length;
        const failed = batchResults.length - succeeded;
        addAuditEntry("batch_execute", "skill", skillName, {
          via: "mcp_tool",
          batchSize: batch.length,
          succeeded,
          failed,
          elapsedMs: elapsed
        });
        dispatchWebhooks("skill.executed", {
          skill: { id: skillName, name: batchSkill.name },
          batch: true,
          count: batch.length,
          succeeded,
          failed
        });
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                skill: batchSkill.name,
                total: batch.length,
                succeeded,
                failed,
                elapsedMs: elapsed,
                results: batchResults
              }, null, 2)
            }]
          }
        });
      }
      if (params.name === "polar_ai_chat") {
        const args = params.arguments || {};
        const env2 = c.env;
        if (!env2.AI) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: "501: AI binding not live — deploy the worker first." }] }
          });
        }
        if (!args.prompt) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "prompt is required" } });
        }
        try {
          const resp = await env2.AI.run(CHAT_MODEL, {
            messages: [{ role: "user", content: args.prompt }],
            max_tokens: Number(args.max_tokens) || 1024
          }, AI_GATEWAY);
          addAuditEntry("ai.chat", "mcp", CHAT_MODEL, { via: "mcp_tool" });
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: resp.response ?? "" }] }
          });
        } catch (err) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `AI call failed: ${String(err)}` }] }
          });
        }
      }
      if (params.name === "polar_vector_search") {
        const args = params.arguments || {};
        const env2 = c.env;
        if (!env2.VECTORS || !env2.AI) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: "501: VECTORS/AI binding not live — create index polar-vectors and deploy." }] }
          });
        }
        if (!args.query) {
          return c.json({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "query is required" } });
        }
        try {
          const embedResp = await env2.AI.run(EMBED_MODEL, { text: [args.query] }, AI_GATEWAY);
          const values = embedResp.data?.[0];
          if (!values) throw new Error("embedding failed");
          const matches = await env2.VECTORS.query(values, { topK: Math.min(Number(args.top_k) || 5, 20), returnMetadata: true });
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{
                type: "text",
                text: JSON.stringify({ query: args.query, matches: matches.matches }, null, 2)
              }]
            }
          });
        } catch (err) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: `Vector search failed: ${String(err)}` }] }
          });
        }
      }
      const skill = skills.get(params.name);
      if (!skill) {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32602,
            message: `Unknown tool: ${params.name}`
          }
        });
      }
      const inputs = params.arguments || {};
      const result = executeSkillChain(skill, inputs);
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          content: [
            {
              type: "text",
              text: result.steps[result.steps.length - 1].resolvedTemplate
            }
          ],
          meta: {
            variablesUsed: result.steps[0].variablesUsed,
            chain: result.steps.length > 1 ? result.steps.map((s) => s.skillName) : void 0
          }
        }
      });
    }
    case "prompts/list": {
      const prompts = Array.from(skills.values()).map((skill) => ({
        name: skill.name,
        description: skill.description,
        arguments: skill.parameters.map((p) => ({
          name: p.name,
          description: p.description,
          required: p.required
        }))
      }));
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: { prompts }
      });
    }
    case "prompts/get": {
      const params = request.params;
      const skill = skills.get(params.name);
      if (!skill) {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32602,
            message: `Unknown prompt: ${params.name}`
          }
        });
      }
      const inputs = params.arguments || {};
      const { resolved, variablesUsed } = interpolateTemplate(
        skill.template,
        inputs
      );
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          description: skill.description,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: resolved
              }
            }
          ],
          meta: { variablesUsed }
        }
      });
    }
    case "resources/list": {
      const resources = Array.from(variables.values()).map((v) => ({
        uri: `polar://variables/${v.id}`,
        name: `${v.name} (${v.scope})`,
        description: v.description,
        mimeType: "text/plain"
      }));
      resources.push({
        uri: "polar://audit/recent",
        name: "Recent Audit Log",
        description: "Last 50 audit entries",
        mimeType: "application/json"
      });
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: { resources }
      });
    }
    case "resources/read": {
      const params = request.params;
      addAuditEntry("resource_read", "mcp", params.uri, {});
      dispatchWebhooks("mcp.resource_read", { uri: params.uri });
      if (params.uri === "polar://audit/recent") {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            contents: [
              {
                uri: params.uri,
                mimeType: "application/json",
                text: JSON.stringify(
                  auditLog.slice(0, 50),
                  null,
                  2
                )
              }
            ]
          }
        });
      }
      const varId = params.uri.replace("polar://variables/", "");
      const variable = variables.get(varId);
      if (!variable) {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32602,
            message: `Unknown resource: ${params.uri}`
          }
        });
      }
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          contents: [
            {
              uri: params.uri,
              mimeType: "text/plain",
              text: variable.value
            }
          ]
        }
      });
    }
    case "resources/subscribe": {
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {}
      });
    }
    default: {
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`
        }
      });
    }
  }
});
app.get("/docs", (c) => {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Polar MCP Server",
      version: "3.0.0",
      description: "MCP-native server with dynamic variables, skills, webhooks, audit logging, Polar.sh integration, and external service bindings (mem.ai, Obsidian, Slack, Google)."
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/": {
        get: {
          summary: "Health check",
          tags: ["System"],
          responses: { "200": { description: "Server status and capabilities" } }
        }
      },
      "/api/variables": {
        get: {
          summary: "List variables",
          tags: ["Variables"],
          parameters: [{ name: "scope", in: "query", schema: { type: "string", enum: ["global", "dev", "staging", "prod"] } }],
          responses: { "200": { description: "Array of variables" } }
        },
        post: {
          summary: "Create variable",
          tags: ["Variables"],
          requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "value"], properties: { name: { type: "string" }, value: { type: "string" }, type: { type: "string", enum: ["string", "number", "boolean", "json"] }, description: { type: "string" }, scope: { type: "string", enum: ["global", "dev", "staging", "prod"] } } } } } },
          responses: { "201": { description: "Created variable" } }
        }
      },
      "/api/variables/{id}": {
        put: {
          summary: "Update variable",
          tags: ["Variables"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated variable" } }
        },
        delete: {
          summary: "Delete variable",
          tags: ["Variables"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deletion confirmed" } }
        }
      },
      "/api/skills": {
        get: { summary: "List skills", tags: ["Skills"], responses: { "200": { description: "Array of skills" } } },
        post: { summary: "Create skill", tags: ["Skills"], responses: { "201": { description: "Created skill" } } }
      },
      "/api/skills/{id}": {
        put: { summary: "Update skill", tags: ["Skills"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated skill" } } },
        delete: { summary: "Delete skill", tags: ["Skills"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deletion confirmed" } } }
      },
      "/api/skills/{id}/execute": {
        post: { summary: "Execute a skill", tags: ["Skills"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Execution result" } } }
      },
      "/api/webhooks": {
        get: { summary: "List webhooks", tags: ["Webhooks"], responses: { "200": { description: "Array of webhooks" } } },
        post: { summary: "Create webhook", tags: ["Webhooks"], responses: { "201": { description: "Created webhook" } } }
      },
      "/api/webhooks/{id}": {
        put: { summary: "Update webhook", tags: ["Webhooks"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated webhook" } } },
        delete: { summary: "Delete webhook", tags: ["Webhooks"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deletion confirmed" } } }
      },
      "/api/webhooks/{id}/test": {
        post: { summary: "Test webhook delivery", tags: ["Webhooks"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Test result" } } }
      },
      "/api/audit": {
        get: {
          summary: "Query audit log",
          tags: ["Audit"],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
            { name: "resourceType", in: "query", schema: { type: "string" } },
            { name: "action", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": { description: "Array of audit entries" } }
        }
      },
      "/api/events": {
        get: { summary: "SSE event stream", tags: ["System"], responses: { "200": { description: "text/event-stream" } } }
      },
      "/api/polar/webhook": {
        post: { summary: "Receive Polar.sh webhook", tags: ["Polar"], responses: { "200": { description: "Acknowledgement with event ID and verification status" } } }
      },
      "/api/polar/events": {
        get: {
          summary: "List received Polar events",
          tags: ["Polar"],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
            { name: "type", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": { description: "Array of Polar events" } }
        }
      },
      "/api/connections": {
        get: { summary: "List MCP connections", tags: ["MCP Connections"], responses: { "200": { description: "Array of connections" } } },
        post: { summary: "Add MCP connection", tags: ["MCP Connections"], responses: { "201": { description: "Created connection" } } }
      },
      "/api/connections/{id}/ping": {
        post: { summary: "Ping MCP connection", tags: ["MCP Connections"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Ping result" } } }
      },
      "/api/connections/{id}/call": {
        post: { summary: "Call tool on MCP connection", tags: ["MCP Connections"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Tool call result" } } }
      },
      "/api/mcp": {
        post: { summary: "MCP JSON-RPC 2.0 endpoint", tags: ["MCP Protocol"], responses: { "200": { description: "JSON-RPC response" } } }
      },
      "/api/integrations/mem/push": {
        post: {
          summary: "Push a note to mem.ai",
          tags: ["Integrations"],
          requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string", description: "Markdown content for the mem" }, context: { type: "string", description: "Optional context/instructions for Mem AI" } } } } } },
          responses: { "200": { description: "Mem.ai API response" }, "501": { description: "MEM_API_KEY not configured" } }
        }
      },
      "/api/integrations/obsidian/export": {
        get: {
          summary: "Export server state as Obsidian-compatible markdown",
          tags: ["Integrations"],
          responses: { "200": { description: "Markdown document with YAML frontmatter" } }
        }
      },
      "/api/integrations/slack/commands": {
        post: {
          summary: "Receive Slack slash command",
          tags: ["Integrations"],
          responses: { "200": { description: "Slack response payload" }, "501": { description: "SLACK_SIGNING_SECRET not configured" } }
        }
      },
      "/api/integrations/slack/notify": {
        post: {
          summary: "Send notification to Slack channel",
          tags: ["Integrations"],
          requestBody: { content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" }, channel: { type: "string" } } } } } },
          responses: { "200": { description: "Slack API response" }, "501": { description: "SLACK_WEBHOOK_URL not configured" } }
        }
      },
      "/docs": {
        get: { summary: "This OpenAPI spec", tags: ["System"], responses: { "200": { description: "OpenAPI 3.1 JSON" } } }
      }
    }
  };
  return c.json(spec);
});
function getEnv(c, key) {
  return c.env[key];
}
app.post("/api/integrations/mem/push", async (c) => {
  const apiKey = getEnv(c, "MEM_API_KEY");
  if (!apiKey) {
    return c.json(
      {
        error: "MEM_API_KEY not configured",
        setup: "Set via: wrangler secret put MEM_API_KEY — get your key at https://mem.ai → Flows → API"
      },
      501
    );
  }
  const body = await c.req.json();
  if (!body.content) {
    return c.json({ error: "content is required" }, 400);
  }
  const memPayload = { content: body.content };
  if (body.context) memPayload.context = body.context;
  const resp = await fetch("https://api.mem.ai/v0/mems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(memPayload)
  });
  const result = await resp.json();
  addAuditEntry("mem_push", "mcp", "mem.ai", {
    status: resp.status,
    contentLength: body.content.length
  });
  return c.json({ ok: resp.ok, status: resp.status, result });
});
app.get("/api/integrations/obsidian/export", (_c) => {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const allVars = Array.from(variables.values());
  const allSkills = Array.from(skills.values());
  const allWebhooks = Array.from(webhooks.values());
  const recentAudit = auditLog.slice(0, 20);
  const recentPolar = polarEvents.slice(0, 10);
  let md = `---
title: Polar MCP Server State
date: "${now}"
tags: [polar-mcp, symphony, server-state]
source: polar-mcp-export
variables_count: ${allVars.length}
skills_count: ${allSkills.length}
webhooks_count: ${allWebhooks.length}
polar_events_count: ${polarEvents.length}
---

# Polar MCP Server State

> Exported ${now}

## Variables (${allVars.length})

| Name | Value | Scope | Type |
|------|-------|-------|------|
`;
  for (const v of allVars) {
    md += `| ${v.name} | \`${v.value}\` | ${v.scope} | ${v.type} |
`;
  }
  md += `
## Skills (${allSkills.length})

`;
  for (const s of allSkills) {
    md += `### ${s.name}
${s.description}
\`\`\`
${s.template}
\`\`\`
`;
    if (s.chain?.length) md += `Chain: ${s.chain.join(" → ")}
`;
    md += "\n";
  }
  md += `## Webhooks (${allWebhooks.length})

`;
  for (const w of allWebhooks) {
    md += `- **${w.name}** → \`${w.url}\` (${w.active ? "active" : "inactive"}) — events: ${w.events.join(", ")}
`;
  }
  md += `
## Recent Audit (last 20)

`;
  for (const a of recentAudit) {
    md += `- \`${a.timestamp}\` **${a.action}** on ${a.resourceType}/${a.resourceId}
`;
  }
  if (recentPolar.length > 0) {
    md += `
## Recent Polar Events (last 10)

`;
    for (const p of recentPolar) {
      md += `- \`${p.receivedAt}\` **${p.type}** (${p.verified}) — ${p.id}
`;
    }
  }
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="polar-mcp-state-${now.slice(0, 10)}.md"`
    }
  });
});
app.post("/api/integrations/slack/commands", async (c) => {
  const signingSecret = getEnv(c, "SLACK_SIGNING_SECRET");
  if (!signingSecret) {
    return c.json(
      {
        error: "SLACK_SIGNING_SECRET not configured",
        setup: "Set via: wrangler secret put SLACK_SIGNING_SECRET — get from https://api.slack.com/apps → Basic Information → Signing Secret"
      },
      501
    );
  }
  const body = await c.req.text();
  const params = new URLSearchParams(body);
  const command = params.get("command") || "";
  const text = params.get("text") || "";
  const userId = params.get("user_id") || "unknown";
  addAuditEntry("slack_command", "mcp", command, {
    text,
    userId
  });
  if (command === "/polar-get" || text.startsWith("get ")) {
    const varName = text.replace("get ", "").trim();
    const v = variables.get(varName);
    if (v) {
      return c.json({
        response_type: "in_channel",
        text: `*${v.name}* = \`${v.value}\` (${v.scope}/${v.type})`
      });
    }
    return c.json({
      response_type: "ephemeral",
      text: `Variable \`${varName}\` not found. Available: ${Array.from(variables.keys()).join(", ")}`
    });
  }
  if (command === "/polar-status" || text === "status") {
    return c.json({
      response_type: "in_channel",
      text: `*Polar MCP Status*
Variables: ${variables.size} | Skills: ${skills.size} | Webhooks: ${webhooks.size} | Polar Events: ${polarEvents.length} | Audit Entries: ${auditLog.length}`
    });
  }
  if (command === "/polar-skills" || text === "skills") {
    const skillList = Array.from(skills.values()).map((s) => `• *${s.name}*: ${s.description}`).join("\n");
    return c.json({
      response_type: "ephemeral",
      text: skillList || "No skills configured."
    });
  }
  return c.json({
    response_type: "ephemeral",
    text: `Available commands: \`get <var>\`, \`status\`, \`skills\``
  });
});
app.post("/api/integrations/slack/notify", async (c) => {
  const webhookUrl = getEnv(c, "SLACK_WEBHOOK_URL");
  if (!webhookUrl) {
    return c.json(
      {
        error: "SLACK_WEBHOOK_URL not configured",
        setup: "Set via: wrangler secret put SLACK_WEBHOOK_URL — create an incoming webhook at https://api.slack.com/apps → Incoming Webhooks"
      },
      501
    );
  }
  const body = await c.req.json();
  if (!body.text) {
    return c.json({ error: "text is required" }, 400);
  }
  const payload = { text: body.text };
  if (body.channel) payload.channel = body.channel;
  const resp = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await resp.text();
  addAuditEntry("slack_notify", "mcp", "slack", {
    status: resp.status,
    textLength: body.text.length
  });
  return c.json({ ok: resp.ok, status: resp.status, result });
});
// ============================================================================
// PATCH B — Discord slash-command ingress onto the agent message bus
// ----------------------------------------------------------------------------
// INSERT this whole block into the live polar-mcp Worker immediately BEFORE
// the line that reads exactly:
//   app.get("/api/integrations/google/status", (c) => {
// (i.e. right after the closing `});` of the /api/integrations/slack/notify
// handler). Nothing else in the file needs to change.
//
// Routes added:
//   POST /api/integrations/discord/interactions   Discord Interactions Endpoint
//   GET  /api/integrations/discord/commands       /omega command manifest (JSON)
//
// Secrets read (set in Cloudflare -> polar-mcp -> Settings -> Variables):
//   DISCORD_PUBLIC_KEY    hex Ed25519 key from the app's General Information page
//   DISCORD_OPERATOR_IDS  comma-separated Discord user ids allowed to run /omega bind
//
// Authorization chain (deliberately in this order):
//   Discord user id -> discord_identities -> Polar customer
//                                         -> polar_entitlements.capabilities
// An unbound Discord account holds NO capabilities. send/inbox/ack need
// `comms.send`; bind needs `registry.admin` OR an id in DISCORD_OPERATOR_IDS
// (the operator list exists only to create the first binding).
//
// Ported from vagblasterxl/chanfana-openapi-template PR #2 (commit 93a5b01,
// 33 passing Discord tests) into plain JS / Hono. Reuses the live helpers
// `hexToBytes`, `addAuditEntry`, `shapeEntitlement`, `ensureCommsSchema`
// (all hoisted function declarations in this bundle).
// ============================================================================

// ---- Discord wire constants -------------------------------------------------
const DISCORD_INTERACTION_PING = 1;
const DISCORD_INTERACTION_APPLICATION_COMMAND = 2;
const DISCORD_RESPONSE_PONG = 1;
const DISCORD_RESPONSE_CHANNEL_MESSAGE = 4;
const DISCORD_FLAG_EPHEMERAL = 64;
const DISCORD_TIMESTAMP_TOLERANCE_SECONDS = 300;
const DISCORD_CONTENT_LIMIT = 1900;
const DISCORD_DEFAULT_INBOX_LIMIT = 5;
const DISCORD_MAX_INBOX_LIMIT = 25;
const DISCORD_AGENT_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,63}$/i;
const CAP_COMMS_SEND = "comms.send";
const CAP_REGISTRY_ADMIN = "registry.admin";

// ---- Ed25519 verification ---------------------------------------------------
// Discord signs `${x-signature-timestamp}${rawBody}`. There is no unverified
// path: a missing/malformed public key is a 503 (our outage), a bad signature
// is a 401 (Discord's endpoint registration probe REQUIRES the 401).
async function importDiscordPublicKey(raw) {
  try {
    return await crypto.subtle.importKey("raw", raw, { name: "Ed25519" }, false, ["verify"]);
  } catch {
    // Older workerd only knew Cloudflare's original spelling.
    return await crypto.subtle.importKey(
      "raw",
      raw,
      { name: "NODE-ED25519", namedCurve: "NODE-ED25519" },
      false,
      ["verify"]
    );
  }
}
function discordIsConfigFailure(reason) {
  return reason === "public_key_not_configured" || reason === "malformed_public_key";
}
async function verifyDiscordInteraction(rawBody, headers, publicKeyHex, now = /* @__PURE__ */ new Date()) {
  if (!publicKeyHex || publicKeyHex.trim() === "") {
    return { ok: false, reason: "public_key_not_configured" };
  }
  const publicKeyBytes = hexToBytes(publicKeyHex.trim());
  if (!publicKeyBytes || publicKeyBytes.byteLength !== 32) {
    return { ok: false, reason: "malformed_public_key" };
  }
  const signatureHex = headers.get("x-signature-ed25519");
  if (!signatureHex) return { ok: false, reason: "missing_signature" };
  const signature = hexToBytes(signatureHex.trim());
  if (!signature || signature.byteLength !== 64) {
    return { ok: false, reason: "malformed_signature" };
  }
  const timestampHeader = headers.get("x-signature-timestamp");
  if (!timestampHeader) return { ok: false, reason: "missing_timestamp" };
  const ts = timestampHeader.trim();
  if (!/^\d+$/.test(ts)) return { ok: false, reason: "malformed_timestamp" };
  const age = Math.abs(Math.floor(now.getTime() / 1e3) - Number(ts));
  if (age > DISCORD_TIMESTAMP_TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp_out_of_tolerance" };
  }
  let key;
  try {
    key = await importDiscordPublicKey(publicKeyBytes);
  } catch {
    return { ok: false, reason: "malformed_public_key" };
  }
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      { name: key.algorithm.name },
      key,
      signature,
      new TextEncoder().encode(`${ts}${rawBody}`)
    );
  } catch {
    valid = false;
  }
  return valid ? { ok: true, timestamp: Number(ts) } : { ok: false, reason: "signature_mismatch" };
}

// ---- Schema (tables already exist in polar-mcp-db; this is belt-and-braces) --
let __discordSchemaReady = false;
async function ensureDiscordSchema(env2) {
  if (__discordSchemaReady) return;
  await ensureCommsSchema(env2);
  await env2.DB.prepare(
    "CREATE TABLE IF NOT EXISTS discord_identities (discord_user_id TEXT PRIMARY KEY NOT NULL, agent_id TEXT NOT NULL, polar_customer_id TEXT, discord_username TEXT, guild_id TEXT, bound_by TEXT NOT NULL, bound_at DATETIME NOT NULL)"
  ).run();
  await env2.DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_discord_identities_agent ON discord_identities (agent_id)"
  ).run();
  await env2.DB.prepare(
    "CREATE TABLE IF NOT EXISTS discord_interactions (interaction_id TEXT PRIMARY KEY NOT NULL, command TEXT NOT NULL, discord_user_id TEXT, received_at DATETIME NOT NULL)"
  ).run();
  __discordSchemaReady = true;
}

// ---- Interaction parsing ----------------------------------------------------
function discordReply(content, flags = DISCORD_FLAG_EPHEMERAL) {
  return { type: DISCORD_RESPONSE_CHANNEL_MESSAGE, data: { content, flags } };
}
const DISCORD_PONG = { type: DISCORD_RESPONSE_PONG };
function discordInvokerOf(interaction) {
  const user = interaction?.member?.user ?? interaction?.user;
  if (!user || typeof user.id !== "string") return null;
  return { id: user.id, username: typeof user.username === "string" ? user.username : null };
}
// Flattens `/omega send recipient:x` (nested as data.options[0].options) into
// { name: "omega.send", options: Map }.
function discordParseCommand(interaction) {
  const data = interaction?.data;
  if (!data || typeof data.name !== "string") return null;
  const path = [data.name];
  let options = Array.isArray(data.options) ? data.options : [];
  while (options.length === 1 && (options[0].type === 1 || options[0].type === 2)) {
    path.push(options[0].name);
    options = Array.isArray(options[0].options) ? options[0].options : [];
  }
  const flat = /* @__PURE__ */ new Map();
  for (const o of options) {
    if (o && typeof o.name === "string" && o.value !== void 0) flat.set(o.name, o.value);
  }
  return { name: path.join("."), options: flat };
}
function discordOptionString(cmd, name) {
  const v = cmd.options.get(name);
  if (v === void 0) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
function discordOptionInteger(cmd, name) {
  const v = cmd.options.get(name);
  if (v === void 0) return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isInteger(n) ? n : null;
}
function discordTruncate(value, limit = DISCORD_CONTENT_LIMIT) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}
function discordSummarizePayload(payload) {
  if (!payload) return "_empty_";
  try {
    const p = JSON.parse(payload);
    if (p && typeof p === "object" && typeof p.text === "string") return discordTruncate(p.text, 160);
  } catch {
  }
  return discordTruncate(payload, 160);
}
function parseDiscordOperatorIds(value) {
  if (!value) return /* @__PURE__ */ new Set();
  return new Set(value.split(/[,;\s]+/).map((s) => s.trim()).filter((s) => s !== ""));
}

// ---- D1 access --------------------------------------------------------------
// Claim the interaction id. `false` => Discord already delivered it (the
// command ran, only the reply was lost) so it must not run twice.
async function discordClaimInteraction(env2, interactionId, command, discordUserId, receivedAt) {
  const r = await env2.DB.prepare(
    "INSERT OR IGNORE INTO discord_interactions (interaction_id, command, discord_user_id, received_at) VALUES (?, ?, ?, ?)"
  ).bind(interactionId, command, discordUserId, receivedAt).run();
  return (r.meta?.changes ?? 0) > 0;
}
async function discordLookupIdentity(env2, discordUserId) {
  return await env2.DB.prepare("SELECT * FROM discord_identities WHERE discord_user_id = ?").bind(discordUserId).first();
}
async function discordBindIdentity(env2, identity, boundAt) {
  await env2.DB.prepare(
    `INSERT INTO discord_identities (discord_user_id, agent_id, polar_customer_id, discord_username, guild_id, bound_by, bound_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(discord_user_id) DO UPDATE SET
       agent_id = excluded.agent_id,
       polar_customer_id = excluded.polar_customer_id,
       discord_username = excluded.discord_username,
       guild_id = excluded.guild_id,
       bound_by = excluded.bound_by,
       bound_at = excluded.bound_at`
  ).bind(
    identity.discord_user_id,
    identity.agent_id,
    identity.polar_customer_id,
    identity.discord_username,
    identity.guild_id,
    identity.bound_by,
    boundAt
  ).run();
}
// Capabilities = union over ACTIVE entitlement rows whose Polar customer id OR
// external customer id (e.g. "agent:claude:cannon") matches. Same source the
// rest of the mesh authorizes against (/api/polar/entitlements/check).
async function discordCustomerCapabilities(env2, customer) {
  const { results } = await env2.DB.prepare(
    "SELECT * FROM polar_entitlements WHERE (customer_id = ?1 OR external_customer_id = ?1) AND active = 1"
  ).bind(customer).all();
  const caps = /* @__PURE__ */ new Set();
  for (const r of (results || []).map(shapeEntitlement)) for (const x of r.capabilities) caps.add(x);
  return Array.from(caps).sort();
}
// Same row shape /api/comms/send writes. classification is left NULL on
// purpose: Discord gives us 3 s to answer and the doorman AI call can eat it.
async function discordSendBusMessage(env2, message, createdAt) {
  const r = await env2.DB.prepare(
    "INSERT INTO comms_messages (sender, recipient, message_type, payload, processed, ack_sent, created_at, classification) VALUES (?, ?, ?, ?, 0, 0, ?, NULL)"
  ).bind(
    message.sender,
    message.recipient,
    message.message_type,
    typeof message.payload === "string" ? message.payload : JSON.stringify(message.payload ?? ""),
    createdAt
  ).run();
  return Number(r.meta?.last_row_id ?? 0);
}
async function discordReadInbox(env2, recipient, limit) {
  const { results } = await env2.DB.prepare(
    "SELECT id, sender, recipient, message_type, payload, created_at, classification FROM comms_messages WHERE recipient = ? AND processed = 0 ORDER BY id ASC LIMIT ?"
  ).bind(recipient, limit).all();
  return results || [];
}
// Scoped to the recipient: a bus id is a guessable integer, so `comms.send`
// must not let one agent silence another's inbox.
async function discordAckBusMessage(env2, id, recipient) {
  const r = await env2.DB.prepare(
    "UPDATE comms_messages SET processed = 1, ack_sent = 1 WHERE id = ? AND recipient = ? AND processed = 0"
  ).bind(id, recipient).run();
  return (r.meta?.changes ?? 0) > 0;
}
async function discordBusHealth(env2) {
  const row = await env2.DB.prepare(
    "SELECT COUNT(*) AS total, COALESCE(SUM(processed), 0) AS processed FROM comms_messages"
  ).first();
  return { total: Number(row?.total ?? 0), processed: Number(row?.processed ?? 0) };
}

// ---- Command dispatch -------------------------------------------------------
async function discordResolveCaller(env2, ctx) {
  const identity = await discordLookupIdentity(env2, ctx.invoker.id);
  const isOperator = ctx.operatorIds.has(ctx.invoker.id);
  if (!identity?.polar_customer_id) return { identity, capabilities: [], isOperator };
  const capabilities = await discordCustomerCapabilities(env2, identity.polar_customer_id);
  return { identity, capabilities, isOperator };
}
function discordHolds(caller, cap) {
  return caller.capabilities.includes(cap);
}
function discordDenied(cap, caller) {
  if (!caller.identity) {
    return discordReply(
      "Not bound. This Discord account is not mapped to an agent, so it holds no capabilities. An operator binds it with `/omega bind`."
    );
  }
  if (!caller.identity.polar_customer_id) {
    return discordReply(
      `Bound to \`${caller.identity.agent_id}\` but with no Polar customer, so no capabilities resolve. Re-bind with the \`customer\` option set.`
    );
  }
  const held = caller.capabilities.length ? caller.capabilities.map((c) => `\`${c}\``).join(", ") : "nothing";
  return discordReply(
    `\`${cap}\` required. \`${caller.identity.agent_id}\` currently holds ${held}. Capabilities come from the Polar subscription — attach the benefit there.`
  );
}
async function discordHandleStatus(env2, ctx, caller) {
  const { total, processed } = await discordBusHealth(env2);
  const open = total - processed;
  return discordReply(
    `**Bus** ${total} message${total === 1 ? "" : "s"}, ${open} open, ${processed} acknowledged.
**You** ${caller.identity ? `\`${caller.identity.agent_id}\`` : "unbound"}${caller.isOperator ? " · operator" : ""}.`
  );
}
function discordHandleWhoami(caller) {
  if (!caller.identity) return discordReply("Unbound — no agent, no Polar customer, no capabilities.");
  const lines = [
    `**Agent** \`${caller.identity.agent_id}\``,
    `**Polar customer** ${caller.identity.polar_customer_id ? `\`${caller.identity.polar_customer_id}\`` : "_none — capabilities cannot resolve_"}`,
    `**Capabilities** ${caller.capabilities.length ? caller.capabilities.map((c) => `\`${c}\``).join(", ") : "_none_"}`,
    `**Bound** ${caller.identity.bound_at} by \`${caller.identity.bound_by}\``
  ];
  if (caller.isOperator) lines.push("**Operator** yes — may run `bind`");
  return discordReply(lines.join("\n"));
}
async function discordHandleBind(env2, cmd, ctx, caller) {
  if (!caller.isOperator && !discordHolds(caller, CAP_REGISTRY_ADMIN)) return discordDenied(CAP_REGISTRY_ADMIN, caller);
  const agentId = discordOptionString(cmd, "agent");
  if (!agentId || !DISCORD_AGENT_ID_PATTERN.test(agentId)) {
    return discordReply("`agent` is required and must look like an agent id (letters, digits, `.`, `_`, `:`, `-`).");
  }
  const targetId = discordOptionString(cmd, "user") ?? ctx.invoker.id;
  if (!/^\d{5,32}$/.test(targetId)) {
    return discordReply("`user` must be a Discord user id (the numeric id, not a @mention).");
  }
  const customerId = discordOptionString(cmd, "customer");
  const username = targetId === ctx.invoker.id ? ctx.invoker.username : discordOptionString(cmd, "username");
  await discordBindIdentity(env2, {
    discord_user_id: targetId,
    agent_id: agentId,
    polar_customer_id: customerId,
    discord_username: username,
    guild_id: ctx.guildId,
    bound_by: ctx.invoker.id
  }, ctx.now);
  addAuditEntry("discord_bind", "discord", targetId, { agentId, customerId, boundBy: ctx.invoker.id });
  const caveat = customerId ? "" : "\n⚠ No `customer` given, so this binding resolves to **no capabilities**. `send`, `inbox` and `ack` will all refuse until it is re-bound with one.";
  return discordReply(`Bound \`${targetId}\` → \`${agentId}\`${customerId ? ` (Polar customer \`${customerId}\`)` : ""}.${caveat}`);
}
async function discordHandleSend(env2, cmd, ctx, caller) {
  if (!discordHolds(caller, CAP_COMMS_SEND)) return discordDenied(CAP_COMMS_SEND, caller);
  const recipient = discordOptionString(cmd, "recipient");
  const text = discordOptionString(cmd, "message");
  if (!recipient || !DISCORD_AGENT_ID_PATTERN.test(recipient)) return discordReply("`recipient` is required and must be an agent id.");
  if (!text) return discordReply("`message` is required.");
  const sender = caller.identity?.agent_id ?? `discord:${ctx.invoker.id}`;
  const messageType = discordOptionString(cmd, "type") ?? "discord.relay";
  // Payload keeps the shape existing discord-relay consumers read
  // (text/from/channel_id/via) and adds provenance.
  const id = await discordSendBusMessage(env2, {
    sender,
    recipient,
    message_type: messageType,
    payload: {
      text,
      from: sender,
      channel_id: ctx.channelId,
      via: "discord-relay",
      discord_user_id: ctx.invoker.id,
      discord_username: ctx.invoker.username,
      guild_id: ctx.guildId,
      interaction_id: ctx.interactionId
    }
  }, ctx.now);
  addAuditEntry("comms.send", "mcp", recipient, { sender, message_type: messageType, via: "discord" });
  return discordReply(`Queued **#${id}** for \`${recipient}\` as \`${messageType}\`, from \`${sender}\`.`);
}
async function discordHandleInbox(env2, cmd, ctx, caller) {
  if (!discordHolds(caller, CAP_COMMS_SEND)) return discordDenied(CAP_COMMS_SEND, caller);
  const recipient = discordOptionString(cmd, "recipient") ?? caller.identity?.agent_id;
  if (!recipient || !DISCORD_AGENT_ID_PATTERN.test(recipient)) return discordReply("`recipient` is required and must be an agent id.");
  const requested = discordOptionInteger(cmd, "limit") ?? DISCORD_DEFAULT_INBOX_LIMIT;
  const limit = Math.min(Math.max(requested, 1), DISCORD_MAX_INBOX_LIMIT);
  const messages = await discordReadInbox(env2, recipient, limit);
  if (messages.length === 0) return discordReply(`\`${recipient}\` has no open messages.`);
  const lines = messages.map(
    (m) => `**#${m.id}** \`${m.message_type ?? "?"}\` from \`${m.sender ?? "?"}\`${m.classification ? ` · ${m.classification}` : ""} — ${discordSummarizePayload(m.payload)}`
  );
  return discordReply(discordTruncate(`\`${recipient}\` — ${messages.length} open (oldest ${limit} shown)\n${lines.join("\n")}`));
}
async function discordHandleAck(env2, cmd, ctx, caller) {
  if (!discordHolds(caller, CAP_COMMS_SEND)) return discordDenied(CAP_COMMS_SEND, caller);
  const id = discordOptionInteger(cmd, "id");
  if (id === null || id < 1) return discordReply("`id` is required and must be a bus message id.");
  const recipient = caller.identity?.agent_id;
  if (!recipient) return discordReply("Not bound to an agent, so there is no inbox to acknowledge.");
  const acked = await discordAckBusMessage(env2, id, recipient);
  // Does not distinguish "no such message" from "addressed to someone else".
  if (!acked) return discordReply(`No open message **#${id}** addressed to \`${recipient}\`.`);
  return discordReply(`Acknowledged **#${id}** for \`${recipient}\`.`);
}
async function discordDispatchCommand(env2, cmd, ctx) {
  const caller = await discordResolveCaller(env2, ctx);
  switch (cmd.name) {
    case "omega.status":
      return await discordHandleStatus(env2, ctx, caller);
    case "omega.whoami":
      return discordHandleWhoami(caller);
    case "omega.bind":
      return await discordHandleBind(env2, cmd, ctx, caller);
    case "omega.send":
      return await discordHandleSend(env2, cmd, ctx, caller);
    case "omega.inbox":
      return await discordHandleInbox(env2, cmd, ctx, caller);
    case "omega.ack":
      return await discordHandleAck(env2, cmd, ctx, caller);
    default:
      return discordReply(
        `Unknown command \`/${cmd.name.replace(/\./g, " ")}\`. Available: \`status\`, \`whoami\`, \`bind\`, \`send\`, \`inbox\`, \`ack\`.`
      );
  }
}

// ---- /omega command manifest (Discord application-command shape) -----------
// Served by GET /api/integrations/discord/commands so the registered surface
// cannot drift from the handled one. Register with:
//   curl -X PUT -H "Authorization: Bot $DISCORD_BOT_TOKEN" -H "Content-Type: application/json" \
//     --data @commands.json "https://discord.com/api/v10/applications/$DISCORD_APPLICATION_ID/commands"
const DISCORD_OPT_SUB_COMMAND = 1;
const DISCORD_OPT_STRING = 3;
const DISCORD_OPT_INTEGER = 4;
const DISCORD_OMEGA_COMMAND = {
  name: "omega",
  description: "Talk to the agent mesh",
  dm_permission: false,
  options: [
    { name: "status", description: "Bus totals and whether this account is bound", type: DISCORD_OPT_SUB_COMMAND },
    { name: "whoami", description: "The agent, Polar customer, and capabilities behind this account", type: DISCORD_OPT_SUB_COMMAND },
    {
      name: "send",
      description: "Queue a message for an agent",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [
        { name: "recipient", description: "Agent id to deliver to", type: DISCORD_OPT_STRING, required: true },
        { name: "message", description: "Message body", type: DISCORD_OPT_STRING, required: true },
        { name: "type", description: "Message type (default discord.relay)", type: DISCORD_OPT_STRING, required: false }
      ]
    },
    {
      name: "inbox",
      description: "Open messages for an agent (defaults to your own)",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [
        { name: "recipient", description: "Agent id (defaults to the agent you are bound to)", type: DISCORD_OPT_STRING, required: false },
        { name: "limit", description: "How many to show (1-25, default 5)", type: DISCORD_OPT_INTEGER, required: false }
      ]
    },
    {
      name: "ack",
      description: "Acknowledge a message addressed to your agent",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [{ name: "id", description: "Bus message id", type: DISCORD_OPT_INTEGER, required: true }]
    },
    {
      name: "bind",
      description: "Map a Discord account to an agent and Polar customer (operator or registry.admin)",
      type: DISCORD_OPT_SUB_COMMAND,
      options: [
        { name: "agent", description: "Agent id to bind to", type: DISCORD_OPT_STRING, required: true },
        { name: "customer", description: "Polar customer id or external id — the source of the agent's capabilities", type: DISCORD_OPT_STRING, required: false },
        { name: "user", description: "Discord user id to bind (defaults to you)", type: DISCORD_OPT_STRING, required: false },
        { name: "username", description: "Label for the bound account, when binding someone else", type: DISCORD_OPT_STRING, required: false }
      ]
    }
  ]
};
const DISCORD_COMMAND_MANIFEST = [DISCORD_OMEGA_COMMAND];

// ---- Routes -----------------------------------------------------------------
app.get("/api/integrations/discord/commands", (c) => c.json(DISCORD_COMMAND_MANIFEST));
app.post("/api/integrations/discord/interactions", async (c) => {
  const env2 = c.env;
  // The signature covers the exact bytes Discord sent: read raw before parsing.
  const rawBody = await c.req.text();
  const verification = await verifyDiscordInteraction(rawBody, c.req.raw.headers, getEnv(c, "DISCORD_PUBLIC_KEY"));
  if (!verification.ok) {
    addAuditEntry("discord_interaction_rejected", "discord", "interactions", { reason: verification.reason });
    if (discordIsConfigFailure(verification.reason)) {
      console.error(`Discord interaction rejected: ${verification.reason}. Interactions cannot be authenticated and are being refused.`);
      return c.json(
        {
          error: "Interaction verification is not configured; request refused.",
          reason: verification.reason,
          setup: "Set via: wrangler secret put DISCORD_PUBLIC_KEY — Discord Developer Portal → your app → General Information → Public Key"
        },
        503
      );
    }
    // Discord's endpoint registration sends a mis-signed probe and only accepts
    // the URL if this is a 401.
    console.warn(`Discord interaction rejected: ${verification.reason}`);
    return c.json({ error: `Invalid signature: ${verification.reason}`, reason: verification.reason }, 401);
  }
  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    interaction = null;
  }
  if (!interaction || typeof interaction !== "object" || typeof interaction.id !== "string" || typeof interaction.type !== "number") {
    return c.json({ error: "Malformed Discord interaction" }, 400);
  }
  // Discord PINGs a newly registered endpoint and keeps doing so for liveness.
  if (interaction.type === DISCORD_INTERACTION_PING) return c.json(DISCORD_PONG, 200);
  if (interaction.type !== DISCORD_INTERACTION_APPLICATION_COMMAND) {
    return c.json(discordReply("This endpoint handles slash commands only; it registers no components, modals, or autocomplete."), 200);
  }
  const cmd = discordParseCommand(interaction);
  const invoker = discordInvokerOf(interaction);
  if (!cmd || !invoker) return c.json(discordReply("Could not read the command or who sent it."), 200);
  await ensureDiscordSchema(env2);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  // Discord retries an interaction it got no reply to within 3 s. Claim the id
  // first so a lost reply cannot turn one `/omega send` into two bus rows.
  const first = await discordClaimInteraction(env2, interaction.id, cmd.name, invoker.id, now);
  if (!first) {
    return c.json(
      discordReply(`\`/${cmd.name.replace(/\./g, " ")}\` already ran — this is a retry of an interaction whose reply was lost, so it was not applied twice.`),
      200
    );
  }
  addAuditEntry("discord_command", "discord", cmd.name, { userId: invoker.id, guildId: interaction.guild_id ?? null });
  const response = await discordDispatchCommand(env2, cmd, {
    invoker,
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id ?? null,
    interactionId: interaction.id,
    operatorIds: parseDiscordOperatorIds(getEnv(c, "DISCORD_OPERATOR_IDS")),
    now
  });
  return c.json(response, 200);
});
// ============================================================================
// end PATCH B
// ============================================================================
app.get("/api/integrations/google/status", (c) => {
  const clientId = getEnv(c, "GOOGLE_CLIENT_ID");
  const clientSecret = getEnv(c, "GOOGLE_CLIENT_SECRET");
  const refreshToken = getEnv(c, "GOOGLE_REFRESH_TOKEN");
  return c.json({
    configured: !!(clientId && clientSecret && refreshToken),
    slots: {
      GOOGLE_CLIENT_ID: clientId ? "set" : "missing",
      GOOGLE_CLIENT_SECRET: clientSecret ? "set" : "missing",
      GOOGLE_REFRESH_TOKEN: refreshToken ? "set" : "missing"
    },
    setup: !clientId || !clientSecret || !refreshToken ? "Set via: wrangler secret put GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN — create OAuth credentials at https://console.cloud.google.com/apis/credentials" : "Ready for Google Workspace integration"
  });
});
app.get("/api/agents", (c) => {
  return c.json({
    count: AGENT_COUNT,
    ids: Array.from({ length: AGENT_COUNT }, (_, i) => i + 1),
    note: "Address an agent: /api/agents/<id>?action=status|set|get|dump"
  });
});
app.all("/api/agents/:id", async (c) => {
  const id = c.req.param("id");
  const ns = c.env.BORG_SUPERVISOR;
  if (!ns) {
    return c.json(
      {
        ok: false,
        error: "BORG_SUPERVISOR binding not live yet — deploy with `wrangler deploy` on an account with Dynamic Workers enabled."
      },
      501
    );
  }
  const stub = ns.getByName("borg");
  const headers = new Headers(c.req.raw.headers);
  headers.set("X-Agent-Id", id);
  const init = { method: c.req.method, headers };
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    init.body = await c.req.raw.arrayBuffer();
  }
  return await stub.fetch(new Request(c.req.url, init));
});
const AGENT_NODE_HELP = "Address a node: /api/nodes/<id>?action=status|set|get|dump  ·  sub-bucket: /api/nodes/<id>/facet/<name>?action=...";
app.get("/api/nodes", (c) => {
  return c.json({
    count: AGENT_COUNT,
    ids: Array.from({ length: AGENT_COUNT }, (_, i) => i + 1),
    model: "separate-durable-object-per-agent",
    note: AGENT_NODE_HELP
  });
});
async function forwardToNode(c, id, extraQuery) {
  const ns = c.env.AGENT_NODE;
  if (!ns) {
    return c.json(
      { ok: false, error: "AGENT_NODE binding not live yet — deploy with `wrangler deploy`." },
      501
    );
  }
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > AGENT_COUNT) {
    return c.json({ ok: false, error: `node id must be an integer 1..${AGENT_COUNT}` }, 400);
  }
  const stub = ns.getByName(`agent-${n}`);
  const url = new URL(c.req.url);
  if (extraQuery) {
    for (const [k, v] of Object.entries(extraQuery)) url.searchParams.set(k, v);
  }
  const init = { method: c.req.method, headers: new Headers(c.req.raw.headers) };
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    init.body = await c.req.raw.arrayBuffer();
  }
  return await stub.fetch(new Request(url.toString(), init));
}
app.all("/api/nodes/:id", async (c) => forwardToNode(c, c.req.param("id")));
app.all(
  "/api/nodes/:id/facet/:name",
  async (c) => forwardToNode(c, c.req.param("id"), { facet: c.req.param("name") })
);
let __commsSchemaReady = false;
async function ensureCommsSchema(env2) {
  if (__commsSchemaReady) return;
  await env2.DB.prepare(
    "CREATE TABLE IF NOT EXISTS comms_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, recipient TEXT, message_type TEXT, payload TEXT, processed INTEGER DEFAULT 0, ack_sent INTEGER DEFAULT 0, created_at TEXT, classification TEXT)"
  ).run();
  try {
    await env2.DB.prepare("ALTER TABLE comms_messages ADD COLUMN classification TEXT").run();
  } catch {
  }
  __commsSchemaReady = true;
}
const DOORMAN_CATEGORIES = ["TASK", "STATUS_UPDATE", "QUESTION", "GARBAGE"];
const DOORMAN_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const AI_GATEWAY = { gateway: { id: "kens" } };
async function doormanClassify(env2, message) {
  if (!env2.AI) return null;
  try {
    const prompt = 'Classify the following message into exactly one category: TASK, STATUS_UPDATE, QUESTION, or GARBAGE. Reply with ONLY the category name, nothing else.\n\nMessage: "' + message.slice(0, 2e3) + '"\n\nCategory:';
    const resp = await env2.AI.run(DOORMAN_MODEL, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 12
    }, AI_GATEWAY);
    const raw = (resp.response ?? "").trim().toUpperCase();
    const match2 = DOORMAN_CATEGORIES.find((cat) => raw.includes(cat));
    return match2 ?? "UNKNOWN";
  } catch (e) {
    console.error("doormanClassify failed", e);
    return null;
  }
}
app.post("/api/comms/send", async (c) => {
  const env2 = c.env;
  await ensureCommsSchema(env2);
  const body = await c.req.json();
  if (!body.sender || !body.recipient || !body.message_type) {
    return c.json(
      { ok: false, error: "sender, recipient, and message_type are required" },
      400
    );
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const classification = await doormanClassify(
    env2,
    typeof body.payload === "string" && body.payload ? body.payload : body.payload ? JSON.stringify(body.payload) : body.message_type
  );
  const res = await env2.DB.prepare(
    "INSERT INTO comms_messages (sender, recipient, message_type, payload, processed, ack_sent, created_at, classification) VALUES (?, ?, ?, ?, 0, 0, ?, ?)"
  ).bind(
    body.sender,
    body.recipient,
    body.message_type,
    // Harden 2026-07-19: agents naturally send JSON objects; D1 .bind() throws
    // on non-primitives (was a 500). Coerce anything non-string to JSON text.
    typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload ?? ""),
    now,
    classification
  ).run();
  addAuditEntry("comms.send", "mcp", body.recipient, {
    sender: body.sender,
    message_type: body.message_type,
    classification
  });
  return c.json({ ok: true, id: res.meta.last_row_id, created_at: now, classification });
});
app.get("/api/comms/inbox", async (c) => {
  const env2 = c.env;
  await ensureCommsSchema(env2);
  const recipient = c.req.query("recipient");
  if (!recipient) {
    return c.json({ ok: false, error: "recipient query param is required" }, 400);
  }
  const wanted = c.req.query("classification");
  const sql = wanted ? "SELECT id, sender, recipient, message_type, payload, created_at, classification FROM comms_messages WHERE recipient = ? AND processed = 0 AND classification = ? ORDER BY id ASC LIMIT 50" : "SELECT id, sender, recipient, message_type, payload, created_at, classification FROM comms_messages WHERE recipient = ? AND processed = 0 ORDER BY id ASC LIMIT 50";
  const stmt = wanted ? env2.DB.prepare(sql).bind(recipient, wanted.toUpperCase()) : env2.DB.prepare(sql).bind(recipient);
  const { results } = await stmt.all();
  return c.json({ ok: true, recipient, count: results.length, messages: results });
});
app.post("/api/comms/ack", async (c) => {
  const env2 = c.env;
  await ensureCommsSchema(env2);
  const body = await c.req.json();
  if (body.id === void 0 || body.id === null) {
    return c.json({ ok: false, error: "id is required" }, 400);
  }
  await env2.DB.prepare(
    "UPDATE comms_messages SET processed = 1, ack_sent = 1 WHERE id = ?"
  ).bind(body.id).run();
  return c.json({ ok: true, id: body.id });
});
app.get("/api/comms/health", async (c) => {
  const env2 = c.env;
  await ensureCommsSchema(env2);
  const { results } = await env2.DB.prepare(
    "SELECT COUNT(*) AS total, COALESCE(SUM(processed), 0) AS processed FROM comms_messages"
  ).all();
  return c.json({ ok: true, stats: results[0] });
});
const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";
const pEnv = (c) => c.env;
app.post("/api/doorman/classify", async (c) => {
  const env2 = pEnv(c);
  if (!env2.AI) return c.json({ ok: false, error: "AI binding not live — deploy first." }, 501);
  const body = await c.req.json();
  if (!body.message) return c.json({ ok: false, error: "message is required" }, 400);
  const classification = await doormanClassify(env2, body.message);
  return c.json({ ok: true, message: body.message, classification, model: DOORMAN_MODEL });
});
app.post("/api/ai/chat", async (c) => {
  const env2 = pEnv(c);
  if (!env2.AI) return c.json({ ok: false, error: "AI binding not live — deploy first." }, 501);
  const body = await c.req.json();
  const messages = body.messages?.length ? body.messages : body.prompt ? [{ role: "user", content: body.prompt }] : null;
  if (!messages) return c.json({ ok: false, error: "prompt or messages required" }, 400);
  const model = body.model ?? CHAT_MODEL;
  const resp = await env2.AI.run(model, {
    messages,
    max_tokens: body.max_tokens ?? 1024
  }, AI_GATEWAY);
  addAuditEntry("ai.chat", "mcp", String(model), { messages: messages.length });
  return c.json({ ok: true, model, response: resp.response ?? "" });
});
app.get("/v1/models", (c) => {
  const models = [CHAT_MODEL, DOORMAN_MODEL];
  return c.json({
    object: "list",
    data: models.map((id) => ({ id, object: "model", created: 0, owned_by: "polar-mcp" }))
  });
});
app.post("/v1/chat/completions", async (c) => {
  const env2 = pEnv(c);
  if (!env2.AI) return c.json({ error: { message: "AI binding not live — deploy first." } }, 501);
  const body = await c.req.json();
  if (!body.messages?.length) {
    return c.json({ error: { message: "messages is required" } }, 400);
  }
  const model = body.model && body.model.startsWith("@cf/") ? body.model : CHAT_MODEL;
  const resp = await env2.AI.run(model, {
    messages: body.messages,
    max_tokens: body.max_tokens ?? 1024
  }, AI_GATEWAY);
  const content = resp.response ?? "";
  const id = "chatcmpl-" + crypto.randomUUID();
  const created = Math.floor(Date.now() / 1e3);
  if (body.stream) {
    const chunk = {
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: { role: "assistant", content }, finish_reason: null }]
    };
    const done = {
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
    };
    const sse = "data: " + JSON.stringify(chunk) + "\n\ndata: " + JSON.stringify(done) + "\n\ndata: [DONE]\n\n";
    return new Response(sse, {
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache" }
    });
  }
  return c.json({
    id,
    object: "chat.completion",
    created,
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop"
      }
    ],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  });
});
async function embed(env2, text) {
  if (!env2.AI) return null;
  const resp = await env2.AI.run(EMBED_MODEL, { text: [text.slice(0, 4e3)] }, AI_GATEWAY);
  return resp.data?.[0] ?? null;
}
app.post("/api/vectors/upsert", async (c) => {
  const env2 = pEnv(c);
  if (!env2.VECTORS || !env2.AI) {
    return c.json(
      { ok: false, error: "VECTORS/AI binding not live — create index polar-vectors and deploy." },
      501
    );
  }
  const body = await c.req.json();
  if (!body.id || !body.text) return c.json({ ok: false, error: "id and text are required" }, 400);
  const values = await embed(env2, body.text);
  if (!values) return c.json({ ok: false, error: "embedding failed" }, 500);
  await env2.VECTORS.upsert([
    { id: body.id, values, metadata: { ...body.metadata ?? {}, text: body.text.slice(0, 5e3) } }
  ]);
  addAuditEntry("vectors.upsert", "mcp", body.id, { chars: body.text.length });
  return c.json({ ok: true, id: body.id, dimensions: values.length });
});
app.post("/api/vectors/search", async (c) => {
  const env2 = pEnv(c);
  if (!env2.VECTORS || !env2.AI) {
    return c.json(
      { ok: false, error: "VECTORS/AI binding not live — create index polar-vectors and deploy." },
      501
    );
  }
  const body = await c.req.json();
  if (!body.text) return c.json({ ok: false, error: "text is required" }, 400);
  const values = await embed(env2, body.text);
  if (!values) return c.json({ ok: false, error: "embedding failed" }, 500);
  const matches = await env2.VECTORS.query(values, {
    topK: Math.min(body.topK ?? 5, 20),
    returnMetadata: true
  });
  return c.json({ ok: true, query: body.text, matches: matches.matches });
});
app.put("/api/cache/:key", async (c) => {
  const env2 = pEnv(c);
  if (!env2.POLAR_KV) return c.json({ ok: false, error: "POLAR_KV binding not live — deploy first." }, 501);
  const value = await c.req.text();
  await env2.POLAR_KV.put(c.req.param("key"), value);
  return c.json({ ok: true, key: c.req.param("key"), bytes: value.length });
});
app.get("/api/cache/:key", async (c) => {
  const env2 = pEnv(c);
  if (!env2.POLAR_KV) return c.json({ ok: false, error: "POLAR_KV binding not live — deploy first." }, 501);
  const value = await env2.POLAR_KV.get(c.req.param("key"));
  return c.json({ ok: true, key: c.req.param("key"), value });
});
app.delete("/api/cache/:key", async (c) => {
  const env2 = pEnv(c);
  if (!env2.POLAR_KV) return c.json({ ok: false, error: "POLAR_KV binding not live — deploy first." }, 501);
  await env2.POLAR_KV.delete(c.req.param("key"));
  return c.json({ ok: true, key: c.req.param("key"), deleted: true });
});
app.put("/api/artifacts/:key", async (c) => {
  const env2 = pEnv(c);
  if (!env2.ARTIFACTS) return c.json({ ok: false, error: "ARTIFACTS binding not live — deploy first." }, 501);
  const data = await c.req.arrayBuffer();
  await env2.ARTIFACTS.put(c.req.param("key"), data, {
    httpMetadata: { contentType: c.req.header("content-type") ?? "application/octet-stream" }
  });
  return c.json({ ok: true, key: c.req.param("key"), bytes: data.byteLength });
});
app.get("/api/artifacts/:key", async (c) => {
  const env2 = pEnv(c);
  if (!env2.ARTIFACTS) return c.json({ ok: false, error: "ARTIFACTS binding not live — deploy first." }, 501);
  const obj = await env2.ARTIFACTS.get(c.req.param("key"));
  if (!obj) return c.json({ ok: false, error: "not found" }, 404);
  return new Response(obj.body, {
    headers: { "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream" }
  });
});
app.get("/api/artifacts", async (c) => {
  const env2 = pEnv(c);
  if (!env2.ARTIFACTS) return c.json({ ok: false, error: "ARTIFACTS binding not live — deploy first." }, 501);
  const listing = await env2.ARTIFACTS.list({ limit: 100 });
  return c.json({
    ok: true,
    count: listing.objects.length,
    objects: listing.objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded }))
  });
});
app.delete("/api/artifacts/:key", async (c) => {
  const env2 = pEnv(c);
  if (!env2.ARTIFACTS) return c.json({ ok: false, error: "ARTIFACTS binding not live — deploy first." }, 501);
  await env2.ARTIFACTS.delete(c.req.param("key"));
  return c.json({ ok: true, key: c.req.param("key"), deleted: true });
});
app.get("/api/platform", (c) => {
  const env2 = pEnv(c);
  return c.json({
    ok: true,
    account: "kenwsimmons (only)",
    bindings: {
      d1: !!env2.DB,
      ai: !!env2.AI,
      kv: !!env2.POLAR_KV,
      r2: !!env2.ARTIFACTS,
      vectorize: !!env2.VECTORS
    },
    models: { chat: CHAT_MODEL, doorman: DOORMAN_MODEL, embeddings: EMBED_MODEL }
  });
});
const workerEntry = app ?? {};
export {
  AgentNode,
  BorgAgentSupervisor,
  workerEntry as default
};
