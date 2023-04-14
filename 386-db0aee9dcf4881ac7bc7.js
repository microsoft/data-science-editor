(self["webpackChunkdata_science_editor"] = self["webpackChunkdata_science_editor"] || []).push([[386],{

/***/ 6386:
/***/ (function(module) {

/*!
 * 
 *   Mon Sep 06 2021 22:45:41 GMT-0500 (Central Daylight Time)
 *   Accessible NProgress, (c) 2021 Nicholas Mackey - http://nmackey.com/accessible-nprogress
 *   @license MIT
 *
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __nested_webpack_require_846__) {

__nested_webpack_require_846__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_846__.d(__webpack_exports__, {
/* harmony export */   "assign": function() { return /* binding */ assign; },
/* harmony export */   "clamp": function() { return /* binding */ clamp; },
/* harmony export */   "toBarPerc": function() { return /* binding */ toBarPerc; },
/* harmony export */   "randomInc": function() { return /* binding */ randomInc; },
/* harmony export */   "removeElement": function() { return /* binding */ removeElement; },
/* harmony export */   "queue": function() { return /* binding */ queue; }
/* harmony export */ });
/**
 * Substitute for Object.assign()
 * Modified from: https://stackoverflow.com/a/30498430
 *
 * @param {object} target - target object to merge to
 * @param {...object} objectsToMerge - arbitrary number of objects to merge into 'target'
 * @return {object} target merged object
 */
function assign(target) {
  var retTarget = Object(target);

  for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i += 1) {
    var obj = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
    var keys = Object.keys(obj);

    for (var j = 0; j < keys.length; j += 1) {
      retTarget[keys[j]] = obj[keys[j]];
    }
  }

  return retTarget;
}
/**
 * Ensure n is between min & max
 *
 * @param {number} value - number to clamp
 * @param {number} min - minimum
 * @param {number} max - maximum
 * @return {number} clampped value
 */

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
/**
 * Converts a percentage (`0..1`) to a bar translateX
 * percentage (`-100%..0%`).
 *
 * @param {number} value - percentage to convert
 * @return {number} percentage
 */

function toBarPerc(value) {
  return (-1 + value) * 100;
}
/**
 * Gets an increment to use based on status
 *
 * @param {number} status - current status of the progress bar
 * @return {number} increment
 */

function randomInc(status) {
  if (status >= 0 && status < 0.2) {
    return 0.1;
  }

  if (status >= 0.2 && status < 0.5) {
    return 0.04;
  }

  if (status >= 0.5 && status < 0.8) {
    return 0.02;
  }

  if (status >= 0.8 && status < 0.99) {
    return 0.005;
  }

  return 0;
}
/**
 * Removes an element from the DOM.
 *
 * @param {HTMLElement} element - element to remove
 */

function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
/**
 * Queues a function to be executed.
 *
 * @return {function}
 */

var queue = function () {
  var functionQueue = [];

  function next() {
    var fn = functionQueue.shift();

    if (fn) {
      fn(next);
    }
  }

  return function (fn) {
    functionQueue.push(fn);

    if (functionQueue.length === 1) {
      next();
    }
  };
}();

/***/ }),

/***/ "./src/styles.css":
/*!************************!*\
  !*** ./src/styles.css ***!
  \************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __nested_webpack_require_3893__) {

__nested_webpack_require_3893__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_4232__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_4232__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_4232__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_4232__.o(definition, key) && !__nested_webpack_require_4232__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__nested_webpack_require_4232__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_4232__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__nested_webpack_require_4232__.r(__webpack_exports__);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_4232__(/*! ./util */ "./src/util.js");
/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_4232__(/*! ./styles.css */ "./src/styles.css");


var DEFAULTS = {
  minimum: 0.08,
  easing: 'linear',
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: 'div.bar',
  barLabel: 'processing request',
  spinnerSelector: 'div.spinner',
  spinnerLabel: 'processing request',
  parent: 'body',
  template: "\n    <div class=\"bar\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"1\">\n      <div class=\"peg\"></div>\n    </div>\n    <div class=\"spinner\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"1\">\n      <div class=\"spinner-icon\"></div>\n    </div>\n  "
};

var NProgress = function NProgress() {
  var localSettings = DEFAULTS;
  var localStatus = null;
  var initialPromises = 0;
  var currentPromises = 0;
  /**
   * @return {boolean} If the progress bar is rendered.
   */

  function isRendered() {
    return !!document.getElementById('nprogress');
  }
  /**
   * @return {boolean} If there is curent progress.
   */


  function isStarted() {
    return typeof localStatus === 'number';
  }
  /**
   * Renders the progress bar markup based on the `template` setting.
   *
   * @return {HTMLElement} The element rendered.
   */


  function render() {
    if (isRendered()) {
      return document.getElementById('nprogress');
    }

    document.documentElement.classList.add('nprogress-busy');
    var progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = localSettings.template;
    var perc = isStarted() ? '-100' : (0,_util__WEBPACK_IMPORTED_MODULE_0__.toBarPerc)(localStatus || 0);
    var bar = progress.querySelector(localSettings.barSelector);
    bar.setAttribute('aria-label', localSettings.barLabel);
    bar.style.transform = "translate3d(".concat(perc, "%,0,0)");
    bar.style.transition = 'all 0 linear';
    var spinner = progress.querySelector(localSettings.spinnerSelector);

    if (spinner) {
      if (!localSettings.showSpinner) {
        (0,_util__WEBPACK_IMPORTED_MODULE_0__.removeElement)(spinner);
      } else {
        spinner.setAttribute('aria-label', localSettings.spinnerLabel);
      }
    }

    var parent = document.querySelector(localSettings.parent);

    if (parent) {
      if (parent !== document.body) {
        parent.classList.add('nprogress-custom-parent');
      }

      parent.appendChild(progress);
    }

    return progress;
  }

  return {
    /**
     * Updates configuration.
     *
     * @param {object} options - options to override/set
     * @return {object} The NProgress object.
     */
    configure: function configure(options) {
      (0,_util__WEBPACK_IMPORTED_MODULE_0__.assign)(localSettings, options);
      return this;
    },

    /**
     * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
     *
     * @param {number} value - progress to set
     * @return {object} The NProgress object.
     */
    set: function set(value) {
      var _this = this;

      var clamppedValue = (0,_util__WEBPACK_IMPORTED_MODULE_0__.clamp)(value, localSettings.minimum, 1);
      localStatus = clamppedValue === 1 ? null : clamppedValue;
      var progress = render(); // Repaint

      progress.offsetWidth; // eslint-disable-line no-unused-expressions

      (0,_util__WEBPACK_IMPORTED_MODULE_0__.queue)(function (next) {
        // Add transition
        var speed = localSettings.speed,
            easing = localSettings.easing;
        var bar = progress.querySelector(localSettings.barSelector);
        bar.setAttribute('aria-valuenow', clamppedValue);
        bar.style.transform = "translate3d(".concat((0,_util__WEBPACK_IMPORTED_MODULE_0__.toBarPerc)(clamppedValue), "%,0,0)");
        bar.style.transition = "all ".concat(speed, "ms ").concat(easing);

        if (clamppedValue === 1) {
          // Fade out
          progress.style.transition = 'none';
          progress.style.opacity = 1; // Repaint

          progress.offsetWidth; // eslint-disable-line no-unused-expressions

          setTimeout(function () {
            progress.style.transition = "all ".concat(speed, "ms linear");
            progress.style.opacity = 0;
            setTimeout(function () {
              _this.remove();

              next();
            }, speed);
          }, speed);
        } else {
          setTimeout(next, speed);
        }
      });
      return this;
    },

    /**
     * Shows the progress bar.
     * This is the same as setting the status to 0%, except that it doesn't go backwards.
     *
     * @return {object} The NProgress object.
     */
    start: function start() {
      var _this2 = this;

      if (!localStatus) {
        this.set(0);
      }

      var work = function work() {
        setTimeout(function () {
          if (!localStatus) {
            return;
          }

          _this2.inc();

          work();
        }, localSettings.trickleSpeed);
      };

      if (localSettings.trickle) {
        work();
      }

      return this;
    },

    /**
     * Hides the progress bar.
     * This is the *sort of* the same as setting the status to 100%, with the
     * difference being `done()` makes some placebo effect of some realistic motion.
     *
     * @param {boolean} force - show the progress bar complete even if its hidden
     * @return {object} The NProgress object.
     */
    done: function done(force) {
      if (!force && !localStatus) {
        return this;
      }

      var halfRandom = 0.5 * Math.random();
      return this.inc(0.3 + halfRandom).set(1);
    },

    /**
     * Increments progress bar by given amount.
     *
     * @param {number} [amount] - amount to increment the progress bar by
     * @return {object} The NProgress object.
     */
    inc: function inc() {
      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0,_util__WEBPACK_IMPORTED_MODULE_0__.randomInc)(localStatus);

      if (!localStatus) {
        return this.start();
      }

      var clamppedStatus = (0,_util__WEBPACK_IMPORTED_MODULE_0__.clamp)(localStatus + amount, 0, 0.994);
      return this.set(clamppedStatus);
    },

    /**
     * Removes the element. Opposite of render().
     */
    remove: function remove() {
      document.documentElement.classList.remove('nprogress-busy');
      document.querySelector(localSettings.parent).classList.remove('nprogress-custom-parent');
      var progress = document.getElementById('nprogress');

      if (progress) {
        (0,_util__WEBPACK_IMPORTED_MODULE_0__.removeElement)(progress);
      }
    },

    /**
     * Waits for all supplied promises and increases the progress as the promises resolve.
     *
     * @param $promise Promise
     * @return {object} The NProgress object.
     */
    promise: function promise($promise) {
      var _this3 = this;

      if (currentPromises === 0) {
        this.start();
      }

      initialPromises += 1;
      currentPromises += 1;

      var promiseResolution = function promiseResolution() {
        currentPromises -= 1;

        if (currentPromises === 0) {
          initialPromises = 0;

          _this3.done();
        } else {
          _this3.set((initialPromises - currentPromises) / initialPromises);
        }
      };

      $promise.then(promiseResolution).catch(promiseResolution);
      return this;
    },

    get status() {
      return localStatus;
    },

    get settings() {
      return localSettings;
    }

  };
};

/* harmony default export */ __webpack_exports__["default"] = (NProgress());
}();
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});

/***/ })

}]);
//# sourceMappingURL=386-db0aee9dcf4881ac7bc7.js.map