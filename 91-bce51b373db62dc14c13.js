(self["webpackChunkdata_science_editor"] = self["webpackChunkdata_science_editor"] || []).push([[91],{

/***/ 5474:
/***/ (function(module) {

"use strict";

var restoreFunctions = [];
function after(host, name, cb) {
    var originalFn = host[name];
    var restoreFn;
    if (originalFn) {
        host[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            originalFn.apply(this, args);
            cb(host);
        };
        restoreFn = function () {
            host[name] = originalFn;
        };
    }
    else {
        host[name] = function () {
            cb(host);
        };
        restoreFn = function () {
            delete host[name];
        };
    }
    restoreFunctions.push(restoreFn);
}
after.restorePatchedMethods = function () {
    restoreFunctions.forEach(function (restoreFn) { return restoreFn(); });
    restoreFunctions = [];
};
module.exports = after;
//# sourceMappingURL=after.js.map

/***/ }),

/***/ 848:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var _cache = {};
var cache = {
    set: function (key, value) {
        _cache[key] = value;
    },
    get: function (key) {
        return _cache[key];
    },
    clear: function () {
        Object.keys(_cache).forEach(function (key) {
            delete _cache[key];
        });
    }
};
exports["default"] = cache;
//# sourceMappingURL=cache.js.map

/***/ }),

/***/ 6091:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* global Promise */
var axeCore = __webpack_require__(5518);
var rIC = __webpack_require__(6308);
var after = __webpack_require__(5474);
var cache_1 = __importDefault(__webpack_require__(848));
var requestIdleCallback = rIC.request;
var cancelIdleCallback = rIC.cancel;
var React;
var ReactDOM;
var logger;
// contrasted against Chrome default color of #ffffff
var lightTheme = {
    serious: '#d93251',
    minor: '#d24700',
    text: 'black'
};
// contrasted against Safari dark mode color of #535353
var darkTheme = {
    serious: '#ffb3b3',
    minor: '#ffd500',
    text: 'white'
};
var theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? darkTheme
    : lightTheme;
var boldCourier = 'font-weight:bold;font-family:Courier;';
var critical = "color:".concat(theme.serious, ";font-weight:bold;");
var serious = "color:".concat(theme.serious, ";font-weight:normal;");
var moderate = "color:".concat(theme.minor, ";font-weight:bold;");
var minor = "color:".concat(theme.minor, ";font-weight:normal;");
var defaultReset = "font-color:".concat(theme.text, ";font-weight:normal;");
var idleId;
var timeout;
var context;
var conf;
var _createElement;
var components = {};
var nodes = [document.documentElement];
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// @see https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
    var _timeout;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var later = function () {
            _timeout = null;
            if (!immediate)
                func.apply(_this, args);
        };
        var callNow = immediate && !_timeout;
        clearTimeout(_timeout);
        _timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(this, args);
    };
}
/**
 * Return the entire parent tree of a node (from HTML down).
 * @param {Node} node
 * @return {Node[]}
 */
function getPath(node) {
    var path = [node];
    while (node && node.nodeName.toLowerCase() !== 'html') {
        path.push(node.parentNode);
        node = node.parentNode;
    }
    if (!node || !node.parentNode) {
        return null;
    }
    return path.reverse();
}
/**
 * Find the common parent of an array of nodes.
 * @param {Node[]} nodes
 * @return {Node}
 */
function getCommonParent(nodes) {
    var path;
    var nextPath;
    if (nodes.length === 1) {
        return nodes.pop();
    }
    while (!path && nodes.length) {
        path = getPath(nodes.pop());
    }
    while (nodes.length) {
        nextPath = getPath(nodes.pop());
        if (nextPath) {
            path = path.filter(function (node, index) {
                return nextPath.length > index && nextPath[index] === node;
            });
        }
    }
    return path ? path[path.length - 1] : document;
}
/**
 * Log the axe result node to the console
 * @param {NodeResult} node
 * @param {Function} logFn console log function to use (error, warn, log, etc.)
 */
function logElement(node, logFn) {
    var el = document.querySelector(node.target.toString());
    if (!el) {
        logFn('Selector: %c%s', boldCourier, node.target.toString());
    }
    else {
        logFn('Element: %o', el);
    }
}
/**
 * Log the axe result node html tot he console
 * @param {NodeResult} node
 */
function logHtml(node) {
    console.log('HTML: %c%s', boldCourier, node.html);
}
/**
 * Log the failure message of a node result.
 * @param {NodeResult} node
 * @param {String} key which check array to log from (any, all, none)
 */
function logFailureMessage(node, key) {
    // this exists on axe but we don't export it as part of the typescript
    // namespace, so just let me use it as I need
    var message = axeCore._audit.data.failureSummaries[key].failureMessage(node[key].map(function (check) { return check.message || ''; }));
    console.error(message);
}
/**
 * Log as a group the node result and failure message.
 * @param {NodeResult} node
 * @param {String} key which check array to log from (any, all, none)
 */
function failureSummary(node, key) {
    if (node[key].length > 0) {
        logElement(node, console.groupCollapsed);
        logHtml(node);
        logFailureMessage(node, key);
        var relatedNodes_1 = [];
        node[key].forEach(function (check) {
            relatedNodes_1 = relatedNodes_1.concat(check.relatedNodes);
        });
        if (relatedNodes_1.length > 0) {
            console.groupCollapsed('Related nodes');
            relatedNodes_1.forEach(function (relatedNode) {
                logElement(relatedNode, console.log);
                logHtml(relatedNode);
            });
            console.groupEnd();
        }
        console.groupEnd();
    }
}
/**
 * Run axe against the passed in node and report violations
 * @param {*} node
 * @param {Number} timeout force call of axe.run after the timeout has passed (if not called before)
 * @return {Promise}
 */
function checkAndReport(node, timeout) {
    var disableDeduplicate = conf['disableDeduplicate'];
    if (idleId) {
        cancelIdleCallback(idleId);
        idleId = undefined;
    }
    return new Promise(function (resolve, reject) {
        nodes.push(node);
        idleId = requestIdleCallback(function () {
            var n = context;
            if (n === undefined) {
                n = getCommonParent(nodes.filter(function (node) { return node.isConnected; }));
                if (n.nodeName.toLowerCase() === 'html') {
                    // if the only common parent is the body, then analyze the whole page
                    n = document;
                }
            }
            axeCore.configure({ allowedOrigins: ['<unsafe_all_origins>'] });
            axeCore.run(n, { reporter: 'v2' }, function (error, results) {
                if (error) {
                    return reject(error);
                }
                results.violations = results.violations.filter(function (result) {
                    result.nodes = result.nodes.filter(function (node) {
                        var key = node.target.toString() + result.id;
                        var retVal = !cache_1.default.get(key);
                        cache_1.default.set(key, key);
                        return disableDeduplicate || retVal;
                    });
                    return !!result.nodes.length;
                });
                if (results.violations.length) {
                    logger(results);
                }
                resolve();
            });
        }, {
            timeout: timeout
        });
    });
}
/**
 * Check the node for violations.
 * @param {Component} component
 */
function checkNode(component) {
    var node;
    try {
        node = ReactDOM.findDOMNode(component);
    }
    catch (e) {
        console.group('%caxe error: could not check node', critical);
        console.group('%cComponent', serious);
        console.error(component);
        console.groupEnd();
        console.group('%cError', serious);
        console.error(e);
        console.groupEnd();
        console.groupEnd();
    }
    if (node) {
        checkAndReport(node, timeout);
    }
}
/**
 * Check the component for violations whenever the DOM updates
 * @param {Component} component
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function componentAfterRender(component) {
    var debounceCheckNode = debounce(checkNode, timeout, true);
    after(component, 'componentDidMount', debounceCheckNode);
    after(component, 'componentDidUpdate', debounceCheckNode);
}
/**
 * Add a component to track.
 * @param {Component} component
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addComponent(component) {
    var reactInstance = component._reactInternalInstance || {};
    var reactInstanceDebugID = reactInstance._debugID;
    var reactFiberInstance = component._reactInternalFiber || {};
    var reactFiberInstanceDebugID = reactFiberInstance._debugID;
    var reactInternals = component._reactInternals || {};
    var reactInternalsDebugID = reactInternals._debugID;
    if (reactInstanceDebugID && !components[reactInstanceDebugID]) {
        components[reactInstanceDebugID] = component;
        componentAfterRender(component);
    }
    else if (reactFiberInstanceDebugID &&
        !components[reactFiberInstanceDebugID]) {
        components[reactFiberInstanceDebugID] = component;
        componentAfterRender(component);
    }
    else if (reactInternalsDebugID && !components[reactInternalsDebugID]) {
        components[reactInternalsDebugID] = component;
        componentAfterRender(component);
    }
}
/**
 * Log axe violations to console.
 * @param {AxeResults} results
 */
function logToConsole(results) {
    console.group('%cNew axe issues', serious);
    results.violations.forEach(function (result) {
        var fmt;
        switch (result.impact) {
            case 'critical':
                fmt = critical;
                break;
            case 'serious':
                fmt = serious;
                break;
            case 'moderate':
                fmt = moderate;
                break;
            case 'minor':
                fmt = minor;
                break;
            default:
                fmt = minor;
                break;
        }
        console.groupCollapsed('%c%s: %c%s %s', fmt, result.impact, defaultReset, result.help, result.helpUrl);
        result.nodes.forEach(function (node) {
            failureSummary(node, 'any');
            failureSummary(node, 'none');
        });
        console.groupEnd();
    });
    console.groupEnd();
}
/**
 * Run axe against all changes made in a React app.
 * @parma {React} _React React instance
 * @param {ReactDOM} _ReactDOM ReactDOM instance
 * @param {Number} _timeout debounce timeout in milliseconds
 * @parma {Spec} conf React axe.configure Spec object
 * @param {ElementContext} _context axe ElementContent object
 * @param {Function} _logger Logger implementation
 */
function reactAxe(_React, _ReactDOM, _timeout, _conf, _context, _logger) {
    if (_conf === void 0) { _conf = {}; }
    React = _React;
    ReactDOM = _ReactDOM;
    timeout = _timeout;
    context = _context;
    conf = _conf;
    logger = _logger || logToConsole;
    var runOnly = conf['runOnly'];
    if (runOnly) {
        conf['rules'] = axeCore
            .getRules(runOnly)
            .map(function (rule) { return (__assign(__assign({}, rule), { id: rule.ruleId, enabled: true })); });
        conf['disableOtherRules'] = true;
    }
    if (Object.keys(conf).length > 0) {
        axeCore.configure(conf);
    }
    axeCore.configure({ allowedOrigins: ['<unsafe_all_origins>'] });
    if (!_createElement) {
        _createElement = React.createElement;
        React.createElement = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var reactEl = _createElement.apply(this, args);
            if (reactEl._owner && reactEl._owner._instance) {
                addComponent(reactEl._owner._instance);
            }
            else if (reactEl._owner && reactEl._owner.stateNode) {
                addComponent(reactEl._owner.stateNode);
            }
            return reactEl;
        };
    }
    return checkAndReport(document.body, timeout);
}
module.exports = reactAxe;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 6308:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}(function(){
	'use strict';
	var scheduleStart, throttleDelay, lazytimer, lazyraf;
	var root = typeof window != 'undefined' ?
		window :
		typeof __webpack_require__.g != undefined ?
			__webpack_require__.g :
			this || {};
	var requestAnimationFrame = root.cancelRequestAnimationFrame && root.requestAnimationFrame || setTimeout;
	var cancelRequestAnimationFrame = root.cancelRequestAnimationFrame || clearTimeout;
	var tasks = [];
	var runAttempts = 0;
	var isRunning = false;
	var remainingTime = 7;
	var minThrottle = 35;
	var throttle = 125;
	var index = 0;
	var taskStart = 0;
	var tasklength = 0;
	var IdleDeadline = {
		get didTimeout(){
			return false;
		},
		timeRemaining: function(){
			var timeRemaining = remainingTime - (Date.now() - taskStart);
			return timeRemaining < 0 ? 0 : timeRemaining;
		},
	};
	var setInactive = debounce(function(){
		remainingTime = 22;
		throttle = 66;
		minThrottle = 0;
	});

	function debounce(fn){
		var id, timestamp;
		var wait = 99;
		var check = function(){
			var last = (Date.now()) - timestamp;

			if (last < wait) {
				id = setTimeout(check, wait - last);
			} else {
				id = null;
				fn();
			}
		};
		return function(){
			timestamp = Date.now();
			if(!id){
				id = setTimeout(check, wait);
			}
		};
	}

	function abortRunning(){
		if(isRunning){
			if(lazyraf){
				cancelRequestAnimationFrame(lazyraf);
			}
			if(lazytimer){
				clearTimeout(lazytimer);
			}
			isRunning = false;
		}
	}

	function onInputorMutation(){
		if(throttle != 125){
			remainingTime = 7;
			throttle = 125;
			minThrottle = 35;

			if(isRunning) {
				abortRunning();
				scheduleLazy();
			}
		}
		setInactive();
	}

	function scheduleAfterRaf() {
		lazyraf = null;
		lazytimer = setTimeout(runTasks, 0);
	}

	function scheduleRaf(){
		lazytimer = null;
		requestAnimationFrame(scheduleAfterRaf);
	}

	function scheduleLazy(){

		if(isRunning){return;}
		throttleDelay = throttle - (Date.now() - taskStart);

		scheduleStart = Date.now();

		isRunning = true;

		if(minThrottle && throttleDelay < minThrottle){
			throttleDelay = minThrottle;
		}

		if(throttleDelay > 9){
			lazytimer = setTimeout(scheduleRaf, throttleDelay);
		} else {
			throttleDelay = 0;
			scheduleRaf();
		}
	}

	function runTasks(){
		var task, i, len;
		var timeThreshold = remainingTime > 9 ?
			9 :
			1
		;

		taskStart = Date.now();
		isRunning = false;

		lazytimer = null;

		if(runAttempts > 2 || taskStart - throttleDelay - 50 < scheduleStart){
			for(i = 0, len = tasks.length; i < len && IdleDeadline.timeRemaining() > timeThreshold; i++){
				task = tasks.shift();
				tasklength++;
				if(task){
					task(IdleDeadline);
				}
			}
		}

		if(tasks.length){
			scheduleLazy();
		} else {
			runAttempts = 0;
		}
	}

	function requestIdleCallbackShim(task){
		index++;
		tasks.push(task);
		scheduleLazy();
		return index;
	}

	function cancelIdleCallbackShim(id){
		var index = id - 1 - tasklength;
		if(tasks[index]){
			tasks[index] = null;
		}
	}

	if(!root.requestIdleCallback || !root.cancelIdleCallback){
		root.requestIdleCallback = requestIdleCallbackShim;
		root.cancelIdleCallback = cancelIdleCallbackShim;

		if(root.document && document.addEventListener){
			root.addEventListener('scroll', onInputorMutation, true);
			root.addEventListener('resize', onInputorMutation);

			document.addEventListener('focus', onInputorMutation, true);
			document.addEventListener('mouseover', onInputorMutation, true);
			['click', 'keypress', 'touchstart', 'mousedown'].forEach(function(name){
				document.addEventListener(name, onInputorMutation, {capture: true, passive: true});
			});

			if(root.MutationObserver){
				new MutationObserver( onInputorMutation ).observe( document.documentElement, {childList: true, subtree: true, attributes: true} );
			}
		}
	} else {
		try{
			root.requestIdleCallback(function(){}, {timeout: 0});
		} catch(e){
			(function(rIC){
				var timeRemainingProto, timeRemaining;
				root.requestIdleCallback = function(fn, timeout){
					if(timeout && typeof timeout.timeout == 'number'){
						return rIC(fn, timeout.timeout);
					}
					return rIC(fn);
				};
				if(root.IdleCallbackDeadline && (timeRemainingProto = IdleCallbackDeadline.prototype)){
					timeRemaining = Object.getOwnPropertyDescriptor(timeRemainingProto, 'timeRemaining');
					if(!timeRemaining || !timeRemaining.configurable || !timeRemaining.get){return;}
					Object.defineProperty(timeRemainingProto, 'timeRemaining', {
						value:  function(){
							return timeRemaining.get.call(this);
						},
						enumerable: true,
						configurable: true,
					});
				}
			})(root.requestIdleCallback)
		}
	}

	return {
		request: requestIdleCallbackShim,
		cancel: cancelIdleCallbackShim,
	};
}));


/***/ })

}]);
//# sourceMappingURL=91-bce51b373db62dc14c13.js.map