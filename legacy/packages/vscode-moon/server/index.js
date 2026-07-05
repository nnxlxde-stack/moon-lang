var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/utils/is.js
var require_is = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.thenable = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = undefined;
  function boolean(value) {
    return value === true || value === false;
  }
  exports2.boolean = boolean;
  function string(value) {
    return typeof value === "string" || value instanceof String;
  }
  exports2.string = string;
  function number(value) {
    return typeof value === "number" || value instanceof Number;
  }
  exports2.number = number;
  function error(value) {
    return value instanceof Error;
  }
  exports2.error = error;
  function func(value) {
    return typeof value === "function";
  }
  exports2.func = func;
  function array(value) {
    return Array.isArray(value);
  }
  exports2.array = array;
  function stringArray(value) {
    return array(value) && value.every((elem) => string(elem));
  }
  exports2.stringArray = stringArray;
  function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
  }
  exports2.typedArray = typedArray;
  function thenable(value) {
    return value && func(value.then);
  }
  exports2.thenable = thenable;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/is.js
var require_is2 = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = undefined;
  function boolean(value) {
    return value === true || value === false;
  }
  exports2.boolean = boolean;
  function string(value) {
    return typeof value === "string" || value instanceof String;
  }
  exports2.string = string;
  function number(value) {
    return typeof value === "number" || value instanceof Number;
  }
  exports2.number = number;
  function error(value) {
    return value instanceof Error;
  }
  exports2.error = error;
  function func(value) {
    return typeof value === "function";
  }
  exports2.func = func;
  function array(value) {
    return Array.isArray(value);
  }
  exports2.array = array;
  function stringArray(value) {
    return array(value) && value.every((elem) => string(elem));
  }
  exports2.stringArray = stringArray;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Message = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType = exports2.RequestType0 = exports2.AbstractMessageSignature = exports2.ParameterStructures = exports2.ResponseError = exports2.ErrorCodes = undefined;
  var is = require_is2();
  var ErrorCodes;
  (function(ErrorCodes2) {
    ErrorCodes2.ParseError = -32700;
    ErrorCodes2.InvalidRequest = -32600;
    ErrorCodes2.MethodNotFound = -32601;
    ErrorCodes2.InvalidParams = -32602;
    ErrorCodes2.InternalError = -32603;
    ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
    ErrorCodes2.serverErrorStart = -32099;
    ErrorCodes2.MessageWriteError = -32099;
    ErrorCodes2.MessageReadError = -32098;
    ErrorCodes2.PendingResponseRejected = -32097;
    ErrorCodes2.ConnectionInactive = -32096;
    ErrorCodes2.ServerNotInitialized = -32002;
    ErrorCodes2.UnknownErrorCode = -32001;
    ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32000;
    ErrorCodes2.serverErrorEnd = -32000;
  })(ErrorCodes || (exports2.ErrorCodes = ErrorCodes = {}));

  class ResponseError extends Error {
    constructor(code, message, data) {
      super(message);
      this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
      this.data = data;
      Object.setPrototypeOf(this, ResponseError.prototype);
    }
    toJson() {
      const result = {
        code: this.code,
        message: this.message
      };
      if (this.data !== undefined) {
        result.data = this.data;
      }
      return result;
    }
  }
  exports2.ResponseError = ResponseError;

  class ParameterStructures {
    constructor(kind) {
      this.kind = kind;
    }
    static is(value) {
      return value === ParameterStructures.auto || value === ParameterStructures.byName || value === ParameterStructures.byPosition;
    }
    toString() {
      return this.kind;
    }
  }
  exports2.ParameterStructures = ParameterStructures;
  ParameterStructures.auto = new ParameterStructures("auto");
  ParameterStructures.byPosition = new ParameterStructures("byPosition");
  ParameterStructures.byName = new ParameterStructures("byName");

  class AbstractMessageSignature {
    constructor(method, numberOfParams) {
      this.method = method;
      this.numberOfParams = numberOfParams;
    }
    get parameterStructures() {
      return ParameterStructures.auto;
    }
  }
  exports2.AbstractMessageSignature = AbstractMessageSignature;

  class RequestType0 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 0);
    }
  }
  exports2.RequestType0 = RequestType0;

  class RequestType extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  exports2.RequestType = RequestType;

  class RequestType1 extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  exports2.RequestType1 = RequestType1;

  class RequestType2 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 2);
    }
  }
  exports2.RequestType2 = RequestType2;

  class RequestType3 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 3);
    }
  }
  exports2.RequestType3 = RequestType3;

  class RequestType4 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 4);
    }
  }
  exports2.RequestType4 = RequestType4;

  class RequestType5 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 5);
    }
  }
  exports2.RequestType5 = RequestType5;

  class RequestType6 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 6);
    }
  }
  exports2.RequestType6 = RequestType6;

  class RequestType7 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 7);
    }
  }
  exports2.RequestType7 = RequestType7;

  class RequestType8 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 8);
    }
  }
  exports2.RequestType8 = RequestType8;

  class RequestType9 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 9);
    }
  }
  exports2.RequestType9 = RequestType9;

  class NotificationType extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  exports2.NotificationType = NotificationType;

  class NotificationType0 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 0);
    }
  }
  exports2.NotificationType0 = NotificationType0;

  class NotificationType1 extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  exports2.NotificationType1 = NotificationType1;

  class NotificationType2 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 2);
    }
  }
  exports2.NotificationType2 = NotificationType2;

  class NotificationType3 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 3);
    }
  }
  exports2.NotificationType3 = NotificationType3;

  class NotificationType4 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 4);
    }
  }
  exports2.NotificationType4 = NotificationType4;

  class NotificationType5 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 5);
    }
  }
  exports2.NotificationType5 = NotificationType5;

  class NotificationType6 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 6);
    }
  }
  exports2.NotificationType6 = NotificationType6;

  class NotificationType7 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 7);
    }
  }
  exports2.NotificationType7 = NotificationType7;

  class NotificationType8 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 8);
    }
  }
  exports2.NotificationType8 = NotificationType8;

  class NotificationType9 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 9);
    }
  }
  exports2.NotificationType9 = NotificationType9;
  var Message;
  (function(Message2) {
    function isRequest(message) {
      const candidate = message;
      return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
    }
    Message2.isRequest = isRequest;
    function isNotification(message) {
      const candidate = message;
      return candidate && is.string(candidate.method) && message.id === undefined;
    }
    Message2.isNotification = isNotification;
    function isResponse(message) {
      const candidate = message;
      return candidate && (candidate.result !== undefined || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
    }
    Message2.isResponse = isResponse;
  })(Message || (exports2.Message = Message = {}));
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = __commonJS((exports2) => {
  var _a;
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.LRUCache = exports2.LinkedMap = exports2.Touch = undefined;
  var Touch;
  (function(Touch2) {
    Touch2.None = 0;
    Touch2.First = 1;
    Touch2.AsOld = Touch2.First;
    Touch2.Last = 2;
    Touch2.AsNew = Touch2.Last;
  })(Touch || (exports2.Touch = Touch = {}));

  class LinkedMap {
    constructor() {
      this[_a] = "LinkedMap";
      this._map = new Map;
      this._head = undefined;
      this._tail = undefined;
      this._size = 0;
      this._state = 0;
    }
    clear() {
      this._map.clear();
      this._head = undefined;
      this._tail = undefined;
      this._size = 0;
      this._state++;
    }
    isEmpty() {
      return !this._head && !this._tail;
    }
    get size() {
      return this._size;
    }
    get first() {
      return this._head?.value;
    }
    get last() {
      return this._tail?.value;
    }
    has(key) {
      return this._map.has(key);
    }
    get(key, touch = Touch.None) {
      const item = this._map.get(key);
      if (!item) {
        return;
      }
      if (touch !== Touch.None) {
        this.touch(item, touch);
      }
      return item.value;
    }
    set(key, value, touch = Touch.None) {
      let item = this._map.get(key);
      if (item) {
        item.value = value;
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
      } else {
        item = { key, value, next: undefined, previous: undefined };
        switch (touch) {
          case Touch.None:
            this.addItemLast(item);
            break;
          case Touch.First:
            this.addItemFirst(item);
            break;
          case Touch.Last:
            this.addItemLast(item);
            break;
          default:
            this.addItemLast(item);
            break;
        }
        this._map.set(key, item);
        this._size++;
      }
      return this;
    }
    delete(key) {
      return !!this.remove(key);
    }
    remove(key) {
      const item = this._map.get(key);
      if (!item) {
        return;
      }
      this._map.delete(key);
      this.removeItem(item);
      this._size--;
      return item.value;
    }
    shift() {
      if (!this._head && !this._tail) {
        return;
      }
      if (!this._head || !this._tail) {
        throw new Error("Invalid list");
      }
      const item = this._head;
      this._map.delete(item.key);
      this.removeItem(item);
      this._size--;
      return item.value;
    }
    forEach(callbackfn, thisArg) {
      const state = this._state;
      let current = this._head;
      while (current) {
        if (thisArg) {
          callbackfn.bind(thisArg)(current.value, current.key, this);
        } else {
          callbackfn(current.value, current.key, this);
        }
        if (this._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }
        current = current.next;
      }
    }
    keys() {
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]: () => {
          return iterator;
        },
        next: () => {
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = { value: current.key, done: false };
            current = current.next;
            return result;
          } else {
            return { value: undefined, done: true };
          }
        }
      };
      return iterator;
    }
    values() {
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]: () => {
          return iterator;
        },
        next: () => {
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = { value: current.value, done: false };
            current = current.next;
            return result;
          } else {
            return { value: undefined, done: true };
          }
        }
      };
      return iterator;
    }
    entries() {
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]: () => {
          return iterator;
        },
        next: () => {
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = { value: [current.key, current.value], done: false };
            current = current.next;
            return result;
          } else {
            return { value: undefined, done: true };
          }
        }
      };
      return iterator;
    }
    [(_a = Symbol.toStringTag, Symbol.iterator)]() {
      return this.entries();
    }
    trimOld(newSize) {
      if (newSize >= this.size) {
        return;
      }
      if (newSize === 0) {
        this.clear();
        return;
      }
      let current = this._head;
      let currentSize = this.size;
      while (current && currentSize > newSize) {
        this._map.delete(current.key);
        current = current.next;
        currentSize--;
      }
      this._head = current;
      this._size = currentSize;
      if (current) {
        current.previous = undefined;
      }
      this._state++;
    }
    addItemFirst(item) {
      if (!this._head && !this._tail) {
        this._tail = item;
      } else if (!this._head) {
        throw new Error("Invalid list");
      } else {
        item.next = this._head;
        this._head.previous = item;
      }
      this._head = item;
      this._state++;
    }
    addItemLast(item) {
      if (!this._head && !this._tail) {
        this._head = item;
      } else if (!this._tail) {
        throw new Error("Invalid list");
      } else {
        item.previous = this._tail;
        this._tail.next = item;
      }
      this._tail = item;
      this._state++;
    }
    removeItem(item) {
      if (item === this._head && item === this._tail) {
        this._head = undefined;
        this._tail = undefined;
      } else if (item === this._head) {
        if (!item.next) {
          throw new Error("Invalid list");
        }
        item.next.previous = undefined;
        this._head = item.next;
      } else if (item === this._tail) {
        if (!item.previous) {
          throw new Error("Invalid list");
        }
        item.previous.next = undefined;
        this._tail = item.previous;
      } else {
        const next = item.next;
        const previous = item.previous;
        if (!next || !previous) {
          throw new Error("Invalid list");
        }
        next.previous = previous;
        previous.next = next;
      }
      item.next = undefined;
      item.previous = undefined;
      this._state++;
    }
    touch(item, touch) {
      if (!this._head || !this._tail) {
        throw new Error("Invalid list");
      }
      if (touch !== Touch.First && touch !== Touch.Last) {
        return;
      }
      if (touch === Touch.First) {
        if (item === this._head) {
          return;
        }
        const next = item.next;
        const previous = item.previous;
        if (item === this._tail) {
          previous.next = undefined;
          this._tail = previous;
        } else {
          next.previous = previous;
          previous.next = next;
        }
        item.previous = undefined;
        item.next = this._head;
        this._head.previous = item;
        this._head = item;
        this._state++;
      } else if (touch === Touch.Last) {
        if (item === this._tail) {
          return;
        }
        const next = item.next;
        const previous = item.previous;
        if (item === this._head) {
          next.previous = undefined;
          this._head = next;
        } else {
          next.previous = previous;
          previous.next = next;
        }
        item.next = undefined;
        item.previous = this._tail;
        this._tail.next = item;
        this._tail = item;
        this._state++;
      }
    }
    toJSON() {
      const data = [];
      this.forEach((value, key) => {
        data.push([key, value]);
      });
      return data;
    }
    fromJSON(data) {
      this.clear();
      for (const [key, value] of data) {
        this.set(key, value);
      }
    }
  }
  exports2.LinkedMap = LinkedMap;

  class LRUCache extends LinkedMap {
    constructor(limit, ratio = 1) {
      super();
      this._limit = limit;
      this._ratio = Math.min(Math.max(0, ratio), 1);
    }
    get limit() {
      return this._limit;
    }
    set limit(limit) {
      this._limit = limit;
      this.checkTrim();
    }
    get ratio() {
      return this._ratio;
    }
    set ratio(ratio) {
      this._ratio = Math.min(Math.max(0, ratio), 1);
      this.checkTrim();
    }
    get(key, touch = Touch.AsNew) {
      return super.get(key, touch);
    }
    peek(key) {
      return super.get(key, Touch.None);
    }
    set(key, value) {
      super.set(key, value, Touch.Last);
      this.checkTrim();
      return this;
    }
    checkTrim() {
      if (this.size > this._limit) {
        this.trimOld(Math.round(this._limit * this._ratio));
      }
    }
  }
  exports2.LRUCache = LRUCache;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Disposable = undefined;
  var Disposable;
  (function(Disposable2) {
    function create(func) {
      return {
        dispose: func
      };
    }
    Disposable2.create = create;
  })(Disposable || (exports2.Disposable = Disposable = {}));
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  var _ral;
  function RAL() {
    if (_ral === undefined) {
      throw new Error(`No runtime abstraction layer installed`);
    }
    return _ral;
  }
  (function(RAL2) {
    function install(ral) {
      if (ral === undefined) {
        throw new Error(`No runtime abstraction layer provided`);
      }
      _ral = ral;
    }
    RAL2.install = install;
  })(RAL || (RAL = {}));
  exports2.default = RAL;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Emitter = exports2.Event = undefined;
  var ral_1 = require_ral();
  var Event;
  (function(Event2) {
    const _disposable = { dispose() {} };
    Event2.None = function() {
      return _disposable;
    };
  })(Event || (exports2.Event = Event = {}));

  class CallbackList {
    add(callback, context = null, bucket) {
      if (!this._callbacks) {
        this._callbacks = [];
        this._contexts = [];
      }
      this._callbacks.push(callback);
      this._contexts.push(context);
      if (Array.isArray(bucket)) {
        bucket.push({ dispose: () => this.remove(callback, context) });
      }
    }
    remove(callback, context = null) {
      if (!this._callbacks) {
        return;
      }
      let foundCallbackWithDifferentContext = false;
      for (let i = 0, len = this._callbacks.length;i < len; i++) {
        if (this._callbacks[i] === callback) {
          if (this._contexts[i] === context) {
            this._callbacks.splice(i, 1);
            this._contexts.splice(i, 1);
            return;
          } else {
            foundCallbackWithDifferentContext = true;
          }
        }
      }
      if (foundCallbackWithDifferentContext) {
        throw new Error("When adding a listener with a context, you should remove it with the same context");
      }
    }
    invoke(...args) {
      if (!this._callbacks) {
        return [];
      }
      const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
      for (let i = 0, len = callbacks.length;i < len; i++) {
        try {
          ret.push(callbacks[i].apply(contexts[i], args));
        } catch (e) {
          (0, ral_1.default)().console.error(e);
        }
      }
      return ret;
    }
    isEmpty() {
      return !this._callbacks || this._callbacks.length === 0;
    }
    dispose() {
      this._callbacks = undefined;
      this._contexts = undefined;
    }
  }

  class Emitter {
    constructor(_options) {
      this._options = _options;
    }
    get event() {
      if (!this._event) {
        this._event = (listener, thisArgs, disposables) => {
          if (!this._callbacks) {
            this._callbacks = new CallbackList;
          }
          if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
            this._options.onFirstListenerAdd(this);
          }
          this._callbacks.add(listener, thisArgs);
          const result = {
            dispose: () => {
              if (!this._callbacks) {
                return;
              }
              this._callbacks.remove(listener, thisArgs);
              result.dispose = Emitter._noop;
              if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                this._options.onLastListenerRemove(this);
              }
            }
          };
          if (Array.isArray(disposables)) {
            disposables.push(result);
          }
          return result;
        };
      }
      return this._event;
    }
    fire(event) {
      if (this._callbacks) {
        this._callbacks.invoke.call(this._callbacks, event);
      }
    }
    dispose() {
      if (this._callbacks) {
        this._callbacks.dispose();
        this._callbacks = undefined;
      }
    }
  }
  exports2.Emitter = Emitter;
  Emitter._noop = function() {};
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.CancellationTokenSource = exports2.CancellationToken = undefined;
  var ral_1 = require_ral();
  var Is = require_is2();
  var events_1 = require_events();
  var CancellationToken;
  (function(CancellationToken2) {
    CancellationToken2.None = Object.freeze({
      isCancellationRequested: false,
      onCancellationRequested: events_1.Event.None
    });
    CancellationToken2.Cancelled = Object.freeze({
      isCancellationRequested: true,
      onCancellationRequested: events_1.Event.None
    });
    function is(value) {
      const candidate = value;
      return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
    }
    CancellationToken2.is = is;
  })(CancellationToken || (exports2.CancellationToken = CancellationToken = {}));
  var shortcutEvent = Object.freeze(function(callback, context) {
    const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
    return { dispose() {
      handle.dispose();
    } };
  });

  class MutableToken {
    constructor() {
      this._isCancelled = false;
    }
    cancel() {
      if (!this._isCancelled) {
        this._isCancelled = true;
        if (this._emitter) {
          this._emitter.fire(undefined);
          this.dispose();
        }
      }
    }
    get isCancellationRequested() {
      return this._isCancelled;
    }
    get onCancellationRequested() {
      if (this._isCancelled) {
        return shortcutEvent;
      }
      if (!this._emitter) {
        this._emitter = new events_1.Emitter;
      }
      return this._emitter.event;
    }
    dispose() {
      if (this._emitter) {
        this._emitter.dispose();
        this._emitter = undefined;
      }
    }
  }

  class CancellationTokenSource {
    get token() {
      if (!this._token) {
        this._token = new MutableToken;
      }
      return this._token;
    }
    cancel() {
      if (!this._token) {
        this._token = CancellationToken.Cancelled;
      } else {
        this._token.cancel();
      }
    }
    dispose() {
      if (!this._token) {
        this._token = CancellationToken.None;
      } else if (this._token instanceof MutableToken) {
        this._token.dispose();
      }
    }
  }
  exports2.CancellationTokenSource = CancellationTokenSource;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = undefined;
  var cancellation_1 = require_cancellation();
  var CancellationState;
  (function(CancellationState2) {
    CancellationState2.Continue = 0;
    CancellationState2.Cancelled = 1;
  })(CancellationState || (CancellationState = {}));

  class SharedArraySenderStrategy {
    constructor() {
      this.buffers = new Map;
    }
    enableCancellation(request) {
      if (request.id === null) {
        return;
      }
      const buffer = new SharedArrayBuffer(4);
      const data = new Int32Array(buffer, 0, 1);
      data[0] = CancellationState.Continue;
      this.buffers.set(request.id, buffer);
      request.$cancellationData = buffer;
    }
    async sendCancellation(_conn, id) {
      const buffer = this.buffers.get(id);
      if (buffer === undefined) {
        return;
      }
      const data = new Int32Array(buffer, 0, 1);
      Atomics.store(data, 0, CancellationState.Cancelled);
    }
    cleanup(id) {
      this.buffers.delete(id);
    }
    dispose() {
      this.buffers.clear();
    }
  }
  exports2.SharedArraySenderStrategy = SharedArraySenderStrategy;

  class SharedArrayBufferCancellationToken {
    constructor(buffer) {
      this.data = new Int32Array(buffer, 0, 1);
    }
    get isCancellationRequested() {
      return Atomics.load(this.data, 0) === CancellationState.Cancelled;
    }
    get onCancellationRequested() {
      throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
    }
  }

  class SharedArrayBufferCancellationTokenSource {
    constructor(buffer) {
      this.token = new SharedArrayBufferCancellationToken(buffer);
    }
    cancel() {}
    dispose() {}
  }

  class SharedArrayReceiverStrategy {
    constructor() {
      this.kind = "request";
    }
    createCancellationTokenSource(request) {
      const buffer = request.$cancellationData;
      if (buffer === undefined) {
        return new cancellation_1.CancellationTokenSource;
      }
      return new SharedArrayBufferCancellationTokenSource(buffer);
    }
  }
  exports2.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Semaphore = undefined;
  var ral_1 = require_ral();

  class Semaphore {
    constructor(capacity = 1) {
      if (capacity <= 0) {
        throw new Error("Capacity must be greater than 0");
      }
      this._capacity = capacity;
      this._active = 0;
      this._waiting = [];
    }
    lock(thunk) {
      return new Promise((resolve, reject) => {
        this._waiting.push({ thunk, resolve, reject });
        this.runNext();
      });
    }
    get active() {
      return this._active;
    }
    runNext() {
      if (this._waiting.length === 0 || this._active === this._capacity) {
        return;
      }
      (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
    }
    doRunNext() {
      if (this._waiting.length === 0 || this._active === this._capacity) {
        return;
      }
      const next = this._waiting.shift();
      this._active++;
      if (this._active > this._capacity) {
        throw new Error(`To many thunks active`);
      }
      try {
        const result = next.thunk();
        if (result instanceof Promise) {
          result.then((value) => {
            this._active--;
            next.resolve(value);
            this.runNext();
          }, (err) => {
            this._active--;
            next.reject(err);
            this.runNext();
          });
        } else {
          this._active--;
          next.resolve(result);
          this.runNext();
        }
      } catch (err) {
        this._active--;
        next.reject(err);
        this.runNext();
      }
    }
  }
  exports2.Semaphore = Semaphore;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = undefined;
  var ral_1 = require_ral();
  var Is = require_is2();
  var events_1 = require_events();
  var semaphore_1 = require_semaphore();
  var MessageReader;
  (function(MessageReader2) {
    function is(value) {
      let candidate = value;
      return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
    }
    MessageReader2.is = is;
  })(MessageReader || (exports2.MessageReader = MessageReader = {}));

  class AbstractMessageReader {
    constructor() {
      this.errorEmitter = new events_1.Emitter;
      this.closeEmitter = new events_1.Emitter;
      this.partialMessageEmitter = new events_1.Emitter;
    }
    dispose() {
      this.errorEmitter.dispose();
      this.closeEmitter.dispose();
    }
    get onError() {
      return this.errorEmitter.event;
    }
    fireError(error) {
      this.errorEmitter.fire(this.asError(error));
    }
    get onClose() {
      return this.closeEmitter.event;
    }
    fireClose() {
      this.closeEmitter.fire(undefined);
    }
    get onPartialMessage() {
      return this.partialMessageEmitter.event;
    }
    firePartialMessage(info) {
      this.partialMessageEmitter.fire(info);
    }
    asError(error) {
      if (error instanceof Error) {
        return error;
      } else {
        return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
      }
    }
  }
  exports2.AbstractMessageReader = AbstractMessageReader;
  var ResolvedMessageReaderOptions;
  (function(ResolvedMessageReaderOptions2) {
    function fromOptions(options) {
      let charset;
      let result;
      let contentDecoder;
      const contentDecoders = new Map;
      let contentTypeDecoder;
      const contentTypeDecoders = new Map;
      if (options === undefined || typeof options === "string") {
        charset = options ?? "utf-8";
      } else {
        charset = options.charset ?? "utf-8";
        if (options.contentDecoder !== undefined) {
          contentDecoder = options.contentDecoder;
          contentDecoders.set(contentDecoder.name, contentDecoder);
        }
        if (options.contentDecoders !== undefined) {
          for (const decoder of options.contentDecoders) {
            contentDecoders.set(decoder.name, decoder);
          }
        }
        if (options.contentTypeDecoder !== undefined) {
          contentTypeDecoder = options.contentTypeDecoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        if (options.contentTypeDecoders !== undefined) {
          for (const decoder of options.contentTypeDecoders) {
            contentTypeDecoders.set(decoder.name, decoder);
          }
        }
      }
      if (contentTypeDecoder === undefined) {
        contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
        contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
      }
      return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
    }
    ResolvedMessageReaderOptions2.fromOptions = fromOptions;
  })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));

  class ReadableStreamMessageReader extends AbstractMessageReader {
    constructor(readable, options) {
      super();
      this.readable = readable;
      this.options = ResolvedMessageReaderOptions.fromOptions(options);
      this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
      this._partialMessageTimeout = 1e4;
      this.nextMessageLength = -1;
      this.messageToken = 0;
      this.readSemaphore = new semaphore_1.Semaphore(1);
    }
    set partialMessageTimeout(timeout) {
      this._partialMessageTimeout = timeout;
    }
    get partialMessageTimeout() {
      return this._partialMessageTimeout;
    }
    listen(callback) {
      this.nextMessageLength = -1;
      this.messageToken = 0;
      this.partialMessageTimer = undefined;
      this.callback = callback;
      const result = this.readable.onData((data) => {
        this.onData(data);
      });
      this.readable.onError((error) => this.fireError(error));
      this.readable.onClose(() => this.fireClose());
      return result;
    }
    onData(data) {
      try {
        this.buffer.append(data);
        while (true) {
          if (this.nextMessageLength === -1) {
            const headers = this.buffer.tryReadHeaders(true);
            if (!headers) {
              return;
            }
            const contentLength = headers.get("content-length");
            if (!contentLength) {
              this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
              return;
            }
            const length = parseInt(contentLength);
            if (isNaN(length)) {
              this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
              return;
            }
            this.nextMessageLength = length;
          }
          const body = this.buffer.tryReadBody(this.nextMessageLength);
          if (body === undefined) {
            this.setPartialMessageTimer();
            return;
          }
          this.clearPartialMessageTimer();
          this.nextMessageLength = -1;
          this.readSemaphore.lock(async () => {
            const bytes = this.options.contentDecoder !== undefined ? await this.options.contentDecoder.decode(body) : body;
            const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
            this.callback(message);
          }).catch((error) => {
            this.fireError(error);
          });
        }
      } catch (error) {
        this.fireError(error);
      }
    }
    clearPartialMessageTimer() {
      if (this.partialMessageTimer) {
        this.partialMessageTimer.dispose();
        this.partialMessageTimer = undefined;
      }
    }
    setPartialMessageTimer() {
      this.clearPartialMessageTimer();
      if (this._partialMessageTimeout <= 0) {
        return;
      }
      this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
        this.partialMessageTimer = undefined;
        if (token === this.messageToken) {
          this.firePartialMessage({ messageToken: token, waitingTime: timeout });
          this.setPartialMessageTimer();
        }
      }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
    }
  }
  exports2.ReadableStreamMessageReader = ReadableStreamMessageReader;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = undefined;
  var ral_1 = require_ral();
  var Is = require_is2();
  var semaphore_1 = require_semaphore();
  var events_1 = require_events();
  var ContentLength = "Content-Length: ";
  var CRLF = `\r
`;
  var MessageWriter;
  (function(MessageWriter2) {
    function is(value) {
      let candidate = value;
      return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
    }
    MessageWriter2.is = is;
  })(MessageWriter || (exports2.MessageWriter = MessageWriter = {}));

  class AbstractMessageWriter {
    constructor() {
      this.errorEmitter = new events_1.Emitter;
      this.closeEmitter = new events_1.Emitter;
    }
    dispose() {
      this.errorEmitter.dispose();
      this.closeEmitter.dispose();
    }
    get onError() {
      return this.errorEmitter.event;
    }
    fireError(error, message, count) {
      this.errorEmitter.fire([this.asError(error), message, count]);
    }
    get onClose() {
      return this.closeEmitter.event;
    }
    fireClose() {
      this.closeEmitter.fire(undefined);
    }
    asError(error) {
      if (error instanceof Error) {
        return error;
      } else {
        return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
      }
    }
  }
  exports2.AbstractMessageWriter = AbstractMessageWriter;
  var ResolvedMessageWriterOptions;
  (function(ResolvedMessageWriterOptions2) {
    function fromOptions(options) {
      if (options === undefined || typeof options === "string") {
        return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
      } else {
        return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
      }
    }
    ResolvedMessageWriterOptions2.fromOptions = fromOptions;
  })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));

  class WriteableStreamMessageWriter extends AbstractMessageWriter {
    constructor(writable, options) {
      super();
      this.writable = writable;
      this.options = ResolvedMessageWriterOptions.fromOptions(options);
      this.errorCount = 0;
      this.writeSemaphore = new semaphore_1.Semaphore(1);
      this.writable.onError((error) => this.fireError(error));
      this.writable.onClose(() => this.fireClose());
    }
    async write(msg) {
      return this.writeSemaphore.lock(async () => {
        const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
          if (this.options.contentEncoder !== undefined) {
            return this.options.contentEncoder.encode(buffer);
          } else {
            return buffer;
          }
        });
        return payload.then((buffer) => {
          const headers = [];
          headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
          headers.push(CRLF);
          return this.doWrite(msg, headers, buffer);
        }, (error) => {
          this.fireError(error);
          throw error;
        });
      });
    }
    async doWrite(msg, headers, data) {
      try {
        await this.writable.write(headers.join(""), "ascii");
        return this.writable.write(data);
      } catch (error) {
        this.handleError(error, msg);
        return Promise.reject(error);
      }
    }
    handleError(error, msg) {
      this.errorCount++;
      this.fireError(error, msg, this.errorCount);
    }
    end() {
      this.writable.end();
    }
  }
  exports2.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.AbstractMessageBuffer = undefined;
  var CR = 13;
  var LF = 10;
  var CRLF = `\r
`;

  class AbstractMessageBuffer {
    constructor(encoding = "utf-8") {
      this._encoding = encoding;
      this._chunks = [];
      this._totalLength = 0;
    }
    get encoding() {
      return this._encoding;
    }
    append(chunk) {
      const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
      this._chunks.push(toAppend);
      this._totalLength += toAppend.byteLength;
    }
    tryReadHeaders(lowerCaseKeys = false) {
      if (this._chunks.length === 0) {
        return;
      }
      let state = 0;
      let chunkIndex = 0;
      let offset = 0;
      let chunkBytesRead = 0;
      row:
        while (chunkIndex < this._chunks.length) {
          const chunk = this._chunks[chunkIndex];
          offset = 0;
          column:
            while (offset < chunk.length) {
              const value = chunk[offset];
              switch (value) {
                case CR:
                  switch (state) {
                    case 0:
                      state = 1;
                      break;
                    case 2:
                      state = 3;
                      break;
                    default:
                      state = 0;
                  }
                  break;
                case LF:
                  switch (state) {
                    case 1:
                      state = 2;
                      break;
                    case 3:
                      state = 4;
                      offset++;
                      break row;
                    default:
                      state = 0;
                  }
                  break;
                default:
                  state = 0;
              }
              offset++;
            }
          chunkBytesRead += chunk.byteLength;
          chunkIndex++;
        }
      if (state !== 4) {
        return;
      }
      const buffer = this._read(chunkBytesRead + offset);
      const result = new Map;
      const headers = this.toString(buffer, "ascii").split(CRLF);
      if (headers.length < 2) {
        return result;
      }
      for (let i = 0;i < headers.length - 2; i++) {
        const header = headers[i];
        const index = header.indexOf(":");
        if (index === -1) {
          throw new Error(`Message header must separate key and value using ':'
${header}`);
        }
        const key = header.substr(0, index);
        const value = header.substr(index + 1).trim();
        result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
      }
      return result;
    }
    tryReadBody(length) {
      if (this._totalLength < length) {
        return;
      }
      return this._read(length);
    }
    get numberOfBytes() {
      return this._totalLength;
    }
    _read(byteCount) {
      if (byteCount === 0) {
        return this.emptyBuffer();
      }
      if (byteCount > this._totalLength) {
        throw new Error(`Cannot read so many bytes!`);
      }
      if (this._chunks[0].byteLength === byteCount) {
        const chunk = this._chunks[0];
        this._chunks.shift();
        this._totalLength -= byteCount;
        return this.asNative(chunk);
      }
      if (this._chunks[0].byteLength > byteCount) {
        const chunk = this._chunks[0];
        const result2 = this.asNative(chunk, byteCount);
        this._chunks[0] = chunk.slice(byteCount);
        this._totalLength -= byteCount;
        return result2;
      }
      const result = this.allocNative(byteCount);
      let resultOffset = 0;
      let chunkIndex = 0;
      while (byteCount > 0) {
        const chunk = this._chunks[chunkIndex];
        if (chunk.byteLength > byteCount) {
          const chunkPart = chunk.slice(0, byteCount);
          result.set(chunkPart, resultOffset);
          resultOffset += byteCount;
          this._chunks[chunkIndex] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          byteCount -= byteCount;
        } else {
          result.set(chunk, resultOffset);
          resultOffset += chunk.byteLength;
          this._chunks.shift();
          this._totalLength -= chunk.byteLength;
          byteCount -= chunk.byteLength;
        }
      }
      return result;
    }
  }
  exports2.AbstractMessageBuffer = AbstractMessageBuffer;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.createMessageConnection = exports2.ConnectionOptions = exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.RequestCancellationReceiverStrategy = exports2.IdCancellationReceiverStrategy = exports2.ConnectionStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = exports2.NullLogger = exports2.ProgressType = exports2.ProgressToken = undefined;
  var ral_1 = require_ral();
  var Is = require_is2();
  var messages_1 = require_messages();
  var linkedMap_1 = require_linkedMap();
  var events_1 = require_events();
  var cancellation_1 = require_cancellation();
  var CancelNotification;
  (function(CancelNotification2) {
    CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
  })(CancelNotification || (CancelNotification = {}));
  var ProgressToken;
  (function(ProgressToken2) {
    function is(value) {
      return typeof value === "string" || typeof value === "number";
    }
    ProgressToken2.is = is;
  })(ProgressToken || (exports2.ProgressToken = ProgressToken = {}));
  var ProgressNotification;
  (function(ProgressNotification2) {
    ProgressNotification2.type = new messages_1.NotificationType("$/progress");
  })(ProgressNotification || (ProgressNotification = {}));

  class ProgressType {
    constructor() {}
  }
  exports2.ProgressType = ProgressType;
  var StarRequestHandler;
  (function(StarRequestHandler2) {
    function is(value) {
      return Is.func(value);
    }
    StarRequestHandler2.is = is;
  })(StarRequestHandler || (StarRequestHandler = {}));
  exports2.NullLogger = Object.freeze({
    error: () => {},
    warn: () => {},
    info: () => {},
    log: () => {}
  });
  var Trace;
  (function(Trace2) {
    Trace2[Trace2["Off"] = 0] = "Off";
    Trace2[Trace2["Messages"] = 1] = "Messages";
    Trace2[Trace2["Compact"] = 2] = "Compact";
    Trace2[Trace2["Verbose"] = 3] = "Verbose";
  })(Trace || (exports2.Trace = Trace = {}));
  var TraceValues;
  (function(TraceValues2) {
    TraceValues2.Off = "off";
    TraceValues2.Messages = "messages";
    TraceValues2.Compact = "compact";
    TraceValues2.Verbose = "verbose";
  })(TraceValues || (exports2.TraceValues = TraceValues = {}));
  (function(Trace2) {
    function fromString(value) {
      if (!Is.string(value)) {
        return Trace2.Off;
      }
      value = value.toLowerCase();
      switch (value) {
        case "off":
          return Trace2.Off;
        case "messages":
          return Trace2.Messages;
        case "compact":
          return Trace2.Compact;
        case "verbose":
          return Trace2.Verbose;
        default:
          return Trace2.Off;
      }
    }
    Trace2.fromString = fromString;
    function toString(value) {
      switch (value) {
        case Trace2.Off:
          return "off";
        case Trace2.Messages:
          return "messages";
        case Trace2.Compact:
          return "compact";
        case Trace2.Verbose:
          return "verbose";
        default:
          return "off";
      }
    }
    Trace2.toString = toString;
  })(Trace || (exports2.Trace = Trace = {}));
  var TraceFormat;
  (function(TraceFormat2) {
    TraceFormat2["Text"] = "text";
    TraceFormat2["JSON"] = "json";
  })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
  (function(TraceFormat2) {
    function fromString(value) {
      if (!Is.string(value)) {
        return TraceFormat2.Text;
      }
      value = value.toLowerCase();
      if (value === "json") {
        return TraceFormat2.JSON;
      } else {
        return TraceFormat2.Text;
      }
    }
    TraceFormat2.fromString = fromString;
  })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
  var SetTraceNotification;
  (function(SetTraceNotification2) {
    SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
  })(SetTraceNotification || (exports2.SetTraceNotification = SetTraceNotification = {}));
  var LogTraceNotification;
  (function(LogTraceNotification2) {
    LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
  })(LogTraceNotification || (exports2.LogTraceNotification = LogTraceNotification = {}));
  var ConnectionErrors;
  (function(ConnectionErrors2) {
    ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
    ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
    ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
  })(ConnectionErrors || (exports2.ConnectionErrors = ConnectionErrors = {}));

  class ConnectionError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
      Object.setPrototypeOf(this, ConnectionError.prototype);
    }
  }
  exports2.ConnectionError = ConnectionError;
  var ConnectionStrategy;
  (function(ConnectionStrategy2) {
    function is(value) {
      const candidate = value;
      return candidate && Is.func(candidate.cancelUndispatched);
    }
    ConnectionStrategy2.is = is;
  })(ConnectionStrategy || (exports2.ConnectionStrategy = ConnectionStrategy = {}));
  var IdCancellationReceiverStrategy;
  (function(IdCancellationReceiverStrategy2) {
    function is(value) {
      const candidate = value;
      return candidate && (candidate.kind === undefined || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === undefined || Is.func(candidate.dispose));
    }
    IdCancellationReceiverStrategy2.is = is;
  })(IdCancellationReceiverStrategy || (exports2.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
  var RequestCancellationReceiverStrategy;
  (function(RequestCancellationReceiverStrategy2) {
    function is(value) {
      const candidate = value;
      return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === undefined || Is.func(candidate.dispose));
    }
    RequestCancellationReceiverStrategy2.is = is;
  })(RequestCancellationReceiverStrategy || (exports2.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
  var CancellationReceiverStrategy;
  (function(CancellationReceiverStrategy2) {
    CancellationReceiverStrategy2.Message = Object.freeze({
      createCancellationTokenSource(_) {
        return new cancellation_1.CancellationTokenSource;
      }
    });
    function is(value) {
      return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
    }
    CancellationReceiverStrategy2.is = is;
  })(CancellationReceiverStrategy || (exports2.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
  var CancellationSenderStrategy;
  (function(CancellationSenderStrategy2) {
    CancellationSenderStrategy2.Message = Object.freeze({
      sendCancellation(conn, id) {
        return conn.sendNotification(CancelNotification.type, { id });
      },
      cleanup(_) {}
    });
    function is(value) {
      const candidate = value;
      return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
    }
    CancellationSenderStrategy2.is = is;
  })(CancellationSenderStrategy || (exports2.CancellationSenderStrategy = CancellationSenderStrategy = {}));
  var CancellationStrategy;
  (function(CancellationStrategy2) {
    CancellationStrategy2.Message = Object.freeze({
      receiver: CancellationReceiverStrategy.Message,
      sender: CancellationSenderStrategy.Message
    });
    function is(value) {
      const candidate = value;
      return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
    }
    CancellationStrategy2.is = is;
  })(CancellationStrategy || (exports2.CancellationStrategy = CancellationStrategy = {}));
  var MessageStrategy;
  (function(MessageStrategy2) {
    function is(value) {
      const candidate = value;
      return candidate && Is.func(candidate.handleMessage);
    }
    MessageStrategy2.is = is;
  })(MessageStrategy || (exports2.MessageStrategy = MessageStrategy = {}));
  var ConnectionOptions;
  (function(ConnectionOptions2) {
    function is(value) {
      const candidate = value;
      return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
    }
    ConnectionOptions2.is = is;
  })(ConnectionOptions || (exports2.ConnectionOptions = ConnectionOptions = {}));
  var ConnectionState;
  (function(ConnectionState2) {
    ConnectionState2[ConnectionState2["New"] = 1] = "New";
    ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
    ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
    ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
  })(ConnectionState || (ConnectionState = {}));
  function createMessageConnection(messageReader, messageWriter, _logger, options) {
    const logger = _logger !== undefined ? _logger : exports2.NullLogger;
    let sequenceNumber = 0;
    let notificationSequenceNumber = 0;
    let unknownResponseSequenceNumber = 0;
    const version = "2.0";
    let starRequestHandler = undefined;
    const requestHandlers = new Map;
    let starNotificationHandler = undefined;
    const notificationHandlers = new Map;
    const progressHandlers = new Map;
    let timer;
    let messageQueue = new linkedMap_1.LinkedMap;
    let responsePromises = new Map;
    let knownCanceledRequests = new Set;
    let requestTokens = new Map;
    let trace = Trace.Off;
    let traceFormat = TraceFormat.Text;
    let tracer;
    let state = ConnectionState.New;
    const errorEmitter = new events_1.Emitter;
    const closeEmitter = new events_1.Emitter;
    const unhandledNotificationEmitter = new events_1.Emitter;
    const unhandledProgressEmitter = new events_1.Emitter;
    const disposeEmitter = new events_1.Emitter;
    const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
    function createRequestQueueKey(id) {
      if (id === null) {
        throw new Error(`Can't send requests with id null since the response can't be correlated.`);
      }
      return "req-" + id.toString();
    }
    function createResponseQueueKey(id) {
      if (id === null) {
        return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
      } else {
        return "res-" + id.toString();
      }
    }
    function createNotificationQueueKey() {
      return "not-" + (++notificationSequenceNumber).toString();
    }
    function addMessageToQueue(queue, message) {
      if (messages_1.Message.isRequest(message)) {
        queue.set(createRequestQueueKey(message.id), message);
      } else if (messages_1.Message.isResponse(message)) {
        queue.set(createResponseQueueKey(message.id), message);
      } else {
        queue.set(createNotificationQueueKey(), message);
      }
    }
    function cancelUndispatched(_message) {
      return;
    }
    function isListening() {
      return state === ConnectionState.Listening;
    }
    function isClosed() {
      return state === ConnectionState.Closed;
    }
    function isDisposed() {
      return state === ConnectionState.Disposed;
    }
    function closeHandler() {
      if (state === ConnectionState.New || state === ConnectionState.Listening) {
        state = ConnectionState.Closed;
        closeEmitter.fire(undefined);
      }
    }
    function readErrorHandler(error) {
      errorEmitter.fire([error, undefined, undefined]);
    }
    function writeErrorHandler(data) {
      errorEmitter.fire(data);
    }
    messageReader.onClose(closeHandler);
    messageReader.onError(readErrorHandler);
    messageWriter.onClose(closeHandler);
    messageWriter.onError(writeErrorHandler);
    function triggerMessageQueue() {
      if (timer || messageQueue.size === 0) {
        return;
      }
      timer = (0, ral_1.default)().timer.setImmediate(() => {
        timer = undefined;
        processMessageQueue();
      });
    }
    function handleMessage(message) {
      if (messages_1.Message.isRequest(message)) {
        handleRequest(message);
      } else if (messages_1.Message.isNotification(message)) {
        handleNotification(message);
      } else if (messages_1.Message.isResponse(message)) {
        handleResponse(message);
      } else {
        handleInvalidMessage(message);
      }
    }
    function processMessageQueue() {
      if (messageQueue.size === 0) {
        return;
      }
      const message = messageQueue.shift();
      try {
        const messageStrategy = options?.messageStrategy;
        if (MessageStrategy.is(messageStrategy)) {
          messageStrategy.handleMessage(message, handleMessage);
        } else {
          handleMessage(message);
        }
      } finally {
        triggerMessageQueue();
      }
    }
    const callback = (message) => {
      try {
        if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          const key = createRequestQueueKey(cancelId);
          const toCancel = messageQueue.get(key);
          if (messages_1.Message.isRequest(toCancel)) {
            const strategy = options?.connectionStrategy;
            const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
            if (response && (response.error !== undefined || response.result !== undefined)) {
              messageQueue.delete(key);
              requestTokens.delete(cancelId);
              response.id = toCancel.id;
              traceSendingResponse(response, message.method, Date.now());
              messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
              return;
            }
          }
          const cancellationToken = requestTokens.get(cancelId);
          if (cancellationToken !== undefined) {
            cancellationToken.cancel();
            traceReceivedNotification(message);
            return;
          } else {
            knownCanceledRequests.add(cancelId);
          }
        }
        addMessageToQueue(messageQueue, message);
      } finally {
        triggerMessageQueue();
      }
    };
    function handleRequest(requestMessage) {
      if (isDisposed()) {
        return;
      }
      function reply(resultOrError, method, startTime2) {
        const message = {
          jsonrpc: version,
          id: requestMessage.id
        };
        if (resultOrError instanceof messages_1.ResponseError) {
          message.error = resultOrError.toJson();
        } else {
          message.result = resultOrError === undefined ? null : resultOrError;
        }
        traceSendingResponse(message, method, startTime2);
        messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
      }
      function replyError(error, method, startTime2) {
        const message = {
          jsonrpc: version,
          id: requestMessage.id,
          error: error.toJson()
        };
        traceSendingResponse(message, method, startTime2);
        messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
      }
      function replySuccess(result, method, startTime2) {
        if (result === undefined) {
          result = null;
        }
        const message = {
          jsonrpc: version,
          id: requestMessage.id,
          result
        };
        traceSendingResponse(message, method, startTime2);
        messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
      }
      traceReceivedRequest(requestMessage);
      const element = requestHandlers.get(requestMessage.method);
      let type;
      let requestHandler;
      if (element) {
        type = element.type;
        requestHandler = element.handler;
      }
      const startTime = Date.now();
      if (requestHandler || starRequestHandler) {
        const tokenKey = requestMessage.id ?? String(Date.now());
        const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
        if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
          cancellationSource.cancel();
        }
        if (requestMessage.id !== null) {
          requestTokens.set(tokenKey, cancellationSource);
        }
        try {
          let handlerResult;
          if (requestHandler) {
            if (requestMessage.params === undefined) {
              if (type !== undefined && type.numberOfParams !== 0) {
                replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                return;
              }
              handlerResult = requestHandler(cancellationSource.token);
            } else if (Array.isArray(requestMessage.params)) {
              if (type !== undefined && type.parameterStructures === messages_1.ParameterStructures.byName) {
                replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                return;
              }
              handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
            } else {
              if (type !== undefined && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                return;
              }
              handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
            }
          } else if (starRequestHandler) {
            handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
          }
          const promise = handlerResult;
          if (!handlerResult) {
            requestTokens.delete(tokenKey);
            replySuccess(handlerResult, requestMessage.method, startTime);
          } else if (promise.then) {
            promise.then((resultOrError) => {
              requestTokens.delete(tokenKey);
              reply(resultOrError, requestMessage.method, startTime);
            }, (error) => {
              requestTokens.delete(tokenKey);
              if (error instanceof messages_1.ResponseError) {
                replyError(error, requestMessage.method, startTime);
              } else if (error && Is.string(error.message)) {
                replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
              } else {
                replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
              }
            });
          } else {
            requestTokens.delete(tokenKey);
            reply(handlerResult, requestMessage.method, startTime);
          }
        } catch (error) {
          requestTokens.delete(tokenKey);
          if (error instanceof messages_1.ResponseError) {
            reply(error, requestMessage.method, startTime);
          } else if (error && Is.string(error.message)) {
            replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
          } else {
            replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
          }
        }
      } else {
        replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
      }
    }
    function handleResponse(responseMessage) {
      if (isDisposed()) {
        return;
      }
      if (responseMessage.id === null) {
        if (responseMessage.error) {
          logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, undefined, 4)}`);
        } else {
          logger.error(`Received response message without id. No further error information provided.`);
        }
      } else {
        const key = responseMessage.id;
        const responsePromise = responsePromises.get(key);
        traceReceivedResponse(responseMessage, responsePromise);
        if (responsePromise !== undefined) {
          responsePromises.delete(key);
          try {
            if (responseMessage.error) {
              const error = responseMessage.error;
              responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
            } else if (responseMessage.result !== undefined) {
              responsePromise.resolve(responseMessage.result);
            } else {
              throw new Error("Should never happen.");
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
            }
          }
        }
      }
    }
    function handleNotification(message) {
      if (isDisposed()) {
        return;
      }
      let type = undefined;
      let notificationHandler;
      if (message.method === CancelNotification.type.method) {
        const cancelId = message.params.id;
        knownCanceledRequests.delete(cancelId);
        traceReceivedNotification(message);
        return;
      } else {
        const element = notificationHandlers.get(message.method);
        if (element) {
          notificationHandler = element.handler;
          type = element.type;
        }
      }
      if (notificationHandler || starNotificationHandler) {
        try {
          traceReceivedNotification(message);
          if (notificationHandler) {
            if (message.params === undefined) {
              if (type !== undefined) {
                if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                  logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                }
              }
              notificationHandler();
            } else if (Array.isArray(message.params)) {
              const params = message.params;
              if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                notificationHandler({ token: params[0], value: params[1] });
              } else {
                if (type !== undefined) {
                  if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                  }
                  if (type.numberOfParams !== message.params.length) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                  }
                }
                notificationHandler(...params);
              }
            } else {
              if (type !== undefined && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
              }
              notificationHandler(message.params);
            }
          } else if (starNotificationHandler) {
            starNotificationHandler(message.method, message.params);
          }
        } catch (error) {
          if (error.message) {
            logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
          } else {
            logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
          }
        }
      } else {
        unhandledNotificationEmitter.fire(message);
      }
    }
    function handleInvalidMessage(message) {
      if (!message) {
        logger.error("Received empty message.");
        return;
      }
      logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
      const responseMessage = message;
      if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
        const key = responseMessage.id;
        const responseHandler = responsePromises.get(key);
        if (responseHandler) {
          responseHandler.reject(new Error("The received response has neither a result nor an error property."));
        }
      }
    }
    function stringifyTrace(params) {
      if (params === undefined || params === null) {
        return;
      }
      switch (trace) {
        case Trace.Verbose:
          return JSON.stringify(params, null, 4);
        case Trace.Compact:
          return JSON.stringify(params);
        default:
          return;
      }
    }
    function traceSendingRequest(message) {
      if (trace === Trace.Off || !tracer) {
        return;
      }
      if (traceFormat === TraceFormat.Text) {
        let data = undefined;
        if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
          data = `Params: ${stringifyTrace(message.params)}

`;
        }
        tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
      } else {
        logLSPMessage("send-request", message);
      }
    }
    function traceSendingNotification(message) {
      if (trace === Trace.Off || !tracer) {
        return;
      }
      if (traceFormat === TraceFormat.Text) {
        let data = undefined;
        if (trace === Trace.Verbose || trace === Trace.Compact) {
          if (message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          } else {
            data = `No parameters provided.

`;
          }
        }
        tracer.log(`Sending notification '${message.method}'.`, data);
      } else {
        logLSPMessage("send-notification", message);
      }
    }
    function traceSendingResponse(message, method, startTime) {
      if (trace === Trace.Off || !tracer) {
        return;
      }
      if (traceFormat === TraceFormat.Text) {
        let data = undefined;
        if (trace === Trace.Verbose || trace === Trace.Compact) {
          if (message.error && message.error.data) {
            data = `Error data: ${stringifyTrace(message.error.data)}

`;
          } else {
            if (message.result) {
              data = `Result: ${stringifyTrace(message.result)}

`;
            } else if (message.error === undefined) {
              data = `No result returned.

`;
            }
          }
        }
        tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
      } else {
        logLSPMessage("send-response", message);
      }
    }
    function traceReceivedRequest(message) {
      if (trace === Trace.Off || !tracer) {
        return;
      }
      if (traceFormat === TraceFormat.Text) {
        let data = undefined;
        if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
          data = `Params: ${stringifyTrace(message.params)}

`;
        }
        tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
      } else {
        logLSPMessage("receive-request", message);
      }
    }
    function traceReceivedNotification(message) {
      if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
        return;
      }
      if (traceFormat === TraceFormat.Text) {
        let data = undefined;
        if (trace === Trace.Verbose || trace === Trace.Compact) {
          if (message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          } else {
            data = `No parameters provided.

`;
          }
        }
        tracer.log(`Received notification '${message.method}'.`, data);
      } else {
        logLSPMessage("receive-notification", message);
      }
    }
    function traceReceivedResponse(message, responsePromise) {
      if (trace === Trace.Off || !tracer) {
        return;
      }
      if (traceFormat === TraceFormat.Text) {
        let data = undefined;
        if (trace === Trace.Verbose || trace === Trace.Compact) {
          if (message.error && message.error.data) {
            data = `Error data: ${stringifyTrace(message.error.data)}

`;
          } else {
            if (message.result) {
              data = `Result: ${stringifyTrace(message.result)}

`;
            } else if (message.error === undefined) {
              data = `No result returned.

`;
            }
          }
        }
        if (responsePromise) {
          const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
          tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
        } else {
          tracer.log(`Received response ${message.id} without active response promise.`, data);
        }
      } else {
        logLSPMessage("receive-response", message);
      }
    }
    function logLSPMessage(type, message) {
      if (!tracer || trace === Trace.Off) {
        return;
      }
      const lspMessage = {
        isLSPMessage: true,
        type,
        message,
        timestamp: Date.now()
      };
      tracer.log(lspMessage);
    }
    function throwIfClosedOrDisposed() {
      if (isClosed()) {
        throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
      }
      if (isDisposed()) {
        throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
      }
    }
    function throwIfListening() {
      if (isListening()) {
        throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
      }
    }
    function throwIfNotListening() {
      if (!isListening()) {
        throw new Error("Call listen() first.");
      }
    }
    function undefinedToNull(param) {
      if (param === undefined) {
        return null;
      } else {
        return param;
      }
    }
    function nullToUndefined(param) {
      if (param === null) {
        return;
      } else {
        return param;
      }
    }
    function isNamedParam(param) {
      return param !== undefined && param !== null && !Array.isArray(param) && typeof param === "object";
    }
    function computeSingleParam(parameterStructures, param) {
      switch (parameterStructures) {
        case messages_1.ParameterStructures.auto:
          if (isNamedParam(param)) {
            return nullToUndefined(param);
          } else {
            return [undefinedToNull(param)];
          }
        case messages_1.ParameterStructures.byName:
          if (!isNamedParam(param)) {
            throw new Error(`Received parameters by name but param is not an object literal.`);
          }
          return nullToUndefined(param);
        case messages_1.ParameterStructures.byPosition:
          return [undefinedToNull(param)];
        default:
          throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
      }
    }
    function computeMessageParams(type, params) {
      let result;
      const numberOfParams = type.numberOfParams;
      switch (numberOfParams) {
        case 0:
          result = undefined;
          break;
        case 1:
          result = computeSingleParam(type.parameterStructures, params[0]);
          break;
        default:
          result = [];
          for (let i = 0;i < params.length && i < numberOfParams; i++) {
            result.push(undefinedToNull(params[i]));
          }
          if (params.length < numberOfParams) {
            for (let i = params.length;i < numberOfParams; i++) {
              result.push(null);
            }
          }
          break;
      }
      return result;
    }
    const connection = {
      sendNotification: (type, ...args) => {
        throwIfClosedOrDisposed();
        let method;
        let messageParams;
        if (Is.string(type)) {
          method = type;
          const first = args[0];
          let paramStart = 0;
          let parameterStructures = messages_1.ParameterStructures.auto;
          if (messages_1.ParameterStructures.is(first)) {
            paramStart = 1;
            parameterStructures = first;
          }
          let paramEnd = args.length;
          const numberOfParams = paramEnd - paramStart;
          switch (numberOfParams) {
            case 0:
              messageParams = undefined;
              break;
            case 1:
              messageParams = computeSingleParam(parameterStructures, args[paramStart]);
              break;
            default:
              if (parameterStructures === messages_1.ParameterStructures.byName) {
                throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
              }
              messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
              break;
          }
        } else {
          const params = args;
          method = type.method;
          messageParams = computeMessageParams(type, params);
        }
        const notificationMessage = {
          jsonrpc: version,
          method,
          params: messageParams
        };
        traceSendingNotification(notificationMessage);
        return messageWriter.write(notificationMessage).catch((error) => {
          logger.error(`Sending notification failed.`);
          throw error;
        });
      },
      onNotification: (type, handler) => {
        throwIfClosedOrDisposed();
        let method;
        if (Is.func(type)) {
          starNotificationHandler = type;
        } else if (handler) {
          if (Is.string(type)) {
            method = type;
            notificationHandlers.set(type, { type: undefined, handler });
          } else {
            method = type.method;
            notificationHandlers.set(type.method, { type, handler });
          }
        }
        return {
          dispose: () => {
            if (method !== undefined) {
              notificationHandlers.delete(method);
            } else {
              starNotificationHandler = undefined;
            }
          }
        };
      },
      onProgress: (_type, token, handler) => {
        if (progressHandlers.has(token)) {
          throw new Error(`Progress handler for token ${token} already registered`);
        }
        progressHandlers.set(token, handler);
        return {
          dispose: () => {
            progressHandlers.delete(token);
          }
        };
      },
      sendProgress: (_type, token, value) => {
        return connection.sendNotification(ProgressNotification.type, { token, value });
      },
      onUnhandledProgress: unhandledProgressEmitter.event,
      sendRequest: (type, ...args) => {
        throwIfClosedOrDisposed();
        throwIfNotListening();
        let method;
        let messageParams;
        let token = undefined;
        if (Is.string(type)) {
          method = type;
          const first = args[0];
          const last = args[args.length - 1];
          let paramStart = 0;
          let parameterStructures = messages_1.ParameterStructures.auto;
          if (messages_1.ParameterStructures.is(first)) {
            paramStart = 1;
            parameterStructures = first;
          }
          let paramEnd = args.length;
          if (cancellation_1.CancellationToken.is(last)) {
            paramEnd = paramEnd - 1;
            token = last;
          }
          const numberOfParams = paramEnd - paramStart;
          switch (numberOfParams) {
            case 0:
              messageParams = undefined;
              break;
            case 1:
              messageParams = computeSingleParam(parameterStructures, args[paramStart]);
              break;
            default:
              if (parameterStructures === messages_1.ParameterStructures.byName) {
                throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
              }
              messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
              break;
          }
        } else {
          const params = args;
          method = type.method;
          messageParams = computeMessageParams(type, params);
          const numberOfParams = type.numberOfParams;
          token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : undefined;
        }
        const id = sequenceNumber++;
        let disposable;
        if (token) {
          disposable = token.onCancellationRequested(() => {
            const p = cancellationStrategy.sender.sendCancellation(connection, id);
            if (p === undefined) {
              logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
              return Promise.resolve();
            } else {
              return p.catch(() => {
                logger.log(`Sending cancellation messages for id ${id} failed`);
              });
            }
          });
        }
        const requestMessage = {
          jsonrpc: version,
          id,
          method,
          params: messageParams
        };
        traceSendingRequest(requestMessage);
        if (typeof cancellationStrategy.sender.enableCancellation === "function") {
          cancellationStrategy.sender.enableCancellation(requestMessage);
        }
        return new Promise(async (resolve, reject) => {
          const resolveWithCleanup = (r) => {
            resolve(r);
            cancellationStrategy.sender.cleanup(id);
            disposable?.dispose();
          };
          const rejectWithCleanup = (r) => {
            reject(r);
            cancellationStrategy.sender.cleanup(id);
            disposable?.dispose();
          };
          const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
          try {
            await messageWriter.write(requestMessage);
            responsePromises.set(id, responsePromise);
          } catch (error) {
            logger.error(`Sending request failed.`);
            responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
            throw error;
          }
        });
      },
      onRequest: (type, handler) => {
        throwIfClosedOrDisposed();
        let method = null;
        if (StarRequestHandler.is(type)) {
          method = undefined;
          starRequestHandler = type;
        } else if (Is.string(type)) {
          method = null;
          if (handler !== undefined) {
            method = type;
            requestHandlers.set(type, { handler, type: undefined });
          }
        } else {
          if (handler !== undefined) {
            method = type.method;
            requestHandlers.set(type.method, { type, handler });
          }
        }
        return {
          dispose: () => {
            if (method === null) {
              return;
            }
            if (method !== undefined) {
              requestHandlers.delete(method);
            } else {
              starRequestHandler = undefined;
            }
          }
        };
      },
      hasPendingResponse: () => {
        return responsePromises.size > 0;
      },
      trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
        let _sendNotification = false;
        let _traceFormat = TraceFormat.Text;
        if (sendNotificationOrTraceOptions !== undefined) {
          if (Is.boolean(sendNotificationOrTraceOptions)) {
            _sendNotification = sendNotificationOrTraceOptions;
          } else {
            _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
            _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
          }
        }
        trace = _value;
        traceFormat = _traceFormat;
        if (trace === Trace.Off) {
          tracer = undefined;
        } else {
          tracer = _tracer;
        }
        if (_sendNotification && !isClosed() && !isDisposed()) {
          await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
        }
      },
      onError: errorEmitter.event,
      onClose: closeEmitter.event,
      onUnhandledNotification: unhandledNotificationEmitter.event,
      onDispose: disposeEmitter.event,
      end: () => {
        messageWriter.end();
      },
      dispose: () => {
        if (isDisposed()) {
          return;
        }
        state = ConnectionState.Disposed;
        disposeEmitter.fire(undefined);
        const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
        for (const promise of responsePromises.values()) {
          promise.reject(error);
        }
        responsePromises = new Map;
        requestTokens = new Map;
        knownCanceledRequests = new Set;
        messageQueue = new linkedMap_1.LinkedMap;
        if (Is.func(messageWriter.dispose)) {
          messageWriter.dispose();
        }
        if (Is.func(messageReader.dispose)) {
          messageReader.dispose();
        }
      },
      listen: () => {
        throwIfClosedOrDisposed();
        throwIfListening();
        state = ConnectionState.Listening;
        messageReader.listen(callback);
      },
      inspect: () => {
        (0, ral_1.default)().console.log("inspect");
      }
    };
    connection.onNotification(LogTraceNotification.type, (params) => {
      if (trace === Trace.Off || !tracer) {
        return;
      }
      const verbose = trace === Trace.Verbose || trace === Trace.Compact;
      tracer.log(params.message, verbose ? params.verbose : undefined);
    });
    connection.onNotification(ProgressNotification.type, (params) => {
      const handler = progressHandlers.get(params.token);
      if (handler) {
        handler(params.value);
      } else {
        unhandledProgressEmitter.fire(params);
      }
    });
    return connection;
  }
  exports2.createMessageConnection = createMessageConnection;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ProgressType = exports2.ProgressToken = exports2.createMessageConnection = exports2.NullLogger = exports2.ConnectionOptions = exports2.ConnectionStrategy = exports2.AbstractMessageBuffer = exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = exports2.CancellationToken = exports2.CancellationTokenSource = exports2.Emitter = exports2.Event = exports2.Disposable = exports2.LRUCache = exports2.Touch = exports2.LinkedMap = exports2.ParameterStructures = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.ErrorCodes = exports2.ResponseError = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType0 = exports2.RequestType = exports2.Message = exports2.RAL = undefined;
  exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = undefined;
  var messages_1 = require_messages();
  Object.defineProperty(exports2, "Message", { enumerable: true, get: function() {
    return messages_1.Message;
  } });
  Object.defineProperty(exports2, "RequestType", { enumerable: true, get: function() {
    return messages_1.RequestType;
  } });
  Object.defineProperty(exports2, "RequestType0", { enumerable: true, get: function() {
    return messages_1.RequestType0;
  } });
  Object.defineProperty(exports2, "RequestType1", { enumerable: true, get: function() {
    return messages_1.RequestType1;
  } });
  Object.defineProperty(exports2, "RequestType2", { enumerable: true, get: function() {
    return messages_1.RequestType2;
  } });
  Object.defineProperty(exports2, "RequestType3", { enumerable: true, get: function() {
    return messages_1.RequestType3;
  } });
  Object.defineProperty(exports2, "RequestType4", { enumerable: true, get: function() {
    return messages_1.RequestType4;
  } });
  Object.defineProperty(exports2, "RequestType5", { enumerable: true, get: function() {
    return messages_1.RequestType5;
  } });
  Object.defineProperty(exports2, "RequestType6", { enumerable: true, get: function() {
    return messages_1.RequestType6;
  } });
  Object.defineProperty(exports2, "RequestType7", { enumerable: true, get: function() {
    return messages_1.RequestType7;
  } });
  Object.defineProperty(exports2, "RequestType8", { enumerable: true, get: function() {
    return messages_1.RequestType8;
  } });
  Object.defineProperty(exports2, "RequestType9", { enumerable: true, get: function() {
    return messages_1.RequestType9;
  } });
  Object.defineProperty(exports2, "ResponseError", { enumerable: true, get: function() {
    return messages_1.ResponseError;
  } });
  Object.defineProperty(exports2, "ErrorCodes", { enumerable: true, get: function() {
    return messages_1.ErrorCodes;
  } });
  Object.defineProperty(exports2, "NotificationType", { enumerable: true, get: function() {
    return messages_1.NotificationType;
  } });
  Object.defineProperty(exports2, "NotificationType0", { enumerable: true, get: function() {
    return messages_1.NotificationType0;
  } });
  Object.defineProperty(exports2, "NotificationType1", { enumerable: true, get: function() {
    return messages_1.NotificationType1;
  } });
  Object.defineProperty(exports2, "NotificationType2", { enumerable: true, get: function() {
    return messages_1.NotificationType2;
  } });
  Object.defineProperty(exports2, "NotificationType3", { enumerable: true, get: function() {
    return messages_1.NotificationType3;
  } });
  Object.defineProperty(exports2, "NotificationType4", { enumerable: true, get: function() {
    return messages_1.NotificationType4;
  } });
  Object.defineProperty(exports2, "NotificationType5", { enumerable: true, get: function() {
    return messages_1.NotificationType5;
  } });
  Object.defineProperty(exports2, "NotificationType6", { enumerable: true, get: function() {
    return messages_1.NotificationType6;
  } });
  Object.defineProperty(exports2, "NotificationType7", { enumerable: true, get: function() {
    return messages_1.NotificationType7;
  } });
  Object.defineProperty(exports2, "NotificationType8", { enumerable: true, get: function() {
    return messages_1.NotificationType8;
  } });
  Object.defineProperty(exports2, "NotificationType9", { enumerable: true, get: function() {
    return messages_1.NotificationType9;
  } });
  Object.defineProperty(exports2, "ParameterStructures", { enumerable: true, get: function() {
    return messages_1.ParameterStructures;
  } });
  var linkedMap_1 = require_linkedMap();
  Object.defineProperty(exports2, "LinkedMap", { enumerable: true, get: function() {
    return linkedMap_1.LinkedMap;
  } });
  Object.defineProperty(exports2, "LRUCache", { enumerable: true, get: function() {
    return linkedMap_1.LRUCache;
  } });
  Object.defineProperty(exports2, "Touch", { enumerable: true, get: function() {
    return linkedMap_1.Touch;
  } });
  var disposable_1 = require_disposable();
  Object.defineProperty(exports2, "Disposable", { enumerable: true, get: function() {
    return disposable_1.Disposable;
  } });
  var events_1 = require_events();
  Object.defineProperty(exports2, "Event", { enumerable: true, get: function() {
    return events_1.Event;
  } });
  Object.defineProperty(exports2, "Emitter", { enumerable: true, get: function() {
    return events_1.Emitter;
  } });
  var cancellation_1 = require_cancellation();
  Object.defineProperty(exports2, "CancellationTokenSource", { enumerable: true, get: function() {
    return cancellation_1.CancellationTokenSource;
  } });
  Object.defineProperty(exports2, "CancellationToken", { enumerable: true, get: function() {
    return cancellation_1.CancellationToken;
  } });
  var sharedArrayCancellation_1 = require_sharedArrayCancellation();
  Object.defineProperty(exports2, "SharedArraySenderStrategy", { enumerable: true, get: function() {
    return sharedArrayCancellation_1.SharedArraySenderStrategy;
  } });
  Object.defineProperty(exports2, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
    return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
  } });
  var messageReader_1 = require_messageReader();
  Object.defineProperty(exports2, "MessageReader", { enumerable: true, get: function() {
    return messageReader_1.MessageReader;
  } });
  Object.defineProperty(exports2, "AbstractMessageReader", { enumerable: true, get: function() {
    return messageReader_1.AbstractMessageReader;
  } });
  Object.defineProperty(exports2, "ReadableStreamMessageReader", { enumerable: true, get: function() {
    return messageReader_1.ReadableStreamMessageReader;
  } });
  var messageWriter_1 = require_messageWriter();
  Object.defineProperty(exports2, "MessageWriter", { enumerable: true, get: function() {
    return messageWriter_1.MessageWriter;
  } });
  Object.defineProperty(exports2, "AbstractMessageWriter", { enumerable: true, get: function() {
    return messageWriter_1.AbstractMessageWriter;
  } });
  Object.defineProperty(exports2, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
    return messageWriter_1.WriteableStreamMessageWriter;
  } });
  var messageBuffer_1 = require_messageBuffer();
  Object.defineProperty(exports2, "AbstractMessageBuffer", { enumerable: true, get: function() {
    return messageBuffer_1.AbstractMessageBuffer;
  } });
  var connection_1 = require_connection();
  Object.defineProperty(exports2, "ConnectionStrategy", { enumerable: true, get: function() {
    return connection_1.ConnectionStrategy;
  } });
  Object.defineProperty(exports2, "ConnectionOptions", { enumerable: true, get: function() {
    return connection_1.ConnectionOptions;
  } });
  Object.defineProperty(exports2, "NullLogger", { enumerable: true, get: function() {
    return connection_1.NullLogger;
  } });
  Object.defineProperty(exports2, "createMessageConnection", { enumerable: true, get: function() {
    return connection_1.createMessageConnection;
  } });
  Object.defineProperty(exports2, "ProgressToken", { enumerable: true, get: function() {
    return connection_1.ProgressToken;
  } });
  Object.defineProperty(exports2, "ProgressType", { enumerable: true, get: function() {
    return connection_1.ProgressType;
  } });
  Object.defineProperty(exports2, "Trace", { enumerable: true, get: function() {
    return connection_1.Trace;
  } });
  Object.defineProperty(exports2, "TraceValues", { enumerable: true, get: function() {
    return connection_1.TraceValues;
  } });
  Object.defineProperty(exports2, "TraceFormat", { enumerable: true, get: function() {
    return connection_1.TraceFormat;
  } });
  Object.defineProperty(exports2, "SetTraceNotification", { enumerable: true, get: function() {
    return connection_1.SetTraceNotification;
  } });
  Object.defineProperty(exports2, "LogTraceNotification", { enumerable: true, get: function() {
    return connection_1.LogTraceNotification;
  } });
  Object.defineProperty(exports2, "ConnectionErrors", { enumerable: true, get: function() {
    return connection_1.ConnectionErrors;
  } });
  Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: function() {
    return connection_1.ConnectionError;
  } });
  Object.defineProperty(exports2, "CancellationReceiverStrategy", { enumerable: true, get: function() {
    return connection_1.CancellationReceiverStrategy;
  } });
  Object.defineProperty(exports2, "CancellationSenderStrategy", { enumerable: true, get: function() {
    return connection_1.CancellationSenderStrategy;
  } });
  Object.defineProperty(exports2, "CancellationStrategy", { enumerable: true, get: function() {
    return connection_1.CancellationStrategy;
  } });
  Object.defineProperty(exports2, "MessageStrategy", { enumerable: true, get: function() {
    return connection_1.MessageStrategy;
  } });
  var ral_1 = require_ral();
  exports2.RAL = ral_1.default;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  var util_1 = require("util");
  var api_1 = require_api();

  class MessageBuffer extends api_1.AbstractMessageBuffer {
    constructor(encoding = "utf-8") {
      super(encoding);
    }
    emptyBuffer() {
      return MessageBuffer.emptyBuffer;
    }
    fromString(value, encoding) {
      return Buffer.from(value, encoding);
    }
    toString(value, encoding) {
      if (value instanceof Buffer) {
        return value.toString(encoding);
      } else {
        return new util_1.TextDecoder(encoding).decode(value);
      }
    }
    asNative(buffer, length) {
      if (length === undefined) {
        return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
      } else {
        return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
      }
    }
    allocNative(length) {
      return Buffer.allocUnsafe(length);
    }
  }
  MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);

  class ReadableStreamWrapper {
    constructor(stream) {
      this.stream = stream;
    }
    onClose(listener) {
      this.stream.on("close", listener);
      return api_1.Disposable.create(() => this.stream.off("close", listener));
    }
    onError(listener) {
      this.stream.on("error", listener);
      return api_1.Disposable.create(() => this.stream.off("error", listener));
    }
    onEnd(listener) {
      this.stream.on("end", listener);
      return api_1.Disposable.create(() => this.stream.off("end", listener));
    }
    onData(listener) {
      this.stream.on("data", listener);
      return api_1.Disposable.create(() => this.stream.off("data", listener));
    }
  }

  class WritableStreamWrapper {
    constructor(stream) {
      this.stream = stream;
    }
    onClose(listener) {
      this.stream.on("close", listener);
      return api_1.Disposable.create(() => this.stream.off("close", listener));
    }
    onError(listener) {
      this.stream.on("error", listener);
      return api_1.Disposable.create(() => this.stream.off("error", listener));
    }
    onEnd(listener) {
      this.stream.on("end", listener);
      return api_1.Disposable.create(() => this.stream.off("end", listener));
    }
    write(data, encoding) {
      return new Promise((resolve, reject) => {
        const callback = (error) => {
          if (error === undefined || error === null) {
            resolve();
          } else {
            reject(error);
          }
        };
        if (typeof data === "string") {
          this.stream.write(data, encoding, callback);
        } else {
          this.stream.write(data, callback);
        }
      });
    }
    end() {
      this.stream.end();
    }
  }
  var _ril = Object.freeze({
    messageBuffer: Object.freeze({
      create: (encoding) => new MessageBuffer(encoding)
    }),
    applicationJson: Object.freeze({
      encoder: Object.freeze({
        name: "application/json",
        encode: (msg, options) => {
          try {
            return Promise.resolve(Buffer.from(JSON.stringify(msg, undefined, 0), options.charset));
          } catch (err) {
            return Promise.reject(err);
          }
        }
      }),
      decoder: Object.freeze({
        name: "application/json",
        decode: (buffer, options) => {
          try {
            if (buffer instanceof Buffer) {
              return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
            } else {
              return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
            }
          } catch (err) {
            return Promise.reject(err);
          }
        }
      })
    }),
    stream: Object.freeze({
      asReadableStream: (stream) => new ReadableStreamWrapper(stream),
      asWritableStream: (stream) => new WritableStreamWrapper(stream)
    }),
    console,
    timer: Object.freeze({
      setTimeout(callback, ms, ...args) {
        const handle = setTimeout(callback, ms, ...args);
        return { dispose: () => clearTimeout(handle) };
      },
      setImmediate(callback, ...args) {
        const handle = setImmediate(callback, ...args);
        return { dispose: () => clearImmediate(handle) };
      },
      setInterval(callback, ms, ...args) {
        const handle = setInterval(callback, ms, ...args);
        return { dispose: () => clearInterval(handle) };
      }
    })
  });
  function RIL() {
    return _ril;
  }
  (function(RIL2) {
    function install() {
      api_1.RAL.install(_ril);
    }
    RIL2.install = install;
  })(RIL || (RIL = {}));
  exports2.default = RIL;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = __commonJS((exports2) => {
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.createMessageConnection = exports2.createServerSocketTransport = exports2.createClientSocketTransport = exports2.createServerPipeTransport = exports2.createClientPipeTransport = exports2.generateRandomPipeName = exports2.StreamMessageWriter = exports2.StreamMessageReader = exports2.SocketMessageWriter = exports2.SocketMessageReader = exports2.PortMessageWriter = exports2.PortMessageReader = exports2.IPCMessageWriter = exports2.IPCMessageReader = undefined;
  var ril_1 = require_ril();
  ril_1.default.install();
  var path = require("path");
  var os = require("os");
  var crypto_1 = require("crypto");
  var net_1 = require("net");
  var api_1 = require_api();
  __exportStar(require_api(), exports2);

  class IPCMessageReader extends api_1.AbstractMessageReader {
    constructor(process2) {
      super();
      this.process = process2;
      let eventEmitter = this.process;
      eventEmitter.on("error", (error) => this.fireError(error));
      eventEmitter.on("close", () => this.fireClose());
    }
    listen(callback) {
      this.process.on("message", callback);
      return api_1.Disposable.create(() => this.process.off("message", callback));
    }
  }
  exports2.IPCMessageReader = IPCMessageReader;

  class IPCMessageWriter extends api_1.AbstractMessageWriter {
    constructor(process2) {
      super();
      this.process = process2;
      this.errorCount = 0;
      const eventEmitter = this.process;
      eventEmitter.on("error", (error) => this.fireError(error));
      eventEmitter.on("close", () => this.fireClose);
    }
    write(msg) {
      try {
        if (typeof this.process.send === "function") {
          this.process.send(msg, undefined, undefined, (error) => {
            if (error) {
              this.errorCount++;
              this.handleError(error, msg);
            } else {
              this.errorCount = 0;
            }
          });
        }
        return Promise.resolve();
      } catch (error) {
        this.handleError(error, msg);
        return Promise.reject(error);
      }
    }
    handleError(error, msg) {
      this.errorCount++;
      this.fireError(error, msg, this.errorCount);
    }
    end() {}
  }
  exports2.IPCMessageWriter = IPCMessageWriter;

  class PortMessageReader extends api_1.AbstractMessageReader {
    constructor(port) {
      super();
      this.onData = new api_1.Emitter;
      port.on("close", () => this.fireClose);
      port.on("error", (error) => this.fireError(error));
      port.on("message", (message) => {
        this.onData.fire(message);
      });
    }
    listen(callback) {
      return this.onData.event(callback);
    }
  }
  exports2.PortMessageReader = PortMessageReader;

  class PortMessageWriter extends api_1.AbstractMessageWriter {
    constructor(port) {
      super();
      this.port = port;
      this.errorCount = 0;
      port.on("close", () => this.fireClose());
      port.on("error", (error) => this.fireError(error));
    }
    write(msg) {
      try {
        this.port.postMessage(msg);
        return Promise.resolve();
      } catch (error) {
        this.handleError(error, msg);
        return Promise.reject(error);
      }
    }
    handleError(error, msg) {
      this.errorCount++;
      this.fireError(error, msg, this.errorCount);
    }
    end() {}
  }
  exports2.PortMessageWriter = PortMessageWriter;

  class SocketMessageReader extends api_1.ReadableStreamMessageReader {
    constructor(socket, encoding = "utf-8") {
      super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
    }
  }
  exports2.SocketMessageReader = SocketMessageReader;

  class SocketMessageWriter extends api_1.WriteableStreamMessageWriter {
    constructor(socket, options) {
      super((0, ril_1.default)().stream.asWritableStream(socket), options);
      this.socket = socket;
    }
    dispose() {
      super.dispose();
      this.socket.destroy();
    }
  }
  exports2.SocketMessageWriter = SocketMessageWriter;

  class StreamMessageReader extends api_1.ReadableStreamMessageReader {
    constructor(readable, encoding) {
      super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
    }
  }
  exports2.StreamMessageReader = StreamMessageReader;

  class StreamMessageWriter extends api_1.WriteableStreamMessageWriter {
    constructor(writable, options) {
      super((0, ril_1.default)().stream.asWritableStream(writable), options);
    }
  }
  exports2.StreamMessageWriter = StreamMessageWriter;
  var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
  var safeIpcPathLengths = new Map([
    ["linux", 107],
    ["darwin", 103]
  ]);
  function generateRandomPipeName() {
    const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
    if (process.platform === "win32") {
      return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
    }
    let result;
    if (XDG_RUNTIME_DIR) {
      result = path.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
    } else {
      result = path.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
    }
    const limit = safeIpcPathLengths.get(process.platform);
    if (limit !== undefined && result.length > limit) {
      (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
    }
    return result;
  }
  exports2.generateRandomPipeName = generateRandomPipeName;
  function createClientPipeTransport(pipeName, encoding = "utf-8") {
    let connectResolve;
    const connected = new Promise((resolve, _reject) => {
      connectResolve = resolve;
    });
    return new Promise((resolve, reject) => {
      let server = (0, net_1.createServer)((socket) => {
        server.close();
        connectResolve([
          new SocketMessageReader(socket, encoding),
          new SocketMessageWriter(socket, encoding)
        ]);
      });
      server.on("error", reject);
      server.listen(pipeName, () => {
        server.removeListener("error", reject);
        resolve({
          onConnected: () => {
            return connected;
          }
        });
      });
    });
  }
  exports2.createClientPipeTransport = createClientPipeTransport;
  function createServerPipeTransport(pipeName, encoding = "utf-8") {
    const socket = (0, net_1.createConnection)(pipeName);
    return [
      new SocketMessageReader(socket, encoding),
      new SocketMessageWriter(socket, encoding)
    ];
  }
  exports2.createServerPipeTransport = createServerPipeTransport;
  function createClientSocketTransport(port, encoding = "utf-8") {
    let connectResolve;
    const connected = new Promise((resolve, _reject) => {
      connectResolve = resolve;
    });
    return new Promise((resolve, reject) => {
      const server = (0, net_1.createServer)((socket) => {
        server.close();
        connectResolve([
          new SocketMessageReader(socket, encoding),
          new SocketMessageWriter(socket, encoding)
        ]);
      });
      server.on("error", reject);
      server.listen(port, "127.0.0.1", () => {
        server.removeListener("error", reject);
        resolve({
          onConnected: () => {
            return connected;
          }
        });
      });
    });
  }
  exports2.createClientSocketTransport = createClientSocketTransport;
  function createServerSocketTransport(port, encoding = "utf-8") {
    const socket = (0, net_1.createConnection)(port, "127.0.0.1");
    return [
      new SocketMessageReader(socket, encoding),
      new SocketMessageWriter(socket, encoding)
    ];
  }
  exports2.createServerSocketTransport = createServerSocketTransport;
  function isReadableStream(value) {
    const candidate = value;
    return candidate.read !== undefined && candidate.addListener !== undefined;
  }
  function isWritableStream(value) {
    const candidate = value;
    return candidate.write !== undefined && candidate.addListener !== undefined;
  }
  function createMessageConnection(input, output, logger, options) {
    if (!logger) {
      logger = api_1.NullLogger;
    }
    const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
    const writer = isWritableStream(output) ? new StreamMessageWriter(output) : output;
    if (api_1.ConnectionStrategy.is(options)) {
      options = { connectionStrategy: options };
    }
    return (0, api_1.createMessageConnection)(reader, writer, logger, options);
  }
  exports2.createMessageConnection = createMessageConnection;
});

// ../../node_modules/.bun/vscode-jsonrpc@8.2.0/node_modules/vscode-jsonrpc/node.js
var require_node = __commonJS((exports2, module2) => {
  module2.exports = require_main();
});

// ../../node_modules/.bun/vscode-languageserver-types@3.17.5/node_modules/vscode-languageserver-types/lib/umd/main.js
var require_main2 = __commonJS((exports2, module2) => {
  (function(factory) {
    if (typeof module2 === "object" && typeof module2.exports === "object") {
      var v = factory(require, exports2);
      if (v !== undefined)
        module2.exports = v;
    } else if (typeof define === "function" && define.amd) {
      define(["require", "exports"], factory);
    }
  })(function(require2, exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.TextDocument = exports3.EOL = exports3.WorkspaceFolder = exports3.InlineCompletionContext = exports3.SelectedCompletionInfo = exports3.InlineCompletionTriggerKind = exports3.InlineCompletionList = exports3.InlineCompletionItem = exports3.StringValue = exports3.InlayHint = exports3.InlayHintLabelPart = exports3.InlayHintKind = exports3.InlineValueContext = exports3.InlineValueEvaluatableExpression = exports3.InlineValueVariableLookup = exports3.InlineValueText = exports3.SemanticTokens = exports3.SemanticTokenModifiers = exports3.SemanticTokenTypes = exports3.SelectionRange = exports3.DocumentLink = exports3.FormattingOptions = exports3.CodeLens = exports3.CodeAction = exports3.CodeActionContext = exports3.CodeActionTriggerKind = exports3.CodeActionKind = exports3.DocumentSymbol = exports3.WorkspaceSymbol = exports3.SymbolInformation = exports3.SymbolTag = exports3.SymbolKind = exports3.DocumentHighlight = exports3.DocumentHighlightKind = exports3.SignatureInformation = exports3.ParameterInformation = exports3.Hover = exports3.MarkedString = exports3.CompletionList = exports3.CompletionItem = exports3.CompletionItemLabelDetails = exports3.InsertTextMode = exports3.InsertReplaceEdit = exports3.CompletionItemTag = exports3.InsertTextFormat = exports3.CompletionItemKind = exports3.MarkupContent = exports3.MarkupKind = exports3.TextDocumentItem = exports3.OptionalVersionedTextDocumentIdentifier = exports3.VersionedTextDocumentIdentifier = exports3.TextDocumentIdentifier = exports3.WorkspaceChange = exports3.WorkspaceEdit = exports3.DeleteFile = exports3.RenameFile = exports3.CreateFile = exports3.TextDocumentEdit = exports3.AnnotatedTextEdit = exports3.ChangeAnnotationIdentifier = exports3.ChangeAnnotation = exports3.TextEdit = exports3.Command = exports3.Diagnostic = exports3.CodeDescription = exports3.DiagnosticTag = exports3.DiagnosticSeverity = exports3.DiagnosticRelatedInformation = exports3.FoldingRange = exports3.FoldingRangeKind = exports3.ColorPresentation = exports3.ColorInformation = exports3.Color = exports3.LocationLink = exports3.Location = exports3.Range = exports3.Position = exports3.uinteger = exports3.integer = exports3.URI = exports3.DocumentUri = undefined;
    var DocumentUri;
    (function(DocumentUri2) {
      function is(value) {
        return typeof value === "string";
      }
      DocumentUri2.is = is;
    })(DocumentUri || (exports3.DocumentUri = DocumentUri = {}));
    var URI;
    (function(URI2) {
      function is(value) {
        return typeof value === "string";
      }
      URI2.is = is;
    })(URI || (exports3.URI = URI = {}));
    var integer;
    (function(integer2) {
      integer2.MIN_VALUE = -2147483648;
      integer2.MAX_VALUE = 2147483647;
      function is(value) {
        return typeof value === "number" && integer2.MIN_VALUE <= value && value <= integer2.MAX_VALUE;
      }
      integer2.is = is;
    })(integer || (exports3.integer = integer = {}));
    var uinteger;
    (function(uinteger2) {
      uinteger2.MIN_VALUE = 0;
      uinteger2.MAX_VALUE = 2147483647;
      function is(value) {
        return typeof value === "number" && uinteger2.MIN_VALUE <= value && value <= uinteger2.MAX_VALUE;
      }
      uinteger2.is = is;
    })(uinteger || (exports3.uinteger = uinteger = {}));
    var Position;
    (function(Position2) {
      function create(line, character) {
        if (line === Number.MAX_VALUE) {
          line = uinteger.MAX_VALUE;
        }
        if (character === Number.MAX_VALUE) {
          character = uinteger.MAX_VALUE;
        }
        return { line, character };
      }
      Position2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
      }
      Position2.is = is;
    })(Position || (exports3.Position = Position = {}));
    var Range;
    (function(Range2) {
      function create(one, two, three, four) {
        if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
          return { start: Position.create(one, two), end: Position.create(three, four) };
        } else if (Position.is(one) && Position.is(two)) {
          return { start: one, end: two };
        } else {
          throw new Error("Range#create called with invalid arguments[".concat(one, ", ").concat(two, ", ").concat(three, ", ").concat(four, "]"));
        }
      }
      Range2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
      }
      Range2.is = is;
    })(Range || (exports3.Range = Range = {}));
    var Location;
    (function(Location2) {
      function create(uri, range) {
        return { uri, range };
      }
      Location2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
      }
      Location2.is = is;
    })(Location || (exports3.Location = Location = {}));
    var LocationLink;
    (function(LocationLink2) {
      function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
        return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
      }
      LocationLink2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && Range.is(candidate.targetSelectionRange) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
      }
      LocationLink2.is = is;
    })(LocationLink || (exports3.LocationLink = LocationLink = {}));
    var Color;
    (function(Color2) {
      function create(red, green, blue, alpha) {
        return {
          red,
          green,
          blue,
          alpha
        };
      }
      Color2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
      }
      Color2.is = is;
    })(Color || (exports3.Color = Color = {}));
    var ColorInformation;
    (function(ColorInformation2) {
      function create(range, color) {
        return {
          range,
          color
        };
      }
      ColorInformation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && Color.is(candidate.color);
      }
      ColorInformation2.is = is;
    })(ColorInformation || (exports3.ColorInformation = ColorInformation = {}));
    var ColorPresentation;
    (function(ColorPresentation2) {
      function create(label, textEdit, additionalTextEdits) {
        return {
          label,
          textEdit,
          additionalTextEdits
        };
      }
      ColorPresentation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
      }
      ColorPresentation2.is = is;
    })(ColorPresentation || (exports3.ColorPresentation = ColorPresentation = {}));
    var FoldingRangeKind;
    (function(FoldingRangeKind2) {
      FoldingRangeKind2.Comment = "comment";
      FoldingRangeKind2.Imports = "imports";
      FoldingRangeKind2.Region = "region";
    })(FoldingRangeKind || (exports3.FoldingRangeKind = FoldingRangeKind = {}));
    var FoldingRange;
    (function(FoldingRange2) {
      function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
        var result = {
          startLine,
          endLine
        };
        if (Is.defined(startCharacter)) {
          result.startCharacter = startCharacter;
        }
        if (Is.defined(endCharacter)) {
          result.endCharacter = endCharacter;
        }
        if (Is.defined(kind)) {
          result.kind = kind;
        }
        if (Is.defined(collapsedText)) {
          result.collapsedText = collapsedText;
        }
        return result;
      }
      FoldingRange2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
      }
      FoldingRange2.is = is;
    })(FoldingRange || (exports3.FoldingRange = FoldingRange = {}));
    var DiagnosticRelatedInformation;
    (function(DiagnosticRelatedInformation2) {
      function create(location, message) {
        return {
          location,
          message
        };
      }
      DiagnosticRelatedInformation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
      }
      DiagnosticRelatedInformation2.is = is;
    })(DiagnosticRelatedInformation || (exports3.DiagnosticRelatedInformation = DiagnosticRelatedInformation = {}));
    var DiagnosticSeverity;
    (function(DiagnosticSeverity2) {
      DiagnosticSeverity2.Error = 1;
      DiagnosticSeverity2.Warning = 2;
      DiagnosticSeverity2.Information = 3;
      DiagnosticSeverity2.Hint = 4;
    })(DiagnosticSeverity || (exports3.DiagnosticSeverity = DiagnosticSeverity = {}));
    var DiagnosticTag;
    (function(DiagnosticTag2) {
      DiagnosticTag2.Unnecessary = 1;
      DiagnosticTag2.Deprecated = 2;
    })(DiagnosticTag || (exports3.DiagnosticTag = DiagnosticTag = {}));
    var CodeDescription;
    (function(CodeDescription2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.href);
      }
      CodeDescription2.is = is;
    })(CodeDescription || (exports3.CodeDescription = CodeDescription = {}));
    var Diagnostic;
    (function(Diagnostic2) {
      function create(range, message, severity, code, source, relatedInformation) {
        var result = { range, message };
        if (Is.defined(severity)) {
          result.severity = severity;
        }
        if (Is.defined(code)) {
          result.code = code;
        }
        if (Is.defined(source)) {
          result.source = source;
        }
        if (Is.defined(relatedInformation)) {
          result.relatedInformation = relatedInformation;
        }
        return result;
      }
      Diagnostic2.create = create;
      function is(value) {
        var _a;
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === undefined ? undefined : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
      }
      Diagnostic2.is = is;
    })(Diagnostic || (exports3.Diagnostic = Diagnostic = {}));
    var Command;
    (function(Command2) {
      function create(title, command) {
        var args = [];
        for (var _i = 2;_i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var result = { title, command };
        if (Is.defined(args) && args.length > 0) {
          result.arguments = args;
        }
        return result;
      }
      Command2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
      }
      Command2.is = is;
    })(Command || (exports3.Command = Command = {}));
    var TextEdit;
    (function(TextEdit2) {
      function replace(range, newText) {
        return { range, newText };
      }
      TextEdit2.replace = replace;
      function insert(position, newText) {
        return { range: { start: position, end: position }, newText };
      }
      TextEdit2.insert = insert;
      function del(range) {
        return { range, newText: "" };
      }
      TextEdit2.del = del;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
      }
      TextEdit2.is = is;
    })(TextEdit || (exports3.TextEdit = TextEdit = {}));
    var ChangeAnnotation;
    (function(ChangeAnnotation2) {
      function create(label, needsConfirmation, description) {
        var result = { label };
        if (needsConfirmation !== undefined) {
          result.needsConfirmation = needsConfirmation;
        }
        if (description !== undefined) {
          result.description = description;
        }
        return result;
      }
      ChangeAnnotation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === undefined) && (Is.string(candidate.description) || candidate.description === undefined);
      }
      ChangeAnnotation2.is = is;
    })(ChangeAnnotation || (exports3.ChangeAnnotation = ChangeAnnotation = {}));
    var ChangeAnnotationIdentifier;
    (function(ChangeAnnotationIdentifier2) {
      function is(value) {
        var candidate = value;
        return Is.string(candidate);
      }
      ChangeAnnotationIdentifier2.is = is;
    })(ChangeAnnotationIdentifier || (exports3.ChangeAnnotationIdentifier = ChangeAnnotationIdentifier = {}));
    var AnnotatedTextEdit;
    (function(AnnotatedTextEdit2) {
      function replace(range, newText, annotation) {
        return { range, newText, annotationId: annotation };
      }
      AnnotatedTextEdit2.replace = replace;
      function insert(position, newText, annotation) {
        return { range: { start: position, end: position }, newText, annotationId: annotation };
      }
      AnnotatedTextEdit2.insert = insert;
      function del(range, annotation) {
        return { range, newText: "", annotationId: annotation };
      }
      AnnotatedTextEdit2.del = del;
      function is(value) {
        var candidate = value;
        return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      AnnotatedTextEdit2.is = is;
    })(AnnotatedTextEdit || (exports3.AnnotatedTextEdit = AnnotatedTextEdit = {}));
    var TextDocumentEdit;
    (function(TextDocumentEdit2) {
      function create(textDocument, edits) {
        return { textDocument, edits };
      }
      TextDocumentEdit2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
      }
      TextDocumentEdit2.is = is;
    })(TextDocumentEdit || (exports3.TextDocumentEdit = TextDocumentEdit = {}));
    var CreateFile;
    (function(CreateFile2) {
      function create(uri, options, annotation) {
        var result = {
          kind: "create",
          uri
        };
        if (options !== undefined && (options.overwrite !== undefined || options.ignoreIfExists !== undefined)) {
          result.options = options;
        }
        if (annotation !== undefined) {
          result.annotationId = annotation;
        }
        return result;
      }
      CreateFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === undefined || (candidate.options.overwrite === undefined || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === undefined || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === undefined || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      CreateFile2.is = is;
    })(CreateFile || (exports3.CreateFile = CreateFile = {}));
    var RenameFile;
    (function(RenameFile2) {
      function create(oldUri, newUri, options, annotation) {
        var result = {
          kind: "rename",
          oldUri,
          newUri
        };
        if (options !== undefined && (options.overwrite !== undefined || options.ignoreIfExists !== undefined)) {
          result.options = options;
        }
        if (annotation !== undefined) {
          result.annotationId = annotation;
        }
        return result;
      }
      RenameFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === undefined || (candidate.options.overwrite === undefined || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === undefined || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === undefined || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      RenameFile2.is = is;
    })(RenameFile || (exports3.RenameFile = RenameFile = {}));
    var DeleteFile;
    (function(DeleteFile2) {
      function create(uri, options, annotation) {
        var result = {
          kind: "delete",
          uri
        };
        if (options !== undefined && (options.recursive !== undefined || options.ignoreIfNotExists !== undefined)) {
          result.options = options;
        }
        if (annotation !== undefined) {
          result.annotationId = annotation;
        }
        return result;
      }
      DeleteFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === undefined || (candidate.options.recursive === undefined || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === undefined || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === undefined || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      DeleteFile2.is = is;
    })(DeleteFile || (exports3.DeleteFile = DeleteFile = {}));
    var WorkspaceEdit;
    (function(WorkspaceEdit2) {
      function is(value) {
        var candidate = value;
        return candidate && (candidate.changes !== undefined || candidate.documentChanges !== undefined) && (candidate.documentChanges === undefined || candidate.documentChanges.every(function(change) {
          if (Is.string(change.kind)) {
            return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
          } else {
            return TextDocumentEdit.is(change);
          }
        }));
      }
      WorkspaceEdit2.is = is;
    })(WorkspaceEdit || (exports3.WorkspaceEdit = WorkspaceEdit = {}));
    var TextEditChangeImpl = function() {
      function TextEditChangeImpl2(edits, changeAnnotations) {
        this.edits = edits;
        this.changeAnnotations = changeAnnotations;
      }
      TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
        var edit;
        var id;
        if (annotation === undefined) {
          edit = TextEdit.insert(position, newText);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.insert(position, newText, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.insert(position, newText, id);
        }
        this.edits.push(edit);
        if (id !== undefined) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
        var edit;
        var id;
        if (annotation === undefined) {
          edit = TextEdit.replace(range, newText);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.replace(range, newText, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.replace(range, newText, id);
        }
        this.edits.push(edit);
        if (id !== undefined) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.delete = function(range, annotation) {
        var edit;
        var id;
        if (annotation === undefined) {
          edit = TextEdit.del(range);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.del(range, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.del(range, id);
        }
        this.edits.push(edit);
        if (id !== undefined) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.add = function(edit) {
        this.edits.push(edit);
      };
      TextEditChangeImpl2.prototype.all = function() {
        return this.edits;
      };
      TextEditChangeImpl2.prototype.clear = function() {
        this.edits.splice(0, this.edits.length);
      };
      TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
        if (value === undefined) {
          throw new Error("Text edit change is not configured to manage change annotations.");
        }
      };
      return TextEditChangeImpl2;
    }();
    var ChangeAnnotations = function() {
      function ChangeAnnotations2(annotations) {
        this._annotations = annotations === undefined ? Object.create(null) : annotations;
        this._counter = 0;
        this._size = 0;
      }
      ChangeAnnotations2.prototype.all = function() {
        return this._annotations;
      };
      Object.defineProperty(ChangeAnnotations2.prototype, "size", {
        get: function() {
          return this._size;
        },
        enumerable: false,
        configurable: true
      });
      ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
        var id;
        if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
          id = idOrAnnotation;
        } else {
          id = this.nextId();
          annotation = idOrAnnotation;
        }
        if (this._annotations[id] !== undefined) {
          throw new Error("Id ".concat(id, " is already in use."));
        }
        if (annotation === undefined) {
          throw new Error("No annotation provided for id ".concat(id));
        }
        this._annotations[id] = annotation;
        this._size++;
        return id;
      };
      ChangeAnnotations2.prototype.nextId = function() {
        this._counter++;
        return this._counter.toString();
      };
      return ChangeAnnotations2;
    }();
    var WorkspaceChange = function() {
      function WorkspaceChange2(workspaceEdit) {
        var _this = this;
        this._textEditChanges = Object.create(null);
        if (workspaceEdit !== undefined) {
          this._workspaceEdit = workspaceEdit;
          if (workspaceEdit.documentChanges) {
            this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
            workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            workspaceEdit.documentChanges.forEach(function(change) {
              if (TextDocumentEdit.is(change)) {
                var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
                _this._textEditChanges[change.textDocument.uri] = textEditChange;
              }
            });
          } else if (workspaceEdit.changes) {
            Object.keys(workspaceEdit.changes).forEach(function(key) {
              var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
              _this._textEditChanges[key] = textEditChange;
            });
          }
        } else {
          this._workspaceEdit = {};
        }
      }
      Object.defineProperty(WorkspaceChange2.prototype, "edit", {
        get: function() {
          this.initDocumentChanges();
          if (this._changeAnnotations !== undefined) {
            if (this._changeAnnotations.size === 0) {
              this._workspaceEdit.changeAnnotations = undefined;
            } else {
              this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
          }
          return this._workspaceEdit;
        },
        enumerable: false,
        configurable: true
      });
      WorkspaceChange2.prototype.getTextEditChange = function(key) {
        if (OptionalVersionedTextDocumentIdentifier.is(key)) {
          this.initDocumentChanges();
          if (this._workspaceEdit.documentChanges === undefined) {
            throw new Error("Workspace edit is not configured for document changes.");
          }
          var textDocument = { uri: key.uri, version: key.version };
          var result = this._textEditChanges[textDocument.uri];
          if (!result) {
            var edits = [];
            var textDocumentEdit = {
              textDocument,
              edits
            };
            this._workspaceEdit.documentChanges.push(textDocumentEdit);
            result = new TextEditChangeImpl(edits, this._changeAnnotations);
            this._textEditChanges[textDocument.uri] = result;
          }
          return result;
        } else {
          this.initChanges();
          if (this._workspaceEdit.changes === undefined) {
            throw new Error("Workspace edit is not configured for normal text edit changes.");
          }
          var result = this._textEditChanges[key];
          if (!result) {
            var edits = [];
            this._workspaceEdit.changes[key] = edits;
            result = new TextEditChangeImpl(edits);
            this._textEditChanges[key] = result;
          }
          return result;
        }
      };
      WorkspaceChange2.prototype.initDocumentChanges = function() {
        if (this._workspaceEdit.documentChanges === undefined && this._workspaceEdit.changes === undefined) {
          this._changeAnnotations = new ChangeAnnotations;
          this._workspaceEdit.documentChanges = [];
          this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
      };
      WorkspaceChange2.prototype.initChanges = function() {
        if (this._workspaceEdit.documentChanges === undefined && this._workspaceEdit.changes === undefined) {
          this._workspaceEdit.changes = Object.create(null);
        }
      };
      WorkspaceChange2.prototype.createFile = function(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === undefined) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === undefined) {
          operation = CreateFile.create(uri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = CreateFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== undefined) {
          return id;
        }
      };
      WorkspaceChange2.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === undefined) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === undefined) {
          operation = RenameFile.create(oldUri, newUri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = RenameFile.create(oldUri, newUri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== undefined) {
          return id;
        }
      };
      WorkspaceChange2.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === undefined) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === undefined) {
          operation = DeleteFile.create(uri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = DeleteFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== undefined) {
          return id;
        }
      };
      return WorkspaceChange2;
    }();
    exports3.WorkspaceChange = WorkspaceChange;
    var TextDocumentIdentifier;
    (function(TextDocumentIdentifier2) {
      function create(uri) {
        return { uri };
      }
      TextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri);
      }
      TextDocumentIdentifier2.is = is;
    })(TextDocumentIdentifier || (exports3.TextDocumentIdentifier = TextDocumentIdentifier = {}));
    var VersionedTextDocumentIdentifier;
    (function(VersionedTextDocumentIdentifier2) {
      function create(uri, version) {
        return { uri, version };
      }
      VersionedTextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
      }
      VersionedTextDocumentIdentifier2.is = is;
    })(VersionedTextDocumentIdentifier || (exports3.VersionedTextDocumentIdentifier = VersionedTextDocumentIdentifier = {}));
    var OptionalVersionedTextDocumentIdentifier;
    (function(OptionalVersionedTextDocumentIdentifier2) {
      function create(uri, version) {
        return { uri, version };
      }
      OptionalVersionedTextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
      }
      OptionalVersionedTextDocumentIdentifier2.is = is;
    })(OptionalVersionedTextDocumentIdentifier || (exports3.OptionalVersionedTextDocumentIdentifier = OptionalVersionedTextDocumentIdentifier = {}));
    var TextDocumentItem;
    (function(TextDocumentItem2) {
      function create(uri, languageId, version, text) {
        return { uri, languageId, version, text };
      }
      TextDocumentItem2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
      }
      TextDocumentItem2.is = is;
    })(TextDocumentItem || (exports3.TextDocumentItem = TextDocumentItem = {}));
    var MarkupKind;
    (function(MarkupKind2) {
      MarkupKind2.PlainText = "plaintext";
      MarkupKind2.Markdown = "markdown";
      function is(value) {
        var candidate = value;
        return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
      }
      MarkupKind2.is = is;
    })(MarkupKind || (exports3.MarkupKind = MarkupKind = {}));
    var MarkupContent;
    (function(MarkupContent2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
      }
      MarkupContent2.is = is;
    })(MarkupContent || (exports3.MarkupContent = MarkupContent = {}));
    var CompletionItemKind;
    (function(CompletionItemKind2) {
      CompletionItemKind2.Text = 1;
      CompletionItemKind2.Method = 2;
      CompletionItemKind2.Function = 3;
      CompletionItemKind2.Constructor = 4;
      CompletionItemKind2.Field = 5;
      CompletionItemKind2.Variable = 6;
      CompletionItemKind2.Class = 7;
      CompletionItemKind2.Interface = 8;
      CompletionItemKind2.Module = 9;
      CompletionItemKind2.Property = 10;
      CompletionItemKind2.Unit = 11;
      CompletionItemKind2.Value = 12;
      CompletionItemKind2.Enum = 13;
      CompletionItemKind2.Keyword = 14;
      CompletionItemKind2.Snippet = 15;
      CompletionItemKind2.Color = 16;
      CompletionItemKind2.File = 17;
      CompletionItemKind2.Reference = 18;
      CompletionItemKind2.Folder = 19;
      CompletionItemKind2.EnumMember = 20;
      CompletionItemKind2.Constant = 21;
      CompletionItemKind2.Struct = 22;
      CompletionItemKind2.Event = 23;
      CompletionItemKind2.Operator = 24;
      CompletionItemKind2.TypeParameter = 25;
    })(CompletionItemKind || (exports3.CompletionItemKind = CompletionItemKind = {}));
    var InsertTextFormat;
    (function(InsertTextFormat2) {
      InsertTextFormat2.PlainText = 1;
      InsertTextFormat2.Snippet = 2;
    })(InsertTextFormat || (exports3.InsertTextFormat = InsertTextFormat = {}));
    var CompletionItemTag;
    (function(CompletionItemTag2) {
      CompletionItemTag2.Deprecated = 1;
    })(CompletionItemTag || (exports3.CompletionItemTag = CompletionItemTag = {}));
    var InsertReplaceEdit;
    (function(InsertReplaceEdit2) {
      function create(newText, insert, replace) {
        return { newText, insert, replace };
      }
      InsertReplaceEdit2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
      }
      InsertReplaceEdit2.is = is;
    })(InsertReplaceEdit || (exports3.InsertReplaceEdit = InsertReplaceEdit = {}));
    var InsertTextMode;
    (function(InsertTextMode2) {
      InsertTextMode2.asIs = 1;
      InsertTextMode2.adjustIndentation = 2;
    })(InsertTextMode || (exports3.InsertTextMode = InsertTextMode = {}));
    var CompletionItemLabelDetails;
    (function(CompletionItemLabelDetails2) {
      function is(value) {
        var candidate = value;
        return candidate && (Is.string(candidate.detail) || candidate.detail === undefined) && (Is.string(candidate.description) || candidate.description === undefined);
      }
      CompletionItemLabelDetails2.is = is;
    })(CompletionItemLabelDetails || (exports3.CompletionItemLabelDetails = CompletionItemLabelDetails = {}));
    var CompletionItem;
    (function(CompletionItem2) {
      function create(label) {
        return { label };
      }
      CompletionItem2.create = create;
    })(CompletionItem || (exports3.CompletionItem = CompletionItem = {}));
    var CompletionList;
    (function(CompletionList2) {
      function create(items, isIncomplete) {
        return { items: items ? items : [], isIncomplete: !!isIncomplete };
      }
      CompletionList2.create = create;
    })(CompletionList || (exports3.CompletionList = CompletionList = {}));
    var MarkedString;
    (function(MarkedString2) {
      function fromPlainText(plainText) {
        return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
      }
      MarkedString2.fromPlainText = fromPlainText;
      function is(value) {
        var candidate = value;
        return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
      }
      MarkedString2.is = is;
    })(MarkedString || (exports3.MarkedString = MarkedString = {}));
    var Hover;
    (function(Hover2) {
      function is(value) {
        var candidate = value;
        return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === undefined || Range.is(value.range));
      }
      Hover2.is = is;
    })(Hover || (exports3.Hover = Hover = {}));
    var ParameterInformation;
    (function(ParameterInformation2) {
      function create(label, documentation) {
        return documentation ? { label, documentation } : { label };
      }
      ParameterInformation2.create = create;
    })(ParameterInformation || (exports3.ParameterInformation = ParameterInformation = {}));
    var SignatureInformation;
    (function(SignatureInformation2) {
      function create(label, documentation) {
        var parameters = [];
        for (var _i = 2;_i < arguments.length; _i++) {
          parameters[_i - 2] = arguments[_i];
        }
        var result = { label };
        if (Is.defined(documentation)) {
          result.documentation = documentation;
        }
        if (Is.defined(parameters)) {
          result.parameters = parameters;
        } else {
          result.parameters = [];
        }
        return result;
      }
      SignatureInformation2.create = create;
    })(SignatureInformation || (exports3.SignatureInformation = SignatureInformation = {}));
    var DocumentHighlightKind;
    (function(DocumentHighlightKind2) {
      DocumentHighlightKind2.Text = 1;
      DocumentHighlightKind2.Read = 2;
      DocumentHighlightKind2.Write = 3;
    })(DocumentHighlightKind || (exports3.DocumentHighlightKind = DocumentHighlightKind = {}));
    var DocumentHighlight;
    (function(DocumentHighlight2) {
      function create(range, kind) {
        var result = { range };
        if (Is.number(kind)) {
          result.kind = kind;
        }
        return result;
      }
      DocumentHighlight2.create = create;
    })(DocumentHighlight || (exports3.DocumentHighlight = DocumentHighlight = {}));
    var SymbolKind;
    (function(SymbolKind2) {
      SymbolKind2.File = 1;
      SymbolKind2.Module = 2;
      SymbolKind2.Namespace = 3;
      SymbolKind2.Package = 4;
      SymbolKind2.Class = 5;
      SymbolKind2.Method = 6;
      SymbolKind2.Property = 7;
      SymbolKind2.Field = 8;
      SymbolKind2.Constructor = 9;
      SymbolKind2.Enum = 10;
      SymbolKind2.Interface = 11;
      SymbolKind2.Function = 12;
      SymbolKind2.Variable = 13;
      SymbolKind2.Constant = 14;
      SymbolKind2.String = 15;
      SymbolKind2.Number = 16;
      SymbolKind2.Boolean = 17;
      SymbolKind2.Array = 18;
      SymbolKind2.Object = 19;
      SymbolKind2.Key = 20;
      SymbolKind2.Null = 21;
      SymbolKind2.EnumMember = 22;
      SymbolKind2.Struct = 23;
      SymbolKind2.Event = 24;
      SymbolKind2.Operator = 25;
      SymbolKind2.TypeParameter = 26;
    })(SymbolKind || (exports3.SymbolKind = SymbolKind = {}));
    var SymbolTag;
    (function(SymbolTag2) {
      SymbolTag2.Deprecated = 1;
    })(SymbolTag || (exports3.SymbolTag = SymbolTag = {}));
    var SymbolInformation;
    (function(SymbolInformation2) {
      function create(name, kind, range, uri, containerName) {
        var result = {
          name,
          kind,
          location: { uri, range }
        };
        if (containerName) {
          result.containerName = containerName;
        }
        return result;
      }
      SymbolInformation2.create = create;
    })(SymbolInformation || (exports3.SymbolInformation = SymbolInformation = {}));
    var WorkspaceSymbol;
    (function(WorkspaceSymbol2) {
      function create(name, kind, uri, range) {
        return range !== undefined ? { name, kind, location: { uri, range } } : { name, kind, location: { uri } };
      }
      WorkspaceSymbol2.create = create;
    })(WorkspaceSymbol || (exports3.WorkspaceSymbol = WorkspaceSymbol = {}));
    var DocumentSymbol;
    (function(DocumentSymbol2) {
      function create(name, detail, kind, range, selectionRange, children) {
        var result = {
          name,
          detail,
          kind,
          range,
          selectionRange
        };
        if (children !== undefined) {
          result.children = children;
        }
        return result;
      }
      DocumentSymbol2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === undefined || Is.string(candidate.detail)) && (candidate.deprecated === undefined || Is.boolean(candidate.deprecated)) && (candidate.children === undefined || Array.isArray(candidate.children)) && (candidate.tags === undefined || Array.isArray(candidate.tags));
      }
      DocumentSymbol2.is = is;
    })(DocumentSymbol || (exports3.DocumentSymbol = DocumentSymbol = {}));
    var CodeActionKind;
    (function(CodeActionKind2) {
      CodeActionKind2.Empty = "";
      CodeActionKind2.QuickFix = "quickfix";
      CodeActionKind2.Refactor = "refactor";
      CodeActionKind2.RefactorExtract = "refactor.extract";
      CodeActionKind2.RefactorInline = "refactor.inline";
      CodeActionKind2.RefactorRewrite = "refactor.rewrite";
      CodeActionKind2.Source = "source";
      CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
      CodeActionKind2.SourceFixAll = "source.fixAll";
    })(CodeActionKind || (exports3.CodeActionKind = CodeActionKind = {}));
    var CodeActionTriggerKind;
    (function(CodeActionTriggerKind2) {
      CodeActionTriggerKind2.Invoked = 1;
      CodeActionTriggerKind2.Automatic = 2;
    })(CodeActionTriggerKind || (exports3.CodeActionTriggerKind = CodeActionTriggerKind = {}));
    var CodeActionContext;
    (function(CodeActionContext2) {
      function create(diagnostics, only, triggerKind) {
        var result = { diagnostics };
        if (only !== undefined && only !== null) {
          result.only = only;
        }
        if (triggerKind !== undefined && triggerKind !== null) {
          result.triggerKind = triggerKind;
        }
        return result;
      }
      CodeActionContext2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === undefined || Is.typedArray(candidate.only, Is.string)) && (candidate.triggerKind === undefined || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
      }
      CodeActionContext2.is = is;
    })(CodeActionContext || (exports3.CodeActionContext = CodeActionContext = {}));
    var CodeAction;
    (function(CodeAction2) {
      function create(title, kindOrCommandOrEdit, kind) {
        var result = { title };
        var checkKind = true;
        if (typeof kindOrCommandOrEdit === "string") {
          checkKind = false;
          result.kind = kindOrCommandOrEdit;
        } else if (Command.is(kindOrCommandOrEdit)) {
          result.command = kindOrCommandOrEdit;
        } else {
          result.edit = kindOrCommandOrEdit;
        }
        if (checkKind && kind !== undefined) {
          result.kind = kind;
        }
        return result;
      }
      CodeAction2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.title) && (candidate.diagnostics === undefined || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === undefined || Is.string(candidate.kind)) && (candidate.edit !== undefined || candidate.command !== undefined) && (candidate.command === undefined || Command.is(candidate.command)) && (candidate.isPreferred === undefined || Is.boolean(candidate.isPreferred)) && (candidate.edit === undefined || WorkspaceEdit.is(candidate.edit));
      }
      CodeAction2.is = is;
    })(CodeAction || (exports3.CodeAction = CodeAction = {}));
    var CodeLens;
    (function(CodeLens2) {
      function create(range, data) {
        var result = { range };
        if (Is.defined(data)) {
          result.data = data;
        }
        return result;
      }
      CodeLens2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
      }
      CodeLens2.is = is;
    })(CodeLens || (exports3.CodeLens = CodeLens = {}));
    var FormattingOptions;
    (function(FormattingOptions2) {
      function create(tabSize, insertSpaces) {
        return { tabSize, insertSpaces };
      }
      FormattingOptions2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
      }
      FormattingOptions2.is = is;
    })(FormattingOptions || (exports3.FormattingOptions = FormattingOptions = {}));
    var DocumentLink;
    (function(DocumentLink2) {
      function create(range, target, data) {
        return { range, target, data };
      }
      DocumentLink2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
      }
      DocumentLink2.is = is;
    })(DocumentLink || (exports3.DocumentLink = DocumentLink = {}));
    var SelectionRange;
    (function(SelectionRange2) {
      function create(range, parent) {
        return { range, parent };
      }
      SelectionRange2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && (candidate.parent === undefined || SelectionRange2.is(candidate.parent));
      }
      SelectionRange2.is = is;
    })(SelectionRange || (exports3.SelectionRange = SelectionRange = {}));
    var SemanticTokenTypes;
    (function(SemanticTokenTypes2) {
      SemanticTokenTypes2["namespace"] = "namespace";
      SemanticTokenTypes2["type"] = "type";
      SemanticTokenTypes2["class"] = "class";
      SemanticTokenTypes2["enum"] = "enum";
      SemanticTokenTypes2["interface"] = "interface";
      SemanticTokenTypes2["struct"] = "struct";
      SemanticTokenTypes2["typeParameter"] = "typeParameter";
      SemanticTokenTypes2["parameter"] = "parameter";
      SemanticTokenTypes2["variable"] = "variable";
      SemanticTokenTypes2["property"] = "property";
      SemanticTokenTypes2["enumMember"] = "enumMember";
      SemanticTokenTypes2["event"] = "event";
      SemanticTokenTypes2["function"] = "function";
      SemanticTokenTypes2["method"] = "method";
      SemanticTokenTypes2["macro"] = "macro";
      SemanticTokenTypes2["keyword"] = "keyword";
      SemanticTokenTypes2["modifier"] = "modifier";
      SemanticTokenTypes2["comment"] = "comment";
      SemanticTokenTypes2["string"] = "string";
      SemanticTokenTypes2["number"] = "number";
      SemanticTokenTypes2["regexp"] = "regexp";
      SemanticTokenTypes2["operator"] = "operator";
      SemanticTokenTypes2["decorator"] = "decorator";
    })(SemanticTokenTypes || (exports3.SemanticTokenTypes = SemanticTokenTypes = {}));
    var SemanticTokenModifiers;
    (function(SemanticTokenModifiers2) {
      SemanticTokenModifiers2["declaration"] = "declaration";
      SemanticTokenModifiers2["definition"] = "definition";
      SemanticTokenModifiers2["readonly"] = "readonly";
      SemanticTokenModifiers2["static"] = "static";
      SemanticTokenModifiers2["deprecated"] = "deprecated";
      SemanticTokenModifiers2["abstract"] = "abstract";
      SemanticTokenModifiers2["async"] = "async";
      SemanticTokenModifiers2["modification"] = "modification";
      SemanticTokenModifiers2["documentation"] = "documentation";
      SemanticTokenModifiers2["defaultLibrary"] = "defaultLibrary";
    })(SemanticTokenModifiers || (exports3.SemanticTokenModifiers = SemanticTokenModifiers = {}));
    var SemanticTokens;
    (function(SemanticTokens2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && (candidate.resultId === undefined || typeof candidate.resultId === "string") && Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === "number");
      }
      SemanticTokens2.is = is;
    })(SemanticTokens || (exports3.SemanticTokens = SemanticTokens = {}));
    var InlineValueText;
    (function(InlineValueText2) {
      function create(range, text) {
        return { range, text };
      }
      InlineValueText2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== undefined && candidate !== null && Range.is(candidate.range) && Is.string(candidate.text);
      }
      InlineValueText2.is = is;
    })(InlineValueText || (exports3.InlineValueText = InlineValueText = {}));
    var InlineValueVariableLookup;
    (function(InlineValueVariableLookup2) {
      function create(range, variableName, caseSensitiveLookup) {
        return { range, variableName, caseSensitiveLookup };
      }
      InlineValueVariableLookup2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== undefined && candidate !== null && Range.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup) && (Is.string(candidate.variableName) || candidate.variableName === undefined);
      }
      InlineValueVariableLookup2.is = is;
    })(InlineValueVariableLookup || (exports3.InlineValueVariableLookup = InlineValueVariableLookup = {}));
    var InlineValueEvaluatableExpression;
    (function(InlineValueEvaluatableExpression2) {
      function create(range, expression) {
        return { range, expression };
      }
      InlineValueEvaluatableExpression2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== undefined && candidate !== null && Range.is(candidate.range) && (Is.string(candidate.expression) || candidate.expression === undefined);
      }
      InlineValueEvaluatableExpression2.is = is;
    })(InlineValueEvaluatableExpression || (exports3.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression = {}));
    var InlineValueContext;
    (function(InlineValueContext2) {
      function create(frameId, stoppedLocation) {
        return { frameId, stoppedLocation };
      }
      InlineValueContext2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(value.stoppedLocation);
      }
      InlineValueContext2.is = is;
    })(InlineValueContext || (exports3.InlineValueContext = InlineValueContext = {}));
    var InlayHintKind;
    (function(InlayHintKind2) {
      InlayHintKind2.Type = 1;
      InlayHintKind2.Parameter = 2;
      function is(value) {
        return value === 1 || value === 2;
      }
      InlayHintKind2.is = is;
    })(InlayHintKind || (exports3.InlayHintKind = InlayHintKind = {}));
    var InlayHintLabelPart;
    (function(InlayHintLabelPart2) {
      function create(value) {
        return { value };
      }
      InlayHintLabelPart2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && (candidate.tooltip === undefined || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.location === undefined || Location.is(candidate.location)) && (candidate.command === undefined || Command.is(candidate.command));
      }
      InlayHintLabelPart2.is = is;
    })(InlayHintLabelPart || (exports3.InlayHintLabelPart = InlayHintLabelPart = {}));
    var InlayHint;
    (function(InlayHint2) {
      function create(position, label, kind) {
        var result = { position, label };
        if (kind !== undefined) {
          result.kind = kind;
        }
        return result;
      }
      InlayHint2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.position) && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is)) && (candidate.kind === undefined || InlayHintKind.is(candidate.kind)) && candidate.textEdits === undefined || Is.typedArray(candidate.textEdits, TextEdit.is) && (candidate.tooltip === undefined || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.paddingLeft === undefined || Is.boolean(candidate.paddingLeft)) && (candidate.paddingRight === undefined || Is.boolean(candidate.paddingRight));
      }
      InlayHint2.is = is;
    })(InlayHint || (exports3.InlayHint = InlayHint = {}));
    var StringValue;
    (function(StringValue2) {
      function createSnippet(value) {
        return { kind: "snippet", value };
      }
      StringValue2.createSnippet = createSnippet;
    })(StringValue || (exports3.StringValue = StringValue = {}));
    var InlineCompletionItem;
    (function(InlineCompletionItem2) {
      function create(insertText, filterText, range, command) {
        return { insertText, filterText, range, command };
      }
      InlineCompletionItem2.create = create;
    })(InlineCompletionItem || (exports3.InlineCompletionItem = InlineCompletionItem = {}));
    var InlineCompletionList;
    (function(InlineCompletionList2) {
      function create(items) {
        return { items };
      }
      InlineCompletionList2.create = create;
    })(InlineCompletionList || (exports3.InlineCompletionList = InlineCompletionList = {}));
    var InlineCompletionTriggerKind;
    (function(InlineCompletionTriggerKind2) {
      InlineCompletionTriggerKind2.Invoked = 0;
      InlineCompletionTriggerKind2.Automatic = 1;
    })(InlineCompletionTriggerKind || (exports3.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
    var SelectedCompletionInfo;
    (function(SelectedCompletionInfo2) {
      function create(range, text) {
        return { range, text };
      }
      SelectedCompletionInfo2.create = create;
    })(SelectedCompletionInfo || (exports3.SelectedCompletionInfo = SelectedCompletionInfo = {}));
    var InlineCompletionContext;
    (function(InlineCompletionContext2) {
      function create(triggerKind, selectedCompletionInfo) {
        return { triggerKind, selectedCompletionInfo };
      }
      InlineCompletionContext2.create = create;
    })(InlineCompletionContext || (exports3.InlineCompletionContext = InlineCompletionContext = {}));
    var WorkspaceFolder;
    (function(WorkspaceFolder2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
      }
      WorkspaceFolder2.is = is;
    })(WorkspaceFolder || (exports3.WorkspaceFolder = WorkspaceFolder = {}));
    exports3.EOL = [`
`, `\r
`, "\r"];
    var TextDocument;
    (function(TextDocument2) {
      function create(uri, languageId, version, content) {
        return new FullTextDocument(uri, languageId, version, content);
      }
      TextDocument2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
      }
      TextDocument2.is = is;
      function applyEdits(document, edits) {
        var text = document.getText();
        var sortedEdits = mergeSort(edits, function(a, b) {
          var diff = a.range.start.line - b.range.start.line;
          if (diff === 0) {
            return a.range.start.character - b.range.start.character;
          }
          return diff;
        });
        var lastModifiedOffset = text.length;
        for (var i = sortedEdits.length - 1;i >= 0; i--) {
          var e = sortedEdits[i];
          var startOffset = document.offsetAt(e.range.start);
          var endOffset = document.offsetAt(e.range.end);
          if (endOffset <= lastModifiedOffset) {
            text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
          } else {
            throw new Error("Overlapping edit");
          }
          lastModifiedOffset = startOffset;
        }
        return text;
      }
      TextDocument2.applyEdits = applyEdits;
      function mergeSort(data, compare) {
        if (data.length <= 1) {
          return data;
        }
        var p = data.length / 2 | 0;
        var left = data.slice(0, p);
        var right = data.slice(p);
        mergeSort(left, compare);
        mergeSort(right, compare);
        var leftIdx = 0;
        var rightIdx = 0;
        var i = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
          var ret = compare(left[leftIdx], right[rightIdx]);
          if (ret <= 0) {
            data[i++] = left[leftIdx++];
          } else {
            data[i++] = right[rightIdx++];
          }
        }
        while (leftIdx < left.length) {
          data[i++] = left[leftIdx++];
        }
        while (rightIdx < right.length) {
          data[i++] = right[rightIdx++];
        }
        return data;
      }
    })(TextDocument || (exports3.TextDocument = TextDocument = {}));
    var FullTextDocument = function() {
      function FullTextDocument2(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = undefined;
      }
      Object.defineProperty(FullTextDocument2.prototype, "uri", {
        get: function() {
          return this._uri;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "languageId", {
        get: function() {
          return this._languageId;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "version", {
        get: function() {
          return this._version;
        },
        enumerable: false,
        configurable: true
      });
      FullTextDocument2.prototype.getText = function(range) {
        if (range) {
          var start = this.offsetAt(range.start);
          var end = this.offsetAt(range.end);
          return this._content.substring(start, end);
        }
        return this._content;
      };
      FullTextDocument2.prototype.update = function(event, version) {
        this._content = event.text;
        this._version = version;
        this._lineOffsets = undefined;
      };
      FullTextDocument2.prototype.getLineOffsets = function() {
        if (this._lineOffsets === undefined) {
          var lineOffsets = [];
          var text = this._content;
          var isLineStart = true;
          for (var i = 0;i < text.length; i++) {
            if (isLineStart) {
              lineOffsets.push(i);
              isLineStart = false;
            }
            var ch = text.charAt(i);
            isLineStart = ch === "\r" || ch === `
`;
            if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === `
`) {
              i++;
            }
          }
          if (isLineStart && text.length > 0) {
            lineOffsets.push(text.length);
          }
          this._lineOffsets = lineOffsets;
        }
        return this._lineOffsets;
      };
      FullTextDocument2.prototype.positionAt = function(offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        var lineOffsets = this.getLineOffsets();
        var low = 0, high = lineOffsets.length;
        if (high === 0) {
          return Position.create(0, offset);
        }
        while (low < high) {
          var mid = Math.floor((low + high) / 2);
          if (lineOffsets[mid] > offset) {
            high = mid;
          } else {
            low = mid + 1;
          }
        }
        var line = low - 1;
        return Position.create(line, offset - lineOffsets[line]);
      };
      FullTextDocument2.prototype.offsetAt = function(position) {
        var lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
          return this._content.length;
        } else if (position.line < 0) {
          return 0;
        }
        var lineOffset = lineOffsets[position.line];
        var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
      };
      Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
        get: function() {
          return this.getLineOffsets().length;
        },
        enumerable: false,
        configurable: true
      });
      return FullTextDocument2;
    }();
    var Is;
    (function(Is2) {
      var toString = Object.prototype.toString;
      function defined(value) {
        return typeof value !== "undefined";
      }
      Is2.defined = defined;
      function undefined2(value) {
        return typeof value === "undefined";
      }
      Is2.undefined = undefined2;
      function boolean(value) {
        return value === true || value === false;
      }
      Is2.boolean = boolean;
      function string(value) {
        return toString.call(value) === "[object String]";
      }
      Is2.string = string;
      function number(value) {
        return toString.call(value) === "[object Number]";
      }
      Is2.number = number;
      function numberRange(value, min, max) {
        return toString.call(value) === "[object Number]" && min <= value && value <= max;
      }
      Is2.numberRange = numberRange;
      function integer2(value) {
        return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
      }
      Is2.integer = integer2;
      function uinteger2(value) {
        return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
      }
      Is2.uinteger = uinteger2;
      function func(value) {
        return toString.call(value) === "[object Function]";
      }
      Is2.func = func;
      function objectLiteral(value) {
        return value !== null && typeof value === "object";
      }
      Is2.objectLiteral = objectLiteral;
      function typedArray(value, check) {
        return Array.isArray(value) && value.every(check);
      }
      Is2.typedArray = typedArray;
    })(Is || (Is = {}));
  });
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/messages.js
var require_messages2 = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ProtocolNotificationType = exports2.ProtocolNotificationType0 = exports2.ProtocolRequestType = exports2.ProtocolRequestType0 = exports2.RegistrationType = exports2.MessageDirection = undefined;
  var vscode_jsonrpc_1 = require_main();
  var MessageDirection;
  (function(MessageDirection2) {
    MessageDirection2["clientToServer"] = "clientToServer";
    MessageDirection2["serverToClient"] = "serverToClient";
    MessageDirection2["both"] = "both";
  })(MessageDirection || (exports2.MessageDirection = MessageDirection = {}));

  class RegistrationType {
    constructor(method) {
      this.method = method;
    }
  }
  exports2.RegistrationType = RegistrationType;

  class ProtocolRequestType0 extends vscode_jsonrpc_1.RequestType0 {
    constructor(method) {
      super(method);
    }
  }
  exports2.ProtocolRequestType0 = ProtocolRequestType0;

  class ProtocolRequestType extends vscode_jsonrpc_1.RequestType {
    constructor(method) {
      super(method, vscode_jsonrpc_1.ParameterStructures.byName);
    }
  }
  exports2.ProtocolRequestType = ProtocolRequestType;

  class ProtocolNotificationType0 extends vscode_jsonrpc_1.NotificationType0 {
    constructor(method) {
      super(method);
    }
  }
  exports2.ProtocolNotificationType0 = ProtocolNotificationType0;

  class ProtocolNotificationType extends vscode_jsonrpc_1.NotificationType {
    constructor(method) {
      super(method, vscode_jsonrpc_1.ParameterStructures.byName);
    }
  }
  exports2.ProtocolNotificationType = ProtocolNotificationType;
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/utils/is.js
var require_is3 = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.objectLiteral = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = undefined;
  function boolean(value) {
    return value === true || value === false;
  }
  exports2.boolean = boolean;
  function string(value) {
    return typeof value === "string" || value instanceof String;
  }
  exports2.string = string;
  function number(value) {
    return typeof value === "number" || value instanceof Number;
  }
  exports2.number = number;
  function error(value) {
    return value instanceof Error;
  }
  exports2.error = error;
  function func(value) {
    return typeof value === "function";
  }
  exports2.func = func;
  function array(value) {
    return Array.isArray(value);
  }
  exports2.array = array;
  function stringArray(value) {
    return array(value) && value.every((elem) => string(elem));
  }
  exports2.stringArray = stringArray;
  function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
  }
  exports2.typedArray = typedArray;
  function objectLiteral(value) {
    return value !== null && typeof value === "object";
  }
  exports2.objectLiteral = objectLiteral;
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js
var require_protocol_implementation = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ImplementationRequest = undefined;
  var messages_1 = require_messages2();
  var ImplementationRequest;
  (function(ImplementationRequest2) {
    ImplementationRequest2.method = "textDocument/implementation";
    ImplementationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    ImplementationRequest2.type = new messages_1.ProtocolRequestType(ImplementationRequest2.method);
  })(ImplementationRequest || (exports2.ImplementationRequest = ImplementationRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js
var require_protocol_typeDefinition = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.TypeDefinitionRequest = undefined;
  var messages_1 = require_messages2();
  var TypeDefinitionRequest;
  (function(TypeDefinitionRequest2) {
    TypeDefinitionRequest2.method = "textDocument/typeDefinition";
    TypeDefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeDefinitionRequest2.type = new messages_1.ProtocolRequestType(TypeDefinitionRequest2.method);
  })(TypeDefinitionRequest || (exports2.TypeDefinitionRequest = TypeDefinitionRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js
var require_protocol_workspaceFolder = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = undefined;
  var messages_1 = require_messages2();
  var WorkspaceFoldersRequest;
  (function(WorkspaceFoldersRequest2) {
    WorkspaceFoldersRequest2.method = "workspace/workspaceFolders";
    WorkspaceFoldersRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    WorkspaceFoldersRequest2.type = new messages_1.ProtocolRequestType0(WorkspaceFoldersRequest2.method);
  })(WorkspaceFoldersRequest || (exports2.WorkspaceFoldersRequest = WorkspaceFoldersRequest = {}));
  var DidChangeWorkspaceFoldersNotification;
  (function(DidChangeWorkspaceFoldersNotification2) {
    DidChangeWorkspaceFoldersNotification2.method = "workspace/didChangeWorkspaceFolders";
    DidChangeWorkspaceFoldersNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeWorkspaceFoldersNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWorkspaceFoldersNotification2.method);
  })(DidChangeWorkspaceFoldersNotification || (exports2.DidChangeWorkspaceFoldersNotification = DidChangeWorkspaceFoldersNotification = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js
var require_protocol_configuration = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ConfigurationRequest = undefined;
  var messages_1 = require_messages2();
  var ConfigurationRequest;
  (function(ConfigurationRequest2) {
    ConfigurationRequest2.method = "workspace/configuration";
    ConfigurationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    ConfigurationRequest2.type = new messages_1.ProtocolRequestType(ConfigurationRequest2.method);
  })(ConfigurationRequest || (exports2.ConfigurationRequest = ConfigurationRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js
var require_protocol_colorProvider = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ColorPresentationRequest = exports2.DocumentColorRequest = undefined;
  var messages_1 = require_messages2();
  var DocumentColorRequest;
  (function(DocumentColorRequest2) {
    DocumentColorRequest2.method = "textDocument/documentColor";
    DocumentColorRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentColorRequest2.type = new messages_1.ProtocolRequestType(DocumentColorRequest2.method);
  })(DocumentColorRequest || (exports2.DocumentColorRequest = DocumentColorRequest = {}));
  var ColorPresentationRequest;
  (function(ColorPresentationRequest2) {
    ColorPresentationRequest2.method = "textDocument/colorPresentation";
    ColorPresentationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    ColorPresentationRequest2.type = new messages_1.ProtocolRequestType(ColorPresentationRequest2.method);
  })(ColorPresentationRequest || (exports2.ColorPresentationRequest = ColorPresentationRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js
var require_protocol_foldingRange = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = undefined;
  var messages_1 = require_messages2();
  var FoldingRangeRequest;
  (function(FoldingRangeRequest2) {
    FoldingRangeRequest2.method = "textDocument/foldingRange";
    FoldingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    FoldingRangeRequest2.type = new messages_1.ProtocolRequestType(FoldingRangeRequest2.method);
  })(FoldingRangeRequest || (exports2.FoldingRangeRequest = FoldingRangeRequest = {}));
  var FoldingRangeRefreshRequest;
  (function(FoldingRangeRefreshRequest2) {
    FoldingRangeRefreshRequest2.method = `workspace/foldingRange/refresh`;
    FoldingRangeRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    FoldingRangeRefreshRequest2.type = new messages_1.ProtocolRequestType0(FoldingRangeRefreshRequest2.method);
  })(FoldingRangeRefreshRequest || (exports2.FoldingRangeRefreshRequest = FoldingRangeRefreshRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js
var require_protocol_declaration = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DeclarationRequest = undefined;
  var messages_1 = require_messages2();
  var DeclarationRequest;
  (function(DeclarationRequest2) {
    DeclarationRequest2.method = "textDocument/declaration";
    DeclarationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DeclarationRequest2.type = new messages_1.ProtocolRequestType(DeclarationRequest2.method);
  })(DeclarationRequest || (exports2.DeclarationRequest = DeclarationRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js
var require_protocol_selectionRange = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.SelectionRangeRequest = undefined;
  var messages_1 = require_messages2();
  var SelectionRangeRequest;
  (function(SelectionRangeRequest2) {
    SelectionRangeRequest2.method = "textDocument/selectionRange";
    SelectionRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    SelectionRangeRequest2.type = new messages_1.ProtocolRequestType(SelectionRangeRequest2.method);
  })(SelectionRangeRequest || (exports2.SelectionRangeRequest = SelectionRangeRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js
var require_protocol_progress = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = undefined;
  var vscode_jsonrpc_1 = require_main();
  var messages_1 = require_messages2();
  var WorkDoneProgress;
  (function(WorkDoneProgress2) {
    WorkDoneProgress2.type = new vscode_jsonrpc_1.ProgressType;
    function is(value) {
      return value === WorkDoneProgress2.type;
    }
    WorkDoneProgress2.is = is;
  })(WorkDoneProgress || (exports2.WorkDoneProgress = WorkDoneProgress = {}));
  var WorkDoneProgressCreateRequest;
  (function(WorkDoneProgressCreateRequest2) {
    WorkDoneProgressCreateRequest2.method = "window/workDoneProgress/create";
    WorkDoneProgressCreateRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    WorkDoneProgressCreateRequest2.type = new messages_1.ProtocolRequestType(WorkDoneProgressCreateRequest2.method);
  })(WorkDoneProgressCreateRequest || (exports2.WorkDoneProgressCreateRequest = WorkDoneProgressCreateRequest = {}));
  var WorkDoneProgressCancelNotification;
  (function(WorkDoneProgressCancelNotification2) {
    WorkDoneProgressCancelNotification2.method = "window/workDoneProgress/cancel";
    WorkDoneProgressCancelNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkDoneProgressCancelNotification2.type = new messages_1.ProtocolNotificationType(WorkDoneProgressCancelNotification2.method);
  })(WorkDoneProgressCancelNotification || (exports2.WorkDoneProgressCancelNotification = WorkDoneProgressCancelNotification = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js
var require_protocol_callHierarchy = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.CallHierarchyPrepareRequest = undefined;
  var messages_1 = require_messages2();
  var CallHierarchyPrepareRequest;
  (function(CallHierarchyPrepareRequest2) {
    CallHierarchyPrepareRequest2.method = "textDocument/prepareCallHierarchy";
    CallHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CallHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyPrepareRequest2.method);
  })(CallHierarchyPrepareRequest || (exports2.CallHierarchyPrepareRequest = CallHierarchyPrepareRequest = {}));
  var CallHierarchyIncomingCallsRequest;
  (function(CallHierarchyIncomingCallsRequest2) {
    CallHierarchyIncomingCallsRequest2.method = "callHierarchy/incomingCalls";
    CallHierarchyIncomingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CallHierarchyIncomingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyIncomingCallsRequest2.method);
  })(CallHierarchyIncomingCallsRequest || (exports2.CallHierarchyIncomingCallsRequest = CallHierarchyIncomingCallsRequest = {}));
  var CallHierarchyOutgoingCallsRequest;
  (function(CallHierarchyOutgoingCallsRequest2) {
    CallHierarchyOutgoingCallsRequest2.method = "callHierarchy/outgoingCalls";
    CallHierarchyOutgoingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CallHierarchyOutgoingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyOutgoingCallsRequest2.method);
  })(CallHierarchyOutgoingCallsRequest || (exports2.CallHierarchyOutgoingCallsRequest = CallHierarchyOutgoingCallsRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js
var require_protocol_semanticTokens = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.SemanticTokensRegistrationType = exports2.TokenFormat = undefined;
  var messages_1 = require_messages2();
  var TokenFormat;
  (function(TokenFormat2) {
    TokenFormat2.Relative = "relative";
  })(TokenFormat || (exports2.TokenFormat = TokenFormat = {}));
  var SemanticTokensRegistrationType;
  (function(SemanticTokensRegistrationType2) {
    SemanticTokensRegistrationType2.method = "textDocument/semanticTokens";
    SemanticTokensRegistrationType2.type = new messages_1.RegistrationType(SemanticTokensRegistrationType2.method);
  })(SemanticTokensRegistrationType || (exports2.SemanticTokensRegistrationType = SemanticTokensRegistrationType = {}));
  var SemanticTokensRequest;
  (function(SemanticTokensRequest2) {
    SemanticTokensRequest2.method = "textDocument/semanticTokens/full";
    SemanticTokensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    SemanticTokensRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRequest2.method);
    SemanticTokensRequest2.registrationMethod = SemanticTokensRegistrationType.method;
  })(SemanticTokensRequest || (exports2.SemanticTokensRequest = SemanticTokensRequest = {}));
  var SemanticTokensDeltaRequest;
  (function(SemanticTokensDeltaRequest2) {
    SemanticTokensDeltaRequest2.method = "textDocument/semanticTokens/full/delta";
    SemanticTokensDeltaRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    SemanticTokensDeltaRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensDeltaRequest2.method);
    SemanticTokensDeltaRequest2.registrationMethod = SemanticTokensRegistrationType.method;
  })(SemanticTokensDeltaRequest || (exports2.SemanticTokensDeltaRequest = SemanticTokensDeltaRequest = {}));
  var SemanticTokensRangeRequest;
  (function(SemanticTokensRangeRequest2) {
    SemanticTokensRangeRequest2.method = "textDocument/semanticTokens/range";
    SemanticTokensRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    SemanticTokensRangeRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRangeRequest2.method);
    SemanticTokensRangeRequest2.registrationMethod = SemanticTokensRegistrationType.method;
  })(SemanticTokensRangeRequest || (exports2.SemanticTokensRangeRequest = SemanticTokensRangeRequest = {}));
  var SemanticTokensRefreshRequest;
  (function(SemanticTokensRefreshRequest2) {
    SemanticTokensRefreshRequest2.method = `workspace/semanticTokens/refresh`;
    SemanticTokensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    SemanticTokensRefreshRequest2.type = new messages_1.ProtocolRequestType0(SemanticTokensRefreshRequest2.method);
  })(SemanticTokensRefreshRequest || (exports2.SemanticTokensRefreshRequest = SemanticTokensRefreshRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js
var require_protocol_showDocument = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ShowDocumentRequest = undefined;
  var messages_1 = require_messages2();
  var ShowDocumentRequest;
  (function(ShowDocumentRequest2) {
    ShowDocumentRequest2.method = "window/showDocument";
    ShowDocumentRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    ShowDocumentRequest2.type = new messages_1.ProtocolRequestType(ShowDocumentRequest2.method);
  })(ShowDocumentRequest || (exports2.ShowDocumentRequest = ShowDocumentRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js
var require_protocol_linkedEditingRange = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.LinkedEditingRangeRequest = undefined;
  var messages_1 = require_messages2();
  var LinkedEditingRangeRequest;
  (function(LinkedEditingRangeRequest2) {
    LinkedEditingRangeRequest2.method = "textDocument/linkedEditingRange";
    LinkedEditingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    LinkedEditingRangeRequest2.type = new messages_1.ProtocolRequestType(LinkedEditingRangeRequest2.method);
  })(LinkedEditingRangeRequest || (exports2.LinkedEditingRangeRequest = LinkedEditingRangeRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js
var require_protocol_fileOperations = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.DidRenameFilesNotification = exports2.WillRenameFilesRequest = exports2.DidCreateFilesNotification = exports2.WillCreateFilesRequest = exports2.FileOperationPatternKind = undefined;
  var messages_1 = require_messages2();
  var FileOperationPatternKind;
  (function(FileOperationPatternKind2) {
    FileOperationPatternKind2.file = "file";
    FileOperationPatternKind2.folder = "folder";
  })(FileOperationPatternKind || (exports2.FileOperationPatternKind = FileOperationPatternKind = {}));
  var WillCreateFilesRequest;
  (function(WillCreateFilesRequest2) {
    WillCreateFilesRequest2.method = "workspace/willCreateFiles";
    WillCreateFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WillCreateFilesRequest2.type = new messages_1.ProtocolRequestType(WillCreateFilesRequest2.method);
  })(WillCreateFilesRequest || (exports2.WillCreateFilesRequest = WillCreateFilesRequest = {}));
  var DidCreateFilesNotification;
  (function(DidCreateFilesNotification2) {
    DidCreateFilesNotification2.method = "workspace/didCreateFiles";
    DidCreateFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidCreateFilesNotification2.type = new messages_1.ProtocolNotificationType(DidCreateFilesNotification2.method);
  })(DidCreateFilesNotification || (exports2.DidCreateFilesNotification = DidCreateFilesNotification = {}));
  var WillRenameFilesRequest;
  (function(WillRenameFilesRequest2) {
    WillRenameFilesRequest2.method = "workspace/willRenameFiles";
    WillRenameFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WillRenameFilesRequest2.type = new messages_1.ProtocolRequestType(WillRenameFilesRequest2.method);
  })(WillRenameFilesRequest || (exports2.WillRenameFilesRequest = WillRenameFilesRequest = {}));
  var DidRenameFilesNotification;
  (function(DidRenameFilesNotification2) {
    DidRenameFilesNotification2.method = "workspace/didRenameFiles";
    DidRenameFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidRenameFilesNotification2.type = new messages_1.ProtocolNotificationType(DidRenameFilesNotification2.method);
  })(DidRenameFilesNotification || (exports2.DidRenameFilesNotification = DidRenameFilesNotification = {}));
  var DidDeleteFilesNotification;
  (function(DidDeleteFilesNotification2) {
    DidDeleteFilesNotification2.method = "workspace/didDeleteFiles";
    DidDeleteFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidDeleteFilesNotification2.type = new messages_1.ProtocolNotificationType(DidDeleteFilesNotification2.method);
  })(DidDeleteFilesNotification || (exports2.DidDeleteFilesNotification = DidDeleteFilesNotification = {}));
  var WillDeleteFilesRequest;
  (function(WillDeleteFilesRequest2) {
    WillDeleteFilesRequest2.method = "workspace/willDeleteFiles";
    WillDeleteFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WillDeleteFilesRequest2.type = new messages_1.ProtocolRequestType(WillDeleteFilesRequest2.method);
  })(WillDeleteFilesRequest || (exports2.WillDeleteFilesRequest = WillDeleteFilesRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js
var require_protocol_moniker = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = undefined;
  var messages_1 = require_messages2();
  var UniquenessLevel;
  (function(UniquenessLevel2) {
    UniquenessLevel2.document = "document";
    UniquenessLevel2.project = "project";
    UniquenessLevel2.group = "group";
    UniquenessLevel2.scheme = "scheme";
    UniquenessLevel2.global = "global";
  })(UniquenessLevel || (exports2.UniquenessLevel = UniquenessLevel = {}));
  var MonikerKind;
  (function(MonikerKind2) {
    MonikerKind2.$import = "import";
    MonikerKind2.$export = "export";
    MonikerKind2.local = "local";
  })(MonikerKind || (exports2.MonikerKind = MonikerKind = {}));
  var MonikerRequest;
  (function(MonikerRequest2) {
    MonikerRequest2.method = "textDocument/moniker";
    MonikerRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    MonikerRequest2.type = new messages_1.ProtocolRequestType(MonikerRequest2.method);
  })(MonikerRequest || (exports2.MonikerRequest = MonikerRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js
var require_protocol_typeHierarchy = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchyPrepareRequest = undefined;
  var messages_1 = require_messages2();
  var TypeHierarchyPrepareRequest;
  (function(TypeHierarchyPrepareRequest2) {
    TypeHierarchyPrepareRequest2.method = "textDocument/prepareTypeHierarchy";
    TypeHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchyPrepareRequest2.method);
  })(TypeHierarchyPrepareRequest || (exports2.TypeHierarchyPrepareRequest = TypeHierarchyPrepareRequest = {}));
  var TypeHierarchySupertypesRequest;
  (function(TypeHierarchySupertypesRequest2) {
    TypeHierarchySupertypesRequest2.method = "typeHierarchy/supertypes";
    TypeHierarchySupertypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeHierarchySupertypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySupertypesRequest2.method);
  })(TypeHierarchySupertypesRequest || (exports2.TypeHierarchySupertypesRequest = TypeHierarchySupertypesRequest = {}));
  var TypeHierarchySubtypesRequest;
  (function(TypeHierarchySubtypesRequest2) {
    TypeHierarchySubtypesRequest2.method = "typeHierarchy/subtypes";
    TypeHierarchySubtypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeHierarchySubtypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySubtypesRequest2.method);
  })(TypeHierarchySubtypesRequest || (exports2.TypeHierarchySubtypesRequest = TypeHierarchySubtypesRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js
var require_protocol_inlineValue = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = undefined;
  var messages_1 = require_messages2();
  var InlineValueRequest;
  (function(InlineValueRequest2) {
    InlineValueRequest2.method = "textDocument/inlineValue";
    InlineValueRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    InlineValueRequest2.type = new messages_1.ProtocolRequestType(InlineValueRequest2.method);
  })(InlineValueRequest || (exports2.InlineValueRequest = InlineValueRequest = {}));
  var InlineValueRefreshRequest;
  (function(InlineValueRefreshRequest2) {
    InlineValueRefreshRequest2.method = `workspace/inlineValue/refresh`;
    InlineValueRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    InlineValueRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlineValueRefreshRequest2.method);
  })(InlineValueRefreshRequest || (exports2.InlineValueRefreshRequest = InlineValueRefreshRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js
var require_protocol_inlayHint = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = undefined;
  var messages_1 = require_messages2();
  var InlayHintRequest;
  (function(InlayHintRequest2) {
    InlayHintRequest2.method = "textDocument/inlayHint";
    InlayHintRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    InlayHintRequest2.type = new messages_1.ProtocolRequestType(InlayHintRequest2.method);
  })(InlayHintRequest || (exports2.InlayHintRequest = InlayHintRequest = {}));
  var InlayHintResolveRequest;
  (function(InlayHintResolveRequest2) {
    InlayHintResolveRequest2.method = "inlayHint/resolve";
    InlayHintResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    InlayHintResolveRequest2.type = new messages_1.ProtocolRequestType(InlayHintResolveRequest2.method);
  })(InlayHintResolveRequest || (exports2.InlayHintResolveRequest = InlayHintResolveRequest = {}));
  var InlayHintRefreshRequest;
  (function(InlayHintRefreshRequest2) {
    InlayHintRefreshRequest2.method = `workspace/inlayHint/refresh`;
    InlayHintRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    InlayHintRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlayHintRefreshRequest2.method);
  })(InlayHintRefreshRequest || (exports2.InlayHintRefreshRequest = InlayHintRefreshRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js
var require_protocol_diagnostic = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = undefined;
  var vscode_jsonrpc_1 = require_main();
  var Is = require_is3();
  var messages_1 = require_messages2();
  var DiagnosticServerCancellationData;
  (function(DiagnosticServerCancellationData2) {
    function is(value) {
      const candidate = value;
      return candidate && Is.boolean(candidate.retriggerRequest);
    }
    DiagnosticServerCancellationData2.is = is;
  })(DiagnosticServerCancellationData || (exports2.DiagnosticServerCancellationData = DiagnosticServerCancellationData = {}));
  var DocumentDiagnosticReportKind;
  (function(DocumentDiagnosticReportKind2) {
    DocumentDiagnosticReportKind2.Full = "full";
    DocumentDiagnosticReportKind2.Unchanged = "unchanged";
  })(DocumentDiagnosticReportKind || (exports2.DocumentDiagnosticReportKind = DocumentDiagnosticReportKind = {}));
  var DocumentDiagnosticRequest;
  (function(DocumentDiagnosticRequest2) {
    DocumentDiagnosticRequest2.method = "textDocument/diagnostic";
    DocumentDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentDiagnosticRequest2.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest2.method);
    DocumentDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType;
  })(DocumentDiagnosticRequest || (exports2.DocumentDiagnosticRequest = DocumentDiagnosticRequest = {}));
  var WorkspaceDiagnosticRequest;
  (function(WorkspaceDiagnosticRequest2) {
    WorkspaceDiagnosticRequest2.method = "workspace/diagnostic";
    WorkspaceDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkspaceDiagnosticRequest2.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest2.method);
    WorkspaceDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType;
  })(WorkspaceDiagnosticRequest || (exports2.WorkspaceDiagnosticRequest = WorkspaceDiagnosticRequest = {}));
  var DiagnosticRefreshRequest;
  (function(DiagnosticRefreshRequest2) {
    DiagnosticRefreshRequest2.method = `workspace/diagnostic/refresh`;
    DiagnosticRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    DiagnosticRefreshRequest2.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest2.method);
  })(DiagnosticRefreshRequest || (exports2.DiagnosticRefreshRequest = DiagnosticRefreshRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js
var require_protocol_notebook = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = undefined;
  var vscode_languageserver_types_1 = require_main2();
  var Is = require_is3();
  var messages_1 = require_messages2();
  var NotebookCellKind;
  (function(NotebookCellKind2) {
    NotebookCellKind2.Markup = 1;
    NotebookCellKind2.Code = 2;
    function is(value) {
      return value === 1 || value === 2;
    }
    NotebookCellKind2.is = is;
  })(NotebookCellKind || (exports2.NotebookCellKind = NotebookCellKind = {}));
  var ExecutionSummary;
  (function(ExecutionSummary2) {
    function create(executionOrder, success) {
      const result = { executionOrder };
      if (success === true || success === false) {
        result.success = success;
      }
      return result;
    }
    ExecutionSummary2.create = create;
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.executionOrder) && (candidate.success === undefined || Is.boolean(candidate.success));
    }
    ExecutionSummary2.is = is;
    function equals(one, other) {
      if (one === other) {
        return true;
      }
      if (one === null || one === undefined || other === null || other === undefined) {
        return false;
      }
      return one.executionOrder === other.executionOrder && one.success === other.success;
    }
    ExecutionSummary2.equals = equals;
  })(ExecutionSummary || (exports2.ExecutionSummary = ExecutionSummary = {}));
  var NotebookCell;
  (function(NotebookCell2) {
    function create(kind, document) {
      return { kind, document };
    }
    NotebookCell2.create = create;
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && NotebookCellKind.is(candidate.kind) && vscode_languageserver_types_1.DocumentUri.is(candidate.document) && (candidate.metadata === undefined || Is.objectLiteral(candidate.metadata));
    }
    NotebookCell2.is = is;
    function diff(one, two) {
      const result = new Set;
      if (one.document !== two.document) {
        result.add("document");
      }
      if (one.kind !== two.kind) {
        result.add("kind");
      }
      if (one.executionSummary !== two.executionSummary) {
        result.add("executionSummary");
      }
      if ((one.metadata !== undefined || two.metadata !== undefined) && !equalsMetadata(one.metadata, two.metadata)) {
        result.add("metadata");
      }
      if ((one.executionSummary !== undefined || two.executionSummary !== undefined) && !ExecutionSummary.equals(one.executionSummary, two.executionSummary)) {
        result.add("executionSummary");
      }
      return result;
    }
    NotebookCell2.diff = diff;
    function equalsMetadata(one, other) {
      if (one === other) {
        return true;
      }
      if (one === null || one === undefined || other === null || other === undefined) {
        return false;
      }
      if (typeof one !== typeof other) {
        return false;
      }
      if (typeof one !== "object") {
        return false;
      }
      const oneArray = Array.isArray(one);
      const otherArray = Array.isArray(other);
      if (oneArray !== otherArray) {
        return false;
      }
      if (oneArray && otherArray) {
        if (one.length !== other.length) {
          return false;
        }
        for (let i = 0;i < one.length; i++) {
          if (!equalsMetadata(one[i], other[i])) {
            return false;
          }
        }
      }
      if (Is.objectLiteral(one) && Is.objectLiteral(other)) {
        const oneKeys = Object.keys(one);
        const otherKeys = Object.keys(other);
        if (oneKeys.length !== otherKeys.length) {
          return false;
        }
        oneKeys.sort();
        otherKeys.sort();
        if (!equalsMetadata(oneKeys, otherKeys)) {
          return false;
        }
        for (let i = 0;i < oneKeys.length; i++) {
          const prop = oneKeys[i];
          if (!equalsMetadata(one[prop], other[prop])) {
            return false;
          }
        }
      }
      return true;
    }
  })(NotebookCell || (exports2.NotebookCell = NotebookCell = {}));
  var NotebookDocument;
  (function(NotebookDocument2) {
    function create(uri, notebookType, version, cells) {
      return { uri, notebookType, version, cells };
    }
    NotebookDocument2.create = create;
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && Is.string(candidate.uri) && vscode_languageserver_types_1.integer.is(candidate.version) && Is.typedArray(candidate.cells, NotebookCell.is);
    }
    NotebookDocument2.is = is;
  })(NotebookDocument || (exports2.NotebookDocument = NotebookDocument = {}));
  var NotebookDocumentSyncRegistrationType;
  (function(NotebookDocumentSyncRegistrationType2) {
    NotebookDocumentSyncRegistrationType2.method = "notebookDocument/sync";
    NotebookDocumentSyncRegistrationType2.messageDirection = messages_1.MessageDirection.clientToServer;
    NotebookDocumentSyncRegistrationType2.type = new messages_1.RegistrationType(NotebookDocumentSyncRegistrationType2.method);
  })(NotebookDocumentSyncRegistrationType || (exports2.NotebookDocumentSyncRegistrationType = NotebookDocumentSyncRegistrationType = {}));
  var DidOpenNotebookDocumentNotification;
  (function(DidOpenNotebookDocumentNotification2) {
    DidOpenNotebookDocumentNotification2.method = "notebookDocument/didOpen";
    DidOpenNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidOpenNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenNotebookDocumentNotification2.method);
    DidOpenNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
  })(DidOpenNotebookDocumentNotification || (exports2.DidOpenNotebookDocumentNotification = DidOpenNotebookDocumentNotification = {}));
  var NotebookCellArrayChange;
  (function(NotebookCellArrayChange2) {
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.start) && vscode_languageserver_types_1.uinteger.is(candidate.deleteCount) && (candidate.cells === undefined || Is.typedArray(candidate.cells, NotebookCell.is));
    }
    NotebookCellArrayChange2.is = is;
    function create(start, deleteCount, cells) {
      const result = { start, deleteCount };
      if (cells !== undefined) {
        result.cells = cells;
      }
      return result;
    }
    NotebookCellArrayChange2.create = create;
  })(NotebookCellArrayChange || (exports2.NotebookCellArrayChange = NotebookCellArrayChange = {}));
  var DidChangeNotebookDocumentNotification;
  (function(DidChangeNotebookDocumentNotification2) {
    DidChangeNotebookDocumentNotification2.method = "notebookDocument/didChange";
    DidChangeNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeNotebookDocumentNotification2.method);
    DidChangeNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
  })(DidChangeNotebookDocumentNotification || (exports2.DidChangeNotebookDocumentNotification = DidChangeNotebookDocumentNotification = {}));
  var DidSaveNotebookDocumentNotification;
  (function(DidSaveNotebookDocumentNotification2) {
    DidSaveNotebookDocumentNotification2.method = "notebookDocument/didSave";
    DidSaveNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidSaveNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveNotebookDocumentNotification2.method);
    DidSaveNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
  })(DidSaveNotebookDocumentNotification || (exports2.DidSaveNotebookDocumentNotification = DidSaveNotebookDocumentNotification = {}));
  var DidCloseNotebookDocumentNotification;
  (function(DidCloseNotebookDocumentNotification2) {
    DidCloseNotebookDocumentNotification2.method = "notebookDocument/didClose";
    DidCloseNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidCloseNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseNotebookDocumentNotification2.method);
    DidCloseNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
  })(DidCloseNotebookDocumentNotification || (exports2.DidCloseNotebookDocumentNotification = DidCloseNotebookDocumentNotification = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js
var require_protocol_inlineCompletion = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.InlineCompletionRequest = undefined;
  var messages_1 = require_messages2();
  var InlineCompletionRequest;
  (function(InlineCompletionRequest2) {
    InlineCompletionRequest2.method = "textDocument/inlineCompletion";
    InlineCompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    InlineCompletionRequest2.type = new messages_1.ProtocolRequestType(InlineCompletionRequest2.method);
  })(InlineCompletionRequest || (exports2.InlineCompletionRequest = InlineCompletionRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/protocol.js
var require_protocol = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.WorkspaceSymbolRequest = exports2.CodeActionResolveRequest = exports2.CodeActionRequest = exports2.DocumentSymbolRequest = exports2.DocumentHighlightRequest = exports2.ReferencesRequest = exports2.DefinitionRequest = exports2.SignatureHelpRequest = exports2.SignatureHelpTriggerKind = exports2.HoverRequest = exports2.CompletionResolveRequest = exports2.CompletionRequest = exports2.CompletionTriggerKind = exports2.PublishDiagnosticsNotification = exports2.WatchKind = exports2.RelativePattern = exports2.FileChangeType = exports2.DidChangeWatchedFilesNotification = exports2.WillSaveTextDocumentWaitUntilRequest = exports2.WillSaveTextDocumentNotification = exports2.TextDocumentSaveReason = exports2.DidSaveTextDocumentNotification = exports2.DidCloseTextDocumentNotification = exports2.DidChangeTextDocumentNotification = exports2.TextDocumentContentChangeEvent = exports2.DidOpenTextDocumentNotification = exports2.TextDocumentSyncKind = exports2.TelemetryEventNotification = exports2.LogMessageNotification = exports2.ShowMessageRequest = exports2.ShowMessageNotification = exports2.MessageType = exports2.DidChangeConfigurationNotification = exports2.ExitNotification = exports2.ShutdownRequest = exports2.InitializedNotification = exports2.InitializeErrorCodes = exports2.InitializeRequest = exports2.WorkDoneProgressOptions = exports2.TextDocumentRegistrationOptions = exports2.StaticRegistrationOptions = exports2.PositionEncodingKind = exports2.FailureHandlingKind = exports2.ResourceOperationKind = exports2.UnregistrationRequest = exports2.RegistrationRequest = exports2.DocumentSelector = exports2.NotebookCellTextDocumentFilter = exports2.NotebookDocumentFilter = exports2.TextDocumentFilter = undefined;
  exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.WillRenameFilesRequest = exports2.DidRenameFilesNotification = exports2.WillCreateFilesRequest = exports2.DidCreateFilesNotification = exports2.FileOperationPatternKind = exports2.LinkedEditingRangeRequest = exports2.ShowDocumentRequest = exports2.SemanticTokensRegistrationType = exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.TokenFormat = exports2.CallHierarchyPrepareRequest = exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = exports2.SelectionRangeRequest = exports2.DeclarationRequest = exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = exports2.ColorPresentationRequest = exports2.DocumentColorRequest = exports2.ConfigurationRequest = exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = exports2.TypeDefinitionRequest = exports2.ImplementationRequest = exports2.ApplyWorkspaceEditRequest = exports2.ExecuteCommandRequest = exports2.PrepareRenameRequest = exports2.RenameRequest = exports2.PrepareSupportDefaultBehavior = exports2.DocumentOnTypeFormattingRequest = exports2.DocumentRangesFormattingRequest = exports2.DocumentRangeFormattingRequest = exports2.DocumentFormattingRequest = exports2.DocumentLinkResolveRequest = exports2.DocumentLinkRequest = exports2.CodeLensRefreshRequest = exports2.CodeLensResolveRequest = exports2.CodeLensRequest = exports2.WorkspaceSymbolResolveRequest = undefined;
  exports2.InlineCompletionRequest = exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchyPrepareRequest = undefined;
  var messages_1 = require_messages2();
  var vscode_languageserver_types_1 = require_main2();
  var Is = require_is3();
  var protocol_implementation_1 = require_protocol_implementation();
  Object.defineProperty(exports2, "ImplementationRequest", { enumerable: true, get: function() {
    return protocol_implementation_1.ImplementationRequest;
  } });
  var protocol_typeDefinition_1 = require_protocol_typeDefinition();
  Object.defineProperty(exports2, "TypeDefinitionRequest", { enumerable: true, get: function() {
    return protocol_typeDefinition_1.TypeDefinitionRequest;
  } });
  var protocol_workspaceFolder_1 = require_protocol_workspaceFolder();
  Object.defineProperty(exports2, "WorkspaceFoldersRequest", { enumerable: true, get: function() {
    return protocol_workspaceFolder_1.WorkspaceFoldersRequest;
  } });
  Object.defineProperty(exports2, "DidChangeWorkspaceFoldersNotification", { enumerable: true, get: function() {
    return protocol_workspaceFolder_1.DidChangeWorkspaceFoldersNotification;
  } });
  var protocol_configuration_1 = require_protocol_configuration();
  Object.defineProperty(exports2, "ConfigurationRequest", { enumerable: true, get: function() {
    return protocol_configuration_1.ConfigurationRequest;
  } });
  var protocol_colorProvider_1 = require_protocol_colorProvider();
  Object.defineProperty(exports2, "DocumentColorRequest", { enumerable: true, get: function() {
    return protocol_colorProvider_1.DocumentColorRequest;
  } });
  Object.defineProperty(exports2, "ColorPresentationRequest", { enumerable: true, get: function() {
    return protocol_colorProvider_1.ColorPresentationRequest;
  } });
  var protocol_foldingRange_1 = require_protocol_foldingRange();
  Object.defineProperty(exports2, "FoldingRangeRequest", { enumerable: true, get: function() {
    return protocol_foldingRange_1.FoldingRangeRequest;
  } });
  Object.defineProperty(exports2, "FoldingRangeRefreshRequest", { enumerable: true, get: function() {
    return protocol_foldingRange_1.FoldingRangeRefreshRequest;
  } });
  var protocol_declaration_1 = require_protocol_declaration();
  Object.defineProperty(exports2, "DeclarationRequest", { enumerable: true, get: function() {
    return protocol_declaration_1.DeclarationRequest;
  } });
  var protocol_selectionRange_1 = require_protocol_selectionRange();
  Object.defineProperty(exports2, "SelectionRangeRequest", { enumerable: true, get: function() {
    return protocol_selectionRange_1.SelectionRangeRequest;
  } });
  var protocol_progress_1 = require_protocol_progress();
  Object.defineProperty(exports2, "WorkDoneProgress", { enumerable: true, get: function() {
    return protocol_progress_1.WorkDoneProgress;
  } });
  Object.defineProperty(exports2, "WorkDoneProgressCreateRequest", { enumerable: true, get: function() {
    return protocol_progress_1.WorkDoneProgressCreateRequest;
  } });
  Object.defineProperty(exports2, "WorkDoneProgressCancelNotification", { enumerable: true, get: function() {
    return protocol_progress_1.WorkDoneProgressCancelNotification;
  } });
  var protocol_callHierarchy_1 = require_protocol_callHierarchy();
  Object.defineProperty(exports2, "CallHierarchyIncomingCallsRequest", { enumerable: true, get: function() {
    return protocol_callHierarchy_1.CallHierarchyIncomingCallsRequest;
  } });
  Object.defineProperty(exports2, "CallHierarchyOutgoingCallsRequest", { enumerable: true, get: function() {
    return protocol_callHierarchy_1.CallHierarchyOutgoingCallsRequest;
  } });
  Object.defineProperty(exports2, "CallHierarchyPrepareRequest", { enumerable: true, get: function() {
    return protocol_callHierarchy_1.CallHierarchyPrepareRequest;
  } });
  var protocol_semanticTokens_1 = require_protocol_semanticTokens();
  Object.defineProperty(exports2, "TokenFormat", { enumerable: true, get: function() {
    return protocol_semanticTokens_1.TokenFormat;
  } });
  Object.defineProperty(exports2, "SemanticTokensRequest", { enumerable: true, get: function() {
    return protocol_semanticTokens_1.SemanticTokensRequest;
  } });
  Object.defineProperty(exports2, "SemanticTokensDeltaRequest", { enumerable: true, get: function() {
    return protocol_semanticTokens_1.SemanticTokensDeltaRequest;
  } });
  Object.defineProperty(exports2, "SemanticTokensRangeRequest", { enumerable: true, get: function() {
    return protocol_semanticTokens_1.SemanticTokensRangeRequest;
  } });
  Object.defineProperty(exports2, "SemanticTokensRefreshRequest", { enumerable: true, get: function() {
    return protocol_semanticTokens_1.SemanticTokensRefreshRequest;
  } });
  Object.defineProperty(exports2, "SemanticTokensRegistrationType", { enumerable: true, get: function() {
    return protocol_semanticTokens_1.SemanticTokensRegistrationType;
  } });
  var protocol_showDocument_1 = require_protocol_showDocument();
  Object.defineProperty(exports2, "ShowDocumentRequest", { enumerable: true, get: function() {
    return protocol_showDocument_1.ShowDocumentRequest;
  } });
  var protocol_linkedEditingRange_1 = require_protocol_linkedEditingRange();
  Object.defineProperty(exports2, "LinkedEditingRangeRequest", { enumerable: true, get: function() {
    return protocol_linkedEditingRange_1.LinkedEditingRangeRequest;
  } });
  var protocol_fileOperations_1 = require_protocol_fileOperations();
  Object.defineProperty(exports2, "FileOperationPatternKind", { enumerable: true, get: function() {
    return protocol_fileOperations_1.FileOperationPatternKind;
  } });
  Object.defineProperty(exports2, "DidCreateFilesNotification", { enumerable: true, get: function() {
    return protocol_fileOperations_1.DidCreateFilesNotification;
  } });
  Object.defineProperty(exports2, "WillCreateFilesRequest", { enumerable: true, get: function() {
    return protocol_fileOperations_1.WillCreateFilesRequest;
  } });
  Object.defineProperty(exports2, "DidRenameFilesNotification", { enumerable: true, get: function() {
    return protocol_fileOperations_1.DidRenameFilesNotification;
  } });
  Object.defineProperty(exports2, "WillRenameFilesRequest", { enumerable: true, get: function() {
    return protocol_fileOperations_1.WillRenameFilesRequest;
  } });
  Object.defineProperty(exports2, "DidDeleteFilesNotification", { enumerable: true, get: function() {
    return protocol_fileOperations_1.DidDeleteFilesNotification;
  } });
  Object.defineProperty(exports2, "WillDeleteFilesRequest", { enumerable: true, get: function() {
    return protocol_fileOperations_1.WillDeleteFilesRequest;
  } });
  var protocol_moniker_1 = require_protocol_moniker();
  Object.defineProperty(exports2, "UniquenessLevel", { enumerable: true, get: function() {
    return protocol_moniker_1.UniquenessLevel;
  } });
  Object.defineProperty(exports2, "MonikerKind", { enumerable: true, get: function() {
    return protocol_moniker_1.MonikerKind;
  } });
  Object.defineProperty(exports2, "MonikerRequest", { enumerable: true, get: function() {
    return protocol_moniker_1.MonikerRequest;
  } });
  var protocol_typeHierarchy_1 = require_protocol_typeHierarchy();
  Object.defineProperty(exports2, "TypeHierarchyPrepareRequest", { enumerable: true, get: function() {
    return protocol_typeHierarchy_1.TypeHierarchyPrepareRequest;
  } });
  Object.defineProperty(exports2, "TypeHierarchySubtypesRequest", { enumerable: true, get: function() {
    return protocol_typeHierarchy_1.TypeHierarchySubtypesRequest;
  } });
  Object.defineProperty(exports2, "TypeHierarchySupertypesRequest", { enumerable: true, get: function() {
    return protocol_typeHierarchy_1.TypeHierarchySupertypesRequest;
  } });
  var protocol_inlineValue_1 = require_protocol_inlineValue();
  Object.defineProperty(exports2, "InlineValueRequest", { enumerable: true, get: function() {
    return protocol_inlineValue_1.InlineValueRequest;
  } });
  Object.defineProperty(exports2, "InlineValueRefreshRequest", { enumerable: true, get: function() {
    return protocol_inlineValue_1.InlineValueRefreshRequest;
  } });
  var protocol_inlayHint_1 = require_protocol_inlayHint();
  Object.defineProperty(exports2, "InlayHintRequest", { enumerable: true, get: function() {
    return protocol_inlayHint_1.InlayHintRequest;
  } });
  Object.defineProperty(exports2, "InlayHintResolveRequest", { enumerable: true, get: function() {
    return protocol_inlayHint_1.InlayHintResolveRequest;
  } });
  Object.defineProperty(exports2, "InlayHintRefreshRequest", { enumerable: true, get: function() {
    return protocol_inlayHint_1.InlayHintRefreshRequest;
  } });
  var protocol_diagnostic_1 = require_protocol_diagnostic();
  Object.defineProperty(exports2, "DiagnosticServerCancellationData", { enumerable: true, get: function() {
    return protocol_diagnostic_1.DiagnosticServerCancellationData;
  } });
  Object.defineProperty(exports2, "DocumentDiagnosticReportKind", { enumerable: true, get: function() {
    return protocol_diagnostic_1.DocumentDiagnosticReportKind;
  } });
  Object.defineProperty(exports2, "DocumentDiagnosticRequest", { enumerable: true, get: function() {
    return protocol_diagnostic_1.DocumentDiagnosticRequest;
  } });
  Object.defineProperty(exports2, "WorkspaceDiagnosticRequest", { enumerable: true, get: function() {
    return protocol_diagnostic_1.WorkspaceDiagnosticRequest;
  } });
  Object.defineProperty(exports2, "DiagnosticRefreshRequest", { enumerable: true, get: function() {
    return protocol_diagnostic_1.DiagnosticRefreshRequest;
  } });
  var protocol_notebook_1 = require_protocol_notebook();
  Object.defineProperty(exports2, "NotebookCellKind", { enumerable: true, get: function() {
    return protocol_notebook_1.NotebookCellKind;
  } });
  Object.defineProperty(exports2, "ExecutionSummary", { enumerable: true, get: function() {
    return protocol_notebook_1.ExecutionSummary;
  } });
  Object.defineProperty(exports2, "NotebookCell", { enumerable: true, get: function() {
    return protocol_notebook_1.NotebookCell;
  } });
  Object.defineProperty(exports2, "NotebookDocument", { enumerable: true, get: function() {
    return protocol_notebook_1.NotebookDocument;
  } });
  Object.defineProperty(exports2, "NotebookDocumentSyncRegistrationType", { enumerable: true, get: function() {
    return protocol_notebook_1.NotebookDocumentSyncRegistrationType;
  } });
  Object.defineProperty(exports2, "DidOpenNotebookDocumentNotification", { enumerable: true, get: function() {
    return protocol_notebook_1.DidOpenNotebookDocumentNotification;
  } });
  Object.defineProperty(exports2, "NotebookCellArrayChange", { enumerable: true, get: function() {
    return protocol_notebook_1.NotebookCellArrayChange;
  } });
  Object.defineProperty(exports2, "DidChangeNotebookDocumentNotification", { enumerable: true, get: function() {
    return protocol_notebook_1.DidChangeNotebookDocumentNotification;
  } });
  Object.defineProperty(exports2, "DidSaveNotebookDocumentNotification", { enumerable: true, get: function() {
    return protocol_notebook_1.DidSaveNotebookDocumentNotification;
  } });
  Object.defineProperty(exports2, "DidCloseNotebookDocumentNotification", { enumerable: true, get: function() {
    return protocol_notebook_1.DidCloseNotebookDocumentNotification;
  } });
  var protocol_inlineCompletion_1 = require_protocol_inlineCompletion();
  Object.defineProperty(exports2, "InlineCompletionRequest", { enumerable: true, get: function() {
    return protocol_inlineCompletion_1.InlineCompletionRequest;
  } });
  var TextDocumentFilter;
  (function(TextDocumentFilter2) {
    function is(value) {
      const candidate = value;
      return Is.string(candidate) || (Is.string(candidate.language) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
    }
    TextDocumentFilter2.is = is;
  })(TextDocumentFilter || (exports2.TextDocumentFilter = TextDocumentFilter = {}));
  var NotebookDocumentFilter;
  (function(NotebookDocumentFilter2) {
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && (Is.string(candidate.notebookType) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
    }
    NotebookDocumentFilter2.is = is;
  })(NotebookDocumentFilter || (exports2.NotebookDocumentFilter = NotebookDocumentFilter = {}));
  var NotebookCellTextDocumentFilter;
  (function(NotebookCellTextDocumentFilter2) {
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && (Is.string(candidate.notebook) || NotebookDocumentFilter.is(candidate.notebook)) && (candidate.language === undefined || Is.string(candidate.language));
    }
    NotebookCellTextDocumentFilter2.is = is;
  })(NotebookCellTextDocumentFilter || (exports2.NotebookCellTextDocumentFilter = NotebookCellTextDocumentFilter = {}));
  var DocumentSelector;
  (function(DocumentSelector2) {
    function is(value) {
      if (!Array.isArray(value)) {
        return false;
      }
      for (let elem of value) {
        if (!Is.string(elem) && !TextDocumentFilter.is(elem) && !NotebookCellTextDocumentFilter.is(elem)) {
          return false;
        }
      }
      return true;
    }
    DocumentSelector2.is = is;
  })(DocumentSelector || (exports2.DocumentSelector = DocumentSelector = {}));
  var RegistrationRequest;
  (function(RegistrationRequest2) {
    RegistrationRequest2.method = "client/registerCapability";
    RegistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    RegistrationRequest2.type = new messages_1.ProtocolRequestType(RegistrationRequest2.method);
  })(RegistrationRequest || (exports2.RegistrationRequest = RegistrationRequest = {}));
  var UnregistrationRequest;
  (function(UnregistrationRequest2) {
    UnregistrationRequest2.method = "client/unregisterCapability";
    UnregistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    UnregistrationRequest2.type = new messages_1.ProtocolRequestType(UnregistrationRequest2.method);
  })(UnregistrationRequest || (exports2.UnregistrationRequest = UnregistrationRequest = {}));
  var ResourceOperationKind;
  (function(ResourceOperationKind2) {
    ResourceOperationKind2.Create = "create";
    ResourceOperationKind2.Rename = "rename";
    ResourceOperationKind2.Delete = "delete";
  })(ResourceOperationKind || (exports2.ResourceOperationKind = ResourceOperationKind = {}));
  var FailureHandlingKind;
  (function(FailureHandlingKind2) {
    FailureHandlingKind2.Abort = "abort";
    FailureHandlingKind2.Transactional = "transactional";
    FailureHandlingKind2.TextOnlyTransactional = "textOnlyTransactional";
    FailureHandlingKind2.Undo = "undo";
  })(FailureHandlingKind || (exports2.FailureHandlingKind = FailureHandlingKind = {}));
  var PositionEncodingKind;
  (function(PositionEncodingKind2) {
    PositionEncodingKind2.UTF8 = "utf-8";
    PositionEncodingKind2.UTF16 = "utf-16";
    PositionEncodingKind2.UTF32 = "utf-32";
  })(PositionEncodingKind || (exports2.PositionEncodingKind = PositionEncodingKind = {}));
  var StaticRegistrationOptions;
  (function(StaticRegistrationOptions2) {
    function hasId(value) {
      const candidate = value;
      return candidate && Is.string(candidate.id) && candidate.id.length > 0;
    }
    StaticRegistrationOptions2.hasId = hasId;
  })(StaticRegistrationOptions || (exports2.StaticRegistrationOptions = StaticRegistrationOptions = {}));
  var TextDocumentRegistrationOptions;
  (function(TextDocumentRegistrationOptions2) {
    function is(value) {
      const candidate = value;
      return candidate && (candidate.documentSelector === null || DocumentSelector.is(candidate.documentSelector));
    }
    TextDocumentRegistrationOptions2.is = is;
  })(TextDocumentRegistrationOptions || (exports2.TextDocumentRegistrationOptions = TextDocumentRegistrationOptions = {}));
  var WorkDoneProgressOptions;
  (function(WorkDoneProgressOptions2) {
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && (candidate.workDoneProgress === undefined || Is.boolean(candidate.workDoneProgress));
    }
    WorkDoneProgressOptions2.is = is;
    function hasWorkDoneProgress(value) {
      const candidate = value;
      return candidate && Is.boolean(candidate.workDoneProgress);
    }
    WorkDoneProgressOptions2.hasWorkDoneProgress = hasWorkDoneProgress;
  })(WorkDoneProgressOptions || (exports2.WorkDoneProgressOptions = WorkDoneProgressOptions = {}));
  var InitializeRequest;
  (function(InitializeRequest2) {
    InitializeRequest2.method = "initialize";
    InitializeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    InitializeRequest2.type = new messages_1.ProtocolRequestType(InitializeRequest2.method);
  })(InitializeRequest || (exports2.InitializeRequest = InitializeRequest = {}));
  var InitializeErrorCodes;
  (function(InitializeErrorCodes2) {
    InitializeErrorCodes2.unknownProtocolVersion = 1;
  })(InitializeErrorCodes || (exports2.InitializeErrorCodes = InitializeErrorCodes = {}));
  var InitializedNotification;
  (function(InitializedNotification2) {
    InitializedNotification2.method = "initialized";
    InitializedNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    InitializedNotification2.type = new messages_1.ProtocolNotificationType(InitializedNotification2.method);
  })(InitializedNotification || (exports2.InitializedNotification = InitializedNotification = {}));
  var ShutdownRequest;
  (function(ShutdownRequest2) {
    ShutdownRequest2.method = "shutdown";
    ShutdownRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    ShutdownRequest2.type = new messages_1.ProtocolRequestType0(ShutdownRequest2.method);
  })(ShutdownRequest || (exports2.ShutdownRequest = ShutdownRequest = {}));
  var ExitNotification;
  (function(ExitNotification2) {
    ExitNotification2.method = "exit";
    ExitNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    ExitNotification2.type = new messages_1.ProtocolNotificationType0(ExitNotification2.method);
  })(ExitNotification || (exports2.ExitNotification = ExitNotification = {}));
  var DidChangeConfigurationNotification;
  (function(DidChangeConfigurationNotification2) {
    DidChangeConfigurationNotification2.method = "workspace/didChangeConfiguration";
    DidChangeConfigurationNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeConfigurationNotification2.type = new messages_1.ProtocolNotificationType(DidChangeConfigurationNotification2.method);
  })(DidChangeConfigurationNotification || (exports2.DidChangeConfigurationNotification = DidChangeConfigurationNotification = {}));
  var MessageType;
  (function(MessageType2) {
    MessageType2.Error = 1;
    MessageType2.Warning = 2;
    MessageType2.Info = 3;
    MessageType2.Log = 4;
    MessageType2.Debug = 5;
  })(MessageType || (exports2.MessageType = MessageType = {}));
  var ShowMessageNotification;
  (function(ShowMessageNotification2) {
    ShowMessageNotification2.method = "window/showMessage";
    ShowMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
    ShowMessageNotification2.type = new messages_1.ProtocolNotificationType(ShowMessageNotification2.method);
  })(ShowMessageNotification || (exports2.ShowMessageNotification = ShowMessageNotification = {}));
  var ShowMessageRequest;
  (function(ShowMessageRequest2) {
    ShowMessageRequest2.method = "window/showMessageRequest";
    ShowMessageRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    ShowMessageRequest2.type = new messages_1.ProtocolRequestType(ShowMessageRequest2.method);
  })(ShowMessageRequest || (exports2.ShowMessageRequest = ShowMessageRequest = {}));
  var LogMessageNotification;
  (function(LogMessageNotification2) {
    LogMessageNotification2.method = "window/logMessage";
    LogMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
    LogMessageNotification2.type = new messages_1.ProtocolNotificationType(LogMessageNotification2.method);
  })(LogMessageNotification || (exports2.LogMessageNotification = LogMessageNotification = {}));
  var TelemetryEventNotification;
  (function(TelemetryEventNotification2) {
    TelemetryEventNotification2.method = "telemetry/event";
    TelemetryEventNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
    TelemetryEventNotification2.type = new messages_1.ProtocolNotificationType(TelemetryEventNotification2.method);
  })(TelemetryEventNotification || (exports2.TelemetryEventNotification = TelemetryEventNotification = {}));
  var TextDocumentSyncKind;
  (function(TextDocumentSyncKind2) {
    TextDocumentSyncKind2.None = 0;
    TextDocumentSyncKind2.Full = 1;
    TextDocumentSyncKind2.Incremental = 2;
  })(TextDocumentSyncKind || (exports2.TextDocumentSyncKind = TextDocumentSyncKind = {}));
  var DidOpenTextDocumentNotification;
  (function(DidOpenTextDocumentNotification2) {
    DidOpenTextDocumentNotification2.method = "textDocument/didOpen";
    DidOpenTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidOpenTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenTextDocumentNotification2.method);
  })(DidOpenTextDocumentNotification || (exports2.DidOpenTextDocumentNotification = DidOpenTextDocumentNotification = {}));
  var TextDocumentContentChangeEvent;
  (function(TextDocumentContentChangeEvent2) {
    function isIncremental(event) {
      let candidate = event;
      return candidate !== undefined && candidate !== null && typeof candidate.text === "string" && candidate.range !== undefined && (candidate.rangeLength === undefined || typeof candidate.rangeLength === "number");
    }
    TextDocumentContentChangeEvent2.isIncremental = isIncremental;
    function isFull(event) {
      let candidate = event;
      return candidate !== undefined && candidate !== null && typeof candidate.text === "string" && candidate.range === undefined && candidate.rangeLength === undefined;
    }
    TextDocumentContentChangeEvent2.isFull = isFull;
  })(TextDocumentContentChangeEvent || (exports2.TextDocumentContentChangeEvent = TextDocumentContentChangeEvent = {}));
  var DidChangeTextDocumentNotification;
  (function(DidChangeTextDocumentNotification2) {
    DidChangeTextDocumentNotification2.method = "textDocument/didChange";
    DidChangeTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeTextDocumentNotification2.method);
  })(DidChangeTextDocumentNotification || (exports2.DidChangeTextDocumentNotification = DidChangeTextDocumentNotification = {}));
  var DidCloseTextDocumentNotification;
  (function(DidCloseTextDocumentNotification2) {
    DidCloseTextDocumentNotification2.method = "textDocument/didClose";
    DidCloseTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidCloseTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseTextDocumentNotification2.method);
  })(DidCloseTextDocumentNotification || (exports2.DidCloseTextDocumentNotification = DidCloseTextDocumentNotification = {}));
  var DidSaveTextDocumentNotification;
  (function(DidSaveTextDocumentNotification2) {
    DidSaveTextDocumentNotification2.method = "textDocument/didSave";
    DidSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveTextDocumentNotification2.method);
  })(DidSaveTextDocumentNotification || (exports2.DidSaveTextDocumentNotification = DidSaveTextDocumentNotification = {}));
  var TextDocumentSaveReason;
  (function(TextDocumentSaveReason2) {
    TextDocumentSaveReason2.Manual = 1;
    TextDocumentSaveReason2.AfterDelay = 2;
    TextDocumentSaveReason2.FocusOut = 3;
  })(TextDocumentSaveReason || (exports2.TextDocumentSaveReason = TextDocumentSaveReason = {}));
  var WillSaveTextDocumentNotification;
  (function(WillSaveTextDocumentNotification2) {
    WillSaveTextDocumentNotification2.method = "textDocument/willSave";
    WillSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    WillSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(WillSaveTextDocumentNotification2.method);
  })(WillSaveTextDocumentNotification || (exports2.WillSaveTextDocumentNotification = WillSaveTextDocumentNotification = {}));
  var WillSaveTextDocumentWaitUntilRequest;
  (function(WillSaveTextDocumentWaitUntilRequest2) {
    WillSaveTextDocumentWaitUntilRequest2.method = "textDocument/willSaveWaitUntil";
    WillSaveTextDocumentWaitUntilRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WillSaveTextDocumentWaitUntilRequest2.type = new messages_1.ProtocolRequestType(WillSaveTextDocumentWaitUntilRequest2.method);
  })(WillSaveTextDocumentWaitUntilRequest || (exports2.WillSaveTextDocumentWaitUntilRequest = WillSaveTextDocumentWaitUntilRequest = {}));
  var DidChangeWatchedFilesNotification;
  (function(DidChangeWatchedFilesNotification2) {
    DidChangeWatchedFilesNotification2.method = "workspace/didChangeWatchedFiles";
    DidChangeWatchedFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeWatchedFilesNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWatchedFilesNotification2.method);
  })(DidChangeWatchedFilesNotification || (exports2.DidChangeWatchedFilesNotification = DidChangeWatchedFilesNotification = {}));
  var FileChangeType;
  (function(FileChangeType2) {
    FileChangeType2.Created = 1;
    FileChangeType2.Changed = 2;
    FileChangeType2.Deleted = 3;
  })(FileChangeType || (exports2.FileChangeType = FileChangeType = {}));
  var RelativePattern;
  (function(RelativePattern2) {
    function is(value) {
      const candidate = value;
      return Is.objectLiteral(candidate) && (vscode_languageserver_types_1.URI.is(candidate.baseUri) || vscode_languageserver_types_1.WorkspaceFolder.is(candidate.baseUri)) && Is.string(candidate.pattern);
    }
    RelativePattern2.is = is;
  })(RelativePattern || (exports2.RelativePattern = RelativePattern = {}));
  var WatchKind;
  (function(WatchKind2) {
    WatchKind2.Create = 1;
    WatchKind2.Change = 2;
    WatchKind2.Delete = 4;
  })(WatchKind || (exports2.WatchKind = WatchKind = {}));
  var PublishDiagnosticsNotification;
  (function(PublishDiagnosticsNotification2) {
    PublishDiagnosticsNotification2.method = "textDocument/publishDiagnostics";
    PublishDiagnosticsNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
    PublishDiagnosticsNotification2.type = new messages_1.ProtocolNotificationType(PublishDiagnosticsNotification2.method);
  })(PublishDiagnosticsNotification || (exports2.PublishDiagnosticsNotification = PublishDiagnosticsNotification = {}));
  var CompletionTriggerKind;
  (function(CompletionTriggerKind2) {
    CompletionTriggerKind2.Invoked = 1;
    CompletionTriggerKind2.TriggerCharacter = 2;
    CompletionTriggerKind2.TriggerForIncompleteCompletions = 3;
  })(CompletionTriggerKind || (exports2.CompletionTriggerKind = CompletionTriggerKind = {}));
  var CompletionRequest;
  (function(CompletionRequest2) {
    CompletionRequest2.method = "textDocument/completion";
    CompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CompletionRequest2.type = new messages_1.ProtocolRequestType(CompletionRequest2.method);
  })(CompletionRequest || (exports2.CompletionRequest = CompletionRequest = {}));
  var CompletionResolveRequest;
  (function(CompletionResolveRequest2) {
    CompletionResolveRequest2.method = "completionItem/resolve";
    CompletionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CompletionResolveRequest2.type = new messages_1.ProtocolRequestType(CompletionResolveRequest2.method);
  })(CompletionResolveRequest || (exports2.CompletionResolveRequest = CompletionResolveRequest = {}));
  var HoverRequest;
  (function(HoverRequest2) {
    HoverRequest2.method = "textDocument/hover";
    HoverRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    HoverRequest2.type = new messages_1.ProtocolRequestType(HoverRequest2.method);
  })(HoverRequest || (exports2.HoverRequest = HoverRequest = {}));
  var SignatureHelpTriggerKind;
  (function(SignatureHelpTriggerKind2) {
    SignatureHelpTriggerKind2.Invoked = 1;
    SignatureHelpTriggerKind2.TriggerCharacter = 2;
    SignatureHelpTriggerKind2.ContentChange = 3;
  })(SignatureHelpTriggerKind || (exports2.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
  var SignatureHelpRequest;
  (function(SignatureHelpRequest2) {
    SignatureHelpRequest2.method = "textDocument/signatureHelp";
    SignatureHelpRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    SignatureHelpRequest2.type = new messages_1.ProtocolRequestType(SignatureHelpRequest2.method);
  })(SignatureHelpRequest || (exports2.SignatureHelpRequest = SignatureHelpRequest = {}));
  var DefinitionRequest;
  (function(DefinitionRequest2) {
    DefinitionRequest2.method = "textDocument/definition";
    DefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DefinitionRequest2.type = new messages_1.ProtocolRequestType(DefinitionRequest2.method);
  })(DefinitionRequest || (exports2.DefinitionRequest = DefinitionRequest = {}));
  var ReferencesRequest;
  (function(ReferencesRequest2) {
    ReferencesRequest2.method = "textDocument/references";
    ReferencesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    ReferencesRequest2.type = new messages_1.ProtocolRequestType(ReferencesRequest2.method);
  })(ReferencesRequest || (exports2.ReferencesRequest = ReferencesRequest = {}));
  var DocumentHighlightRequest;
  (function(DocumentHighlightRequest2) {
    DocumentHighlightRequest2.method = "textDocument/documentHighlight";
    DocumentHighlightRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentHighlightRequest2.type = new messages_1.ProtocolRequestType(DocumentHighlightRequest2.method);
  })(DocumentHighlightRequest || (exports2.DocumentHighlightRequest = DocumentHighlightRequest = {}));
  var DocumentSymbolRequest;
  (function(DocumentSymbolRequest2) {
    DocumentSymbolRequest2.method = "textDocument/documentSymbol";
    DocumentSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentSymbolRequest2.type = new messages_1.ProtocolRequestType(DocumentSymbolRequest2.method);
  })(DocumentSymbolRequest || (exports2.DocumentSymbolRequest = DocumentSymbolRequest = {}));
  var CodeActionRequest;
  (function(CodeActionRequest2) {
    CodeActionRequest2.method = "textDocument/codeAction";
    CodeActionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeActionRequest2.type = new messages_1.ProtocolRequestType(CodeActionRequest2.method);
  })(CodeActionRequest || (exports2.CodeActionRequest = CodeActionRequest = {}));
  var CodeActionResolveRequest;
  (function(CodeActionResolveRequest2) {
    CodeActionResolveRequest2.method = "codeAction/resolve";
    CodeActionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeActionResolveRequest2.type = new messages_1.ProtocolRequestType(CodeActionResolveRequest2.method);
  })(CodeActionResolveRequest || (exports2.CodeActionResolveRequest = CodeActionResolveRequest = {}));
  var WorkspaceSymbolRequest;
  (function(WorkspaceSymbolRequest2) {
    WorkspaceSymbolRequest2.method = "workspace/symbol";
    WorkspaceSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkspaceSymbolRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolRequest2.method);
  })(WorkspaceSymbolRequest || (exports2.WorkspaceSymbolRequest = WorkspaceSymbolRequest = {}));
  var WorkspaceSymbolResolveRequest;
  (function(WorkspaceSymbolResolveRequest2) {
    WorkspaceSymbolResolveRequest2.method = "workspaceSymbol/resolve";
    WorkspaceSymbolResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkspaceSymbolResolveRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolResolveRequest2.method);
  })(WorkspaceSymbolResolveRequest || (exports2.WorkspaceSymbolResolveRequest = WorkspaceSymbolResolveRequest = {}));
  var CodeLensRequest;
  (function(CodeLensRequest2) {
    CodeLensRequest2.method = "textDocument/codeLens";
    CodeLensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeLensRequest2.type = new messages_1.ProtocolRequestType(CodeLensRequest2.method);
  })(CodeLensRequest || (exports2.CodeLensRequest = CodeLensRequest = {}));
  var CodeLensResolveRequest;
  (function(CodeLensResolveRequest2) {
    CodeLensResolveRequest2.method = "codeLens/resolve";
    CodeLensResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeLensResolveRequest2.type = new messages_1.ProtocolRequestType(CodeLensResolveRequest2.method);
  })(CodeLensResolveRequest || (exports2.CodeLensResolveRequest = CodeLensResolveRequest = {}));
  var CodeLensRefreshRequest;
  (function(CodeLensRefreshRequest2) {
    CodeLensRefreshRequest2.method = `workspace/codeLens/refresh`;
    CodeLensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    CodeLensRefreshRequest2.type = new messages_1.ProtocolRequestType0(CodeLensRefreshRequest2.method);
  })(CodeLensRefreshRequest || (exports2.CodeLensRefreshRequest = CodeLensRefreshRequest = {}));
  var DocumentLinkRequest;
  (function(DocumentLinkRequest2) {
    DocumentLinkRequest2.method = "textDocument/documentLink";
    DocumentLinkRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentLinkRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkRequest2.method);
  })(DocumentLinkRequest || (exports2.DocumentLinkRequest = DocumentLinkRequest = {}));
  var DocumentLinkResolveRequest;
  (function(DocumentLinkResolveRequest2) {
    DocumentLinkResolveRequest2.method = "documentLink/resolve";
    DocumentLinkResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentLinkResolveRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkResolveRequest2.method);
  })(DocumentLinkResolveRequest || (exports2.DocumentLinkResolveRequest = DocumentLinkResolveRequest = {}));
  var DocumentFormattingRequest;
  (function(DocumentFormattingRequest2) {
    DocumentFormattingRequest2.method = "textDocument/formatting";
    DocumentFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentFormattingRequest2.method);
  })(DocumentFormattingRequest || (exports2.DocumentFormattingRequest = DocumentFormattingRequest = {}));
  var DocumentRangeFormattingRequest;
  (function(DocumentRangeFormattingRequest2) {
    DocumentRangeFormattingRequest2.method = "textDocument/rangeFormatting";
    DocumentRangeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentRangeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangeFormattingRequest2.method);
  })(DocumentRangeFormattingRequest || (exports2.DocumentRangeFormattingRequest = DocumentRangeFormattingRequest = {}));
  var DocumentRangesFormattingRequest;
  (function(DocumentRangesFormattingRequest2) {
    DocumentRangesFormattingRequest2.method = "textDocument/rangesFormatting";
    DocumentRangesFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentRangesFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangesFormattingRequest2.method);
  })(DocumentRangesFormattingRequest || (exports2.DocumentRangesFormattingRequest = DocumentRangesFormattingRequest = {}));
  var DocumentOnTypeFormattingRequest;
  (function(DocumentOnTypeFormattingRequest2) {
    DocumentOnTypeFormattingRequest2.method = "textDocument/onTypeFormatting";
    DocumentOnTypeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentOnTypeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentOnTypeFormattingRequest2.method);
  })(DocumentOnTypeFormattingRequest || (exports2.DocumentOnTypeFormattingRequest = DocumentOnTypeFormattingRequest = {}));
  var PrepareSupportDefaultBehavior;
  (function(PrepareSupportDefaultBehavior2) {
    PrepareSupportDefaultBehavior2.Identifier = 1;
  })(PrepareSupportDefaultBehavior || (exports2.PrepareSupportDefaultBehavior = PrepareSupportDefaultBehavior = {}));
  var RenameRequest;
  (function(RenameRequest2) {
    RenameRequest2.method = "textDocument/rename";
    RenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    RenameRequest2.type = new messages_1.ProtocolRequestType(RenameRequest2.method);
  })(RenameRequest || (exports2.RenameRequest = RenameRequest = {}));
  var PrepareRenameRequest;
  (function(PrepareRenameRequest2) {
    PrepareRenameRequest2.method = "textDocument/prepareRename";
    PrepareRenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    PrepareRenameRequest2.type = new messages_1.ProtocolRequestType(PrepareRenameRequest2.method);
  })(PrepareRenameRequest || (exports2.PrepareRenameRequest = PrepareRenameRequest = {}));
  var ExecuteCommandRequest;
  (function(ExecuteCommandRequest2) {
    ExecuteCommandRequest2.method = "workspace/executeCommand";
    ExecuteCommandRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
    ExecuteCommandRequest2.type = new messages_1.ProtocolRequestType(ExecuteCommandRequest2.method);
  })(ExecuteCommandRequest || (exports2.ExecuteCommandRequest = ExecuteCommandRequest = {}));
  var ApplyWorkspaceEditRequest;
  (function(ApplyWorkspaceEditRequest2) {
    ApplyWorkspaceEditRequest2.method = "workspace/applyEdit";
    ApplyWorkspaceEditRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
    ApplyWorkspaceEditRequest2.type = new messages_1.ProtocolRequestType("workspace/applyEdit");
  })(ApplyWorkspaceEditRequest || (exports2.ApplyWorkspaceEditRequest = ApplyWorkspaceEditRequest = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/connection.js
var require_connection2 = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.createProtocolConnection = undefined;
  var vscode_jsonrpc_1 = require_main();
  function createProtocolConnection(input, output, logger, options) {
    if (vscode_jsonrpc_1.ConnectionStrategy.is(options)) {
      options = { connectionStrategy: options };
    }
    return (0, vscode_jsonrpc_1.createMessageConnection)(input, output, logger, options);
  }
  exports2.createProtocolConnection = createProtocolConnection;
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/common/api.js
var require_api2 = __commonJS((exports2) => {
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.LSPErrorCodes = exports2.createProtocolConnection = undefined;
  __exportStar(require_main(), exports2);
  __exportStar(require_main2(), exports2);
  __exportStar(require_messages2(), exports2);
  __exportStar(require_protocol(), exports2);
  var connection_1 = require_connection2();
  Object.defineProperty(exports2, "createProtocolConnection", { enumerable: true, get: function() {
    return connection_1.createProtocolConnection;
  } });
  var LSPErrorCodes;
  (function(LSPErrorCodes2) {
    LSPErrorCodes2.lspReservedErrorRangeStart = -32899;
    LSPErrorCodes2.RequestFailed = -32803;
    LSPErrorCodes2.ServerCancelled = -32802;
    LSPErrorCodes2.ContentModified = -32801;
    LSPErrorCodes2.RequestCancelled = -32800;
    LSPErrorCodes2.lspReservedErrorRangeEnd = -32800;
  })(LSPErrorCodes || (exports2.LSPErrorCodes = LSPErrorCodes = {}));
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/lib/node/main.js
var require_main3 = __commonJS((exports2) => {
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.createProtocolConnection = undefined;
  var node_1 = require_node();
  __exportStar(require_node(), exports2);
  __exportStar(require_api2(), exports2);
  function createProtocolConnection(input, output, logger, options) {
    return (0, node_1.createMessageConnection)(input, output, logger, options);
  }
  exports2.createProtocolConnection = createProtocolConnection;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/utils/uuid.js
var require_uuid = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.generateUuid = exports2.parse = exports2.isUUID = exports2.v4 = exports2.empty = undefined;

  class ValueUUID {
    constructor(_value) {
      this._value = _value;
    }
    asHex() {
      return this._value;
    }
    equals(other) {
      return this.asHex() === other.asHex();
    }
  }

  class V4UUID extends ValueUUID {
    static _oneOf(array) {
      return array[Math.floor(array.length * Math.random())];
    }
    static _randomHex() {
      return V4UUID._oneOf(V4UUID._chars);
    }
    constructor() {
      super([
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        "-",
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        "-",
        "4",
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        "-",
        V4UUID._oneOf(V4UUID._timeHighBits),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        "-",
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex(),
        V4UUID._randomHex()
      ].join(""));
    }
  }
  V4UUID._chars = ["0", "1", "2", "3", "4", "5", "6", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  V4UUID._timeHighBits = ["8", "9", "a", "b"];
  exports2.empty = new ValueUUID("00000000-0000-0000-0000-000000000000");
  function v4() {
    return new V4UUID;
  }
  exports2.v4 = v4;
  var _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  function isUUID(value) {
    return _UUIDPattern.test(value);
  }
  exports2.isUUID = isUUID;
  function parse(value) {
    if (!isUUID(value)) {
      throw new Error("invalid uuid");
    }
    return new ValueUUID(value);
  }
  exports2.parse = parse;
  function generateUuid() {
    return v4().asHex();
  }
  exports2.generateUuid = generateUuid;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/progress.js
var require_progress = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.attachPartialResult = exports2.ProgressFeature = exports2.attachWorkDone = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var uuid_1 = require_uuid();

  class WorkDoneProgressReporterImpl {
    constructor(_connection, _token) {
      this._connection = _connection;
      this._token = _token;
      WorkDoneProgressReporterImpl.Instances.set(this._token, this);
    }
    begin(title, percentage, message, cancellable) {
      let param = {
        kind: "begin",
        title,
        percentage,
        message,
        cancellable
      };
      this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
    }
    report(arg0, arg1) {
      let param = {
        kind: "report"
      };
      if (typeof arg0 === "number") {
        param.percentage = arg0;
        if (arg1 !== undefined) {
          param.message = arg1;
        }
      } else {
        param.message = arg0;
      }
      this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
    }
    done() {
      WorkDoneProgressReporterImpl.Instances.delete(this._token);
      this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, { kind: "end" });
    }
  }
  WorkDoneProgressReporterImpl.Instances = new Map;

  class WorkDoneProgressServerReporterImpl extends WorkDoneProgressReporterImpl {
    constructor(connection, token) {
      super(connection, token);
      this._source = new vscode_languageserver_protocol_1.CancellationTokenSource;
    }
    get token() {
      return this._source.token;
    }
    done() {
      this._source.dispose();
      super.done();
    }
    cancel() {
      this._source.cancel();
    }
  }

  class NullProgressReporter {
    constructor() {}
    begin() {}
    report() {}
    done() {}
  }

  class NullProgressServerReporter extends NullProgressReporter {
    constructor() {
      super();
      this._source = new vscode_languageserver_protocol_1.CancellationTokenSource;
    }
    get token() {
      return this._source.token;
    }
    done() {
      this._source.dispose();
    }
    cancel() {
      this._source.cancel();
    }
  }
  function attachWorkDone(connection, params) {
    if (params === undefined || params.workDoneToken === undefined) {
      return new NullProgressReporter;
    }
    const token = params.workDoneToken;
    delete params.workDoneToken;
    return new WorkDoneProgressReporterImpl(connection, token);
  }
  exports2.attachWorkDone = attachWorkDone;
  var ProgressFeature = (Base) => {
    return class extends Base {
      constructor() {
        super();
        this._progressSupported = false;
      }
      initialize(capabilities) {
        super.initialize(capabilities);
        if (capabilities?.window?.workDoneProgress === true) {
          this._progressSupported = true;
          this.connection.onNotification(vscode_languageserver_protocol_1.WorkDoneProgressCancelNotification.type, (params) => {
            let progress = WorkDoneProgressReporterImpl.Instances.get(params.token);
            if (progress instanceof WorkDoneProgressServerReporterImpl || progress instanceof NullProgressServerReporter) {
              progress.cancel();
            }
          });
        }
      }
      attachWorkDoneProgress(token) {
        if (token === undefined) {
          return new NullProgressReporter;
        } else {
          return new WorkDoneProgressReporterImpl(this.connection, token);
        }
      }
      createWorkDoneProgress() {
        if (this._progressSupported) {
          const token = (0, uuid_1.generateUuid)();
          return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.type, { token }).then(() => {
            const result = new WorkDoneProgressServerReporterImpl(this.connection, token);
            return result;
          });
        } else {
          return Promise.resolve(new NullProgressServerReporter);
        }
      }
    };
  };
  exports2.ProgressFeature = ProgressFeature;
  var ResultProgress;
  (function(ResultProgress2) {
    ResultProgress2.type = new vscode_languageserver_protocol_1.ProgressType;
  })(ResultProgress || (ResultProgress = {}));

  class ResultProgressReporterImpl {
    constructor(_connection, _token) {
      this._connection = _connection;
      this._token = _token;
    }
    report(data) {
      this._connection.sendProgress(ResultProgress.type, this._token, data);
    }
  }
  function attachPartialResult(connection, params) {
    if (params === undefined || params.partialResultToken === undefined) {
      return;
    }
    const token = params.partialResultToken;
    delete params.partialResultToken;
    return new ResultProgressReporterImpl(connection, token);
  }
  exports2.attachPartialResult = attachPartialResult;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/configuration.js
var require_configuration = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ConfigurationFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var Is = require_is();
  var ConfigurationFeature = (Base) => {
    return class extends Base {
      getConfiguration(arg) {
        if (!arg) {
          return this._getConfiguration({});
        } else if (Is.string(arg)) {
          return this._getConfiguration({ section: arg });
        } else {
          return this._getConfiguration(arg);
        }
      }
      _getConfiguration(arg) {
        let params = {
          items: Array.isArray(arg) ? arg : [arg]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ConfigurationRequest.type, params).then((result) => {
          if (Array.isArray(result)) {
            return Array.isArray(arg) ? result : result[0];
          } else {
            return Array.isArray(arg) ? [] : null;
          }
        });
      }
    };
  };
  exports2.ConfigurationFeature = ConfigurationFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/workspaceFolder.js
var require_workspaceFolder = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.WorkspaceFoldersFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var WorkspaceFoldersFeature = (Base) => {
    return class extends Base {
      constructor() {
        super();
        this._notificationIsAutoRegistered = false;
      }
      initialize(capabilities) {
        super.initialize(capabilities);
        let workspaceCapabilities = capabilities.workspace;
        if (workspaceCapabilities && workspaceCapabilities.workspaceFolders) {
          this._onDidChangeWorkspaceFolders = new vscode_languageserver_protocol_1.Emitter;
          this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type, (params) => {
            this._onDidChangeWorkspaceFolders.fire(params.event);
          });
        }
      }
      fillServerCapabilities(capabilities) {
        super.fillServerCapabilities(capabilities);
        const changeNotifications = capabilities.workspace?.workspaceFolders?.changeNotifications;
        this._notificationIsAutoRegistered = changeNotifications === true || typeof changeNotifications === "string";
      }
      getWorkspaceFolders() {
        return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkspaceFoldersRequest.type);
      }
      get onDidChangeWorkspaceFolders() {
        if (!this._onDidChangeWorkspaceFolders) {
          throw new Error("Client doesn't support sending workspace folder change events.");
        }
        if (!this._notificationIsAutoRegistered && !this._unregistration) {
          this._unregistration = this.connection.client.register(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type);
        }
        return this._onDidChangeWorkspaceFolders.event;
      }
    };
  };
  exports2.WorkspaceFoldersFeature = WorkspaceFoldersFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/callHierarchy.js
var require_callHierarchy = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.CallHierarchyFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var CallHierarchyFeature = (Base) => {
    return class extends Base {
      get callHierarchy() {
        return {
          onPrepare: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
            });
          },
          onIncomingCalls: (handler) => {
            const type = vscode_languageserver_protocol_1.CallHierarchyIncomingCallsRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          },
          onOutgoingCalls: (handler) => {
            const type = vscode_languageserver_protocol_1.CallHierarchyOutgoingCallsRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          }
        };
      }
    };
  };
  exports2.CallHierarchyFeature = CallHierarchyFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/semanticTokens.js
var require_semanticTokens = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.SemanticTokensBuilder = exports2.SemanticTokensDiff = exports2.SemanticTokensFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var SemanticTokensFeature = (Base) => {
    return class extends Base {
      get semanticTokens() {
        return {
          refresh: () => {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.SemanticTokensRefreshRequest.type);
          },
          on: (handler) => {
            const type = vscode_languageserver_protocol_1.SemanticTokensRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          },
          onDelta: (handler) => {
            const type = vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          },
          onRange: (handler) => {
            const type = vscode_languageserver_protocol_1.SemanticTokensRangeRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          }
        };
      }
    };
  };
  exports2.SemanticTokensFeature = SemanticTokensFeature;

  class SemanticTokensDiff {
    constructor(originalSequence, modifiedSequence) {
      this.originalSequence = originalSequence;
      this.modifiedSequence = modifiedSequence;
    }
    computeDiff() {
      const originalLength = this.originalSequence.length;
      const modifiedLength = this.modifiedSequence.length;
      let startIndex = 0;
      while (startIndex < modifiedLength && startIndex < originalLength && this.originalSequence[startIndex] === this.modifiedSequence[startIndex]) {
        startIndex++;
      }
      if (startIndex < modifiedLength && startIndex < originalLength) {
        let originalEndIndex = originalLength - 1;
        let modifiedEndIndex = modifiedLength - 1;
        while (originalEndIndex >= startIndex && modifiedEndIndex >= startIndex && this.originalSequence[originalEndIndex] === this.modifiedSequence[modifiedEndIndex]) {
          originalEndIndex--;
          modifiedEndIndex--;
        }
        if (originalEndIndex < startIndex || modifiedEndIndex < startIndex) {
          originalEndIndex++;
          modifiedEndIndex++;
        }
        const deleteCount = originalEndIndex - startIndex + 1;
        const newData = this.modifiedSequence.slice(startIndex, modifiedEndIndex + 1);
        if (newData.length === 1 && newData[0] === this.originalSequence[originalEndIndex]) {
          return [
            { start: startIndex, deleteCount: deleteCount - 1 }
          ];
        } else {
          return [
            { start: startIndex, deleteCount, data: newData }
          ];
        }
      } else if (startIndex < modifiedLength) {
        return [
          { start: startIndex, deleteCount: 0, data: this.modifiedSequence.slice(startIndex) }
        ];
      } else if (startIndex < originalLength) {
        return [
          { start: startIndex, deleteCount: originalLength - startIndex }
        ];
      } else {
        return [];
      }
    }
  }
  exports2.SemanticTokensDiff = SemanticTokensDiff;

  class SemanticTokensBuilder {
    constructor() {
      this._prevData = undefined;
      this.initialize();
    }
    initialize() {
      this._id = Date.now();
      this._prevLine = 0;
      this._prevChar = 0;
      this._data = [];
      this._dataLen = 0;
    }
    push(line, char, length, tokenType, tokenModifiers) {
      let pushLine = line;
      let pushChar = char;
      if (this._dataLen > 0) {
        pushLine -= this._prevLine;
        if (pushLine === 0) {
          pushChar -= this._prevChar;
        }
      }
      this._data[this._dataLen++] = pushLine;
      this._data[this._dataLen++] = pushChar;
      this._data[this._dataLen++] = length;
      this._data[this._dataLen++] = tokenType;
      this._data[this._dataLen++] = tokenModifiers;
      this._prevLine = line;
      this._prevChar = char;
    }
    get id() {
      return this._id.toString();
    }
    previousResult(id) {
      if (this.id === id) {
        this._prevData = this._data;
      }
      this.initialize();
    }
    build() {
      this._prevData = undefined;
      return {
        resultId: this.id,
        data: this._data
      };
    }
    canBuildEdits() {
      return this._prevData !== undefined;
    }
    buildEdits() {
      if (this._prevData !== undefined) {
        return {
          resultId: this.id,
          edits: new SemanticTokensDiff(this._prevData, this._data).computeDiff()
        };
      } else {
        return this.build();
      }
    }
  }
  exports2.SemanticTokensBuilder = SemanticTokensBuilder;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/showDocument.js
var require_showDocument = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ShowDocumentFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var ShowDocumentFeature = (Base) => {
    return class extends Base {
      showDocument(params) {
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowDocumentRequest.type, params);
      }
    };
  };
  exports2.ShowDocumentFeature = ShowDocumentFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/fileOperations.js
var require_fileOperations = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.FileOperationsFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var FileOperationsFeature = (Base) => {
    return class extends Base {
      onDidCreateFiles(handler) {
        return this.connection.onNotification(vscode_languageserver_protocol_1.DidCreateFilesNotification.type, (params) => {
          handler(params);
        });
      }
      onDidRenameFiles(handler) {
        return this.connection.onNotification(vscode_languageserver_protocol_1.DidRenameFilesNotification.type, (params) => {
          handler(params);
        });
      }
      onDidDeleteFiles(handler) {
        return this.connection.onNotification(vscode_languageserver_protocol_1.DidDeleteFilesNotification.type, (params) => {
          handler(params);
        });
      }
      onWillCreateFiles(handler) {
        return this.connection.onRequest(vscode_languageserver_protocol_1.WillCreateFilesRequest.type, (params, cancel) => {
          return handler(params, cancel);
        });
      }
      onWillRenameFiles(handler) {
        return this.connection.onRequest(vscode_languageserver_protocol_1.WillRenameFilesRequest.type, (params, cancel) => {
          return handler(params, cancel);
        });
      }
      onWillDeleteFiles(handler) {
        return this.connection.onRequest(vscode_languageserver_protocol_1.WillDeleteFilesRequest.type, (params, cancel) => {
          return handler(params, cancel);
        });
      }
    };
  };
  exports2.FileOperationsFeature = FileOperationsFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/linkedEditingRange.js
var require_linkedEditingRange = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.LinkedEditingRangeFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var LinkedEditingRangeFeature = (Base) => {
    return class extends Base {
      onLinkedEditingRange(handler) {
        return this.connection.onRequest(vscode_languageserver_protocol_1.LinkedEditingRangeRequest.type, (params, cancel) => {
          return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
        });
      }
    };
  };
  exports2.LinkedEditingRangeFeature = LinkedEditingRangeFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/typeHierarchy.js
var require_typeHierarchy = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.TypeHierarchyFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var TypeHierarchyFeature = (Base) => {
    return class extends Base {
      get typeHierarchy() {
        return {
          onPrepare: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
            });
          },
          onSupertypes: (handler) => {
            const type = vscode_languageserver_protocol_1.TypeHierarchySupertypesRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          },
          onSubtypes: (handler) => {
            const type = vscode_languageserver_protocol_1.TypeHierarchySubtypesRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          }
        };
      }
    };
  };
  exports2.TypeHierarchyFeature = TypeHierarchyFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/inlineValue.js
var require_inlineValue = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.InlineValueFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var InlineValueFeature = (Base) => {
    return class extends Base {
      get inlineValue() {
        return {
          refresh: () => {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.InlineValueRefreshRequest.type);
          },
          on: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.InlineValueRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params));
            });
          }
        };
      }
    };
  };
  exports2.InlineValueFeature = InlineValueFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/foldingRange.js
var require_foldingRange = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.FoldingRangeFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var FoldingRangeFeature = (Base) => {
    return class extends Base {
      get foldingRange() {
        return {
          refresh: () => {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.FoldingRangeRefreshRequest.type);
          },
          on: (handler) => {
            const type = vscode_languageserver_protocol_1.FoldingRangeRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          }
        };
      }
    };
  };
  exports2.FoldingRangeFeature = FoldingRangeFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/inlayHint.js
var require_inlayHint = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.InlayHintFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var InlayHintFeature = (Base) => {
    return class extends Base {
      get inlayHint() {
        return {
          refresh: () => {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.InlayHintRefreshRequest.type);
          },
          on: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params));
            });
          },
          resolve: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintResolveRequest.type, (params, cancel) => {
              return handler(params, cancel);
            });
          }
        };
      }
    };
  };
  exports2.InlayHintFeature = InlayHintFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/diagnostic.js
var require_diagnostic = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DiagnosticFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var DiagnosticFeature = (Base) => {
    return class extends Base {
      get diagnostics() {
        return {
          refresh: () => {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.DiagnosticRefreshRequest.type);
          },
          on: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.partialResult, params));
            });
          },
          onWorkspace: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.partialResult, params));
            });
          }
        };
      }
    };
  };
  exports2.DiagnosticFeature = DiagnosticFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/textDocuments.js
var require_textDocuments = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.TextDocuments = undefined;
  var vscode_languageserver_protocol_1 = require_main3();

  class TextDocuments {
    constructor(configuration) {
      this._configuration = configuration;
      this._syncedDocuments = new Map;
      this._onDidChangeContent = new vscode_languageserver_protocol_1.Emitter;
      this._onDidOpen = new vscode_languageserver_protocol_1.Emitter;
      this._onDidClose = new vscode_languageserver_protocol_1.Emitter;
      this._onDidSave = new vscode_languageserver_protocol_1.Emitter;
      this._onWillSave = new vscode_languageserver_protocol_1.Emitter;
    }
    get onDidOpen() {
      return this._onDidOpen.event;
    }
    get onDidChangeContent() {
      return this._onDidChangeContent.event;
    }
    get onWillSave() {
      return this._onWillSave.event;
    }
    onWillSaveWaitUntil(handler) {
      this._willSaveWaitUntil = handler;
    }
    get onDidSave() {
      return this._onDidSave.event;
    }
    get onDidClose() {
      return this._onDidClose.event;
    }
    get(uri) {
      return this._syncedDocuments.get(uri);
    }
    all() {
      return Array.from(this._syncedDocuments.values());
    }
    keys() {
      return Array.from(this._syncedDocuments.keys());
    }
    listen(connection) {
      connection.__textDocumentSync = vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental;
      const disposables = [];
      disposables.push(connection.onDidOpenTextDocument((event) => {
        const td = event.textDocument;
        const document = this._configuration.create(td.uri, td.languageId, td.version, td.text);
        this._syncedDocuments.set(td.uri, document);
        const toFire = Object.freeze({ document });
        this._onDidOpen.fire(toFire);
        this._onDidChangeContent.fire(toFire);
      }));
      disposables.push(connection.onDidChangeTextDocument((event) => {
        const td = event.textDocument;
        const changes = event.contentChanges;
        if (changes.length === 0) {
          return;
        }
        const { version } = td;
        if (version === null || version === undefined) {
          throw new Error(`Received document change event for ${td.uri} without valid version identifier`);
        }
        let syncedDocument = this._syncedDocuments.get(td.uri);
        if (syncedDocument !== undefined) {
          syncedDocument = this._configuration.update(syncedDocument, changes, version);
          this._syncedDocuments.set(td.uri, syncedDocument);
          this._onDidChangeContent.fire(Object.freeze({ document: syncedDocument }));
        }
      }));
      disposables.push(connection.onDidCloseTextDocument((event) => {
        let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined) {
          this._syncedDocuments.delete(event.textDocument.uri);
          this._onDidClose.fire(Object.freeze({ document: syncedDocument }));
        }
      }));
      disposables.push(connection.onWillSaveTextDocument((event) => {
        let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined) {
          this._onWillSave.fire(Object.freeze({ document: syncedDocument, reason: event.reason }));
        }
      }));
      disposables.push(connection.onWillSaveTextDocumentWaitUntil((event, token) => {
        let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined && this._willSaveWaitUntil) {
          return this._willSaveWaitUntil(Object.freeze({ document: syncedDocument, reason: event.reason }), token);
        } else {
          return [];
        }
      }));
      disposables.push(connection.onDidSaveTextDocument((event) => {
        let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined) {
          this._onDidSave.fire(Object.freeze({ document: syncedDocument }));
        }
      }));
      return vscode_languageserver_protocol_1.Disposable.create(() => {
        disposables.forEach((disposable) => disposable.dispose());
      });
    }
  }
  exports2.TextDocuments = TextDocuments;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/notebook.js
var require_notebook = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.NotebookDocuments = exports2.NotebookSyncFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var textDocuments_1 = require_textDocuments();
  var NotebookSyncFeature = (Base) => {
    return class extends Base {
      get synchronization() {
        return {
          onDidOpenNotebookDocument: (handler) => {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidOpenNotebookDocumentNotification.type, (params) => {
              handler(params);
            });
          },
          onDidChangeNotebookDocument: (handler) => {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeNotebookDocumentNotification.type, (params) => {
              handler(params);
            });
          },
          onDidSaveNotebookDocument: (handler) => {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidSaveNotebookDocumentNotification.type, (params) => {
              handler(params);
            });
          },
          onDidCloseNotebookDocument: (handler) => {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidCloseNotebookDocumentNotification.type, (params) => {
              handler(params);
            });
          }
        };
      }
    };
  };
  exports2.NotebookSyncFeature = NotebookSyncFeature;

  class CellTextDocumentConnection {
    onDidOpenTextDocument(handler) {
      this.openHandler = handler;
      return vscode_languageserver_protocol_1.Disposable.create(() => {
        this.openHandler = undefined;
      });
    }
    openTextDocument(params) {
      this.openHandler && this.openHandler(params);
    }
    onDidChangeTextDocument(handler) {
      this.changeHandler = handler;
      return vscode_languageserver_protocol_1.Disposable.create(() => {
        this.changeHandler = handler;
      });
    }
    changeTextDocument(params) {
      this.changeHandler && this.changeHandler(params);
    }
    onDidCloseTextDocument(handler) {
      this.closeHandler = handler;
      return vscode_languageserver_protocol_1.Disposable.create(() => {
        this.closeHandler = undefined;
      });
    }
    closeTextDocument(params) {
      this.closeHandler && this.closeHandler(params);
    }
    onWillSaveTextDocument() {
      return CellTextDocumentConnection.NULL_DISPOSE;
    }
    onWillSaveTextDocumentWaitUntil() {
      return CellTextDocumentConnection.NULL_DISPOSE;
    }
    onDidSaveTextDocument() {
      return CellTextDocumentConnection.NULL_DISPOSE;
    }
  }
  CellTextDocumentConnection.NULL_DISPOSE = Object.freeze({ dispose: () => {} });

  class NotebookDocuments {
    constructor(configurationOrTextDocuments) {
      if (configurationOrTextDocuments instanceof textDocuments_1.TextDocuments) {
        this._cellTextDocuments = configurationOrTextDocuments;
      } else {
        this._cellTextDocuments = new textDocuments_1.TextDocuments(configurationOrTextDocuments);
      }
      this.notebookDocuments = new Map;
      this.notebookCellMap = new Map;
      this._onDidOpen = new vscode_languageserver_protocol_1.Emitter;
      this._onDidChange = new vscode_languageserver_protocol_1.Emitter;
      this._onDidSave = new vscode_languageserver_protocol_1.Emitter;
      this._onDidClose = new vscode_languageserver_protocol_1.Emitter;
    }
    get cellTextDocuments() {
      return this._cellTextDocuments;
    }
    getCellTextDocument(cell) {
      return this._cellTextDocuments.get(cell.document);
    }
    getNotebookDocument(uri) {
      return this.notebookDocuments.get(uri);
    }
    getNotebookCell(uri) {
      const value = this.notebookCellMap.get(uri);
      return value && value[0];
    }
    findNotebookDocumentForCell(cell) {
      const key = typeof cell === "string" ? cell : cell.document;
      const value = this.notebookCellMap.get(key);
      return value && value[1];
    }
    get onDidOpen() {
      return this._onDidOpen.event;
    }
    get onDidSave() {
      return this._onDidSave.event;
    }
    get onDidChange() {
      return this._onDidChange.event;
    }
    get onDidClose() {
      return this._onDidClose.event;
    }
    listen(connection) {
      const cellTextDocumentConnection = new CellTextDocumentConnection;
      const disposables = [];
      disposables.push(this.cellTextDocuments.listen(cellTextDocumentConnection));
      disposables.push(connection.notebooks.synchronization.onDidOpenNotebookDocument((params) => {
        this.notebookDocuments.set(params.notebookDocument.uri, params.notebookDocument);
        for (const cellTextDocument of params.cellTextDocuments) {
          cellTextDocumentConnection.openTextDocument({ textDocument: cellTextDocument });
        }
        this.updateCellMap(params.notebookDocument);
        this._onDidOpen.fire(params.notebookDocument);
      }));
      disposables.push(connection.notebooks.synchronization.onDidChangeNotebookDocument((params) => {
        const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
        if (notebookDocument === undefined) {
          return;
        }
        notebookDocument.version = params.notebookDocument.version;
        const oldMetadata = notebookDocument.metadata;
        let metadataChanged = false;
        const change = params.change;
        if (change.metadata !== undefined) {
          metadataChanged = true;
          notebookDocument.metadata = change.metadata;
        }
        const opened = [];
        const closed = [];
        const data = [];
        const text = [];
        if (change.cells !== undefined) {
          const changedCells = change.cells;
          if (changedCells.structure !== undefined) {
            const array = changedCells.structure.array;
            notebookDocument.cells.splice(array.start, array.deleteCount, ...array.cells !== undefined ? array.cells : []);
            if (changedCells.structure.didOpen !== undefined) {
              for (const open of changedCells.structure.didOpen) {
                cellTextDocumentConnection.openTextDocument({ textDocument: open });
                opened.push(open.uri);
              }
            }
            if (changedCells.structure.didClose) {
              for (const close of changedCells.structure.didClose) {
                cellTextDocumentConnection.closeTextDocument({ textDocument: close });
                closed.push(close.uri);
              }
            }
          }
          if (changedCells.data !== undefined) {
            const cellUpdates = new Map(changedCells.data.map((cell) => [cell.document, cell]));
            for (let i = 0;i <= notebookDocument.cells.length; i++) {
              const change2 = cellUpdates.get(notebookDocument.cells[i].document);
              if (change2 !== undefined) {
                const old = notebookDocument.cells.splice(i, 1, change2);
                data.push({ old: old[0], new: change2 });
                cellUpdates.delete(change2.document);
                if (cellUpdates.size === 0) {
                  break;
                }
              }
            }
          }
          if (changedCells.textContent !== undefined) {
            for (const cellTextDocument of changedCells.textContent) {
              cellTextDocumentConnection.changeTextDocument({ textDocument: cellTextDocument.document, contentChanges: cellTextDocument.changes });
              text.push(cellTextDocument.document.uri);
            }
          }
        }
        this.updateCellMap(notebookDocument);
        const changeEvent = { notebookDocument };
        if (metadataChanged) {
          changeEvent.metadata = { old: oldMetadata, new: notebookDocument.metadata };
        }
        const added = [];
        for (const open of opened) {
          added.push(this.getNotebookCell(open));
        }
        const removed = [];
        for (const close of closed) {
          removed.push(this.getNotebookCell(close));
        }
        const textContent = [];
        for (const change2 of text) {
          textContent.push(this.getNotebookCell(change2));
        }
        if (added.length > 0 || removed.length > 0 || data.length > 0 || textContent.length > 0) {
          changeEvent.cells = { added, removed, changed: { data, textContent } };
        }
        if (changeEvent.metadata !== undefined || changeEvent.cells !== undefined) {
          this._onDidChange.fire(changeEvent);
        }
      }));
      disposables.push(connection.notebooks.synchronization.onDidSaveNotebookDocument((params) => {
        const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
        if (notebookDocument === undefined) {
          return;
        }
        this._onDidSave.fire(notebookDocument);
      }));
      disposables.push(connection.notebooks.synchronization.onDidCloseNotebookDocument((params) => {
        const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
        if (notebookDocument === undefined) {
          return;
        }
        this._onDidClose.fire(notebookDocument);
        for (const cellTextDocument of params.cellTextDocuments) {
          cellTextDocumentConnection.closeTextDocument({ textDocument: cellTextDocument });
        }
        this.notebookDocuments.delete(params.notebookDocument.uri);
        for (const cell of notebookDocument.cells) {
          this.notebookCellMap.delete(cell.document);
        }
      }));
      return vscode_languageserver_protocol_1.Disposable.create(() => {
        disposables.forEach((disposable) => disposable.dispose());
      });
    }
    updateCellMap(notebookDocument) {
      for (const cell of notebookDocument.cells) {
        this.notebookCellMap.set(cell.document, [cell, notebookDocument]);
      }
    }
  }
  exports2.NotebookDocuments = NotebookDocuments;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/moniker.js
var require_moniker = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.MonikerFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var MonikerFeature = (Base) => {
    return class extends Base {
      get moniker() {
        return {
          on: (handler) => {
            const type = vscode_languageserver_protocol_1.MonikerRequest.type;
            return this.connection.onRequest(type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
            });
          }
        };
      }
    };
  };
  exports2.MonikerFeature = MonikerFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/server.js
var require_server = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.createConnection = exports2.combineFeatures = exports2.combineNotebooksFeatures = exports2.combineLanguagesFeatures = exports2.combineWorkspaceFeatures = exports2.combineWindowFeatures = exports2.combineClientFeatures = exports2.combineTracerFeatures = exports2.combineTelemetryFeatures = exports2.combineConsoleFeatures = exports2._NotebooksImpl = exports2._LanguagesImpl = exports2.BulkUnregistration = exports2.BulkRegistration = exports2.ErrorMessageTracker = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var Is = require_is();
  var UUID = require_uuid();
  var progress_1 = require_progress();
  var configuration_1 = require_configuration();
  var workspaceFolder_1 = require_workspaceFolder();
  var callHierarchy_1 = require_callHierarchy();
  var semanticTokens_1 = require_semanticTokens();
  var showDocument_1 = require_showDocument();
  var fileOperations_1 = require_fileOperations();
  var linkedEditingRange_1 = require_linkedEditingRange();
  var typeHierarchy_1 = require_typeHierarchy();
  var inlineValue_1 = require_inlineValue();
  var foldingRange_1 = require_foldingRange();
  var inlayHint_1 = require_inlayHint();
  var diagnostic_1 = require_diagnostic();
  var notebook_1 = require_notebook();
  var moniker_1 = require_moniker();
  function null2Undefined(value) {
    if (value === null) {
      return;
    }
    return value;
  }

  class ErrorMessageTracker {
    constructor() {
      this._messages = Object.create(null);
    }
    add(message) {
      let count = this._messages[message];
      if (!count) {
        count = 0;
      }
      count++;
      this._messages[message] = count;
    }
    sendErrors(connection) {
      Object.keys(this._messages).forEach((message) => {
        connection.window.showErrorMessage(message);
      });
    }
  }
  exports2.ErrorMessageTracker = ErrorMessageTracker;

  class RemoteConsoleImpl {
    constructor() {}
    rawAttach(connection) {
      this._rawConnection = connection;
    }
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    fillServerCapabilities(_capabilities) {}
    initialize(_capabilities) {}
    error(message) {
      this.send(vscode_languageserver_protocol_1.MessageType.Error, message);
    }
    warn(message) {
      this.send(vscode_languageserver_protocol_1.MessageType.Warning, message);
    }
    info(message) {
      this.send(vscode_languageserver_protocol_1.MessageType.Info, message);
    }
    log(message) {
      this.send(vscode_languageserver_protocol_1.MessageType.Log, message);
    }
    debug(message) {
      this.send(vscode_languageserver_protocol_1.MessageType.Debug, message);
    }
    send(type, message) {
      if (this._rawConnection) {
        this._rawConnection.sendNotification(vscode_languageserver_protocol_1.LogMessageNotification.type, { type, message }).catch(() => {
          (0, vscode_languageserver_protocol_1.RAL)().console.error(`Sending log message failed`);
        });
      }
    }
  }

  class _RemoteWindowImpl {
    constructor() {}
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    showErrorMessage(message, ...actions) {
      let params = { type: vscode_languageserver_protocol_1.MessageType.Error, message, actions };
      return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
    }
    showWarningMessage(message, ...actions) {
      let params = { type: vscode_languageserver_protocol_1.MessageType.Warning, message, actions };
      return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
    }
    showInformationMessage(message, ...actions) {
      let params = { type: vscode_languageserver_protocol_1.MessageType.Info, message, actions };
      return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
    }
  }
  var RemoteWindowImpl = (0, showDocument_1.ShowDocumentFeature)((0, progress_1.ProgressFeature)(_RemoteWindowImpl));
  var BulkRegistration;
  (function(BulkRegistration2) {
    function create() {
      return new BulkRegistrationImpl;
    }
    BulkRegistration2.create = create;
  })(BulkRegistration || (exports2.BulkRegistration = BulkRegistration = {}));

  class BulkRegistrationImpl {
    constructor() {
      this._registrations = [];
      this._registered = new Set;
    }
    add(type, registerOptions) {
      const method = Is.string(type) ? type : type.method;
      if (this._registered.has(method)) {
        throw new Error(`${method} is already added to this registration`);
      }
      const id = UUID.generateUuid();
      this._registrations.push({
        id,
        method,
        registerOptions: registerOptions || {}
      });
      this._registered.add(method);
    }
    asRegistrationParams() {
      return {
        registrations: this._registrations
      };
    }
  }
  var BulkUnregistration;
  (function(BulkUnregistration2) {
    function create() {
      return new BulkUnregistrationImpl(undefined, []);
    }
    BulkUnregistration2.create = create;
  })(BulkUnregistration || (exports2.BulkUnregistration = BulkUnregistration = {}));

  class BulkUnregistrationImpl {
    constructor(_connection, unregistrations) {
      this._connection = _connection;
      this._unregistrations = new Map;
      unregistrations.forEach((unregistration) => {
        this._unregistrations.set(unregistration.method, unregistration);
      });
    }
    get isAttached() {
      return !!this._connection;
    }
    attach(connection) {
      this._connection = connection;
    }
    add(unregistration) {
      this._unregistrations.set(unregistration.method, unregistration);
    }
    dispose() {
      let unregistrations = [];
      for (let unregistration of this._unregistrations.values()) {
        unregistrations.push(unregistration);
      }
      let params = {
        unregisterations: unregistrations
      };
      this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
        this._connection.console.info(`Bulk unregistration failed.`);
      });
    }
    disposeSingle(arg) {
      const method = Is.string(arg) ? arg : arg.method;
      const unregistration = this._unregistrations.get(method);
      if (!unregistration) {
        return false;
      }
      let params = {
        unregisterations: [unregistration]
      };
      this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).then(() => {
        this._unregistrations.delete(method);
      }, (_error) => {
        this._connection.console.info(`Un-registering request handler for ${unregistration.id} failed.`);
      });
      return true;
    }
  }

  class RemoteClientImpl {
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    register(typeOrRegistrations, registerOptionsOrType, registerOptions) {
      if (typeOrRegistrations instanceof BulkRegistrationImpl) {
        return this.registerMany(typeOrRegistrations);
      } else if (typeOrRegistrations instanceof BulkUnregistrationImpl) {
        return this.registerSingle1(typeOrRegistrations, registerOptionsOrType, registerOptions);
      } else {
        return this.registerSingle2(typeOrRegistrations, registerOptionsOrType);
      }
    }
    registerSingle1(unregistration, type, registerOptions) {
      const method = Is.string(type) ? type : type.method;
      const id = UUID.generateUuid();
      let params = {
        registrations: [{ id, method, registerOptions: registerOptions || {} }]
      };
      if (!unregistration.isAttached) {
        unregistration.attach(this.connection);
      }
      return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
        unregistration.add({ id, method });
        return unregistration;
      }, (_error) => {
        this.connection.console.info(`Registering request handler for ${method} failed.`);
        return Promise.reject(_error);
      });
    }
    registerSingle2(type, registerOptions) {
      const method = Is.string(type) ? type : type.method;
      const id = UUID.generateUuid();
      let params = {
        registrations: [{ id, method, registerOptions: registerOptions || {} }]
      };
      return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.unregisterSingle(id, method).catch(() => {
            this.connection.console.info(`Un-registering capability with id ${id} failed.`);
          });
        });
      }, (_error) => {
        this.connection.console.info(`Registering request handler for ${method} failed.`);
        return Promise.reject(_error);
      });
    }
    unregisterSingle(id, method) {
      let params = {
        unregisterations: [{ id, method }]
      };
      return this.connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
        this.connection.console.info(`Un-registering request handler for ${id} failed.`);
      });
    }
    registerMany(registrations) {
      let params = registrations.asRegistrationParams();
      return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then(() => {
        return new BulkUnregistrationImpl(this._connection, params.registrations.map((registration) => {
          return { id: registration.id, method: registration.method };
        }));
      }, (_error) => {
        this.connection.console.info(`Bulk registration failed.`);
        return Promise.reject(_error);
      });
    }
  }

  class _RemoteWorkspaceImpl {
    constructor() {}
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    applyEdit(paramOrEdit) {
      function isApplyWorkspaceEditParams(value) {
        return value && !!value.edit;
      }
      let params = isApplyWorkspaceEditParams(paramOrEdit) ? paramOrEdit : { edit: paramOrEdit };
      return this.connection.sendRequest(vscode_languageserver_protocol_1.ApplyWorkspaceEditRequest.type, params);
    }
  }
  var RemoteWorkspaceImpl = (0, fileOperations_1.FileOperationsFeature)((0, workspaceFolder_1.WorkspaceFoldersFeature)((0, configuration_1.ConfigurationFeature)(_RemoteWorkspaceImpl)));

  class TracerImpl {
    constructor() {
      this._trace = vscode_languageserver_protocol_1.Trace.Off;
    }
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    set trace(value) {
      this._trace = value;
    }
    log(message, verbose) {
      if (this._trace === vscode_languageserver_protocol_1.Trace.Off) {
        return;
      }
      this.connection.sendNotification(vscode_languageserver_protocol_1.LogTraceNotification.type, {
        message,
        verbose: this._trace === vscode_languageserver_protocol_1.Trace.Verbose ? verbose : undefined
      }).catch(() => {});
    }
  }

  class TelemetryImpl {
    constructor() {}
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    logEvent(data) {
      this.connection.sendNotification(vscode_languageserver_protocol_1.TelemetryEventNotification.type, data).catch(() => {
        this.connection.console.log(`Sending TelemetryEventNotification failed`);
      });
    }
  }

  class _LanguagesImpl {
    constructor() {}
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    attachWorkDoneProgress(params) {
      return (0, progress_1.attachWorkDone)(this.connection, params);
    }
    attachPartialResultProgress(_type, params) {
      return (0, progress_1.attachPartialResult)(this.connection, params);
    }
  }
  exports2._LanguagesImpl = _LanguagesImpl;
  var LanguagesImpl = (0, foldingRange_1.FoldingRangeFeature)((0, moniker_1.MonikerFeature)((0, diagnostic_1.DiagnosticFeature)((0, inlayHint_1.InlayHintFeature)((0, inlineValue_1.InlineValueFeature)((0, typeHierarchy_1.TypeHierarchyFeature)((0, linkedEditingRange_1.LinkedEditingRangeFeature)((0, semanticTokens_1.SemanticTokensFeature)((0, callHierarchy_1.CallHierarchyFeature)(_LanguagesImpl)))))))));

  class _NotebooksImpl {
    constructor() {}
    attach(connection) {
      this._connection = connection;
    }
    get connection() {
      if (!this._connection) {
        throw new Error("Remote is not attached to a connection yet.");
      }
      return this._connection;
    }
    initialize(_capabilities) {}
    fillServerCapabilities(_capabilities) {}
    attachWorkDoneProgress(params) {
      return (0, progress_1.attachWorkDone)(this.connection, params);
    }
    attachPartialResultProgress(_type, params) {
      return (0, progress_1.attachPartialResult)(this.connection, params);
    }
  }
  exports2._NotebooksImpl = _NotebooksImpl;
  var NotebooksImpl = (0, notebook_1.NotebookSyncFeature)(_NotebooksImpl);
  function combineConsoleFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineConsoleFeatures = combineConsoleFeatures;
  function combineTelemetryFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineTelemetryFeatures = combineTelemetryFeatures;
  function combineTracerFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineTracerFeatures = combineTracerFeatures;
  function combineClientFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineClientFeatures = combineClientFeatures;
  function combineWindowFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineWindowFeatures = combineWindowFeatures;
  function combineWorkspaceFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineWorkspaceFeatures = combineWorkspaceFeatures;
  function combineLanguagesFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineLanguagesFeatures = combineLanguagesFeatures;
  function combineNotebooksFeatures(one, two) {
    return function(Base) {
      return two(one(Base));
    };
  }
  exports2.combineNotebooksFeatures = combineNotebooksFeatures;
  function combineFeatures(one, two) {
    function combine(one2, two2, func) {
      if (one2 && two2) {
        return func(one2, two2);
      } else if (one2) {
        return one2;
      } else {
        return two2;
      }
    }
    let result = {
      __brand: "features",
      console: combine(one.console, two.console, combineConsoleFeatures),
      tracer: combine(one.tracer, two.tracer, combineTracerFeatures),
      telemetry: combine(one.telemetry, two.telemetry, combineTelemetryFeatures),
      client: combine(one.client, two.client, combineClientFeatures),
      window: combine(one.window, two.window, combineWindowFeatures),
      workspace: combine(one.workspace, two.workspace, combineWorkspaceFeatures),
      languages: combine(one.languages, two.languages, combineLanguagesFeatures),
      notebooks: combine(one.notebooks, two.notebooks, combineNotebooksFeatures)
    };
    return result;
  }
  exports2.combineFeatures = combineFeatures;
  function createConnection(connectionFactory, watchDog, factories) {
    const logger = factories && factories.console ? new (factories.console(RemoteConsoleImpl)) : new RemoteConsoleImpl;
    const connection = connectionFactory(logger);
    logger.rawAttach(connection);
    const tracer = factories && factories.tracer ? new (factories.tracer(TracerImpl)) : new TracerImpl;
    const telemetry = factories && factories.telemetry ? new (factories.telemetry(TelemetryImpl)) : new TelemetryImpl;
    const client = factories && factories.client ? new (factories.client(RemoteClientImpl)) : new RemoteClientImpl;
    const remoteWindow = factories && factories.window ? new (factories.window(RemoteWindowImpl)) : new RemoteWindowImpl;
    const workspace = factories && factories.workspace ? new (factories.workspace(RemoteWorkspaceImpl)) : new RemoteWorkspaceImpl;
    const languages = factories && factories.languages ? new (factories.languages(LanguagesImpl)) : new LanguagesImpl;
    const notebooks = factories && factories.notebooks ? new (factories.notebooks(NotebooksImpl)) : new NotebooksImpl;
    const allRemotes = [logger, tracer, telemetry, client, remoteWindow, workspace, languages, notebooks];
    function asPromise(value) {
      if (value instanceof Promise) {
        return value;
      } else if (Is.thenable(value)) {
        return new Promise((resolve, reject) => {
          value.then((resolved) => resolve(resolved), (error) => reject(error));
        });
      } else {
        return Promise.resolve(value);
      }
    }
    let shutdownHandler = undefined;
    let initializeHandler = undefined;
    let exitHandler = undefined;
    let protocolConnection = {
      listen: () => connection.listen(),
      sendRequest: (type, ...params) => connection.sendRequest(Is.string(type) ? type : type.method, ...params),
      onRequest: (type, handler) => connection.onRequest(type, handler),
      sendNotification: (type, param) => {
        const method = Is.string(type) ? type : type.method;
        return connection.sendNotification(method, param);
      },
      onNotification: (type, handler) => connection.onNotification(type, handler),
      onProgress: connection.onProgress,
      sendProgress: connection.sendProgress,
      onInitialize: (handler) => {
        initializeHandler = handler;
        return {
          dispose: () => {
            initializeHandler = undefined;
          }
        };
      },
      onInitialized: (handler) => connection.onNotification(vscode_languageserver_protocol_1.InitializedNotification.type, handler),
      onShutdown: (handler) => {
        shutdownHandler = handler;
        return {
          dispose: () => {
            shutdownHandler = undefined;
          }
        };
      },
      onExit: (handler) => {
        exitHandler = handler;
        return {
          dispose: () => {
            exitHandler = undefined;
          }
        };
      },
      get console() {
        return logger;
      },
      get telemetry() {
        return telemetry;
      },
      get tracer() {
        return tracer;
      },
      get client() {
        return client;
      },
      get window() {
        return remoteWindow;
      },
      get workspace() {
        return workspace;
      },
      get languages() {
        return languages;
      },
      get notebooks() {
        return notebooks;
      },
      onDidChangeConfiguration: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type, handler),
      onDidChangeWatchedFiles: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type, handler),
      __textDocumentSync: undefined,
      onDidOpenTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type, handler),
      onDidChangeTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, handler),
      onDidCloseTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.type, handler),
      onWillSaveTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.WillSaveTextDocumentNotification.type, handler),
      onWillSaveTextDocumentWaitUntil: (handler) => connection.onRequest(vscode_languageserver_protocol_1.WillSaveTextDocumentWaitUntilRequest.type, handler),
      onDidSaveTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.type, handler),
      sendDiagnostics: (params) => connection.sendNotification(vscode_languageserver_protocol_1.PublishDiagnosticsNotification.type, params),
      onHover: (handler) => connection.onRequest(vscode_languageserver_protocol_1.HoverRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
      }),
      onCompletion: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CompletionRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onCompletionResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CompletionResolveRequest.type, handler),
      onSignatureHelp: (handler) => connection.onRequest(vscode_languageserver_protocol_1.SignatureHelpRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
      }),
      onDeclaration: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onDefinition: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onTypeDefinition: (handler) => connection.onRequest(vscode_languageserver_protocol_1.TypeDefinitionRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onImplementation: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onReferences: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ReferencesRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onDocumentHighlight: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentHighlightRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onDocumentSymbol: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentSymbolRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onWorkspaceSymbol: (handler) => connection.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onWorkspaceSymbolResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.type, handler),
      onCodeAction: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeActionRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onCodeActionResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeActionResolveRequest.type, (params, cancel) => {
        return handler(params, cancel);
      }),
      onCodeLens: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeLensRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onCodeLensResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeLensResolveRequest.type, (params, cancel) => {
        return handler(params, cancel);
      }),
      onDocumentFormatting: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentFormattingRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
      }),
      onDocumentRangeFormatting: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
      }),
      onDocumentOnTypeFormatting: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type, (params, cancel) => {
        return handler(params, cancel);
      }),
      onRenameRequest: (handler) => connection.onRequest(vscode_languageserver_protocol_1.RenameRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
      }),
      onPrepareRename: (handler) => connection.onRequest(vscode_languageserver_protocol_1.PrepareRenameRequest.type, (params, cancel) => {
        return handler(params, cancel);
      }),
      onDocumentLinks: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentLinkRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onDocumentLinkResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentLinkResolveRequest.type, (params, cancel) => {
        return handler(params, cancel);
      }),
      onDocumentColor: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onColorPresentation: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onFoldingRanges: (handler) => connection.onRequest(vscode_languageserver_protocol_1.FoldingRangeRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onSelectionRanges: (handler) => connection.onRequest(vscode_languageserver_protocol_1.SelectionRangeRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
      }),
      onExecuteCommand: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ExecuteCommandRequest.type, (params, cancel) => {
        return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
      }),
      dispose: () => connection.dispose()
    };
    for (let remote of allRemotes) {
      remote.attach(protocolConnection);
    }
    connection.onRequest(vscode_languageserver_protocol_1.InitializeRequest.type, (params) => {
      watchDog.initialize(params);
      if (Is.string(params.trace)) {
        tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.trace);
      }
      for (let remote of allRemotes) {
        remote.initialize(params.capabilities);
      }
      if (initializeHandler) {
        let result = initializeHandler(params, new vscode_languageserver_protocol_1.CancellationTokenSource().token, (0, progress_1.attachWorkDone)(connection, params), undefined);
        return asPromise(result).then((value) => {
          if (value instanceof vscode_languageserver_protocol_1.ResponseError) {
            return value;
          }
          let result2 = value;
          if (!result2) {
            result2 = { capabilities: {} };
          }
          let capabilities = result2.capabilities;
          if (!capabilities) {
            capabilities = {};
            result2.capabilities = capabilities;
          }
          if (capabilities.textDocumentSync === undefined || capabilities.textDocumentSync === null) {
            capabilities.textDocumentSync = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
          } else if (!Is.number(capabilities.textDocumentSync) && !Is.number(capabilities.textDocumentSync.change)) {
            capabilities.textDocumentSync.change = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
          }
          for (let remote of allRemotes) {
            remote.fillServerCapabilities(capabilities);
          }
          return result2;
        });
      } else {
        let result = { capabilities: { textDocumentSync: vscode_languageserver_protocol_1.TextDocumentSyncKind.None } };
        for (let remote of allRemotes) {
          remote.fillServerCapabilities(result.capabilities);
        }
        return result;
      }
    });
    connection.onRequest(vscode_languageserver_protocol_1.ShutdownRequest.type, () => {
      watchDog.shutdownReceived = true;
      if (shutdownHandler) {
        return shutdownHandler(new vscode_languageserver_protocol_1.CancellationTokenSource().token);
      } else {
        return;
      }
    });
    connection.onNotification(vscode_languageserver_protocol_1.ExitNotification.type, () => {
      try {
        if (exitHandler) {
          exitHandler();
        }
      } finally {
        if (watchDog.shutdownReceived) {
          watchDog.exit(0);
        } else {
          watchDog.exit(1);
        }
      }
    });
    connection.onNotification(vscode_languageserver_protocol_1.SetTraceNotification.type, (params) => {
      tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.value);
    });
    return protocolConnection;
  }
  exports2.createConnection = createConnection;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/node/files.js
var require_files = __commonJS((exports2) => {
  var __filename = "D:\\Projects\\moon-lang\\node_modules\\.bun\\vscode-languageserver@9.0.1\\node_modules\\vscode-languageserver\\lib\\node\\files.js";
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.resolveModulePath = exports2.FileSystem = exports2.resolveGlobalYarnPath = exports2.resolveGlobalNodePath = exports2.resolve = exports2.uriToFilePath = undefined;
  var url = require("url");
  var path = require("path");
  var fs = require("fs");
  var child_process_1 = require("child_process");
  function uriToFilePath(uri) {
    let parsed = url.parse(uri);
    if (parsed.protocol !== "file:" || !parsed.path) {
      return;
    }
    let segments = parsed.path.split("/");
    for (var i = 0, len = segments.length;i < len; i++) {
      segments[i] = decodeURIComponent(segments[i]);
    }
    if (process.platform === "win32" && segments.length > 1) {
      let first = segments[0];
      let second = segments[1];
      if (first.length === 0 && second.length > 1 && second[1] === ":") {
        segments.shift();
      }
    }
    return path.normalize(segments.join("/"));
  }
  exports2.uriToFilePath = uriToFilePath;
  function isWindows() {
    return process.platform === "win32";
  }
  function resolve(moduleName, nodePath, cwd, tracer) {
    const nodePathKey = "NODE_PATH";
    const app = [
      "var p = process;",
      "p.on('message',function(m){",
      "if(m.c==='e'){",
      "p.exit(0);",
      "}",
      "else if(m.c==='rs'){",
      "try{",
      "var r=require.resolve(m.a);",
      "p.send({c:'r',s:true,r:r});",
      "}",
      "catch(err){",
      "p.send({c:'r',s:false});",
      "}",
      "}",
      "});"
    ].join("");
    return new Promise((resolve2, reject) => {
      let env = process.env;
      let newEnv = Object.create(null);
      Object.keys(env).forEach((key) => newEnv[key] = env[key]);
      if (nodePath && fs.existsSync(nodePath)) {
        if (newEnv[nodePathKey]) {
          newEnv[nodePathKey] = nodePath + path.delimiter + newEnv[nodePathKey];
        } else {
          newEnv[nodePathKey] = nodePath;
        }
        if (tracer) {
          tracer(`NODE_PATH value is: ${newEnv[nodePathKey]}`);
        }
      }
      newEnv["ELECTRON_RUN_AS_NODE"] = "1";
      try {
        let cp = (0, child_process_1.fork)("", [], {
          cwd,
          env: newEnv,
          execArgv: ["-e", app]
        });
        if (cp.pid === undefined) {
          reject(new Error(`Starting process to resolve node module  ${moduleName} failed`));
          return;
        }
        cp.on("error", (error) => {
          reject(error);
        });
        cp.on("message", (message2) => {
          if (message2.c === "r") {
            cp.send({ c: "e" });
            if (message2.s) {
              resolve2(message2.r);
            } else {
              reject(new Error(`Failed to resolve module: ${moduleName}`));
            }
          }
        });
        let message = {
          c: "rs",
          a: moduleName
        };
        cp.send(message);
      } catch (error) {
        reject(error);
      }
    });
  }
  exports2.resolve = resolve;
  function resolveGlobalNodePath(tracer) {
    let npmCommand = "npm";
    const env = Object.create(null);
    Object.keys(process.env).forEach((key) => env[key] = process.env[key]);
    env["NO_UPDATE_NOTIFIER"] = "true";
    const options = {
      encoding: "utf8",
      env
    };
    if (isWindows()) {
      npmCommand = "npm.cmd";
      options.shell = true;
    }
    let handler = () => {};
    try {
      process.on("SIGPIPE", handler);
      let stdout = (0, child_process_1.spawnSync)(npmCommand, ["config", "get", "prefix"], options).stdout;
      if (!stdout) {
        if (tracer) {
          tracer(`'npm config get prefix' didn't return a value.`);
        }
        return;
      }
      let prefix = stdout.trim();
      if (tracer) {
        tracer(`'npm config get prefix' value is: ${prefix}`);
      }
      if (prefix.length > 0) {
        if (isWindows()) {
          return path.join(prefix, "node_modules");
        } else {
          return path.join(prefix, "lib", "node_modules");
        }
      }
      return;
    } catch (err) {
      return;
    } finally {
      process.removeListener("SIGPIPE", handler);
    }
  }
  exports2.resolveGlobalNodePath = resolveGlobalNodePath;
  function resolveGlobalYarnPath(tracer) {
    let yarnCommand = "yarn";
    let options = {
      encoding: "utf8"
    };
    if (isWindows()) {
      yarnCommand = "yarn.cmd";
      options.shell = true;
    }
    let handler = () => {};
    try {
      process.on("SIGPIPE", handler);
      let results = (0, child_process_1.spawnSync)(yarnCommand, ["global", "dir", "--json"], options);
      let stdout = results.stdout;
      if (!stdout) {
        if (tracer) {
          tracer(`'yarn global dir' didn't return a value.`);
          if (results.stderr) {
            tracer(results.stderr);
          }
        }
        return;
      }
      let lines = stdout.trim().split(/\r?\n/);
      for (let line of lines) {
        try {
          let yarn = JSON.parse(line);
          if (yarn.type === "log") {
            return path.join(yarn.data, "node_modules");
          }
        } catch (e) {}
      }
      return;
    } catch (err) {
      return;
    } finally {
      process.removeListener("SIGPIPE", handler);
    }
  }
  exports2.resolveGlobalYarnPath = resolveGlobalYarnPath;
  var FileSystem;
  (function(FileSystem2) {
    let _isCaseSensitive = undefined;
    function isCaseSensitive() {
      if (_isCaseSensitive !== undefined) {
        return _isCaseSensitive;
      }
      if (process.platform === "win32") {
        _isCaseSensitive = false;
      } else {
        _isCaseSensitive = !fs.existsSync(__filename.toUpperCase()) || !fs.existsSync(__filename.toLowerCase());
      }
      return _isCaseSensitive;
    }
    FileSystem2.isCaseSensitive = isCaseSensitive;
    function isParent(parent, child) {
      if (isCaseSensitive()) {
        return path.normalize(child).indexOf(path.normalize(parent)) === 0;
      } else {
        return path.normalize(child).toLowerCase().indexOf(path.normalize(parent).toLowerCase()) === 0;
      }
    }
    FileSystem2.isParent = isParent;
  })(FileSystem || (exports2.FileSystem = FileSystem = {}));
  function resolveModulePath(workspaceRoot, moduleName, nodePath, tracer) {
    if (nodePath) {
      if (!path.isAbsolute(nodePath)) {
        nodePath = path.join(workspaceRoot, nodePath);
      }
      return resolve(moduleName, nodePath, nodePath, tracer).then((value) => {
        if (FileSystem.isParent(nodePath, value)) {
          return value;
        } else {
          return Promise.reject(new Error(`Failed to load ${moduleName} from node path location.`));
        }
      }).then(undefined, (_error) => {
        return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
      });
    } else {
      return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
    }
  }
  exports2.resolveModulePath = resolveModulePath;
});

// ../../node_modules/.bun/vscode-languageserver-protocol@3.17.5/node_modules/vscode-languageserver-protocol/node.js
var require_node2 = __commonJS((exports2, module2) => {
  module2.exports = require_main3();
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/inlineCompletion.proposed.js
var require_inlineCompletion_proposed = __commonJS((exports2) => {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.InlineCompletionFeature = undefined;
  var vscode_languageserver_protocol_1 = require_main3();
  var InlineCompletionFeature = (Base) => {
    return class extends Base {
      get inlineCompletion() {
        return {
          on: (handler) => {
            return this.connection.onRequest(vscode_languageserver_protocol_1.InlineCompletionRequest.type, (params, cancel) => {
              return handler(params, cancel, this.attachWorkDoneProgress(params));
            });
          }
        };
      }
    };
  };
  exports2.InlineCompletionFeature = InlineCompletionFeature;
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/common/api.js
var require_api3 = __commonJS((exports2) => {
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.ProposedFeatures = exports2.NotebookDocuments = exports2.TextDocuments = exports2.SemanticTokensBuilder = undefined;
  var semanticTokens_1 = require_semanticTokens();
  Object.defineProperty(exports2, "SemanticTokensBuilder", { enumerable: true, get: function() {
    return semanticTokens_1.SemanticTokensBuilder;
  } });
  var ic = require_inlineCompletion_proposed();
  __exportStar(require_main3(), exports2);
  var textDocuments_1 = require_textDocuments();
  Object.defineProperty(exports2, "TextDocuments", { enumerable: true, get: function() {
    return textDocuments_1.TextDocuments;
  } });
  var notebook_1 = require_notebook();
  Object.defineProperty(exports2, "NotebookDocuments", { enumerable: true, get: function() {
    return notebook_1.NotebookDocuments;
  } });
  __exportStar(require_server(), exports2);
  var ProposedFeatures;
  (function(ProposedFeatures2) {
    ProposedFeatures2.all = {
      __brand: "features",
      languages: ic.InlineCompletionFeature
    };
  })(ProposedFeatures || (exports2.ProposedFeatures = ProposedFeatures = {}));
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/lib/node/main.js
var require_main4 = __commonJS((exports2) => {
  var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.createConnection = exports2.Files = undefined;
  var node_util_1 = require("node:util");
  var Is = require_is();
  var server_1 = require_server();
  var fm = require_files();
  var node_1 = require_node2();
  __exportStar(require_node2(), exports2);
  __exportStar(require_api3(), exports2);
  var Files;
  (function(Files2) {
    Files2.uriToFilePath = fm.uriToFilePath;
    Files2.resolveGlobalNodePath = fm.resolveGlobalNodePath;
    Files2.resolveGlobalYarnPath = fm.resolveGlobalYarnPath;
    Files2.resolve = fm.resolve;
    Files2.resolveModulePath = fm.resolveModulePath;
  })(Files || (exports2.Files = Files = {}));
  var _protocolConnection;
  function endProtocolConnection() {
    if (_protocolConnection === undefined) {
      return;
    }
    try {
      _protocolConnection.end();
    } catch (_err) {}
  }
  var _shutdownReceived = false;
  var exitTimer = undefined;
  function setupExitTimer() {
    const argName = "--clientProcessId";
    function runTimer(value) {
      try {
        let processId = parseInt(value);
        if (!isNaN(processId)) {
          exitTimer = setInterval(() => {
            try {
              process.kill(processId, 0);
            } catch (ex) {
              endProtocolConnection();
              process.exit(_shutdownReceived ? 0 : 1);
            }
          }, 3000);
        }
      } catch (e) {}
    }
    for (let i = 2;i < process.argv.length; i++) {
      let arg = process.argv[i];
      if (arg === argName && i + 1 < process.argv.length) {
        runTimer(process.argv[i + 1]);
        return;
      } else {
        let args = arg.split("=");
        if (args[0] === argName) {
          runTimer(args[1]);
        }
      }
    }
  }
  setupExitTimer();
  var watchDog = {
    initialize: (params) => {
      const processId = params.processId;
      if (Is.number(processId) && exitTimer === undefined) {
        setInterval(() => {
          try {
            process.kill(processId, 0);
          } catch (ex) {
            process.exit(_shutdownReceived ? 0 : 1);
          }
        }, 3000);
      }
    },
    get shutdownReceived() {
      return _shutdownReceived;
    },
    set shutdownReceived(value) {
      _shutdownReceived = value;
    },
    exit: (code) => {
      endProtocolConnection();
      process.exit(code);
    }
  };
  function createConnection(arg1, arg2, arg3, arg4) {
    let factories;
    let input;
    let output;
    let options;
    if (arg1 !== undefined && arg1.__brand === "features") {
      factories = arg1;
      arg1 = arg2;
      arg2 = arg3;
      arg3 = arg4;
    }
    if (node_1.ConnectionStrategy.is(arg1) || node_1.ConnectionOptions.is(arg1)) {
      options = arg1;
    } else {
      input = arg1;
      output = arg2;
      options = arg3;
    }
    return _createConnection(input, output, options, factories);
  }
  exports2.createConnection = createConnection;
  function _createConnection(input, output, options, factories) {
    let stdio = false;
    if (!input && !output && process.argv.length > 2) {
      let port = undefined;
      let pipeName = undefined;
      let argv = process.argv.slice(2);
      for (let i = 0;i < argv.length; i++) {
        let arg = argv[i];
        if (arg === "--node-ipc") {
          input = new node_1.IPCMessageReader(process);
          output = new node_1.IPCMessageWriter(process);
          break;
        } else if (arg === "--stdio") {
          stdio = true;
          input = process.stdin;
          output = process.stdout;
          break;
        } else if (arg === "--socket") {
          port = parseInt(argv[i + 1]);
          break;
        } else if (arg === "--pipe") {
          pipeName = argv[i + 1];
          break;
        } else {
          var args = arg.split("=");
          if (args[0] === "--socket") {
            port = parseInt(args[1]);
            break;
          } else if (args[0] === "--pipe") {
            pipeName = args[1];
            break;
          }
        }
      }
      if (port) {
        let transport = (0, node_1.createServerSocketTransport)(port);
        input = transport[0];
        output = transport[1];
      } else if (pipeName) {
        let transport = (0, node_1.createServerPipeTransport)(pipeName);
        input = transport[0];
        output = transport[1];
      }
    }
    var commandLineMessage = "Use arguments of createConnection or set command line parameters: '--node-ipc', '--stdio' or '--socket={number}'";
    if (!input) {
      throw new Error("Connection input stream is not set. " + commandLineMessage);
    }
    if (!output) {
      throw new Error("Connection output stream is not set. " + commandLineMessage);
    }
    if (Is.func(input.read) && Is.func(input.on)) {
      let inputStream = input;
      inputStream.on("end", () => {
        endProtocolConnection();
        process.exit(_shutdownReceived ? 0 : 1);
      });
      inputStream.on("close", () => {
        endProtocolConnection();
        process.exit(_shutdownReceived ? 0 : 1);
      });
    }
    const connectionFactory = (logger) => {
      const result = (0, node_1.createProtocolConnection)(input, output, logger, options);
      if (stdio) {
        patchConsole(logger);
      }
      return result;
    };
    return (0, server_1.createConnection)(connectionFactory, watchDog, factories);
  }
  function patchConsole(logger) {
    function serialize(args) {
      return args.map((arg) => typeof arg === "string" ? arg : (0, node_util_1.inspect)(arg)).join(" ");
    }
    const counters = new Map;
    console.assert = function assert(assertion, ...args) {
      if (assertion) {
        return;
      }
      if (args.length === 0) {
        logger.error("Assertion failed");
      } else {
        const [message, ...rest] = args;
        logger.error(`Assertion failed: ${message} ${serialize(rest)}`);
      }
    };
    console.count = function count(label = "default") {
      const message = String(label);
      let counter = counters.get(message) ?? 0;
      counter += 1;
      counters.set(message, counter);
      logger.log(`${message}: ${message}`);
    };
    console.countReset = function countReset(label) {
      if (label === undefined) {
        counters.clear();
      } else {
        counters.delete(String(label));
      }
    };
    console.debug = function debug(...args) {
      logger.log(serialize(args));
    };
    console.dir = function dir(arg, options) {
      logger.log((0, node_util_1.inspect)(arg, options));
    };
    console.log = function log(...args) {
      logger.log(serialize(args));
    };
    console.error = function error(...args) {
      logger.error(serialize(args));
    };
    console.trace = function trace(...args) {
      const stack = new Error().stack.replace(/(.+\n){2}/, "");
      let message = "Trace";
      if (args.length !== 0) {
        message += `: ${serialize(args)}`;
      }
      logger.log(`${message}
${stack}`);
    };
    console.warn = function warn(...args) {
      logger.warn(serialize(args));
    };
  }
});

// ../../node_modules/.bun/vscode-languageserver@9.0.1/node_modules/vscode-languageserver/node.js
var require_node3 = __commonJS((exports2, module2) => {
  module2.exports = require_main4();
});

// ../lsp/src/index.ts
var exports_src = {};
__export(exports_src, {
  wordAtPosition: () => wordAtPosition,
  startLspServer: () => startLspServer,
  prefixAtPosition: () => prefixAtPosition,
  lookupSymbol: () => lookupSymbol,
  listLocalModules: () => listLocalModules,
  isMoonfileDocument: () => isMoonfileDocument,
  getSignatureHelp: () => getSignatureHelp,
  getPartialCompletions: () => getPartialCompletions,
  getMoonfileHover: () => getMoonfileHover,
  getMoonfileCompletions: () => getMoonfileCompletions,
  getCompletions: () => getCompletions,
  formatPreviewMarkdown: () => formatPreviewMarkdown,
  findPromptSites: () => findPromptSites,
  detectMoonfileContext: () => detectMoonfileContext,
  detectCompletionContext: () => detectCompletionContext,
  definitionLocation: () => definitionLocation,
  collectMoonfileDiagnostics: () => collectMoonfileDiagnostics,
  collectLocalBindings: () => collectLocalBindings,
  collectDiagnostics: () => collectDiagnostics,
  buildPromptPreview: () => buildPromptPreview
});
module.exports = __toCommonJS(exports_src);
var import_node = __toESM(require_node3(), 1);

// ../../node_modules/.bun/vscode-languageserver-textdocument@1.0.12/node_modules/vscode-languageserver-textdocument/lib/esm/main.js
class FullTextDocument {
  constructor(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = undefined;
  }
  get uri() {
    return this._uri;
  }
  get languageId() {
    return this._languageId;
  }
  get version() {
    return this._version;
  }
  getText(range) {
    if (range) {
      const start = this.offsetAt(range.start);
      const end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }
  update(changes, version) {
    for (const change of changes) {
      if (FullTextDocument.isIncremental(change)) {
        const range = getWellformedRange(change.range);
        const startOffset = this.offsetAt(range.start);
        const endOffset = this.offsetAt(range.end);
        this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
        const startLine = Math.max(range.start.line, 0);
        const endLine = Math.max(range.end.line, 0);
        let lineOffsets = this._lineOffsets;
        const addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
        if (endLine - startLine === addedLineOffsets.length) {
          for (let i = 0, len = addedLineOffsets.length;i < len; i++) {
            lineOffsets[i + startLine + 1] = addedLineOffsets[i];
          }
        } else {
          if (addedLineOffsets.length < 1e4) {
            lineOffsets.splice(startLine + 1, endLine - startLine, ...addedLineOffsets);
          } else {
            this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
          }
        }
        const diff = change.text.length - (endOffset - startOffset);
        if (diff !== 0) {
          for (let i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length;i < len; i++) {
            lineOffsets[i] = lineOffsets[i] + diff;
          }
        }
      } else if (FullTextDocument.isFull(change)) {
        this._content = change.text;
        this._lineOffsets = undefined;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this._version = version;
  }
  getLineOffsets() {
    if (this._lineOffsets === undefined) {
      this._lineOffsets = computeLineOffsets(this._content, true);
    }
    return this._lineOffsets;
  }
  positionAt(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    const lineOffsets = this.getLineOffsets();
    let low = 0, high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    const line = low - 1;
    offset = this.ensureBeforeEOL(offset, lineOffsets[line]);
    return { line, character: offset - lineOffsets[line] };
  }
  offsetAt(position) {
    const lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = lineOffsets[position.line];
    if (position.character <= 0) {
      return lineOffset;
    }
    const nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    const offset = Math.min(lineOffset + position.character, nextLineOffset);
    return this.ensureBeforeEOL(offset, lineOffset);
  }
  ensureBeforeEOL(offset, lineOffset) {
    while (offset > lineOffset && isEOL(this._content.charCodeAt(offset - 1))) {
      offset--;
    }
    return offset;
  }
  get lineCount() {
    return this.getLineOffsets().length;
  }
  static isIncremental(event) {
    const candidate = event;
    return candidate !== undefined && candidate !== null && typeof candidate.text === "string" && candidate.range !== undefined && (candidate.rangeLength === undefined || typeof candidate.rangeLength === "number");
  }
  static isFull(event) {
    const candidate = event;
    return candidate !== undefined && candidate !== null && typeof candidate.text === "string" && candidate.range === undefined && candidate.rangeLength === undefined;
  }
}
var TextDocument;
(function(TextDocument2) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument(uri, languageId, version, content);
  }
  TextDocument2.create = create;
  function update(document, changes, version) {
    if (document instanceof FullTextDocument) {
      document.update(changes, version);
      return document;
    } else {
      throw new Error("TextDocument.update: document must be created by TextDocument.create");
    }
  }
  TextDocument2.update = update;
  function applyEdits(document, edits) {
    const text = document.getText();
    const sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
      const diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    let lastModifiedOffset = 0;
    const spans = [];
    for (const e of sortedEdits) {
      const startOffset = document.offsetAt(e.range.start);
      if (startOffset < lastModifiedOffset) {
        throw new Error("Overlapping edit");
      } else if (startOffset > lastModifiedOffset) {
        spans.push(text.substring(lastModifiedOffset, startOffset));
      }
      if (e.newText.length) {
        spans.push(e.newText);
      }
      lastModifiedOffset = document.offsetAt(e.range.end);
    }
    spans.push(text.substr(lastModifiedOffset));
    return spans.join("");
  }
  TextDocument2.applyEdits = applyEdits;
})(TextDocument || (TextDocument = {}));
function mergeSort(data, compare) {
  if (data.length <= 1) {
    return data;
  }
  const p = data.length / 2 | 0;
  const left = data.slice(0, p);
  const right = data.slice(p);
  mergeSort(left, compare);
  mergeSort(right, compare);
  let leftIdx = 0;
  let rightIdx = 0;
  let i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    const ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      data[i++] = left[leftIdx++];
    } else {
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}
function computeLineOffsets(text, isAtLineStart, textOffset = 0) {
  const result = isAtLineStart ? [textOffset] : [];
  for (let i = 0;i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (isEOL(ch)) {
      if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
        i++;
      }
      result.push(textOffset + i + 1);
    }
  }
  return result;
}
function isEOL(char) {
  return char === 13 || char === 10;
}
function getWellformedRange(range) {
  const start = range.start;
  const end = range.end;
  if (start.line > end.line || start.line === end.line && start.character > end.character) {
    return { start: end, end: start };
  }
  return range;
}
function getWellformedEdit(textEdit) {
  const range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}

// ../lsp/src/index.ts
var import_path10 = require("path");

// ../lexer/src/tokens.ts
var KEYWORDS = {
  import: "KW_IMPORT",
  model: "KW_MODEL",
  agent: "KW_AGENT",
  data: "KW_DATA",
  instance: "KW_INSTANCE",
  macro: "KW_MACRO",
  where: "KW_WHERE",
  do: "KW_DO",
  let: "KW_LET",
  with: "KW_WITH",
  if: "KW_IF",
  then: "KW_THEN",
  else: "KW_ELSE",
  not: "KW_NOT",
  true: "KW_TRUE",
  false: "KW_FALSE",
  implements: "KW_IMPLEMENTS",
  routes_to: "KW_ROUTES_TO",
  for: "KW_FOR",
  optional: "KW_OPTIONAL",
  constraint: "KW_CONSTRAINT",
  default: "KW_DEFAULT",
  fetched: "KW_FETCHED",
  from: "KW_FROM",
  as: "KW_AS",
  pure: "KW_PURE",
  storm: "KW_STORM"
};
var LAYOUT_OPENERS = new Set([
  "KW_WHERE",
  "KW_DO",
  "KW_WITH"
]);
// ../lexer/src/raw-lexer.ts
class LexError extends Error {
  line;
  column;
  constructor(message, line, column) {
    super(`${message} at ${line}:${column}`);
    this.line = line;
    this.column = column;
    this.name = "LexError";
  }
}
function rawLex(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let column = 1;
  const peek = (n = 0) => source[i + n] ?? "";
  const advance = () => {
    const ch = source[i++];
    if (ch === `
`) {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  };
  const makeToken = (kind, value, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter) => ({
    kind,
    value,
    line: startLine,
    column: startCol,
    offset: startOffset,
    hadSpaceBefore,
    hadSpaceAfter
  });
  const skipComment = () => {
    advance();
    while (i < source.length && peek() !== `
`)
      advance();
  };
  const readString = (startLine, startCol, startOffset, hadSpaceBefore) => {
    const quote = advance();
    if (quote === '"') {
      if (peek() === '"' && peek(1) === '"') {
        advance();
        advance();
        let value2 = "";
        while (i < source.length) {
          if (peek() === '"' && peek(1) === '"' && peek(2) === '"') {
            advance();
            advance();
            advance();
            break;
          }
          value2 += advance();
        }
        const hadSpaceAfter2 = peek() === " " || peek() === "\t";
        tokens.push(makeToken("STRING", value2, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter2));
        return;
      }
      let value = "";
      while (i < source.length && peek() !== '"') {
        if (peek() === "\\") {
          advance();
          value += advance();
        } else {
          value += advance();
        }
      }
      if (peek() !== '"')
        throw new LexError("Unterminated string", line, column);
      advance();
      const hadSpaceAfter = peek() === " " || peek() === "\t";
      tokens.push(makeToken("STRING", value, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
      return;
    }
  };
  const readNumber = (startLine, startCol, startOffset, hadSpaceBefore) => {
    let num = "";
    while (/[0-9]/.test(peek()))
      num += advance();
    if (peek() === "." && /[0-9]/.test(peek(1))) {
      num += advance();
      while (/[0-9]/.test(peek()))
        num += advance();
      const hadSpaceAfter2 = peek() === " " || peek() === "\t";
      tokens.push(makeToken("FLOAT", num, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter2));
      return;
    }
    const hadSpaceAfter = peek() === " " || peek() === "\t";
    tokens.push(makeToken("INT", num, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
  };
  const MODIFIER_KEYWORDS = new Set(["constraint", "default", "optional", "fetched"]);
  const readIdent = (startLine, startCol, startOffset, hadSpaceBefore) => {
    let ident = "";
    while (/[a-zA-Z0-9_\-]/.test(peek()))
      ident += advance();
    const hadSpaceAfter = peek() === " " || peek() === "\t";
    const kw = KEYWORDS[ident];
    const isConfigKey = peek() === ":" && peek(1) !== ":";
    if (kw && !(isConfigKey && !MODIFIER_KEYWORDS.has(ident))) {
      tokens.push(makeToken(kw, ident, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
    } else {
      tokens.push(makeToken("IDENT", ident, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
    }
  };
  while (i < source.length) {
    const ch = peek();
    if (ch === " " || ch === "\t" || ch === "\r") {
      advance();
      continue;
    }
    if (ch === `
`) {
      const startLine2 = line;
      const startCol2 = column;
      const startOffset2 = i;
      advance();
      tokens.push(makeToken("NEWLINE", undefined, startLine2, startCol2, startOffset2, false, false));
      continue;
    }
    const hadSpaceBefore = tokens.length > 0 && tokens[tokens.length - 1].hadSpaceAfter;
    const startLine = line;
    const startCol = column;
    const startOffset = i;
    if (ch === "-" && peek(1) === "-") {
      skipComment();
      continue;
    }
    if (ch === '"') {
      readString(startLine, startCol, startOffset, hadSpaceBefore);
      continue;
    }
    if (/[0-9]/.test(ch)) {
      readNumber(startLine, startCol, startOffset, hadSpaceBefore);
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      readIdent(startLine, startCol, startOffset, hadSpaceBefore);
      continue;
    }
    const two = ch + peek(1);
    const three = two + peek(2);
    const pushSimple = (kind, len, value) => {
      for (let j = 0;j < len; j++)
        advance();
      const hadSpaceAfter = peek() === " " || peek() === "\t";
      tokens.push(makeToken(kind, value, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
    };
    if (three === "<-=")
      throw new LexError("Unexpected '<-='", startLine, startCol);
    if (two === "<-") {
      pushSimple("BIND", 2);
      continue;
    }
    if (three === ">>=") {
      pushSimple("SEQ", 3, ">>=");
      continue;
    }
    if (two === ">>") {
      pushSimple("SEQ", 2, ">>");
      continue;
    }
    if (two === "==") {
      pushSimple("EQ", 2);
      continue;
    }
    if (two === "/=") {
      pushSimple("NEQ", 2);
      continue;
    }
    if (two === "<=") {
      pushSimple("LE", 2);
      continue;
    }
    if (two === ">=") {
      pushSimple("GE", 2);
      continue;
    }
    if (two === "->") {
      pushSimple("ARROW", 2);
      continue;
    }
    if (two === "&&") {
      pushSimple("AND", 2);
      continue;
    }
    if (two === "||") {
      pushSimple("OR", 2);
      continue;
    }
    if (ch === ".") {
      const spaceAfter = peek(1) === " " || peek(1) === "\t";
      if (hadSpaceBefore && spaceAfter) {
        pushSimple("COMPOSE_DOT", 1);
      } else {
        pushSimple("FIELD_DOT", 1);
      }
      continue;
    }
    if (ch === "-") {
      if (hadSpaceBefore || peek(1) === " " || peek(1) === "\t" || !/[0-9a-zA-Z_]/.test(peek(1))) {
        pushSimple("MINUS", 1);
      } else {
        readIdent(startLine, startCol, startOffset, hadSpaceBefore);
      }
      continue;
    }
    switch (ch) {
      case "{":
        pushSimple("LBRACE", 1);
        break;
      case "}":
        pushSimple("RBRACE", 1);
        break;
      case ";":
        pushSimple("SEMI", 1);
        break;
      case "(":
        pushSimple("LPAREN", 1);
        break;
      case ")":
        pushSimple("RPAREN", 1);
        break;
      case "[":
        pushSimple("LBRACKET", 1);
        break;
      case "]":
        pushSimple("RBRACKET", 1);
        break;
      case ",":
        pushSimple("COMMA", 1);
        break;
      case ":":
        pushSimple("COLON", 1);
        break;
      case "=":
        pushSimple("EQUALS", 1);
        break;
      case "|":
        pushSimple("PIPE", 1);
        break;
      case "\\":
        pushSimple("BACKSLASH", 1);
        break;
      case "$":
        pushSimple("DOLLAR", 1);
        break;
      case "+":
        pushSimple("PLUS", 1);
        break;
      case "*":
        pushSimple("STAR", 1);
        break;
      case "/":
        pushSimple("SLASH", 1);
        break;
      case "<":
        pushSimple("LT", 1);
        break;
      case ">":
        pushSimple("GT", 1);
        break;
      default:
        throw new LexError(`Unexpected character '${ch}'`, startLine, startCol);
    }
  }
  tokens.push(makeToken("EOF", undefined, line, column, i, false, false));
  return tokens.map(({ hadSpaceBefore: _b, hadSpaceAfter: _a, ...t }) => t);
}
// ../lexer/src/layout.ts
function lineIndent(source, tok) {
  let pos = tok.offset - 1;
  while (pos >= 0 && source[pos] !== `
`)
    pos--;
  return getIndentAt(source, pos + 1);
}
function getIndentAt(source, start) {
  let col = 0;
  for (let i = start;i < source.length; i++) {
    const ch = source[i];
    if (ch === " ")
      col++;
    else if (ch === "\t")
      col += 4;
    else
      break;
  }
  return col;
}
function groupLines(tokens) {
  const lines = [];
  let current = [];
  for (const tok of tokens) {
    if (tok.kind === "NEWLINE") {
      if (current.length > 0)
        lines.push({ indent: 0, tokens: current });
      current = [];
    } else if (tok.kind !== "EOF") {
      current.push(tok);
    }
  }
  if (current.length > 0)
    lines.push({ indent: 0, tokens: current });
  return lines;
}
function synthetic(kind, ref) {
  return { kind, line: ref.line, column: ref.column, offset: ref.offset };
}
function lineOpensImplicitConfig(tokens) {
  return tokens.some((t) => t.kind === "KW_AGENT" || t.kind === "KW_MODEL") && !tokens.some((t) => t.kind === "KW_WHERE");
}
function applyLayout(source, rawTokens) {
  const rawLines = groupLines(rawTokens);
  const lines = rawLines.map((l) => ({
    indent: l.tokens.length > 0 ? lineIndent(source, l.tokens[0]) : 0,
    tokens: l.tokens
  }));
  const result = [];
  const indentStack = [];
  let pendingLayout = false;
  let pendingImplicit = false;
  let firstInBlock = false;
  const closeLayoutsAbove = (indent, ref) => {
    while (indentStack.length > 0 && indentStack[indentStack.length - 1] > indent) {
      indentStack.pop();
      result.push(synthetic("RBRACE", ref));
      firstInBlock = false;
    }
  };
  const openLayout = (indent, ref) => {
    indentStack.push(indent);
    result.push(synthetic("LBRACE", ref));
    firstInBlock = true;
  };
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    if (line.tokens.length === 0)
      continue;
    const ref = line.tokens[0];
    closeLayoutsAbove(line.indent, ref);
    if (pendingLayout || pendingImplicit) {
      if (line.indent > (indentStack[indentStack.length - 1] ?? -1)) {
        openLayout(line.indent, ref);
      }
      pendingLayout = false;
      pendingImplicit = false;
    } else if (indentStack.length > 0 && line.indent === indentStack[indentStack.length - 1] && !firstInBlock) {
      result.push(synthetic("SEMI", ref));
    }
    for (const tok of line.tokens) {
      result.push(tok);
      if (LAYOUT_OPENERS.has(tok.kind)) {
        pendingLayout = true;
      }
    }
    if (lineOpensImplicitConfig(line.tokens)) {
      const next = lines[i + 1];
      if (next && next.tokens.length > 0 && next.indent > line.indent) {
        pendingImplicit = true;
      }
    }
    if (indentStack.length > 0 && line.indent >= indentStack[indentStack.length - 1]) {
      firstInBlock = false;
    }
  }
  const eofRef = { kind: "EOF", line: 0, column: 0, offset: source.length };
  closeLayoutsAbove(-1, eofRef);
  result.push(eofRef);
  return result;
}
// ../lexer/src/index.ts
function lex(source, options) {
  const raw = rawLex(source);
  if (options?.layout === false)
    return raw;
  return applyLayout(source, raw);
}

// ../parser/src/token-stream.ts
class ParseError extends Error {
  line;
  column;
  constructor(message, line, column) {
    super(`${message} at ${line}:${column}`);
    this.line = line;
    this.column = column;
    this.name = "ParseError";
  }
}

class TokenStream {
  tokens;
  pos = 0;
  constructor(tokens) {
    this.tokens = tokens;
  }
  peek(offset = 0) {
    return this.tokens[this.pos + offset] ?? this.tokens[this.tokens.length - 1];
  }
  advance() {
    const tok = this.peek();
    if (tok.kind !== "EOF")
      this.pos++;
    return tok;
  }
  at(kind) {
    return this.peek().kind === kind;
  }
  check(...kinds) {
    return kinds.includes(this.peek().kind);
  }
  expect(kind) {
    const tok = this.peek();
    if (tok.kind !== kind) {
      throw new ParseError(`Expected ${kind}, got ${tok.kind}`, tok.line, tok.column);
    }
    return this.advance();
  }
  skip(kind) {
    if (this.at(kind)) {
      this.advance();
      return true;
    }
    return false;
  }
  spanFrom(start) {
    const end = this.tokens[Math.max(0, this.pos - 1)];
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: end?.line ?? start.line, column: end?.column ?? start.column, offset: end?.offset ?? start.offset }
    };
  }
  makeSpan(start, end) {
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: end.line, column: end.column, offset: end.offset }
    };
  }
  last() {
    return this.tokens[Math.max(0, this.pos - 1)] ?? this.peek();
  }
  save() {
    return this.pos;
  }
  restore(pos) {
    this.pos = pos;
  }
}

// ../parser/src/types.ts
function parseTypeSpec(ts) {
  return parseTypeArrow(ts);
}
function parseTypeArrow(ts) {
  const start = ts.peek();
  const left = parseTypeApp(ts);
  if (ts.at("ARROW")) {
    ts.advance();
    const right = parseTypeArrow(ts);
    return { kind: "Arrow", from: left, to: right, span: ts.makeSpan(start, ts.last()) };
  }
  return left;
}
function isUpperName(name) {
  return name[0] === name[0].toUpperCase();
}
function parseTypeApp(ts) {
  const start = ts.peek();
  const head = parseTypeAtom(ts);
  const args = [];
  let lastWasParen = false;
  while (true) {
    if (ts.at("IDENT") && !isUpperName(ts.peek().value ?? "") && (ts.peek(1).kind === "EQUALS" || ts.peek(2).kind === "EQUALS")) {
      break;
    }
    if (ts.at("LPAREN") || ts.at("LBRACKET")) {
      args.push(parseTypeAtom(ts));
      lastWasParen = true;
      continue;
    }
    if (!ts.at("IDENT"))
      break;
    const name = ts.peek().value;
    if (isUpperName(name) || name.length === 1 && name === name.toLowerCase()) {
      args.push(parseTypeAtom(ts));
      lastWasParen = false;
      continue;
    }
    break;
  }
  if (args.length > 0) {
    return { kind: "Con", name: typeName(head), args, span: ts.makeSpan(start, ts.last()) };
  }
  return head;
}
function typeName(t) {
  if (t.kind === "Con")
    return t.name;
  if (t.kind === "Var")
    return t.name;
  throw new Error("Invalid type atom");
}
function parseTypeAtom(ts) {
  const start = ts.peek();
  if (ts.at("LBRACKET")) {
    ts.advance();
    const element = parseTypeSpec(ts);
    const end = ts.expect("RBRACKET");
    return { kind: "List", element, span: ts.makeSpan(start, end) };
  }
  if (ts.at("LPAREN")) {
    ts.advance();
    const elements = [];
    if (!ts.at("RPAREN")) {
      elements.push(parseTypeSpec(ts));
      while (ts.skip("COMMA")) {
        elements.push(parseTypeSpec(ts));
      }
    }
    const end = ts.expect("RPAREN");
    if (elements.length === 1)
      return elements[0];
    return { kind: "Tuple", elements, span: ts.makeSpan(start, end) };
  }
  if (ts.at("IDENT")) {
    const tok = ts.advance();
    return { kind: "Var", name: tok.value, span: ts.makeSpan(start, tok) };
  }
  throw new ParseError("Expected type", start.line, start.column);
}

// ../parser/src/literals.ts
function parseLiteral(ts) {
  const start = ts.peek();
  if (ts.at("STRING")) {
    const tok = ts.advance();
    return { kind: "String", value: tok.value, span: ts.makeSpan(start, tok) };
  }
  if (ts.at("INT")) {
    const tok = ts.advance();
    return { kind: "Int", value: parseInt(tok.value, 10), span: ts.makeSpan(start, tok) };
  }
  if (ts.at("FLOAT")) {
    const tok = ts.advance();
    return { kind: "Float", value: parseFloat(tok.value), span: ts.makeSpan(start, tok) };
  }
  if (ts.at("KW_TRUE")) {
    const tok = ts.advance();
    return { kind: "Bool", value: true, span: ts.makeSpan(start, tok) };
  }
  if (ts.at("KW_FALSE")) {
    const tok = ts.advance();
    return { kind: "Bool", value: false, span: ts.makeSpan(start, tok) };
  }
  throw new ParseError("Expected literal", start.line, start.column);
}

// ../parser/src/patterns.ts
function parsePattern(ts, opts = {}) {
  if (opts.allowApp === false) {
    return parsePatternAtom(ts);
  }
  return parsePatternApp(ts);
}
function parsePatternApp(ts) {
  const start = ts.peek();
  let pat = parsePatternAtom(ts);
  if (pat.kind === "PVar" || pat.kind === "PCon") {
    const args = [];
    while (isPatternAtomStart(ts)) {
      args.push(parsePatternAtom(ts));
    }
    if (args.length > 0) {
      const end = ts.last();
      return { kind: "PCon", name: pat.name, args, span: ts.makeSpan(start, end) };
    }
  }
  return pat;
}
function isPatternAtomStart(ts) {
  return ts.check("IDENT", "LPAREN", "LBRACKET", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE");
}
function parsePatternAtom(ts) {
  const start = ts.peek();
  if (ts.at("LPAREN")) {
    ts.advance();
    const elements = [];
    if (!ts.at("RPAREN")) {
      elements.push(parsePattern(ts));
      while (ts.skip("COMMA")) {
        elements.push(parsePattern(ts));
      }
    }
    const end = ts.expect("RPAREN");
    return { kind: "PTuple", elements, span: ts.makeSpan(start, end) };
  }
  if (ts.at("LBRACKET")) {
    ts.advance();
    const elements = [];
    if (!ts.at("RBRACKET")) {
      elements.push(parsePattern(ts));
      while (ts.skip("COMMA")) {
        elements.push(parsePattern(ts));
      }
    }
    const end = ts.expect("RBRACKET");
    return { kind: "PList", elements, span: ts.makeSpan(start, end) };
  }
  if (ts.check("STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE")) {
    const lit = parseLiteral(ts);
    return { kind: "PLit", value: lit, span: lit.span };
  }
  if (ts.at("IDENT")) {
    const tok = ts.advance();
    if (tok.value === "_") {
      return { kind: "PWildcard", span: ts.makeSpan(start, tok) };
    }
    if (/^[A-Z]/.test(tok.value)) {
      return { kind: "PCon", name: tok.value, args: [], span: ts.makeSpan(start, tok) };
    }
    return { kind: "PVar", name: tok.value, span: ts.makeSpan(start, tok) };
  }
  throw new ParseError("Expected pattern", start.line, start.column);
}

// ../parser/src/expressions.ts
var INFIX_OPS = {
  $: { kind: "$", precedence: 1, assoc: "right" },
  ">>=": { kind: ">>=", precedence: 2, assoc: "left" },
  ">>": { kind: ">>", precedence: 2, assoc: "left" },
  "||": { kind: "||", precedence: 3, assoc: "left" },
  "&&": { kind: "&&", precedence: 4, assoc: "left" },
  "==": { kind: "==", precedence: 6, assoc: "left" },
  "/=": { kind: "/=", precedence: 6, assoc: "left" },
  "<=": { kind: "<=", precedence: 6, assoc: "left" },
  ">=": { kind: ">=", precedence: 6, assoc: "left" },
  "<": { kind: "<", precedence: 6, assoc: "left" },
  ">": { kind: ">", precedence: 6, assoc: "left" },
  "+": { kind: "+", precedence: 7, assoc: "left" },
  "-": { kind: "-", precedence: 7, assoc: "left" },
  "*": { kind: "*", precedence: 8, assoc: "left" },
  "/": { kind: "/", precedence: 8, assoc: "left" },
  ".": { kind: ".", precedence: 9, assoc: "left" }
};
function tokenToOp(kind, value) {
  switch (kind) {
    case "DOLLAR":
      return "$";
    case "SEQ":
      return value ?? ">>";
    case "OR":
      return "||";
    case "AND":
      return "&&";
    case "EQ":
      return "==";
    case "NEQ":
      return "/=";
    case "LE":
      return "<=";
    case "GE":
      return ">=";
    case "LT":
      return "<";
    case "GT":
      return ">";
    case "PLUS":
      return "+";
    case "MINUS":
      return "-";
    case "STAR":
      return "*";
    case "SLASH":
      return "/";
    case "COMPOSE_DOT":
      return ".";
    default:
      return null;
  }
}
function parseExpression(ts) {
  return parseDollar(ts);
}
function parseDollar(ts) {
  let left = parseSeq(ts);
  while (ts.at("DOLLAR")) {
    const opTok = ts.advance();
    const right = parseDollar(ts);
    left = { kind: "Infix", op: "$", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseSeq(ts) {
  let left = parseOr(ts);
  while (ts.at("SEQ")) {
    const opTok = ts.advance();
    const op = opTok.value ?? ">>";
    const right = parseOr(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseOr(ts) {
  let left = parseAnd(ts);
  while (ts.at("OR")) {
    const opTok = ts.advance();
    const right = parseAnd(ts);
    left = { kind: "Infix", op: "||", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseAnd(ts) {
  let left = parseNot(ts);
  while (ts.at("AND")) {
    const opTok = ts.advance();
    const right = parseNot(ts);
    left = { kind: "Infix", op: "&&", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseNot(ts) {
  const start = ts.peek();
  if (ts.at("KW_NOT") && ts.peek(1).kind !== "COMPOSE_DOT") {
    const opTok = ts.advance();
    const operand = parseNot(ts);
    return { kind: "Prefix", op: "not", operand, span: ts.makeSpan(start, ts.last()) };
  }
  return parseCompare(ts);
}
function parseCompare(ts) {
  let left = parseAdd(ts);
  const op = tokenToOp(ts.peek().kind, ts.peek().value);
  if (op && INFIX_OPS[op]?.precedence === 6) {
    const opTok = ts.advance();
    const right = parseAdd(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseAdd(ts) {
  let left = parseMul(ts);
  while (ts.check("PLUS", "MINUS")) {
    const opTok = ts.advance();
    const op = opTok.kind === "PLUS" ? "+" : "-";
    const right = parseMul(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseMul(ts) {
  let left = parseCompose(ts);
  while (ts.check("STAR", "SLASH")) {
    const opTok = ts.advance();
    const op = opTok.kind === "STAR" ? "*" : "/";
    const right = parseCompose(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseCompose(ts) {
  let left = parseUnary(ts);
  while (ts.at("COMPOSE_DOT")) {
    const opTok = ts.advance();
    const right = parseUnary(ts);
    left = { kind: "Infix", op: ".", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}
function parseUnary(ts) {
  const start = ts.peek();
  if (ts.at("MINUS")) {
    const opTok = ts.advance();
    const operand = parseUnary(ts);
    return { kind: "Prefix", op: "-", operand, span: ts.makeSpan(start, ts.last()) };
  }
  return parseApp(ts);
}
function parseApp(ts) {
  let expr = parsePostfix(ts);
  while (isPrimaryStart(ts)) {
    const startPos = expr.span.start;
    const arg = parsePostfix(ts);
    const startTok = { line: startPos.line, column: startPos.column, offset: startPos.offset, kind: "IDENT" };
    expr = { kind: "App", func: expr, arg, span: ts.makeSpan(startTok, ts.last()) };
  }
  return expr;
}
function parsePostfix(ts) {
  let expr = parsePrimary(ts);
  if (expr.kind === "Var" && ts.at("LBRACE") && isUpperName2(expr.name)) {
    expr = parseRecordExpr(ts, expr.name, { line: expr.span.start.line, column: expr.span.start.column, offset: expr.span.start.offset, kind: "IDENT" });
  }
  while (ts.at("FIELD_DOT")) {
    ts.advance();
    const field = ts.expect("IDENT").value;
    expr = {
      kind: "FieldAccess",
      object: expr,
      field,
      span: { start: expr.span.start, end: { line: ts.last().line, column: ts.last().column, offset: ts.last().offset } }
    };
  }
  return expr;
}
function isUpperName2(name) {
  return name[0] === name[0].toUpperCase();
}
function canStartPattern(ts) {
  return ts.check("IDENT", "LPAREN", "LBRACKET", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE");
}
function isPrimaryStart(ts) {
  if (ts.check("SEMI", "RBRACE", "EOF", "RPAREN", "RBRACKET", "COMMA", "COLON", "BIND", "KW_WITH", "KW_ELSE", "KW_THEN", "ARROW")) {
    return false;
  }
  if (ts.at("IDENT") && ts.peek(1).kind === "COLON") {
    return false;
  }
  return ts.check("IDENT", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE", "LPAREN", "LBRACKET", "BACKSLASH", "KW_IF", "KW_DO", "KW_AGENT", "KW_MODEL", "MINUS", "KW_PURE");
}
function parsePrimary(ts) {
  const start = ts.peek();
  if (ts.at("KW_PURE")) {
    ts.advance();
    if (ts.at("DOLLAR")) {
      ts.advance();
      const expr = parseExpression(ts);
      return { kind: "App", func: { kind: "Var", name: "pure", span: ts.makeSpan(start, start) }, arg: expr, span: ts.makeSpan(start, ts.last()) };
    }
    return { kind: "Var", name: "pure", span: ts.makeSpan(start, ts.last()) };
  }
  if (ts.at("KW_NOT")) {
    const tok = ts.advance();
    return { kind: "Var", name: "not", span: ts.makeSpan(start, tok) };
  }
  if (ts.check("STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE")) {
    const lit = parseLiteral(ts);
    return { kind: "Lit", value: lit, span: lit.span };
  }
  if (ts.at("IDENT")) {
    const tok = ts.advance();
    if (ts.at("LBRACE") && isUpperName2(tok.value)) {
      return parseRecordExpr(ts, tok.value, start);
    }
    return { kind: "Var", name: tok.value, span: ts.makeSpan(start, tok) };
  }
  if (ts.at("LPAREN")) {
    ts.advance();
    if (ts.at("RPAREN")) {
      const end2 = ts.advance();
      return { kind: "Tuple", elements: [], span: ts.makeSpan(start, end2) };
    }
    const expr = parseExpression(ts);
    if (ts.at("RPAREN")) {
      const end2 = ts.advance();
      return { kind: "Paren", expr, span: ts.makeSpan(start, end2) };
    }
    const elements = [expr];
    while (ts.skip("COMMA")) {
      elements.push(parseExpression(ts));
    }
    const end = ts.expect("RPAREN");
    if (elements.length === 1) {
      return { kind: "Paren", expr: elements[0], span: ts.makeSpan(start, end) };
    }
    return { kind: "Tuple", elements, span: ts.makeSpan(start, end) };
  }
  if (ts.at("LBRACKET")) {
    ts.advance();
    const elements = [];
    if (!ts.at("RBRACKET")) {
      elements.push(parseExpression(ts));
      while (ts.skip("COMMA")) {
        elements.push(parseExpression(ts));
      }
    }
    const end = ts.expect("RBRACKET");
    return { kind: "List", elements, span: ts.makeSpan(start, end) };
  }
  if (ts.at("BACKSLASH")) {
    ts.advance();
    const params = [];
    while (ts.at("IDENT")) {
      params.push(ts.advance().value);
    }
    ts.expect("ARROW");
    const body = ts.at("KW_DO") ? parseDoBlock(ts) : parseExpression(ts);
    return { kind: "Lambda", params, body, span: ts.makeSpan(start, ts.last()) };
  }
  if (ts.at("KW_IF")) {
    ts.advance();
    const condition = parseExpression(ts);
    ts.expect("KW_THEN");
    const thenBranch = parseExpression(ts);
    ts.expect("KW_ELSE");
    const elseBranch = parseExpression(ts);
    return { kind: "If", condition, thenBranch, elseBranch, span: ts.makeSpan(start, ts.last()) };
  }
  if (ts.at("KW_DO")) {
    const block = parseDoBlock(ts);
    return { kind: "Do", block, span: block.span };
  }
  if (ts.at("KW_AGENT")) {
    const decl = parseAgentDecl(ts);
    return { kind: "Agent", decl, span: decl.span };
  }
  if (ts.at("KW_MODEL")) {
    const decl = parseModelDecl(ts);
    return { kind: "Model", decl, span: decl.span };
  }
  throw new ParseError("Expected expression", start.line, start.column);
}
function parseRecordExpr(ts, name, start) {
  ts.expect("LBRACE");
  const fields = [];
  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI") || ts.skip("COMMA"))
      continue;
    const fieldStart = ts.peek();
    const fieldName = ts.expect("IDENT").value;
    ts.expect("EQUALS");
    const value = parseExpression(ts);
    fields.push({ name: fieldName, value, span: ts.makeSpan(fieldStart, ts.last()) });
    if (ts.skip("COMMA"))
      continue;
    if (ts.skip("SEMI"))
      continue;
  }
  const end = ts.expect("RBRACE");
  return { kind: "Record", name, fields, span: ts.makeSpan(start, end) };
}
function parseConfigItems(ts) {
  const items = [];
  while (true) {
    if (ts.at("LBRACE"))
      ts.advance();
    if (!(ts.at("IDENT") && ts.peek(1).kind === "COLON"))
      break;
    const keyStart = ts.peek();
    const key = ts.advance().value;
    ts.expect("COLON");
    const value = parseExpression(ts);
    items.push({ key, value, span: ts.makeSpan(keyStart, ts.last()) });
    if (ts.skip("SEMI"))
      continue;
    if (ts.at("RBRACE")) {
      ts.advance();
      break;
    }
  }
  return items;
}
function parseDoBlock(ts) {
  const start = ts.expect("KW_DO");
  if (ts.at("LBRACE"))
    ts.advance();
  const statements = [];
  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI"))
      continue;
    statements.push(parseDoStatementFixed(ts));
  }
  if (ts.at("RBRACE"))
    ts.advance();
  return { statements, span: ts.makeSpan(start, ts.last()) };
}
function parseTrailingConfig(ts) {
  if (ts.at("KW_WITH")) {
    ts.advance();
    return parseConfigItems(ts);
  }
  if (ts.at("LBRACE") || ts.at("IDENT") && ts.peek(1).kind === "COLON") {
    return parseConfigItems(ts);
  }
  return [];
}
function parseDoStatementFixed(ts) {
  const start = ts.peek();
  if (ts.at("KW_LET")) {
    ts.advance();
    const pattern = parsePattern(ts);
    ts.expect("EQUALS");
    const expr2 = parseExpression(ts);
    return { kind: "Let", pattern, expr: expr2, span: ts.makeSpan(start, ts.last()) };
  }
  if (canStartPattern(ts)) {
    const pos = ts.save();
    const pattern = parsePattern(ts);
    if (ts.at("BIND")) {
      ts.advance();
      if (ts.at("KW_STORM")) {
        ts.advance();
        const input = parseExpression(ts);
        const config3 = parseTrailingConfig(ts);
        return { kind: "Storm", pattern, input, config: config3, span: ts.makeSpan(start, ts.last()) };
      }
      const expr2 = parseExpression(ts);
      const config2 = parseTrailingConfig(ts);
      return { kind: "Bind", pattern, expr: expr2, config: config2, span: ts.makeSpan(start, ts.last()) };
    }
    ts.restore(pos);
  }
  const expr = parseExpression(ts);
  const config = parseTrailingConfig(ts);
  return { kind: "Action", expr, config, span: ts.makeSpan(start, ts.last()) };
}

// ../parser/src/declarations.ts
function parseProgram(ts) {
  const start = ts.peek();
  const declarations = [];
  while (!ts.at("EOF")) {
    if (ts.skip("SEMI"))
      continue;
    declarations.push(parseDeclaration(ts));
  }
  return { declarations, span: ts.makeSpan(start, ts.last()) };
}
function parseDeclaration(ts) {
  const start = ts.peek();
  if (ts.at("KW_IMPORT"))
    return parseImport(ts);
  if (ts.at("KW_MODEL"))
    return { kind: "Model", decl: parseModelDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_AGENT"))
    return { kind: "Agent", decl: parseAgentDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_DATA"))
    return { kind: "Data", decl: parseDataDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_INSTANCE"))
    return { kind: "Instance", decl: parseInstanceDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_MACRO"))
    return { kind: "Macro", decl: parseMacroDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("IDENT") || ts.at("KW_PURE")) {
    return { kind: "Function", decl: parseFunctionDecl(ts), span: ts.makeSpan(start, ts.last()) };
  }
  throw new ParseError("Expected declaration", start.line, start.column);
}
function parseDeclName(ts) {
  if (ts.at("KW_PURE"))
    return ts.advance().value ?? "pure";
  return ts.expect("IDENT").value;
}
function isDeclNameStart(ts) {
  return ts.at("IDENT") || ts.at("KW_PURE");
}
function parseImport(ts) {
  const start = ts.expect("KW_IMPORT");
  const path = [ts.expect("IDENT").value];
  while (ts.skip("FIELD_DOT")) {
    path.push(ts.expect("IDENT").value);
  }
  let alias;
  if (ts.skip("KW_AS")) {
    alias = ts.expect("IDENT").value;
  }
  return { kind: "Import", path, alias, span: ts.makeSpan(start, ts.last()) };
}
function parseModelDecl(ts) {
  const start = ts.expect("KW_MODEL");
  const name = ts.expect("IDENT").value;
  const typeParams = parseTypeParams(ts);
  let implements_;
  if (ts.skip("KW_IMPLEMENTS")) {
    implements_ = ts.expect("IDENT").value;
  }
  const fields = [];
  if (ts.skip("KW_WHERE")) {
    if (ts.at("LBRACE"))
      ts.advance();
    while (!ts.at("RBRACE") && !ts.at("EOF")) {
      if (ts.skip("SEMI"))
        continue;
      fields.push(parseFieldDef(ts));
    }
    if (ts.at("RBRACE"))
      ts.advance();
  }
  return { name, typeParams, implements: implements_, fields, span: ts.makeSpan(start, ts.last()) };
}
function parseFieldDef(ts) {
  const start = ts.peek();
  const name = ts.expect("IDENT").value;
  ts.expect("COLON");
  ts.expect("COLON");
  const type = parseTypeSpec(ts);
  const modifiers = parseFieldModifiers(ts);
  return { name, type, modifiers, span: ts.makeSpan(start, ts.last()) };
}
function parseFieldModifiers(ts) {
  const mods = [];
  while (true) {
    if (ts.at("KW_CONSTRAINT")) {
      const s = ts.advance();
      ts.expect("COLON");
      const expr = parseExpression(ts);
      mods.push({ kind: "Constraint", expr, span: ts.makeSpan(s, ts.last()) });
      continue;
    }
    if (ts.at("KW_DEFAULT")) {
      const s = ts.advance();
      ts.expect("COLON");
      const expr = parseExpression(ts);
      mods.push({ kind: "Default", expr, span: ts.makeSpan(s, ts.last()) });
      continue;
    }
    if (ts.at("KW_FETCHED")) {
      const s = ts.advance();
      ts.expect("KW_FROM");
      const sources = parseSourceSpecs(ts);
      mods.push({ kind: "FetchedFrom", sources, span: ts.makeSpan(s, ts.last()) });
      continue;
    }
    if (ts.at("KW_OPTIONAL")) {
      const s = ts.advance();
      mods.push({ kind: "Optional", span: ts.makeSpan(s, s) });
      continue;
    }
    break;
  }
  return mods;
}
function parseSourceSpecs(ts) {
  const specs = [];
  do {
    const start = ts.peek();
    const source = ts.expect("IDENT").value;
    ts.expect("COLON");
    const field = ts.expect("IDENT").value;
    specs.push({ source, field, span: ts.makeSpan(start, ts.last()) });
  } while (ts.skip("PIPE"));
  return specs;
}
function parseAgentDecl(ts) {
  const start = ts.expect("KW_AGENT");
  const name = ts.expect("IDENT").value;
  const typeParams = parseTypeParams(ts);
  ts.expect("COLON");
  ts.expect("COLON");
  const type = parseTypeSpec(ts);
  let routesTo;
  if (ts.skip("KW_ROUTES_TO")) {
    routesTo = ts.expect("IDENT").value;
  }
  const config = [];
  if (ts.skip("KW_WHERE")) {
    if (ts.at("LBRACE"))
      ts.advance();
    config.push(...parseConfigBlock(ts));
    if (ts.at("RBRACE"))
      ts.advance();
  } else {
    if (ts.at("LBRACE"))
      ts.advance();
    if (ts.at("IDENT") && ts.peek(1).kind === "COLON") {
      config.push(...parseConfigBlock(ts));
    }
    if (ts.at("RBRACE"))
      ts.advance();
  }
  return { name, typeParams, type, routesTo, config, span: ts.makeSpan(start, ts.last()) };
}
function parseConfigBlock(ts) {
  const items = [];
  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI"))
      continue;
    if (!(ts.at("IDENT") && ts.peek(1).kind === "COLON"))
      break;
    const keyStart = ts.peek();
    const key = ts.advance().value;
    ts.expect("COLON");
    const value = parseExpression(ts);
    items.push({ key, value, span: ts.makeSpan(keyStart, ts.last()) });
    if (ts.skip("SEMI"))
      continue;
  }
  return items;
}
function parseDataDecl(ts) {
  const start = ts.expect("KW_DATA");
  const name = ts.expect("IDENT").value;
  const typeParams = parseTypeParams(ts);
  ts.expect("EQUALS");
  const constructors = [parseConstructor(ts)];
  while (ts.skip("PIPE")) {
    constructors.push(parseConstructor(ts));
  }
  return { name, typeParams, constructors, span: ts.makeSpan(start, ts.last()) };
}
function parseConstructor(ts) {
  const start = ts.peek();
  const name = ts.expect("IDENT").value;
  if (ts.at("LPAREN")) {
    ts.advance();
    const types = [];
    if (!ts.at("RPAREN")) {
      types.push(parseTypeSpec(ts));
      while (ts.skip("COMMA")) {
        types.push(parseTypeSpec(ts));
      }
    }
    const end = ts.expect("RPAREN");
    return {
      name,
      args: { kind: "Positional", types, span: ts.makeSpan(start, end) },
      span: ts.makeSpan(start, end)
    };
  }
  if (ts.at("LBRACE")) {
    ts.advance();
    const fields = [];
    while (!ts.at("RBRACE")) {
      if (ts.skip("SEMI") || ts.skip("COMMA"))
        continue;
      const fs = ts.peek();
      const fname = ts.expect("IDENT").value;
      ts.expect("COLON");
      ts.expect("COLON");
      const ftype = parseTypeSpec(ts);
      fields.push({ name: fname, type: ftype, span: ts.makeSpan(fs, ts.last()) });
      if (ts.skip("COMMA"))
        continue;
      if (ts.skip("SEMI"))
        continue;
    }
    const end = ts.expect("RBRACE");
    return {
      name,
      args: { kind: "Record", fields, span: ts.makeSpan(start, end) },
      span: ts.makeSpan(start, end)
    };
  }
  return { name, span: ts.makeSpan(start, ts.last()) };
}
function parseInstanceDecl(ts) {
  const start = ts.expect("KW_INSTANCE");
  const className = ts.expect("IDENT").value;
  ts.expect("KW_FOR");
  const type = parseTypeSpec(ts);
  const typeParams = parseTypeParams(ts);
  const functions = [];
  ts.expect("KW_WHERE");
  if (ts.at("LBRACE"))
    ts.advance();
  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI"))
      continue;
    functions.push(parseFunctionDecl(ts));
  }
  if (ts.at("RBRACE"))
    ts.advance();
  return { className, type, typeParams, functions, span: ts.makeSpan(start, ts.last()) };
}
function parseMacroDecl(ts) {
  const start = ts.expect("KW_MACRO");
  const name = ts.expect("IDENT").value;
  const typeParams = parseTypeParams(ts);
  const params = parseParamList(ts);
  ts.expect("EQUALS");
  const body = parseDoBlock(ts);
  return { name, typeParams, params, body, span: ts.makeSpan(start, ts.last()) };
}
function parseFunctionDecl(ts) {
  const start = ts.peek();
  let signature;
  if (isDeclNameStart(ts) && ts.peek(1).kind === "COLON" && ts.peek(2).kind === "COLON") {
    const name = parseDeclName(ts);
    ts.expect("COLON");
    ts.expect("COLON");
    const type = parseTypeSpec(ts);
    signature = { name, type, span: ts.makeSpan(start, ts.last()) };
  }
  const equations = [parseFunctionEquation(ts, signature?.name)];
  while (isDeclNameStart(ts) && !isTypeSignatureStart(ts)) {
    const nextName = ts.peek().value ?? "pure";
    const expected = signature?.name ?? equations[0].name;
    if (nextName !== expected)
      break;
    equations.push(parseFunctionEquation(ts, expected));
  }
  return { signature, equations, span: ts.makeSpan(start, ts.last()) };
}
function isTypeSignatureStart(ts) {
  return isDeclNameStart(ts) && ts.peek(1).kind === "COLON" && ts.peek(2).kind === "COLON";
}
function parseFunctionEquation(ts, expectedName) {
  const start = ts.peek();
  const name = parseDeclName(ts);
  if (expectedName && name !== expectedName) {
    throw new ParseError(`Expected equation for ${expectedName}, got ${name}`, start.line, start.column);
  }
  const patterns = [];
  while (isPatternContinuer(ts)) {
    patterns.push(parsePattern(ts, { allowApp: false }));
  }
  ts.expect("EQUALS");
  let body;
  if (ts.at("KW_DO")) {
    body = parseDoBlock(ts);
  } else if (ts.at("KW_AGENT")) {
    body = { kind: "Agent", decl: parseAgentDecl(ts), span: ts.makeSpan(start, ts.last()) };
  } else {
    body = parseExpression(ts);
  }
  return { name, patterns, body, span: ts.makeSpan(start, ts.last()) };
}
function isPatternContinuer(ts) {
  if (ts.at("EQUALS") || ts.at("COLON"))
    return false;
  return ts.check("IDENT", "LPAREN", "LBRACKET", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE");
}
function parseTypeParams(ts) {
  const params = [];
  while (ts.at("IDENT") && !isDeclBoundary(ts)) {
    const next = ts.peek(1).kind;
    if (next === "COLON" && ts.peek(2).kind === "COLON") {
      params.push(ts.advance().value);
      break;
    }
    if (next === "EQUALS") {
      params.push(ts.advance().value);
      break;
    }
    params.push(ts.advance().value);
  }
  return params;
}
function isDeclBoundary(ts) {
  return ts.check("KW_WHERE", "KW_IMPLEMENTS", "KW_ROUTES_TO", "EQUALS", "EOF", "SEMI", "RBRACE");
}
function parseParamList(ts) {
  if (!ts.at("LPAREN"))
    return [];
  ts.advance();
  const params = [];
  if (!ts.at("RPAREN")) {
    const pname = ts.expect("IDENT").value;
    ts.expect("COLON");
    ts.expect("COLON");
    params.push({ name: pname, type: parseTypeSpec(ts) });
    while (ts.skip("COMMA")) {
      const n = ts.expect("IDENT").value;
      ts.expect("COLON");
      ts.expect("COLON");
      params.push({ name: n, type: parseTypeSpec(ts) });
    }
  }
  ts.expect("RPAREN");
  return params;
}

// ../parser/src/index.ts
function parse(source, options) {
  const tokens = lex(source, { layout: options?.layout ?? true });
  const ts = new TokenStream(tokens);
  return parseProgram(ts);
}

// ../formatter/src/index.ts
var INDENT = "    ";
function formatSource(source) {
  try {
    const program = parse(source);
    const formatted = formatProgram(program, source);
    parse(formatted);
    return formatted;
  } catch {
    return source;
  }
}
function sliceSpan(source, span) {
  return source.slice(span.start.offset, span.end.offset);
}
function formatProgram(program, source) {
  const comments = extractLeadingComments(source);
  const parts = [];
  if (comments.header)
    parts.push(comments.header.trimEnd());
  for (const decl of program.declarations) {
    parts.push(formatDeclaration(decl, source));
  }
  return `${parts.filter(Boolean).join(`

`)}
`;
}
function extractLeadingComments(source) {
  const lines = source.split(/\r?\n/);
  const header = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("--"))
      header.push(line);
    else
      break;
  }
  return { header: header.join(`
`) };
}
function formatDeclaration(decl, source) {
  switch (decl.kind) {
    case "Import":
      return `import ${decl.path.join(".")}${decl.alias ? ` as ${decl.alias}` : ""}`;
    case "Function":
      return formatFunction(decl.decl, source);
    default:
      return trimTrailingWhitespace(sliceSpan(source, decl.span));
  }
}
function formatFunction(decl, source) {
  const lines = [];
  if (decl.signature) {
    lines.push(sliceSpan(source, decl.signature.span));
  }
  for (const eq of decl.equations) {
    if ("statements" in eq.body) {
      lines.push(formatDoEquation(eq.name, eq.patterns, eq.body, eq.span, source));
    } else {
      lines.push(trimTrailingWhitespace(sliceSpan(source, eq.span)));
    }
  }
  return lines.join(`
`);
}
function formatDoEquation(name, patterns, block, span, source) {
  const raw = sliceSpan(source, span);
  const eqPrefix = formatEquationPrefix(name, patterns, source, span, raw);
  const body = formatDoBlock(block, source, 1);
  return `${eqPrefix}
${body}`;
}
function formatEquationPrefix(name, patterns, source, span, raw) {
  const patText = patterns.map((p) => trimTrailingWhitespace(sliceSpan(source, p.span))).join(" ");
  const doIdx = raw.indexOf("= do");
  if (doIdx >= 0) {
    return trimTrailingWhitespace(raw.slice(0, doIdx + 4));
  }
  const patSuffix = patText ? ` ${patText}` : "";
  return `${name}${patSuffix} = do`;
}
function formatDoBlock(block, source, depth) {
  return block.statements.map((stmt) => reindentBlock(sliceSpan(source, stmt.span), depth)).join(`
`);
}
function reindentBlock(text, depth) {
  const lines = text.split(/\r?\n/);
  const nonempty = lines.filter((l) => l.trim().length > 0);
  if (nonempty.length === 0)
    return "";
  const baseIndent = Math.min(...nonempty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0));
  const pad = INDENT.repeat(depth);
  return lines.map((line) => {
    if (!line.trim())
      return "";
    const content = line.length >= baseIndent ? line.slice(baseIndent) : line.trimStart();
    return pad + content;
  }).join(`
`);
}
function trimTrailingWhitespace(text) {
  return text.replace(/[ \t]+$/gm, "").trimEnd();
}

// ../resolver/src/index.ts
var import_fs2 = require("fs");
var import_path2 = require("path");

// ../moonfile/src/parse.ts
var import_fs = require("fs");
var import_path = require("path");

class MoonfileParseError extends Error {
  line;
  constructor(message, line) {
    super(`${message} at line ${line}`);
    this.line = line;
    this.name = "MoonfileParseError";
  }
}
function parseMoonfile(source) {
  const result = {
    package: "",
    dependencies: [],
    targets: {},
    models: {},
    providers: {},
    paths: {},
    prompts: {},
    runtime: {}
  };
  const lines = source.split(/\r?\n/).map((raw, index) => ({
    indent: raw.match(/^(\s*)/)?.[1].length ?? 0,
    text: raw.trim(),
    lineNo: index + 1
  })).filter((line) => line.text && !line.text.startsWith("#") && !line.text.startsWith("--"));
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    const packageMatch = line.text.match(/^package\s+"([^"]+)"/);
    if (packageMatch) {
      result.package = packageMatch[1];
      continue;
    }
    if (isNestedSectionHeader(line.text)) {
      const section = line.text.slice(0, -1);
      i = parseSection(section, lines, i + 1, line.indent, result);
      continue;
    }
    throw new MoonfileParseError(`Unexpected top-level line: ${line.text}`, line.lineNo);
  }
  if (!result.package) {
    throw new MoonfileParseError('Missing package "name" declaration', 1);
  }
  return result;
}
function parseSection(section, lines, start, parentIndent, result) {
  let i = start;
  while (i < lines.length && lines[i].indent > parentIndent) {
    const line = lines[i];
    if (isNestedSectionHeader(line.text)) {
      const nested = line.text.slice(0, -1);
      i = parseNestedSection(section, nested, lines, i + 1, line.indent, result);
      continue;
    }
    const kv = line.text.match(/^([a-zA-Z0-9_.-]+):\s+(.+)$/);
    if (kv) {
      const key = kv[1];
      const value = stripQuotes(kv[2].trim());
      applySectionValue(section, key, value, result);
      i++;
      continue;
    }
    if (section === "dependencies") {
      result.dependencies.push(line.text.replace(/^-\s*/, ""));
      i++;
      continue;
    }
    throw new MoonfileParseError(`Unexpected line in ${section}`, line.lineNo);
  }
  return i - 1;
}
function isNestedSectionHeader(text) {
  return text.endsWith(":") && !text.includes(" ") && !text.includes('"');
}
function parseNestedSection(section, nested, lines, start, parentIndent, result) {
  let i = start;
  while (i < lines.length && lines[i].indent > parentIndent) {
    const line = lines[i];
    const kv = line.text.match(/^([a-zA-Z0-9_.-]+):\s+(.+)$/);
    if (!kv) {
      throw new MoonfileParseError(`Expected key: value in ${section}.${nested}`, line.lineNo);
    }
    const key = kv[1];
    const value = stripQuotes(kv[2].trim());
    applyNestedValue(section, nested, key, value, result);
    i++;
  }
  return i - 1;
}
function applySectionValue(section, key, value, result) {
  switch (section) {
    case "targets":
      result.targets[key] = value;
      break;
    case "models":
      if (key === "default_flash")
        result.models.default_flash = value;
      if (key === "default_pro")
        result.models.default_pro = value;
      break;
    case "paths":
      if (key === "pricing")
        result.paths.pricing = value;
      if (key === "tokenizer")
        result.paths.tokenizer = value;
      break;
    case "prompts":
      if (key === "default_system_suffix")
        result.prompts.default_system_suffix = stripQuotes(value);
      if (key === "trace_by_default")
        result.prompts.trace_by_default = value === "true";
      break;
    default:
      break;
  }
}
function parseEnvRef(value) {
  const m = value.match(/^env\("([^"]+)"\)$/);
  if (m)
    return { env: m[1] };
  if (/^sk-[a-zA-Z0-9]+$/.test(value) || value.startsWith("sk-")) {
    return { error: 'Literal API keys are not allowed; use env("VAR")' };
  }
  return { literal: stripQuotes(value) };
}
function applyNestedValue(section, nested, key, value, result) {
  if (section === "providers" && nested === "deepseek") {
    result.providers.deepseek ??= {};
    if (key === "api_key") {
      const parsed = parseEnvRef(value);
      if (parsed.error)
        throw new MoonfileParseError(parsed.error, 1);
      if (parsed.env)
        result.providers.deepseek.api_key_env = parsed.env;
      else if (parsed.literal)
        result.providers.deepseek.api_key = parsed.literal;
    }
    if (key === "base_url") {
      const parsed = parseEnvRef(value);
      if (parsed.env)
        result.providers.deepseek.base_url_env = parsed.env;
      else
        result.providers.deepseek.base_url = stripQuotes(value);
    }
    if (key === "api_format") {
      const fmt = stripQuotes(value);
      if (fmt === "openai" || fmt === "anthropic") {
        result.providers.deepseek.api_format = fmt;
      }
    }
    if (key === "use_beta")
      result.providers.deepseek.use_beta = value === "true";
    return;
  }
  if (section === "prompts" && nested === "storm") {
    result.prompts.storm ??= {};
    if (key === "default_rounds")
      result.prompts.storm.default_rounds = Number(value);
    if (key === "max_panel_size")
      result.prompts.storm.max_panel_size = Number(value);
    return;
  }
  if (section !== "runtime")
    return;
  if (nested === "worker_pool") {
    result.runtime.worker_pool ??= {};
    if (key === "flash_concurrency")
      result.runtime.worker_pool.flash_concurrency = Number(value);
    if (key === "pro_concurrency")
      result.runtime.worker_pool.pro_concurrency = Number(value);
  } else if (nested === "memory") {
    result.runtime.memory ??= {};
    if (key === "long_term_backend")
      result.runtime.memory.long_term_backend = value;
  } else if (nested === "retries") {
    result.runtime.retries ??= {};
    if (key === "max_repair_attempts")
      result.runtime.retries.max_repair_attempts = Number(value);
  }
}
function stripQuotes(value) {
  if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}
function loadMoonfile(path) {
  return parseMoonfile(import_fs.readFileSync(path, "utf-8"));
}
var MOONFILE_NAMES = ["Moonfile", "Moonfile.moon"];
function findMoonfile(startDir) {
  let dir = import_path.resolve(startDir);
  while (true) {
    for (const name of MOONFILE_NAMES) {
      const candidate = import_path.join(dir, name);
      if (import_fs.existsSync(candidate))
        return candidate;
    }
    const parent = import_path.dirname(dir);
    if (parent === dir)
      return null;
    dir = parent;
  }
}
// ../typechecker/src/types.ts
var nextId = 0;
function freshVar() {
  return { kind: "Var", id: nextId++ };
}
function resetVarSupply() {
  nextId = 0;
}
function prim(name, ...args) {
  return { kind: "Con", name, args };
}
function fn(from, to) {
  return { kind: "Arrow", from, to };
}
function listOf(t) {
  return prim("List", t);
}
function io(t) {
  return prim("IO", t);
}
function tuple(...elements) {
  return { kind: "Tuple", elements };
}
function record(name, fields) {
  return { kind: "Record", name, fields };
}
var KNOWN_TYPES = new Set([
  "String",
  "Int",
  "Float",
  "Bool",
  "IO",
  "List",
  "Unit",
  "Code",
  "Documentation",
  "Requirements",
  "Entity",
  "Agent",
  "Scope",
  "PullRequest",
  "ChangedFile",
  "LongTerm",
  "Finding",
  "Recommendation",
  "Suggestion",
  "Location",
  "Severity",
  "Category",
  "Verdict",
  "Analyzer",
  "Reviewer",
  "AnalysisResult",
  "ReviewResult"
]);
function isTypeVarName(name) {
  return /^[a-z]/.test(name) && !KNOWN_TYPES.has(name);
}
function typeSpecToMoon(spec, varMap) {
  switch (spec.kind) {
    case "Var": {
      if (varMap && isTypeVarName(spec.name)) {
        if (!varMap.has(spec.name)) {
          varMap.set(spec.name, freshVar());
        }
        return varMap.get(spec.name);
      }
      return prim(spec.name);
    }
    case "List":
      return listOf(typeSpecToMoon(spec.element, varMap));
    case "Tuple":
      return tuple(...spec.elements.map((e) => typeSpecToMoon(e, varMap)));
    case "Arrow":
      return fn(typeSpecToMoon(spec.from, varMap), typeSpecToMoon(spec.to, varMap));
    case "Con": {
      const args = spec.args.map((a) => typeSpecToMoon(a, varMap));
      return prim(spec.name, ...args);
    }
  }
}
function typeSpecToScheme(spec) {
  const varMap = new Map;
  const type = typeSpecToMoon(spec, varMap);
  const vars = [...varMap.values()].filter((t) => t.kind === "Var").map((t) => t.id);
  return { vars, type };
}
function freeVars(t, acc = new Set) {
  switch (t.kind) {
    case "Var":
      acc.add(t.id);
      break;
    case "Con":
      t.args.forEach((a) => freeVars(a, acc));
      break;
    case "Arrow":
      freeVars(t.from, acc);
      freeVars(t.to, acc);
      break;
    case "Record":
      t.fields.forEach((f) => freeVars(f.type, acc));
      break;
    case "Tuple":
      t.elements.forEach((e) => freeVars(e, acc));
      break;
  }
  return acc;
}
function generalize(envVars, t) {
  const fvs = [...freeVars(t)].filter((id) => !envVars.has(id));
  return { vars: fvs, type: t };
}
function instantiate(scheme, supply) {
  const subst = new Map;
  for (const v of scheme.vars) {
    subst.set(v, supply.fresh());
  }
  return applySubst(subst, scheme.type);
}
function applySubst(subst, t) {
  switch (t.kind) {
    case "Var": {
      const s = subst.get(t.id);
      if (!s)
        return t;
      return applySubst(subst, s);
    }
    case "Con":
      return { kind: "Con", name: t.name, args: t.args.map((a) => applySubst(subst, a)) };
    case "Arrow":
      return fn(applySubst(subst, t.from), applySubst(subst, t.to));
    case "Record":
      return record(t.name, t.fields.map((f) => ({ name: f.name, type: applySubst(subst, f.type) })));
    case "Tuple":
      return tuple(...t.elements.map((e) => applySubst(subst, e)));
  }
}
function occurs(id, t) {
  switch (t.kind) {
    case "Var":
      return t.id === id;
    case "Con":
      return t.args.some((a) => occurs(id, a));
    case "Arrow":
      return occurs(id, t.from) || occurs(id, t.to);
    case "Record":
      return t.fields.some((f) => occurs(id, f.type));
    case "Tuple":
      return t.elements.some((e) => occurs(id, e));
  }
}

class UnifyError extends Error {
  span;
  constructor(message, span) {
    super(message);
    this.span = span;
    this.name = "UnifyError";
  }
}
function unify(t1, t2, span) {
  const subst = new Map;
  unifyMut(subst, t1, t2, span);
  return subst;
}
function unifyMut(subst, t1, t2, span) {
  const a = applySubst(subst, t1);
  const b = applySubst(subst, t2);
  if (a.kind === "Var") {
    bind(subst, a.id, b, span);
    return;
  }
  if (b.kind === "Var") {
    bind(subst, b.id, a, span);
    return;
  }
  if (a.kind !== b.kind) {
    if (a.kind === "Record" && b.kind === "Record" && a.name === b.name) {
      unifyFields(subst, a.fields, b.fields, span);
      return;
    }
    throw new UnifyError(`Type mismatch: ${formatType(a)} vs ${formatType(b)}`, span);
  }
  switch (a.kind) {
    case "Con": {
      const bc = b;
      if (a.args.length !== bc.args.length) {
        throw new UnifyError(`Type mismatch: ${formatType(a)} vs ${formatType(b)}`, span);
      }
      if (a.name !== bc.name && !compatibleTypes(a.name, bc.name)) {
        throw new UnifyError(`Type mismatch: ${formatType(a)} vs ${formatType(b)}`, span);
      }
      for (let i = 0;i < a.args.length; i++) {
        unifyMut(subst, a.args[i], bc.args[i], span);
      }
      break;
    }
    case "Arrow":
      unifyMut(subst, a.from, b.from, span);
      unifyMut(subst, a.to, b.to, span);
      break;
    case "Record":
      unifyFields(subst, a.fields, b.fields, span);
      break;
    case "Tuple":
      if (a.elements.length !== b.elements.length) {
        throw new UnifyError(`Tuple arity mismatch`, span);
      }
      for (let i = 0;i < a.elements.length; i++) {
        unifyMut(subst, a.elements[i], b.elements[i], span);
      }
      break;
  }
}
function unifyFields(subst, fa, fb, span) {
  if (fa.length !== fb.length) {
    throw new UnifyError("Record field count mismatch", span);
  }
  for (let i = 0;i < fa.length; i++) {
    if (fa[i].name !== fb[i].name) {
      throw new UnifyError(`Record field mismatch: ${fa[i].name} vs ${fb[i].name}`, span);
    }
    unifyMut(subst, fa[i].type, fb[i].type, span);
  }
}
var COMPATIBLE_TYPES = {
  Code: ["PullRequest"],
  PullRequest: ["Code"]
};
function compatibleTypes(a, b) {
  return COMPATIBLE_TYPES[a]?.includes(b) ?? false;
}
function bind(subst, id, t, span) {
  const applied = applySubst(subst, t);
  if (occurs(id, applied)) {
    throw new UnifyError("Infinite type", span);
  }
  subst.set(id, applied);
}
function formatType(t) {
  switch (t.kind) {
    case "Var":
      return `?${t.id}`;
    case "Con":
      if (t.args.length === 0)
        return t.name;
      return `${t.name} ${t.args.map(formatType).join(" ")}`;
    case "Arrow": {
      const left = t.from.kind === "Arrow" ? `(${formatType(t.from)})` : formatType(t.from);
      return `${left} -> ${formatType(t.to)}`;
    }
    case "Record":
      return `${t.name} { ${t.fields.map((f) => `${f.name}: ${formatType(f.type)}`).join(", ")} }`;
    case "Tuple":
      return `(${t.elements.map(formatType).join(", ")})`;
  }
}

// ../typechecker/src/stdlib/core-analyzers.ts
var v = () => freshVar();
var a = () => v();
var scheme = (t) => ({ vars: [], type: t });
var forall = (t) => {
  const vars = [];
  const collect = (mt) => {
    if (mt.kind === "Var")
      vars.push(mt.id);
    else if (mt.kind === "Con")
      mt.args.forEach(collect);
    else if (mt.kind === "Arrow") {
      collect(mt.from);
      collect(mt.to);
    } else if (mt.kind === "Record")
      mt.fields.forEach((f) => collect(f.type));
    else if (mt.kind === "Tuple")
      mt.elements.forEach(collect);
  };
  collect(t);
  return { vars: [...new Set(vars)], type: t };
};
var analyzeOutput = (t) => record("AnalyzeOutput", [
  { name: "findings", type: listOf(prim("Finding", t)) },
  { name: "summary", type: prim("String") },
  { name: "confidence", type: prim("Float") }
]);
function analyzersSchemes() {
  const values = new Map;
  values.set("hasCriticalFindings", forall(fn(listOf(a()), prim("Bool"))));
  values.set("escalateCriticalIssues", forall(fn(listOf(a()), io(prim("Unit")))));
  values.set("getPreviousVersion", forall(fn(a(), prim("String"))));
  values.set("calculateScore", forall(fn(analyzeOutput(a()), prim("Float"))));
  values.set("extractRecommendations", forall(fn(analyzeOutput(a()), listOf(prim("Recommendation", a())))));
  values.set("hasCriticalIssues", forall(fn(listOf(a()), prim("Bool"))));
  values.set("notifyTeamLeads", forall(fn(listOf(a()), io(prim("Unit")))));
  values.set("decideOverallVerdict", forall(fn(listOf(a()), fn(prim("ReviewResult", a()), io(prim("Verdict"))))));
  values.set("collectFindings", forall(fn(listOf(a()), listOf(prim("Finding", a())))));
  values.set("generateSummary", forall(fn(prim("ReviewResult", a()), prim("String"))));
  values.set("calculateConfidence", forall(fn(listOf(a()), prim("Float"))));
  values.set("extractSuggestions", forall(fn(prim("ReviewResult", a()), listOf(prim("Suggestion")))));
  values.set("detectLanguage", scheme(fn(prim("ChangedFile"), prim("String"))));
  return values;
}

// ../typechecker/src/stdlib/core-fs.ts
var scheme2 = (t) => ({ vars: [], type: t });
function fsSchemes() {
  const values = new Map;
  values.set("readFile", scheme2(fn(prim("String"), io(prim("String")))));
  values.set("writeFile", scheme2(fn(prim("String"), fn(prim("String"), io(prim("Unit"))))));
  values.set("pathExists", scheme2(fn(prim("String"), io(prim("Bool")))));
  values.set("listDir", scheme2(fn(prim("String"), io(listOf(prim("String"))))));
  values.set("makeDir", scheme2(fn(prim("String"), io(prim("Unit")))));
  values.set("removePath", scheme2(fn(prim("String"), io(prim("Unit")))));
  return values;
}

// ../typechecker/src/stdlib/core-github.ts
var scheme3 = (t) => ({ vars: [], type: t });
function githubSchemes() {
  const values = new Map;
  values.set("PullRequest", scheme3(prim("PullRequest")));
  values.set("ChangedFile", scheme3(record("ChangedFile", [
    { name: "path", type: prim("String") },
    { name: "previousContent", type: prim("String") }
  ])));
  values.set("fetchOpenPRs", scheme3(fn(prim("String"), io(listOf(prim("PullRequest"))))));
  values.set("fetchChangedFiles", scheme3(fn(prim("PullRequest"), io(listOf(prim("ChangedFile"))))));
  values.set("isDraft", scheme3(fn(prim("PullRequest"), prim("Bool"))));
  return values;
}

// ../typechecker/src/stdlib/core-memory.ts
var scheme4 = (t) => ({ vars: [], type: t });
function memorySchemes() {
  const values = new Map;
  values.set("LongTerm", scheme4(prim("LongTerm")));
  values.set("memory", scheme4(fn(prim("LongTerm"), fn(prim("String"), io(prim("Unit"))))));
  values.set("recall", scheme4(fn(prim("String"), io(prim("String")))));
  return values;
}

// ../typechecker/src/stdlib/core-network.ts
var scheme5 = (t) => ({ vars: [], type: t });
function networkSchemes() {
  const values = new Map;
  values.set("httpGet", scheme5(fn(prim("String"), io(prim("String")))));
  values.set("httpPost", scheme5(fn(prim("String"), fn(prim("String"), io(prim("String"))))));
  values.set("fetchJson", scheme5(fn(prim("String"), io(prim("String")))));
  return values;
}

// ../typechecker/src/stdlib/core-tools.ts
var v2 = () => freshVar();
var a2 = () => v2();
var scheme6 = (t) => ({ vars: [], type: t });
var forall2 = (t) => {
  const vars = [];
  const collect = (mt) => {
    if (mt.kind === "Var")
      vars.push(mt.id);
    else if (mt.kind === "Con")
      mt.args.forEach(collect);
    else if (mt.kind === "Arrow") {
      collect(mt.from);
      collect(mt.to);
    } else if (mt.kind === "Record")
      mt.fields.forEach((f) => collect(f.type));
    else if (mt.kind === "Tuple")
      mt.elements.forEach(collect);
  };
  collect(t);
  return { vars: [...new Set(vars)], type: t };
};
function toolsSchemes() {
  const values = new Map;
  values.set("readFile", scheme6(fn(prim("String"), io(prim("String")))));
  values.set("saveToFile", scheme6(fn(prim("String"), fn(prim("String"), io(prim("Unit"))))));
  values.set("when", scheme6(fn(prim("Bool"), fn(io(prim("Unit")), io(prim("Unit"))))));
  values.set("mapM", forall2(fn(fn(a2(), io(a2())), fn(listOf(a2()), io(listOf(a2()))))));
  values.set("postToSlack", scheme6(fn(prim("String"), io(prim("Unit")))));
  values.set("postSummaryToSlack", forall2(fn(listOf(a2()), io(prim("Unit")))));
  values.set("fetchUpdatedDocs", scheme6(fn(prim("String"), io(listOf(prim("Documentation"))))));
  values.set("generateCombinedReport", forall2(fn(listOf(a2()), fn(listOf(a2()), io(prim("String"))))));
  values.set("generateReviewReport", forall2(fn(listOf(a2()), io(prim("String")))));
  values.set("between", scheme6(fn(prim("Float"), fn(prim("Float"), prim("Float")))));
  return values;
}

// ../typechecker/src/stdlib/index.ts
var CORE_MODULES = {
  "Core.GitHub": githubSchemes,
  "Core.Memory": memorySchemes,
  "Core.Tools": toolsSchemes,
  "Core.Analyzers": analyzersSchemes,
  "Core.FS": fsSchemes,
  "Core.Network": networkSchemes
};
function coreModuleSchemes(path) {
  const loader = CORE_MODULES[path];
  return loader ? loader() : null;
}
function isCoreModule(path) {
  return path in CORE_MODULES;
}
function allCoreModulePaths() {
  return Object.keys(CORE_MODULES);
}

// ../resolver/src/index.ts
function defaultStdlibRoot() {
  if (process.env.MOON_STDLIB) {
    return import_path2.resolve(process.env.MOON_STDLIB);
  }
  return import_path2.resolve("D:\\Projects\\moon-lang\\packages\\resolver\\src", "../../../stdlib");
}
function resolveStdlibPath(modulePath) {
  if (modulePath[0] !== "Core" || modulePath.length !== 2)
    return null;
  const candidate = import_path2.join(defaultStdlibRoot(), "Core", `${modulePath[1]}.moon`);
  return import_fs2.existsSync(candidate) ? candidate : null;
}
function resolveLocalModule(name, entryPath, projectRoot) {
  const rel = `${name}.moon`;
  const candidates = [
    import_path2.join(projectRoot, "lib", rel),
    import_path2.join(projectRoot, "src", rel),
    import_path2.join(import_path2.dirname(import_path2.resolve(entryPath)), rel)
  ];
  for (const c of candidates) {
    if (import_fs2.existsSync(c))
      return c;
  }
  return null;
}
function pathKey(path) {
  return path.join(".");
}
function mergeSchemes(target, source, moduleName, errors) {
  for (const [name, scheme7] of source) {
    if (target.has(name)) {
      errors.push({
        message: `Duplicate symbol '${name}' from import ${moduleName}`,
        line: 1,
        column: 1
      });
      continue;
    }
    target.set(name, scheme7);
  }
}
function schemesFromLocalProgram(program) {
  const schemes = new Map;
  for (const decl of program.declarations) {
    if (decl.kind === "Function" && decl.decl.signature) {
      schemes.set(decl.decl.signature.name, typeSpecToScheme(decl.decl.signature.type));
    }
    if (decl.kind === "Agent") {
      schemes.set(decl.decl.name, typeSpecToScheme(decl.decl.type));
    }
    if (decl.kind === "Data") {
      for (const ctor of decl.decl.constructors) {
        schemes.set(ctor.name, typeSpecToScheme({ kind: "Con", name: ctor.name, args: [], span: ctor.span }));
      }
    }
  }
  return schemes;
}
function resolveImports(program, options) {
  const errors = [];
  const imports = [];
  const projectRoot = options.projectRoot ?? import_path2.dirname(import_path2.resolve(options.entryPath));
  const moonfilePath = findMoonfile(projectRoot);
  const moonfile = options.moonfile ?? (moonfilePath ? loadMoonfile(moonfilePath) : undefined);
  const seen = new Set;
  for (const decl of program.declarations) {
    if (decl.kind !== "Import")
      continue;
    const key = pathKey(decl.path);
    if (seen.has(key))
      continue;
    seen.add(key);
    if (decl.path[0] === "Core") {
      if (moonfile && !moonfile.dependencies.includes(key)) {
        errors.push({
          message: `Module ${key} is imported but not listed in Moonfile dependencies`,
          line: decl.span.start.line,
          column: decl.span.start.column
        });
      }
      if (!isCoreModule(key)) {
        errors.push({
          message: `Unknown Core module: ${key}`,
          line: decl.span.start.line,
          column: decl.span.start.column
        });
        continue;
      }
      const schemes = coreModuleSchemes(key);
      if (!schemes)
        continue;
      imports.push({
        path: decl.path,
        pathKey: key,
        filePath: resolveStdlibPath(decl.path) ?? undefined,
        schemes
      });
      continue;
    }
    const localName = decl.path.length === 1 ? decl.path[0] : decl.path.join(".");
    const filePath = resolveLocalModule(localName, options.entryPath, projectRoot);
    if (!filePath) {
      errors.push({
        message: `Cannot resolve local module: ${localName}`,
        line: decl.span.start.line,
        column: decl.span.start.column
      });
      continue;
    }
    const localProgram = parse(import_fs2.readFileSync(filePath, "utf-8"));
    imports.push({
      path: decl.path,
      pathKey: localName,
      filePath,
      schemes: schemesFromLocalProgram(localProgram)
    });
  }
  return { imports, errors };
}
function applyImportsToEnv(values, resolved) {
  const errors = [...resolved.errors];
  const merged = new Map;
  for (const imp of resolved.imports) {
    mergeSchemes(merged, imp.schemes, imp.pathKey, errors);
  }
  for (const [name, scheme7] of merged) {
    if (values.has(name)) {
      errors.push({ message: `Symbol '${name}' conflicts with an existing binding`, line: 1, column: 1 });
      continue;
    }
    values.set(name, scheme7);
  }
  return errors;
}

// ../typechecker/src/index.ts
var import_path3 = require("path");

// ../typechecker/src/env.ts
function createEnv(values, classes) {
  return {
    values,
    constructors: new Map,
    classes,
    instances: [],
    envVars: new Set
  };
}
function envVarIds(env) {
  const ids = new Set(env.envVars);
  for (const scheme7 of env.values.values()) {
    for (const v3 of scheme7.vars)
      ids.add(v3);
  }
  return ids;
}

// ../typechecker/src/check.ts
class TypeError2 extends Error {
  line;
  column;
  constructor(message, line, column) {
    super(`${message} at ${line}:${column}`);
    this.line = line;
    this.column = column;
    this.name = "TypeError";
  }
}
function checkProgram(program, env) {
  const errors = [];
  let subst = new Map;
  const run = (span, f) => {
    try {
      return f();
    } catch (e) {
      if (e instanceof UnifyError) {
        errors.push(new TypeError2(e.message, span.start.line, span.start.column));
        return;
      }
      if (e instanceof TypeError2) {
        errors.push(e);
        return;
      }
      throw e;
    }
  };
  for (const decl of program.declarations) {
    if (decl.kind === "Model") {
      registerModel(env, decl.decl);
    } else if (decl.kind === "Data") {
      registerData(env, decl.decl);
    }
  }
  for (const decl of program.declarations) {
    if (decl.kind === "Agent") {
      run(decl.span, () => registerAgent(env, decl.decl));
    } else if (decl.kind === "Function" && decl.decl.signature) {
      run(decl.span, () => registerFunctionSig(env, decl.decl));
    }
  }
  for (const decl of program.declarations) {
    if (decl.kind === "Function") {
      run(decl.span, () => {
        subst = compose(subst, checkFunction(env, decl.decl, errors));
      });
    } else if (decl.kind === "Instance") {
      run(decl.span, () => registerInstance(env, decl.decl, errors));
    }
  }
  return { ok: errors.length === 0, errors, env };
}
function compose(a3, b) {
  const result = new Map(a3);
  for (const [k, v3] of b) {
    result.set(k, applySubst(result, v3));
  }
  return result;
}
function registerModel(env, decl) {
  const paramSubst = new Map;
  for (const p of decl.typeParams) {
    paramSubst.set(p, freshVar());
  }
  const fields = decl.fields.map((f) => ({
    name: f.name,
    type: applyTypeParams(typeSpecToMoon(f.type), paramSubst)
  }));
  const tc = {
    name: decl.name,
    params: decl.typeParams,
    kind: "model",
    fields
  };
  env.constructors.set(decl.name, tc);
  env.values.set(decl.name, {
    vars: [...paramSubst.values()].filter((t) => t.kind === "Var").map((t) => t.id),
    type: prim(decl.name, ...paramSubst.values())
  });
}
function registerData(env, decl) {
  const paramSubst = new Map;
  for (const p of decl.typeParams) {
    paramSubst.set(p, freshVar());
  }
  const constructors = decl.constructors.map((c) => {
    if (c.args?.kind === "Record") {
      return {
        name: c.name,
        fields: c.args.fields.map((f) => ({
          name: f.name,
          type: applyTypeParams(typeSpecToMoon(f.type), paramSubst)
        })),
        args: []
      };
    }
    const types = c.args?.kind === "Positional" ? c.args.types.map((t) => applyTypeParams(typeSpecToMoon(t), paramSubst)) : [];
    return { name: c.name, fields: [], args: types };
  });
  env.constructors.set(decl.name, {
    name: decl.name,
    params: decl.typeParams,
    kind: "data",
    constructors
  });
  for (const c of constructors) {
    const fieldTypes = c.fields.map((f) => f.type);
    const argTypes = c.args.length > 0 ? c.args : fieldTypes;
    const conType = argTypes.reduceRight((acc, t) => fn(t, acc), prim(decl.name, ...paramSubst.values()));
    env.values.set(c.name, { vars: [], type: conType });
  }
}
function applyTypeParams(t, subst) {
  if (t.kind === "Con" && t.args.length === 0 && subst.has(t.name)) {
    return subst.get(t.name);
  }
  if (t.kind === "Con") {
    return prim(t.name, ...t.args.map((a3) => applyTypeParams(a3, subst)));
  }
  if (t.kind === "Arrow")
    return fn(applyTypeParams(t.from, subst), applyTypeParams(t.to, subst));
  if (t.kind === "Record") {
    return record(t.name, t.fields.map((f) => ({ name: f.name, type: applyTypeParams(f.type, subst) })));
  }
  if (t.kind === "Tuple") {
    return { kind: "Tuple", elements: t.elements.map((e) => applyTypeParams(e, subst)) };
  }
  return t;
}
function registerAgent(env, decl) {
  const agentType = typeSpecToMoon(decl.type);
  env.values.set(decl.name, generalize(envVarIds(env), agentType));
  if (agentType.kind === "Con") {
    const className = agentType.name;
    const tc = env.classes.get(className);
    if (tc) {
      const methods = new Map;
      for (const m of tc.methods) {
        methods.set(m.name, m.type);
      }
      env.instances.push({ className, types: agentType.args, methods });
    }
  }
}
function registerInstance(env, decl, errors) {
  const instanceType = typeSpecToMoon(decl.type);
  const methods = new Map;
  for (const f of decl.functions) {
    if (f.signature) {
      const scheme7 = generalize(envVarIds(env), typeSpecToMoon(f.signature.type));
      methods.set(f.signature.name, scheme7);
      env.values.set(`${decl.className}.${f.signature.name}`, scheme7);
    }
    checkFunction(env, f, errors);
  }
  env.instances.push({ className: decl.className, types: [instanceType], methods });
}
function checkFunction(env, decl, errors) {
  let subst = new Map;
  const supply = { fresh: freshVar };
  for (const eq of decl.equations) {
    const local = new Map(env.values);
    const expected = decl.signature ? instantiate(typeSpecToScheme(decl.signature.type), supply) : local.get(eq.name) ? instantiate(local.get(eq.name), supply) : undefined;
    let patSubst = new Map;
    let argTypes = [];
    for (const pat of eq.patterns) {
      const pt = freshVar();
      argTypes.push(pt);
      patSubst = compose(patSubst, checkPattern(env, pat, pt, errors));
    }
    const bodyType = freshVar();
    const lambdaType = argTypes.reduceRight((acc, t) => fn(t, acc), bodyType);
    if (expected) {
      subst = compose(subst, unify(lambdaType, expected, eq.span));
    }
    const bodyEnv = { ...env, values: new Map(local) };
    applyPatternBindings(bodyEnv, eq.patterns, argTypes, patSubst);
    const bodyResult = checkExpr(bodyEnv, eq.body, supply);
    subst = compose(subst, compose(patSubst, bodyResult.subst));
    subst = compose(subst, unify(applySubst(subst, bodyResult.type), bodyType, eq.span));
    if (!decl.signature && eq.patterns.length === 0) {
      const gen = generalize(envVarIds(env), applySubst(subst, bodyResult.type));
      local.set(eq.name, gen);
      env.values.set(eq.name, gen);
    }
  }
  return subst;
}
function applyPatternBindings(env, patterns, types, subst) {
  for (let i = 0;i < patterns.length; i++) {
    bindPattern(env, patterns[i], applySubst(subst, types[i]));
  }
}
function bindPattern(env, pat, type) {
  switch (pat.kind) {
    case "PVar":
      env.values.set(pat.name, { vars: [], type });
      break;
    case "PWildcard":
      break;
    case "PCon": {
      const dataTc = [...env.constructors.values()].find((tc) => tc.constructors?.some((c) => c.name === pat.name));
      const con = dataTc?.constructors?.find((c) => c.name === pat.name);
      if (con && pat.args.length > 0) {
        if (con.fields.length > 0) {
          for (let i = 0;i < pat.args.length; i++) {
            bindPattern(env, pat.args[i], con.fields[i]?.type ?? type);
          }
        } else {
          for (let i = 0;i < pat.args.length; i++) {
            bindPattern(env, pat.args[i], con.args[i] ?? type);
          }
        }
      }
      break;
    }
    default:
      break;
  }
}
function checkPattern(env, pat, expected, errors) {
  try {
    switch (pat.kind) {
      case "PVar":
        return new Map;
      case "PWildcard":
        return new Map;
      case "PLit": {
        const litType = pat.value.kind === "String" ? prim("String") : pat.value.kind === "Int" ? prim("Int") : pat.value.kind === "Float" ? prim("Float") : prim("Bool");
        return unify(litType, expected, pat.span);
      }
      case "PCon": {
        const scheme7 = env.values.get(pat.name);
        if (!scheme7) {
          errors.push(new TypeError2(`Unknown constructor ${pat.name}`, pat.span.start.line, pat.span.start.column));
          return new Map;
        }
        const supply = { fresh: freshVar };
        const conType = instantiate(scheme7, supply);
        if (pat.args.length === 0) {
          return unify(conType, expected, pat.span);
        }
        let subst = new Map;
        let cur = conType;
        for (const arg of pat.args) {
          const argType = freshVar();
          subst = compose(subst, unify(cur, fn(argType, freshVar()), pat.span));
          const arrow = applySubst(subst, cur);
          if (arrow.kind === "Arrow") {
            subst = compose(subst, unify(arrow.from, argType, pat.span));
            cur = arrow.to;
            subst = compose(subst, checkPattern(env, arg, argType, errors));
          }
        }
        subst = compose(subst, unify(applySubst(subst, cur), expected, pat.span));
        return subst;
      }
      default:
        return new Map;
    }
  } catch (e) {
    if (e instanceof UnifyError) {
      errors.push(new TypeError2(e.message, pat.span.start.line, pat.span.start.column));
      return new Map;
    }
    throw e;
  }
}
function checkExpr(env, expr, supply) {
  if ("statements" in expr) {
    return checkDoBlock(env, expr, supply);
  }
  const span = expr.span;
  let subst = new Map;
  switch (expr.kind) {
    case "Lit": {
      const t = expr.value.kind === "String" ? prim("String") : expr.value.kind === "Int" ? prim("Int") : expr.value.kind === "Float" ? prim("Float") : prim("Bool");
      return { type: t, subst };
    }
    case "Var": {
      const scheme7 = env.values.get(expr.name);
      if (!scheme7) {
        throw new TypeError2(`Unknown variable ${expr.name}`, span.start.line, span.start.column);
      }
      return { type: instantiate(scheme7, supply), subst };
    }
    case "App": {
      const f = checkExpr(env, expr.func, supply);
      const a3 = checkExpr(env, expr.arg, supply);
      subst = compose(subst, compose(f.subst, a3.subst));
      const ret = supply.fresh();
      subst = compose(subst, unify(applySubst(subst, f.type), fn(applySubst(subst, a3.type), ret), span));
      return { type: ret, subst };
    }
    case "Infix": {
      if (expr.op === ".") {
        const f = checkExpr(env, expr.left, supply);
        const g = checkExpr(env, expr.right, supply);
        subst = compose(subst, compose(f.subst, g.subst));
        const ret2 = supply.fresh();
        const mid = supply.fresh();
        const arg = supply.fresh();
        subst = compose(subst, unify(applySubst(subst, g.type), fn(arg, mid), span));
        subst = compose(subst, unify(applySubst(subst, f.type), fn(mid, ret2), span));
        return { type: fn(arg, ret2), subst };
      }
      const opScheme = env.values.get(expr.op);
      if (opScheme) {
        const opType = instantiate(opScheme, supply);
        const l2 = checkExpr(env, expr.left, supply);
        const r2 = checkExpr(env, expr.right, supply);
        subst = compose(subst, compose(l2.subst, r2.subst));
        subst = compose(subst, unify(opType, fn(applySubst(subst, l2.type), fn(applySubst(subst, r2.type), supply.fresh())), span));
        const applied = applySubst(subst, opType);
        if (applied.kind === "Arrow" && applied.to.kind === "Arrow") {
          return { type: applied.to.to, subst };
        }
      }
      const l = checkExpr(env, expr.left, supply);
      const r = checkExpr(env, expr.right, supply);
      subst = compose(subst, compose(l.subst, r.subst));
      const ret = supply.fresh();
      subst = compose(subst, unify(fn(applySubst(subst, l.type), fn(applySubst(subst, r.type), ret)), fn(prim("Bool"), fn(prim("Bool"), prim("Bool"))), span));
      return { type: ret, subst };
    }
    case "Prefix": {
      const operand = checkExpr(env, expr.operand, supply);
      subst = compose(subst, operand.subst);
      if (expr.op === "not") {
        subst = compose(subst, unify(operand.type, prim("Bool"), span));
        return { type: prim("Bool"), subst };
      }
      subst = compose(subst, unify(operand.type, prim("Float"), span));
      return { type: prim("Float"), subst };
    }
    case "FieldAccess": {
      const obj = checkExpr(env, expr.object, supply);
      subst = compose(subst, obj.subst);
      const objType = applySubst(subst, obj.type);
      if (objType.kind === "Record") {
        const field = objType.fields.find((f) => f.name === expr.field);
        if (field)
          return { type: field.type, subst };
      }
      const methodType = resolveMethod(env, objType, expr.field, supply);
      if (methodType)
        return { type: methodType, subst };
      const fieldType = supply.fresh();
      const rowType = record("_row", [{ name: expr.field, type: fieldType }]);
      subst = compose(subst, unify(objType, rowType, span));
      return { type: fieldType, subst };
    }
    case "Record": {
      const tc = env.constructors.get(expr.name);
      if (!tc?.fields) {
        throw new TypeError2(`Unknown record type ${expr.name}`, span.start.line, span.start.column);
      }
      const paramSubst = new Map;
      const recType = supply.fresh();
      subst = compose(subst, unify(recType, prim(expr.name, ...tc.params.map((p) => {
        const v3 = supply.fresh();
        paramSubst.set(p, v3);
        return v3;
      })), span));
      const expectedFields = tc.fields.map((f) => ({
        name: f.name,
        type: applyTypeParams(f.type, paramSubst)
      }));
      for (const field of expr.fields) {
        const exp = checkExpr(env, field.value, supply);
        subst = compose(subst, exp.subst);
        const expected = expectedFields.find((f) => f.name === field.name);
        if (expected) {
          subst = compose(subst, unify(applySubst(subst, exp.type), expected.type, field.span));
        }
      }
      const resultType = prim(expr.name, ...tc.params.map((p) => paramSubst.get(p) ?? prim(p)));
      return { type: resultType, subst };
    }
    case "List": {
      const elemType = supply.fresh();
      for (const el of expr.elements) {
        const e = checkExpr(env, el, supply);
        subst = compose(subst, e.subst);
        subst = compose(subst, unify(applySubst(subst, e.type), elemType, el.span));
      }
      return { type: listOf(applySubst(subst, elemType)), subst };
    }
    case "Paren": {
      return checkExpr(env, expr.expr, supply);
    }
    case "Do": {
      return checkDoBlock(env, expr.block, supply);
    }
    case "Agent": {
      const agentType = typeSpecToMoon(expr.decl.type);
      return { type: agentType, subst };
    }
    case "Lambda": {
      const local = { ...env, values: new Map(env.values) };
      const params = expr.params.map(() => supply.fresh());
      for (let i = 0;i < expr.params.length; i++) {
        local.values.set(expr.params[i], { vars: [], type: params[i] });
      }
      const body = "statements" in expr.body ? checkDoBlock(local, expr.body, supply) : checkExpr(local, expr.body, supply);
      subst = compose(subst, body.subst);
      const lam = params.reduceRight((acc, p) => fn(p, acc), body.type);
      return { type: lam, subst };
    }
    case "If": {
      const cond = checkExpr(env, expr.condition, supply);
      const th = checkExpr(env, expr.thenBranch, supply);
      const el = checkExpr(env, expr.elseBranch, supply);
      subst = compose(subst, compose(cond.subst, compose(th.subst, el.subst)));
      subst = compose(subst, unify(cond.type, prim("Bool"), span));
      subst = compose(subst, unify(th.type, el.type, span));
      return { type: applySubst(subst, th.type), subst };
    }
    default:
      return { type: supply.fresh(), subst };
  }
}
function resolveMethod(env, objType, method, supply) {
  if (objType.kind !== "Con")
    return null;
  const tc = env.classes.get(objType.name);
  if (!tc)
    return null;
  const m = tc.methods.find((md) => md.name === method);
  if (!m)
    return null;
  return specializeMethod(instantiate(m.type, supply), objType);
}
function specializeMethod(methodType, objType) {
  if (methodType.kind !== "Arrow")
    return null;
  try {
    const subst = unify(methodType.from, objType);
    return applySubst(subst, methodType.to);
  } catch {
    return null;
  }
}
function checkDoBlock(env, block, supply) {
  let subst = new Map;
  const local = { ...env, values: new Map(env.values) };
  let lastType = prim("Unit");
  for (const stmt of block.statements) {
    const result = checkDoStmt(local, stmt, supply);
    subst = compose(subst, result.subst);
    lastType = applySubst(subst, result.type);
  }
  return { type: lastType, subst };
}
function checkDoStmt(env, stmt, supply) {
  let subst = new Map;
  switch (stmt.kind) {
    case "Let": {
      const expr = checkExpr(env, stmt.expr, supply);
      subst = compose(subst, expr.subst);
      bindPattern(env, stmt.pattern, applySubst(subst, expr.type));
      return { type: prim("Unit"), subst };
    }
    case "Bind": {
      const expr = checkExpr(env, stmt.expr, supply);
      subst = compose(subst, expr.subst);
      const inner = applySubst(subst, expr.type);
      if (inner.kind === "Con" && inner.name === "IO" && inner.args[0]) {
        bindPattern(env, stmt.pattern, inner.args[0]);
        return { type: prim("Unit"), subst };
      }
      const ret = supply.fresh();
      subst = compose(subst, unify(inner, io(ret), stmt.span));
      bindPattern(env, stmt.pattern, ret);
      return { type: prim("Unit"), subst };
    }
    case "Storm": {
      const input = checkExpr(env, stmt.input, supply);
      subst = compose(subst, input.subst);
      const ret = supply.fresh();
      bindPattern(env, stmt.pattern, ret);
      return { type: prim("Unit"), subst };
    }
    case "Action": {
      const expr = checkExpr(env, stmt.expr, supply);
      subst = compose(subst, expr.subst);
      const t = applySubst(subst, expr.type);
      if (t.kind === "Con" && t.name === "IO") {
        return { type: prim("Unit"), subst };
      }
      subst = compose(subst, unify(t, io(prim("Unit")), stmt.span));
      return { type: prim("Unit"), subst };
    }
  }
}
function registerFunctionSig(env, decl) {
  if (!decl.signature)
    return;
  env.values.set(decl.signature.name, typeSpecToScheme(decl.signature.type));
}

// ../typechecker/src/prelude.ts
var v3 = () => freshVar();
var a3 = () => v3();
var b = () => v3();
function buildPrelude() {
  const values = new Map;
  const classes = new Map;
  const scheme7 = (t) => ({ vars: [], type: t });
  const forall3 = (t) => {
    const vars = [];
    const collect = (mt) => {
      if (mt.kind === "Var")
        vars.push(mt.id);
      else if (mt.kind === "Con")
        mt.args.forEach(collect);
      else if (mt.kind === "Arrow") {
        collect(mt.from);
        collect(mt.to);
      } else if (mt.kind === "Record")
        mt.fields.forEach((f) => collect(f.type));
      else if (mt.kind === "Tuple")
        mt.elements.forEach(collect);
    };
    collect(t);
    return { vars: [...new Set(vars)], type: t };
  };
  for (const p of ["String", "Int", "Float", "Bool", "Code", "Documentation", "Requirements", "Entity", "Agent", "Scope", "Unit", "Verdict"]) {
    values.set(p, scheme7(prim(p)));
  }
  for (const e of ["Code", "Documentation", "Requirements"]) {
    values.set(e, scheme7(prim("Entity")));
  }
  for (const t of ["Finding", "Recommendation", "Suggestion", "Location", "Severity", "Category"]) {
    values.set(t, scheme7(prim(t, a3())));
  }
  const analyzeOutput2 = (t) => record("AnalyzeOutput", [
    { name: "findings", type: listOf(prim("Finding", t)) },
    { name: "summary", type: prim("String") },
    { name: "confidence", type: prim("Float") }
  ]);
  const analyzerMethod = {
    name: "analyze",
    type: forall3(fn(prim("Analyzer", a3()), fn(a3(), io(analyzeOutput2(a3())))))
  };
  classes.set("Analyzer", {
    name: "Analyzer",
    params: ["t"],
    methods: [analyzerMethod]
  });
  const reviewerMethod = {
    name: "analyze",
    type: forall3(fn(prim("Reviewer", a3()), fn(a3(), io(prim("ReviewResult", a3())))))
  };
  classes.set("Reviewer", {
    name: "Reviewer",
    params: ["t"],
    methods: [reviewerMethod]
  });
  values.set("not", scheme7(fn(prim("Bool"), prim("Bool"))));
  values.set("pure", forall3(fn(a3(), io(a3()))));
  values.set("map", forall3(fn(fn(a3(), b()), fn(listOf(a3()), listOf(b())))));
  values.set("$", forall3(fn(fn(a3(), b()), fn(a3(), b()))));
  values.set(">>=", forall3(fn(io(a3()), fn(fn(a3(), io(b())), io(b())))));
  values.set(".", forall3(fn(fn(b(), a3()), fn(fn(a3(), b()), fn(a3(), a3())))));
  return { values, classes };
}
// ../typechecker/src/index.ts
function typecheckProgram(program, options = {}) {
  resetVarSupply();
  const prelude = buildPrelude();
  const env = createEnv(prelude.values, prelude.classes);
  if (options.entryPath) {
    const entryPath = import_path3.resolve(options.entryPath);
    const projectRoot = options.projectRoot ?? import_path3.dirname(entryPath);
    const resolved = resolveImports(program, { entryPath, projectRoot });
    const importErrors = applyImportsToEnv(env.values, resolved);
    if (importErrors.length > 0) {
      return {
        ok: false,
        errors: importErrors.map((e) => new TypeError2(e.message, e.line, e.column)),
        env
      };
    }
  }
  return checkProgram(program, env);
}

// ../lsp/src/project.ts
var import_fs4 = require("fs");
var import_path5 = require("path");
var import_url = require("url");

// ../lsp/src/symbol-index.ts
var import_fs3 = require("fs");
var import_path4 = require("path");

// ../lsp/src/moon-docs.ts
function isSectionHeader(trimmed) {
  if (!trimmed.startsWith("--"))
    return false;
  const body = trimmed.slice(2).trim();
  return /^=+$/.test(body) || body.startsWith("===") || body.length === 0;
}
function extractMoonDocs(source, declLine) {
  const lines = source.split(/\r?\n/);
  const docLines = [];
  let i = declLine - 2;
  while (i >= 0) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();
    if (!trimmed) {
      if (docLines.length > 0)
        break;
      i--;
      continue;
    }
    if (trimmed.startsWith("--?")) {
      docLines.unshift(trimmed.slice(3).trim());
      i--;
      continue;
    }
    if (trimmed === "-- moon-doc" || trimmed.startsWith("-- moon-doc ")) {
      i--;
      while (i >= 0) {
        const block = lines[i]?.trim() ?? "";
        if (!block)
          break;
        if (block.startsWith("--")) {
          const text = block.slice(2).trim();
          if (text === "moon-doc" || isSectionHeader(block))
            break;
          docLines.unshift(text);
          i--;
          continue;
        }
        break;
      }
      break;
    }
    if (trimmed.startsWith("--") && !isSectionHeader(trimmed)) {
      docLines.unshift(trimmed.slice(2).trim());
      i--;
      continue;
    }
    break;
  }
  return docLines.length > 0 ? docLines.join(`
`) : undefined;
}
function formatHoverDocs(name, type, module2, docs) {
  const parts = [`**${name}**`, `\`\`\`moon
${type}
\`\`\``];
  if (module2)
    parts.push(`from \`${module2}\``);
  if (docs)
    parts.push(docs);
  return parts.join(`

`);
}

// ../lsp/src/symbol-index.ts
function formatScheme(scheme7) {
  return formatType(instantiate(scheme7, { fresh: freshVar }));
}
function formatTypeSpec(spec) {
  return formatScheme(typeSpecToScheme(spec));
}
function spanToRange(span, name) {
  const line = Math.max(0, span.start.line - 1);
  const character = Math.max(0, span.start.column - 1);
  return {
    start: { line, character },
    end: { line, character: character + name.length }
  };
}
function schemeType(schemes, name) {
  const scheme7 = schemes?.get(name);
  return scheme7 ? formatScheme(scheme7) : "?";
}
function indexProgram(program, source, filePath, moduleName, schemes) {
  const abs = import_path4.resolve(filePath);
  const entries = [];
  const push = (name, kind, span, type, docs) => {
    entries.push({
      name,
      kind,
      module: moduleName,
      type,
      file: abs,
      range: spanToRange(span, name),
      docs: docs ?? extractMoonDocs(source, span.start.line)
    });
  };
  for (const decl of program.declarations) {
    switch (decl.kind) {
      case "Model":
        push(decl.decl.name, "model", decl.span, `model ${decl.decl.name}`);
        for (const field of decl.decl.fields) {
          push(field.name, "type", field.span, formatTypeSpec(field.type));
        }
        break;
      case "Agent":
        push(decl.decl.name, "agent", decl.span, schemeType(schemes, decl.decl.name) || `agent ${decl.decl.name}`);
        break;
      case "Data":
        push(decl.decl.name, "data", decl.span, `data ${decl.decl.name}`);
        for (const ctor of decl.decl.constructors) {
          push(ctor.name, "constructor", ctor.span, ctor.name);
        }
        break;
      case "Function":
        if (decl.decl.signature) {
          push(decl.decl.signature.name, "function", decl.decl.signature.span, formatTypeSpec(decl.decl.signature.type));
        }
        for (const eq of decl.decl.equations) {
          if (decl.decl.signature?.name === eq.name)
            continue;
          push(eq.name, "function", eq.span, schemeType(schemes, eq.name));
        }
        break;
      default:
        break;
    }
  }
  return entries;
}
function findNameLine(lines, name) {
  const patterns = [
    new RegExp(`^${name}\\s*::`),
    new RegExp(`^${name}\\s*=`),
    new RegExp(`^data\\s+${name}\\b`),
    new RegExp(`^agent\\s+${name}\\b`),
    new RegExp(`^model\\s+${name}\\b`),
    new RegExp(`=\\s*${name}\\b`)
  ];
  for (let i = 0;i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (patterns.some((re) => re.test(trimmed)))
      return i;
  }
  return -1;
}
function indexFromSourceText(source, filePath, moduleName) {
  const schemes = coreModuleSchemes(moduleName);
  if (!schemes)
    return [];
  const abs = import_path4.resolve(filePath);
  const lines = source.split(/\r?\n/);
  const entries = [];
  for (const [name, scheme7] of schemes) {
    const lineIdx = findNameLine(lines, name);
    const line = Math.max(0, lineIdx);
    const raw = lineIdx >= 0 ? lines[lineIdx] : "";
    const col = Math.max(0, raw.indexOf(name));
    entries.push({
      name,
      kind: "function",
      module: moduleName,
      type: formatScheme(scheme7),
      file: abs,
      range: {
        start: { line, character: col },
        end: { line, character: col + name.length }
      },
      docs: lineIdx >= 0 ? extractMoonDocs(source, lineIdx + 1) : undefined
    });
  }
  for (let i = 0;i < lines.length; i++) {
    const dataMatch = lines[i].trim().match(/^data\s+(\w+)\s*=/);
    if (!dataMatch)
      continue;
    const typeName2 = dataMatch[1];
    if (entries.some((e) => e.name === typeName2))
      continue;
    entries.push({
      name: typeName2,
      kind: "data",
      module: moduleName,
      type: `data ${typeName2}`,
      file: abs,
      range: spanToRange({ start: { line: i + 1, column: lines[i].indexOf(typeName2) + 1, offset: 0 }, end: { line: i + 1, column: lines[i].indexOf(typeName2) + 1 + typeName2.length, offset: 0 } }, typeName2)
    });
    const ctorMatch = lines[i].match(/=\s*(\w+)/);
    if (ctorMatch && !entries.some((e) => e.name === ctorMatch[1])) {
      const ctor = ctorMatch[1];
      entries.push({
        name: ctor,
        kind: "constructor",
        module: moduleName,
        type: ctor,
        file: abs,
        range: spanToRange({ start: { line: i + 1, column: lines[i].indexOf(ctor) + 1, offset: 0 }, end: { line: i + 1, column: lines[i].indexOf(ctor) + 1 + ctor.length, offset: 0 } }, ctor)
      });
    }
  }
  return entries;
}
function indexMoonFile(filePath, moduleName) {
  const source = import_fs3.readFileSync(filePath, "utf-8");
  const schemes = coreModuleSchemes(moduleName) ?? undefined;
  try {
    const program = parse(source);
    return indexProgram(program, source, filePath, moduleName, schemes);
  } catch {
    return indexFromSourceText(source, filePath, moduleName);
  }
}
function indexStdlib() {
  const entries = [];
  for (const modulePath of allCoreModulePaths()) {
    const stdlibPath = resolveStdlibPath(modulePath.split("."));
    if (!stdlibPath || !import_fs3.existsSync(stdlibPath))
      continue;
    entries.push(...indexMoonFile(stdlibPath, modulePath));
  }
  return entries;
}
function indexPrelude() {
  const prelude = buildPrelude();
  const entries = [];
  for (const [name, scheme7] of prelude.values) {
    entries.push({
      name,
      kind: "type",
      module: "Moon.Prelude",
      type: formatScheme(scheme7),
      file: "",
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: name.length } },
      docs: "Moon prelude builtin"
    });
  }
  return entries;
}
function indexWorkspace(projectRoot) {
  const entries = [];
  const libDir = import_path4.join(projectRoot, "lib");
  if (!import_fs3.existsSync(libDir))
    return entries;
  for (const file of import_fs3.readdirSync(libDir).filter((f) => f.endsWith(".moon"))) {
    const filePath = import_path4.join(libDir, file);
    const moduleName = import_path4.basename(file, ".moon");
    entries.push(...indexMoonFile(filePath, moduleName));
  }
  return entries;
}
function buildSymbolIndex(projectRoot, extraFiles = []) {
  const seen = new Set;
  const out = [];
  const add = (entry) => {
    const key = `${entry.module}::${entry.name}::${entry.file}`;
    if (seen.has(key))
      return;
    seen.add(key);
    out.push(entry);
  };
  for (const entry of indexPrelude())
    add(entry);
  for (const entry of indexStdlib())
    add(entry);
  for (const entry of indexWorkspace(projectRoot))
    add(entry);
  for (const filePath of extraFiles) {
    if (!import_fs3.existsSync(filePath))
      continue;
    const source = import_fs3.readFileSync(filePath, "utf-8");
    const program = parse(source);
    const moduleName = import_path4.basename(filePath, ".moon");
    for (const entry of indexProgram(program, source, filePath, moduleName))
      add(entry);
  }
  return out.sort((a4, b2) => a4.name.localeCompare(b2.name) || a4.module.localeCompare(b2.module));
}

// ../lsp/src/project.ts
function wordAtPosition(text, line, character) {
  const lines = text.split(/\r?\n/);
  const row = lines[line];
  if (!row)
    return null;
  const before = row.slice(0, character);
  const after = row.slice(character);
  const left = before.match(/[A-Za-z0-9_.'-]*$/)?.[0] ?? "";
  const right = after.match(/^[A-Za-z0-9_.'-]*/)?.[0] ?? "";
  const word = left + right;
  return word.length > 0 ? word.replace(/\.$/, "") : null;
}
function formatScheme2(scheme7) {
  const inst = instantiate(scheme7, { fresh: freshVar });
  return formatType(inst);
}
function localDefinition(program, source, entryPath, name) {
  const abs = import_path5.resolve(entryPath);
  for (const entry of indexProgram(program, source, abs, import_path5.basename(entryPath, ".moon"))) {
    if (entry.name !== name)
      continue;
    return { uri: import_url.pathToFileURL(abs).href, range: entry.range };
  }
  return null;
}
function buildSymbolTable(program, entryPath, db, source) {
  const table = new Map;
  const prelude = buildPrelude();
  for (const [name, scheme7] of prelude.values) {
    const entry = db?.lookup(name, { module: "Moon.Prelude" });
    table.set(name, {
      name,
      type: formatScheme2(scheme7),
      module: "Moon.Prelude",
      docs: entry?.docs,
      range: entry?.range
    });
  }
  const projectRoot = import_path5.dirname(import_path5.resolve(entryPath));
  const resolved = resolveImports(program, { entryPath: import_path5.resolve(entryPath), projectRoot });
  for (const imp of resolved.imports) {
    for (const [name, scheme7] of imp.schemes) {
      const entry = db?.lookup(name, { module: imp.pathKey, file: imp.filePath });
      table.set(name, {
        name,
        type: formatScheme2(scheme7),
        module: imp.pathKey,
        filePath: imp.filePath,
        range: entry?.range,
        docs: entry?.docs
      });
    }
  }
  const abs = import_path5.resolve(entryPath);
  const src = source ?? (import_fs4.existsSync(abs) ? import_fs4.readFileSync(abs, "utf-8") : "");
  for (const entry of indexProgram(program, src, abs, import_path5.basename(entryPath, ".moon"))) {
    if (table.has(entry.name))
      continue;
    table.set(entry.name, {
      name: entry.name,
      type: entry.type,
      filePath: abs,
      range: entry.range,
      docs: entry.docs
    });
  }
  for (const decl of program.declarations) {
    if (decl.kind === "Function" && decl.decl.signature) {
      const existing = table.get(decl.decl.signature.name);
      if (!existing) {
        table.set(decl.decl.signature.name, {
          name: decl.decl.signature.name,
          type: formatScheme2(typeSpecToScheme(decl.decl.signature.type)),
          filePath: abs,
          range: spanToRange(decl.decl.signature.span, decl.decl.signature.name)
        });
      }
    }
    if (decl.kind === "Agent") {
      const existing = table.get(decl.decl.name);
      if (!existing) {
        table.set(decl.decl.name, {
          name: decl.decl.name,
          type: `agent ${decl.decl.name}`,
          filePath: abs,
          range: spanToRange(decl.span, decl.decl.name)
        });
      }
    }
    if (decl.kind === "Data") {
      for (const ctor of decl.decl.constructors) {
        if (!table.has(ctor.name)) {
          table.set(ctor.name, {
            name: ctor.name,
            type: ctor.name,
            filePath: abs,
            range: spanToRange(ctor.span, ctor.name)
          });
        }
      }
    }
  }
  return table;
}
function lookupSymbol(program, entryPath, name, db, source) {
  return buildSymbolTable(program, entryPath, db, source).get(name);
}
function definitionLocation(program, entryPath, name, db, source = "") {
  if (db) {
    const entry = db.lookupScoped(program, entryPath, name);
    if (entry) {
      const loc = db.toLocation(entry);
      if (loc)
        return loc;
    }
  }
  const info = lookupSymbol(program, entryPath, name, db, source);
  if (info?.filePath && info.range) {
    return { uri: import_url.pathToFileURL(import_path5.resolve(info.filePath)).href, range: info.range };
  }
  if (info?.filePath) {
    return {
      uri: import_url.pathToFileURL(import_path5.resolve(info.filePath)).href,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: name.length } }
    };
  }
  if (source) {
    const local = localDefinition(program, source, entryPath, name);
    if (local)
      return local;
  }
  for (const modulePath of allCoreModulePaths()) {
    const schemes = coreModuleSchemes(modulePath);
    if (!schemes?.has(name))
      continue;
    const stdlibPath = resolveStdlibPath(modulePath.split("."));
    if (!stdlibPath)
      continue;
    const entry = db?.lookup(name, { module: modulePath, file: stdlibPath });
    return {
      uri: import_url.pathToFileURL(import_path5.resolve(stdlibPath)).href,
      range: entry?.range ?? { start: { line: 0, character: 0 }, end: { line: 0, character: name.length } }
    };
  }
  return null;
}
function collectDiagnostics(entryPath, text) {
  try {
    const program = parse(text);
    const result = typecheckProgram(program, { entryPath, projectRoot: import_path5.dirname(import_path5.resolve(entryPath)) });
    return result.errors.map((e) => ({
      severity: 1,
      range: {
        start: { line: Math.max(0, e.line - 1), character: Math.max(0, e.column - 1) },
        end: { line: Math.max(0, e.line - 1), character: Math.max(0, e.column + 20) }
      },
      message: e.message,
      source: "moon"
    }));
  } catch (err) {
    if (err instanceof ParseError || err instanceof LexError) {
      return [{
        severity: 1,
        range: {
          start: { line: Math.max(0, err.line - 1), character: Math.max(0, err.column - 1) },
          end: { line: Math.max(0, err.line - 1), character: err.column + 10 }
        },
        message: err.message,
        source: "moon"
      }];
    }
    return [];
  }
}

// ../lsp/src/completion.ts
var import_fs5 = require("fs");
var import_path6 = require("path");
var CompletionItemKind = {
  Text: 1,
  Method: 2,
  Function: 3,
  Variable: 6,
  Class: 7,
  Module: 9,
  Property: 10,
  Value: 12,
  Keyword: 14,
  Snippet: 15,
  EnumMember: 13,
  File: 17,
  Folder: 18,
  Constant: 21,
  TypeParameter: 25
};
var DO_KEYWORDS = ["do", "let", "with", "storm", "pure", "when", "if", "then", "else", "not"];
var AGENT_CONFIG_KEYS = [
  "model",
  "temperature",
  "systemPrompt",
  "role",
  "focus",
  "style"
];
var BIND_CONFIG_KEYS = [
  "context",
  "focus",
  "maxTokens",
  "previousVersion",
  "filter",
  "temperature"
];
var STORM_CONFIG_KEYS = [
  "panel",
  "synthesizer",
  "rounds",
  "context"
];
var TYPE_NAMES = [
  "String",
  "Int",
  "Float",
  "Bool",
  "IO",
  "List",
  "Unit",
  "Code",
  "Documentation",
  "Requirements",
  "Entity",
  "Agent",
  "Scope",
  "Verdict",
  "Analyzer",
  "Reviewer",
  "LongTerm",
  "PullRequest",
  "ChangedFile"
];
var MODEL_NAMES = [
  "deepseek-v4-flash",
  "deepseek-v4-pro"
];
function prefixAtPosition(text, line, character) {
  const row = text.split(/\r?\n/)[line] ?? "";
  const before = row.slice(0, character);
  const match = before.match(/[A-Za-z0-9_.'-]*$/);
  return match?.[0] ?? "";
}
function detectCompletionContext(text, line, character) {
  const row = text.split(/\r?\n/)[line] ?? "";
  const before = row.slice(0, character);
  const prefix = prefixAtPosition(text, line, character);
  if (/\bimport\s+Core\.[\w.]*$/.test(before) || /\bimport\s+Core\.$/.test(before)) {
    return { kind: "import-core", prefix: prefix.replace(/^.*\./, "") };
  }
  if (/\bimport\s+[\w.]*$/.test(before)) {
    return { kind: "import", prefix };
  }
  const memberMatch = before.match(/([A-Za-z][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/);
  if (memberMatch) {
    return { kind: "member", prefix: memberMatch[2] ?? "", objectName: memberMatch[1] };
  }
  if (/\bwith\s*$/.test(before) || /^\s{4,}\w*:?\s*$/.test(before) && text.slice(0, offsetAt(text, line, character)).includes("with")) {
    const stormNearby = row.includes("storm") || linesBefore(text, line, 3).some((l) => l.includes("<- storm"));
    if (stormNearby)
      return { kind: "config", prefix };
    return { kind: "config", prefix };
  }
  if (isAgentConfigLine(text, line, before)) {
    return { kind: "agent-config", prefix };
  }
  if (/::\s*[\w.[\]]*$/.test(before)) {
    const typePrefix = before.match(/::\s*([\w.[\]]*)$/)?.[1] ?? "";
    return { kind: "type", prefix: typePrefix };
  }
  if (/^\s*$/.test(before) || /^\s*(main|agent|model|data)\b/.test(before)) {
    return { kind: "declaration", prefix };
  }
  if (/[A-Za-z0-9_.'-]*$/.test(before) && prefix.length > 0) {
    return { kind: "name", prefix };
  }
  return { kind: "expression", prefix };
}
function linesBefore(text, line, count) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let i = Math.max(0, line - count);i < line; i++) {
    out.push(lines[i] ?? "");
  }
  return out;
}
function isAgentConfigLine(text, line, before) {
  if (!/^\s+\w*:?\s*$/.test(before) && !/^\s+\w+[\w-]*$/.test(before))
    return false;
  const lines = text.split(/\r?\n/);
  for (let i = line;i >= Math.max(0, line - 20); i--) {
    if (/^\s*agent\s/.test(lines[i] ?? ""))
      return true;
    if (/^\s*(main|model|data|import)\b/.test(lines[i] ?? ""))
      return false;
  }
  return false;
}
function offsetAt(text, line, character) {
  const lines = text.split(/\r?\n/);
  let offset = 0;
  for (let i = 0;i < line; i++)
    offset += (lines[i]?.length ?? 0) + 1;
  return offset + character;
}
function matchesPrefix(label, prefix) {
  if (!prefix)
    return true;
  return label.toLowerCase().startsWith(prefix.toLowerCase());
}
function item(label, kind, opts = {}) {
  return { label, kind, ...opts };
}
function findProjectRoot2(entryPath) {
  let dir = import_path6.dirname(import_path6.resolve(entryPath));
  while (true) {
    if (import_fs5.existsSync(import_path6.join(dir, "Moonfile")) || import_fs5.existsSync(import_path6.join(dir, "Moonfile.moon")))
      return dir;
    const parent = import_path6.dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
  }
  return import_path6.dirname(import_path6.resolve(entryPath));
}
function listLocalModules(projectRoot) {
  const libDir = import_path6.join(projectRoot, "lib");
  if (!import_fs5.existsSync(libDir))
    return [];
  return import_fs5.readdirSync(libDir).filter((f) => f.endsWith(".moon")).map((f) => f.replace(/\.moon$/, ""));
}
function collectProgramNames(program, table, beforeLine) {
  const seen = new Set;
  const items = [];
  const add = (name, kind, detail, sort = "b") => {
    if (seen.has(name))
      return;
    seen.add(name);
    items.push(item(name, kind, { detail, sortText: `${sort}${name}` }));
  };
  for (const decl of program.declarations) {
    if (decl.kind === "Model") {
      add(decl.decl.name, CompletionItemKind.Class, "model");
    }
    if (decl.kind === "Agent") {
      add(decl.decl.name, CompletionItemKind.Class, "agent");
    }
    if (decl.kind === "Function" && decl.decl.signature) {
      add(decl.decl.signature.name, CompletionItemKind.Function, "function");
    }
    if (decl.kind === "Data") {
      add(decl.decl.name, CompletionItemKind.Class, "data type");
      for (const ctor of decl.decl.constructors) {
        add(ctor.name, CompletionItemKind.EnumMember, `constructor of ${decl.decl.name}`);
      }
    }
  }
  for (const [name, info] of table) {
    add(name, CompletionItemKind.Function, info.type, "c");
  }
  if (beforeLine !== undefined) {
    for (const local of collectLocalBindings(program, beforeLine)) {
      add(local, CompletionItemKind.Variable, "local binding", "a");
    }
  }
  return items;
}
function collectLocalBindings(program, beforeLine) {
  const locals = new Set;
  const bindPattern2 = (pat) => {
    if (pat.kind === "PVar")
      locals.add(pat.name);
  };
  const walkDo = (block) => {
    for (const stmt of block.statements) {
      if (stmt.span.start.line >= beforeLine)
        break;
      if (stmt.kind === "Let" || stmt.kind === "Bind" || stmt.kind === "Storm") {
        bindPattern2(stmt.pattern);
      }
      if (stmt.kind === "Let" || stmt.kind === "Bind" || stmt.kind === "Action" || stmt.kind === "Storm") {
        collectExprBindings(stmt, locals, beforeLine);
      }
    }
  };
  for (const decl of program.declarations) {
    if (decl.kind !== "Function")
      continue;
    for (const eq of decl.decl.equations) {
      for (const pat of eq.patterns) {
        if (pat.kind === "PVar")
          locals.add(pat.name);
      }
      if ("statements" in eq.body) {
        walkDo(eq.body);
      }
    }
  }
  return [...locals];
}
function collectExprBindings(stmt, locals, beforeLine) {
  if (stmt.span.start.line >= beforeLine)
    return;
}
function getCompletions(program, entryPath, text, line, character) {
  const ctx = detectCompletionContext(text, line, character);
  const projectRoot = findProjectRoot2(entryPath);
  const table = buildSymbolTable(program, entryPath);
  const agents = program.declarations.filter((d) => d.kind === "Agent").map((d) => d.decl.name);
  switch (ctx.kind) {
    case "import":
      return importCompletions(ctx.prefix, projectRoot);
    case "import-core":
      return coreSubmoduleCompletions(ctx.prefix);
    case "member":
      return memberCompletions(ctx.objectName ?? "", ctx.prefix, agents, table);
    case "config":
      return configCompletions(text, line, ctx.prefix);
    case "agent-config":
      return agentConfigCompletions(ctx.prefix);
    case "type":
      return typeCompletions(ctx.prefix);
    case "name":
      return nameCompletions(program, table, line, ctx.prefix, agents);
    case "declaration":
      return declarationCompletions();
    case "expression":
    default:
      return expressionCompletions(program, table, entryPath, line, ctx.prefix, agents);
  }
}
function nameCompletions(program, table, line, prefix, agents = []) {
  const items = collectProgramNames(program, table, line + 1).filter((i) => matchesPrefix(i.label, prefix));
  for (const kw of DO_KEYWORDS) {
    if (!matchesPrefix(kw, prefix))
      continue;
    if (kw === "storm") {
      items.push(item("storm", CompletionItemKind.Snippet, {
        insertText: "storm ${1:input}\n    with panel: [${2:AgentA}, ${3:AgentB}]\n         synthesizer: ${4:Synth}\n         rounds: ${5:2}",
        insertTextFormat: 2,
        detail: "brainstorm/debate panel",
        sortText: "0storm"
      }));
      continue;
    }
    items.push(item(kw, CompletionItemKind.Keyword, { sortText: `z${kw}` }));
  }
  for (const agent of agents) {
    if (!matchesPrefix(agent, prefix))
      continue;
    items.push(item(agent, CompletionItemKind.Class, {
      detail: "agent",
      insertText: `${agent}.analyze `,
      sortText: `aa${agent}`
    }));
  }
  return items;
}
function importCompletions(prefix, projectRoot) {
  const items = [];
  for (const path of allCoreModulePaths()) {
    if (!matchesPrefix(path, prefix))
      continue;
    items.push(item(path, CompletionItemKind.Module, {
      detail: "Core stdlib module",
      sortText: `a${path}`
    }));
  }
  items.push(item("Core", CompletionItemKind.Module, {
    detail: "Core stdlib namespace",
    insertText: "Core.",
    sortText: "aCore"
  }));
  for (const local of listLocalModules(projectRoot)) {
    if (!matchesPrefix(local, prefix))
      continue;
    items.push(item(local, CompletionItemKind.Module, {
      detail: "lib/ module",
      sortText: `al${local}`
    }));
  }
  return items;
}
function coreSubmoduleCompletions(prefix) {
  return allCoreModulePaths().map((p) => p.replace(/^Core\./, "")).filter((name) => matchesPrefix(name, prefix)).map((name) => item(name, CompletionItemKind.Module, {
    detail: `Core.${name}`,
    insertText: name,
    sortText: `a${name}`
  }));
}
function memberCompletions(objectName, prefix, agents, table) {
  if (agents.includes(objectName)) {
    if (matchesPrefix("analyze", prefix)) {
      return [item("analyze", CompletionItemKind.Method, {
        detail: "Agent.analyze input",
        documentation: "Run LLM analysis. Chain with `with` for context, focus, maxTokens.",
        insertText: "analyze ${1:input}\n    with context: ${2:ctx}\n         maxTokens: ${3:2000}",
        insertTextFormat: 2,
        sortText: "aanalyze"
      })];
    }
    return [];
  }
  const sym = table.get(objectName);
  if (sym?.type.includes("->")) {
    return [];
  }
  return [];
}
function configCompletions(text, line, prefix) {
  const isStorm = linesBefore(text, line, 6).some((l) => /<- storm\b/.test(l)) || (text.split(/\r?\n/)[line] ?? "").includes("storm");
  const keys = isStorm ? STORM_CONFIG_KEYS : BIND_CONFIG_KEYS;
  return keys.filter((k) => matchesPrefix(k, prefix)).map((k) => item(k, CompletionItemKind.Property, {
    detail: isStorm ? "storm config" : "bind/action config",
    insertText: `${k}: `,
    sortText: `a${k}`
  }));
}
function agentConfigCompletions(prefix) {
  const items = AGENT_CONFIG_KEYS.filter((k) => matchesPrefix(k, prefix)).map((k) => item(k, CompletionItemKind.Property, {
    detail: "agent config",
    insertText: k === "systemPrompt" ? `systemPrompt: """
$0
"""` : k === "focus" ? 'focus: ["$0"]' : k === "model" ? "model: deepseek-v4-pro" : `${k}: `,
    insertTextFormat: k === "systemPrompt" || k === "focus" ? 2 : 1,
    sortText: `a${k}`
  }));
  for (const model of MODEL_NAMES) {
    if (matchesPrefix(model, prefix)) {
      items.push(item(model, CompletionItemKind.Constant, {
        detail: "LLM model",
        sortText: `b${model}`
      }));
    }
  }
  return items;
}
function typeCompletions(prefix) {
  return TYPE_NAMES.filter((t) => matchesPrefix(t, prefix)).map((t) => item(t, CompletionItemKind.Class, {
    sortText: `a${t}`
  }));
}
function declarationCompletions() {
  return [
    item("import", CompletionItemKind.Keyword, {
      insertText: "import Core.${1:GitHub}",
      insertTextFormat: 2,
      sortText: "aimport"
    }),
    item("model", CompletionItemKind.Snippet, {
      insertText: "model ${1:Name} where\n    ${2:field} :: ${3:String}",
      insertTextFormat: 2,
      detail: "model declaration",
      sortText: "amodel"
    }),
    item("agent", CompletionItemKind.Snippet, {
      insertText: `agent \${1:Name} :: \${2:Analyzer} \${3:Code}
  model: deepseek-v4-pro
  systemPrompt: """
  $0
  """`,
      insertTextFormat: 2,
      detail: "agent declaration",
      sortText: "aagent"
    }),
    item("main", CompletionItemKind.Snippet, {
      insertText: `main :: IO ()
main = do
    $0`,
      insertTextFormat: 2,
      sortText: "amain"
    }),
    item("data", CompletionItemKind.Keyword, { sortText: "adata" })
  ];
}
function expressionCompletions(program, table, _entryPath, line, prefix, agents) {
  return nameCompletions(program, table, line, prefix, agents);
}
function getPartialCompletions(text, entryPath, line, character) {
  const ctx = detectCompletionContext(text, line, character);
  const projectRoot = findProjectRoot2(entryPath);
  switch (ctx.kind) {
    case "import":
      return importCompletions(ctx.prefix, projectRoot);
    case "import-core":
      return coreSubmoduleCompletions(ctx.prefix);
    case "member":
      return memberCompletions(ctx.objectName ?? "", ctx.prefix, [], new Map);
    case "config":
      return configCompletions(text, line, ctx.prefix);
    case "agent-config":
      return agentConfigCompletions(ctx.prefix);
    case "type":
      return typeCompletions(ctx.prefix);
    case "declaration":
      return declarationCompletions();
    case "name":
    case "expression":
    default: {
      const items = declarationCompletions();
      for (const kw of DO_KEYWORDS) {
        if (!matchesPrefix(kw, ctx.prefix))
          continue;
        items.push(item(kw, CompletionItemKind.Keyword, { sortText: `z${kw}` }));
      }
      for (const path of allCoreModulePaths()) {
        if (!matchesPrefix(path, ctx.prefix))
          continue;
        items.push(item(path, CompletionItemKind.Module, {
          detail: "Core stdlib (import required)",
          sortText: `y${path}`
        }));
      }
      return items;
    }
  }
}
function getSignatureHelp(program, text, line, character) {
  const row = text.split(/\r?\n/)[line] ?? "";
  const before = row.slice(0, character);
  if (!/\.analyze\b/.test(before) && !/\banalyze\s/.test(before) && !/\banalyze$/.test(before)) {
    return null;
  }
  return {
    activeSignature: 0,
    signatures: [{
      label: "analyze input with context: ctx maxTokens: n focus: [...]",
      documentation: "Agent LLM call. Config keys: context, focus, maxTokens, previousVersion, temperature, filter."
    }]
  };
}

// ../lsp/src/code-actions.ts
function moduleForSymbol(name) {
  for (const modulePath of allCoreModulePaths()) {
    const schemes = coreModuleSchemes(modulePath);
    if (schemes?.has(name))
      return modulePath;
  }
  return null;
}
function existingImports(program) {
  const out = new Set;
  for (const decl of program.declarations) {
    if (decl.kind === "Import")
      out.add(decl.path.join("."));
  }
  return out;
}
function firstImportLine(program) {
  for (const decl of program.declarations) {
    if (decl.kind === "Import")
      return decl.span.start.line - 1;
  }
  return 0;
}
function similarNames(name, candidates) {
  const lower = name.toLowerCase();
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(lower, c.toLowerCase());
    if (dist < bestDist && dist <= 2 && dist > 0) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}
function levenshtein(a4, b2) {
  const dp = Array.from({ length: a4.length + 1 }, () => Array(b2.length + 1).fill(0));
  for (let i = 0;i <= a4.length; i++)
    dp[i][0] = i;
  for (let j = 0;j <= b2.length; j++)
    dp[0][j] = j;
  for (let i = 1;i <= a4.length; i++) {
    for (let j = 1;j <= b2.length; j++) {
      const cost = a4[i - 1] === b2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a4.length][b2.length];
}
function getCodeActions(program, entryPath, text, diagnostic) {
  const actions = [];
  const imports = existingImports(program);
  const table = buildSymbolTable(program, entryPath);
  const allNames = [...table.keys()];
  const unknownVar = diagnostic.message.match(/^Unknown variable (.+)$/);
  if (unknownVar) {
    const name = unknownVar[1];
    const modulePath = moduleForSymbol(name);
    if (modulePath && !imports.has(modulePath)) {
      const line = firstImportLine(program);
      const lastImport = [...program.declarations].reverse().find((d) => d.kind === "Import");
      const insertLine = lastImport ? lastImport.span.end.line : line;
      actions.push({
        title: `Import ${modulePath}`,
        kind: "quickfix",
        isPreferred: true,
        edit: {
          range: {
            start: { line: insertLine, character: 0 },
            end: { line: insertLine, character: 0 }
          },
          newText: `import ${modulePath}
`
        }
      });
    }
    const suggestion = similarNames(name, allNames);
    if (suggestion) {
      actions.push({
        title: `Use '${suggestion}' instead`,
        kind: "quickfix",
        edit: {
          range: diagnostic.range,
          newText: suggestion
        }
      });
    }
  }
  const unknownCtor = diagnostic.message.match(/^Unknown constructor (.+)$/);
  if (unknownCtor) {
    const name = unknownCtor[1];
    const suggestion = similarNames(name, allNames);
    if (suggestion) {
      actions.push({
        title: `Use constructor '${suggestion}'`,
        kind: "quickfix",
        edit: {
          range: diagnostic.range,
          newText: suggestion
        }
      });
    }
  }
  const missingDep = diagnostic.message.match(/^Module (.+) is imported but not listed in Moonfile dependencies$/);
  if (missingDep) {
    actions.push({
      title: `Add '${missingDep[1]}' to Moonfile dependencies`,
      kind: "quickfix",
      edit: {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        newText: ""
      }
    });
  }
  const unknownCore = diagnostic.message.match(/^Unknown Core module: (.+)$/);
  if (unknownCore) {
    const bad = unknownCore[1];
    const suggestion = similarNames(bad.replace(/^Core\./, ""), allCoreModulePaths());
    if (suggestion) {
      actions.push({
        title: `Change import to '${suggestion}'`,
        kind: "quickfix",
        isPreferred: true,
        edit: {
          range: diagnostic.range,
          newText: `import ${suggestion}`
        }
      });
    }
  }
  const unresolvedLocal = diagnostic.message.match(/^Cannot resolve local module: (.+)$/);
  if (unresolvedLocal) {
    const projectRoot = findProjectRoot2(entryPath);
    const locals = listLocalModules(projectRoot);
    const suggestion = similarNames(unresolvedLocal[1], locals);
    if (suggestion) {
      actions.push({
        title: `Import local module '${suggestion}'`,
        kind: "quickfix",
        edit: {
          range: diagnostic.range,
          newText: `import ${suggestion}`
        }
      });
    }
  }
  if (/^Unexpected character/.test(diagnostic.message) && text.includes('"""')) {
    actions.push({
      title: 'Use triple-quoted string (""")',
      kind: "quickfix",
      edit: {
        range: diagnostic.range,
        newText: '"""'
      }
    });
  }
  return actions;
}

// ../prompt/src/index.ts
function assemblePrompt(req) {
  const systemParts = [];
  if (req.systemPrompt)
    systemParts.push(req.systemPrompt);
  if (req.role)
    systemParts.push(`Role: ${req.role}`);
  if (req.focus?.length) {
    systemParts.push(`Focus on: ${req.focus.join(", ")}`);
  }
  systemParts.push(req.systemSuffix ?? "Respond with JSON only matching the provided schema.");
  const userParts = ["## Input", serializeBlock(req.input)];
  if (req.config.context !== undefined) {
    userParts.push("## Project context", serializeBlock(req.config.context));
  }
  if (req.config.previousVersion !== undefined) {
    userParts.push("## Previous version", serializeBlock(req.config.previousVersion));
  }
  if (req.peerOutputs?.length) {
    userParts.push("## Peer perspectives");
    for (const peer of req.peerOutputs) {
      userParts.push(`### ${peer.agent}`, peer.summary);
    }
  }
  if (req.delegateFrom) {
    userParts.push(`## Delegated from ${req.delegateFrom}`, serializeBlock(req.config.delegated_input ?? req.config.context));
  }
  const extra = { ...req.config };
  delete extra.context;
  delete extra.previousVersion;
  delete extra.delegated_input;
  delete extra.focus;
  delete extra.maxTokens;
  delete extra.temperature;
  if (Object.keys(extra).length > 0) {
    userParts.push("## Additional config", serializeBlock(extra));
  }
  const temperature = typeof req.config.temperature === "number" ? req.config.temperature : 0.25;
  const maxTokens = typeof req.config.maxTokens === "number" ? req.config.maxTokens : undefined;
  return {
    messages: [
      { role: "system", content: systemParts.join(`

`) },
      { role: "user", content: userParts.join(`

`) }
    ],
    temperature,
    maxTokens
  };
}
function serializeBlock(value) {
  if (typeof value === "string")
    return value;
  return JSON.stringify(value, null, 2);
}

// ../schema-compiler/src/compile.ts
function compileSchemas(program) {
  const schemas = {};
  const warnings = [];
  for (const decl of program.declarations) {
    if (decl.kind === "Model") {
      schemas[decl.decl.name] = compileModel(decl.decl, warnings);
    } else if (decl.kind === "Data") {
      compileData(decl.decl, schemas, warnings);
    }
  }
  return { schemas, warnings };
}
function compileData(decl, schemas, warnings) {
  const nullary = decl.constructors.filter((c) => !c.args || c.args.kind === "Positional" && c.args.types.length === 0);
  if (nullary.length > 0 && decl.constructors.every((c) => !c.args || c.args.kind !== "Record")) {
    schemas[decl.name] = {
      enum: nullary.map((c) => c.name)
    };
  }
  for (const con of decl.constructors) {
    if (con.args?.kind === "Record") {
      schemas[con.name] = compileRecordFields(con.name, con.args.fields, warnings);
    }
  }
}
function compileModel(decl, warnings) {
  return compileRecordFields(decl.name, decl.fields, warnings);
}
function compileRecordFields(name, fields, warnings) {
  const properties = {};
  const required = [];
  for (const field of fields) {
    const modifiers = "modifiers" in field ? field.modifiers : [];
    const optional = modifiers.some((m) => m.kind === "Optional");
    let schema = compileType(field.type);
    for (const mod of modifiers) {
      if (mod.kind === "Constraint") {
        schema = applyConstraint(schema, mod.expr, warnings, mod.span.start.line, mod.span.start.column);
      }
    }
    properties[field.name] = schema;
    if (!optional) {
      required.push(field.name);
    }
  }
  return {
    type: "object",
    description: name,
    properties,
    required
  };
}
function compileType(spec) {
  switch (spec.kind) {
    case "Var":
      return typeNameToSchema(spec.name);
    case "List":
      return { type: "array", items: compileType(spec.element) };
    case "Con":
      if (spec.args.length === 0) {
        return typeNameToSchema(spec.name);
      }
      return {
        type: "object",
        description: `${spec.name} ${spec.args.map((a4) => typeLabel(a4)).join(" ")}`,
        properties: {},
        required: []
      };
    case "Tuple":
      return {
        type: "array",
        items: { enum: spec.elements.map((_, i) => String(i)) },
        description: `tuple(${spec.elements.map(typeLabel).join(", ")})`
      };
    case "Arrow":
      return { description: `${typeLabel(spec.from)} -> ${typeLabel(spec.to)}` };
  }
}
function typeLabel(spec) {
  switch (spec.kind) {
    case "Var":
      return spec.name;
    case "List":
      return `[${typeLabel(spec.element)}]`;
    case "Con":
      return spec.args.length === 0 ? spec.name : `${spec.name} ${spec.args.map(typeLabel).join(" ")}`;
    case "Tuple":
      return `(${spec.elements.map(typeLabel).join(", ")})`;
    case "Arrow":
      return `${typeLabel(spec.from)} -> ${typeLabel(spec.to)}`;
  }
}
function typeNameToSchema(name) {
  switch (name) {
    case "String":
      return { type: "string" };
    case "Int":
      return { type: "integer" };
    case "Float":
      return { type: "number" };
    case "Bool":
      return { type: "boolean" };
    default:
      return { description: name };
  }
}
function applyConstraint(schema, expr, warnings, line, column) {
  const between = parseBetweenConstraint(expr);
  if (between) {
    return { ...schema, minimum: between.min, maximum: between.max };
  }
  const length = parseLengthConstraint(expr);
  if (length !== null) {
    if (schema.type === "string") {
      return { ...schema, maxLength: length };
    }
    if (schema.type === "array") {
      return { ...schema, maxItems: length };
    }
    return { ...schema, maxItems: length };
  }
  warnings.push({ message: `Unrecognized constraint: ${exprToString(expr)}`, line, column });
  return schema;
}
function parseBetweenConstraint(expr) {
  if (expr.kind !== "App" || expr.arg.kind !== "Lit")
    return null;
  const inner = expr.func;
  if (inner.kind !== "App" || inner.func.kind !== "Var" || inner.func.name !== "between")
    return null;
  if (inner.arg.kind !== "Lit")
    return null;
  const min = literalNumber(inner.arg);
  const max = literalNumber(expr.arg);
  if (min === null || max === null)
    return null;
  return { min, max };
}
function parseLengthConstraint(expr) {
  if (expr.kind !== "Infix" || expr.op !== "<=")
    return null;
  if (expr.left.kind !== "Var" || expr.left.name !== "length")
    return null;
  if (expr.right.kind !== "Lit")
    return null;
  return literalNumber(expr.right);
}
function literalNumber(expr) {
  if (expr.kind !== "Lit")
    return null;
  if (expr.value.kind === "Int" || expr.value.kind === "Float")
    return expr.value.value;
  return null;
}
function exprToString(expr) {
  switch (expr.kind) {
    case "Var":
      return expr.name;
    case "Lit":
      return JSON.stringify(expr.value.kind === "String" ? expr.value.value : expr.value.value);
    case "App":
      return `${exprToString(expr.func)} ${exprToString(expr.arg)}`;
    case "Infix":
      return `${exprToString(expr.left)} ${expr.op} ${exprToString(expr.right)}`;
    default:
      return expr.kind;
  }
}
// ../lsp/src/prompt-preview.ts
var ANALYZE_SCHEMA = {
  type: "object",
  properties: {
    findings: { type: "array", items: { type: "object" } },
    summary: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 }
  },
  required: ["findings", "summary", "confidence"]
};
function findPromptSites(program) {
  const sites = [];
  for (const decl of program.declarations) {
    if (decl.kind !== "Function")
      continue;
    for (const eq of decl.decl.equations) {
      if (!("statements" in eq.body))
        continue;
      for (const stmt of eq.body.statements) {
        if (stmt.kind === "Bind") {
          const call = findAnalyzeCall(stmt.expr);
          if (call) {
            sites.push({
              line: stmt.span.start.line - 1,
              endLine: stmt.span.end.line - 1,
              kind: "analyze",
              agent: call.agent,
              title: `Preview prompt: ${call.agent}`
            });
          }
        }
        if (stmt.kind === "Storm") {
          const synthesizer = configString(stmt.config, "synthesizer") ?? "Synthesizer";
          sites.push({
            line: stmt.span.start.line - 1,
            endLine: stmt.span.end.line - 1,
            kind: "storm",
            agent: synthesizer,
            title: `Preview storm: ${synthesizer}`
          });
        }
      }
    }
  }
  return sites;
}
function findAnalyzeCall(expr) {
  if (expr.kind === "App" && expr.func.kind === "FieldAccess" && expr.func.field === "analyze") {
    const agent = exprToName(expr.func.object);
    if (!agent)
      return null;
    return { agent, input: exprToPlaceholder(expr.arg) };
  }
  if (expr.kind === "FieldAccess" && expr.field === "analyze") {
    const agent = exprToName(expr.object);
    if (!agent)
      return null;
    return { agent, input: "<input>" };
  }
  return null;
}
function exprToName(expr) {
  if (expr.kind === "Var")
    return expr.name;
  if (expr.kind === "Paren")
    return exprToName(expr.expr);
  return null;
}
function exprToPlaceholder(expr) {
  if (expr.kind === "Lit") {
    if (expr.value.kind === "String")
      return expr.value.value;
    if (expr.value.kind === "Int" || expr.value.kind === "Float")
      return expr.value.value;
    if (expr.value.kind === "Bool")
      return expr.value.value;
  }
  if (expr.kind === "Var")
    return `<${expr.name}>`;
  if (expr.kind === "List") {
    return expr.elements.map(exprToPlaceholder);
  }
  if (expr.kind === "Record") {
    const obj = { _type: expr.name };
    for (const f of expr.fields)
      obj[f.name] = exprToPlaceholder(f.value);
    return obj;
  }
  return "<expr>";
}
function configValues(config) {
  const out = {};
  for (const item2 of config) {
    out[item2.key] = exprToPlaceholder(item2.value);
  }
  return out;
}
function configString(config, key) {
  const item2 = config.find((c) => c.key === key);
  if (!item2)
    return null;
  if (item2.value.kind === "Var")
    return item2.value.name;
  if (item2.value.kind === "Lit" && item2.value.value.kind === "String") {
    return item2.value.value.value;
  }
  return null;
}
function collectAgents(program) {
  const agents = new Map;
  for (const decl of program.declarations) {
    if (decl.kind === "Agent")
      agents.set(decl.decl.name, decl.decl);
  }
  return agents;
}
function agentModel(agent) {
  for (const item2 of agent.config) {
    if (item2.key === "model" && item2.value.kind === "Lit" && item2.value.value.kind === "String") {
      return item2.value.value.value;
    }
  }
  return "deepseek-v4-pro";
}
function agentSystemPrompt(agent) {
  for (const item2 of agent.config) {
    if (item2.key === "systemPrompt" && item2.value.kind === "Lit" && item2.value.value.kind === "String") {
      return item2.value.value.value;
    }
  }
  return;
}
function agentRole(agent) {
  for (const item2 of agent.config) {
    if (item2.key === "role" && item2.value.kind === "Lit" && item2.value.value.kind === "String") {
      return item2.value.value.value;
    }
  }
  return;
}
function agentFocus(agent) {
  for (const item2 of agent.config) {
    if (item2.key === "focus" && item2.value.kind === "List") {
      const out = [];
      for (const el of item2.value.elements) {
        if (el.kind === "Lit" && el.value.kind === "String")
          out.push(el.value.value);
      }
      return out.length ? out : undefined;
    }
  }
  return;
}
function schemaForAgent(agent, schemas) {
  if (agent.type.kind === "Con" && agent.type.name === "Reviewer") {
    return schemas.ReviewResult ?? ANALYZE_SCHEMA;
  }
  return ANALYZE_SCHEMA;
}
function buildPromptPreview(program, line) {
  const sites = findPromptSites(program);
  const site = sites.find((s) => s.line === line);
  if (!site)
    return null;
  const agents = collectAgents(program);
  const schemas = compileSchemas(program).schemas;
  if (site.kind === "storm") {
    return buildStormPreview(program, site, agents, schemas);
  }
  return buildAnalyzePreview(program, site, agents, schemas);
}
function buildAnalyzePreview(program, site, agents, schemas) {
  const agent = agents.get(site.agent);
  if (!agent)
    return null;
  const bind2 = findBindAtLine(program, site.line);
  if (!bind2)
    return null;
  const call = findAnalyzeCall(bind2.expr);
  if (!call)
    return null;
  const config = configValues(bind2.config);
  const bindFocus = Array.isArray(config.focus) ? config.focus : undefined;
  const assembled = assemblePrompt({
    agent: site.agent,
    model: agentModel(agent),
    systemPrompt: agentSystemPrompt(agent),
    role: agentRole(agent),
    focus: agentFocus(agent) ?? bindFocus,
    input: call.input,
    config,
    schema: schemaForAgent(agent, schemas)
  });
  return {
    site,
    assembled,
    markdown: formatPreviewMarkdown(site, assembled)
  };
}
function buildStormPreview(program, site, agents, schemas) {
  const storm = findStormAtLine(program, site.line);
  if (!storm)
    return null;
  const config = configValues(storm.config);
  const synthesizerName = configString(storm.config, "synthesizer") ?? site.agent;
  const agent = agents.get(synthesizerName);
  if (!agent)
    return null;
  const panel = Array.isArray(config.panel) ? config.panel : [];
  const rounds = typeof config.rounds === "number" ? config.rounds : 1;
  const assembled = assemblePrompt({
    agent: synthesizerName,
    model: agentModel(agent),
    systemPrompt: agentSystemPrompt(agent),
    role: agentRole(agent),
    focus: agentFocus(agent),
    input: exprToPlaceholder(storm.input),
    config,
    schema: schemaForAgent(agent, schemas),
    peerOutputs: panel.map((name) => ({
      agent: String(name),
      summary: "<peer output after panel round>"
    }))
  });
  const stormNote = [
    `**Storm panel:** ${panel.join(", ") || "(none)"}`,
    `**Rounds:** ${rounds}`,
    ""
  ].join(`
`);
  return {
    site,
    assembled,
    markdown: stormNote + formatPreviewMarkdown(site, assembled)
  };
}
function findBindAtLine(program, line) {
  for (const decl of program.declarations) {
    if (decl.kind !== "Function")
      continue;
    for (const eq of decl.decl.equations) {
      if (!("statements" in eq.body))
        continue;
      for (const stmt of eq.body.statements) {
        if (stmt.kind === "Bind" && stmt.span.start.line - 1 === line) {
          return stmt;
        }
      }
    }
  }
  return null;
}
function findStormAtLine(program, line) {
  for (const decl of program.declarations) {
    if (decl.kind !== "Function")
      continue;
    for (const eq of decl.decl.equations) {
      if (!("statements" in eq.body))
        continue;
      for (const stmt of eq.body.statements) {
        if (stmt.kind === "Storm" && stmt.span.start.line - 1 === line) {
          return stmt;
        }
      }
    }
  }
  return null;
}
function formatPreviewMarkdown(site, assembled) {
  const parts = [
    `# ${site.title}`,
    "",
    `**Temperature:** ${assembled.temperature}${assembled.maxTokens ? ` · max ${assembled.maxTokens} tokens` : ""}`,
    ""
  ];
  for (const msg of assembled.messages) {
    parts.push(`## ${msg.role.toUpperCase()}`, "", "```", msg.content, "```", "");
  }
  return parts.join(`
`);
}

// ../lsp/src/symbol-db.ts
var import_fs6 = require("fs");
var import_path7 = require("path");
var import_url2 = require("url");
var DB_FILENAME = "moon-symbols.json";

class SymbolDatabase {
  entries = [];
  byName = new Map;
  projectRoot = "";
  get symbols() {
    return this.entries;
  }
  get root() {
    return this.projectRoot;
  }
  static dbPath(projectRoot) {
    return import_path7.join(import_path7.resolve(projectRoot), DB_FILENAME);
  }
  load(projectRoot) {
    this.projectRoot = import_path7.resolve(projectRoot);
    const path = SymbolDatabase.dbPath(this.projectRoot);
    if (!import_fs6.existsSync(path))
      return false;
    try {
      const data = JSON.parse(import_fs6.readFileSync(path, "utf-8"));
      if (data.version !== 1 || !Array.isArray(data.symbols))
        return false;
      this.setEntries(data.symbols);
      return true;
    } catch {
      return false;
    }
  }
  save(projectRoot) {
    if (projectRoot)
      this.projectRoot = import_path7.resolve(projectRoot);
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      projectRoot: this.projectRoot,
      symbols: this.entries
    };
    import_fs6.writeFileSync(SymbolDatabase.dbPath(this.projectRoot), `${JSON.stringify(payload, null, 2)}
`, "utf-8");
  }
  rebuild(projectRoot, openFiles = []) {
    this.projectRoot = import_path7.resolve(projectRoot);
    this.setEntries(buildSymbolIndex(this.projectRoot, openFiles));
    this.save();
  }
  refreshFile(filePath) {
    const abs = import_path7.resolve(filePath);
    this.entries = this.entries.filter((e) => e.file !== abs);
    if (!import_fs6.existsSync(abs)) {
      this.reindex();
      return;
    }
    const source = import_fs6.readFileSync(abs, "utf-8");
    const program = parse(source);
    const moduleName = import_path7.basename(abs, ".moon");
    this.merge(indexProgram(program, source, abs, moduleName));
  }
  reindex(openFiles = []) {
    if (!this.projectRoot)
      return;
    this.setEntries(buildSymbolIndex(this.projectRoot, openFiles));
  }
  merge(entries) {
    const key = (e) => `${e.module}::${e.name}::${e.file}`;
    const map = new Map(this.entries.map((e) => [key(e), e]));
    for (const entry of entries)
      map.set(key(entry), entry);
    this.setEntries([...map.values()]);
  }
  setEntries(entries) {
    this.entries = entries;
    this.byName.clear();
    for (const entry of entries) {
      const bucket = this.byName.get(entry.name) ?? [];
      bucket.push(entry);
      this.byName.set(entry.name, bucket);
    }
  }
  lookup(name, hint) {
    const bucket = this.byName.get(name);
    if (!bucket?.length)
      return;
    if (hint?.file) {
      const abs = import_path7.resolve(hint.file);
      const inFile = bucket.find((e) => e.file === abs);
      if (inFile)
        return inFile;
    }
    if (hint?.module) {
      const inModule = bucket.find((e) => e.module === hint.module);
      if (inModule)
        return inModule;
    }
    return bucket[0];
  }
  lookupScoped(program, entryPath, name) {
    const table = buildSymbolTable(program, entryPath);
    const info = table.get(name);
    if (!info)
      return this.lookup(name);
    const fromDb = this.lookup(name, { module: info.module, file: info.filePath ?? entryPath });
    if (fromDb)
      return fromDb;
    return this.lookup(name, { file: info.filePath ?? entryPath }) ?? this.lookup(name);
  }
  toLocation(entry) {
    if (!entry.file)
      return null;
    return {
      uri: import_url2.pathToFileURL(import_path7.resolve(entry.file)).href,
      range: entry.range
    };
  }
}
function findProjectRootFromPath(entryPath) {
  let dir = import_path7.resolve(entryPath);
  if (import_path7.basename(entryPath).endsWith(".moon"))
    dir = import_path7.dirname(dir);
  while (true) {
    if (import_fs6.existsSync(import_path7.join(dir, "Moonfile")) || import_fs6.existsSync(import_path7.join(dir, "Moonfile.moon")))
      return dir;
    const parent = import_path7.dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
  }
  return import_path7.dirname(import_path7.resolve(entryPath));
}

// ../lsp/src/moonfile-lsp.ts
var import_fs8 = require("fs");
var import_path9 = require("path");

// ../lsp/src/moonfile-docs.ts
var MOONFILE_SECTION_DOCS = {
  package: "Unique package name for the Moon project manifest.",
  dependencies: "Core stdlib modules imported by project targets (`Core.GitHub`, `Core.FS`, …).",
  targets: "Named runnable/buildable entrypoints mapped to `.moon` source files.",
  providers: "LLM provider credentials and wire format (`deepseek` block).",
  paths: "Project-relative asset paths (pricing table, tokenizer bundle).",
  models: "Default flash/pro model ids used when agents do not override `model:`.",
  prompts: "Global prompt suffixes, trace defaults, and storm panel settings.",
  runtime: "Worker pool sizing, long-term memory backend URI, retry policy."
};
var MOONFILE_KEY_DOCS = {
  "providers.deepseek.api_key": 'API key via `env("VAR")`. Literal `sk-…` keys are rejected.',
  "providers.deepseek.base_url": 'Provider base URL or `env("VAR")` (anthropic/openai endpoints).',
  "providers.deepseek.api_format": "Transport format: `openai` or `anthropic` (default anthropic).",
  "providers.deepseek.use_beta": "When `true`, use DeepSeek beta OpenAI-compatible surface.",
  "paths.pricing": "Path to `model-pricing.json` for token cost estimation.",
  "paths.tokenizer": "Directory with DeepSeek tokenizer assets.",
  "models.default_flash": "Default flash-tier model id (high concurrency workers).",
  "models.default_pro": "Default pro-tier model id (lower concurrency, higher quality).",
  "prompts.default_system_suffix": "Appended to every agent system prompt unless overridden.",
  "prompts.trace_by_default": "When `true`, LLM traces are written for each run by default.",
  "prompts.storm.default_rounds": "Default debate rounds for `storm` binds.",
  "prompts.storm.max_panel_size": "Maximum agents in a storm panel.",
  "runtime.worker_pool.flash_concurrency": "Concurrent flash-tier LLM calls.",
  "runtime.worker_pool.pro_concurrency": "Concurrent pro-tier LLM calls.",
  "runtime.memory.long_term_backend": "Long-term memory URI, e.g. `file://.moon/memory`.",
  "runtime.retries.max_repair_attempts": "JSON repair retries after schema validation failures."
};
function moonfileDocId(section, nested, key) {
  if (section === "providers" && nested)
    return `${section}.${nested}.${key}`;
  if (section === "prompts" && nested)
    return `${section}.${nested}.${key}`;
  if (section === "runtime" && nested)
    return `${section}.${nested}.${key}`;
  if (section)
    return `${section}.${key}`;
  return key;
}
function lookupMoonfileDoc(section, nested, key) {
  return MOONFILE_KEY_DOCS[moonfileDocId(section, nested, key)] ?? MOONFILE_SECTION_DOCS[key] ?? MOONFILE_SECTION_DOCS[section];
}
function extractMoonfileLineDocs(source, line) {
  return extractMoonDocs(source, line + 1);
}
function formatMoonfileHover(label, type, docs) {
  const parts = [`**${label}**`, `\`\`\`moonfile
${type}
\`\`\``];
  if (docs)
    parts.push(docs);
  return parts.join(`

`);
}

// ../lsp/src/workspace-paths.ts
var import_fs7 = require("fs");
var import_path8 = require("path");
var IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".moon",
  "dist",
  "out",
  "terminals",
  "agent-tools",
  ".grok",
  ".cursor"
]);
function scanWorkspacePaths(roots, options = {}) {
  const max = options.maxResults ?? 800;
  const seen = new Set;
  const results = [];
  for (const root of roots) {
    walk(import_path8.resolve(root), import_path8.resolve(root), options, seen, results, max);
    if (results.length >= max)
      break;
  }
  return results.sort();
}
function walk(root, dir, options, seen, results, max) {
  if (results.length >= max)
    return;
  let entries;
  try {
    entries = import_fs7.readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries.sort()) {
    if (results.length >= max)
      return;
    if (entry.startsWith(".") && entry !== ".env")
      continue;
    const full = import_path8.join(dir, entry);
    let rel = import_path8.relative(root, full).replace(/\\/g, "/");
    if (!rel.startsWith("."))
      rel = rel;
    let stat;
    try {
      stat = import_fs7.statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (IGNORE_DIRS.has(entry))
        continue;
      const dirPath = `${rel}/`;
      if (!seen.has(dirPath)) {
        seen.add(dirPath);
        results.push(dirPath);
      }
      walk(root, full, options, seen, results, max);
      continue;
    }
    if (options.extensions && !options.extensions.some((ext) => entry.endsWith(ext))) {
      continue;
    }
    if (seen.has(rel))
      continue;
    seen.add(rel);
    results.push(rel);
  }
}
function filterPathCompletions(paths, prefix) {
  const normalized = prefix.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  const dirPrefix = slash >= 0 ? normalized.slice(0, slash + 1) : "";
  const filePrefix = slash >= 0 ? normalized.slice(slash + 1) : normalized;
  return paths.filter((p) => {
    if (dirPrefix && !p.startsWith(dirPrefix))
      return false;
    const tail = dirPrefix ? p.slice(dirPrefix.length) : p;
    if (tail.includes("/") && !tail.endsWith("/"))
      return false;
    const name = tail.endsWith("/") ? tail.slice(0, -1) : tail;
    return name.toLowerCase().startsWith(filePrefix.toLowerCase());
  });
}

// ../lsp/src/moonfile-lsp.ts
function isMoonfileDocument(filePath) {
  const name = import_path9.basename(filePath);
  return name === "Moonfile" || name === "Moonfile.moon";
}
var TOP_SECTIONS = [
  "dependencies",
  "targets",
  "providers",
  "paths",
  "models",
  "prompts",
  "runtime"
];
var PROVIDER_KEYS = ["api_key", "base_url", "api_format", "use_beta"];
var PATH_KEYS = ["pricing", "tokenizer"];
var MODEL_KEYS = ["default_flash", "default_pro"];
var PROMPT_KEYS = ["default_system_suffix", "trace_by_default"];
var STORM_KEYS = ["default_rounds", "max_panel_size"];
var WORKER_KEYS = ["flash_concurrency", "pro_concurrency"];
var MEMORY_KEYS = ["long_term_backend"];
var RETRY_KEYS = ["max_repair_attempts"];
var MODEL_VALUES = ["deepseek-v4-flash", "deepseek-v4-pro"];
var API_FORMAT_VALUES = ["openai", "anthropic"];
var BOOLEAN_VALUES = ["true", "false"];
function rowAt(text, line) {
  return text.split(/\r?\n/)[line] ?? "";
}
function pathValueContext(row, before, character) {
  const colonIdx = row.indexOf(":");
  if (colonIdx < 0 || character <= colonIdx)
    return null;
  const quotedMatch = before.match(/:\s*"([^"]*)$/);
  if (quotedMatch) {
    const quoteStart = before.lastIndexOf('"');
    return {
      prefix: quotedMatch[1] ?? "",
      quoted: true,
      replaceStart: quoteStart + 1
    };
  }
  const unquotedMatch = before.match(/:\s*([A-Za-z0-9_./\\-]*)$/);
  if (unquotedMatch) {
    const valueStart = before.length - (unquotedMatch[1]?.length ?? 0);
    return {
      prefix: unquotedMatch[1] ?? "",
      quoted: false,
      replaceStart: valueStart
    };
  }
  const afterColon = row.slice(colonIdx + 1);
  if (/^\s*$/.test(afterColon.slice(0, Math.max(0, character - colonIdx - 1)))) {
    const valueStart = colonIdx + 1 + (afterColon.match(/^\s*/)?.[0].length ?? 0);
    if (character >= valueStart) {
      return { prefix: "", quoted: false, replaceStart: valueStart };
    }
  }
  return null;
}
function prefixAt(text, line, character) {
  const row = rowAt(text, line);
  const before = row.slice(0, character);
  const pathCtx = pathValueContext(row, before, character);
  if (pathCtx)
    return pathCtx.prefix;
  const wordMatch = before.match(/[A-Za-z0-9_.-]*$/);
  return wordMatch?.[0] ?? "";
}
function isSectionHeader2(text) {
  return text.endsWith(":") && !text.includes(" ") && !text.includes('"');
}
function findSectionContext(text, lineNo) {
  const lines = text.split(/\r?\n/);
  let section = "";
  let nested = "";
  let sectionIndent = 0;
  for (let i = 0;i <= lineNo; i++) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("--"))
      continue;
    if (/^package\s+"/.test(trimmed))
      continue;
    const indent = raw.match(/^(\s*)/)?.[1].length ?? 0;
    if (!isSectionHeader2(trimmed))
      continue;
    const name = trimmed.slice(0, -1);
    if (indent === 0) {
      section = name;
      nested = "";
      sectionIndent = 0;
      continue;
    }
    if (section && indent > sectionIndent) {
      nested = name;
    }
  }
  return { section, nested, indent: sectionIndent };
}
function detectMoonfileContext(text, line, character) {
  const row = rowAt(text, line);
  const before = row.slice(0, character);
  const prefix = prefixAt(text, line, character);
  const { section, nested } = findSectionContext(text, line);
  if (/^package\s+/.test(row) && !/"[^"]*"$/.test(before)) {
    return { kind: "package", prefix };
  }
  const envMatch = before.match(/env\(\s*"([^"]*)$/);
  if (envMatch) {
    return { kind: "env-var", prefix: envMatch[1] ?? "" };
  }
  const valueMatch = row.match(/^\s*([a-zA-Z0-9_.-]+):/);
  const pathCtx = pathValueContext(row, before, character);
  if (valueMatch && pathCtx) {
    const key = valueMatch[1];
    if (section === "targets" || section === "paths" && PATH_KEYS.includes(key)) {
      const extensions = section === "targets" ? [".moon"] : undefined;
      return {
        kind: "path",
        prefix: pathCtx.prefix,
        extensions,
        quoted: pathCtx.quoted,
        replaceStart: pathCtx.replaceStart
      };
    }
    if (section === "providers" && nested === "deepseek" && key === "api_format") {
      return { kind: "api-format", prefix };
    }
    if (section === "providers" && nested === "deepseek" && key === "use_beta") {
      return { kind: "boolean", prefix };
    }
    if (section === "models" && MODEL_KEYS.includes(key)) {
      return { kind: "model", prefix };
    }
    if (section === "prompts" && key === "trace_by_default") {
      return { kind: "boolean", prefix };
    }
    if (section === "providers" && nested === "deepseek" && key === "api_key" && !before.includes("env(")) {
      return { kind: "env-var", prefix: "" };
    }
  }
  if (section === "dependencies" && (/^\s*$/.test(before) || /^\s+[A-Za-z0-9_.]*$/.test(before))) {
    return { kind: "dependency", prefix: prefix.replace(/^Core\./, "") };
  }
  if (section === "targets" && !row.includes(":")) {
    return { kind: "target-name", prefix };
  }
  if ((section === "providers" || section === "prompts" || section === "runtime") && !nested && /^\s+$/.test(before)) {
    return { kind: "nested-section", section, prefix };
  }
  if (section === "providers" && nested === "deepseek" && !row.includes(":")) {
    return { kind: "provider-key", prefix };
  }
  if (section === "paths" && !row.includes(":")) {
    return { kind: "flat-key", section, prefix };
  }
  if (section === "models" && !row.includes(":")) {
    return { kind: "flat-key", section, prefix };
  }
  if (section === "prompts" && nested === "storm" && !row.includes(":")) {
    return { kind: "nested-key", section, nested, prefix };
  }
  if (section === "prompts" && !nested && !row.includes(":")) {
    return { kind: "flat-key", section, prefix };
  }
  if (section === "runtime" && nested && !row.includes(":")) {
    return { kind: "nested-key", section, nested, prefix };
  }
  if (/^\s*$/.test(row) || !section && !/^package\s/.test(row)) {
    return { kind: "section", prefix };
  }
  return { kind: "section", prefix };
}
function matchesPrefix2(label, prefix) {
  return label.toLowerCase().startsWith(prefix.toLowerCase());
}
function item2(label, kind, opts = {}) {
  return { label, kind, ...opts };
}
var workspacePathCache = null;
function cachedWorkspacePaths(projectRoot, extensions) {
  if (workspacePathCache?.root === projectRoot)
    return workspacePathCache.paths;
  const paths = scanWorkspacePaths([projectRoot], { extensions });
  workspacePathCache = { root: projectRoot, paths };
  return paths;
}
function formatPathCompletion(rel, opts) {
  const insertText = opts.quoted ? `${rel}"` : `"${rel}"`;
  return {
    insertText,
    textEdit: {
      range: {
        start: { line: opts.line, character: opts.replaceStart },
        end: { line: opts.line, character: opts.character }
      },
      newText: insertText
    }
  };
}
function listPathCompletions(projectRoot, partial, extensions, edit) {
  workspacePathCache = null;
  const local = listRelativePaths(projectRoot, partial, extensions, edit);
  const workspace = filterPathCompletions(cachedWorkspacePaths(projectRoot, extensions), partial);
  const seen = new Set(local.map((entry) => entry.label));
  const merged = [...local];
  for (const rel of workspace) {
    if (seen.has(rel))
      continue;
    seen.add(rel);
    const kind = rel.endsWith("/") ? CompletionItemKind.Folder : CompletionItemKind.File;
    merged.push(item2(rel, kind, {
      detail: "workspace",
      sortText: `2${rel}`,
      ...formatPathCompletion(rel, edit)
    }));
  }
  return merged;
}
function listRelativePaths(projectRoot, partial, extensions, edit) {
  const normalized = partial.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const filePrefix = parts.pop() ?? "";
  let current = import_path9.resolve(projectRoot);
  for (const part of parts) {
    if (!part || part === ".")
      continue;
    current = import_path9.join(current, part);
    if (!import_fs8.existsSync(current))
      return [];
  }
  let entries = [];
  try {
    entries = import_fs8.readdirSync(current);
  } catch {
    return [];
  }
  const items = [];
  const dirPrefix = parts.length > 0 ? `${parts.join("/")}/` : "";
  for (const entry of entries.sort()) {
    if (entry.startsWith("."))
      continue;
    const full = import_path9.join(current, entry);
    let isDir = false;
    try {
      isDir = import_fs8.statSync(full).isDirectory();
    } catch {
      continue;
    }
    if (isDir) {
      if (!matchesPrefix2(entry, filePrefix))
        continue;
      const rel2 = `${dirPrefix}${entry}/`;
      items.push(item2(rel2, CompletionItemKind.Folder, {
        detail: "directory",
        sortText: `0${rel2}`,
        ...formatPathCompletion(rel2, edit)
      }));
      continue;
    }
    if (extensions && !extensions.some((ext) => entry.endsWith(ext)))
      continue;
    if (!matchesPrefix2(entry, filePrefix))
      continue;
    const rel = `${dirPrefix}${entry}`;
    items.push(item2(rel, CompletionItemKind.File, {
      detail: extensions?.length ? "Moon target" : "file",
      sortText: `1${rel}`,
      ...formatPathCompletion(rel, edit)
    }));
  }
  return items;
}
function suggestEnvVars(prefix) {
  const common = [
    "DEEPSEEK_API_KEY",
    "DEEPSEEK_BASE_URL",
    "DEEPSEEK_USE_BETA",
    "MOON_MEMORY_PATH"
  ];
  const fromEnv = Object.keys(process.env);
  const all = [...new Set([...common, ...fromEnv])];
  return all.filter((name) => matchesPrefix2(name, prefix)).map((name) => item2(`env("${name}")`, CompletionItemKind.Constant, {
    detail: "environment variable",
    insertText: `env("${name}")`,
    sortText: `a${name}`
  }));
}
function suggestValues(values, prefix, kind = CompletionItemKind.Value) {
  return values.filter((value) => matchesPrefix2(value, prefix)).map((value) => item2(value, kind, { sortText: `a${value}` }));
}
function getMoonfileCompletions(text, line, character, projectRoot) {
  const ctx = detectMoonfileContext(text, line, character);
  const prefix = "prefix" in ctx ? ctx.prefix : "";
  switch (ctx.kind) {
    case "package":
      return [item2('package "${1:name}"', CompletionItemKind.Snippet, {
        insertText: 'package "${1:name}"',
        insertTextFormat: 2,
        detail: "project package name"
      })];
    case "section": {
      const items = [];
      if (!text.includes('package "')) {
        items.push(item2('package "${1:name}"', CompletionItemKind.Snippet, {
          insertText: `package "\${1:name}"

`,
          insertTextFormat: 2,
          detail: "declare package name"
        }));
      }
      for (const section of TOP_SECTIONS) {
        if (!matchesPrefix2(section, prefix))
          continue;
        items.push(item2(`${section}:`, CompletionItemKind.Keyword, {
          detail: MOONFILE_SECTION_DOCS[section],
          insertText: `${section}:
  `,
          sortText: `a${section}`
        }));
      }
      return items;
    }
    case "dependency":
      return allCoreModulePaths().filter((path) => matchesPrefix2(path, prefix) || matchesPrefix2(path.replace(/^Core\./, ""), prefix)).map((path) => item2(path, CompletionItemKind.Module, {
        detail: "Core stdlib module",
        sortText: `a${path}`
      }));
    case "target-name": {
      const pathEdit = {
        line,
        character,
        quoted: false,
        replaceStart: Math.max(0, character - prefix.length)
      };
      if (prefix.includes("/") || prefix.includes(".") || prefix.includes("\\")) {
        return listPathCompletions(projectRoot, prefix, [".moon"], pathEdit);
      }
      const moonFiles = listPathCompletions(projectRoot, "", [".moon"], {
        ...pathEdit,
        replaceStart: character
      }).slice(0, 12);
      return [
        item2("${1:target}: ${2:examples/file.moon}", CompletionItemKind.Snippet, {
          insertText: "${1:target}: ${2:examples/file.moon}",
          insertTextFormat: 2,
          detail: "new target entry"
        }),
        ...moonFiles
      ];
    }
    case "nested-section": {
      const nestedBySection = {
        providers: ["deepseek"],
        prompts: ["storm"],
        runtime: ["worker_pool", "memory", "retries"]
      };
      const options = nestedBySection[ctx.section] ?? [];
      return options.filter((name) => matchesPrefix2(name, prefix)).map((name) => item2(`${name}:`, CompletionItemKind.Keyword, {
        detail: `${ctx.section} subsection`,
        insertText: `${name}:
    `,
        sortText: `a${name}`
      }));
    }
    case "path":
      return listPathCompletions(projectRoot, prefix, ctx.extensions, {
        line,
        character,
        quoted: ctx.quoted ?? false,
        replaceStart: ctx.replaceStart
      });
    case "provider-key":
      return PROVIDER_KEYS.filter((key) => matchesPrefix2(key, prefix)).map((key) => item2(`${key}: `, CompletionItemKind.Property, {
        detail: lookupMoonfileDoc("providers", "deepseek", key),
        insertText: key === "api_key" ? 'api_key: env("${1:DEEPSEEK_API_KEY}")' : `${key}: `,
        insertTextFormat: key === "api_key" ? 2 : 1
      }));
    case "flat-key": {
      const keys = ctx.section === "paths" ? PATH_KEYS : ctx.section === "models" ? MODEL_KEYS : PROMPT_KEYS;
      return keys.filter((key) => matchesPrefix2(key, prefix)).map((key) => item2(`${key}: `, CompletionItemKind.Property, {
        detail: lookupMoonfileDoc(ctx.section, undefined, key)
      }));
    }
    case "nested-key": {
      const keys = ctx.nested === "storm" ? STORM_KEYS : ctx.nested === "worker_pool" ? WORKER_KEYS : ctx.nested === "memory" ? MEMORY_KEYS : ctx.nested === "retries" ? RETRY_KEYS : PROVIDER_KEYS;
      return keys.filter((key) => matchesPrefix2(key, prefix)).map((key) => item2(`${key}: `, CompletionItemKind.Property, {
        detail: lookupMoonfileDoc(ctx.section, ctx.nested, key)
      }));
    }
    case "env-var":
      return suggestEnvVars(prefix);
    case "api-format":
      return suggestValues(API_FORMAT_VALUES, prefix);
    case "model":
      return suggestValues(MODEL_VALUES, prefix, CompletionItemKind.Constant);
    case "boolean":
      return suggestValues(BOOLEAN_VALUES, prefix, CompletionItemKind.Constant);
    default:
      return [];
  }
}
function getMoonfileHover(text, line, character) {
  const row = rowAt(text, line);
  const word = prefixAt(text, line, character);
  const { section, nested } = findSectionContext(text, line);
  const inlineDocs = extractMoonfileLineDocs(text, line);
  const keyMatch = row.match(/^\s*([a-zA-Z0-9_.-]+):/);
  const key = keyMatch?.[1];
  if (key && (word === key || row.includes(`: ${word}`))) {
    const doc = inlineDocs ?? lookupMoonfileDoc(section, nested, key);
    if (doc) {
      const type = nested ? `${section}.${nested}.${key}` : section ? `${section}.${key}` : key;
      return formatMoonfileHover(key, type, doc);
    }
  }
  if (word && MOONFILE_SECTION_DOCS[word]) {
    return formatMoonfileHover(word, "section", inlineDocs ?? MOONFILE_SECTION_DOCS[word]);
  }
  if (word?.startsWith("Core.")) {
    return formatMoonfileHover(word, "Core module", inlineDocs ?? "Core stdlib module dependency.");
  }
  if (inlineDocs) {
    return formatMoonfileHover(word ?? "Moonfile", "declaration", inlineDocs);
  }
  return null;
}
function collectMoonfileDiagnostics(text) {
  try {
    parseMoonfile(text);
    return [];
  } catch (err) {
    if (!(err instanceof MoonfileParseError)) {
      return [{
        message: err instanceof Error ? err.message : String(err),
        line: 0,
        character: 0,
        endLine: 0,
        endCharacter: 1,
        severity: 1
      }];
    }
    const line = Math.max(0, err.line - 1);
    const row = text.split(/\r?\n/)[line] ?? "";
    return [{
      message: err.message,
      line,
      character: 0,
      endLine: line,
      endCharacter: Math.max(1, row.length),
      severity: 1
    }];
  }
}

// ../lsp/src/log.ts
var connection;
var config = { enabled: true, verbose: false };
function attachMoonLogger(conn) {
  connection = conn;
}
function setMoonLogConfig(next) {
  config = { ...config, ...next };
}
function moonLog(message, level = "info") {
  if (!connection || !config.enabled)
    return;
  if (level === "debug" && !config.verbose)
    return;
  const tag = level === "warn" ? "[warn]" : level === "debug" ? "[debug]" : "[info]";
  connection.console.log(`${tag} ${message}`);
}

// ../lsp/src/lsp-config.ts
var settings = {};
function updateMoonSettings(next) {
  settings = next ?? {};
  setMoonLogConfig({
    enabled: settings.logging?.enabled ?? true,
    verbose: settings.logging?.verbose ?? false
  });
}
function getMoonSettings() {
  return settings;
}

// ../lsp/src/index.ts
var connection2 = import_node.createConnection(import_node.ProposedFeatures.all);
attachMoonLogger(connection2);
var documents = new import_node.TextDocuments(TextDocument);
var symbolDb = new SymbolDatabase;
function applyInitializationSettings(params) {
  const init = params.initializationOptions;
  if (init?.moon) {
    updateMoonSettings(init.moon);
    moonLog("settings loaded from initializationOptions", "debug");
  }
}
async function refreshMoonSettings() {
  try {
    const getCfg = connection2.workspace?.getConfiguration;
    if (typeof getCfg !== "function") {
      moonLog("workspace configuration not supported by client", "debug");
      return;
    }
    const cfg = await getCfg.call(connection2.workspace, { section: "moon" });
    updateMoonSettings(cfg);
    moonLog("settings refreshed", "debug");
  } catch (err) {
    moonLog(`settings refresh failed: ${String(err)}`, "warn");
  }
}
function ensureSymbolDb(filePath) {
  const root = findProjectRootFromPath(filePath);
  if (symbolDb.root === root && symbolDb.symbols.length > 0)
    return;
  if (!symbolDb.load(root))
    symbolDb.rebuild(root);
}
connection2.onInitialize((params) => {
  applyInitializationSettings(params);
  return {
    capabilities: {
      textDocumentSync: import_node.TextDocumentSyncKind.Incremental,
      completionProvider: {
        triggerCharacters: [".", ":", "/", "\\", "<", "-", '"'],
        resolveProvider: false
      },
      signatureHelpProvider: {
        triggerCharacters: [" ", ".", ":"]
      },
      definitionProvider: true,
      hoverProvider: true,
      documentFormattingProvider: true,
      codeActionProvider: { resolveProvider: false },
      codeLensProvider: { resolveProvider: false }
    }
  };
});
connection2.onInitialized(() => {
  refreshMoonSettings();
});
connection2.onDidChangeConfiguration(() => {
  refreshMoonSettings();
});
function filePathFromUri(uri) {
  let path = uri.replace(/^file:\/\//, "");
  if (process.platform === "win32" && path.startsWith("/")) {
    path = path.slice(1);
  }
  return path.replace(/\//g, process.platform === "win32" ? "\\" : "/");
}
function safeParse(text) {
  try {
    return parse(text);
  } catch {
    return null;
  }
}
documents.onDidChangeContent((change) => {
  const uri = change.document.uri;
  const filePath = filePathFromUri(uri);
  const text = change.document.getText();
  if (filePath.endsWith(".moon")) {
    ensureSymbolDb(filePath);
    symbolDb.refreshFile(filePath);
    if (symbolDb.root)
      symbolDb.save();
  }
  const diagnostics = isMoonfileDocument(filePath) ? collectMoonfileDiagnostics(text).map((d) => ({
    message: d.message,
    severity: d.severity,
    range: {
      start: { line: d.line, character: d.character },
      end: { line: d.endLine, character: d.endCharacter }
    },
    source: "moonfile"
  })) : collectDiagnostics(filePath, text);
  connection2.sendDiagnostics({ uri, diagnostics });
});
connection2.onCodeLens((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return [];
  const program = safeParse(doc.getText());
  if (!program)
    return [];
  return findPromptSites(program).map((site) => ({
    range: {
      start: { line: site.line, character: 0 },
      end: { line: site.endLine, character: 1 }
    },
    command: {
      title: `$(sparkle) ${site.title}`,
      command: "moon.previewPrompt",
      arguments: [params.textDocument.uri, site.line]
    }
  }));
});
connection2.onRequest("moon/getPromptPreview", (params) => {
  const doc = documents.get(params.uri);
  if (!doc)
    return null;
  const program = safeParse(doc.getText());
  if (!program)
    return null;
  const preview = buildPromptPreview(program, params.line);
  if (!preview)
    return null;
  return {
    title: preview.site.title,
    markdown: preview.markdown,
    messages: preview.assembled.messages,
    temperature: preview.assembled.temperature,
    maxTokens: preview.assembled.maxTokens
  };
});
connection2.onCompletion((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return [];
  const filePath = filePathFromUri(params.textDocument.uri);
  const { line, character } = params.position;
  if (isMoonfileDocument(filePath)) {
    const root = findProjectRootFromPath(filePath) ?? import_path10.dirname(filePath);
    const items2 = getMoonfileCompletions(doc.getText(), line, character, root);
    const ctx = detectMoonfileContext(doc.getText(), line, character);
    moonLog(`moonfile completion ${ctx.kind} → ${items2.length} items`, "debug");
    return items2;
  }
  const program = safeParse(doc.getText());
  const items = program ? getCompletions(program, filePath, doc.getText(), line, character) : getPartialCompletions(doc.getText(), filePath, line, character);
  moonLog(`moon completion ${program ? "full" : "partial"} → ${items.length} items`, "debug");
  return items;
});
connection2.onSignatureHelp((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return null;
  const program = safeParse(doc.getText());
  if (!program)
    return null;
  const help = getSignatureHelp(program, doc.getText(), params.position.line, params.position.character);
  if (!help)
    return null;
  return {
    signatures: help.signatures.map((s) => ({
      label: s.label,
      documentation: s.documentation
    })),
    activeSignature: help.activeSignature,
    activeParameter: 0
  };
});
connection2.onHover((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return null;
  const filePath = filePathFromUri(params.textDocument.uri);
  if (isMoonfileDocument(filePath)) {
    const markdown = getMoonfileHover(doc.getText(), params.position.line, params.position.character);
    if (!markdown)
      return null;
    return { contents: { kind: "markdown", value: markdown } };
  }
  const word = wordAtPosition(doc.getText(), params.position.line, params.position.character);
  if (!word)
    return null;
  const program = safeParse(doc.getText());
  if (!program)
    return null;
  ensureSymbolDb(filePath);
  const info = lookupSymbol(program, filePath, word, symbolDb, doc.getText());
  if (!info)
    return null;
  return {
    contents: {
      kind: "markdown",
      value: formatHoverDocs(info.name, info.type, info.module, info.docs)
    }
  };
});
connection2.onDefinition((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return null;
  const filePath = filePathFromUri(params.textDocument.uri);
  const word = wordAtPosition(doc.getText(), params.position.line, params.position.character);
  if (!word)
    return null;
  const program = safeParse(doc.getText());
  if (!program)
    return null;
  ensureSymbolDb(filePath);
  const target = definitionLocation(program, filePath, word, symbolDb, doc.getText());
  if (!target)
    return null;
  return { uri: target.uri, range: target.range };
});
connection2.onCodeAction((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return [];
  const filePath = filePathFromUri(params.textDocument.uri);
  const program = safeParse(doc.getText());
  if (!program)
    return [];
  const actions = [];
  for (const diag of params.context.diagnostics) {
    if (diag.source && diag.source !== "moon")
      continue;
    for (const fix of getCodeActions(program, filePath, doc.getText(), {
      message: diag.message,
      range: diag.range,
      source: diag.source
    })) {
      if (!fix.edit)
        continue;
      actions.push({
        title: fix.title,
        kind: fix.kind ? `quickfix.${fix.kind}` : "quickfix",
        isPreferred: fix.isPreferred,
        edit: {
          changes: {
            [params.textDocument.uri]: [{
              range: fix.edit.range,
              newText: fix.edit.newText
            }]
          }
        }
      });
    }
  }
  return actions;
});
connection2.onDocumentFormatting((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc)
    return [];
  const formatted = formatSource(doc.getText());
  return [{
    range: {
      start: doc.positionAt(0),
      end: doc.positionAt(doc.getText().length)
    },
    newText: formatted
  }];
});
connection2.onRequest("moon/getSettings", () => getMoonSettings());
async function startLspServer() {
  moonLog("Moon LSP listening", "info");
  documents.listen(connection2);
  await connection2.listen();
}
var lspTransportArg = process.argv.some((arg) => arg === "--stdio" || arg === "--node-ipc" || arg.startsWith("--socket="));
if (require.main == module || lspTransportArg) {
  startLspServer();
}
