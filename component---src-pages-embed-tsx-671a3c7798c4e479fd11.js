"use strict";
(self["webpackChunkdata_science_editor"] = self["webpackChunkdata_science_editor"] || []).push([[209],{

/***/ 1645:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ Page; }
});

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
var objectWithoutPropertiesLoose = __webpack_require__(3366);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(5861);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(7294);
// EXTERNAL MODULE: ./src/components/blockly/fields/tidy.ts
var tidy = __webpack_require__(1523);
;// CONCATENATED MODULE: ./src/components/blockly/dsl/workspacejson.ts
function getField(block,name){var inputs=block.inputs;for(var i=0;i<inputs.length;++i){var field=inputs[i].fields[name];if(field)return field;}return undefined;}function getFieldValue(block,name){var field=getField(block,name);return field===null||field===void 0?void 0:field.value;}function resolveFieldColumn(data,b,fieldName,options){var name=getFieldValue(b,fieldName);var{type,required}=options||{};var column=resolveHeader(data,name,type);var warning;if(!column){if(required&&!name)warning="missing column";else if(name)warning=name+" column not found";}return{column,warning};}function resolveHeader(data,name,type){if(!data||!name)return undefined;var{headers}=(0,tidy/* tidyHeaders */.P2)(data,type);return headers.indexOf(name)>-1?name:undefined;}
// EXTERNAL MODULE: ./src/components/blockly/fields/DataColumnChooserField.ts
var DataColumnChooserField = __webpack_require__(8977);
// EXTERNAL MODULE: ./src/components/blockly/toolbox.ts
var toolbox = __webpack_require__(3461);
// EXTERNAL MODULE: ./src/components/hooks/useWindowEvent.ts
var useWindowEvent = __webpack_require__(5666);
// EXTERNAL MODULE: ./node_modules/@tidyjs/tidy/dist/es/index.js + 19 modules
var es = __webpack_require__(7702);
// EXTERNAL MODULE: ./node_modules/gatsby-material-ui-components/lib/index.js + 21 modules
var lib = __webpack_require__(5667);
// EXTERNAL MODULE: ./.cache/gatsby-browser-entry.js + 1 modules
var gatsby_browser_entry = __webpack_require__(4503);
;// CONCATENATED MODULE: ./src/pages/embed.tsx


var _excluded = ["blockId", "workspace", "dataset"];








function Page() {
  var frame = (0,react.useRef)();
  var dslidRef = (0,react.useRef)(undefined);
  var colour = "#f01010";
  var blocks = [{
    kind: "block",
    type: "iframe_random",
    message0: "iframe random",
    colour,
    args0: [],
    nextStatement: toolbox/* DATA_SCIENCE_STATEMENT_TYPE */.zN,
    dataPreviewField: true
  }, {
    kind: "block",
    type: "iframe_sort",
    message0: "iframe arrange %1 %2",
    colour,
    args0: [{
      type: DataColumnChooserField/* default.KEY */.ZP.KEY,
      name: "column"
    }, {
      type: "field_dropdown",
      name: "order",
      options: [["ascending", "ascending"], ["descending", "descending"]]
    }],
    previousStatement: toolbox/* DATA_SCIENCE_STATEMENT_TYPE */.zN,
    nextStatement: toolbox/* DATA_SCIENCE_STATEMENT_TYPE */.zN,
    dataPreviewField: true
  }];
  var category = [{
    kind: "category",
    name: "Custom",
    colour,
    contents: blocks.map(block => ({
      kind: "block",
      type: block.type
    }))
  }];
  var transforms = {
    iframe_random: function () {
      var _iframe_random = (0,asyncToGenerator/* default */.Z)(function* () {
        console.debug("hostdsl: random");
        var dataset = Array(10).fill(0).map((_, i) => ({
          x: i,
          y: Math.random()
        }));
        return {
          dataset
        };
      });

      function iframe_random() {
        return _iframe_random.apply(this, arguments);
      }

      return iframe_random;
    }(),
    iframe_sort: function () {
      var _iframe_sort = (0,asyncToGenerator/* default */.Z)(function* (b, dataset) {
        console.debug("hostdsl: sort");
        var {
          column,
          warning
        } = resolveFieldColumn(dataset, b, "column");
        var order = getFieldValue(b, "order");
        var descending = order === "descending";
        console.debug("hostdsl: sort", {
          b,
          dataset,
          column,
          order,
          descending,
          warning
        });
        if (!column) return Promise.resolve({
          dataset,
          warning
        });
        var res = (0,es/* tidy */.lu)(dataset, (0,es/* arrange */.Di)(descending ? (0,es/* desc */.C8)(column) : column));
        return {
          dataset: res,
          warning
        };
      });

      function iframe_sort(_x, _x2) {
        return _iframe_sort.apply(this, arguments);
      }

      return iframe_sort;
    }()
  }; // eslint-disable-next-line @typescript-eslint/ban-types

  var post = payload => {
    frame.current.contentWindow.postMessage(payload, "*");
  };

  var handleBlocks = /*#__PURE__*/function () {
    var _ref = (0,asyncToGenerator/* default */.Z)(function* (data) {
      var msg = Object.assign({}, data, {
        blocks,
        category
      });
      post(msg);
    });

    return function handleBlocks(_x3) {
      return _ref.apply(this, arguments);
    };
  }();

  var handleTransform = /*#__PURE__*/function () {
    var _ref2 = (0,asyncToGenerator/* default */.Z)(function* (data) {
      console.log("hostdsl: transform");

      var {
        blockId,
        workspace,
        dataset
      } = data,
          rest = (0,objectWithoutPropertiesLoose/* default */.Z)(data, _excluded);

      var block = workspace.blocks.find(b => b.id === blockId);
      var transformer = transforms[block.type];
      var res = yield transformer === null || transformer === void 0 ? void 0 : transformer(block, dataset);
      post(Object.assign({}, rest, res || {}));
    });

    return function handleTransform(_x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  (0,useWindowEvent/* default */.Z)("message", msg => {
    var {
      data
    } = msg;
    if (data.type !== "dsl") return;
    var {
      action,
      dslid
    } = data;

    switch (action) {
      case "mount":
        dslidRef.current = dslid;
        break;

      case "unmount":
        dslidRef.current = dslid;
        break;

      case "blocks":
        {
          handleBlocks(data);
          break;
        }

      case "transform":
        {
          handleTransform(data);
          break;
        }
    }
  }, false, []);

  var handleRefresh = () => {
    post({
      type: "dsl",
      action: "change",
      dslid: dslidRef.current
    });
  };

  return /*#__PURE__*/react.createElement(react.Fragment, null, /*#__PURE__*/react.createElement("h1", null, "Data Science Editor + hosted blocks"), /*#__PURE__*/react.createElement("p", null, "The data editor below is an example of hosted editor with additional blocks injected by host (Custom category)."), /*#__PURE__*/react.createElement("p", null, /*#__PURE__*/react.createElement(lib/* Button */.zx, {
    title: "Click this button to trigger a refresh",
    onClick: handleRefresh
  }, "Refresh")), /*#__PURE__*/react.createElement("iframe", {
    ref: frame,
    title: "data editor",
    src: (0,gatsby_browser_entry.withPrefix)("/?embed=1"),
    style: {
      border: "none",
      left: 0,
      top: 0,
      width: "100vh",
      height: "80vh"
    }
  }));
}

/***/ })

}]);
//# sourceMappingURL=component---src-pages-embed-tsx-671a3c7798c4e479fd11.js.map