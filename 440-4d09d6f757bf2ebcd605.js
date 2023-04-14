/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
function _wrapRegExp() {
  _wrapRegExp = function (re, groups) {
    return new BabelRegExp(re, undefined, groups);
  };

  var _super = RegExp.prototype;

  var _groups = new WeakMap();

  function BabelRegExp(re, flags, groups) {
    var _this = new RegExp(re, flags);

    _groups.set(_this, groups || _groups.get(re));

    return _setPrototypeOf(_this, BabelRegExp.prototype);
  }

  _inherits(BabelRegExp, RegExp);

  BabelRegExp.prototype.exec = function (str) {
    var result = _super.exec.call(this, str);

    if (result) result.groups = buildGroups(result, this);
    return result;
  };

  BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
    if (typeof substitution === "string") {
      var groups = _groups.get(this);

      return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
        return "$" + groups[name];
      }));
    } else if (typeof substitution === "function") {
      var _this = this;

      return _super[Symbol.replace].call(this, str, function () {
        var args = arguments;

        if (typeof args[args.length - 1] !== "object") {
          args = [].slice.call(args);
          args.push(buildGroups(args, _this));
        }

        return substitution.apply(this, args);
      });
    } else {
      return _super[Symbol.replace].call(this, str, substitution);
    }
  };

  function buildGroups(result, re) {
    var g = _groups.get(re);

    return Object.keys(g).reduce(function (groups, name) {
      groups[name] = result[g[name]];
      return groups;
    }, Object.create(null));
  }

  return _wrapRegExp.apply(this, arguments);
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/* @license
Papa Parse
v5.3.2
https://github.com/mholt/PapaParse
License: MIT
*/
var papaparse_min = createCommonjsModule(function (module, exports) {
  !function (e, t) {
    module.exports = t() ;
  }(commonjsGlobal, function s() {

    var f = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== f ? f : {};
    var n = !f.document && !!f.postMessage,
        o = n && /blob:/i.test((f.location || {}).protocol),
        a = {},
        h = 0,
        b = {
      parse: function (e, t) {
        var i = (t = t || {}).dynamicTyping || !1;
        M(i) && (t.dynamicTypingFunction = i, i = {});

        if (t.dynamicTyping = i, t.transform = !!M(t.transform) && t.transform, t.worker && b.WORKERS_SUPPORTED) {
          var r = function () {
            if (!b.WORKERS_SUPPORTED) return !1;
            var e = (i = f.URL || f.webkitURL || null, r = s.toString(), b.BLOB_URL || (b.BLOB_URL = i.createObjectURL(new Blob(["(", r, ")();"], {
              type: "text/javascript"
            })))),
                t = new f.Worker(e);
            var i, r;
            return t.onmessage = _, t.id = h++, a[t.id] = t;
          }();

          return r.userStep = t.step, r.userChunk = t.chunk, r.userComplete = t.complete, r.userError = t.error, t.step = M(t.step), t.chunk = M(t.chunk), t.complete = M(t.complete), t.error = M(t.error), delete t.worker, void r.postMessage({
            input: e,
            config: t,
            workerId: r.id
          });
        }

        var n = null;
        "string" == typeof e ? n = t.download ? new l(t) : new p(t) : !0 === e.readable && M(e.read) && M(e.on) ? n = new g(t) : (f.File && e instanceof File || e instanceof Object) && (n = new c(t));
        return n.stream(e);
      },
      unparse: function (e, t) {
        var n = !1,
            _ = !0,
            m = ",",
            y = "\r\n",
            s = '"',
            a = s + s,
            i = !1,
            r = null,
            o = !1;

        !function () {
          if ("object" != typeof t) return;
          "string" != typeof t.delimiter || b.BAD_DELIMITERS.filter(function (e) {
            return -1 !== t.delimiter.indexOf(e);
          }).length || (m = t.delimiter);
          ("boolean" == typeof t.quotes || "function" == typeof t.quotes || Array.isArray(t.quotes)) && (n = t.quotes);
          "boolean" != typeof t.skipEmptyLines && "string" != typeof t.skipEmptyLines || (i = t.skipEmptyLines);
          "string" == typeof t.newline && (y = t.newline);
          "string" == typeof t.quoteChar && (s = t.quoteChar);
          "boolean" == typeof t.header && (_ = t.header);

          if (Array.isArray(t.columns)) {
            if (0 === t.columns.length) throw new Error("Option columns is empty");
            r = t.columns;
          }

          void 0 !== t.escapeChar && (a = t.escapeChar + s);
          ("boolean" == typeof t.escapeFormulae || t.escapeFormulae instanceof RegExp) && (o = t.escapeFormulae instanceof RegExp ? t.escapeFormulae : /^[=+\-@\t\r].*$/);
        }();
        var h = new RegExp(j(s), "g");
        "string" == typeof e && (e = JSON.parse(e));

        if (Array.isArray(e)) {
          if (!e.length || Array.isArray(e[0])) return u(null, e, i);
          if ("object" == typeof e[0]) return u(r || Object.keys(e[0]), e, i);
        } else if ("object" == typeof e) return "string" == typeof e.data && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || r), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : "object" == typeof e.data[0] ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || "object" == typeof e.data[0] || (e.data = [e.data])), u(e.fields || [], e.data || [], i);

        throw new Error("Unable to serialize unrecognized input");

        function u(e, t, i) {
          var r = "";
          "string" == typeof e && (e = JSON.parse(e)), "string" == typeof t && (t = JSON.parse(t));
          var n = Array.isArray(e) && 0 < e.length,
              s = !Array.isArray(t[0]);

          if (n && _) {
            for (var a = 0; a < e.length; a++) 0 < a && (r += m), r += v(e[a], a);

            0 < t.length && (r += y);
          }

          for (var o = 0; o < t.length; o++) {
            var h = n ? e.length : t[o].length,
                u = !1,
                f = n ? 0 === Object.keys(t[o]).length : 0 === t[o].length;

            if (i && !n && (u = "greedy" === i ? "" === t[o].join("").trim() : 1 === t[o].length && 0 === t[o][0].length), "greedy" === i && n) {
              for (var d = [], l = 0; l < h; l++) {
                var c = s ? e[l] : l;
                d.push(t[o][c]);
              }

              u = "" === d.join("").trim();
            }

            if (!u) {
              for (var p = 0; p < h; p++) {
                0 < p && !f && (r += m);
                var g = n && s ? e[p] : p;
                r += v(t[o][g], p);
              }

              o < t.length - 1 && (!i || 0 < h && !f) && (r += y);
            }
          }

          return r;
        }

        function v(e, t) {
          if (null == e) return "";
          if (e.constructor === Date) return JSON.stringify(e).slice(1, 25);
          var i = !1;
          o && "string" == typeof e && o.test(e) && (e = "'" + e, i = !0);
          var r = e.toString().replace(h, a);
          return (i = i || !0 === n || "function" == typeof n && n(e, t) || Array.isArray(n) && n[t] || function (e, t) {
            for (var i = 0; i < t.length; i++) if (-1 < e.indexOf(t[i])) return !0;

            return !1;
          }(r, b.BAD_DELIMITERS) || -1 < r.indexOf(m) || " " === r.charAt(0) || " " === r.charAt(r.length - 1)) ? s + r + s : r;
        }
      }
    };

    if (b.RECORD_SEP = String.fromCharCode(30), b.UNIT_SEP = String.fromCharCode(31), b.BYTE_ORDER_MARK = "\ufeff", b.BAD_DELIMITERS = ["\r", "\n", '"', b.BYTE_ORDER_MARK], b.WORKERS_SUPPORTED = !n && !!f.Worker, b.NODE_STREAM_INPUT = 1, b.LocalChunkSize = 10485760, b.RemoteChunkSize = 5242880, b.DefaultDelimiter = ",", b.Parser = E, b.ParserHandle = i, b.NetworkStreamer = l, b.FileStreamer = c, b.StringStreamer = p, b.ReadableStreamStreamer = g, f.jQuery) {
      var d = f.jQuery;

      d.fn.parse = function (o) {
        var i = o.config || {},
            h = [];
        return this.each(function (e) {
          if (!("INPUT" === d(this).prop("tagName").toUpperCase() && "file" === d(this).attr("type").toLowerCase() && f.FileReader) || !this.files || 0 === this.files.length) return !0;

          for (var t = 0; t < this.files.length; t++) h.push({
            file: this.files[t],
            inputElem: this,
            instanceConfig: d.extend({}, i)
          });
        }), e(), this;

        function e() {
          if (0 !== h.length) {
            var e,
                t,
                i,
                r,
                n = h[0];

            if (M(o.before)) {
              var s = o.before(n.file, n.inputElem);

              if ("object" == typeof s) {
                if ("abort" === s.action) return e = "AbortError", t = n.file, i = n.inputElem, r = s.reason, void (M(o.error) && o.error({
                  name: e
                }, t, i, r));
                if ("skip" === s.action) return void u();
                "object" == typeof s.config && (n.instanceConfig = d.extend(n.instanceConfig, s.config));
              } else if ("skip" === s) return void u();
            }

            var a = n.instanceConfig.complete;
            n.instanceConfig.complete = function (e) {
              M(a) && a(e, n.file, n.inputElem), u();
            }, b.parse(n.file, n.instanceConfig);
          } else M(o.complete) && o.complete();
        }

        function u() {
          h.splice(0, 1), e();
        }
      };
    }

    function u(e) {
      this._handle = null, this._finished = !1, this._completed = !1, this._halted = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = {
        data: [],
        errors: [],
        meta: {}
      }, function (e) {
        var t = w(e);
        t.chunkSize = parseInt(t.chunkSize), e.step || e.chunk || (t.chunkSize = null);
        this._handle = new i(t), (this._handle.streamer = this)._config = t;
      }.call(this, e), this.parseChunk = function (e, t) {
        if (this.isFirstChunk && M(this._config.beforeFirstChunk)) {
          var i = this._config.beforeFirstChunk(e);

          void 0 !== i && (e = i);
        }

        this.isFirstChunk = !1, this._halted = !1;
        var r = this._partialLine + e;
        this._partialLine = "";

        var n = this._handle.parse(r, this._baseIndex, !this._finished);

        if (!this._handle.paused() && !this._handle.aborted()) {
          var s = n.meta.cursor;
          this._finished || (this._partialLine = r.substring(s - this._baseIndex), this._baseIndex = s), n && n.data && (this._rowCount += n.data.length);
          var a = this._finished || this._config.preview && this._rowCount >= this._config.preview;
          if (o) f.postMessage({
            results: n,
            workerId: b.WORKER_ID,
            finished: a
          });else if (M(this._config.chunk) && !t) {
            if (this._config.chunk(n, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = !0);
            n = void 0, this._completeResults = void 0;
          }
          return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(n.data), this._completeResults.errors = this._completeResults.errors.concat(n.errors), this._completeResults.meta = n.meta), this._completed || !a || !M(this._config.complete) || n && n.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = !0), a || n && n.meta.paused || this._nextChunk(), n;
        }

        this._halted = !0;
      }, this._sendError = function (e) {
        M(this._config.error) ? this._config.error(e) : o && this._config.error && f.postMessage({
          workerId: b.WORKER_ID,
          error: e,
          finished: !1
        });
      };
    }

    function l(e) {
      var r;
      (e = e || {}).chunkSize || (e.chunkSize = b.RemoteChunkSize), u.call(this, e), this._nextChunk = n ? function () {
        this._readChunk(), this._chunkLoaded();
      } : function () {
        this._readChunk();
      }, this.stream = function (e) {
        this._input = e, this._nextChunk();
      }, this._readChunk = function () {
        if (this._finished) this._chunkLoaded();else {
          if (r = new XMLHttpRequest(), this._config.withCredentials && (r.withCredentials = this._config.withCredentials), n || (r.onload = v(this._chunkLoaded, this), r.onerror = v(this._chunkError, this)), r.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !n), this._config.downloadRequestHeaders) {
            var e = this._config.downloadRequestHeaders;

            for (var t in e) r.setRequestHeader(t, e[t]);
          }

          if (this._config.chunkSize) {
            var i = this._start + this._config.chunkSize - 1;
            r.setRequestHeader("Range", "bytes=" + this._start + "-" + i);
          }

          try {
            r.send(this._config.downloadRequestBody);
          } catch (e) {
            this._chunkError(e.message);
          }

          n && 0 === r.status && this._chunkError();
        }
      }, this._chunkLoaded = function () {
        4 === r.readyState && (r.status < 200 || 400 <= r.status ? this._chunkError() : (this._start += this._config.chunkSize ? this._config.chunkSize : r.responseText.length, this._finished = !this._config.chunkSize || this._start >= function (e) {
          var t = e.getResponseHeader("Content-Range");
          if (null === t) return -1;
          return parseInt(t.substring(t.lastIndexOf("/") + 1));
        }(r), this.parseChunk(r.responseText)));
      }, this._chunkError = function (e) {
        var t = r.statusText || e;

        this._sendError(new Error(t));
      };
    }

    function c(e) {
      var r, n;
      (e = e || {}).chunkSize || (e.chunkSize = b.LocalChunkSize), u.call(this, e);
      var s = "undefined" != typeof FileReader;
      this.stream = function (e) {
        this._input = e, n = e.slice || e.webkitSlice || e.mozSlice, s ? ((r = new FileReader()).onload = v(this._chunkLoaded, this), r.onerror = v(this._chunkError, this)) : r = new FileReaderSync(), this._nextChunk();
      }, this._nextChunk = function () {
        this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
      }, this._readChunk = function () {
        var e = this._input;

        if (this._config.chunkSize) {
          var t = Math.min(this._start + this._config.chunkSize, this._input.size);
          e = n.call(e, this._start, t);
        }

        var i = r.readAsText(e, this._config.encoding);
        s || this._chunkLoaded({
          target: {
            result: i
          }
        });
      }, this._chunkLoaded = function (e) {
        this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e.target.result);
      }, this._chunkError = function () {
        this._sendError(r.error);
      };
    }

    function p(e) {
      var i;
      u.call(this, e = e || {}), this.stream = function (e) {
        return i = e, this._nextChunk();
      }, this._nextChunk = function () {
        if (!this._finished) {
          var e,
              t = this._config.chunkSize;
          return t ? (e = i.substring(0, t), i = i.substring(t)) : (e = i, i = ""), this._finished = !i, this.parseChunk(e);
        }
      };
    }

    function g(e) {
      u.call(this, e = e || {});
      var t = [],
          i = !0,
          r = !1;
      this.pause = function () {
        u.prototype.pause.apply(this, arguments), this._input.pause();
      }, this.resume = function () {
        u.prototype.resume.apply(this, arguments), this._input.resume();
      }, this.stream = function (e) {
        this._input = e, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
      }, this._checkIsFinished = function () {
        r && 1 === t.length && (this._finished = !0);
      }, this._nextChunk = function () {
        this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : i = !0;
      }, this._streamData = v(function (e) {
        try {
          t.push("string" == typeof e ? e : e.toString(this._config.encoding)), i && (i = !1, this._checkIsFinished(), this.parseChunk(t.shift()));
        } catch (e) {
          this._streamError(e);
        }
      }, this), this._streamError = v(function (e) {
        this._streamCleanUp(), this._sendError(e);
      }, this), this._streamEnd = v(function () {
        this._streamCleanUp(), r = !0, this._streamData("");
      }, this), this._streamCleanUp = v(function () {
        this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
      }, this);
    }

    function i(m) {
      var a,
          o,
          h,
          r = Math.pow(2, 53),
          n = -r,
          s = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,
          u = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/,
          t = this,
          i = 0,
          f = 0,
          d = !1,
          e = !1,
          l = [],
          c = {
        data: [],
        errors: [],
        meta: {}
      };

      if (M(m.step)) {
        var p = m.step;

        m.step = function (e) {
          if (c = e, _()) g();else {
            if (g(), 0 === c.data.length) return;
            i += e.data.length, m.preview && i > m.preview ? o.abort() : (c.data = c.data[0], p(c, t));
          }
        };
      }

      function y(e) {
        return "greedy" === m.skipEmptyLines ? "" === e.join("").trim() : 1 === e.length && 0 === e[0].length;
      }

      function g() {
        return c && h && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + b.DefaultDelimiter + "'"), h = !1), m.skipEmptyLines && (c.data = c.data.filter(function (e) {
          return !y(e);
        })), _() && function () {
          if (!c) return;

          function e(e, t) {
            M(m.transformHeader) && (e = m.transformHeader(e, t)), l.push(e);
          }

          if (Array.isArray(c.data[0])) {
            for (var t = 0; _() && t < c.data.length; t++) c.data[t].forEach(e);

            c.data.splice(0, 1);
          } else c.data.forEach(e);
        }(), function () {
          if (!c || !m.header && !m.dynamicTyping && !m.transform) return c;

          function e(e, t) {
            var i,
                r = m.header ? {} : [];

            for (i = 0; i < e.length; i++) {
              var n = i,
                  s = e[i];
              m.header && (n = i >= l.length ? "__parsed_extra" : l[i]), m.transform && (s = m.transform(s, n)), s = v(n, s), "__parsed_extra" === n ? (r[n] = r[n] || [], r[n].push(s)) : r[n] = s;
            }

            return m.header && (i > l.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + l.length + " fields but parsed " + i, f + t) : i < l.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + l.length + " fields but parsed " + i, f + t)), r;
          }

          var t = 1;
          !c.data.length || Array.isArray(c.data[0]) ? (c.data = c.data.map(e), t = c.data.length) : c.data = e(c.data, 0);
          m.header && c.meta && (c.meta.fields = l);
          return f += t, c;
        }();
      }

      function _() {
        return m.header && 0 === l.length;
      }

      function v(e, t) {
        return i = e, m.dynamicTypingFunction && void 0 === m.dynamicTyping[i] && (m.dynamicTyping[i] = m.dynamicTypingFunction(i)), !0 === (m.dynamicTyping[i] || m.dynamicTyping) ? "true" === t || "TRUE" === t || "false" !== t && "FALSE" !== t && (function (e) {
          if (s.test(e)) {
            var t = parseFloat(e);
            if (n < t && t < r) return !0;
          }

          return !1;
        }(t) ? parseFloat(t) : u.test(t) ? new Date(t) : "" === t ? null : t) : t;
        var i;
      }

      function k(e, t, i, r) {
        var n = {
          type: e,
          code: t,
          message: i
        };
        void 0 !== r && (n.row = r), c.errors.push(n);
      }

      this.parse = function (e, t, i) {
        var r = m.quoteChar || '"';
        if (m.newline || (m.newline = function (e, t) {
          e = e.substring(0, 1048576);
          var i = new RegExp(j(t) + "([^]*?)" + j(t), "gm"),
              r = (e = e.replace(i, "")).split("\r"),
              n = e.split("\n"),
              s = 1 < n.length && n[0].length < r[0].length;
          if (1 === r.length || s) return "\n";

          for (var a = 0, o = 0; o < r.length; o++) "\n" === r[o][0] && a++;

          return a >= r.length / 2 ? "\r\n" : "\r";
        }(e, r)), h = !1, m.delimiter) M(m.delimiter) && (m.delimiter = m.delimiter(e), c.meta.delimiter = m.delimiter);else {
          var n = function (e, t, i, r, n) {
            var s, a, o, h;
            n = n || [",", "\t", "|", ";", b.RECORD_SEP, b.UNIT_SEP];

            for (var u = 0; u < n.length; u++) {
              var f = n[u],
                  d = 0,
                  l = 0,
                  c = 0;
              o = void 0;

              for (var p = new E({
                comments: r,
                delimiter: f,
                newline: t,
                preview: 10
              }).parse(e), g = 0; g < p.data.length; g++) if (i && y(p.data[g])) c++;else {
                var _ = p.data[g].length;
                l += _, void 0 !== o ? 0 < _ && (d += Math.abs(_ - o), o = _) : o = _;
              }

              0 < p.data.length && (l /= p.data.length - c), (void 0 === a || d <= a) && (void 0 === h || h < l) && 1.99 < l && (a = d, s = f, h = l);
            }

            return {
              successful: !!(m.delimiter = s),
              bestDelimiter: s
            };
          }(e, m.newline, m.skipEmptyLines, m.comments, m.delimitersToGuess);

          n.successful ? m.delimiter = n.bestDelimiter : (h = !0, m.delimiter = b.DefaultDelimiter), c.meta.delimiter = m.delimiter;
        }
        var s = w(m);
        return m.preview && m.header && s.preview++, a = e, o = new E(s), c = o.parse(a, t, i), g(), d ? {
          meta: {
            paused: !0
          }
        } : c || {
          meta: {
            paused: !1
          }
        };
      }, this.paused = function () {
        return d;
      }, this.pause = function () {
        d = !0, o.abort(), a = M(m.chunk) ? "" : a.substring(o.getCharIndex());
      }, this.resume = function () {
        t.streamer._halted ? (d = !1, t.streamer.parseChunk(a, !0)) : setTimeout(t.resume, 3);
      }, this.aborted = function () {
        return e;
      }, this.abort = function () {
        e = !0, o.abort(), c.meta.aborted = !0, M(m.complete) && m.complete(c), a = "";
      };
    }

    function j(e) {
      return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function E(e) {
      var S,
          O = (e = e || {}).delimiter,
          x = e.newline,
          I = e.comments,
          T = e.step,
          D = e.preview,
          A = e.fastMode,
          L = S = void 0 === e.quoteChar || null === e.quoteChar ? '"' : e.quoteChar;
      if (void 0 !== e.escapeChar && (L = e.escapeChar), ("string" != typeof O || -1 < b.BAD_DELIMITERS.indexOf(O)) && (O = ","), I === O) throw new Error("Comment character same as delimiter");
      !0 === I ? I = "#" : ("string" != typeof I || -1 < b.BAD_DELIMITERS.indexOf(I)) && (I = !1), "\n" !== x && "\r" !== x && "\r\n" !== x && (x = "\n");
      var F = 0,
          z = !1;
      this.parse = function (r, t, i) {
        if ("string" != typeof r) throw new Error("Input must be a string");
        var n = r.length,
            e = O.length,
            s = x.length,
            a = I.length,
            o = M(T),
            h = [],
            u = [],
            f = [],
            d = F = 0;
        if (!r) return C();

        if (A || !1 !== A && -1 === r.indexOf(S)) {
          for (var l = r.split(x), c = 0; c < l.length; c++) {
            if (f = l[c], F += f.length, c !== l.length - 1) F += x.length;else if (i) return C();

            if (!I || f.substring(0, a) !== I) {
              if (o) {
                if (h = [], k(f.split(O)), R(), z) return C();
              } else k(f.split(O));

              if (D && D <= c) return h = h.slice(0, D), C(!0);
            }
          }

          return C();
        }

        for (var p = r.indexOf(O, F), g = r.indexOf(x, F), _ = new RegExp(j(L) + j(S), "g"), m = r.indexOf(S, F);;) if (r[F] !== S) {
          if (I && 0 === f.length && r.substring(F, F + a) === I) {
            if (-1 === g) return C();
            F = g + s, g = r.indexOf(x, F), p = r.indexOf(O, F);
          } else if (-1 !== p && (p < g || -1 === g)) f.push(r.substring(F, p)), F = p + e, p = r.indexOf(O, F);else {
            if (-1 === g) break;
            if (f.push(r.substring(F, g)), w(g + s), o && (R(), z)) return C();
            if (D && h.length >= D) return C(!0);
          }
        } else for (m = F, F++;;) {
          if (-1 === (m = r.indexOf(S, m + 1))) return i || u.push({
            type: "Quotes",
            code: "MissingQuotes",
            message: "Quoted field unterminated",
            row: h.length,
            index: F
          }), E();
          if (m === n - 1) return E(r.substring(F, m).replace(_, S));

          if (S !== L || r[m + 1] !== L) {
            if (S === L || 0 === m || r[m - 1] !== L) {
              -1 !== p && p < m + 1 && (p = r.indexOf(O, m + 1)), -1 !== g && g < m + 1 && (g = r.indexOf(x, m + 1));
              var y = b(-1 === g ? p : Math.min(p, g));

              if (r.substr(m + 1 + y, e) === O) {
                f.push(r.substring(F, m).replace(_, S)), r[F = m + 1 + y + e] !== S && (m = r.indexOf(S, F)), p = r.indexOf(O, F), g = r.indexOf(x, F);
                break;
              }

              var v = b(g);

              if (r.substring(m + 1 + v, m + 1 + v + s) === x) {
                if (f.push(r.substring(F, m).replace(_, S)), w(m + 1 + v + s), p = r.indexOf(O, F), m = r.indexOf(S, F), o && (R(), z)) return C();
                if (D && h.length >= D) return C(!0);
                break;
              }

              u.push({
                type: "Quotes",
                code: "InvalidQuotes",
                message: "Trailing quote on quoted field is malformed",
                row: h.length,
                index: F
              }), m++;
            }
          } else m++;
        }

        return E();

        function k(e) {
          h.push(e), d = F;
        }

        function b(e) {
          var t = 0;

          if (-1 !== e) {
            var i = r.substring(m + 1, e);
            i && "" === i.trim() && (t = i.length);
          }

          return t;
        }

        function E(e) {
          return i || (void 0 === e && (e = r.substring(F)), f.push(e), F = n, k(f), o && R()), C();
        }

        function w(e) {
          F = e, k(f), f = [], g = r.indexOf(x, F);
        }

        function C(e) {
          return {
            data: h,
            errors: u,
            meta: {
              delimiter: O,
              linebreak: x,
              aborted: z,
              truncated: !!e,
              cursor: d + (t || 0)
            }
          };
        }

        function R() {
          T(C()), h = [], u = [];
        }
      }, this.abort = function () {
        z = !0;
      }, this.getCharIndex = function () {
        return F;
      };
    }

    function _(e) {
      var t = e.data,
          i = a[t.workerId],
          r = !1;
      if (t.error) i.userError(t.error, t.file);else if (t.results && t.results.data) {
        var n = {
          abort: function () {
            r = !0, m(t.workerId, {
              data: [],
              errors: [],
              meta: {
                aborted: !0
              }
            });
          },
          pause: y,
          resume: y
        };

        if (M(i.userStep)) {
          for (var s = 0; s < t.results.data.length && (i.userStep({
            data: t.results.data[s],
            errors: t.results.errors,
            meta: t.results.meta
          }, n), !r); s++);

          delete t.results;
        } else M(i.userChunk) && (i.userChunk(t.results, n, t.file), delete t.results);
      }
      t.finished && !r && m(t.workerId, t.results);
    }

    function m(e, t) {
      var i = a[e];
      M(i.userComplete) && i.userComplete(t), i.terminate(), delete a[e];
    }

    function y() {
      throw new Error("Not implemented.");
    }

    function w(e) {
      if ("object" != typeof e || null === e) return e;
      var t = Array.isArray(e) ? [] : {};

      for (var i in e) t[i] = w(e[i]);

      return t;
    }

    function v(e, t) {
      return function () {
        e.apply(t, arguments);
      };
    }

    function M(e) {
      return "function" == typeof e;
    }

    return o && (f.onmessage = function (e) {
      var t = e.data;
      void 0 === b.WORKER_ID && t && (b.WORKER_ID = t.workerId);
      if ("string" == typeof t.input) f.postMessage({
        workerId: b.WORKER_ID,
        results: b.parse(t.input, t.config),
        finished: !0
      });else if (f.File && t.input instanceof File || t.input instanceof Object) {
        var i = b.parse(t.input, t.config);
        i && f.postMessage({
          workerId: b.WORKER_ID,
          results: i,
          finished: !0
        });
      }
    }), (l.prototype = Object.create(u.prototype)).constructor = l, (c.prototype = Object.create(u.prototype)).constructor = c, (p.prototype = Object.create(p.prototype)).constructor = p, (g.prototype = Object.create(u.prototype)).constructor = g, b;
  });
});

var dist = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    module.exports = factory() ;
  })(commonjsGlobal, function () {

    function createCommonjsModule(fn, module) {
      return module = {
        exports: {}
      }, fn(module, module.exports), module.exports;
    }

    var _global = createCommonjsModule(function (module) {
      // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
      var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self // eslint-disable-next-line no-new-func
      : Function('return this')();

      if (typeof __g == 'number') {
        __g = global;
      } // eslint-disable-line no-undef

    });

    var _core = createCommonjsModule(function (module) {
      var core = module.exports = {
        version: '2.6.5'
      };

      if (typeof __e == 'number') {
        __e = core;
      } // eslint-disable-line no-undef

    });

    var _isObject = function _isObject(it) {
      return typeof it === 'object' ? it !== null : typeof it === 'function';
    };

    var _anObject = function _anObject(it) {
      if (!_isObject(it)) {
        throw TypeError(it + ' is not an object!');
      }

      return it;
    };

    var _fails = function _fails(exec) {
      try {
        return !!exec();
      } catch (e) {
        return true;
      }
    }; // Thank's IE8 for his funny defineProperty


    var _descriptors = !_fails(function () {
      return Object.defineProperty({}, 'a', {
        get: function () {
          return 7;
        }
      }).a != 7;
    });

    var document = _global.document; // typeof document.createElement is 'object' in old IE

    var is = _isObject(document) && _isObject(document.createElement);

    var _domCreate = function _domCreate(it) {
      return is ? document.createElement(it) : {};
    };

    var _ie8DomDefine = !_descriptors && !_fails(function () {
      return Object.defineProperty(_domCreate('div'), 'a', {
        get: function () {
          return 7;
        }
      }).a != 7;
    }); // 7.1.1 ToPrimitive(input [, PreferredType])
    // instead of the ES6 spec version, we didn't implement @@toPrimitive case
    // and the second argument - flag - preferred type is a string


    var _toPrimitive = function _toPrimitive(it, S) {
      if (!_isObject(it)) {
        return it;
      }

      var fn, val;

      if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) {
        return val;
      }

      if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) {
        return val;
      }

      if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) {
        return val;
      }

      throw TypeError("Can't convert object to primitive value");
    };

    var dP = Object.defineProperty;
    var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
      _anObject(O);

      P = _toPrimitive(P, true);

      _anObject(Attributes);

      if (_ie8DomDefine) {
        try {
          return dP(O, P, Attributes);
        } catch (e) {
          /* empty */
        }
      }

      if ('get' in Attributes || 'set' in Attributes) {
        throw TypeError('Accessors not supported!');
      }

      if ('value' in Attributes) {
        O[P] = Attributes.value;
      }

      return O;
    };
    var _objectDp = {
      f: f
    };

    var _propertyDesc = function _propertyDesc(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };

    var _hide = _descriptors ? function (object, key, value) {
      return _objectDp.f(object, key, _propertyDesc(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };

    var hasOwnProperty = {}.hasOwnProperty;

    var _has = function _has(it, key) {
      return hasOwnProperty.call(it, key);
    };

    var id = 0;
    var px = Math.random();

    var _uid = function _uid(key) {
      return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
    };

    var _shared = createCommonjsModule(function (module) {
      var SHARED = '__core-js_shared__';
      var store = _global[SHARED] || (_global[SHARED] = {});
      (module.exports = function (key, value) {
        return store[key] || (store[key] = value !== undefined ? value : {});
      })('versions', []).push({
        version: _core.version,
        mode: 'global',
        copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
      });
    });

    var _functionToString = _shared('native-function-to-string', Function.toString);

    var _redefine = createCommonjsModule(function (module) {
      var SRC = _uid('src');

      var TO_STRING = 'toString';

      var TPL = ('' + _functionToString).split(TO_STRING);

      _core.inspectSource = function (it) {
        return _functionToString.call(it);
      };

      (module.exports = function (O, key, val, safe) {
        var isFunction = typeof val == 'function';

        if (isFunction) {
          _has(val, 'name') || _hide(val, 'name', key);
        }

        if (O[key] === val) {
          return;
        }

        if (isFunction) {
          _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
        }

        if (O === _global) {
          O[key] = val;
        } else if (!safe) {
          delete O[key];

          _hide(O, key, val);
        } else if (O[key]) {
          O[key] = val;
        } else {
          _hide(O, key, val);
        } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

      })(Function.prototype, TO_STRING, function toString() {
        return typeof this == 'function' && this[SRC] || _functionToString.call(this);
      });
    });

    var _aFunction = function _aFunction(it) {
      if (typeof it != 'function') {
        throw TypeError(it + ' is not a function!');
      }

      return it;
    }; // optional / simple context binding


    var _ctx = function _ctx(fn, that, length) {
      _aFunction(fn);

      if (that === undefined) {
        return fn;
      }

      switch (length) {
        case 1:
          return function (a) {
            return fn.call(that, a);
          };

        case 2:
          return function (a, b) {
            return fn.call(that, a, b);
          };

        case 3:
          return function (a, b, c) {
            return fn.call(that, a, b, c);
          };
      }

      return function
        /* ...args */
      () {
        return fn.apply(that, arguments);
      };
    };

    var PROTOTYPE = 'prototype';

    var $export = function $export(type, name, source) {
      var IS_FORCED = type & $export.F;
      var IS_GLOBAL = type & $export.G;
      var IS_STATIC = type & $export.S;
      var IS_PROTO = type & $export.P;
      var IS_BIND = type & $export.B;
      var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
      var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
      var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
      var key, own, out, exp;

      if (IS_GLOBAL) {
        source = name;
      }

      for (key in source) {
        // contains in native
        own = !IS_FORCED && target && target[key] !== undefined; // export native or passed

        out = (own ? target : source)[key]; // bind timers to global for call from export context

        exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out; // extend global

        if (target) {
          _redefine(target, key, out, type & $export.U);
        } // export


        if (exports[key] != out) {
          _hide(exports, key, exp);
        }

        if (IS_PROTO && expProto[key] != out) {
          expProto[key] = out;
        }
      }
    };

    _global.core = _core; // type bitmap

    $export.F = 1; // forced

    $export.G = 2; // global

    $export.S = 4; // static

    $export.P = 8; // proto

    $export.B = 16; // bind

    $export.W = 32; // wrap

    $export.U = 64; // safe

    $export.R = 128; // real proto method for `library`

    var _export = $export; // 7.1.4 ToInteger

    var ceil = Math.ceil;
    var floor = Math.floor;

    var _toInteger = function _toInteger(it) {
      return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
    }; // 7.2.1 RequireObjectCoercible(argument)


    var _defined = function _defined(it) {
      if (it == undefined) {
        throw TypeError("Can't call method on  " + it);
      }

      return it;
    }; // true  -> String#at
    // false -> String#codePointAt


    var _stringAt = function _stringAt(TO_STRING) {
      return function (that, pos) {
        var s = String(_defined(that));

        var i = _toInteger(pos);

        var l = s.length;
        var a, b;

        if (i < 0 || i >= l) {
          return TO_STRING ? '' : undefined;
        }

        a = s.charCodeAt(i);
        return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
      };
    };

    var $at = _stringAt(false);

    _export(_export.P, 'String', {
      // 21.1.3.3 String.prototype.codePointAt(pos)
      codePointAt: function codePointAt(pos) {
        return $at(this, pos);
      }
    });
    var max = Math.max;
    var min = Math.min;

    var _toAbsoluteIndex = function _toAbsoluteIndex(index, length) {
      index = _toInteger(index);
      return index < 0 ? max(index + length, 0) : min(index, length);
    };

    var fromCharCode = String.fromCharCode;
    var $fromCodePoint = String.fromCodePoint; // length should be 1, old FF problem

    _export(_export.S + _export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
      // 21.1.2.2 String.fromCodePoint(...codePoints)
      fromCodePoint: function fromCodePoint(x) {
        var arguments$1 = arguments; // eslint-disable-line no-unused-vars

        var res = [];
        var aLen = arguments.length;
        var i = 0;
        var code;

        while (aLen > i) {
          code = +arguments$1[i++];

          if (_toAbsoluteIndex(code, 0x10ffff) !== code) {
            throw RangeError(code + ' is not a valid code point');
          }

          res.push(code < 0x10000 ? fromCharCode(code) : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00));
        }

        return res.join('');
      }
    });

    var Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
    var ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
    var ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;
    var unicode = {
      Space_Separator: Space_Separator,
      ID_Start: ID_Start,
      ID_Continue: ID_Continue
    };
    var util = {
      isSpaceSeparator: function isSpaceSeparator(c) {
        return typeof c === 'string' && unicode.Space_Separator.test(c);
      },
      isIdStartChar: function isIdStartChar(c) {
        return typeof c === 'string' && (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '$' || c === '_' || unicode.ID_Start.test(c));
      },
      isIdContinueChar: function isIdContinueChar(c) {
        return typeof c === 'string' && (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c === '$' || c === '_' || c === '\u200C' || c === '\u200D' || unicode.ID_Continue.test(c));
      },
      isDigit: function isDigit(c) {
        return typeof c === 'string' && /[0-9]/.test(c);
      },
      isHexDigit: function isHexDigit(c) {
        return typeof c === 'string' && /[0-9A-Fa-f]/.test(c);
      }
    };
    var source;
    var parseState;
    var stack;
    var pos;
    var line;
    var column;
    var token;
    var key;
    var root;

    var parse = function parse(text, reviver) {
      source = String(text);
      parseState = 'start';
      stack = [];
      pos = 0;
      line = 1;
      column = 0;
      token = undefined;
      key = undefined;
      root = undefined;

      do {
        token = lex(); // This code is unreachable.
        // if (!parseStates[parseState]) {
        //     throw invalidParseState()
        // }

        parseStates[parseState]();
      } while (token.type !== 'eof');

      if (typeof reviver === 'function') {
        return internalize({
          '': root
        }, '', reviver);
      }

      return root;
    };

    function internalize(holder, name, reviver) {
      var value = holder[name];

      if (value != null && typeof value === 'object') {
        if (Array.isArray(value)) {
          for (var i = 0; i < value.length; i++) {
            var key = String(i);
            var replacement = internalize(value, key, reviver);

            if (replacement === undefined) {
              delete value[key];
            } else {
              Object.defineProperty(value, key, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        } else {
          for (var key$1 in value) {
            var replacement$1 = internalize(value, key$1, reviver);

            if (replacement$1 === undefined) {
              delete value[key$1];
            } else {
              Object.defineProperty(value, key$1, {
                value: replacement$1,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        }
      }

      return reviver.call(holder, name, value);
    }

    var lexState;
    var buffer;
    var doubleQuote;
    var sign;
    var c;

    function lex() {
      lexState = 'default';
      buffer = '';
      doubleQuote = false;
      sign = 1;

      for (;;) {
        c = peek(); // This code is unreachable.
        // if (!lexStates[lexState]) {
        //     throw invalidLexState(lexState)
        // }

        var token = lexStates[lexState]();

        if (token) {
          return token;
        }
      }
    }

    function peek() {
      if (source[pos]) {
        return String.fromCodePoint(source.codePointAt(pos));
      }
    }

    function read() {
      var c = peek();

      if (c === '\n') {
        line++;
        column = 0;
      } else if (c) {
        column += c.length;
      } else {
        column++;
      }

      if (c) {
        pos += c.length;
      }

      return c;
    }

    var lexStates = {
      default: function default$1() {
        switch (c) {
          case '\t':
          case '\v':
          case '\f':
          case ' ':
          case '\u00A0':
          case '\uFEFF':
          case '\n':
          case '\r':
          case '\u2028':
          case '\u2029':
            read();
            return;

          case '/':
            read();
            lexState = 'comment';
            return;

          case undefined:
            read();
            return newToken('eof');
        }

        if (util.isSpaceSeparator(c)) {
          read();
          return;
        } // This code is unreachable.
        // if (!lexStates[parseState]) {
        //     throw invalidLexState(parseState)
        // }


        return lexStates[parseState]();
      },
      comment: function comment() {
        switch (c) {
          case '*':
            read();
            lexState = 'multiLineComment';
            return;

          case '/':
            read();
            lexState = 'singleLineComment';
            return;
        }

        throw invalidChar(read());
      },
      multiLineComment: function multiLineComment() {
        switch (c) {
          case '*':
            read();
            lexState = 'multiLineCommentAsterisk';
            return;

          case undefined:
            throw invalidChar(read());
        }

        read();
      },
      multiLineCommentAsterisk: function multiLineCommentAsterisk() {
        switch (c) {
          case '*':
            read();
            return;

          case '/':
            read();
            lexState = 'default';
            return;

          case undefined:
            throw invalidChar(read());
        }

        read();
        lexState = 'multiLineComment';
      },
      singleLineComment: function singleLineComment() {
        switch (c) {
          case '\n':
          case '\r':
          case '\u2028':
          case '\u2029':
            read();
            lexState = 'default';
            return;

          case undefined:
            read();
            return newToken('eof');
        }

        read();
      },
      value: function value() {
        switch (c) {
          case '{':
          case '[':
            return newToken('punctuator', read());

          case 'n':
            read();
            literal('ull');
            return newToken('null', null);

          case 't':
            read();
            literal('rue');
            return newToken('boolean', true);

          case 'f':
            read();
            literal('alse');
            return newToken('boolean', false);

          case '-':
          case '+':
            if (read() === '-') {
              sign = -1;
            }

            lexState = 'sign';
            return;

          case '.':
            buffer = read();
            lexState = 'decimalPointLeading';
            return;

          case '0':
            buffer = read();
            lexState = 'zero';
            return;

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            buffer = read();
            lexState = 'decimalInteger';
            return;

          case 'I':
            read();
            literal('nfinity');
            return newToken('numeric', Infinity);

          case 'N':
            read();
            literal('aN');
            return newToken('numeric', NaN);

          case '"':
          case "'":
            doubleQuote = read() === '"';
            buffer = '';
            lexState = 'string';
            return;
        }

        throw invalidChar(read());
      },
      identifierNameStartEscape: function identifierNameStartEscape() {
        if (c !== 'u') {
          throw invalidChar(read());
        }

        read();
        var u = unicodeEscape();

        switch (u) {
          case '$':
          case '_':
            break;

          default:
            if (!util.isIdStartChar(u)) {
              throw invalidIdentifier();
            }

            break;
        }

        buffer += u;
        lexState = 'identifierName';
      },
      identifierName: function identifierName() {
        switch (c) {
          case '$':
          case '_':
          case '\u200C':
          case '\u200D':
            buffer += read();
            return;

          case '\\':
            read();
            lexState = 'identifierNameEscape';
            return;
        }

        if (util.isIdContinueChar(c)) {
          buffer += read();
          return;
        }

        return newToken('identifier', buffer);
      },
      identifierNameEscape: function identifierNameEscape() {
        if (c !== 'u') {
          throw invalidChar(read());
        }

        read();
        var u = unicodeEscape();

        switch (u) {
          case '$':
          case '_':
          case '\u200C':
          case '\u200D':
            break;

          default:
            if (!util.isIdContinueChar(u)) {
              throw invalidIdentifier();
            }

            break;
        }

        buffer += u;
        lexState = 'identifierName';
      },
      sign: function sign$1() {
        switch (c) {
          case '.':
            buffer = read();
            lexState = 'decimalPointLeading';
            return;

          case '0':
            buffer = read();
            lexState = 'zero';
            return;

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            buffer = read();
            lexState = 'decimalInteger';
            return;

          case 'I':
            read();
            literal('nfinity');
            return newToken('numeric', sign * Infinity);

          case 'N':
            read();
            literal('aN');
            return newToken('numeric', NaN);
        }

        throw invalidChar(read());
      },
      zero: function zero() {
        switch (c) {
          case '.':
            buffer += read();
            lexState = 'decimalPoint';
            return;

          case 'e':
          case 'E':
            buffer += read();
            lexState = 'decimalExponent';
            return;

          case 'x':
          case 'X':
            buffer += read();
            lexState = 'hexadecimal';
            return;
        }

        return newToken('numeric', sign * 0);
      },
      decimalInteger: function decimalInteger() {
        switch (c) {
          case '.':
            buffer += read();
            lexState = 'decimalPoint';
            return;

          case 'e':
          case 'E':
            buffer += read();
            lexState = 'decimalExponent';
            return;
        }

        if (util.isDigit(c)) {
          buffer += read();
          return;
        }

        return newToken('numeric', sign * Number(buffer));
      },
      decimalPointLeading: function decimalPointLeading() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = 'decimalFraction';
          return;
        }

        throw invalidChar(read());
      },
      decimalPoint: function decimalPoint() {
        switch (c) {
          case 'e':
          case 'E':
            buffer += read();
            lexState = 'decimalExponent';
            return;
        }

        if (util.isDigit(c)) {
          buffer += read();
          lexState = 'decimalFraction';
          return;
        }

        return newToken('numeric', sign * Number(buffer));
      },
      decimalFraction: function decimalFraction() {
        switch (c) {
          case 'e':
          case 'E':
            buffer += read();
            lexState = 'decimalExponent';
            return;
        }

        if (util.isDigit(c)) {
          buffer += read();
          return;
        }

        return newToken('numeric', sign * Number(buffer));
      },
      decimalExponent: function decimalExponent() {
        switch (c) {
          case '+':
          case '-':
            buffer += read();
            lexState = 'decimalExponentSign';
            return;
        }

        if (util.isDigit(c)) {
          buffer += read();
          lexState = 'decimalExponentInteger';
          return;
        }

        throw invalidChar(read());
      },
      decimalExponentSign: function decimalExponentSign() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = 'decimalExponentInteger';
          return;
        }

        throw invalidChar(read());
      },
      decimalExponentInteger: function decimalExponentInteger() {
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }

        return newToken('numeric', sign * Number(buffer));
      },
      hexadecimal: function hexadecimal() {
        if (util.isHexDigit(c)) {
          buffer += read();
          lexState = 'hexadecimalInteger';
          return;
        }

        throw invalidChar(read());
      },
      hexadecimalInteger: function hexadecimalInteger() {
        if (util.isHexDigit(c)) {
          buffer += read();
          return;
        }

        return newToken('numeric', sign * Number(buffer));
      },
      string: function string() {
        switch (c) {
          case '\\':
            read();
            buffer += escape();
            return;

          case '"':
            if (doubleQuote) {
              read();
              return newToken('string', buffer);
            }

            buffer += read();
            return;

          case "'":
            if (!doubleQuote) {
              read();
              return newToken('string', buffer);
            }

            buffer += read();
            return;

          case '\n':
          case '\r':
            throw invalidChar(read());

          case '\u2028':
          case '\u2029':
            separatorChar(c);
            break;

          case undefined:
            throw invalidChar(read());
        }

        buffer += read();
      },
      start: function start() {
        switch (c) {
          case '{':
          case '[':
            return newToken('punctuator', read());
          // This code is unreachable since the default lexState handles eof.
          // case undefined:
          //     return newToken('eof')
        }

        lexState = 'value';
      },
      beforePropertyName: function beforePropertyName() {
        switch (c) {
          case '$':
          case '_':
            buffer = read();
            lexState = 'identifierName';
            return;

          case '\\':
            read();
            lexState = 'identifierNameStartEscape';
            return;

          case '}':
            return newToken('punctuator', read());

          case '"':
          case "'":
            doubleQuote = read() === '"';
            lexState = 'string';
            return;
        }

        if (util.isIdStartChar(c)) {
          buffer += read();
          lexState = 'identifierName';
          return;
        }

        throw invalidChar(read());
      },
      afterPropertyName: function afterPropertyName() {
        if (c === ':') {
          return newToken('punctuator', read());
        }

        throw invalidChar(read());
      },
      beforePropertyValue: function beforePropertyValue() {
        lexState = 'value';
      },
      afterPropertyValue: function afterPropertyValue() {
        switch (c) {
          case ',':
          case '}':
            return newToken('punctuator', read());
        }

        throw invalidChar(read());
      },
      beforeArrayValue: function beforeArrayValue() {
        if (c === ']') {
          return newToken('punctuator', read());
        }

        lexState = 'value';
      },
      afterArrayValue: function afterArrayValue() {
        switch (c) {
          case ',':
          case ']':
            return newToken('punctuator', read());
        }

        throw invalidChar(read());
      },
      end: function end() {
        // This code is unreachable since it's handled by the default lexState.
        // if (c === undefined) {
        //     read()
        //     return newToken('eof')
        // }
        throw invalidChar(read());
      }
    };

    function newToken(type, value) {
      return {
        type: type,
        value: value,
        line: line,
        column: column
      };
    }

    function literal(s) {
      for (var i = 0, list = s; i < list.length; i += 1) {
        var c = list[i];
        var p = peek();

        if (p !== c) {
          throw invalidChar(read());
        }

        read();
      }
    }

    function escape() {
      var c = peek();

      switch (c) {
        case 'b':
          read();
          return '\b';

        case 'f':
          read();
          return '\f';

        case 'n':
          read();
          return '\n';

        case 'r':
          read();
          return '\r';

        case 't':
          read();
          return '\t';

        case 'v':
          read();
          return '\v';

        case '0':
          read();

          if (util.isDigit(peek())) {
            throw invalidChar(read());
          }

          return '\0';

        case 'x':
          read();
          return hexEscape();

        case 'u':
          read();
          return unicodeEscape();

        case '\n':
        case '\u2028':
        case '\u2029':
          read();
          return '';

        case '\r':
          read();

          if (peek() === '\n') {
            read();
          }

          return '';

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          throw invalidChar(read());

        case undefined:
          throw invalidChar(read());
      }

      return read();
    }

    function hexEscape() {
      var buffer = '';
      var c = peek();

      if (!util.isHexDigit(c)) {
        throw invalidChar(read());
      }

      buffer += read();
      c = peek();

      if (!util.isHexDigit(c)) {
        throw invalidChar(read());
      }

      buffer += read();
      return String.fromCodePoint(parseInt(buffer, 16));
    }

    function unicodeEscape() {
      var buffer = '';
      var count = 4;

      while (count-- > 0) {
        var c = peek();

        if (!util.isHexDigit(c)) {
          throw invalidChar(read());
        }

        buffer += read();
      }

      return String.fromCodePoint(parseInt(buffer, 16));
    }

    var parseStates = {
      start: function start() {
        if (token.type === 'eof') {
          throw invalidEOF();
        }

        push();
      },
      beforePropertyName: function beforePropertyName() {
        switch (token.type) {
          case 'identifier':
          case 'string':
            key = token.value;
            parseState = 'afterPropertyName';
            return;

          case 'punctuator':
            // This code is unreachable since it's handled by the lexState.
            // if (token.value !== '}') {
            //     throw invalidToken()
            // }
            pop();
            return;

          case 'eof':
            throw invalidEOF();
        } // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()

      },
      afterPropertyName: function afterPropertyName() {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'punctuator' || token.value !== ':') {
        //     throw invalidToken()
        // }
        if (token.type === 'eof') {
          throw invalidEOF();
        }

        parseState = 'beforePropertyValue';
      },
      beforePropertyValue: function beforePropertyValue() {
        if (token.type === 'eof') {
          throw invalidEOF();
        }

        push();
      },
      beforeArrayValue: function beforeArrayValue() {
        if (token.type === 'eof') {
          throw invalidEOF();
        }

        if (token.type === 'punctuator' && token.value === ']') {
          pop();
          return;
        }

        push();
      },
      afterPropertyValue: function afterPropertyValue() {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'punctuator') {
        //     throw invalidToken()
        // }
        if (token.type === 'eof') {
          throw invalidEOF();
        }

        switch (token.value) {
          case ',':
            parseState = 'beforePropertyName';
            return;

          case '}':
            pop();
        } // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()

      },
      afterArrayValue: function afterArrayValue() {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'punctuator') {
        //     throw invalidToken()
        // }
        if (token.type === 'eof') {
          throw invalidEOF();
        }

        switch (token.value) {
          case ',':
            parseState = 'beforeArrayValue';
            return;

          case ']':
            pop();
        } // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()

      },
      end: function end() {// This code is unreachable since it's handled by the lexState.
        // if (token.type !== 'eof') {
        //     throw invalidToken()
        // }
      }
    };

    function push() {
      var value;

      switch (token.type) {
        case 'punctuator':
          switch (token.value) {
            case '{':
              value = {};
              break;

            case '[':
              value = [];
              break;
          }

          break;

        case 'null':
        case 'boolean':
        case 'numeric':
        case 'string':
          value = token.value;
          break;
        // This code is unreachable.
        // default:
        //     throw invalidToken()
      }

      if (root === undefined) {
        root = value;
      } else {
        var parent = stack[stack.length - 1];

        if (Array.isArray(parent)) {
          parent.push(value);
        } else {
          Object.defineProperty(parent, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }

      if (value !== null && typeof value === 'object') {
        stack.push(value);

        if (Array.isArray(value)) {
          parseState = 'beforeArrayValue';
        } else {
          parseState = 'beforePropertyName';
        }
      } else {
        var current = stack[stack.length - 1];

        if (current == null) {
          parseState = 'end';
        } else if (Array.isArray(current)) {
          parseState = 'afterArrayValue';
        } else {
          parseState = 'afterPropertyValue';
        }
      }
    }

    function pop() {
      stack.pop();
      var current = stack[stack.length - 1];

      if (current == null) {
        parseState = 'end';
      } else if (Array.isArray(current)) {
        parseState = 'afterArrayValue';
      } else {
        parseState = 'afterPropertyValue';
      }
    } // This code is unreachable.
    // function invalidParseState () {
    //     return new Error(`JSON5: invalid parse state '${parseState}'`)
    // }
    // This code is unreachable.
    // function invalidLexState (state) {
    //     return new Error(`JSON5: invalid lex state '${state}'`)
    // }


    function invalidChar(c) {
      if (c === undefined) {
        return syntaxError("JSON5: invalid end of input at " + line + ":" + column);
      }

      return syntaxError("JSON5: invalid character '" + formatChar(c) + "' at " + line + ":" + column);
    }

    function invalidEOF() {
      return syntaxError("JSON5: invalid end of input at " + line + ":" + column);
    } // This code is unreachable.
    // function invalidToken () {
    //     if (token.type === 'eof') {
    //         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
    //     }
    //     const c = String.fromCodePoint(token.value.codePointAt(0))
    //     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
    // }


    function invalidIdentifier() {
      column -= 5;
      return syntaxError("JSON5: invalid identifier character at " + line + ":" + column);
    }

    function separatorChar(c) {
      console.warn("JSON5: '" + formatChar(c) + "' in strings is not valid ECMAScript; consider escaping");
    }

    function formatChar(c) {
      var replacements = {
        "'": "\\'",
        '"': '\\"',
        '\\': '\\\\',
        '\b': '\\b',
        '\f': '\\f',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        '\v': '\\v',
        '\0': '\\0',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029'
      };

      if (replacements[c]) {
        return replacements[c];
      }

      if (c < ' ') {
        var hexString = c.charCodeAt(0).toString(16);
        return '\\x' + ('00' + hexString).substring(hexString.length);
      }

      return c;
    }

    function syntaxError(message) {
      var err = new SyntaxError(message);
      err.lineNumber = line;
      err.columnNumber = column;
      return err;
    }

    var stringify = function stringify(value, replacer, space) {
      var stack = [];
      var indent = '';
      var propertyList;
      var replacerFunc;
      var gap = '';
      var quote;

      if (replacer != null && typeof replacer === 'object' && !Array.isArray(replacer)) {
        space = replacer.space;
        quote = replacer.quote;
        replacer = replacer.replacer;
      }

      if (typeof replacer === 'function') {
        replacerFunc = replacer;
      } else if (Array.isArray(replacer)) {
        propertyList = [];

        for (var i = 0, list = replacer; i < list.length; i += 1) {
          var v = list[i];
          var item = void 0;

          if (typeof v === 'string') {
            item = v;
          } else if (typeof v === 'number' || v instanceof String || v instanceof Number) {
            item = String(v);
          }

          if (item !== undefined && propertyList.indexOf(item) < 0) {
            propertyList.push(item);
          }
        }
      }

      if (space instanceof Number) {
        space = Number(space);
      } else if (space instanceof String) {
        space = String(space);
      }

      if (typeof space === 'number') {
        if (space > 0) {
          space = Math.min(10, Math.floor(space));
          gap = '          '.substr(0, space);
        }
      } else if (typeof space === 'string') {
        gap = space.substr(0, 10);
      }

      return serializeProperty('', {
        '': value
      });

      function serializeProperty(key, holder) {
        var value = holder[key];

        if (value != null) {
          if (typeof value.toJSON5 === 'function') {
            value = value.toJSON5(key);
          } else if (typeof value.toJSON === 'function') {
            value = value.toJSON(key);
          }
        }

        if (replacerFunc) {
          value = replacerFunc.call(holder, key, value);
        }

        if (value instanceof Number) {
          value = Number(value);
        } else if (value instanceof String) {
          value = String(value);
        } else if (value instanceof Boolean) {
          value = value.valueOf();
        }

        switch (value) {
          case null:
            return 'null';

          case true:
            return 'true';

          case false:
            return 'false';
        }

        if (typeof value === 'string') {
          return quoteString(value);
        }

        if (typeof value === 'number') {
          return String(value);
        }

        if (typeof value === 'object') {
          return Array.isArray(value) ? serializeArray(value) : serializeObject(value);
        }

        return undefined;
      }

      function quoteString(value) {
        var quotes = {
          "'": 0.1,
          '"': 0.2
        };
        var replacements = {
          "'": "\\'",
          '"': '\\"',
          '\\': '\\\\',
          '\b': '\\b',
          '\f': '\\f',
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t',
          '\v': '\\v',
          '\0': '\\0',
          '\u2028': '\\u2028',
          '\u2029': '\\u2029'
        };
        var product = '';

        for (var i = 0; i < value.length; i++) {
          var c = value[i];

          switch (c) {
            case "'":
            case '"':
              quotes[c]++;
              product += c;
              continue;

            case '\0':
              if (util.isDigit(value[i + 1])) {
                product += '\\x00';
                continue;
              }

          }

          if (replacements[c]) {
            product += replacements[c];
            continue;
          }

          if (c < ' ') {
            var hexString = c.charCodeAt(0).toString(16);
            product += '\\x' + ('00' + hexString).substring(hexString.length);
            continue;
          }

          product += c;
        }

        var quoteChar = quote || Object.keys(quotes).reduce(function (a, b) {
          return quotes[a] < quotes[b] ? a : b;
        });
        product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);
        return quoteChar + product + quoteChar;
      }

      function serializeObject(value) {
        if (stack.indexOf(value) >= 0) {
          throw TypeError('Converting circular structure to JSON5');
        }

        stack.push(value);
        var stepback = indent;
        indent = indent + gap;
        var keys = propertyList || Object.keys(value);
        var partial = [];

        for (var i = 0, list = keys; i < list.length; i += 1) {
          var key = list[i];
          var propertyString = serializeProperty(key, value);

          if (propertyString !== undefined) {
            var member = serializeKey(key) + ':';

            if (gap !== '') {
              member += ' ';
            }

            member += propertyString;
            partial.push(member);
          }
        }

        var final;

        if (partial.length === 0) {
          final = '{}';
        } else {
          var properties;

          if (gap === '') {
            properties = partial.join(',');
            final = '{' + properties + '}';
          } else {
            var separator = ',\n' + indent;
            properties = partial.join(separator);
            final = '{\n' + indent + properties + ',\n' + stepback + '}';
          }
        }

        stack.pop();
        indent = stepback;
        return final;
      }

      function serializeKey(key) {
        if (key.length === 0) {
          return quoteString(key);
        }

        var firstChar = String.fromCodePoint(key.codePointAt(0));

        if (!util.isIdStartChar(firstChar)) {
          return quoteString(key);
        }

        for (var i = firstChar.length; i < key.length; i++) {
          if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
            return quoteString(key);
          }
        }

        return key;
      }

      function serializeArray(value) {
        if (stack.indexOf(value) >= 0) {
          throw TypeError('Converting circular structure to JSON5');
        }

        stack.push(value);
        var stepback = indent;
        indent = indent + gap;
        var partial = [];

        for (var i = 0; i < value.length; i++) {
          var propertyString = serializeProperty(String(i), value);
          partial.push(propertyString !== undefined ? propertyString : 'null');
        }

        var final;

        if (partial.length === 0) {
          final = '[]';
        } else {
          if (gap === '') {
            var properties = partial.join(',');
            final = '[' + properties + ']';
          } else {
            var separator = ',\n' + indent;
            var properties$1 = partial.join(separator);
            final = '[\n' + indent + properties$1 + ',\n' + stepback + ']';
          }
        }

        stack.pop();
        indent = stepback;
        return final;
      }
    };

    var JSON5 = {
      parse: parse,
      stringify: stringify
    };
    var lib = JSON5;
    var es5 = lib;
    return es5;
  });
});

function transformHeader(h) {
  return h.trim().replace(/[.]/g, "").replace(/(-|_)/g, " ").toLocaleLowerCase();
} // https://support.code.org/hc/en-us/articles/5257673491469-Submit-Datasets-for-Data-Science-
// spec: https://www.datascience4everyone.org/_files/ugd/d2c47c_db9901e7a3b04350b561457bea71b48e.pdf


function googleSheetUrl(id, sheet = "Sheet1") {
  let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
  if (sheet) url += `&sheet=${sheet}`;
  return url;
}

function patchCsvUrl(url) {
  const good = /*#__PURE__*/_wrapRegExp(/https:\/\/docs.google.com\/spreadsheets\/d\/((?:(?!\/)[\s\S])+)\//i, {
    id: 1
  }).exec(url);

  if (good) return googleSheetUrl(good.groups.id);
  return url;
}

async function tryParseJson(source) {
  try {
    const data = dist.parse(source);
    if (data && Array.isArray(data) && typeof data[0] === "object") return {
      file: {
        data
      }
    };else return {
      file: {
        errors: [{
          type: "json",
          code: "invalid",
          message: "Invalid JSON",
          row: 0
        }]
      }
    };
  } catch (e) {
    return undefined;
  }
}

const cachedCSVs = {};
const handlers = {
  download: async msg => {
    const url = patchCsvUrl(msg.url);
    if (cachedCSVs[url]) return Promise.resolve(cachedCSVs[url]);

    try {
      const resp = await fetch(url);
      const source = await resp.text();
      const res = await handlers.parse({
        type: "parse",
        source
      });
      cachedCSVs[url] = res;
      return res;
    } catch (e) {
      return {
        file: {
          errors: [{
            type: "json",
            code: "invalid",
            message: e + "",
            row: 0
          }]
        }
      };
    }
  },
  save: async msg => {
    const {
      fileHandle,
      data
    } = msg; // convert to CSV

    const contents = papaparse_min.unparse(data); // Create a FileSystemWritableFileStream to write to.

    const writable = await fileHandle.createWritable(); // Write the contents of the file to the stream.

    await writable.write(contents); // Close the file and write the contents to disk.

    await writable.close();
    return {};
  },
  parse: async msg => {
    const {
      source
    } = msg;

    if (/\s*\[/.test(source)) {
      const res = await tryParseJson(source);
      if (res) return res;
    }

    return new Promise(resolve => {
      papaparse_min.parse(source, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        comments: "#",
        transformHeader,
        complete: r => {
          resolve({
            file: r
          });
        }
      });
    });
  },
  unparse: async msg => {
    const {
      data
    } = msg;
    const text = papaparse_min.unparse(data);
    return {
      text
    };
  }
};

async function handleMessage(event) {
  const message = event.data;
  const {
    id,
    worker,
    type
  } = message;
  if (worker !== "csv") return;

  try {
    const handler = handlers[type];
    const resp = await handler(message);
    self.postMessage(_extends({
      id,
      worker
    }, resp));
  } catch (e) {
    self.postMessage({
      id,
      worker,
      error: e + ""
    });
  }
}

self.addEventListener("message", handleMessage);
console.debug(`csv: worker registered`);
//# sourceMappingURL=csv-worker.js.map

/******/ })()
;
//# sourceMappingURL=440-4d09d6f757bf2ebcd605.js.map