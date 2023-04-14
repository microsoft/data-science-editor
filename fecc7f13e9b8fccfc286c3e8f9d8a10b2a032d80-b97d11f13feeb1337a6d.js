(self["webpackChunkdata_science_editor"] = self["webpackChunkdata_science_editor"] || []).push([[254],{

/***/ 7702:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Di": function() { return /* reexport */ arrange_arrange; },
  "C8": function() { return /* reexport */ arrange_desc; },
  "Ps": function() { return /* reexport */ first; },
  "vM": function() { return /* reexport */ groupBy_groupBy; },
  "n": function() { return /* reexport */ n; },
  "sy": function() { return /* reexport */ sliceHead; },
  "Iz": function() { return /* reexport */ summarize; },
  "lu": function() { return /* reexport */ tidy_tidy; }
});

// UNUSED EXPORTS: TMath, addItems, addRows, asc, complete, contains, count, cumsum, debug, deviation, distinct, endsWith, everything, expand, fill, filter, fixedOrder, fullJoin, fullSeq, fullSeqDate, fullSeqDateISOString, innerJoin, lag, last, lead, leftJoin, map, matches, max, mean, meanRate, median, min, mutate, mutateWithSummary, nDistinct, negate, numRange, pick, pivotLonger, pivotWider, rate, rename, replaceNully, roll, rowNumber, select, slice, sliceMax, sliceMin, sliceSample, sliceTail, sort, startsWith, sum, summarizeAll, summarizeAt, summarizeIf, tally, total, totalAll, totalAt, totalIf, transmute, variance, vectorSeq, vectorSeqDate, when

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/tidy.js
function tidy_tidy(items, ...fns) {
  if (typeof items === "function") {
    throw new Error("You must supply the data as the first argument to tidy()");
  }
  let result = items;
  for (const fn of fns) {
    if (fn) {
      result = fn(result);
    }
  }
  return result;
}


//# sourceMappingURL=tidy.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/node_modules/d3-array/src/ascending.js
/* harmony default export */ function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/helpers/singleOrArray.js
function singleOrArray_singleOrArray(d) {
  return d == null ? [] : Array.isArray(d) ? d : [d];
}


//# sourceMappingURL=singleOrArray.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/arrange.js



function arrange_arrange(comparators) {
  const _arrange = (items) => {
    const comparatorFns = singleOrArray_singleOrArray(comparators).map((comp) => typeof comp === "function" ? comp.length === 1 ? asc(comp) : comp : asc(comp));
    return items.slice().sort((a, b) => {
      for (const comparator of comparatorFns) {
        const result = comparator(a, b);
        if (result)
          return result;
      }
      return 0;
    });
  };
  return _arrange;
}
function asc(key) {
  const keyFn = typeof key === "function" ? key : (d) => d[key];
  return function _asc(a, b) {
    return emptyAwareComparator(keyFn(a), keyFn(b), false);
  };
}
function arrange_desc(key) {
  const keyFn = typeof key === "function" ? key : (d) => d[key];
  return function _desc(a, b) {
    return emptyAwareComparator(keyFn(a), keyFn(b), true);
  };
}
function fixedOrder(key, order, options) {
  let {position = "start"} = options != null ? options : {};
  const positionFactor = position === "end" ? -1 : 1;
  const indexMap = new Map();
  for (let i = 0; i < order.length; ++i) {
    indexMap.set(order[i], i);
  }
  const keyFn = typeof key === "function" ? key : (d) => d[key];
  return function _fixedOrder(a, b) {
    var _a, _b;
    const aIndex = (_a = indexMap.get(keyFn(a))) != null ? _a : -1;
    const bIndex = (_b = indexMap.get(keyFn(b))) != null ? _b : -1;
    if (aIndex >= 0 && bIndex >= 0) {
      return aIndex - bIndex;
    }
    if (aIndex >= 0) {
      return positionFactor * -1;
    }
    if (bIndex >= 0) {
      return positionFactor * 1;
    }
    return 0;
  };
}
function emptyAwareComparator(aInput, bInput, desc2) {
  let a = desc2 ? bInput : aInput;
  let b = desc2 ? aInput : bInput;
  if (isEmpty(a) && isEmpty(b)) {
    const rankA = a !== a ? 0 : a === null ? 1 : 2;
    const rankB = b !== b ? 0 : b === null ? 1 : 2;
    const order = rankA - rankB;
    return desc2 ? -order : order;
  }
  if (isEmpty(a)) {
    return desc2 ? -1 : 1;
  }
  if (isEmpty(b)) {
    return desc2 ? 1 : -1;
  }
  return ascending(a, b);
}
function isEmpty(value) {
  return value == null || value !== value;
}


//# sourceMappingURL=arrange.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/summarize.js


function summarize(summarizeSpec, options) {
  const _summarize = (items) => {
    options = options != null ? options : {};
    const summarized = {};
    const keys = Object.keys(summarizeSpec);
    for (const key of keys) {
      summarized[key] = summarizeSpec[key](items);
    }
    if (options.rest && items.length) {
      const objectKeys = Object.keys(items[0]);
      for (const objKey of objectKeys) {
        if (keys.includes(objKey)) {
          continue;
        }
        summarized[objKey] = options.rest(objKey)(items);
      }
    }
    return [summarized];
  };
  return _summarize;
}
function _summarizeHelper(items, summaryFn, predicateFn, keys) {
  if (!items.length)
    return [];
  const summarized = {};
  let keysArr;
  if (keys == null) {
    keysArr = Object.keys(items[0]);
  } else {
    keysArr = [];
    for (const keyInput of singleOrArray(keys)) {
      if (typeof keyInput === "function") {
        keysArr.push(...keyInput(items));
      } else {
        keysArr.push(keyInput);
      }
    }
  }
  for (const key of keysArr) {
    if (predicateFn) {
      const vector = items.map((d) => d[key]);
      if (!predicateFn(vector)) {
        continue;
      }
    }
    summarized[key] = summaryFn(key)(items);
  }
  return [summarized];
}
function summarizeAll(summaryFn) {
  const _summarizeAll = (items) => _summarizeHelper(items, summaryFn);
  return _summarizeAll;
}
function summarizeIf(predicateFn, summaryFn) {
  const _summarizeIf = (items) => _summarizeHelper(items, summaryFn, predicateFn);
  return _summarizeIf;
}
function summarizeAt(keys, summaryFn) {
  const _summarizeAt = (items) => _summarizeHelper(items, summaryFn, void 0, keys);
  return _summarizeAt;
}


//# sourceMappingURL=summarize.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/node_modules/internmap/src/index.js
class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
    if (entries != null) for (const [key, value] of entries) this.set(key, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}

class InternSet extends Set {
  constructor(values, key = keyof) {
    super();
    Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
    if (values != null) for (const value of values) this.add(value);
  }
  has(value) {
    return super.has(intern_get(this, value));
  }
  add(value) {
    return super.add(intern_set(this, value));
  }
  delete(value) {
    return super.delete(intern_delete(this, value));
  }
}

function intern_get({_intern, _key}, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}

function intern_set({_intern, _key}, value) {
  const key = _key(value);
  if (_intern.has(key)) return _intern.get(key);
  _intern.set(key, value);
  return value;
}

function intern_delete({_intern, _key}, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(value);
    _intern.delete(key);
  }
  return value;
}

function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/node_modules/d3-array/src/identity.js
/* harmony default export */ function src_identity(x) {
  return x;
}

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/node_modules/d3-array/src/group.js



function group(values, ...keys) {
  return nest(values, src_identity, src_identity, keys);
}

function groups(values, ...keys) {
  return nest(values, Array.from, identity, keys);
}

function rollup(values, reduce, ...keys) {
  return nest(values, identity, reduce, keys);
}

function rollups(values, reduce, ...keys) {
  return nest(values, Array.from, reduce, keys);
}

function index(values, ...keys) {
  return nest(values, identity, unique, keys);
}

function indexes(values, ...keys) {
  return nest(values, Array.from, unique, keys);
}

function unique(values) {
  if (values.length !== 1) throw new Error("duplicate key");
  return values[0];
}

function nest(values, map, reduce, keys) {
  return (function regroup(values, i) {
    if (i >= keys.length) return reduce(values);
    const groups = new InternMap();
    const keyof = keys[i++];
    let index = -1;
    for (const value of values) {
      const key = keyof(value, ++index, values);
      const group = groups.get(key);
      if (group) group.push(value);
      else groups.set(key, [value]);
    }
    for (const [key, values] of groups) {
      groups.set(key, regroup(values, i));
    }
    return map(groups);
  })(values, 0);
}

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/helpers/assignGroupKeys.js
function assignGroupKeys(d, keys) {
  if (d == null || typeof d !== "object" || Array.isArray(d))
    return d;
  const keysObj = Object.fromEntries(keys.filter((key) => typeof key[0] !== "function" && key[0] != null));
  return Object.assign(keysObj, d);
}


//# sourceMappingURL=assignGroupKeys.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/helpers/groupTraversal.js
function groupTraversal(grouped, outputGrouped, keys, addSubgroup, addLeaves, level = 0) {
  for (const [key, value] of grouped.entries()) {
    const keysHere = [...keys, key];
    if (value instanceof Map) {
      const subgroup = addSubgroup(outputGrouped, keysHere, level);
      groupTraversal(value, subgroup, keysHere, addSubgroup, addLeaves, level + 1);
    } else {
      addLeaves(outputGrouped, keysHere, value, level);
    }
  }
  return outputGrouped;
}


//# sourceMappingURL=groupTraversal.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/helpers/groupMap.js


function groupMap(grouped, groupFn, keyFn = (keys) => keys[keys.length - 1]) {
  function addSubgroup(parentGrouped, keys) {
    const subgroup = new Map();
    parentGrouped.set(keyFn(keys), subgroup);
    return subgroup;
  }
  function addLeaves(parentGrouped, keys, values) {
    parentGrouped.set(keyFn(keys), groupFn(values, keys));
  }
  const outputGrouped = new Map();
  groupTraversal(grouped, outputGrouped, [], addSubgroup, addLeaves);
  return outputGrouped;
}


//# sourceMappingURL=groupMap.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/helpers/identity.js
const identity_identity = (d) => d;


//# sourceMappingURL=identity.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/helpers/isObject.js
function isObject(obj) {
  const type = typeof obj;
  return obj != null && (type === "object" || type === "function");
}


//# sourceMappingURL=isObject.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/groupBy.js








function groupBy_groupBy(groupKeys, fns, options) {
  if (typeof fns === "function") {
    fns = [fns];
  } else if (arguments.length === 2 && fns != null && !Array.isArray(fns)) {
    options = fns;
  }
  const _groupBy = (items) => {
    const grouped = makeGrouped(items, groupKeys);
    const results = runFlow(grouped, fns, options == null ? void 0 : options.addGroupKeys);
    if (options == null ? void 0 : options.export) {
      switch (options.export) {
        case "grouped":
          return results;
        case "levels":
          return exportLevels(results, options);
        case "entries-obj":
        case "entriesObject":
          return exportLevels(results, {
            ...options,
            export: "levels",
            levels: ["entries-object"]
          });
        default:
          return exportLevels(results, {
            ...options,
            export: "levels",
            levels: [options.export]
          });
      }
    }
    const ungrouped = ungroup(results, options == null ? void 0 : options.addGroupKeys);
    return ungrouped;
  };
  return _groupBy;
}
groupBy_groupBy.grouped = (options) => ({...options, export: "grouped"});
groupBy_groupBy.entries = (options) => ({...options, export: "entries"});
groupBy_groupBy.entriesObject = (options) => ({...options, export: "entries-object"});
groupBy_groupBy.object = (options) => ({...options, export: "object"});
groupBy_groupBy.map = (options) => ({...options, export: "map"});
groupBy_groupBy.keys = (options) => ({...options, export: "keys"});
groupBy_groupBy.values = (options) => ({...options, export: "values"});
groupBy_groupBy.levels = (options) => ({...options, export: "levels"});
function runFlow(items, fns, addGroupKeys) {
  let result = items;
  if (!(fns == null ? void 0 : fns.length))
    return result;
  for (const fn of fns) {
    if (!fn)
      continue;
    result = groupMap(result, (items2, keys) => {
      const context = {groupKeys: keys};
      let leafItemsMapped = fn(items2, context);
      if (addGroupKeys !== false) {
        leafItemsMapped = leafItemsMapped.map((item) => assignGroupKeys(item, keys));
      }
      return leafItemsMapped;
    });
  }
  return result;
}
function makeGrouped(items, groupKeys) {
  const groupKeyFns = singleOrArray_singleOrArray(groupKeys).map((key, i) => {
    const keyFn = typeof key === "function" ? key : (d) => d[key];
    const keyCache = new Map();
    return (d) => {
      const keyValue = keyFn(d);
      const keyValueOf = isObject(keyValue) ? keyValue.valueOf() : keyValue;
      if (keyCache.has(keyValueOf)) {
        return keyCache.get(keyValueOf);
      }
      const keyWithName = [key, keyValue];
      keyCache.set(keyValueOf, keyWithName);
      return keyWithName;
    };
  });
  const grouped = group(items, ...groupKeyFns);
  return grouped;
}
function ungroup(grouped, addGroupKeys) {
  const items = [];
  groupTraversal(grouped, items, [], identity_identity, (root, keys, values) => {
    let valuesToAdd = values;
    if (addGroupKeys !== false) {
      valuesToAdd = values.map((d) => assignGroupKeys(d, keys));
    }
    root.push(...valuesToAdd);
  });
  return items;
}
const defaultCompositeKey = (keys) => keys.join("/");
function processFromGroupsOptions(options) {
  var _a;
  const {
    flat,
    single,
    mapLeaf = identity_identity,
    mapLeaves = identity_identity,
    addGroupKeys
  } = options;
  let compositeKey;
  if (options.flat) {
    compositeKey = (_a = options.compositeKey) != null ? _a : defaultCompositeKey;
  }
  const groupFn = (values, keys) => {
    return single ? mapLeaf(addGroupKeys === false ? values[0] : assignGroupKeys(values[0], keys)) : mapLeaves(values.map((d) => mapLeaf(addGroupKeys === false ? d : assignGroupKeys(d, keys))));
  };
  const keyFn = flat ? (keys) => compositeKey(keys.map((d) => d[1])) : (keys) => keys[keys.length - 1][1];
  return {groupFn, keyFn};
}
function exportLevels(grouped, options) {
  const {groupFn, keyFn} = processFromGroupsOptions(options);
  let {mapEntry = identity_identity} = options;
  const {levels = ["entries"]} = options;
  const levelSpecs = [];
  for (const levelOption of levels) {
    switch (levelOption) {
      case "entries":
      case "entries-object":
      case "entries-obj":
      case "entriesObject": {
        const levelMapEntry = (levelOption === "entries-object" || levelOption === "entries-obj" || levelOption === "entriesObject") && options.mapEntry == null ? ([key, values]) => ({key, values}) : mapEntry;
        levelSpecs.push({
          id: "entries",
          createEmptySubgroup: () => [],
          addSubgroup: (parentGrouped, newSubgroup, key, level) => {
            parentGrouped.push(levelMapEntry([key, newSubgroup], level));
          },
          addLeaf: (parentGrouped, key, values, level) => {
            parentGrouped.push(levelMapEntry([key, values], level));
          }
        });
        break;
      }
      case "map":
        levelSpecs.push({
          id: "map",
          createEmptySubgroup: () => new Map(),
          addSubgroup: (parentGrouped, newSubgroup, key) => {
            parentGrouped.set(key, newSubgroup);
          },
          addLeaf: (parentGrouped, key, values) => {
            parentGrouped.set(key, values);
          }
        });
        break;
      case "object":
        levelSpecs.push({
          id: "object",
          createEmptySubgroup: () => ({}),
          addSubgroup: (parentGrouped, newSubgroup, key) => {
            parentGrouped[key] = newSubgroup;
          },
          addLeaf: (parentGrouped, key, values) => {
            parentGrouped[key] = values;
          }
        });
        break;
      case "keys":
        levelSpecs.push({
          id: "keys",
          createEmptySubgroup: () => [],
          addSubgroup: (parentGrouped, newSubgroup, key) => {
            parentGrouped.push([key, newSubgroup]);
          },
          addLeaf: (parentGrouped, key) => {
            parentGrouped.push(key);
          }
        });
        break;
      case "values":
        levelSpecs.push({
          id: "values",
          createEmptySubgroup: () => [],
          addSubgroup: (parentGrouped, newSubgroup) => {
            parentGrouped.push(newSubgroup);
          },
          addLeaf: (parentGrouped, key, values) => {
            parentGrouped.push(values);
          }
        });
        break;
      default: {
        if (typeof levelOption === "object") {
          levelSpecs.push(levelOption);
        }
      }
    }
  }
  const addSubgroup = (parentGrouped, keys, level) => {
    var _a, _b;
    if (options.flat) {
      return parentGrouped;
    }
    const levelSpec = (_a = levelSpecs[level]) != null ? _a : levelSpecs[levelSpecs.length - 1];
    const nextLevelSpec = (_b = levelSpecs[level + 1]) != null ? _b : levelSpec;
    const newSubgroup = nextLevelSpec.createEmptySubgroup();
    levelSpec.addSubgroup(parentGrouped, newSubgroup, keyFn(keys), level);
    return newSubgroup;
  };
  const addLeaf = (parentGrouped, keys, values, level) => {
    var _a;
    const levelSpec = (_a = levelSpecs[level]) != null ? _a : levelSpecs[levelSpecs.length - 1];
    levelSpec.addLeaf(parentGrouped, keyFn(keys), groupFn(values, keys), level);
  };
  const initialOutputObject = levelSpecs[0].createEmptySubgroup();
  return groupTraversal(grouped, initialOutputObject, [], addSubgroup, addLeaf);
}


//# sourceMappingURL=groupBy.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/count.js






function count(groupKeys, options) {
  const _count = (items) => {
    options = options != null ? options : {};
    const {name = "n", sort} = options;
    const results = tidy(items, groupBy(groupKeys, [tally(options)]), sort ? arrange(desc(name)) : identity);
    return results;
  };
  return _count;
}


//# sourceMappingURL=count.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/slice.js



function slice(start, end) {
  const _slice = (items) => items.slice(start, end);
  return _slice;
}
const sliceHead = (n) => slice(0, n);
const sliceTail = (n) => slice(-n);
function sliceMin(n, orderBy) {
  const _sliceMin = (items) => arrange(orderBy)(items).slice(0, n);
  return _sliceMin;
}
function sliceMax(n, orderBy) {
  const _sliceMax = (items) => typeof orderBy === "function" ? arrange(orderBy)(items).slice(-n).reverse() : arrange(desc(orderBy))(items).slice(0, n);
  return _sliceMax;
}
function sliceSample(n, options) {
  options = options != null ? options : {};
  const {replace} = options;
  const _sliceSample = (items) => {
    if (!items.length)
      return items.slice();
    if (replace) {
      const sliced = [];
      for (let i = 0; i < n; ++i) {
        sliced.push(items[Math.floor(Math.random() * items.length)]);
      }
      return sliced;
    }
    return shuffle(items.slice()).slice(0, n);
  };
  return _sliceSample;
}


//# sourceMappingURL=slice.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/pivotWider.js



function pivotWider(options) {
  const _pivotWider = (items) => {
    const {
      namesFrom,
      valuesFrom,
      valuesFill,
      valuesFillMap,
      namesSep = "_"
    } = options;
    const namesFromKeys = Array.isArray(namesFrom) ? namesFrom : [namesFrom];
    const valuesFromKeys = Array.isArray(valuesFrom) ? valuesFrom : [valuesFrom];
    const wider = [];
    if (!items.length)
      return wider;
    const idColumns = Object.keys(items[0]).filter((key) => !namesFromKeys.includes(key) && !valuesFromKeys.includes(key));
    const nameValuesMap = {};
    for (const item of items) {
      for (const nameKey of namesFromKeys) {
        if (nameValuesMap[nameKey] == null) {
          nameValuesMap[nameKey] = {};
        }
        nameValuesMap[nameKey][item[nameKey]] = true;
      }
    }
    const nameValuesLists = [];
    for (const nameKey in nameValuesMap) {
      nameValuesLists.push(Object.keys(nameValuesMap[nameKey]));
    }
    const baseWideObj = {};
    const combos = makeCombinations(namesSep, nameValuesLists);
    for (const nameKey of combos) {
      if (valuesFromKeys.length === 1) {
        baseWideObj[nameKey] = valuesFillMap != null ? valuesFillMap[valuesFromKeys[0]] : valuesFill;
        continue;
      }
      for (const valueKey of valuesFromKeys) {
        baseWideObj[`${valueKey}${namesSep}${nameKey}`] = valuesFillMap != null ? valuesFillMap[valueKey] : valuesFill;
      }
    }
    function widenItems(items2) {
      if (!items2.length)
        return [];
      const wide = {...baseWideObj};
      for (const idKey of idColumns) {
        wide[idKey] = items2[0][idKey];
      }
      for (const item of items2) {
        const nameKey = namesFromKeys.map((key) => item[key]).join(namesSep);
        if (valuesFromKeys.length === 1) {
          wide[nameKey] = item[valuesFromKeys[0]];
          continue;
        }
        for (const valueKey of valuesFromKeys) {
          wide[`${valueKey}${namesSep}${nameKey}`] = item[valueKey];
        }
      }
      return [wide];
    }
    if (!idColumns.length) {
      return widenItems(items);
    }
    const finish = tidy(items, groupBy(idColumns, [widenItems]));
    return finish;
  };
  return _pivotWider;
}
function makeCombinations(separator = "_", arrays) {
  function combine(accum, prefix, remainingArrays) {
    if (!remainingArrays.length && prefix != null) {
      accum.push(prefix);
      return;
    }
    const array = remainingArrays[0];
    const newRemainingArrays = remainingArrays.slice(1);
    for (const item of array) {
      combine(accum, prefix == null ? item : `${prefix}${separator}${item}`, newRemainingArrays);
    }
  }
  const result = [];
  combine(result, null, arrays);
  return result;
}


//# sourceMappingURL=pivotWider.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/summary/n.js
function n(options) {
  if (options == null ? void 0 : options.predicate) {
    const predicate = options.predicate;
    return (items) => items.reduce((n2, d, i) => predicate(d, i, items) ? n2 + 1 : n2, 0);
  }
  return (items) => items.length;
}


//# sourceMappingURL=n.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/summary/first.js
function first(key) {
  const keyFn = typeof key === "function" ? key : (d) => d[key];
  return (items) => items.length ? keyFn(items[0]) : void 0;
}


//# sourceMappingURL=first.js.map

;// CONCATENATED MODULE: ./node_modules/@tidyjs/tidy/dist/es/index.js
























































//# sourceMappingURL=index.js.map


/***/ }),

/***/ 4097:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1334)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly module.
 */

/* eslint-disable */
'use strict';

return Blockly;
})); 


/***/ }),

/***/ 1003:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6904)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly Blocks module.
 */

/* eslint-disable */
'use strict';

Blockly.Blocks = {};

return Blockly.Blocks;
})); 


/***/ }),

/***/ 6904:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Do not edit this file; automatically generated by gulp.

/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1334)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {
  'use strict';Blockly.Blocks.colour={};Blockly.Constants={};Blockly.Constants.Colour={};Blockly.Constants.Colour.HUE=20;
Blockly.defineBlocksWithJsonArray([{type:"colour_picker",message0:"%1",args0:[{type:"field_colour",name:"COLOUR",colour:"#ff0000"}],output:"Colour",helpUrl:"%{BKY_COLOUR_PICKER_HELPURL}",style:"colour_blocks",tooltip:"%{BKY_COLOUR_PICKER_TOOLTIP}",extensions:["parent_tooltip_when_inline"]},{type:"colour_random",message0:"%{BKY_COLOUR_RANDOM_TITLE}",output:"Colour",helpUrl:"%{BKY_COLOUR_RANDOM_HELPURL}",style:"colour_blocks",tooltip:"%{BKY_COLOUR_RANDOM_TOOLTIP}"},{type:"colour_rgb",message0:"%{BKY_COLOUR_RGB_TITLE} %{BKY_COLOUR_RGB_RED} %1 %{BKY_COLOUR_RGB_GREEN} %2 %{BKY_COLOUR_RGB_BLUE} %3",
args0:[{type:"input_value",name:"RED",check:"Number",align:"RIGHT"},{type:"input_value",name:"GREEN",check:"Number",align:"RIGHT"},{type:"input_value",name:"BLUE",check:"Number",align:"RIGHT"}],output:"Colour",helpUrl:"%{BKY_COLOUR_RGB_HELPURL}",style:"colour_blocks",tooltip:"%{BKY_COLOUR_RGB_TOOLTIP}"},{type:"colour_blend",message0:"%{BKY_COLOUR_BLEND_TITLE} %{BKY_COLOUR_BLEND_COLOUR1} %1 %{BKY_COLOUR_BLEND_COLOUR2} %2 %{BKY_COLOUR_BLEND_RATIO} %3",args0:[{type:"input_value",name:"COLOUR1",check:"Colour",
align:"RIGHT"},{type:"input_value",name:"COLOUR2",check:"Colour",align:"RIGHT"},{type:"input_value",name:"RATIO",check:"Number",align:"RIGHT"}],output:"Colour",helpUrl:"%{BKY_COLOUR_BLEND_HELPURL}",style:"colour_blocks",tooltip:"%{BKY_COLOUR_BLEND_TOOLTIP}"}]);Blockly.Constants.Lists={};Blockly.Constants.Lists.HUE=260;
Blockly.defineBlocksWithJsonArray([{type:"lists_create_empty",message0:"%{BKY_LISTS_CREATE_EMPTY_TITLE}",output:"Array",style:"list_blocks",tooltip:"%{BKY_LISTS_CREATE_EMPTY_TOOLTIP}",helpUrl:"%{BKY_LISTS_CREATE_EMPTY_HELPURL}"},{type:"lists_repeat",message0:"%{BKY_LISTS_REPEAT_TITLE}",args0:[{type:"input_value",name:"ITEM"},{type:"input_value",name:"NUM",check:"Number"}],output:"Array",style:"list_blocks",tooltip:"%{BKY_LISTS_REPEAT_TOOLTIP}",helpUrl:"%{BKY_LISTS_REPEAT_HELPURL}"},{type:"lists_reverse",
message0:"%{BKY_LISTS_REVERSE_MESSAGE0}",args0:[{type:"input_value",name:"LIST",check:"Array"}],output:"Array",inputsInline:!0,style:"list_blocks",tooltip:"%{BKY_LISTS_REVERSE_TOOLTIP}",helpUrl:"%{BKY_LISTS_REVERSE_HELPURL}"},{type:"lists_isEmpty",message0:"%{BKY_LISTS_ISEMPTY_TITLE}",args0:[{type:"input_value",name:"VALUE",check:["String","Array"]}],output:"Boolean",style:"list_blocks",tooltip:"%{BKY_LISTS_ISEMPTY_TOOLTIP}",helpUrl:"%{BKY_LISTS_ISEMPTY_HELPURL}"},{type:"lists_length",message0:"%{BKY_LISTS_LENGTH_TITLE}",
args0:[{type:"input_value",name:"VALUE",check:["String","Array"]}],output:"Number",style:"list_blocks",tooltip:"%{BKY_LISTS_LENGTH_TOOLTIP}",helpUrl:"%{BKY_LISTS_LENGTH_HELPURL}"}]);
Blockly.Blocks.lists_create_with={init:function(){this.setHelpUrl(Blockly.Msg.LISTS_CREATE_WITH_HELPURL);this.setStyle("list_blocks");this.itemCount_=3;this.updateShape_();this.setOutput(!0,"Array");this.setMutator(new Blockly.Mutator(["lists_create_with_item"]));this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP)},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("items",this.itemCount_);return a},domToMutation:function(a){this.itemCount_=parseInt(a.getAttribute("items"),
10);this.updateShape_()},decompose:function(a){var b=a.newBlock("lists_create_with_container");b.initSvg();for(var c=b.getInput("STACK").connection,d=0;d<this.itemCount_;d++){var e=a.newBlock("lists_create_with_item");e.initSvg();c.connect(e.previousConnection);c=e.nextConnection}return b},compose:function(a){var b=a.getInputTargetBlock("STACK");for(a=[];b&&!b.isInsertionMarker();)a.push(b.valueConnection_),b=b.nextConnection&&b.nextConnection.targetBlock();for(b=0;b<this.itemCount_;b++){var c=this.getInput("ADD"+
b).connection.targetConnection;c&&-1==a.indexOf(c)&&c.disconnect()}this.itemCount_=a.length;this.updateShape_();for(b=0;b<this.itemCount_;b++)Blockly.Mutator.reconnect(a[b],this,"ADD"+b)},saveConnections:function(a){a=a.getInputTargetBlock("STACK");for(var b=0;a;){var c=this.getInput("ADD"+b);a.valueConnection_=c&&c.connection.targetConnection;b++;a=a.nextConnection&&a.nextConnection.targetBlock()}},updateShape_:function(){this.itemCount_&&this.getInput("EMPTY")?this.removeInput("EMPTY"):this.itemCount_||
this.getInput("EMPTY")||this.appendDummyInput("EMPTY").appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);for(var a=0;a<this.itemCount_;a++)if(!this.getInput("ADD"+a)){var b=this.appendValueInput("ADD"+a).setAlign(Blockly.ALIGN_RIGHT);0==a&&b.appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH)}for(;this.getInput("ADD"+a);)this.removeInput("ADD"+a),a++}};
Blockly.Blocks.lists_create_with_container={init:function(){this.setStyle("list_blocks");this.appendDummyInput().appendField(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD);this.appendStatementInput("STACK");this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);this.contextMenu=!1}};
Blockly.Blocks.lists_create_with_item={init:function(){this.setStyle("list_blocks");this.appendDummyInput().appendField(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE);this.setPreviousStatement(!0);this.setNextStatement(!0);this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP);this.contextMenu=!1}};
Blockly.Blocks.lists_indexOf={init:function(){var a=[[Blockly.Msg.LISTS_INDEX_OF_FIRST,"FIRST"],[Blockly.Msg.LISTS_INDEX_OF_LAST,"LAST"]];this.setHelpUrl(Blockly.Msg.LISTS_INDEX_OF_HELPURL);this.setStyle("list_blocks");this.setOutput(!0,"Number");this.appendValueInput("VALUE").setCheck("Array").appendField(Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST);this.appendValueInput("FIND").appendField(new Blockly.FieldDropdown(a),"END");this.setInputsInline(!0);var b=this;this.setTooltip(function(){return Blockly.Msg.LISTS_INDEX_OF_TOOLTIP.replace("%1",
b.workspace.options.oneBasedIndex?"0":"-1")})}};
Blockly.Blocks.lists_getIndex={init:function(){var a=[[Blockly.Msg.LISTS_GET_INDEX_GET,"GET"],[Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE,"GET_REMOVE"],[Blockly.Msg.LISTS_GET_INDEX_REMOVE,"REMOVE"]];this.WHERE_OPTIONS=[[Blockly.Msg.LISTS_GET_INDEX_FROM_START,"FROM_START"],[Blockly.Msg.LISTS_GET_INDEX_FROM_END,"FROM_END"],[Blockly.Msg.LISTS_GET_INDEX_FIRST,"FIRST"],[Blockly.Msg.LISTS_GET_INDEX_LAST,"LAST"],[Blockly.Msg.LISTS_GET_INDEX_RANDOM,"RANDOM"]];this.setHelpUrl(Blockly.Msg.LISTS_GET_INDEX_HELPURL);this.setStyle("list_blocks");
a=new Blockly.FieldDropdown(a,function(c){c="REMOVE"==c;this.getSourceBlock().updateStatement_(c)});this.appendValueInput("VALUE").setCheck("Array").appendField(Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST);this.appendDummyInput().appendField(a,"MODE").appendField("","SPACE");this.appendDummyInput("AT");Blockly.Msg.LISTS_GET_INDEX_TAIL&&this.appendDummyInput("TAIL").appendField(Blockly.Msg.LISTS_GET_INDEX_TAIL);this.setInputsInline(!0);this.setOutput(!0);this.updateAt_(!0);var b=this;this.setTooltip(function(){var c=
b.getFieldValue("MODE"),d=b.getFieldValue("WHERE"),e="";switch(c+" "+d){case "GET FROM_START":case "GET FROM_END":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM;break;case "GET FIRST":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FIRST;break;case "GET LAST":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_LAST;break;case "GET RANDOM":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_RANDOM;break;case "GET_REMOVE FROM_START":case "GET_REMOVE FROM_END":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM;break;case "GET_REMOVE FIRST":e=
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST;break;case "GET_REMOVE LAST":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST;break;case "GET_REMOVE RANDOM":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM;break;case "REMOVE FROM_START":case "REMOVE FROM_END":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM;break;case "REMOVE FIRST":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST;break;case "REMOVE LAST":e=Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST;break;case "REMOVE RANDOM":e=
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM}if("FROM_START"==d||"FROM_END"==d)e+="  "+("FROM_START"==d?Blockly.Msg.LISTS_INDEX_FROM_START_TOOLTIP:Blockly.Msg.LISTS_INDEX_FROM_END_TOOLTIP).replace("%1",b.workspace.options.oneBasedIndex?"#1":"#0");return e})},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("statement",!this.outputConnection);var b=this.getInput("AT").type==Blockly.INPUT_VALUE;a.setAttribute("at",b);return a},domToMutation:function(a){var b=
"true"==a.getAttribute("statement");this.updateStatement_(b);a="false"!=a.getAttribute("at");this.updateAt_(a)},updateStatement_:function(a){a!=!this.outputConnection&&(this.unplug(!0,!0),a?(this.setOutput(!1),this.setPreviousStatement(!0),this.setNextStatement(!0)):(this.setPreviousStatement(!1),this.setNextStatement(!1),this.setOutput(!0)))},updateAt_:function(a){this.removeInput("AT");this.removeInput("ORDINAL",!0);a?(this.appendValueInput("AT").setCheck("Number"),Blockly.Msg.ORDINAL_NUMBER_SUFFIX&&
this.appendDummyInput("ORDINAL").appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)):this.appendDummyInput("AT");var b=new Blockly.FieldDropdown(this.WHERE_OPTIONS,function(c){var d="FROM_START"==c||"FROM_END"==c;if(d!=a){var e=this.getSourceBlock();e.updateAt_(d);e.setFieldValue(c,"WHERE");return null}});this.getInput("AT").appendField(b,"WHERE");Blockly.Msg.LISTS_GET_INDEX_TAIL&&this.moveInputBefore("TAIL",null)}};
Blockly.Blocks.lists_setIndex={init:function(){var a=[[Blockly.Msg.LISTS_SET_INDEX_SET,"SET"],[Blockly.Msg.LISTS_SET_INDEX_INSERT,"INSERT"]];this.WHERE_OPTIONS=[[Blockly.Msg.LISTS_GET_INDEX_FROM_START,"FROM_START"],[Blockly.Msg.LISTS_GET_INDEX_FROM_END,"FROM_END"],[Blockly.Msg.LISTS_GET_INDEX_FIRST,"FIRST"],[Blockly.Msg.LISTS_GET_INDEX_LAST,"LAST"],[Blockly.Msg.LISTS_GET_INDEX_RANDOM,"RANDOM"]];this.setHelpUrl(Blockly.Msg.LISTS_SET_INDEX_HELPURL);this.setStyle("list_blocks");this.appendValueInput("LIST").setCheck("Array").appendField(Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST);
this.appendDummyInput().appendField(new Blockly.FieldDropdown(a),"MODE").appendField("","SPACE");this.appendDummyInput("AT");this.appendValueInput("TO").appendField(Blockly.Msg.LISTS_SET_INDEX_INPUT_TO);this.setInputsInline(!0);this.setPreviousStatement(!0);this.setNextStatement(!0);this.setTooltip(Blockly.Msg.LISTS_SET_INDEX_TOOLTIP);this.updateAt_(!0);var b=this;this.setTooltip(function(){var c=b.getFieldValue("MODE"),d=b.getFieldValue("WHERE"),e="";switch(c+" "+d){case "SET FROM_START":case "SET FROM_END":e=
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FROM;break;case "SET FIRST":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FIRST;break;case "SET LAST":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_LAST;break;case "SET RANDOM":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_RANDOM;break;case "INSERT FROM_START":case "INSERT FROM_END":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FROM;break;case "INSERT FIRST":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST;break;case "INSERT LAST":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_LAST;
break;case "INSERT RANDOM":e=Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM}if("FROM_START"==d||"FROM_END"==d)e+="  "+Blockly.Msg.LISTS_INDEX_FROM_START_TOOLTIP.replace("%1",b.workspace.options.oneBasedIndex?"#1":"#0");return e})},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation"),b=this.getInput("AT").type==Blockly.INPUT_VALUE;a.setAttribute("at",b);return a},domToMutation:function(a){a="false"!=a.getAttribute("at");this.updateAt_(a)},updateAt_:function(a){this.removeInput("AT");
this.removeInput("ORDINAL",!0);a?(this.appendValueInput("AT").setCheck("Number"),Blockly.Msg.ORDINAL_NUMBER_SUFFIX&&this.appendDummyInput("ORDINAL").appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)):this.appendDummyInput("AT");var b=new Blockly.FieldDropdown(this.WHERE_OPTIONS,function(c){var d="FROM_START"==c||"FROM_END"==c;if(d!=a){var e=this.getSourceBlock();e.updateAt_(d);e.setFieldValue(c,"WHERE");return null}});this.moveInputBefore("AT","TO");this.getInput("ORDINAL")&&this.moveInputBefore("ORDINAL",
"TO");this.getInput("AT").appendField(b,"WHERE")}};
Blockly.Blocks.lists_getSublist={init:function(){this.WHERE_OPTIONS_1=[[Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_START,"FROM_START"],[Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_END,"FROM_END"],[Blockly.Msg.LISTS_GET_SUBLIST_START_FIRST,"FIRST"]];this.WHERE_OPTIONS_2=[[Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_START,"FROM_START"],[Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_END,"FROM_END"],[Blockly.Msg.LISTS_GET_SUBLIST_END_LAST,"LAST"]];this.setHelpUrl(Blockly.Msg.LISTS_GET_SUBLIST_HELPURL);this.setStyle("list_blocks");
this.appendValueInput("LIST").setCheck("Array").appendField(Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST);this.appendDummyInput("AT1");this.appendDummyInput("AT2");Blockly.Msg.LISTS_GET_SUBLIST_TAIL&&this.appendDummyInput("TAIL").appendField(Blockly.Msg.LISTS_GET_SUBLIST_TAIL);this.setInputsInline(!0);this.setOutput(!0,"Array");this.updateAt_(1,!0);this.updateAt_(2,!0);this.setTooltip(Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP)},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation"),
b=this.getInput("AT1").type==Blockly.INPUT_VALUE;a.setAttribute("at1",b);b=this.getInput("AT2").type==Blockly.INPUT_VALUE;a.setAttribute("at2",b);return a},domToMutation:function(a){var b="true"==a.getAttribute("at1");a="true"==a.getAttribute("at2");this.updateAt_(1,b);this.updateAt_(2,a)},updateAt_:function(a,b){this.removeInput("AT"+a);this.removeInput("ORDINAL"+a,!0);b?(this.appendValueInput("AT"+a).setCheck("Number"),Blockly.Msg.ORDINAL_NUMBER_SUFFIX&&this.appendDummyInput("ORDINAL"+a).appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)):
this.appendDummyInput("AT"+a);var c=new Blockly.FieldDropdown(this["WHERE_OPTIONS_"+a],function(d){var e="FROM_START"==d||"FROM_END"==d;if(e!=b){var f=this.getSourceBlock();f.updateAt_(a,e);f.setFieldValue(d,"WHERE"+a);return null}});this.getInput("AT"+a).appendField(c,"WHERE"+a);1==a&&(this.moveInputBefore("AT1","AT2"),this.getInput("ORDINAL1")&&this.moveInputBefore("ORDINAL1","AT2"));Blockly.Msg.LISTS_GET_SUBLIST_TAIL&&this.moveInputBefore("TAIL",null)}};
Blockly.Blocks.lists_sort={init:function(){this.jsonInit({message0:Blockly.Msg.LISTS_SORT_TITLE,args0:[{type:"field_dropdown",name:"TYPE",options:[[Blockly.Msg.LISTS_SORT_TYPE_NUMERIC,"NUMERIC"],[Blockly.Msg.LISTS_SORT_TYPE_TEXT,"TEXT"],[Blockly.Msg.LISTS_SORT_TYPE_IGNORECASE,"IGNORE_CASE"]]},{type:"field_dropdown",name:"DIRECTION",options:[[Blockly.Msg.LISTS_SORT_ORDER_ASCENDING,"1"],[Blockly.Msg.LISTS_SORT_ORDER_DESCENDING,"-1"]]},{type:"input_value",name:"LIST",check:"Array"}],output:"Array",style:"list_blocks",
tooltip:Blockly.Msg.LISTS_SORT_TOOLTIP,helpUrl:Blockly.Msg.LISTS_SORT_HELPURL})}};
Blockly.Blocks.lists_split={init:function(){var a=this,b=new Blockly.FieldDropdown([[Blockly.Msg.LISTS_SPLIT_LIST_FROM_TEXT,"SPLIT"],[Blockly.Msg.LISTS_SPLIT_TEXT_FROM_LIST,"JOIN"]],function(c){a.updateType_(c)});this.setHelpUrl(Blockly.Msg.LISTS_SPLIT_HELPURL);this.setStyle("list_blocks");this.appendValueInput("INPUT").setCheck("String").appendField(b,"MODE");this.appendValueInput("DELIM").setCheck("String").appendField(Blockly.Msg.LISTS_SPLIT_WITH_DELIMITER);this.setInputsInline(!0);this.setOutput(!0,
"Array");this.setTooltip(function(){var c=a.getFieldValue("MODE");if("SPLIT"==c)return Blockly.Msg.LISTS_SPLIT_TOOLTIP_SPLIT;if("JOIN"==c)return Blockly.Msg.LISTS_SPLIT_TOOLTIP_JOIN;throw Error("Unknown mode: "+c);})},updateType_:function(a){if(this.getFieldValue("MODE")!=a){var b=this.getInput("INPUT").connection;b.setShadowDom(null);var c=b.targetBlock();c&&(b.disconnect(),c.isShadow()?c.dispose():this.bumpNeighbours())}"SPLIT"==a?(this.outputConnection.setCheck("Array"),this.getInput("INPUT").setCheck("String")):
(this.outputConnection.setCheck("String"),this.getInput("INPUT").setCheck("Array"))},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("mode",this.getFieldValue("MODE"));return a},domToMutation:function(a){this.updateType_(a.getAttribute("mode"))}};Blockly.Blocks.logic={};Blockly.Constants.Logic={};Blockly.Constants.Logic.HUE=210;
Blockly.defineBlocksWithJsonArray([{type:"logic_boolean",message0:"%1",args0:[{type:"field_dropdown",name:"BOOL",options:[["%{BKY_LOGIC_BOOLEAN_TRUE}","TRUE"],["%{BKY_LOGIC_BOOLEAN_FALSE}","FALSE"]]}],output:"Boolean",style:"logic_blocks",tooltip:"%{BKY_LOGIC_BOOLEAN_TOOLTIP}",helpUrl:"%{BKY_LOGIC_BOOLEAN_HELPURL}"},{type:"controls_if",message0:"%{BKY_CONTROLS_IF_MSG_IF} %1",args0:[{type:"input_value",name:"IF0",check:"Boolean"}],message1:"%{BKY_CONTROLS_IF_MSG_THEN} %1",args1:[{type:"input_statement",
name:"DO0"}],previousStatement:null,nextStatement:null,style:"logic_blocks",helpUrl:"%{BKY_CONTROLS_IF_HELPURL}",mutator:"controls_if_mutator",extensions:["controls_if_tooltip"]},{type:"controls_ifelse",message0:"%{BKY_CONTROLS_IF_MSG_IF} %1",args0:[{type:"input_value",name:"IF0",check:"Boolean"}],message1:"%{BKY_CONTROLS_IF_MSG_THEN} %1",args1:[{type:"input_statement",name:"DO0"}],message2:"%{BKY_CONTROLS_IF_MSG_ELSE} %1",args2:[{type:"input_statement",name:"ELSE"}],previousStatement:null,nextStatement:null,
style:"logic_blocks",tooltip:"%{BKYCONTROLS_IF_TOOLTIP_2}",helpUrl:"%{BKY_CONTROLS_IF_HELPURL}",extensions:["controls_if_tooltip"]},{type:"logic_compare",message0:"%1 %2 %3",args0:[{type:"input_value",name:"A"},{type:"field_dropdown",name:"OP",options:[["=","EQ"],["\u2260","NEQ"],["\u200f<","LT"],["\u200f\u2264","LTE"],["\u200f>","GT"],["\u200f\u2265","GTE"]]},{type:"input_value",name:"B"}],inputsInline:!0,output:"Boolean",style:"logic_blocks",helpUrl:"%{BKY_LOGIC_COMPARE_HELPURL}",extensions:["logic_compare",
"logic_op_tooltip"]},{type:"logic_operation",message0:"%1 %2 %3",args0:[{type:"input_value",name:"A",check:"Boolean"},{type:"field_dropdown",name:"OP",options:[["%{BKY_LOGIC_OPERATION_AND}","AND"],["%{BKY_LOGIC_OPERATION_OR}","OR"]]},{type:"input_value",name:"B",check:"Boolean"}],inputsInline:!0,output:"Boolean",style:"logic_blocks",helpUrl:"%{BKY_LOGIC_OPERATION_HELPURL}",extensions:["logic_op_tooltip"]},{type:"logic_negate",message0:"%{BKY_LOGIC_NEGATE_TITLE}",args0:[{type:"input_value",name:"BOOL",
check:"Boolean"}],output:"Boolean",style:"logic_blocks",tooltip:"%{BKY_LOGIC_NEGATE_TOOLTIP}",helpUrl:"%{BKY_LOGIC_NEGATE_HELPURL}"},{type:"logic_null",message0:"%{BKY_LOGIC_NULL}",output:null,style:"logic_blocks",tooltip:"%{BKY_LOGIC_NULL_TOOLTIP}",helpUrl:"%{BKY_LOGIC_NULL_HELPURL}"},{type:"logic_ternary",message0:"%{BKY_LOGIC_TERNARY_CONDITION} %1",args0:[{type:"input_value",name:"IF",check:"Boolean"}],message1:"%{BKY_LOGIC_TERNARY_IF_TRUE} %1",args1:[{type:"input_value",name:"THEN"}],message2:"%{BKY_LOGIC_TERNARY_IF_FALSE} %1",
args2:[{type:"input_value",name:"ELSE"}],output:null,style:"logic_blocks",tooltip:"%{BKY_LOGIC_TERNARY_TOOLTIP}",helpUrl:"%{BKY_LOGIC_TERNARY_HELPURL}",extensions:["logic_ternary"]}]);
Blockly.defineBlocksWithJsonArray([{type:"controls_if_if",message0:"%{BKY_CONTROLS_IF_IF_TITLE_IF}",nextStatement:null,enableContextMenu:!1,style:"logic_blocks",tooltip:"%{BKY_CONTROLS_IF_IF_TOOLTIP}"},{type:"controls_if_elseif",message0:"%{BKY_CONTROLS_IF_ELSEIF_TITLE_ELSEIF}",previousStatement:null,nextStatement:null,enableContextMenu:!1,style:"logic_blocks",tooltip:"%{BKY_CONTROLS_IF_ELSEIF_TOOLTIP}"},{type:"controls_if_else",message0:"%{BKY_CONTROLS_IF_ELSE_TITLE_ELSE}",previousStatement:null,
enableContextMenu:!1,style:"logic_blocks",tooltip:"%{BKY_CONTROLS_IF_ELSE_TOOLTIP}"}]);Blockly.Constants.Logic.TOOLTIPS_BY_OP={EQ:"%{BKY_LOGIC_COMPARE_TOOLTIP_EQ}",NEQ:"%{BKY_LOGIC_COMPARE_TOOLTIP_NEQ}",LT:"%{BKY_LOGIC_COMPARE_TOOLTIP_LT}",LTE:"%{BKY_LOGIC_COMPARE_TOOLTIP_LTE}",GT:"%{BKY_LOGIC_COMPARE_TOOLTIP_GT}",GTE:"%{BKY_LOGIC_COMPARE_TOOLTIP_GTE}",AND:"%{BKY_LOGIC_OPERATION_TOOLTIP_AND}",OR:"%{BKY_LOGIC_OPERATION_TOOLTIP_OR}"};
Blockly.Extensions.register("logic_op_tooltip",Blockly.Extensions.buildTooltipForDropdown("OP",Blockly.Constants.Logic.TOOLTIPS_BY_OP));
Blockly.Constants.Logic.CONTROLS_IF_MUTATOR_MIXIN={elseifCount_:0,elseCount_:0,suppressPrefixSuffix:!0,mutationToDom:function(){if(!this.elseifCount_&&!this.elseCount_)return null;var a=Blockly.utils.xml.createElement("mutation");this.elseifCount_&&a.setAttribute("elseif",this.elseifCount_);this.elseCount_&&a.setAttribute("else",1);return a},domToMutation:function(a){this.elseifCount_=parseInt(a.getAttribute("elseif"),10)||0;this.elseCount_=parseInt(a.getAttribute("else"),10)||0;this.rebuildShape_()},
decompose:function(a){var b=a.newBlock("controls_if_if");b.initSvg();for(var c=b.nextConnection,d=1;d<=this.elseifCount_;d++){var e=a.newBlock("controls_if_elseif");e.initSvg();c.connect(e.previousConnection);c=e.nextConnection}this.elseCount_&&(a=a.newBlock("controls_if_else"),a.initSvg(),c.connect(a.previousConnection));return b},compose:function(a){a=a.nextConnection.targetBlock();this.elseCount_=this.elseifCount_=0;for(var b=[null],c=[null],d=null;a&&!a.isInsertionMarker();){switch(a.type){case "controls_if_elseif":this.elseifCount_++;
b.push(a.valueConnection_);c.push(a.statementConnection_);break;case "controls_if_else":this.elseCount_++;d=a.statementConnection_;break;default:throw TypeError("Unknown block type: "+a.type);}a=a.nextConnection&&a.nextConnection.targetBlock()}this.updateShape_();this.reconnectChildBlocks_(b,c,d)},saveConnections:function(a){a=a.nextConnection.targetBlock();for(var b=1;a;){switch(a.type){case "controls_if_elseif":var c=this.getInput("IF"+b),d=this.getInput("DO"+b);a.valueConnection_=c&&c.connection.targetConnection;
a.statementConnection_=d&&d.connection.targetConnection;b++;break;case "controls_if_else":d=this.getInput("ELSE");a.statementConnection_=d&&d.connection.targetConnection;break;default:throw TypeError("Unknown block type: "+a.type);}a=a.nextConnection&&a.nextConnection.targetBlock()}},rebuildShape_:function(){var a=[null],b=[null],c=null;this.getInput("ELSE")&&(c=this.getInput("ELSE").connection.targetConnection);for(var d=1;this.getInput("IF"+d);){var e=this.getInput("IF"+d),f=this.getInput("DO"+
d);a.push(e.connection.targetConnection);b.push(f.connection.targetConnection);d++}this.updateShape_();this.reconnectChildBlocks_(a,b,c)},updateShape_:function(){this.getInput("ELSE")&&this.removeInput("ELSE");for(var a=1;this.getInput("IF"+a);)this.removeInput("IF"+a),this.removeInput("DO"+a),a++;for(a=1;a<=this.elseifCount_;a++)this.appendValueInput("IF"+a).setCheck("Boolean").appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF),this.appendStatementInput("DO"+a).appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
this.elseCount_&&this.appendStatementInput("ELSE").appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE)},reconnectChildBlocks_:function(a,b,c){for(var d=1;d<=this.elseifCount_;d++)Blockly.Mutator.reconnect(a[d],this,"IF"+d),Blockly.Mutator.reconnect(b[d],this,"DO"+d);Blockly.Mutator.reconnect(c,this,"ELSE")}};Blockly.Extensions.registerMutator("controls_if_mutator",Blockly.Constants.Logic.CONTROLS_IF_MUTATOR_MIXIN,null,["controls_if_elseif","controls_if_else"]);
Blockly.Constants.Logic.CONTROLS_IF_TOOLTIP_EXTENSION=function(){this.setTooltip(function(){if(this.elseifCount_||this.elseCount_){if(!this.elseifCount_&&this.elseCount_)return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;if(this.elseifCount_&&!this.elseCount_)return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;if(this.elseifCount_&&this.elseCount_)return Blockly.Msg.CONTROLS_IF_TOOLTIP_4}else return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;return""}.bind(this))};Blockly.Extensions.register("controls_if_tooltip",Blockly.Constants.Logic.CONTROLS_IF_TOOLTIP_EXTENSION);
Blockly.Constants.Logic.LOGIC_COMPARE_ONCHANGE_MIXIN={onchange:function(a){this.prevBlocks_||(this.prevBlocks_=[null,null]);var b=this.getInputTargetBlock("A"),c=this.getInputTargetBlock("B");b&&c&&!this.workspace.connectionChecker.doTypeChecks(b.outputConnection,c.outputConnection)&&(Blockly.Events.setGroup(a.group),a=this.prevBlocks_[0],a!==b&&(b.unplug(),!a||a.isDisposed()||a.isShadow()||this.getInput("A").connection.connect(a.outputConnection)),b=this.prevBlocks_[1],b!==c&&(c.unplug(),!b||b.isDisposed()||
b.isShadow()||this.getInput("B").connection.connect(b.outputConnection)),this.bumpNeighbours(),Blockly.Events.setGroup(!1));this.prevBlocks_[0]=this.getInputTargetBlock("A");this.prevBlocks_[1]=this.getInputTargetBlock("B")}};Blockly.Constants.Logic.LOGIC_COMPARE_EXTENSION=function(){this.mixin(Blockly.Constants.Logic.LOGIC_COMPARE_ONCHANGE_MIXIN)};Blockly.Extensions.register("logic_compare",Blockly.Constants.Logic.LOGIC_COMPARE_EXTENSION);
Blockly.Constants.Logic.LOGIC_TERNARY_ONCHANGE_MIXIN={prevParentConnection_:null,onchange:function(a){var b=this.getInputTargetBlock("THEN"),c=this.getInputTargetBlock("ELSE"),d=this.outputConnection.targetConnection;if((b||c)&&d)for(var e=0;2>e;e++){var f=1==e?b:c;f&&!f.workspace.connectionChecker.doTypeChecks(f.outputConnection,d)&&(Blockly.Events.setGroup(a.group),d===this.prevParentConnection_?(this.unplug(),d.getSourceBlock().bumpNeighbours()):(f.unplug(),f.bumpNeighbours()),Blockly.Events.setGroup(!1))}this.prevParentConnection_=
d}};Blockly.Extensions.registerMixin("logic_ternary",Blockly.Constants.Logic.LOGIC_TERNARY_ONCHANGE_MIXIN);Blockly.Blocks.loops={};Blockly.Constants.Loops={};Blockly.Constants.Loops.HUE=120;
Blockly.defineBlocksWithJsonArray([{type:"controls_repeat_ext",message0:"%{BKY_CONTROLS_REPEAT_TITLE}",args0:[{type:"input_value",name:"TIMES",check:"Number"}],message1:"%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",args1:[{type:"input_statement",name:"DO"}],previousStatement:null,nextStatement:null,style:"loop_blocks",tooltip:"%{BKY_CONTROLS_REPEAT_TOOLTIP}",helpUrl:"%{BKY_CONTROLS_REPEAT_HELPURL}"},{type:"controls_repeat",message0:"%{BKY_CONTROLS_REPEAT_TITLE}",args0:[{type:"field_number",name:"TIMES",value:10,
min:0,precision:1}],message1:"%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",args1:[{type:"input_statement",name:"DO"}],previousStatement:null,nextStatement:null,style:"loop_blocks",tooltip:"%{BKY_CONTROLS_REPEAT_TOOLTIP}",helpUrl:"%{BKY_CONTROLS_REPEAT_HELPURL}"},{type:"controls_whileUntil",message0:"%1 %2",args0:[{type:"field_dropdown",name:"MODE",options:[["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_WHILE}","WHILE"],["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL}","UNTIL"]]},{type:"input_value",name:"BOOL",check:"Boolean"}],
message1:"%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",args1:[{type:"input_statement",name:"DO"}],previousStatement:null,nextStatement:null,style:"loop_blocks",helpUrl:"%{BKY_CONTROLS_WHILEUNTIL_HELPURL}",extensions:["controls_whileUntil_tooltip"]},{type:"controls_for",message0:"%{BKY_CONTROLS_FOR_TITLE}",args0:[{type:"field_variable",name:"VAR",variable:null},{type:"input_value",name:"FROM",check:"Number",align:"RIGHT"},{type:"input_value",name:"TO",check:"Number",align:"RIGHT"},{type:"input_value",name:"BY",
check:"Number",align:"RIGHT"}],message1:"%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",args1:[{type:"input_statement",name:"DO"}],inputsInline:!0,previousStatement:null,nextStatement:null,style:"loop_blocks",helpUrl:"%{BKY_CONTROLS_FOR_HELPURL}",extensions:["contextMenu_newGetVariableBlock","controls_for_tooltip"]},{type:"controls_forEach",message0:"%{BKY_CONTROLS_FOREACH_TITLE}",args0:[{type:"field_variable",name:"VAR",variable:null},{type:"input_value",name:"LIST",check:"Array"}],message1:"%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
args1:[{type:"input_statement",name:"DO"}],previousStatement:null,nextStatement:null,style:"loop_blocks",helpUrl:"%{BKY_CONTROLS_FOREACH_HELPURL}",extensions:["contextMenu_newGetVariableBlock","controls_forEach_tooltip"]},{type:"controls_flow_statements",message0:"%1",args0:[{type:"field_dropdown",name:"FLOW",options:[["%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK}","BREAK"],["%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE}","CONTINUE"]]}],previousStatement:null,style:"loop_blocks",helpUrl:"%{BKY_CONTROLS_FLOW_STATEMENTS_HELPURL}",
extensions:["controls_flow_tooltip","controls_flow_in_loop_check"]}]);Blockly.Constants.Loops.WHILE_UNTIL_TOOLTIPS={WHILE:"%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE}",UNTIL:"%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL}"};Blockly.Extensions.register("controls_whileUntil_tooltip",Blockly.Extensions.buildTooltipForDropdown("MODE",Blockly.Constants.Loops.WHILE_UNTIL_TOOLTIPS));Blockly.Constants.Loops.BREAK_CONTINUE_TOOLTIPS={BREAK:"%{BKY_CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK}",CONTINUE:"%{BKY_CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE}"};
Blockly.Extensions.register("controls_flow_tooltip",Blockly.Extensions.buildTooltipForDropdown("FLOW",Blockly.Constants.Loops.BREAK_CONTINUE_TOOLTIPS));
Blockly.Constants.Loops.CUSTOM_CONTEXT_MENU_CREATE_VARIABLES_GET_MIXIN={customContextMenu:function(a){if(!this.isInFlyout){var b=this.getField("VAR").getVariable(),c=b.name;if(!this.isCollapsed()&&null!=c){var d={enabled:!0};d.text=Blockly.Msg.VARIABLES_SET_CREATE_GET.replace("%1",c);b=Blockly.Variables.generateVariableFieldDom(b);c=Blockly.utils.xml.createElement("block");c.setAttribute("type","variables_get");c.appendChild(b);d.callback=Blockly.ContextMenu.callbackFactory(this,c);a.push(d)}}}};
Blockly.Extensions.registerMixin("contextMenu_newGetVariableBlock",Blockly.Constants.Loops.CUSTOM_CONTEXT_MENU_CREATE_VARIABLES_GET_MIXIN);Blockly.Extensions.register("controls_for_tooltip",Blockly.Extensions.buildTooltipWithFieldText("%{BKY_CONTROLS_FOR_TOOLTIP}","VAR"));Blockly.Extensions.register("controls_forEach_tooltip",Blockly.Extensions.buildTooltipWithFieldText("%{BKY_CONTROLS_FOREACH_TOOLTIP}","VAR"));
Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN={LOOP_TYPES:["controls_repeat","controls_repeat_ext","controls_forEach","controls_for","controls_whileUntil"],suppressPrefixSuffix:!0,getSurroundLoop:function(a){do{if(-1!=Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.LOOP_TYPES.indexOf(a.type))return a;a=a.getSurroundParent()}while(a);return null},onchange:function(a){if(this.workspace.isDragging&&!this.workspace.isDragging()&&a.type==Blockly.Events.BLOCK_MOVE){var b=Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(this);
this.setWarningText(b?null:Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING);if(!this.isInFlyout){var c=Blockly.Events.getGroup();Blockly.Events.setGroup(a.group);this.setEnabled(b);Blockly.Events.setGroup(c)}}}};Blockly.Extensions.registerMixin("controls_flow_in_loop_check",Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN);Blockly.Blocks.math={};Blockly.Constants.Math={};Blockly.Constants.Math.HUE=230;
Blockly.defineBlocksWithJsonArray([{type:"math_number",message0:"%1",args0:[{type:"field_number",name:"NUM",value:0}],output:"Number",helpUrl:"%{BKY_MATH_NUMBER_HELPURL}",style:"math_blocks",tooltip:"%{BKY_MATH_NUMBER_TOOLTIP}",extensions:["parent_tooltip_when_inline"]},{type:"math_arithmetic",message0:"%1 %2 %3",args0:[{type:"input_value",name:"A",check:"Number"},{type:"field_dropdown",name:"OP",options:[["%{BKY_MATH_ADDITION_SYMBOL}","ADD"],["%{BKY_MATH_SUBTRACTION_SYMBOL}","MINUS"],["%{BKY_MATH_MULTIPLICATION_SYMBOL}",
"MULTIPLY"],["%{BKY_MATH_DIVISION_SYMBOL}","DIVIDE"],["%{BKY_MATH_POWER_SYMBOL}","POWER"]]},{type:"input_value",name:"B",check:"Number"}],inputsInline:!0,output:"Number",style:"math_blocks",helpUrl:"%{BKY_MATH_ARITHMETIC_HELPURL}",extensions:["math_op_tooltip"]},{type:"math_single",message0:"%1 %2",args0:[{type:"field_dropdown",name:"OP",options:[["%{BKY_MATH_SINGLE_OP_ROOT}","ROOT"],["%{BKY_MATH_SINGLE_OP_ABSOLUTE}","ABS"],["-","NEG"],["ln","LN"],["log10","LOG10"],["e^","EXP"],["10^","POW10"]]},
{type:"input_value",name:"NUM",check:"Number"}],output:"Number",style:"math_blocks",helpUrl:"%{BKY_MATH_SINGLE_HELPURL}",extensions:["math_op_tooltip"]},{type:"math_trig",message0:"%1 %2",args0:[{type:"field_dropdown",name:"OP",options:[["%{BKY_MATH_TRIG_SIN}","SIN"],["%{BKY_MATH_TRIG_COS}","COS"],["%{BKY_MATH_TRIG_TAN}","TAN"],["%{BKY_MATH_TRIG_ASIN}","ASIN"],["%{BKY_MATH_TRIG_ACOS}","ACOS"],["%{BKY_MATH_TRIG_ATAN}","ATAN"]]},{type:"input_value",name:"NUM",check:"Number"}],output:"Number",style:"math_blocks",
helpUrl:"%{BKY_MATH_TRIG_HELPURL}",extensions:["math_op_tooltip"]},{type:"math_constant",message0:"%1",args0:[{type:"field_dropdown",name:"CONSTANT",options:[["\u03c0","PI"],["e","E"],["\u03c6","GOLDEN_RATIO"],["sqrt(2)","SQRT2"],["sqrt(\u00bd)","SQRT1_2"],["\u221e","INFINITY"]]}],output:"Number",style:"math_blocks",tooltip:"%{BKY_MATH_CONSTANT_TOOLTIP}",helpUrl:"%{BKY_MATH_CONSTANT_HELPURL}"},{type:"math_number_property",message0:"%1 %2",args0:[{type:"input_value",name:"NUMBER_TO_CHECK",check:"Number"},
{type:"field_dropdown",name:"PROPERTY",options:[["%{BKY_MATH_IS_EVEN}","EVEN"],["%{BKY_MATH_IS_ODD}","ODD"],["%{BKY_MATH_IS_PRIME}","PRIME"],["%{BKY_MATH_IS_WHOLE}","WHOLE"],["%{BKY_MATH_IS_POSITIVE}","POSITIVE"],["%{BKY_MATH_IS_NEGATIVE}","NEGATIVE"],["%{BKY_MATH_IS_DIVISIBLE_BY}","DIVISIBLE_BY"]]}],inputsInline:!0,output:"Boolean",style:"math_blocks",tooltip:"%{BKY_MATH_IS_TOOLTIP}",mutator:"math_is_divisibleby_mutator"},{type:"math_change",message0:"%{BKY_MATH_CHANGE_TITLE}",args0:[{type:"field_variable",
name:"VAR",variable:"%{BKY_MATH_CHANGE_TITLE_ITEM}"},{type:"input_value",name:"DELTA",check:"Number"}],previousStatement:null,nextStatement:null,style:"variable_blocks",helpUrl:"%{BKY_MATH_CHANGE_HELPURL}",extensions:["math_change_tooltip"]},{type:"math_round",message0:"%1 %2",args0:[{type:"field_dropdown",name:"OP",options:[["%{BKY_MATH_ROUND_OPERATOR_ROUND}","ROUND"],["%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}","ROUNDUP"],["%{BKY_MATH_ROUND_OPERATOR_ROUNDDOWN}","ROUNDDOWN"]]},{type:"input_value",name:"NUM",
check:"Number"}],output:"Number",style:"math_blocks",helpUrl:"%{BKY_MATH_ROUND_HELPURL}",tooltip:"%{BKY_MATH_ROUND_TOOLTIP}"},{type:"math_on_list",message0:"%1 %2",args0:[{type:"field_dropdown",name:"OP",options:[["%{BKY_MATH_ONLIST_OPERATOR_SUM}","SUM"],["%{BKY_MATH_ONLIST_OPERATOR_MIN}","MIN"],["%{BKY_MATH_ONLIST_OPERATOR_MAX}","MAX"],["%{BKY_MATH_ONLIST_OPERATOR_AVERAGE}","AVERAGE"],["%{BKY_MATH_ONLIST_OPERATOR_MEDIAN}","MEDIAN"],["%{BKY_MATH_ONLIST_OPERATOR_MODE}","MODE"],["%{BKY_MATH_ONLIST_OPERATOR_STD_DEV}",
"STD_DEV"],["%{BKY_MATH_ONLIST_OPERATOR_RANDOM}","RANDOM"]]},{type:"input_value",name:"LIST",check:"Array"}],output:"Number",style:"math_blocks",helpUrl:"%{BKY_MATH_ONLIST_HELPURL}",mutator:"math_modes_of_list_mutator",extensions:["math_op_tooltip"]},{type:"math_modulo",message0:"%{BKY_MATH_MODULO_TITLE}",args0:[{type:"input_value",name:"DIVIDEND",check:"Number"},{type:"input_value",name:"DIVISOR",check:"Number"}],inputsInline:!0,output:"Number",style:"math_blocks",tooltip:"%{BKY_MATH_MODULO_TOOLTIP}",
helpUrl:"%{BKY_MATH_MODULO_HELPURL}"},{type:"math_constrain",message0:"%{BKY_MATH_CONSTRAIN_TITLE}",args0:[{type:"input_value",name:"VALUE",check:"Number"},{type:"input_value",name:"LOW",check:"Number"},{type:"input_value",name:"HIGH",check:"Number"}],inputsInline:!0,output:"Number",style:"math_blocks",tooltip:"%{BKY_MATH_CONSTRAIN_TOOLTIP}",helpUrl:"%{BKY_MATH_CONSTRAIN_HELPURL}"},{type:"math_random_int",message0:"%{BKY_MATH_RANDOM_INT_TITLE}",args0:[{type:"input_value",name:"FROM",check:"Number"},
{type:"input_value",name:"TO",check:"Number"}],inputsInline:!0,output:"Number",style:"math_blocks",tooltip:"%{BKY_MATH_RANDOM_INT_TOOLTIP}",helpUrl:"%{BKY_MATH_RANDOM_INT_HELPURL}"},{type:"math_random_float",message0:"%{BKY_MATH_RANDOM_FLOAT_TITLE_RANDOM}",output:"Number",style:"math_blocks",tooltip:"%{BKY_MATH_RANDOM_FLOAT_TOOLTIP}",helpUrl:"%{BKY_MATH_RANDOM_FLOAT_HELPURL}"},{type:"math_atan2",message0:"%{BKY_MATH_ATAN2_TITLE}",args0:[{type:"input_value",name:"X",check:"Number"},{type:"input_value",
name:"Y",check:"Number"}],inputsInline:!0,output:"Number",style:"math_blocks",tooltip:"%{BKY_MATH_ATAN2_TOOLTIP}",helpUrl:"%{BKY_MATH_ATAN2_HELPURL}"}]);
Blockly.Constants.Math.TOOLTIPS_BY_OP={ADD:"%{BKY_MATH_ARITHMETIC_TOOLTIP_ADD}",MINUS:"%{BKY_MATH_ARITHMETIC_TOOLTIP_MINUS}",MULTIPLY:"%{BKY_MATH_ARITHMETIC_TOOLTIP_MULTIPLY}",DIVIDE:"%{BKY_MATH_ARITHMETIC_TOOLTIP_DIVIDE}",POWER:"%{BKY_MATH_ARITHMETIC_TOOLTIP_POWER}",ROOT:"%{BKY_MATH_SINGLE_TOOLTIP_ROOT}",ABS:"%{BKY_MATH_SINGLE_TOOLTIP_ABS}",NEG:"%{BKY_MATH_SINGLE_TOOLTIP_NEG}",LN:"%{BKY_MATH_SINGLE_TOOLTIP_LN}",LOG10:"%{BKY_MATH_SINGLE_TOOLTIP_LOG10}",EXP:"%{BKY_MATH_SINGLE_TOOLTIP_EXP}",POW10:"%{BKY_MATH_SINGLE_TOOLTIP_POW10}",
SIN:"%{BKY_MATH_TRIG_TOOLTIP_SIN}",COS:"%{BKY_MATH_TRIG_TOOLTIP_COS}",TAN:"%{BKY_MATH_TRIG_TOOLTIP_TAN}",ASIN:"%{BKY_MATH_TRIG_TOOLTIP_ASIN}",ACOS:"%{BKY_MATH_TRIG_TOOLTIP_ACOS}",ATAN:"%{BKY_MATH_TRIG_TOOLTIP_ATAN}",SUM:"%{BKY_MATH_ONLIST_TOOLTIP_SUM}",MIN:"%{BKY_MATH_ONLIST_TOOLTIP_MIN}",MAX:"%{BKY_MATH_ONLIST_TOOLTIP_MAX}",AVERAGE:"%{BKY_MATH_ONLIST_TOOLTIP_AVERAGE}",MEDIAN:"%{BKY_MATH_ONLIST_TOOLTIP_MEDIAN}",MODE:"%{BKY_MATH_ONLIST_TOOLTIP_MODE}",STD_DEV:"%{BKY_MATH_ONLIST_TOOLTIP_STD_DEV}",RANDOM:"%{BKY_MATH_ONLIST_TOOLTIP_RANDOM}"};
Blockly.Extensions.register("math_op_tooltip",Blockly.Extensions.buildTooltipForDropdown("OP",Blockly.Constants.Math.TOOLTIPS_BY_OP));
Blockly.Constants.Math.IS_DIVISIBLEBY_MUTATOR_MIXIN={mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation"),b="DIVISIBLE_BY"==this.getFieldValue("PROPERTY");a.setAttribute("divisor_input",b);return a},domToMutation:function(a){a="true"==a.getAttribute("divisor_input");this.updateShape_(a)},updateShape_:function(a){var b=this.getInput("DIVISOR");a?b||this.appendValueInput("DIVISOR").setCheck("Number"):b&&this.removeInput("DIVISOR")}};
Blockly.Constants.Math.IS_DIVISIBLE_MUTATOR_EXTENSION=function(){this.getField("PROPERTY").setValidator(function(a){a="DIVISIBLE_BY"==a;this.getSourceBlock().updateShape_(a)})};Blockly.Extensions.registerMutator("math_is_divisibleby_mutator",Blockly.Constants.Math.IS_DIVISIBLEBY_MUTATOR_MIXIN,Blockly.Constants.Math.IS_DIVISIBLE_MUTATOR_EXTENSION);Blockly.Extensions.register("math_change_tooltip",Blockly.Extensions.buildTooltipWithFieldText("%{BKY_MATH_CHANGE_TOOLTIP}","VAR"));
Blockly.Constants.Math.LIST_MODES_MUTATOR_MIXIN={updateType_:function(a){"MODE"==a?this.outputConnection.setCheck("Array"):this.outputConnection.setCheck("Number")},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("op",this.getFieldValue("OP"));return a},domToMutation:function(a){this.updateType_(a.getAttribute("op"))}};Blockly.Constants.Math.LIST_MODES_MUTATOR_EXTENSION=function(){this.getField("OP").setValidator(function(a){this.updateType_(a)}.bind(this))};
Blockly.Extensions.registerMutator("math_modes_of_list_mutator",Blockly.Constants.Math.LIST_MODES_MUTATOR_MIXIN,Blockly.Constants.Math.LIST_MODES_MUTATOR_EXTENSION);Blockly.Blocks.procedures={};
Blockly.Blocks.procedures_defnoreturn={init:function(){var a=Blockly.Procedures.findLegalName("",this);a=new Blockly.FieldTextInput(a,Blockly.Procedures.rename);a.setSpellcheck(!1);this.appendDummyInput().appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE).appendField(a,"NAME").appendField("","PARAMS");this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));(this.workspace.options.comments||this.workspace.options.parentWorkspace&&this.workspace.options.parentWorkspace.options.comments)&&Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT&&
this.setCommentText(Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT);this.setStyle("procedure_blocks");this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);this.arguments_=[];this.argumentVarModels_=[];this.setStatements_(!0);this.statementConnection_=null},setStatements_:function(a){this.hasStatements_!==a&&(a?(this.appendStatementInput("STACK").appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO),this.getInput("RETURN")&&this.moveInputBefore("STACK",
"RETURN")):this.removeInput("STACK",!0),this.hasStatements_=a)},updateParams_:function(){var a="";this.arguments_.length&&(a=Blockly.Msg.PROCEDURES_BEFORE_PARAMS+" "+this.arguments_.join(", "));Blockly.Events.disable();try{this.setFieldValue(a,"PARAMS")}finally{Blockly.Events.enable()}},mutationToDom:function(a){var b=Blockly.utils.xml.createElement("mutation");a&&b.setAttribute("name",this.getFieldValue("NAME"));for(var c=0;c<this.argumentVarModels_.length;c++){var d=Blockly.utils.xml.createElement("arg"),
e=this.argumentVarModels_[c];d.setAttribute("name",e.name);d.setAttribute("varid",e.getId());a&&this.paramIds_&&d.setAttribute("paramId",this.paramIds_[c]);b.appendChild(d)}this.hasStatements_||b.setAttribute("statements","false");return b},domToMutation:function(a){this.arguments_=[];this.argumentVarModels_=[];for(var b=0,c;c=a.childNodes[b];b++)if("arg"==c.nodeName.toLowerCase()){var d=c.getAttribute("name");c=c.getAttribute("varid")||c.getAttribute("varId");this.arguments_.push(d);c=Blockly.Variables.getOrCreateVariablePackage(this.workspace,
c,d,"");null!=c?this.argumentVarModels_.push(c):console.log("Failed to create a variable with name "+d+", ignoring.")}this.updateParams_();Blockly.Procedures.mutateCallers(this);this.setStatements_("false"!==a.getAttribute("statements"))},decompose:function(a){var b=Blockly.utils.xml.createElement("block");b.setAttribute("type","procedures_mutatorcontainer");var c=Blockly.utils.xml.createElement("statement");c.setAttribute("name","STACK");b.appendChild(c);for(var d=0;d<this.arguments_.length;d++){var e=
Blockly.utils.xml.createElement("block");e.setAttribute("type","procedures_mutatorarg");var f=Blockly.utils.xml.createElement("field");f.setAttribute("name","NAME");var g=Blockly.utils.xml.createTextNode(this.arguments_[d]);f.appendChild(g);e.appendChild(f);f=Blockly.utils.xml.createElement("next");e.appendChild(f);c.appendChild(e);c=f}a=Blockly.Xml.domToBlock(b,a);"procedures_defreturn"==this.type?a.setFieldValue(this.hasStatements_,"STATEMENTS"):a.removeInput("STATEMENT_INPUT");Blockly.Procedures.mutateCallers(this);
return a},compose:function(a){this.arguments_=[];this.paramIds_=[];this.argumentVarModels_=[];for(var b=a.getInputTargetBlock("STACK");b&&!b.isInsertionMarker();){var c=b.getFieldValue("NAME");this.arguments_.push(c);c=this.workspace.getVariable(c,"");this.argumentVarModels_.push(c);this.paramIds_.push(b.id);b=b.nextConnection&&b.nextConnection.targetBlock()}this.updateParams_();Blockly.Procedures.mutateCallers(this);a=a.getFieldValue("STATEMENTS");if(null!==a&&(a="TRUE"==a,this.hasStatements_!=a))if(a)this.setStatements_(!0),
Blockly.Mutator.reconnect(this.statementConnection_,this,"STACK"),this.statementConnection_=null;else{a=this.getInput("STACK").connection;if(this.statementConnection_=a.targetConnection)a=a.targetBlock(),a.unplug(),a.bumpNeighbours();this.setStatements_(!1)}},getProcedureDef:function(){return[this.getFieldValue("NAME"),this.arguments_,!1]},getVars:function(){return this.arguments_},getVarModels:function(){return this.argumentVarModels_},renameVarById:function(a,b){var c=this.workspace.getVariableById(a);
if(""==c.type){c=c.name;b=this.workspace.getVariableById(b);for(var d=!1,e=0;e<this.argumentVarModels_.length;e++)this.argumentVarModels_[e].getId()==a&&(this.arguments_[e]=b.name,this.argumentVarModels_[e]=b,d=!0);d&&(this.displayRenamedVar_(c,b.name),Blockly.Procedures.mutateCallers(this))}},updateVarName:function(a){for(var b=a.name,c=!1,d=0;d<this.argumentVarModels_.length;d++)if(this.argumentVarModels_[d].getId()==a.getId()){var e=this.arguments_[d];this.arguments_[d]=b;c=!0}c&&(this.displayRenamedVar_(e,
b),Blockly.Procedures.mutateCallers(this))},displayRenamedVar_:function(a,b){this.updateParams_();if(this.mutator&&this.mutator.isVisible())for(var c=this.mutator.workspace_.getAllBlocks(!1),d=0,e;e=c[d];d++)"procedures_mutatorarg"==e.type&&Blockly.Names.equals(a,e.getFieldValue("NAME"))&&e.setFieldValue(b,"NAME")},customContextMenu:function(a){if(!this.isInFlyout){var b={enabled:!0},c=this.getFieldValue("NAME");b.text=Blockly.Msg.PROCEDURES_CREATE_DO.replace("%1",c);var d=Blockly.utils.xml.createElement("mutation");
d.setAttribute("name",c);for(c=0;c<this.arguments_.length;c++){var e=Blockly.utils.xml.createElement("arg");e.setAttribute("name",this.arguments_[c]);d.appendChild(e)}c=Blockly.utils.xml.createElement("block");c.setAttribute("type",this.callType_);c.appendChild(d);b.callback=Blockly.ContextMenu.callbackFactory(this,c);a.push(b);if(!this.isCollapsed())for(c=0;c<this.argumentVarModels_.length;c++)b={enabled:!0},d=this.argumentVarModels_[c],b.text=Blockly.Msg.VARIABLES_SET_CREATE_GET.replace("%1",d.name),
d=Blockly.Variables.generateVariableFieldDom(d),e=Blockly.utils.xml.createElement("block"),e.setAttribute("type","variables_get"),e.appendChild(d),b.callback=Blockly.ContextMenu.callbackFactory(this,e),a.push(b)}},callType_:"procedures_callnoreturn"};
Blockly.Blocks.procedures_defreturn={init:function(){var a=Blockly.Procedures.findLegalName("",this);a=new Blockly.FieldTextInput(a,Blockly.Procedures.rename);a.setSpellcheck(!1);this.appendDummyInput().appendField(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE).appendField(a,"NAME").appendField("","PARAMS");this.appendValueInput("RETURN").setAlign(Blockly.ALIGN_RIGHT).appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));(this.workspace.options.comments||
this.workspace.options.parentWorkspace&&this.workspace.options.parentWorkspace.options.comments)&&Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT&&this.setCommentText(Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT);this.setStyle("procedure_blocks");this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);this.arguments_=[];this.argumentVarModels_=[];this.setStatements_(!0);this.statementConnection_=null},setStatements_:Blockly.Blocks.procedures_defnoreturn.setStatements_,
updateParams_:Blockly.Blocks.procedures_defnoreturn.updateParams_,mutationToDom:Blockly.Blocks.procedures_defnoreturn.mutationToDom,domToMutation:Blockly.Blocks.procedures_defnoreturn.domToMutation,decompose:Blockly.Blocks.procedures_defnoreturn.decompose,compose:Blockly.Blocks.procedures_defnoreturn.compose,getProcedureDef:function(){return[this.getFieldValue("NAME"),this.arguments_,!0]},getVars:Blockly.Blocks.procedures_defnoreturn.getVars,getVarModels:Blockly.Blocks.procedures_defnoreturn.getVarModels,
renameVarById:Blockly.Blocks.procedures_defnoreturn.renameVarById,updateVarName:Blockly.Blocks.procedures_defnoreturn.updateVarName,displayRenamedVar_:Blockly.Blocks.procedures_defnoreturn.displayRenamedVar_,customContextMenu:Blockly.Blocks.procedures_defnoreturn.customContextMenu,callType_:"procedures_callreturn"};
Blockly.Blocks.procedures_mutatorcontainer={init:function(){this.appendDummyInput().appendField(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);this.appendStatementInput("STACK");this.appendDummyInput("STATEMENT_INPUT").appendField(Blockly.Msg.PROCEDURES_ALLOW_STATEMENTS).appendField(new Blockly.FieldCheckbox("TRUE"),"STATEMENTS");this.setStyle("procedure_blocks");this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP);this.contextMenu=!1}};
Blockly.Blocks.procedures_mutatorarg={init:function(){var a=new Blockly.FieldTextInput(Blockly.Procedures.DEFAULT_ARG,this.validator_);a.oldShowEditorFn_=a.showEditor_;a.showEditor_=function(){this.createdVariables_=[];this.oldShowEditorFn_()};this.appendDummyInput().appendField(Blockly.Msg.PROCEDURES_MUTATORARG_TITLE).appendField(a,"NAME");this.setPreviousStatement(!0);this.setNextStatement(!0);this.setStyle("procedure_blocks");this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORARG_TOOLTIP);this.contextMenu=
!1;a.onFinishEditing_=this.deleteIntermediateVars_;a.createdVariables_=[];a.onFinishEditing_("x")},validator_:function(a){var b=this.getSourceBlock(),c=Blockly.Mutator.findParentWs(b.workspace);a=a.replace(/[\s\xa0]+/g," ").replace(/^ | $/g,"");if(!a)return null;for(var d=(b.workspace.targetWorkspace||b.workspace).getAllBlocks(!1),e=a.toLowerCase(),f=0;f<d.length;f++)if(d[f].id!=this.getSourceBlock().id){var g=d[f].getFieldValue("NAME");if(g&&g.toLowerCase()==e)return null}if(b.isInFlyout)return a;
(b=c.getVariable(a,""))&&b.name!=a&&c.renameVariableById(b.getId(),a);b||(b=c.createVariable(a,""))&&this.createdVariables_&&this.createdVariables_.push(b);return a},deleteIntermediateVars_:function(a){var b=Blockly.Mutator.findParentWs(this.getSourceBlock().workspace);if(b)for(var c=0;c<this.createdVariables_.length;c++){var d=this.createdVariables_[c];d.name!=a&&b.deleteVariableById(d.getId())}}};
Blockly.Blocks.procedures_callnoreturn={init:function(){this.appendDummyInput("TOPROW").appendField("","NAME");this.setPreviousStatement(!0);this.setNextStatement(!0);this.setStyle("procedure_blocks");this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);this.arguments_=[];this.argumentVarModels_=[];this.quarkConnections_={};this.quarkIds_=null;this.previousEnabledState_=!0},getProcedureCall:function(){return this.getFieldValue("NAME")},renameProcedure:function(a,b){Blockly.Names.equals(a,
this.getProcedureCall())&&(this.setFieldValue(b,"NAME"),this.setTooltip((this.outputConnection?Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP:Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace("%1",b)))},setProcedureParameters_:function(a,b){var c=Blockly.Procedures.getDefinition(this.getProcedureCall(),this.workspace),d=c&&c.mutator&&c.mutator.isVisible();d||(this.quarkConnections_={},this.quarkIds_=null);if(b)if(a.join("\n")==this.arguments_.join("\n"))this.quarkIds_=b;else{if(b.length!=a.length)throw RangeError("paramNames and paramIds must be the same length.");
this.setCollapsed(!1);this.quarkIds_||(this.quarkConnections_={},this.quarkIds_=[]);c=this.rendered;this.rendered=!1;for(var e=0;e<this.arguments_.length;e++){var f=this.getInput("ARG"+e);f&&(f=f.connection.targetConnection,this.quarkConnections_[this.quarkIds_[e]]=f,d&&f&&-1==b.indexOf(this.quarkIds_[e])&&(f.disconnect(),f.getSourceBlock().bumpNeighbours()))}this.arguments_=[].concat(a);this.argumentVarModels_=[];for(e=0;e<this.arguments_.length;e++)a=Blockly.Variables.getOrCreateVariablePackage(this.workspace,
null,this.arguments_[e],""),this.argumentVarModels_.push(a);this.updateShape_();if(this.quarkIds_=b)for(e=0;e<this.arguments_.length;e++)b=this.quarkIds_[e],b in this.quarkConnections_&&(f=this.quarkConnections_[b],Blockly.Mutator.reconnect(f,this,"ARG"+e)||delete this.quarkConnections_[b]);(this.rendered=c)&&this.render()}},updateShape_:function(){for(var a=0;a<this.arguments_.length;a++){var b=this.getField("ARGNAME"+a);if(b){Blockly.Events.disable();try{b.setValue(this.arguments_[a])}finally{Blockly.Events.enable()}}else b=
new Blockly.FieldLabel(this.arguments_[a]),this.appendValueInput("ARG"+a).setAlign(Blockly.ALIGN_RIGHT).appendField(b,"ARGNAME"+a).init()}for(;this.getInput("ARG"+a);)this.removeInput("ARG"+a),a++;if(a=this.getInput("TOPROW"))this.arguments_.length?this.getField("WITH")||(a.appendField(Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS,"WITH"),a.init()):this.getField("WITH")&&a.removeField("WITH")},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("name",this.getProcedureCall());
for(var b=0;b<this.arguments_.length;b++){var c=Blockly.utils.xml.createElement("arg");c.setAttribute("name",this.arguments_[b]);a.appendChild(c)}return a},domToMutation:function(a){var b=a.getAttribute("name");this.renameProcedure(this.getProcedureCall(),b);b=[];for(var c=[],d=0,e;e=a.childNodes[d];d++)"arg"==e.nodeName.toLowerCase()&&(b.push(e.getAttribute("name")),c.push(e.getAttribute("paramId")));this.setProcedureParameters_(b,c)},getVars:function(){return this.arguments_},getVarModels:function(){return this.argumentVarModels_},
onchange:function(a){if(this.workspace&&!this.workspace.isFlyout&&a.recordUndo)if(a.type==Blockly.Events.BLOCK_CREATE&&-1!=a.ids.indexOf(this.id)){var b=this.getProcedureCall();b=Blockly.Procedures.getDefinition(b,this.workspace);!b||b.type==this.defType_&&JSON.stringify(b.getVars())==JSON.stringify(this.arguments_)||(b=null);if(!b){Blockly.Events.setGroup(a.group);a=Blockly.utils.xml.createElement("xml");b=Blockly.utils.xml.createElement("block");b.setAttribute("type",this.defType_);var c=this.getRelativeToSurfaceXY(),
d=c.y+2*Blockly.SNAP_RADIUS;b.setAttribute("x",c.x+Blockly.SNAP_RADIUS*(this.RTL?-1:1));b.setAttribute("y",d);c=this.mutationToDom();b.appendChild(c);c=Blockly.utils.xml.createElement("field");c.setAttribute("name","NAME");d=this.getProcedureCall();d||(d=Blockly.Procedures.findLegalName("",this),this.renameProcedure("",d));c.appendChild(Blockly.utils.xml.createTextNode(d));b.appendChild(c);a.appendChild(b);Blockly.Xml.domToWorkspace(a,this.workspace);Blockly.Events.setGroup(!1)}}else a.type==Blockly.Events.BLOCK_DELETE?
(b=this.getProcedureCall(),b=Blockly.Procedures.getDefinition(b,this.workspace),b||(Blockly.Events.setGroup(a.group),this.dispose(!0),Blockly.Events.setGroup(!1))):a.type==Blockly.Events.CHANGE&&"disabled"==a.element&&(b=this.getProcedureCall(),(b=Blockly.Procedures.getDefinition(b,this.workspace))&&b.id==a.blockId&&((b=Blockly.Events.getGroup())&&console.log("Saw an existing group while responding to a definition change"),Blockly.Events.setGroup(a.group),a.newValue?(this.previousEnabledState_=this.isEnabled(),
this.setEnabled(!1)):this.setEnabled(this.previousEnabledState_),Blockly.Events.setGroup(b)))},customContextMenu:function(a){if(this.workspace.isMovable()){var b={enabled:!0};b.text=Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;var c=this.getProcedureCall(),d=this.workspace;b.callback=function(){var e=Blockly.Procedures.getDefinition(c,d);e&&(d.centerOnBlock(e.id),e.select())};a.push(b)}},defType_:"procedures_defnoreturn"};
Blockly.Blocks.procedures_callreturn={init:function(){this.appendDummyInput("TOPROW").appendField("","NAME");this.setOutput(!0);this.setStyle("procedure_blocks");this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);this.arguments_=[];this.argumentVarModels_=[];this.quarkConnections_={};this.quarkIds_=null;this.previousEnabledState_=!0},getProcedureCall:Blockly.Blocks.procedures_callnoreturn.getProcedureCall,renameProcedure:Blockly.Blocks.procedures_callnoreturn.renameProcedure,setProcedureParameters_:Blockly.Blocks.procedures_callnoreturn.setProcedureParameters_,
updateShape_:Blockly.Blocks.procedures_callnoreturn.updateShape_,mutationToDom:Blockly.Blocks.procedures_callnoreturn.mutationToDom,domToMutation:Blockly.Blocks.procedures_callnoreturn.domToMutation,getVars:Blockly.Blocks.procedures_callnoreturn.getVars,getVarModels:Blockly.Blocks.procedures_callnoreturn.getVarModels,onchange:Blockly.Blocks.procedures_callnoreturn.onchange,customContextMenu:Blockly.Blocks.procedures_callnoreturn.customContextMenu,defType_:"procedures_defreturn"};
Blockly.Blocks.procedures_ifreturn={init:function(){this.appendValueInput("CONDITION").setCheck("Boolean").appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);this.appendValueInput("VALUE").appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);this.setInputsInline(!0);this.setPreviousStatement(!0);this.setNextStatement(!0);this.setStyle("procedure_blocks");this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);this.setHelpUrl(Blockly.Msg.PROCEDURES_IFRETURN_HELPURL);this.hasReturnValue_=!0},mutationToDom:function(){var a=
Blockly.utils.xml.createElement("mutation");a.setAttribute("value",Number(this.hasReturnValue_));return a},domToMutation:function(a){this.hasReturnValue_=1==a.getAttribute("value");this.hasReturnValue_||(this.removeInput("VALUE"),this.appendDummyInput("VALUE").appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN))},onchange:function(a){if(this.workspace.isDragging&&!this.workspace.isDragging()){a=!1;var b=this;do{if(-1!=this.FUNCTION_TYPES.indexOf(b.type)){a=!0;break}b=b.getSurroundParent()}while(b);
a?("procedures_defnoreturn"==b.type&&this.hasReturnValue_?(this.removeInput("VALUE"),this.appendDummyInput("VALUE").appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN),this.hasReturnValue_=!1):"procedures_defreturn"!=b.type||this.hasReturnValue_||(this.removeInput("VALUE"),this.appendValueInput("VALUE").appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN),this.hasReturnValue_=!0),this.setWarningText(null),this.isInFlyout||this.setEnabled(!0)):(this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING),
this.isInFlyout||this.getInheritedDisabled()||this.setEnabled(!1))}},FUNCTION_TYPES:["procedures_defnoreturn","procedures_defreturn"]};Blockly.Blocks.texts={};Blockly.Constants.Text={};Blockly.Constants.Text.HUE=160;
Blockly.defineBlocksWithJsonArray([{type:"text",message0:"%1",args0:[{type:"field_input",name:"TEXT",text:""}],output:"String",style:"text_blocks",helpUrl:"%{BKY_TEXT_TEXT_HELPURL}",tooltip:"%{BKY_TEXT_TEXT_TOOLTIP}",extensions:["text_quotes","parent_tooltip_when_inline"]},{type:"text_multiline",message0:"%1 %2",args0:[{type:"field_image",src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAARCAYAAADpPU2iAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAdhgAAHYYBXaITgQAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMS42/U4J6AAAAP1JREFUOE+Vks0KQUEYhjmRIja4ABtZ2dm5A3t3Ia6AUm7CylYuQRaUhZSlLZJiQbFAyRnPN33y01HOW08z8873zpwzM4F3GWOCruvGIE4/rLaV+Nq1hVGMBqzhqlxgCys4wJA65xnogMHsQ5lujnYHTejBBCK2mE4abjCgMGhNxHgDFWjDSG07kdfVa2pZMf4ZyMAdWmpZMfYOsLiDMYMjlMB+K613QISRhTnITnsYg5yUd0DETmEoMlkFOeIT/A58iyK5E18BuTBfgYXfwNJv4P9/oEBerLylOnRhygmGdPpTTBZAPkde61lbQe4moWUvYUZYLfUNftIY4zwA5X2Z9AYnQrEAAAAASUVORK5CYII=",width:12,
height:17,alt:"\u00b6"},{type:"field_multilinetext",name:"TEXT",text:""}],output:"String",style:"text_blocks",helpUrl:"%{BKY_TEXT_TEXT_HELPURL}",tooltip:"%{BKY_TEXT_TEXT_TOOLTIP}",extensions:["parent_tooltip_when_inline"]},{type:"text_join",message0:"",output:"String",style:"text_blocks",helpUrl:"%{BKY_TEXT_JOIN_HELPURL}",tooltip:"%{BKY_TEXT_JOIN_TOOLTIP}",mutator:"text_join_mutator"},{type:"text_create_join_container",message0:"%{BKY_TEXT_CREATE_JOIN_TITLE_JOIN} %1 %2",args0:[{type:"input_dummy"},
{type:"input_statement",name:"STACK"}],style:"text_blocks",tooltip:"%{BKY_TEXT_CREATE_JOIN_TOOLTIP}",enableContextMenu:!1},{type:"text_create_join_item",message0:"%{BKY_TEXT_CREATE_JOIN_ITEM_TITLE_ITEM}",previousStatement:null,nextStatement:null,style:"text_blocks",tooltip:"%{BKY_TEXT_CREATE_JOIN_ITEM_TOOLTIP}",enableContextMenu:!1},{type:"text_append",message0:"%{BKY_TEXT_APPEND_TITLE}",args0:[{type:"field_variable",name:"VAR",variable:"%{BKY_TEXT_APPEND_VARIABLE}"},{type:"input_value",name:"TEXT"}],
previousStatement:null,nextStatement:null,style:"text_blocks",extensions:["text_append_tooltip"]},{type:"text_length",message0:"%{BKY_TEXT_LENGTH_TITLE}",args0:[{type:"input_value",name:"VALUE",check:["String","Array"]}],output:"Number",style:"text_blocks",tooltip:"%{BKY_TEXT_LENGTH_TOOLTIP}",helpUrl:"%{BKY_TEXT_LENGTH_HELPURL}"},{type:"text_isEmpty",message0:"%{BKY_TEXT_ISEMPTY_TITLE}",args0:[{type:"input_value",name:"VALUE",check:["String","Array"]}],output:"Boolean",style:"text_blocks",tooltip:"%{BKY_TEXT_ISEMPTY_TOOLTIP}",
helpUrl:"%{BKY_TEXT_ISEMPTY_HELPURL}"},{type:"text_indexOf",message0:"%{BKY_TEXT_INDEXOF_TITLE}",args0:[{type:"input_value",name:"VALUE",check:"String"},{type:"field_dropdown",name:"END",options:[["%{BKY_TEXT_INDEXOF_OPERATOR_FIRST}","FIRST"],["%{BKY_TEXT_INDEXOF_OPERATOR_LAST}","LAST"]]},{type:"input_value",name:"FIND",check:"String"}],output:"Number",style:"text_blocks",helpUrl:"%{BKY_TEXT_INDEXOF_HELPURL}",inputsInline:!0,extensions:["text_indexOf_tooltip"]},{type:"text_charAt",message0:"%{BKY_TEXT_CHARAT_TITLE}",
args0:[{type:"input_value",name:"VALUE",check:"String"},{type:"field_dropdown",name:"WHERE",options:[["%{BKY_TEXT_CHARAT_FROM_START}","FROM_START"],["%{BKY_TEXT_CHARAT_FROM_END}","FROM_END"],["%{BKY_TEXT_CHARAT_FIRST}","FIRST"],["%{BKY_TEXT_CHARAT_LAST}","LAST"],["%{BKY_TEXT_CHARAT_RANDOM}","RANDOM"]]}],output:"String",style:"text_blocks",helpUrl:"%{BKY_TEXT_CHARAT_HELPURL}",inputsInline:!0,mutator:"text_charAt_mutator"}]);
Blockly.Blocks.text_getSubstring={init:function(){this.WHERE_OPTIONS_1=[[Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_START,"FROM_START"],[Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_END,"FROM_END"],[Blockly.Msg.TEXT_GET_SUBSTRING_START_FIRST,"FIRST"]];this.WHERE_OPTIONS_2=[[Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_START,"FROM_START"],[Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_END,"FROM_END"],[Blockly.Msg.TEXT_GET_SUBSTRING_END_LAST,"LAST"]];this.setHelpUrl(Blockly.Msg.TEXT_GET_SUBSTRING_HELPURL);this.setStyle("text_blocks");
this.appendValueInput("STRING").setCheck("String").appendField(Blockly.Msg.TEXT_GET_SUBSTRING_INPUT_IN_TEXT);this.appendDummyInput("AT1");this.appendDummyInput("AT2");Blockly.Msg.TEXT_GET_SUBSTRING_TAIL&&this.appendDummyInput("TAIL").appendField(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL);this.setInputsInline(!0);this.setOutput(!0,"String");this.updateAt_(1,!0);this.updateAt_(2,!0);this.setTooltip(Blockly.Msg.TEXT_GET_SUBSTRING_TOOLTIP)},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation"),
b=this.getInput("AT1").type==Blockly.INPUT_VALUE;a.setAttribute("at1",b);b=this.getInput("AT2").type==Blockly.INPUT_VALUE;a.setAttribute("at2",b);return a},domToMutation:function(a){var b="true"==a.getAttribute("at1");a="true"==a.getAttribute("at2");this.updateAt_(1,b);this.updateAt_(2,a)},updateAt_:function(a,b){this.removeInput("AT"+a);this.removeInput("ORDINAL"+a,!0);b?(this.appendValueInput("AT"+a).setCheck("Number"),Blockly.Msg.ORDINAL_NUMBER_SUFFIX&&this.appendDummyInput("ORDINAL"+a).appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)):
this.appendDummyInput("AT"+a);2==a&&Blockly.Msg.TEXT_GET_SUBSTRING_TAIL&&(this.removeInput("TAIL",!0),this.appendDummyInput("TAIL").appendField(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL));var c=new Blockly.FieldDropdown(this["WHERE_OPTIONS_"+a],function(d){var e="FROM_START"==d||"FROM_END"==d;if(e!=b){var f=this.getSourceBlock();f.updateAt_(a,e);f.setFieldValue(d,"WHERE"+a);return null}});this.getInput("AT"+a).appendField(c,"WHERE"+a);1==a&&(this.moveInputBefore("AT1","AT2"),this.getInput("ORDINAL1")&&
this.moveInputBefore("ORDINAL1","AT2"))}};Blockly.Blocks.text_changeCase={init:function(){var a=[[Blockly.Msg.TEXT_CHANGECASE_OPERATOR_UPPERCASE,"UPPERCASE"],[Blockly.Msg.TEXT_CHANGECASE_OPERATOR_LOWERCASE,"LOWERCASE"],[Blockly.Msg.TEXT_CHANGECASE_OPERATOR_TITLECASE,"TITLECASE"]];this.setHelpUrl(Blockly.Msg.TEXT_CHANGECASE_HELPURL);this.setStyle("text_blocks");this.appendValueInput("TEXT").setCheck("String").appendField(new Blockly.FieldDropdown(a),"CASE");this.setOutput(!0,"String");this.setTooltip(Blockly.Msg.TEXT_CHANGECASE_TOOLTIP)}};
Blockly.Blocks.text_trim={init:function(){var a=[[Blockly.Msg.TEXT_TRIM_OPERATOR_BOTH,"BOTH"],[Blockly.Msg.TEXT_TRIM_OPERATOR_LEFT,"LEFT"],[Blockly.Msg.TEXT_TRIM_OPERATOR_RIGHT,"RIGHT"]];this.setHelpUrl(Blockly.Msg.TEXT_TRIM_HELPURL);this.setStyle("text_blocks");this.appendValueInput("TEXT").setCheck("String").appendField(new Blockly.FieldDropdown(a),"MODE");this.setOutput(!0,"String");this.setTooltip(Blockly.Msg.TEXT_TRIM_TOOLTIP)}};
Blockly.Blocks.text_print={init:function(){this.jsonInit({message0:Blockly.Msg.TEXT_PRINT_TITLE,args0:[{type:"input_value",name:"TEXT"}],previousStatement:null,nextStatement:null,style:"text_blocks",tooltip:Blockly.Msg.TEXT_PRINT_TOOLTIP,helpUrl:Blockly.Msg.TEXT_PRINT_HELPURL})}};
Blockly.Blocks.text_prompt_ext={init:function(){var a=[[Blockly.Msg.TEXT_PROMPT_TYPE_TEXT,"TEXT"],[Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER,"NUMBER"]];this.setHelpUrl(Blockly.Msg.TEXT_PROMPT_HELPURL);this.setStyle("text_blocks");var b=this;a=new Blockly.FieldDropdown(a,function(c){b.updateType_(c)});this.appendValueInput("TEXT").appendField(a,"TYPE");this.setOutput(!0,"String");this.setTooltip(function(){return"TEXT"==b.getFieldValue("TYPE")?Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT:Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER})},
updateType_:function(a){this.outputConnection.setCheck("NUMBER"==a?"Number":"String")},mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("type",this.getFieldValue("TYPE"));return a},domToMutation:function(a){this.updateType_(a.getAttribute("type"))}};
Blockly.Blocks.text_prompt={init:function(){this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);var a=[[Blockly.Msg.TEXT_PROMPT_TYPE_TEXT,"TEXT"],[Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER,"NUMBER"]],b=this;this.setHelpUrl(Blockly.Msg.TEXT_PROMPT_HELPURL);this.setStyle("text_blocks");a=new Blockly.FieldDropdown(a,function(c){b.updateType_(c)});this.appendDummyInput().appendField(a,"TYPE").appendField(this.newQuote_(!0)).appendField(new Blockly.FieldTextInput(""),"TEXT").appendField(this.newQuote_(!1));
this.setOutput(!0,"String");this.setTooltip(function(){return"TEXT"==b.getFieldValue("TYPE")?Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT:Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER})},updateType_:Blockly.Blocks.text_prompt_ext.updateType_,mutationToDom:Blockly.Blocks.text_prompt_ext.mutationToDom,domToMutation:Blockly.Blocks.text_prompt_ext.domToMutation};
Blockly.Blocks.text_count={init:function(){this.jsonInit({message0:Blockly.Msg.TEXT_COUNT_MESSAGE0,args0:[{type:"input_value",name:"SUB",check:"String"},{type:"input_value",name:"TEXT",check:"String"}],output:"Number",inputsInline:!0,style:"text_blocks",tooltip:Blockly.Msg.TEXT_COUNT_TOOLTIP,helpUrl:Blockly.Msg.TEXT_COUNT_HELPURL})}};
Blockly.Blocks.text_replace={init:function(){this.jsonInit({message0:Blockly.Msg.TEXT_REPLACE_MESSAGE0,args0:[{type:"input_value",name:"FROM",check:"String"},{type:"input_value",name:"TO",check:"String"},{type:"input_value",name:"TEXT",check:"String"}],output:"String",inputsInline:!0,style:"text_blocks",tooltip:Blockly.Msg.TEXT_REPLACE_TOOLTIP,helpUrl:Blockly.Msg.TEXT_REPLACE_HELPURL})}};
Blockly.Blocks.text_reverse={init:function(){this.jsonInit({message0:Blockly.Msg.TEXT_REVERSE_MESSAGE0,args0:[{type:"input_value",name:"TEXT",check:"String"}],output:"String",inputsInline:!0,style:"text_blocks",tooltip:Blockly.Msg.TEXT_REVERSE_TOOLTIP,helpUrl:Blockly.Msg.TEXT_REVERSE_HELPURL})}};
Blockly.Constants.Text.QUOTE_IMAGE_MIXIN={QUOTE_IMAGE_LEFT_DATAURI:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC",QUOTE_IMAGE_RIGHT_DATAURI:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==",
QUOTE_IMAGE_WIDTH:12,QUOTE_IMAGE_HEIGHT:12,quoteField_:function(a){for(var b=0,c;c=this.inputList[b];b++)for(var d=0,e;e=c.fieldRow[d];d++)if(a==e.name){c.insertFieldAt(d,this.newQuote_(!0));c.insertFieldAt(d+2,this.newQuote_(!1));return}console.warn('field named "'+a+'" not found in '+this.toDevString())},newQuote_:function(a){a=this.RTL?!a:a;return new Blockly.FieldImage(a?this.QUOTE_IMAGE_LEFT_DATAURI:this.QUOTE_IMAGE_RIGHT_DATAURI,this.QUOTE_IMAGE_WIDTH,this.QUOTE_IMAGE_HEIGHT,a?"\u201c":"\u201d")}};
Blockly.Constants.Text.TEXT_QUOTES_EXTENSION=function(){this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);this.quoteField_("TEXT")};
Blockly.Constants.Text.TEXT_JOIN_MUTATOR_MIXIN={mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("items",this.itemCount_);return a},domToMutation:function(a){this.itemCount_=parseInt(a.getAttribute("items"),10);this.updateShape_()},decompose:function(a){var b=a.newBlock("text_create_join_container");b.initSvg();for(var c=b.getInput("STACK").connection,d=0;d<this.itemCount_;d++){var e=a.newBlock("text_create_join_item");e.initSvg();c.connect(e.previousConnection);
c=e.nextConnection}return b},compose:function(a){var b=a.getInputTargetBlock("STACK");for(a=[];b&&!b.isInsertionMarker();)a.push(b.valueConnection_),b=b.nextConnection&&b.nextConnection.targetBlock();for(b=0;b<this.itemCount_;b++){var c=this.getInput("ADD"+b).connection.targetConnection;c&&-1==a.indexOf(c)&&c.disconnect()}this.itemCount_=a.length;this.updateShape_();for(b=0;b<this.itemCount_;b++)Blockly.Mutator.reconnect(a[b],this,"ADD"+b)},saveConnections:function(a){a=a.getInputTargetBlock("STACK");
for(var b=0;a;){var c=this.getInput("ADD"+b);a.valueConnection_=c&&c.connection.targetConnection;b++;a=a.nextConnection&&a.nextConnection.targetBlock()}},updateShape_:function(){this.itemCount_&&this.getInput("EMPTY")?this.removeInput("EMPTY"):this.itemCount_||this.getInput("EMPTY")||this.appendDummyInput("EMPTY").appendField(this.newQuote_(!0)).appendField(this.newQuote_(!1));for(var a=0;a<this.itemCount_;a++)if(!this.getInput("ADD"+a)){var b=this.appendValueInput("ADD"+a).setAlign(Blockly.ALIGN_RIGHT);
0==a&&b.appendField(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH)}for(;this.getInput("ADD"+a);)this.removeInput("ADD"+a),a++}};Blockly.Constants.Text.TEXT_JOIN_EXTENSION=function(){this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);this.itemCount_=2;this.updateShape_();this.setMutator(new Blockly.Mutator(["text_create_join_item"]))};Blockly.Extensions.register("text_append_tooltip",Blockly.Extensions.buildTooltipWithFieldText("%{BKY_TEXT_APPEND_TOOLTIP}","VAR"));
Blockly.Constants.Text.TEXT_INDEXOF_TOOLTIP_EXTENSION=function(){var a=this;this.setTooltip(function(){return Blockly.Msg.TEXT_INDEXOF_TOOLTIP.replace("%1",a.workspace.options.oneBasedIndex?"0":"-1")})};
Blockly.Constants.Text.TEXT_CHARAT_MUTATOR_MIXIN={mutationToDom:function(){var a=Blockly.utils.xml.createElement("mutation");a.setAttribute("at",!!this.isAt_);return a},domToMutation:function(a){a="false"!=a.getAttribute("at");this.updateAt_(a)},updateAt_:function(a){this.removeInput("AT",!0);this.removeInput("ORDINAL",!0);a&&(this.appendValueInput("AT").setCheck("Number"),Blockly.Msg.ORDINAL_NUMBER_SUFFIX&&this.appendDummyInput("ORDINAL").appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX));Blockly.Msg.TEXT_CHARAT_TAIL&&
(this.removeInput("TAIL",!0),this.appendDummyInput("TAIL").appendField(Blockly.Msg.TEXT_CHARAT_TAIL));this.isAt_=a}};
Blockly.Constants.Text.TEXT_CHARAT_EXTENSION=function(){this.getField("WHERE").setValidator(function(b){b="FROM_START"==b||"FROM_END"==b;b!=this.isAt_&&this.getSourceBlock().updateAt_(b)});this.updateAt_(!0);var a=this;this.setTooltip(function(){var b=a.getFieldValue("WHERE"),c=Blockly.Msg.TEXT_CHARAT_TOOLTIP;("FROM_START"==b||"FROM_END"==b)&&(b="FROM_START"==b?Blockly.Msg.LISTS_INDEX_FROM_START_TOOLTIP:Blockly.Msg.LISTS_INDEX_FROM_END_TOOLTIP)&&(c+="  "+b.replace("%1",a.workspace.options.oneBasedIndex?
"#1":"#0"));return c})};Blockly.Extensions.register("text_indexOf_tooltip",Blockly.Constants.Text.TEXT_INDEXOF_TOOLTIP_EXTENSION);Blockly.Extensions.register("text_quotes",Blockly.Constants.Text.TEXT_QUOTES_EXTENSION);Blockly.Extensions.registerMutator("text_join_mutator",Blockly.Constants.Text.TEXT_JOIN_MUTATOR_MIXIN,Blockly.Constants.Text.TEXT_JOIN_EXTENSION);Blockly.Extensions.registerMutator("text_charAt_mutator",Blockly.Constants.Text.TEXT_CHARAT_MUTATOR_MIXIN,Blockly.Constants.Text.TEXT_CHARAT_EXTENSION);Blockly.Blocks.variables={};Blockly.Constants.Variables={};Blockly.Constants.Variables.HUE=330;
Blockly.defineBlocksWithJsonArray([{type:"variables_get",message0:"%1",args0:[{type:"field_variable",name:"VAR",variable:"%{BKY_VARIABLES_DEFAULT_NAME}"}],output:null,style:"variable_blocks",helpUrl:"%{BKY_VARIABLES_GET_HELPURL}",tooltip:"%{BKY_VARIABLES_GET_TOOLTIP}",extensions:["contextMenu_variableSetterGetter"]},{type:"variables_set",message0:"%{BKY_VARIABLES_SET}",args0:[{type:"field_variable",name:"VAR",variable:"%{BKY_VARIABLES_DEFAULT_NAME}"},{type:"input_value",name:"VALUE"}],previousStatement:null,
nextStatement:null,style:"variable_blocks",tooltip:"%{BKY_VARIABLES_SET_TOOLTIP}",helpUrl:"%{BKY_VARIABLES_SET_HELPURL}",extensions:["contextMenu_variableSetterGetter"]}]);
Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN={customContextMenu:function(a){if(!this.isInFlyout){if("variables_get"==this.type)var b="variables_set",c=Blockly.Msg.VARIABLES_GET_CREATE_SET;else b="variables_get",c=Blockly.Msg.VARIABLES_SET_CREATE_GET;var d={enabled:0<this.workspace.remainingCapacity()},e=this.getField("VAR").getText();d.text=c.replace("%1",e);c=Blockly.utils.xml.createElement("field");c.setAttribute("name","VAR");c.appendChild(Blockly.utils.xml.createTextNode(e));
e=Blockly.utils.xml.createElement("block");e.setAttribute("type",b);e.appendChild(c);d.callback=Blockly.ContextMenu.callbackFactory(this,e);a.push(d)}else if("variables_get"==this.type||"variables_get_reporter"==this.type)b={text:Blockly.Msg.RENAME_VARIABLE,enabled:!0,callback:Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY(this)},e=this.getField("VAR").getText(),d={text:Blockly.Msg.DELETE_VARIABLE.replace("%1",e),enabled:!0,callback:Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY(this)},
a.unshift(b),a.unshift(d)}};Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY=function(a){return function(){var b=a.workspace,c=a.getField("VAR").getVariable();Blockly.Variables.renameVariable(b,c)}};Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY=function(a){return function(){var b=a.workspace,c=a.getField("VAR").getVariable();b.deleteVariableById(c.getId());b.refreshToolboxSelection()}};Blockly.Extensions.registerMixin("contextMenu_variableSetterGetter",Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN);Blockly.Constants.VariablesDynamic={};Blockly.Constants.VariablesDynamic.HUE=310;
Blockly.defineBlocksWithJsonArray([{type:"variables_get_dynamic",message0:"%1",args0:[{type:"field_variable",name:"VAR",variable:"%{BKY_VARIABLES_DEFAULT_NAME}"}],output:null,style:"variable_dynamic_blocks",helpUrl:"%{BKY_VARIABLES_GET_HELPURL}",tooltip:"%{BKY_VARIABLES_GET_TOOLTIP}",extensions:["contextMenu_variableDynamicSetterGetter"]},{type:"variables_set_dynamic",message0:"%{BKY_VARIABLES_SET}",args0:[{type:"field_variable",name:"VAR",variable:"%{BKY_VARIABLES_DEFAULT_NAME}"},{type:"input_value",
name:"VALUE"}],previousStatement:null,nextStatement:null,style:"variable_dynamic_blocks",tooltip:"%{BKY_VARIABLES_SET_TOOLTIP}",helpUrl:"%{BKY_VARIABLES_SET_HELPURL}",extensions:["contextMenu_variableDynamicSetterGetter"]}]);
Blockly.Constants.VariablesDynamic.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN={customContextMenu:function(a){if(!this.isInFlyout){var b=this.getFieldValue("VAR");var c=this.workspace.getVariableById(b).type;if("variables_get_dynamic"==this.type){b="variables_set_dynamic";var d=Blockly.Msg.VARIABLES_GET_CREATE_SET}else b="variables_get_dynamic",d=Blockly.Msg.VARIABLES_SET_CREATE_GET;var e={enabled:0<this.workspace.remainingCapacity()},f=this.getField("VAR").getText();e.text=d.replace("%1",f);
d=Blockly.utils.xml.createElement("field");d.setAttribute("name","VAR");d.setAttribute("variabletype",c);d.appendChild(Blockly.utils.xml.createTextNode(f));f=Blockly.utils.xml.createElement("block");f.setAttribute("type",b);f.appendChild(d);e.callback=Blockly.ContextMenu.callbackFactory(this,f);a.push(e)}else if("variables_get_dynamic"==this.type||"variables_get_reporter_dynamic"==this.type)b={text:Blockly.Msg.RENAME_VARIABLE,enabled:!0,callback:Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY(this)},
f=this.getField("VAR").getText(),e={text:Blockly.Msg.DELETE_VARIABLE.replace("%1",f),enabled:!0,callback:Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY(this)},a.unshift(b),a.unshift(e)},onchange:function(a){a=this.getFieldValue("VAR");a=Blockly.Variables.getVariable(this.workspace,a);"variables_get_dynamic"==this.type?this.outputConnection.setCheck(a.type):this.getInput("VALUE").connection.setCheck(a.type)}};
Blockly.Constants.VariablesDynamic.RENAME_OPTION_CALLBACK_FACTORY=function(a){return function(){var b=a.workspace,c=a.getField("VAR").getVariable();Blockly.Variables.renameVariable(b,c)}};Blockly.Constants.VariablesDynamic.DELETE_OPTION_CALLBACK_FACTORY=function(a){return function(){var b=a.workspace,c=a.getField("VAR").getVariable();b.deleteVariableById(c.getId());b.refreshToolboxSelection()}};Blockly.Extensions.registerMixin("contextMenu_variableDynamicSetterGetter",Blockly.Constants.VariablesDynamic.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN);
return Blockly.Blocks;
}));


//# sourceMappingURL=blocks_compressed.js.map


/***/ }),

/***/ 6421:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(8256), __webpack_require__(9177), __webpack_require__(1003), __webpack_require__(5466)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly, En, BlocklyBlocks, BlocklyJS) {
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly module for the browser. This includes Blockly core
 * and built in blocks, the JavaScript code generator and the English block
 * localization files.
 */

/* eslint-disable */
'use strict';

// Include the EN Locale by default.
Blockly.setLocale(En);

Blockly.Blocks = Blockly.Blocks || {};
Object.keys(BlocklyBlocks).forEach(function (k) {
  Blockly.Blocks[k] = BlocklyBlocks[k];
});

Blockly.JavaScript = BlocklyJS;
return Blockly;
})); 


/***/ }),

/***/ 8256:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(4097)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly core module for the browser. It includes blockly.js
 *               and adds a helper method for setting the locale.
 */

/* eslint-disable */
'use strict';

// Add a helper method to set the Blockly locale.
Blockly.setLocale = function (locale) {
  Blockly.Msg = Blockly.Msg || {};
  Object.keys(locale).forEach(function (k) {
    Blockly.Msg[k] = locale[k];
  });
};

return Blockly;
})); 


/***/ }),

/***/ 4948:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6421)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly module.
 */

/* eslint-disable */
'use strict';
return Blockly;
})); 


/***/ }),

/***/ 5466:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(8256), __webpack_require__(9274)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly, BlocklyJavaScript) {
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript Generator module.
 */

/* eslint-disable */
'use strict';

Blockly.JavaScript = BlocklyJavaScript;

return BlocklyJavaScript;
})); 


/***/ }),

/***/ 9274:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Do not edit this file; automatically generated by gulp.

/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1334)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {
  'use strict';Blockly.JavaScript=new Blockly.Generator("JavaScript");Blockly.JavaScript.addReservedWords("break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield,enum,implements,interface,let,package,private,protected,public,static,await,null,true,false,arguments,"+Object.getOwnPropertyNames(Blockly.utils.global).join(","));
Blockly.JavaScript.ORDER_ATOMIC=0;Blockly.JavaScript.ORDER_NEW=1.1;Blockly.JavaScript.ORDER_MEMBER=1.2;Blockly.JavaScript.ORDER_FUNCTION_CALL=2;Blockly.JavaScript.ORDER_INCREMENT=3;Blockly.JavaScript.ORDER_DECREMENT=3;Blockly.JavaScript.ORDER_BITWISE_NOT=4.1;Blockly.JavaScript.ORDER_UNARY_PLUS=4.2;Blockly.JavaScript.ORDER_UNARY_NEGATION=4.3;Blockly.JavaScript.ORDER_LOGICAL_NOT=4.4;Blockly.JavaScript.ORDER_TYPEOF=4.5;Blockly.JavaScript.ORDER_VOID=4.6;Blockly.JavaScript.ORDER_DELETE=4.7;
Blockly.JavaScript.ORDER_AWAIT=4.8;Blockly.JavaScript.ORDER_EXPONENTIATION=5;Blockly.JavaScript.ORDER_MULTIPLICATION=5.1;Blockly.JavaScript.ORDER_DIVISION=5.2;Blockly.JavaScript.ORDER_MODULUS=5.3;Blockly.JavaScript.ORDER_SUBTRACTION=6.1;Blockly.JavaScript.ORDER_ADDITION=6.2;Blockly.JavaScript.ORDER_BITWISE_SHIFT=7;Blockly.JavaScript.ORDER_RELATIONAL=8;Blockly.JavaScript.ORDER_IN=8;Blockly.JavaScript.ORDER_INSTANCEOF=8;Blockly.JavaScript.ORDER_EQUALITY=9;Blockly.JavaScript.ORDER_BITWISE_AND=10;
Blockly.JavaScript.ORDER_BITWISE_XOR=11;Blockly.JavaScript.ORDER_BITWISE_OR=12;Blockly.JavaScript.ORDER_LOGICAL_AND=13;Blockly.JavaScript.ORDER_LOGICAL_OR=14;Blockly.JavaScript.ORDER_CONDITIONAL=15;Blockly.JavaScript.ORDER_ASSIGNMENT=16;Blockly.JavaScript.ORDER_YIELD=17;Blockly.JavaScript.ORDER_COMMA=18;Blockly.JavaScript.ORDER_NONE=99;
Blockly.JavaScript.ORDER_OVERRIDES=[[Blockly.JavaScript.ORDER_FUNCTION_CALL,Blockly.JavaScript.ORDER_MEMBER],[Blockly.JavaScript.ORDER_FUNCTION_CALL,Blockly.JavaScript.ORDER_FUNCTION_CALL],[Blockly.JavaScript.ORDER_MEMBER,Blockly.JavaScript.ORDER_MEMBER],[Blockly.JavaScript.ORDER_MEMBER,Blockly.JavaScript.ORDER_FUNCTION_CALL],[Blockly.JavaScript.ORDER_LOGICAL_NOT,Blockly.JavaScript.ORDER_LOGICAL_NOT],[Blockly.JavaScript.ORDER_MULTIPLICATION,Blockly.JavaScript.ORDER_MULTIPLICATION],[Blockly.JavaScript.ORDER_ADDITION,
Blockly.JavaScript.ORDER_ADDITION],[Blockly.JavaScript.ORDER_LOGICAL_AND,Blockly.JavaScript.ORDER_LOGICAL_AND],[Blockly.JavaScript.ORDER_LOGICAL_OR,Blockly.JavaScript.ORDER_LOGICAL_OR]];Blockly.JavaScript.isInitialized=!1;
Blockly.JavaScript.init=function(a){Object.getPrototypeOf(this).init.call(this);this.nameDB_?this.nameDB_.reset():this.nameDB_=new Blockly.Names(this.RESERVED_WORDS_);this.nameDB_.setVariableMap(a.getVariableMap());this.nameDB_.populateVariables(a);this.nameDB_.populateProcedures(a);for(var b=[],c=Blockly.Variables.allDeveloperVariables(a),d=0;d<c.length;d++)b.push(this.nameDB_.getName(c[d],Blockly.Names.DEVELOPER_VARIABLE_TYPE));a=Blockly.Variables.allUsedVarModels(a);for(d=0;d<a.length;d++)b.push(this.nameDB_.getName(a[d].getId(),
Blockly.VARIABLE_CATEGORY_NAME));b.length&&(this.definitions_.variables="var "+b.join(", ")+";");this.isInitialized=!0};Blockly.JavaScript.finish=function(a){var b=Blockly.utils.object.values(this.definitions_);a=Object.getPrototypeOf(this).finish.call(this,a);this.isInitialized=!1;this.nameDB_.reset();return b.join("\n\n")+"\n\n\n"+a};Blockly.JavaScript.scrubNakedValue=function(a){return a+";\n"};
Blockly.JavaScript.quote_=function(a){a=a.replace(/\\/g,"\\\\").replace(/\n/g,"\\\n").replace(/'/g,"\\'");return"'"+a+"'"};Blockly.JavaScript.multiline_quote_=function(a){return a.split(/\n/g).map(this.quote_).join(" + '\\n' +\n")};
Blockly.JavaScript.scrub_=function(a,b,c){var d="";if(!a.outputConnection||!a.outputConnection.targetConnection){var e=a.getCommentText();e&&(e=Blockly.utils.string.wrap(e,this.COMMENT_WRAP-3),d+=this.prefixLines(e+"\n","// "));for(var f=0;f<a.inputList.length;f++)a.inputList[f].type==Blockly.inputTypes.VALUE&&(e=a.inputList[f].connection.targetBlock())&&(e=this.allNestedComments(e))&&(d+=this.prefixLines(e,"// "))}a=a.nextConnection&&a.nextConnection.targetBlock();c=c?"":this.blockToCode(a);return d+
b+c};
Blockly.JavaScript.getAdjusted=function(a,b,c,d,e){c=c||0;e=e||this.ORDER_NONE;a.workspace.options.oneBasedIndex&&c--;var f=a.workspace.options.oneBasedIndex?"1":"0";a=0<c?this.valueToCode(a,b,this.ORDER_ADDITION)||f:0>c?this.valueToCode(a,b,this.ORDER_SUBTRACTION)||f:d?this.valueToCode(a,b,this.ORDER_UNARY_NEGATION)||f:this.valueToCode(a,b,e)||f;if(Blockly.isNumber(a))a=Number(a)+c,d&&(a=-a);else{if(0<c){a=a+" + "+c;var g=this.ORDER_ADDITION}else 0>c&&(a=a+" - "+-c,g=this.ORDER_SUBTRACTION);d&&(a=
c?"-("+a+")":"-"+a,g=this.ORDER_UNARY_NEGATION);g=Math.floor(g);e=Math.floor(e);g&&e>=g&&(a="("+a+")")}return a};Blockly.JavaScript.colour={};Blockly.JavaScript.colour_picker=function(a){return[Blockly.JavaScript.quote_(a.getFieldValue("COLOUR")),Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript.colour_random=function(a){return[Blockly.JavaScript.provideFunction_("colourRandom",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"() {","  var num = Math.floor(Math.random() * Math.pow(2, 24));","  return '#' + ('00000' + num.toString(16)).substr(-6);","}"])+"()",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.colour_rgb=function(a){var b=Blockly.JavaScript.valueToCode(a,"RED",Blockly.JavaScript.ORDER_NONE)||0,c=Blockly.JavaScript.valueToCode(a,"GREEN",Blockly.JavaScript.ORDER_NONE)||0;a=Blockly.JavaScript.valueToCode(a,"BLUE",Blockly.JavaScript.ORDER_NONE)||0;return[Blockly.JavaScript.provideFunction_("colourRgb",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(r, g, b) {","  r = Math.max(Math.min(Number(r), 100), 0) * 2.55;","  g = Math.max(Math.min(Number(g), 100), 0) * 2.55;",
"  b = Math.max(Math.min(Number(b), 100), 0) * 2.55;","  r = ('0' + (Math.round(r) || 0).toString(16)).slice(-2);","  g = ('0' + (Math.round(g) || 0).toString(16)).slice(-2);","  b = ('0' + (Math.round(b) || 0).toString(16)).slice(-2);","  return '#' + r + g + b;","}"])+"("+b+", "+c+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.colour_blend=function(a){var b=Blockly.JavaScript.valueToCode(a,"COLOUR1",Blockly.JavaScript.ORDER_NONE)||"'#000000'",c=Blockly.JavaScript.valueToCode(a,"COLOUR2",Blockly.JavaScript.ORDER_NONE)||"'#000000'";a=Blockly.JavaScript.valueToCode(a,"RATIO",Blockly.JavaScript.ORDER_NONE)||.5;return[Blockly.JavaScript.provideFunction_("colourBlend",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(c1, c2, ratio) {","  ratio = Math.max(Math.min(Number(ratio), 1), 0);","  var r1 = parseInt(c1.substring(1, 3), 16);",
"  var g1 = parseInt(c1.substring(3, 5), 16);","  var b1 = parseInt(c1.substring(5, 7), 16);","  var r2 = parseInt(c2.substring(1, 3), 16);","  var g2 = parseInt(c2.substring(3, 5), 16);","  var b2 = parseInt(c2.substring(5, 7), 16);","  var r = Math.round(r1 * (1 - ratio) + r2 * ratio);","  var g = Math.round(g1 * (1 - ratio) + g2 * ratio);","  var b = Math.round(b1 * (1 - ratio) + b2 * ratio);","  r = ('0' + (r || 0).toString(16)).slice(-2);","  g = ('0' + (g || 0).toString(16)).slice(-2);","  b = ('0' + (b || 0).toString(16)).slice(-2);",
"  return '#' + r + g + b;","}"])+"("+b+", "+c+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.lists={};Blockly.JavaScript.lists_create_empty=function(a){return["[]",Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript.lists_create_with=function(a){for(var b=Array(a.itemCount_),c=0;c<a.itemCount_;c++)b[c]=Blockly.JavaScript.valueToCode(a,"ADD"+c,Blockly.JavaScript.ORDER_NONE)||"null";return["["+b.join(", ")+"]",Blockly.JavaScript.ORDER_ATOMIC]};
Blockly.JavaScript.lists_repeat=function(a){var b=Blockly.JavaScript.provideFunction_("listsRepeat",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(value, n) {","  var array = [];","  for (var i = 0; i < n; i++) {","    array[i] = value;","  }","  return array;","}"]),c=Blockly.JavaScript.valueToCode(a,"ITEM",Blockly.JavaScript.ORDER_NONE)||"null";a=Blockly.JavaScript.valueToCode(a,"NUM",Blockly.JavaScript.ORDER_NONE)||"0";return[b+"("+c+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.lists_length=function(a){return[(Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_MEMBER)||"[]")+".length",Blockly.JavaScript.ORDER_MEMBER]};Blockly.JavaScript.lists_isEmpty=function(a){return["!"+(Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_MEMBER)||"[]")+".length",Blockly.JavaScript.ORDER_LOGICAL_NOT]};
Blockly.JavaScript.lists_indexOf=function(a){var b="FIRST"==a.getFieldValue("END")?"indexOf":"lastIndexOf",c=Blockly.JavaScript.valueToCode(a,"FIND",Blockly.JavaScript.ORDER_NONE)||"''";b=(Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_MEMBER)||"[]")+"."+b+"("+c+")";return a.workspace.options.oneBasedIndex?[b+" + 1",Blockly.JavaScript.ORDER_ADDITION]:[b,Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.lists_getIndex=function(a){var b=a.getFieldValue("MODE")||"GET",c=a.getFieldValue("WHERE")||"FROM_START",d=Blockly.JavaScript.valueToCode(a,"VALUE","RANDOM"==c?Blockly.JavaScript.ORDER_NONE:Blockly.JavaScript.ORDER_MEMBER)||"[]";switch(c){case "FIRST":if("GET"==b)return[d+"[0]",Blockly.JavaScript.ORDER_MEMBER];if("GET_REMOVE"==b)return[d+".shift()",Blockly.JavaScript.ORDER_MEMBER];if("REMOVE"==b)return d+".shift();\n";break;case "LAST":if("GET"==b)return[d+".slice(-1)[0]",Blockly.JavaScript.ORDER_MEMBER];
if("GET_REMOVE"==b)return[d+".pop()",Blockly.JavaScript.ORDER_MEMBER];if("REMOVE"==b)return d+".pop();\n";break;case "FROM_START":a=Blockly.JavaScript.getAdjusted(a,"AT");if("GET"==b)return[d+"["+a+"]",Blockly.JavaScript.ORDER_MEMBER];if("GET_REMOVE"==b)return[d+".splice("+a+", 1)[0]",Blockly.JavaScript.ORDER_FUNCTION_CALL];if("REMOVE"==b)return d+".splice("+a+", 1);\n";break;case "FROM_END":a=Blockly.JavaScript.getAdjusted(a,"AT",1,!0);if("GET"==b)return[d+".slice("+a+")[0]",Blockly.JavaScript.ORDER_FUNCTION_CALL];
if("GET_REMOVE"==b)return[d+".splice("+a+", 1)[0]",Blockly.JavaScript.ORDER_FUNCTION_CALL];if("REMOVE"==b)return d+".splice("+a+", 1);";break;case "RANDOM":d=Blockly.JavaScript.provideFunction_("listsGetRandomItem",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(list, remove) {","  var x = Math.floor(Math.random() * list.length);","  if (remove) {","    return list.splice(x, 1)[0];","  } else {","    return list[x];","  }","}"])+"("+d+", "+("GET"!=b)+")";if("GET"==b||"GET_REMOVE"==b)return[d,
Blockly.JavaScript.ORDER_FUNCTION_CALL];if("REMOVE"==b)return d+";\n"}throw Error("Unhandled combination (lists_getIndex).");};
Blockly.JavaScript.lists_setIndex=function(a){function b(){if(c.match(/^\w+$/))return"";var g=Blockly.JavaScript.nameDB_.getDistinctName("tmpList",Blockly.VARIABLE_CATEGORY_NAME),h="var "+g+" = "+c+";\n";c=g;return h}var c=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_MEMBER)||"[]",d=a.getFieldValue("MODE")||"GET",e=a.getFieldValue("WHERE")||"FROM_START",f=Blockly.JavaScript.valueToCode(a,"TO",Blockly.JavaScript.ORDER_ASSIGNMENT)||"null";switch(e){case "FIRST":if("SET"==d)return c+
"[0] = "+f+";\n";if("INSERT"==d)return c+".unshift("+f+");\n";break;case "LAST":if("SET"==d)return a=b(),a+(c+"["+c+".length - 1] = "+f+";\n");if("INSERT"==d)return c+".push("+f+");\n";break;case "FROM_START":e=Blockly.JavaScript.getAdjusted(a,"AT");if("SET"==d)return c+"["+e+"] = "+f+";\n";if("INSERT"==d)return c+".splice("+e+", 0, "+f+");\n";break;case "FROM_END":e=Blockly.JavaScript.getAdjusted(a,"AT",1,!1,Blockly.JavaScript.ORDER_SUBTRACTION);a=b();if("SET"==d)return a+(c+"["+c+".length - "+e+
"] = "+f+";\n");if("INSERT"==d)return a+(c+".splice("+c+".length - "+e+", 0, "+f+");\n");break;case "RANDOM":a=b();e=Blockly.JavaScript.nameDB_.getDistinctName("tmpX",Blockly.VARIABLE_CATEGORY_NAME);a+="var "+e+" = Math.floor(Math.random() * "+c+".length);\n";if("SET"==d)return a+(c+"["+e+"] = "+f+";\n");if("INSERT"==d)return a+(c+".splice("+e+", 0, "+f+");\n")}throw Error("Unhandled combination (lists_setIndex).");};
Blockly.JavaScript.lists.getIndex_=function(a,b,c){return"FIRST"==b?"0":"FROM_END"==b?a+".length - 1 - "+c:"LAST"==b?a+".length - 1":c};
Blockly.JavaScript.lists_getSublist=function(a){var b=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_MEMBER)||"[]",c=a.getFieldValue("WHERE1"),d=a.getFieldValue("WHERE2");if("FIRST"==c&&"LAST"==d)b+=".slice(0)";else if(b.match(/^\w+$/)||"FROM_END"!=c&&"FROM_START"==d){switch(c){case "FROM_START":var e=Blockly.JavaScript.getAdjusted(a,"AT1");break;case "FROM_END":e=Blockly.JavaScript.getAdjusted(a,"AT1",1,!1,Blockly.JavaScript.ORDER_SUBTRACTION);e=b+".length - "+e;break;case "FIRST":e=
"0";break;default:throw Error("Unhandled option (lists_getSublist).");}switch(d){case "FROM_START":a=Blockly.JavaScript.getAdjusted(a,"AT2",1);break;case "FROM_END":a=Blockly.JavaScript.getAdjusted(a,"AT2",0,!1,Blockly.JavaScript.ORDER_SUBTRACTION);a=b+".length - "+a;break;case "LAST":a=b+".length";break;default:throw Error("Unhandled option (lists_getSublist).");}b=b+".slice("+e+", "+a+")"}else{e=Blockly.JavaScript.getAdjusted(a,"AT1");a=Blockly.JavaScript.getAdjusted(a,"AT2");var f=Blockly.JavaScript.lists.getIndex_,
g={FIRST:"First",LAST:"Last",FROM_START:"FromStart",FROM_END:"FromEnd"};b=Blockly.JavaScript.provideFunction_("subsequence"+g[c]+g[d],["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(sequence"+("FROM_END"==c||"FROM_START"==c?", at1":"")+("FROM_END"==d||"FROM_START"==d?", at2":"")+") {","  var start = "+f("sequence",c,"at1")+";","  var end = "+f("sequence",d,"at2")+" + 1;","  return sequence.slice(start, end);","}"])+"("+b+("FROM_END"==c||"FROM_START"==c?", "+e:"")+("FROM_END"==d||"FROM_START"==
d?", "+a:"")+")"}return[b,Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.lists_sort=function(a){var b=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_FUNCTION_CALL)||"[]",c="1"===a.getFieldValue("DIRECTION")?1:-1;a=a.getFieldValue("TYPE");var d=Blockly.JavaScript.provideFunction_("listsGetSortCompare",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(type, direction) {","  var compareFuncs = {",'    "NUMERIC": function(a, b) {',"        return Number(a) - Number(b); },",'    "TEXT": function(a, b) {',"        return a.toString() > b.toString() ? 1 : -1; },",
'    "IGNORE_CASE": function(a, b) {',"        return a.toString().toLowerCase() > b.toString().toLowerCase() ? 1 : -1; },","  };","  var compare = compareFuncs[type];","  return function(a, b) { return compare(a, b) * direction; }","}"]);return[b+".slice().sort("+d+'("'+a+'", '+c+"))",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.lists_split=function(a){var b=Blockly.JavaScript.valueToCode(a,"INPUT",Blockly.JavaScript.ORDER_MEMBER),c=Blockly.JavaScript.valueToCode(a,"DELIM",Blockly.JavaScript.ORDER_NONE)||"''";a=a.getFieldValue("MODE");if("SPLIT"==a)b||(b="''"),a="split";else if("JOIN"==a)b||(b="[]"),a="join";else throw Error("Unknown mode: "+a);return[b+"."+a+"("+c+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.lists_reverse=function(a){return[(Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_FUNCTION_CALL)||"[]")+".slice().reverse()",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.logic={};
Blockly.JavaScript.controls_if=function(a){var b=0,c="";Blockly.JavaScript.STATEMENT_PREFIX&&(c+=Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_PREFIX,a));do{var d=Blockly.JavaScript.valueToCode(a,"IF"+b,Blockly.JavaScript.ORDER_NONE)||"false";var e=Blockly.JavaScript.statementToCode(a,"DO"+b);Blockly.JavaScript.STATEMENT_SUFFIX&&(e=Blockly.JavaScript.prefixLines(Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_SUFFIX,a),Blockly.JavaScript.INDENT)+e);c+=(0<b?" else ":"")+"if ("+
d+") {\n"+e+"}";++b}while(a.getInput("IF"+b));if(a.getInput("ELSE")||Blockly.JavaScript.STATEMENT_SUFFIX)e=Blockly.JavaScript.statementToCode(a,"ELSE"),Blockly.JavaScript.STATEMENT_SUFFIX&&(e=Blockly.JavaScript.prefixLines(Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_SUFFIX,a),Blockly.JavaScript.INDENT)+e),c+=" else {\n"+e+"}";return c+"\n"};Blockly.JavaScript.controls_ifelse=Blockly.JavaScript.controls_if;
Blockly.JavaScript.logic_compare=function(a){var b={EQ:"==",NEQ:"!=",LT:"<",LTE:"<=",GT:">",GTE:">="}[a.getFieldValue("OP")],c="=="==b||"!="==b?Blockly.JavaScript.ORDER_EQUALITY:Blockly.JavaScript.ORDER_RELATIONAL,d=Blockly.JavaScript.valueToCode(a,"A",c)||"0";a=Blockly.JavaScript.valueToCode(a,"B",c)||"0";return[d+" "+b+" "+a,c]};
Blockly.JavaScript.logic_operation=function(a){var b="AND"==a.getFieldValue("OP")?"&&":"||",c="&&"==b?Blockly.JavaScript.ORDER_LOGICAL_AND:Blockly.JavaScript.ORDER_LOGICAL_OR,d=Blockly.JavaScript.valueToCode(a,"A",c);a=Blockly.JavaScript.valueToCode(a,"B",c);if(d||a){var e="&&"==b?"true":"false";d||(d=e);a||(a=e)}else a=d="false";return[d+" "+b+" "+a,c]};
Blockly.JavaScript.logic_negate=function(a){var b=Blockly.JavaScript.ORDER_LOGICAL_NOT;return["!"+(Blockly.JavaScript.valueToCode(a,"BOOL",b)||"true"),b]};Blockly.JavaScript.logic_boolean=function(a){return["TRUE"==a.getFieldValue("BOOL")?"true":"false",Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript.logic_null=function(a){return["null",Blockly.JavaScript.ORDER_ATOMIC]};
Blockly.JavaScript.logic_ternary=function(a){var b=Blockly.JavaScript.valueToCode(a,"IF",Blockly.JavaScript.ORDER_CONDITIONAL)||"false",c=Blockly.JavaScript.valueToCode(a,"THEN",Blockly.JavaScript.ORDER_CONDITIONAL)||"null";a=Blockly.JavaScript.valueToCode(a,"ELSE",Blockly.JavaScript.ORDER_CONDITIONAL)||"null";return[b+" ? "+c+" : "+a,Blockly.JavaScript.ORDER_CONDITIONAL]};Blockly.JavaScript.loops={};
Blockly.JavaScript.controls_repeat_ext=function(a){var b=a.getField("TIMES")?String(Number(a.getFieldValue("TIMES"))):Blockly.JavaScript.valueToCode(a,"TIMES",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0",c=Blockly.JavaScript.statementToCode(a,"DO");c=Blockly.JavaScript.addLoopTrap(c,a);a="";var d=Blockly.JavaScript.nameDB_.getDistinctName("count",Blockly.VARIABLE_CATEGORY_NAME),e=b;b.match(/^\w+$/)||Blockly.isNumber(b)||(e=Blockly.JavaScript.nameDB_.getDistinctName("repeat_end",Blockly.VARIABLE_CATEGORY_NAME),
a+="var "+e+" = "+b+";\n");return a+("for (var "+d+" = 0; "+d+" < "+e+"; "+d+"++) {\n"+c+"}\n")};Blockly.JavaScript.controls_repeat=Blockly.JavaScript.controls_repeat_ext;
Blockly.JavaScript.controls_whileUntil=function(a){var b="UNTIL"==a.getFieldValue("MODE"),c=Blockly.JavaScript.valueToCode(a,"BOOL",b?Blockly.JavaScript.ORDER_LOGICAL_NOT:Blockly.JavaScript.ORDER_NONE)||"false",d=Blockly.JavaScript.statementToCode(a,"DO");d=Blockly.JavaScript.addLoopTrap(d,a);b&&(c="!"+c);return"while ("+c+") {\n"+d+"}\n"};
Blockly.JavaScript.controls_for=function(a){var b=Blockly.JavaScript.nameDB_.getName(a.getFieldValue("VAR"),Blockly.VARIABLE_CATEGORY_NAME),c=Blockly.JavaScript.valueToCode(a,"FROM",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0",d=Blockly.JavaScript.valueToCode(a,"TO",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0",e=Blockly.JavaScript.valueToCode(a,"BY",Blockly.JavaScript.ORDER_ASSIGNMENT)||"1",f=Blockly.JavaScript.statementToCode(a,"DO");f=Blockly.JavaScript.addLoopTrap(f,a);if(Blockly.isNumber(c)&&Blockly.isNumber(d)&&
Blockly.isNumber(e)){var g=Number(c)<=Number(d);a="for ("+b+" = "+c+"; "+b+(g?" <= ":" >= ")+d+"; "+b;b=Math.abs(Number(e));a=(1==b?a+(g?"++":"--"):a+((g?" += ":" -= ")+b))+(") {\n"+f+"}\n")}else a="",g=c,c.match(/^\w+$/)||Blockly.isNumber(c)||(g=Blockly.JavaScript.nameDB_.getDistinctName(b+"_start",Blockly.VARIABLE_CATEGORY_NAME),a+="var "+g+" = "+c+";\n"),c=d,d.match(/^\w+$/)||Blockly.isNumber(d)||(c=Blockly.JavaScript.nameDB_.getDistinctName(b+"_end",Blockly.VARIABLE_CATEGORY_NAME),a+="var "+c+
" = "+d+";\n"),d=Blockly.JavaScript.nameDB_.getDistinctName(b+"_inc",Blockly.VARIABLE_CATEGORY_NAME),a+="var "+d+" = ",a=Blockly.isNumber(e)?a+(Math.abs(e)+";\n"):a+("Math.abs("+e+");\n"),a=a+("if ("+g+" > "+c+") {\n")+(Blockly.JavaScript.INDENT+d+" = -"+d+";\n"),a+="}\n",a+="for ("+b+" = "+g+"; "+d+" >= 0 ? "+b+" <= "+c+" : "+b+" >= "+c+"; "+b+" += "+d+") {\n"+f+"}\n";return a};
Blockly.JavaScript.controls_forEach=function(a){var b=Blockly.JavaScript.nameDB_.getName(a.getFieldValue("VAR"),Blockly.VARIABLE_CATEGORY_NAME),c=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_ASSIGNMENT)||"[]",d=Blockly.JavaScript.statementToCode(a,"DO");d=Blockly.JavaScript.addLoopTrap(d,a);a="";var e=c;c.match(/^\w+$/)||(e=Blockly.JavaScript.nameDB_.getDistinctName(b+"_list",Blockly.VARIABLE_CATEGORY_NAME),a+="var "+e+" = "+c+";\n");c=Blockly.JavaScript.nameDB_.getDistinctName(b+
"_index",Blockly.VARIABLE_CATEGORY_NAME);d=Blockly.JavaScript.INDENT+b+" = "+e+"["+c+"];\n"+d;return a+("for (var "+c+" in "+e+") {\n"+d+"}\n")};
Blockly.JavaScript.controls_flow_statements=function(a){var b="";Blockly.JavaScript.STATEMENT_PREFIX&&(b+=Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_PREFIX,a));Blockly.JavaScript.STATEMENT_SUFFIX&&(b+=Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_SUFFIX,a));if(Blockly.JavaScript.STATEMENT_PREFIX){var c=Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(a);c&&!c.suppressPrefixSuffix&&(b+=Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_PREFIX,
c))}switch(a.getFieldValue("FLOW")){case "BREAK":return b+"break;\n";case "CONTINUE":return b+"continue;\n"}throw Error("Unknown flow statement.");};Blockly.JavaScript.math={};Blockly.JavaScript.math_number=function(a){a=Number(a.getFieldValue("NUM"));return[a,0<=a?Blockly.JavaScript.ORDER_ATOMIC:Blockly.JavaScript.ORDER_UNARY_NEGATION]};
Blockly.JavaScript.math_arithmetic=function(a){var b={ADD:[" + ",Blockly.JavaScript.ORDER_ADDITION],MINUS:[" - ",Blockly.JavaScript.ORDER_SUBTRACTION],MULTIPLY:[" * ",Blockly.JavaScript.ORDER_MULTIPLICATION],DIVIDE:[" / ",Blockly.JavaScript.ORDER_DIVISION],POWER:[null,Blockly.JavaScript.ORDER_NONE]}[a.getFieldValue("OP")],c=b[0];b=b[1];var d=Blockly.JavaScript.valueToCode(a,"A",b)||"0";a=Blockly.JavaScript.valueToCode(a,"B",b)||"0";return c?[d+c+a,b]:["Math.pow("+d+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.math_single=function(a){var b=a.getFieldValue("OP");if("NEG"==b)return a=Blockly.JavaScript.valueToCode(a,"NUM",Blockly.JavaScript.ORDER_UNARY_NEGATION)||"0","-"==a[0]&&(a=" "+a),["-"+a,Blockly.JavaScript.ORDER_UNARY_NEGATION];a="SIN"==b||"COS"==b||"TAN"==b?Blockly.JavaScript.valueToCode(a,"NUM",Blockly.JavaScript.ORDER_DIVISION)||"0":Blockly.JavaScript.valueToCode(a,"NUM",Blockly.JavaScript.ORDER_NONE)||"0";switch(b){case "ABS":var c="Math.abs("+a+")";break;case "ROOT":c="Math.sqrt("+
a+")";break;case "LN":c="Math.log("+a+")";break;case "EXP":c="Math.exp("+a+")";break;case "POW10":c="Math.pow(10,"+a+")";break;case "ROUND":c="Math.round("+a+")";break;case "ROUNDUP":c="Math.ceil("+a+")";break;case "ROUNDDOWN":c="Math.floor("+a+")";break;case "SIN":c="Math.sin("+a+" / 180 * Math.PI)";break;case "COS":c="Math.cos("+a+" / 180 * Math.PI)";break;case "TAN":c="Math.tan("+a+" / 180 * Math.PI)"}if(c)return[c,Blockly.JavaScript.ORDER_FUNCTION_CALL];switch(b){case "LOG10":c="Math.log("+a+
") / Math.log(10)";break;case "ASIN":c="Math.asin("+a+") / Math.PI * 180";break;case "ACOS":c="Math.acos("+a+") / Math.PI * 180";break;case "ATAN":c="Math.atan("+a+") / Math.PI * 180";break;default:throw Error("Unknown math operator: "+b);}return[c,Blockly.JavaScript.ORDER_DIVISION]};
Blockly.JavaScript.math_constant=function(a){return{PI:["Math.PI",Blockly.JavaScript.ORDER_MEMBER],E:["Math.E",Blockly.JavaScript.ORDER_MEMBER],GOLDEN_RATIO:["(1 + Math.sqrt(5)) / 2",Blockly.JavaScript.ORDER_DIVISION],SQRT2:["Math.SQRT2",Blockly.JavaScript.ORDER_MEMBER],SQRT1_2:["Math.SQRT1_2",Blockly.JavaScript.ORDER_MEMBER],INFINITY:["Infinity",Blockly.JavaScript.ORDER_ATOMIC]}[a.getFieldValue("CONSTANT")]};
Blockly.JavaScript.math_number_property=function(a){var b=Blockly.JavaScript.valueToCode(a,"NUMBER_TO_CHECK",Blockly.JavaScript.ORDER_MODULUS)||"0",c=a.getFieldValue("PROPERTY");if("PRIME"==c)return[Blockly.JavaScript.provideFunction_("mathIsPrime",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(n) {","  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods","  if (n == 2 || n == 3) {","    return true;","  }","  // False if n is NaN, negative, is 1, or not whole.","  // And false if n is divisible by 2 or 3.",
"  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 || n % 3 == 0) {","    return false;","  }","  // Check all the numbers of form 6k +/- 1, up to sqrt(n).","  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {","    if (n % (x - 1) == 0 || n % (x + 1) == 0) {","      return false;","    }","  }","  return true;","}"])+"("+b+")",Blockly.JavaScript.ORDER_FUNCTION_CALL];switch(c){case "EVEN":var d=b+" % 2 == 0";break;case "ODD":d=b+" % 2 == 1";break;case "WHOLE":d=b+" % 1 == 0";break;case "POSITIVE":d=
b+" > 0";break;case "NEGATIVE":d=b+" < 0";break;case "DIVISIBLE_BY":a=Blockly.JavaScript.valueToCode(a,"DIVISOR",Blockly.JavaScript.ORDER_MODULUS)||"0",d=b+" % "+a+" == 0"}return[d,Blockly.JavaScript.ORDER_EQUALITY]};Blockly.JavaScript.math_change=function(a){var b=Blockly.JavaScript.valueToCode(a,"DELTA",Blockly.JavaScript.ORDER_ADDITION)||"0";a=Blockly.JavaScript.nameDB_.getName(a.getFieldValue("VAR"),Blockly.VARIABLE_CATEGORY_NAME);return a+" = (typeof "+a+" == 'number' ? "+a+" : 0) + "+b+";\n"};
Blockly.JavaScript.math_round=Blockly.JavaScript.math_single;Blockly.JavaScript.math_trig=Blockly.JavaScript.math_single;
Blockly.JavaScript.math_on_list=function(a){var b=a.getFieldValue("OP");switch(b){case "SUM":a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_MEMBER)||"[]";a+=".reduce(function(x, y) {return x + y;})";break;case "MIN":a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a="Math.min.apply(null, "+a+")";break;case "MAX":a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a="Math.max.apply(null, "+a+")";break;case "AVERAGE":b=Blockly.JavaScript.provideFunction_("mathMean",
["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(myList) {","  return myList.reduce(function(x, y) {return x + y;}) / myList.length;","}"]);a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a=b+"("+a+")";break;case "MEDIAN":b=Blockly.JavaScript.provideFunction_("mathMedian",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(myList) {","  var localList = myList.filter(function (x) {return typeof x == 'number';});","  if (!localList.length) return null;",
"  localList.sort(function(a, b) {return b - a;});","  if (localList.length % 2 == 0) {","    return (localList[localList.length / 2 - 1] + localList[localList.length / 2]) / 2;","  } else {","    return localList[(localList.length - 1) / 2];","  }","}"]);a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a=b+"("+a+")";break;case "MODE":b=Blockly.JavaScript.provideFunction_("mathModes",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(values) {","  var modes = [];",
"  var counts = [];","  var maxCount = 0;","  for (var i = 0; i < values.length; i++) {","    var value = values[i];","    var found = false;","    var thisCount;","    for (var j = 0; j < counts.length; j++) {","      if (counts[j][0] === value) {","        thisCount = ++counts[j][1];","        found = true;","        break;","      }","    }","    if (!found) {","      counts.push([value, 1]);","      thisCount = 1;","    }","    maxCount = Math.max(thisCount, maxCount);","  }","  for (var j = 0; j < counts.length; j++) {",
"    if (counts[j][1] == maxCount) {","        modes.push(counts[j][0]);","    }","  }","  return modes;","}"]);a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a=b+"("+a+")";break;case "STD_DEV":b=Blockly.JavaScript.provideFunction_("mathStandardDeviation",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(numbers) {","  var n = numbers.length;","  if (!n) return null;","  var mean = numbers.reduce(function(x, y) {return x + y;}) / n;","  var variance = 0;",
"  for (var j = 0; j < n; j++) {","    variance += Math.pow(numbers[j] - mean, 2);","  }","  variance = variance / n;","  return Math.sqrt(variance);","}"]);a=Blockly.JavaScript.valueToCode(a,"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a=b+"("+a+")";break;case "RANDOM":b=Blockly.JavaScript.provideFunction_("mathRandomList",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(list) {","  var x = Math.floor(Math.random() * list.length);","  return list[x];","}"]);a=Blockly.JavaScript.valueToCode(a,
"LIST",Blockly.JavaScript.ORDER_NONE)||"[]";a=b+"("+a+")";break;default:throw Error("Unknown operator: "+b);}return[a,Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.math_modulo=function(a){var b=Blockly.JavaScript.valueToCode(a,"DIVIDEND",Blockly.JavaScript.ORDER_MODULUS)||"0";a=Blockly.JavaScript.valueToCode(a,"DIVISOR",Blockly.JavaScript.ORDER_MODULUS)||"0";return[b+" % "+a,Blockly.JavaScript.ORDER_MODULUS]};
Blockly.JavaScript.math_constrain=function(a){var b=Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_NONE)||"0",c=Blockly.JavaScript.valueToCode(a,"LOW",Blockly.JavaScript.ORDER_NONE)||"0";a=Blockly.JavaScript.valueToCode(a,"HIGH",Blockly.JavaScript.ORDER_NONE)||"Infinity";return["Math.min(Math.max("+b+", "+c+"), "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.math_random_int=function(a){var b=Blockly.JavaScript.valueToCode(a,"FROM",Blockly.JavaScript.ORDER_NONE)||"0";a=Blockly.JavaScript.valueToCode(a,"TO",Blockly.JavaScript.ORDER_NONE)||"0";return[Blockly.JavaScript.provideFunction_("mathRandomInt",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(a, b) {","  if (a > b) {","    // Swap a and b to ensure a is smaller.","    var c = a;","    a = b;","    b = c;","  }","  return Math.floor(Math.random() * (b - a + 1) + a);",
"}"])+"("+b+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.math_random_float=function(a){return["Math.random()",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.math_atan2=function(a){var b=Blockly.JavaScript.valueToCode(a,"X",Blockly.JavaScript.ORDER_NONE)||"0";return["Math.atan2("+(Blockly.JavaScript.valueToCode(a,"Y",Blockly.JavaScript.ORDER_NONE)||"0")+", "+b+") / Math.PI * 180",Blockly.JavaScript.ORDER_DIVISION]};Blockly.JavaScript.procedures={};
Blockly.JavaScript.procedures_defreturn=function(a){var b=Blockly.JavaScript.nameDB_.getName(a.getFieldValue("NAME"),Blockly.PROCEDURE_CATEGORY_NAME),c="";Blockly.JavaScript.STATEMENT_PREFIX&&(c+=Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_PREFIX,a));Blockly.JavaScript.STATEMENT_SUFFIX&&(c+=Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_SUFFIX,a));c&&(c=Blockly.JavaScript.prefixLines(c,Blockly.JavaScript.INDENT));var d="";Blockly.JavaScript.INFINITE_LOOP_TRAP&&(d=Blockly.JavaScript.prefixLines(Blockly.JavaScript.injectId(Blockly.JavaScript.INFINITE_LOOP_TRAP,
a),Blockly.JavaScript.INDENT));var e=Blockly.JavaScript.statementToCode(a,"STACK"),f=Blockly.JavaScript.valueToCode(a,"RETURN",Blockly.JavaScript.ORDER_NONE)||"",g="";e&&f&&(g=c);f&&(f=Blockly.JavaScript.INDENT+"return "+f+";\n");for(var h=[],l=a.getVars(),k=0;k<l.length;k++)h[k]=Blockly.JavaScript.nameDB_.getName(l[k],Blockly.VARIABLE_CATEGORY_NAME);c="function "+b+"("+h.join(", ")+") {\n"+c+d+e+g+f+"}";c=Blockly.JavaScript.scrub_(a,c);Blockly.JavaScript.definitions_["%"+b]=c;return null};
Blockly.JavaScript.procedures_defnoreturn=Blockly.JavaScript.procedures_defreturn;Blockly.JavaScript.procedures_callreturn=function(a){for(var b=Blockly.JavaScript.nameDB_.getName(a.getFieldValue("NAME"),Blockly.PROCEDURE_CATEGORY_NAME),c=[],d=a.getVars(),e=0;e<d.length;e++)c[e]=Blockly.JavaScript.valueToCode(a,"ARG"+e,Blockly.JavaScript.ORDER_NONE)||"null";return[b+"("+c.join(", ")+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.procedures_callnoreturn=function(a){return Blockly.JavaScript.procedures_callreturn(a)[0]+";\n"};
Blockly.JavaScript.procedures_ifreturn=function(a){var b="if ("+(Blockly.JavaScript.valueToCode(a,"CONDITION",Blockly.JavaScript.ORDER_NONE)||"false")+") {\n";Blockly.JavaScript.STATEMENT_SUFFIX&&(b+=Blockly.JavaScript.prefixLines(Blockly.JavaScript.injectId(Blockly.JavaScript.STATEMENT_SUFFIX,a),Blockly.JavaScript.INDENT));a.hasReturnValue_?(a=Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_NONE)||"null",b+=Blockly.JavaScript.INDENT+"return "+a+";\n"):b+=Blockly.JavaScript.INDENT+
"return;\n";return b+"}\n"};Blockly.JavaScript.texts={};Blockly.JavaScript.text=function(a){return[Blockly.JavaScript.quote_(a.getFieldValue("TEXT")),Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript.text_multiline=function(a){a=Blockly.JavaScript.multiline_quote_(a.getFieldValue("TEXT"));var b=-1!=a.indexOf("+")?Blockly.JavaScript.ORDER_ADDITION:Blockly.JavaScript.ORDER_ATOMIC;return[a,b]};
Blockly.JavaScript.text.forceString_=function(a){return Blockly.JavaScript.text.forceString_.strRegExp.test(a)?[a,Blockly.JavaScript.ORDER_ATOMIC]:["String("+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.text.forceString_.strRegExp=/^\s*'([^']|\\')*'\s*$/;
Blockly.JavaScript.text_join=function(a){switch(a.itemCount_){case 0:return["''",Blockly.JavaScript.ORDER_ATOMIC];case 1:return a=Blockly.JavaScript.valueToCode(a,"ADD0",Blockly.JavaScript.ORDER_NONE)||"''",Blockly.JavaScript.text.forceString_(a);case 2:var b=Blockly.JavaScript.valueToCode(a,"ADD0",Blockly.JavaScript.ORDER_NONE)||"''";a=Blockly.JavaScript.valueToCode(a,"ADD1",Blockly.JavaScript.ORDER_NONE)||"''";a=Blockly.JavaScript.text.forceString_(b)[0]+" + "+Blockly.JavaScript.text.forceString_(a)[0];
return[a,Blockly.JavaScript.ORDER_ADDITION];default:b=Array(a.itemCount_);for(var c=0;c<a.itemCount_;c++)b[c]=Blockly.JavaScript.valueToCode(a,"ADD"+c,Blockly.JavaScript.ORDER_NONE)||"''";a="["+b.join(",")+"].join('')";return[a,Blockly.JavaScript.ORDER_FUNCTION_CALL]}};
Blockly.JavaScript.text_append=function(a){var b=Blockly.JavaScript.nameDB_.getName(a.getFieldValue("VAR"),Blockly.VARIABLE_CATEGORY_NAME);a=Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_NONE)||"''";return b+" += "+Blockly.JavaScript.text.forceString_(a)[0]+";\n"};Blockly.JavaScript.text_length=function(a){return[(Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_MEMBER)||"''")+".length",Blockly.JavaScript.ORDER_MEMBER]};
Blockly.JavaScript.text_isEmpty=function(a){return["!"+(Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_MEMBER)||"''")+".length",Blockly.JavaScript.ORDER_LOGICAL_NOT]};
Blockly.JavaScript.text_indexOf=function(a){var b="FIRST"==a.getFieldValue("END")?"indexOf":"lastIndexOf",c=Blockly.JavaScript.valueToCode(a,"FIND",Blockly.JavaScript.ORDER_NONE)||"''";b=(Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_MEMBER)||"''")+"."+b+"("+c+")";return a.workspace.options.oneBasedIndex?[b+" + 1",Blockly.JavaScript.ORDER_ADDITION]:[b,Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.text_charAt=function(a){var b=a.getFieldValue("WHERE")||"FROM_START",c=Blockly.JavaScript.valueToCode(a,"VALUE","RANDOM"==b?Blockly.JavaScript.ORDER_NONE:Blockly.JavaScript.ORDER_MEMBER)||"''";switch(b){case "FIRST":return[c+".charAt(0)",Blockly.JavaScript.ORDER_FUNCTION_CALL];case "LAST":return[c+".slice(-1)",Blockly.JavaScript.ORDER_FUNCTION_CALL];case "FROM_START":return a=Blockly.JavaScript.getAdjusted(a,"AT"),[c+".charAt("+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL];case "FROM_END":return a=
Blockly.JavaScript.getAdjusted(a,"AT",1,!0),[c+".slice("+a+").charAt(0)",Blockly.JavaScript.ORDER_FUNCTION_CALL];case "RANDOM":return[Blockly.JavaScript.provideFunction_("textRandomLetter",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(text) {","  var x = Math.floor(Math.random() * text.length);","  return text[x];","}"])+"("+c+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]}throw Error("Unhandled option (text_charAt).");};
Blockly.JavaScript.text.getIndex_=function(a,b,c){return"FIRST"==b?"0":"FROM_END"==b?a+".length - 1 - "+c:"LAST"==b?a+".length - 1":c};
Blockly.JavaScript.text_getSubstring=function(a){var b=a.getFieldValue("WHERE1"),c=a.getFieldValue("WHERE2"),d="FROM_END"!=b&&"LAST"!=b&&"FROM_END"!=c&&"LAST"!=c,e=Blockly.JavaScript.valueToCode(a,"STRING",d?Blockly.JavaScript.ORDER_MEMBER:Blockly.JavaScript.ORDER_NONE)||"''";if("FIRST"==b&&"LAST"==c)return[e,Blockly.JavaScript.ORDER_NONE];if(e.match(/^'?\w+'?$/)||d){switch(b){case "FROM_START":d=Blockly.JavaScript.getAdjusted(a,"AT1");break;case "FROM_END":d=Blockly.JavaScript.getAdjusted(a,"AT1",
1,!1,Blockly.JavaScript.ORDER_SUBTRACTION);d=e+".length - "+d;break;case "FIRST":d="0";break;default:throw Error("Unhandled option (text_getSubstring).");}switch(c){case "FROM_START":a=Blockly.JavaScript.getAdjusted(a,"AT2",1);break;case "FROM_END":a=Blockly.JavaScript.getAdjusted(a,"AT2",0,!1,Blockly.JavaScript.ORDER_SUBTRACTION);a=e+".length - "+a;break;case "LAST":a=e+".length";break;default:throw Error("Unhandled option (text_getSubstring).");}b=e+".slice("+d+", "+a+")"}else{d=Blockly.JavaScript.getAdjusted(a,
"AT1");a=Blockly.JavaScript.getAdjusted(a,"AT2");var f=Blockly.JavaScript.text.getIndex_,g={FIRST:"First",LAST:"Last",FROM_START:"FromStart",FROM_END:"FromEnd"};b=Blockly.JavaScript.provideFunction_("subsequence"+g[b]+g[c],["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(sequence"+("FROM_END"==b||"FROM_START"==b?", at1":"")+("FROM_END"==c||"FROM_START"==c?", at2":"")+") {","  var start = "+f("sequence",b,"at1")+";","  var end = "+f("sequence",c,"at2")+" + 1;","  return sequence.slice(start, end);",
"}"])+"("+e+("FROM_END"==b||"FROM_START"==b?", "+d:"")+("FROM_END"==c||"FROM_START"==c?", "+a:"")+")"}return[b,Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.text_changeCase=function(a){var b={UPPERCASE:".toUpperCase()",LOWERCASE:".toLowerCase()",TITLECASE:null}[a.getFieldValue("CASE")];a=Blockly.JavaScript.valueToCode(a,"TEXT",b?Blockly.JavaScript.ORDER_MEMBER:Blockly.JavaScript.ORDER_NONE)||"''";return[b?a+b:Blockly.JavaScript.provideFunction_("textToTitleCase",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(str) {","  return str.replace(/\\S+/g,","      function(txt) {return txt[0].toUpperCase() + txt.substring(1).toLowerCase();});",
"}"])+"("+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.text_trim=function(a){var b={LEFT:".replace(/^[\\s\\xa0]+/, '')",RIGHT:".replace(/[\\s\\xa0]+$/, '')",BOTH:".trim()"}[a.getFieldValue("MODE")];return[(Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_MEMBER)||"''")+b,Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.text_print=function(a){return"window.alert("+(Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_NONE)||"''")+");\n"};
Blockly.JavaScript.text_prompt_ext=function(a){var b="window.prompt("+(a.getField("TEXT")?Blockly.JavaScript.quote_(a.getFieldValue("TEXT")):Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_NONE)||"''")+")";"NUMBER"==a.getFieldValue("TYPE")&&(b="Number("+b+")");return[b,Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.text_prompt=Blockly.JavaScript.text_prompt_ext;
Blockly.JavaScript.text_count=function(a){var b=Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_NONE)||"''";a=Blockly.JavaScript.valueToCode(a,"SUB",Blockly.JavaScript.ORDER_NONE)||"''";return[Blockly.JavaScript.provideFunction_("textCount",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(haystack, needle) {","  if (needle.length === 0) {","    return haystack.length + 1;","  } else {","    return haystack.split(needle).length - 1;","  }","}"])+"("+b+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript.text_replace=function(a){var b=Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_NONE)||"''",c=Blockly.JavaScript.valueToCode(a,"FROM",Blockly.JavaScript.ORDER_NONE)||"''";a=Blockly.JavaScript.valueToCode(a,"TO",Blockly.JavaScript.ORDER_NONE)||"''";return[Blockly.JavaScript.provideFunction_("textReplace",["function "+Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_+"(haystack, needle, replacement) {",'  needle = needle.replace(/([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])/g,"\\\\$1")',
'                 .replace(/\\x08/g,"\\\\x08");',"  return haystack.replace(new RegExp(needle, 'g'), replacement);","}"])+"("+b+", "+c+", "+a+")",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.text_reverse=function(a){return[(Blockly.JavaScript.valueToCode(a,"TEXT",Blockly.JavaScript.ORDER_MEMBER)||"''")+".split('').reverse().join('')",Blockly.JavaScript.ORDER_FUNCTION_CALL]};Blockly.JavaScript.variables={};Blockly.JavaScript.variables_get=function(a){return[Blockly.JavaScript.nameDB_.getName(a.getFieldValue("VAR"),Blockly.VARIABLE_CATEGORY_NAME),Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript.variables_set=function(a){var b=Blockly.JavaScript.valueToCode(a,"VALUE",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0";return Blockly.JavaScript.nameDB_.getName(a.getFieldValue("VAR"),Blockly.VARIABLE_CATEGORY_NAME)+" = "+b+";\n"};Blockly.JavaScript.variablesDynamic={};Blockly.JavaScript.variables_get_dynamic=Blockly.JavaScript.variables_get;Blockly.JavaScript.variables_set_dynamic=Blockly.JavaScript.variables_set;
return Blockly.JavaScript;
}));


//# sourceMappingURL=javascript_compressed.js.map


/***/ }),

/***/ 9177:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-disable */
;(function(root, factory) {
  if (true) { // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(8256)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function(Blockly) {

      var Blockly = {};Blockly.Msg={};// This file was automatically generated.  Do not modify.

'use strict';

Blockly.Msg["ADD_COMMENT"] = "Add Comment";
Blockly.Msg["CANNOT_DELETE_VARIABLE_PROCEDURE"] = "Can't delete the variable '%1' because it's part of the definition of the function '%2'";
Blockly.Msg["CHANGE_VALUE_TITLE"] = "Change value:";
Blockly.Msg["CLEAN_UP"] = "Clean up Blocks";
Blockly.Msg["COLLAPSED_WARNINGS_WARNING"] = "Collapsed blocks contain warnings.";
Blockly.Msg["COLLAPSE_ALL"] = "Collapse Blocks";
Blockly.Msg["COLLAPSE_BLOCK"] = "Collapse Block";
Blockly.Msg["COLOUR_BLEND_COLOUR1"] = "colour 1";
Blockly.Msg["COLOUR_BLEND_COLOUR2"] = "colour 2";
Blockly.Msg["COLOUR_BLEND_HELPURL"] = "https://meyerweb.com/eric/tools/color-blend/#:::rgbp";
Blockly.Msg["COLOUR_BLEND_RATIO"] = "ratio";
Blockly.Msg["COLOUR_BLEND_TITLE"] = "blend";
Blockly.Msg["COLOUR_BLEND_TOOLTIP"] = "Blends two colours together with a given ratio (0.0 - 1.0).";
Blockly.Msg["COLOUR_PICKER_HELPURL"] = "https://en.wikipedia.org/wiki/Color";
Blockly.Msg["COLOUR_PICKER_TOOLTIP"] = "Choose a colour from the palette.";
Blockly.Msg["COLOUR_RANDOM_HELPURL"] = "http://randomcolour.com";
Blockly.Msg["COLOUR_RANDOM_TITLE"] = "random colour";
Blockly.Msg["COLOUR_RANDOM_TOOLTIP"] = "Choose a colour at random.";
Blockly.Msg["COLOUR_RGB_BLUE"] = "blue";
Blockly.Msg["COLOUR_RGB_GREEN"] = "green";
Blockly.Msg["COLOUR_RGB_HELPURL"] = "https://www.december.com/html/spec/colorpercompact.html";
Blockly.Msg["COLOUR_RGB_RED"] = "red";
Blockly.Msg["COLOUR_RGB_TITLE"] = "colour with";
Blockly.Msg["COLOUR_RGB_TOOLTIP"] = "Create a colour with the specified amount of red, green, and blue. All values must be between 0 and 100.";
Blockly.Msg["CONTROLS_FLOW_STATEMENTS_HELPURL"] = "https://github.com/google/blockly/wiki/Loops#loop-termination-blocks";
Blockly.Msg["CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK"] = "break out of loop";
Blockly.Msg["CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE"] = "continue with next iteration of loop";
Blockly.Msg["CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK"] = "Break out of the containing loop.";
Blockly.Msg["CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE"] = "Skip the rest of this loop, and continue with the next iteration.";
Blockly.Msg["CONTROLS_FLOW_STATEMENTS_WARNING"] = "Warning: This block may only be used within a loop.";
Blockly.Msg["CONTROLS_FOREACH_HELPURL"] = "https://github.com/google/blockly/wiki/Loops#for-each";
Blockly.Msg["CONTROLS_FOREACH_TITLE"] = "for each item %1 in list %2";
Blockly.Msg["CONTROLS_FOREACH_TOOLTIP"] = "For each item in a list, set the variable '%1' to the item, and then do some statements.";
Blockly.Msg["CONTROLS_FOR_HELPURL"] = "https://github.com/google/blockly/wiki/Loops#count-with";
Blockly.Msg["CONTROLS_FOR_TITLE"] = "count with %1 from %2 to %3 by %4";
Blockly.Msg["CONTROLS_FOR_TOOLTIP"] = "Have the variable '%1' take on the values from the start number to the end number, counting by the specified interval, and do the specified blocks.";
Blockly.Msg["CONTROLS_IF_ELSEIF_TOOLTIP"] = "Add a condition to the if block.";
Blockly.Msg["CONTROLS_IF_ELSE_TOOLTIP"] = "Add a final, catch-all condition to the if block.";
Blockly.Msg["CONTROLS_IF_HELPURL"] = "https://github.com/google/blockly/wiki/IfElse";
Blockly.Msg["CONTROLS_IF_IF_TOOLTIP"] = "Add, remove, or reorder sections to reconfigure this if block.";
Blockly.Msg["CONTROLS_IF_MSG_ELSE"] = "else";
Blockly.Msg["CONTROLS_IF_MSG_ELSEIF"] = "else if";
Blockly.Msg["CONTROLS_IF_MSG_IF"] = "if";
Blockly.Msg["CONTROLS_IF_TOOLTIP_1"] = "If a value is true, then do some statements.";
Blockly.Msg["CONTROLS_IF_TOOLTIP_2"] = "If a value is true, then do the first block of statements. Otherwise, do the second block of statements.";
Blockly.Msg["CONTROLS_IF_TOOLTIP_3"] = "If the first value is true, then do the first block of statements. Otherwise, if the second value is true, do the second block of statements.";
Blockly.Msg["CONTROLS_IF_TOOLTIP_4"] = "If the first value is true, then do the first block of statements. Otherwise, if the second value is true, do the second block of statements. If none of the values are true, do the last block of statements.";
Blockly.Msg["CONTROLS_REPEAT_HELPURL"] = "https://en.wikipedia.org/wiki/For_loop";
Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"] = "do";
Blockly.Msg["CONTROLS_REPEAT_TITLE"] = "repeat %1 times";
Blockly.Msg["CONTROLS_REPEAT_TOOLTIP"] = "Do some statements several times.";
Blockly.Msg["CONTROLS_WHILEUNTIL_HELPURL"] = "https://github.com/google/blockly/wiki/Loops#repeat";
Blockly.Msg["CONTROLS_WHILEUNTIL_OPERATOR_UNTIL"] = "repeat until";
Blockly.Msg["CONTROLS_WHILEUNTIL_OPERATOR_WHILE"] = "repeat while";
Blockly.Msg["CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL"] = "While a value is false, then do some statements.";
Blockly.Msg["CONTROLS_WHILEUNTIL_TOOLTIP_WHILE"] = "While a value is true, then do some statements.";
Blockly.Msg["DELETE_ALL_BLOCKS"] = "Delete all %1 blocks?";
Blockly.Msg["DELETE_BLOCK"] = "Delete Block";
Blockly.Msg["DELETE_VARIABLE"] = "Delete the '%1' variable";
Blockly.Msg["DELETE_VARIABLE_CONFIRMATION"] = "Delete %1 uses of the '%2' variable?";
Blockly.Msg["DELETE_X_BLOCKS"] = "Delete %1 Blocks";
Blockly.Msg["DISABLE_BLOCK"] = "Disable Block";
Blockly.Msg["DUPLICATE_BLOCK"] = "Duplicate";
Blockly.Msg["DUPLICATE_COMMENT"] = "Duplicate Comment";
Blockly.Msg["ENABLE_BLOCK"] = "Enable Block";
Blockly.Msg["EXPAND_ALL"] = "Expand Blocks";
Blockly.Msg["EXPAND_BLOCK"] = "Expand Block";
Blockly.Msg["EXTERNAL_INPUTS"] = "External Inputs";
Blockly.Msg["HELP"] = "Help";
Blockly.Msg["INLINE_INPUTS"] = "Inline Inputs";
Blockly.Msg["IOS_CANCEL"] = "Cancel";
Blockly.Msg["IOS_ERROR"] = "Error";
Blockly.Msg["IOS_OK"] = "OK";
Blockly.Msg["IOS_PROCEDURES_ADD_INPUT"] = "+ Add Input";
Blockly.Msg["IOS_PROCEDURES_ALLOW_STATEMENTS"] = "Allow statements";
Blockly.Msg["IOS_PROCEDURES_DUPLICATE_INPUTS_ERROR"] = "This function has duplicate inputs.";
Blockly.Msg["IOS_PROCEDURES_INPUTS"] = "INPUTS";
Blockly.Msg["IOS_VARIABLES_ADD_BUTTON"] = "Add";
Blockly.Msg["IOS_VARIABLES_ADD_VARIABLE"] = "+ Add Variable";
Blockly.Msg["IOS_VARIABLES_DELETE_BUTTON"] = "Delete";
Blockly.Msg["IOS_VARIABLES_EMPTY_NAME_ERROR"] = "You can't use an empty variable name.";
Blockly.Msg["IOS_VARIABLES_RENAME_BUTTON"] = "Rename";
Blockly.Msg["IOS_VARIABLES_VARIABLE_NAME"] = "Variable name";
Blockly.Msg["LISTS_CREATE_EMPTY_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#create-empty-list";
Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"] = "create empty list";
Blockly.Msg["LISTS_CREATE_EMPTY_TOOLTIP"] = "Returns a list, of length 0, containing no data records";
Blockly.Msg["LISTS_CREATE_WITH_CONTAINER_TITLE_ADD"] = "list";
Blockly.Msg["LISTS_CREATE_WITH_CONTAINER_TOOLTIP"] = "Add, remove, or reorder sections to reconfigure this list block.";
Blockly.Msg["LISTS_CREATE_WITH_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#create-list-with";
Blockly.Msg["LISTS_CREATE_WITH_INPUT_WITH"] = "create list with";
Blockly.Msg["LISTS_CREATE_WITH_ITEM_TOOLTIP"] = "Add an item to the list.";
Blockly.Msg["LISTS_CREATE_WITH_TOOLTIP"] = "Create a list with any number of items.";
Blockly.Msg["LISTS_GET_INDEX_FIRST"] = "first";
Blockly.Msg["LISTS_GET_INDEX_FROM_END"] = "# from end";
Blockly.Msg["LISTS_GET_INDEX_FROM_START"] = "#";
Blockly.Msg["LISTS_GET_INDEX_GET"] = "get";
Blockly.Msg["LISTS_GET_INDEX_GET_REMOVE"] = "get and remove";
Blockly.Msg["LISTS_GET_INDEX_LAST"] = "last";
Blockly.Msg["LISTS_GET_INDEX_RANDOM"] = "random";
Blockly.Msg["LISTS_GET_INDEX_REMOVE"] = "remove";
Blockly.Msg["LISTS_GET_INDEX_TAIL"] = "";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_FIRST"] = "Returns the first item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_FROM"] = "Returns the item at the specified position in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_LAST"] = "Returns the last item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_RANDOM"] = "Returns a random item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST"] = "Removes and returns the first item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM"] = "Removes and returns the item at the specified position in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST"] = "Removes and returns the last item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM"] = "Removes and returns a random item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST"] = "Removes the first item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM"] = "Removes the item at the specified position in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST"] = "Removes the last item in a list.";
Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM"] = "Removes a random item in a list.";
Blockly.Msg["LISTS_GET_SUBLIST_END_FROM_END"] = "to # from end";
Blockly.Msg["LISTS_GET_SUBLIST_END_FROM_START"] = "to #";
Blockly.Msg["LISTS_GET_SUBLIST_END_LAST"] = "to last";
Blockly.Msg["LISTS_GET_SUBLIST_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#getting-a-sublist";
Blockly.Msg["LISTS_GET_SUBLIST_START_FIRST"] = "get sub-list from first";
Blockly.Msg["LISTS_GET_SUBLIST_START_FROM_END"] = "get sub-list from # from end";
Blockly.Msg["LISTS_GET_SUBLIST_START_FROM_START"] = "get sub-list from #";
Blockly.Msg["LISTS_GET_SUBLIST_TAIL"] = "";
Blockly.Msg["LISTS_GET_SUBLIST_TOOLTIP"] = "Creates a copy of the specified portion of a list.";
Blockly.Msg["LISTS_INDEX_FROM_END_TOOLTIP"] = "%1 is the last item.";
Blockly.Msg["LISTS_INDEX_FROM_START_TOOLTIP"] = "%1 is the first item.";
Blockly.Msg["LISTS_INDEX_OF_FIRST"] = "find first occurrence of item";
Blockly.Msg["LISTS_INDEX_OF_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#getting-items-from-a-list";
Blockly.Msg["LISTS_INDEX_OF_LAST"] = "find last occurrence of item";
Blockly.Msg["LISTS_INDEX_OF_TOOLTIP"] = "Returns the index of the first/last occurrence of the item in the list. Returns %1 if item is not found.";
Blockly.Msg["LISTS_INLIST"] = "in list";
Blockly.Msg["LISTS_ISEMPTY_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#is-empty";
Blockly.Msg["LISTS_ISEMPTY_TITLE"] = "%1 is empty";
Blockly.Msg["LISTS_ISEMPTY_TOOLTIP"] = "Returns true if the list is empty.";
Blockly.Msg["LISTS_LENGTH_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#length-of";
Blockly.Msg["LISTS_LENGTH_TITLE"] = "length of %1";
Blockly.Msg["LISTS_LENGTH_TOOLTIP"] = "Returns the length of a list.";
Blockly.Msg["LISTS_REPEAT_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#create-list-with";
Blockly.Msg["LISTS_REPEAT_TITLE"] = "create list with item %1 repeated %2 times";
Blockly.Msg["LISTS_REPEAT_TOOLTIP"] = "Creates a list consisting of the given value repeated the specified number of times.";
Blockly.Msg["LISTS_REVERSE_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#reversing-a-list";
Blockly.Msg["LISTS_REVERSE_MESSAGE0"] = "reverse %1";
Blockly.Msg["LISTS_REVERSE_TOOLTIP"] = "Reverse a copy of a list.";
Blockly.Msg["LISTS_SET_INDEX_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#in-list--set";
Blockly.Msg["LISTS_SET_INDEX_INPUT_TO"] = "as";
Blockly.Msg["LISTS_SET_INDEX_INSERT"] = "insert at";
Blockly.Msg["LISTS_SET_INDEX_SET"] = "set";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST"] = "Inserts the item at the start of a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_INSERT_FROM"] = "Inserts the item at the specified position in a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_INSERT_LAST"] = "Append the item to the end of a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM"] = "Inserts the item randomly in a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_SET_FIRST"] = "Sets the first item in a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_SET_FROM"] = "Sets the item at the specified position in a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_SET_LAST"] = "Sets the last item in a list.";
Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_SET_RANDOM"] = "Sets a random item in a list.";
Blockly.Msg["LISTS_SORT_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#sorting-a-list";
Blockly.Msg["LISTS_SORT_ORDER_ASCENDING"] = "ascending";
Blockly.Msg["LISTS_SORT_ORDER_DESCENDING"] = "descending";
Blockly.Msg["LISTS_SORT_TITLE"] = "sort %1 %2 %3";
Blockly.Msg["LISTS_SORT_TOOLTIP"] = "Sort a copy of a list.";
Blockly.Msg["LISTS_SORT_TYPE_IGNORECASE"] = "alphabetic, ignore case";
Blockly.Msg["LISTS_SORT_TYPE_NUMERIC"] = "numeric";
Blockly.Msg["LISTS_SORT_TYPE_TEXT"] = "alphabetic";
Blockly.Msg["LISTS_SPLIT_HELPURL"] = "https://github.com/google/blockly/wiki/Lists#splitting-strings-and-joining-lists";
Blockly.Msg["LISTS_SPLIT_LIST_FROM_TEXT"] = "make list from text";
Blockly.Msg["LISTS_SPLIT_TEXT_FROM_LIST"] = "make text from list";
Blockly.Msg["LISTS_SPLIT_TOOLTIP_JOIN"] = "Join a list of texts into one text, separated by a delimiter.";
Blockly.Msg["LISTS_SPLIT_TOOLTIP_SPLIT"] = "Split text into a list of texts, breaking at each delimiter.";
Blockly.Msg["LISTS_SPLIT_WITH_DELIMITER"] = "with delimiter";
Blockly.Msg["LOGIC_BOOLEAN_FALSE"] = "false";
Blockly.Msg["LOGIC_BOOLEAN_HELPURL"] = "https://github.com/google/blockly/wiki/Logic#values";
Blockly.Msg["LOGIC_BOOLEAN_TOOLTIP"] = "Returns either true or false.";
Blockly.Msg["LOGIC_BOOLEAN_TRUE"] = "true";
Blockly.Msg["LOGIC_COMPARE_HELPURL"] = "https://en.wikipedia.org/wiki/Inequality_(mathematics)";
Blockly.Msg["LOGIC_COMPARE_TOOLTIP_EQ"] = "Return true if both inputs equal each other.";
Blockly.Msg["LOGIC_COMPARE_TOOLTIP_GT"] = "Return true if the first input is greater than the second input.";
Blockly.Msg["LOGIC_COMPARE_TOOLTIP_GTE"] = "Return true if the first input is greater than or equal to the second input.";
Blockly.Msg["LOGIC_COMPARE_TOOLTIP_LT"] = "Return true if the first input is smaller than the second input.";
Blockly.Msg["LOGIC_COMPARE_TOOLTIP_LTE"] = "Return true if the first input is smaller than or equal to the second input.";
Blockly.Msg["LOGIC_COMPARE_TOOLTIP_NEQ"] = "Return true if both inputs are not equal to each other.";
Blockly.Msg["LOGIC_NEGATE_HELPURL"] = "https://github.com/google/blockly/wiki/Logic#not";
Blockly.Msg["LOGIC_NEGATE_TITLE"] = "not %1";
Blockly.Msg["LOGIC_NEGATE_TOOLTIP"] = "Returns true if the input is false. Returns false if the input is true.";
Blockly.Msg["LOGIC_NULL"] = "null";
Blockly.Msg["LOGIC_NULL_HELPURL"] = "https://en.wikipedia.org/wiki/Nullable_type";
Blockly.Msg["LOGIC_NULL_TOOLTIP"] = "Returns null.";
Blockly.Msg["LOGIC_OPERATION_AND"] = "and";
Blockly.Msg["LOGIC_OPERATION_HELPURL"] = "https://github.com/google/blockly/wiki/Logic#logical-operations";
Blockly.Msg["LOGIC_OPERATION_OR"] = "or";
Blockly.Msg["LOGIC_OPERATION_TOOLTIP_AND"] = "Return true if both inputs are true.";
Blockly.Msg["LOGIC_OPERATION_TOOLTIP_OR"] = "Return true if at least one of the inputs is true.";
Blockly.Msg["LOGIC_TERNARY_CONDITION"] = "test";
Blockly.Msg["LOGIC_TERNARY_HELPURL"] = "https://en.wikipedia.org/wiki/%3F:";
Blockly.Msg["LOGIC_TERNARY_IF_FALSE"] = "if false";
Blockly.Msg["LOGIC_TERNARY_IF_TRUE"] = "if true";
Blockly.Msg["LOGIC_TERNARY_TOOLTIP"] = "Check the condition in 'test'. If the condition is true, returns the 'if true' value; otherwise returns the 'if false' value.";
Blockly.Msg["MATH_ADDITION_SYMBOL"] = "+";
Blockly.Msg["MATH_ARITHMETIC_HELPURL"] = "https://en.wikipedia.org/wiki/Arithmetic";
Blockly.Msg["MATH_ARITHMETIC_TOOLTIP_ADD"] = "Return the sum of the two numbers.";
Blockly.Msg["MATH_ARITHMETIC_TOOLTIP_DIVIDE"] = "Return the quotient of the two numbers.";
Blockly.Msg["MATH_ARITHMETIC_TOOLTIP_MINUS"] = "Return the difference of the two numbers.";
Blockly.Msg["MATH_ARITHMETIC_TOOLTIP_MULTIPLY"] = "Return the product of the two numbers.";
Blockly.Msg["MATH_ARITHMETIC_TOOLTIP_POWER"] = "Return the first number raised to the power of the second number.";
Blockly.Msg["MATH_ATAN2_HELPURL"] = "https://en.wikipedia.org/wiki/Atan2";
Blockly.Msg["MATH_ATAN2_TITLE"] = "atan2 of X:%1 Y:%2";
Blockly.Msg["MATH_ATAN2_TOOLTIP"] = "Return the arctangent of point (X, Y) in degrees from -180 to 180.";
Blockly.Msg["MATH_CHANGE_HELPURL"] = "https://en.wikipedia.org/wiki/Programming_idiom#Incrementing_a_counter";
Blockly.Msg["MATH_CHANGE_TITLE"] = "change %1 by %2";
Blockly.Msg["MATH_CHANGE_TOOLTIP"] = "Add a number to variable '%1'.";
Blockly.Msg["MATH_CONSTANT_HELPURL"] = "https://en.wikipedia.org/wiki/Mathematical_constant";
Blockly.Msg["MATH_CONSTANT_TOOLTIP"] = "Return one of the common constants: π (3.141…), e (2.718…), φ (1.618…), sqrt(2) (1.414…), sqrt(½) (0.707…), or ∞ (infinity).";
Blockly.Msg["MATH_CONSTRAIN_HELPURL"] = "https://en.wikipedia.org/wiki/Clamping_(graphics)";
Blockly.Msg["MATH_CONSTRAIN_TITLE"] = "constrain %1 low %2 high %3";
Blockly.Msg["MATH_CONSTRAIN_TOOLTIP"] = "Constrain a number to be between the specified limits (inclusive).";
Blockly.Msg["MATH_DIVISION_SYMBOL"] = "÷";
Blockly.Msg["MATH_IS_DIVISIBLE_BY"] = "is divisible by";
Blockly.Msg["MATH_IS_EVEN"] = "is even";
Blockly.Msg["MATH_IS_NEGATIVE"] = "is negative";
Blockly.Msg["MATH_IS_ODD"] = "is odd";
Blockly.Msg["MATH_IS_POSITIVE"] = "is positive";
Blockly.Msg["MATH_IS_PRIME"] = "is prime";
Blockly.Msg["MATH_IS_TOOLTIP"] = "Check if a number is an even, odd, prime, whole, positive, negative, or if it is divisible by certain number. Returns true or false.";
Blockly.Msg["MATH_IS_WHOLE"] = "is whole";
Blockly.Msg["MATH_MODULO_HELPURL"] = "https://en.wikipedia.org/wiki/Modulo_operation";
Blockly.Msg["MATH_MODULO_TITLE"] = "remainder of %1 ÷ %2";
Blockly.Msg["MATH_MODULO_TOOLTIP"] = "Return the remainder from dividing the two numbers.";
Blockly.Msg["MATH_MULTIPLICATION_SYMBOL"] = "×";
Blockly.Msg["MATH_NUMBER_HELPURL"] = "https://en.wikipedia.org/wiki/Number";
Blockly.Msg["MATH_NUMBER_TOOLTIP"] = "A number.";
Blockly.Msg["MATH_ONLIST_HELPURL"] = "";
Blockly.Msg["MATH_ONLIST_OPERATOR_AVERAGE"] = "average of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_MAX"] = "max of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_MEDIAN"] = "median of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_MIN"] = "min of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_MODE"] = "modes of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_RANDOM"] = "random item of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_STD_DEV"] = "standard deviation of list";
Blockly.Msg["MATH_ONLIST_OPERATOR_SUM"] = "sum of list";
Blockly.Msg["MATH_ONLIST_TOOLTIP_AVERAGE"] = "Return the average (arithmetic mean) of the numeric values in the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_MAX"] = "Return the largest number in the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_MEDIAN"] = "Return the median number in the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_MIN"] = "Return the smallest number in the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_MODE"] = "Return a list of the most common item(s) in the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_RANDOM"] = "Return a random element from the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_STD_DEV"] = "Return the standard deviation of the list.";
Blockly.Msg["MATH_ONLIST_TOOLTIP_SUM"] = "Return the sum of all the numbers in the list.";
Blockly.Msg["MATH_POWER_SYMBOL"] = "^";
Blockly.Msg["MATH_RANDOM_FLOAT_HELPURL"] = "https://en.wikipedia.org/wiki/Random_number_generation";
Blockly.Msg["MATH_RANDOM_FLOAT_TITLE_RANDOM"] = "random fraction";
Blockly.Msg["MATH_RANDOM_FLOAT_TOOLTIP"] = "Return a random fraction between 0.0 (inclusive) and 1.0 (exclusive).";
Blockly.Msg["MATH_RANDOM_INT_HELPURL"] = "https://en.wikipedia.org/wiki/Random_number_generation";
Blockly.Msg["MATH_RANDOM_INT_TITLE"] = "random integer from %1 to %2";
Blockly.Msg["MATH_RANDOM_INT_TOOLTIP"] = "Return a random integer between the two specified limits, inclusive.";
Blockly.Msg["MATH_ROUND_HELPURL"] = "https://en.wikipedia.org/wiki/Rounding";
Blockly.Msg["MATH_ROUND_OPERATOR_ROUND"] = "round";
Blockly.Msg["MATH_ROUND_OPERATOR_ROUNDDOWN"] = "round down";
Blockly.Msg["MATH_ROUND_OPERATOR_ROUNDUP"] = "round up";
Blockly.Msg["MATH_ROUND_TOOLTIP"] = "Round a number up or down.";
Blockly.Msg["MATH_SINGLE_HELPURL"] = "https://en.wikipedia.org/wiki/Square_root";
Blockly.Msg["MATH_SINGLE_OP_ABSOLUTE"] = "absolute";
Blockly.Msg["MATH_SINGLE_OP_ROOT"] = "square root";
Blockly.Msg["MATH_SINGLE_TOOLTIP_ABS"] = "Return the absolute value of a number.";
Blockly.Msg["MATH_SINGLE_TOOLTIP_EXP"] = "Return e to the power of a number.";
Blockly.Msg["MATH_SINGLE_TOOLTIP_LN"] = "Return the natural logarithm of a number.";
Blockly.Msg["MATH_SINGLE_TOOLTIP_LOG10"] = "Return the base 10 logarithm of a number.";
Blockly.Msg["MATH_SINGLE_TOOLTIP_NEG"] = "Return the negation of a number.";
Blockly.Msg["MATH_SINGLE_TOOLTIP_POW10"] = "Return 10 to the power of a number.";
Blockly.Msg["MATH_SINGLE_TOOLTIP_ROOT"] = "Return the square root of a number.";
Blockly.Msg["MATH_SUBTRACTION_SYMBOL"] = "-";
Blockly.Msg["MATH_TRIG_ACOS"] = "acos";
Blockly.Msg["MATH_TRIG_ASIN"] = "asin";
Blockly.Msg["MATH_TRIG_ATAN"] = "atan";
Blockly.Msg["MATH_TRIG_COS"] = "cos";
Blockly.Msg["MATH_TRIG_HELPURL"] = "https://en.wikipedia.org/wiki/Trigonometric_functions";
Blockly.Msg["MATH_TRIG_SIN"] = "sin";
Blockly.Msg["MATH_TRIG_TAN"] = "tan";
Blockly.Msg["MATH_TRIG_TOOLTIP_ACOS"] = "Return the arccosine of a number.";
Blockly.Msg["MATH_TRIG_TOOLTIP_ASIN"] = "Return the arcsine of a number.";
Blockly.Msg["MATH_TRIG_TOOLTIP_ATAN"] = "Return the arctangent of a number.";
Blockly.Msg["MATH_TRIG_TOOLTIP_COS"] = "Return the cosine of a degree (not radian).";
Blockly.Msg["MATH_TRIG_TOOLTIP_SIN"] = "Return the sine of a degree (not radian).";
Blockly.Msg["MATH_TRIG_TOOLTIP_TAN"] = "Return the tangent of a degree (not radian).";
Blockly.Msg["NEW_COLOUR_VARIABLE"] = "Create colour variable...";
Blockly.Msg["NEW_NUMBER_VARIABLE"] = "Create number variable...";
Blockly.Msg["NEW_STRING_VARIABLE"] = "Create string variable...";
Blockly.Msg["NEW_VARIABLE"] = "Create variable...";
Blockly.Msg["NEW_VARIABLE_TITLE"] = "New variable name:";
Blockly.Msg["NEW_VARIABLE_TYPE_TITLE"] = "New variable type:";
Blockly.Msg["ORDINAL_NUMBER_SUFFIX"] = "";
Blockly.Msg["PROCEDURES_ALLOW_STATEMENTS"] = "allow statements";
Blockly.Msg["PROCEDURES_BEFORE_PARAMS"] = "with:";
Blockly.Msg["PROCEDURES_CALLNORETURN_HELPURL"] = "https://en.wikipedia.org/wiki/Subroutine";
Blockly.Msg["PROCEDURES_CALLNORETURN_TOOLTIP"] = "Run the user-defined function '%1'.";
Blockly.Msg["PROCEDURES_CALLRETURN_HELPURL"] = "https://en.wikipedia.org/wiki/Subroutine";
Blockly.Msg["PROCEDURES_CALLRETURN_TOOLTIP"] = "Run the user-defined function '%1' and use its output.";
Blockly.Msg["PROCEDURES_CALL_BEFORE_PARAMS"] = "with:";
Blockly.Msg["PROCEDURES_CREATE_DO"] = "Create '%1'";
Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"] = "Describe this function...";
Blockly.Msg["PROCEDURES_DEFNORETURN_DO"] = "";
Blockly.Msg["PROCEDURES_DEFNORETURN_HELPURL"] = "https://en.wikipedia.org/wiki/Subroutine";
Blockly.Msg["PROCEDURES_DEFNORETURN_PROCEDURE"] = "do something";
Blockly.Msg["PROCEDURES_DEFNORETURN_TITLE"] = "to";
Blockly.Msg["PROCEDURES_DEFNORETURN_TOOLTIP"] = "Creates a function with no output.";
Blockly.Msg["PROCEDURES_DEFRETURN_HELPURL"] = "https://en.wikipedia.org/wiki/Subroutine";
Blockly.Msg["PROCEDURES_DEFRETURN_RETURN"] = "return";
Blockly.Msg["PROCEDURES_DEFRETURN_TOOLTIP"] = "Creates a function with an output.";
Blockly.Msg["PROCEDURES_DEF_DUPLICATE_WARNING"] = "Warning: This function has duplicate parameters.";
Blockly.Msg["PROCEDURES_HIGHLIGHT_DEF"] = "Highlight function definition";
Blockly.Msg["PROCEDURES_IFRETURN_HELPURL"] = "http://c2.com/cgi/wiki?GuardClause";
Blockly.Msg["PROCEDURES_IFRETURN_TOOLTIP"] = "If a value is true, then return a second value.";
Blockly.Msg["PROCEDURES_IFRETURN_WARNING"] = "Warning: This block may be used only within a function definition.";
Blockly.Msg["PROCEDURES_MUTATORARG_TITLE"] = "input name:";
Blockly.Msg["PROCEDURES_MUTATORARG_TOOLTIP"] = "Add an input to the function.";
Blockly.Msg["PROCEDURES_MUTATORCONTAINER_TITLE"] = "inputs";
Blockly.Msg["PROCEDURES_MUTATORCONTAINER_TOOLTIP"] = "Add, remove, or reorder inputs to this function.";
Blockly.Msg["REDO"] = "Redo";
Blockly.Msg["REMOVE_COMMENT"] = "Remove Comment";
Blockly.Msg["RENAME_VARIABLE"] = "Rename variable...";
Blockly.Msg["RENAME_VARIABLE_TITLE"] = "Rename all '%1' variables to:";
Blockly.Msg["TEXT_APPEND_HELPURL"] = "https://github.com/google/blockly/wiki/Text#text-modification";
Blockly.Msg["TEXT_APPEND_TITLE"] = "to %1 append text %2";
Blockly.Msg["TEXT_APPEND_TOOLTIP"] = "Append some text to variable '%1'.";
Blockly.Msg["TEXT_CHANGECASE_HELPURL"] = "https://github.com/google/blockly/wiki/Text#adjusting-text-case";
Blockly.Msg["TEXT_CHANGECASE_OPERATOR_LOWERCASE"] = "to lower case";
Blockly.Msg["TEXT_CHANGECASE_OPERATOR_TITLECASE"] = "to Title Case";
Blockly.Msg["TEXT_CHANGECASE_OPERATOR_UPPERCASE"] = "to UPPER CASE";
Blockly.Msg["TEXT_CHANGECASE_TOOLTIP"] = "Return a copy of the text in a different case.";
Blockly.Msg["TEXT_CHARAT_FIRST"] = "get first letter";
Blockly.Msg["TEXT_CHARAT_FROM_END"] = "get letter # from end";
Blockly.Msg["TEXT_CHARAT_FROM_START"] = "get letter #";
Blockly.Msg["TEXT_CHARAT_HELPURL"] = "https://github.com/google/blockly/wiki/Text#extracting-text";
Blockly.Msg["TEXT_CHARAT_LAST"] = "get last letter";
Blockly.Msg["TEXT_CHARAT_RANDOM"] = "get random letter";
Blockly.Msg["TEXT_CHARAT_TAIL"] = "";
Blockly.Msg["TEXT_CHARAT_TITLE"] = "in text %1 %2";
Blockly.Msg["TEXT_CHARAT_TOOLTIP"] = "Returns the letter at the specified position.";
Blockly.Msg["TEXT_COUNT_HELPURL"] = "https://github.com/google/blockly/wiki/Text#counting-substrings";
Blockly.Msg["TEXT_COUNT_MESSAGE0"] = "count %1 in %2";
Blockly.Msg["TEXT_COUNT_TOOLTIP"] = "Count how many times some text occurs within some other text.";
Blockly.Msg["TEXT_CREATE_JOIN_ITEM_TOOLTIP"] = "Add an item to the text.";
Blockly.Msg["TEXT_CREATE_JOIN_TITLE_JOIN"] = "join";
Blockly.Msg["TEXT_CREATE_JOIN_TOOLTIP"] = "Add, remove, or reorder sections to reconfigure this text block.";
Blockly.Msg["TEXT_GET_SUBSTRING_END_FROM_END"] = "to letter # from end";
Blockly.Msg["TEXT_GET_SUBSTRING_END_FROM_START"] = "to letter #";
Blockly.Msg["TEXT_GET_SUBSTRING_END_LAST"] = "to last letter";
Blockly.Msg["TEXT_GET_SUBSTRING_HELPURL"] = "https://github.com/google/blockly/wiki/Text#extracting-a-region-of-text";
Blockly.Msg["TEXT_GET_SUBSTRING_INPUT_IN_TEXT"] = "in text";
Blockly.Msg["TEXT_GET_SUBSTRING_START_FIRST"] = "get substring from first letter";
Blockly.Msg["TEXT_GET_SUBSTRING_START_FROM_END"] = "get substring from letter # from end";
Blockly.Msg["TEXT_GET_SUBSTRING_START_FROM_START"] = "get substring from letter #";
Blockly.Msg["TEXT_GET_SUBSTRING_TAIL"] = "";
Blockly.Msg["TEXT_GET_SUBSTRING_TOOLTIP"] = "Returns a specified portion of the text.";
Blockly.Msg["TEXT_INDEXOF_HELPURL"] = "https://github.com/google/blockly/wiki/Text#finding-text";
Blockly.Msg["TEXT_INDEXOF_OPERATOR_FIRST"] = "find first occurrence of text";
Blockly.Msg["TEXT_INDEXOF_OPERATOR_LAST"] = "find last occurrence of text";
Blockly.Msg["TEXT_INDEXOF_TITLE"] = "in text %1 %2 %3";
Blockly.Msg["TEXT_INDEXOF_TOOLTIP"] = "Returns the index of the first/last occurrence of the first text in the second text. Returns %1 if text is not found.";
Blockly.Msg["TEXT_ISEMPTY_HELPURL"] = "https://github.com/google/blockly/wiki/Text#checking-for-empty-text";
Blockly.Msg["TEXT_ISEMPTY_TITLE"] = "%1 is empty";
Blockly.Msg["TEXT_ISEMPTY_TOOLTIP"] = "Returns true if the provided text is empty.";
Blockly.Msg["TEXT_JOIN_HELPURL"] = "https://github.com/google/blockly/wiki/Text#text-creation";
Blockly.Msg["TEXT_JOIN_TITLE_CREATEWITH"] = "create text with";
Blockly.Msg["TEXT_JOIN_TOOLTIP"] = "Create a piece of text by joining together any number of items.";
Blockly.Msg["TEXT_LENGTH_HELPURL"] = "https://github.com/google/blockly/wiki/Text#text-modification";
Blockly.Msg["TEXT_LENGTH_TITLE"] = "length of %1";
Blockly.Msg["TEXT_LENGTH_TOOLTIP"] = "Returns the number of letters (including spaces) in the provided text.";
Blockly.Msg["TEXT_PRINT_HELPURL"] = "https://github.com/google/blockly/wiki/Text#printing-text";
Blockly.Msg["TEXT_PRINT_TITLE"] = "print %1";
Blockly.Msg["TEXT_PRINT_TOOLTIP"] = "Print the specified text, number or other value.";
Blockly.Msg["TEXT_PROMPT_HELPURL"] = "https://github.com/google/blockly/wiki/Text#getting-input-from-the-user";
Blockly.Msg["TEXT_PROMPT_TOOLTIP_NUMBER"] = "Prompt for user for a number.";
Blockly.Msg["TEXT_PROMPT_TOOLTIP_TEXT"] = "Prompt for user for some text.";
Blockly.Msg["TEXT_PROMPT_TYPE_NUMBER"] = "prompt for number with message";
Blockly.Msg["TEXT_PROMPT_TYPE_TEXT"] = "prompt for text with message";
Blockly.Msg["TEXT_REPLACE_HELPURL"] = "https://github.com/google/blockly/wiki/Text#replacing-substrings";
Blockly.Msg["TEXT_REPLACE_MESSAGE0"] = "replace %1 with %2 in %3";
Blockly.Msg["TEXT_REPLACE_TOOLTIP"] = "Replace all occurances of some text within some other text.";
Blockly.Msg["TEXT_REVERSE_HELPURL"] = "https://github.com/google/blockly/wiki/Text#reversing-text";
Blockly.Msg["TEXT_REVERSE_MESSAGE0"] = "reverse %1";
Blockly.Msg["TEXT_REVERSE_TOOLTIP"] = "Reverses the order of the characters in the text.";
Blockly.Msg["TEXT_TEXT_HELPURL"] = "https://en.wikipedia.org/wiki/String_(computer_science)";
Blockly.Msg["TEXT_TEXT_TOOLTIP"] = "A letter, word, or line of text.";
Blockly.Msg["TEXT_TRIM_HELPURL"] = "https://github.com/google/blockly/wiki/Text#trimming-removing-spaces";
Blockly.Msg["TEXT_TRIM_OPERATOR_BOTH"] = "trim spaces from both sides of";
Blockly.Msg["TEXT_TRIM_OPERATOR_LEFT"] = "trim spaces from left side of";
Blockly.Msg["TEXT_TRIM_OPERATOR_RIGHT"] = "trim spaces from right side of";
Blockly.Msg["TEXT_TRIM_TOOLTIP"] = "Return a copy of the text with spaces removed from one or both ends.";
Blockly.Msg["TODAY"] = "Today";
Blockly.Msg["UNDO"] = "Undo";
Blockly.Msg["UNNAMED_KEY"] = "unnamed";
Blockly.Msg["VARIABLES_DEFAULT_NAME"] = "item";
Blockly.Msg["VARIABLES_GET_CREATE_SET"] = "Create 'set %1'";
Blockly.Msg["VARIABLES_GET_HELPURL"] = "https://github.com/google/blockly/wiki/Variables#get";
Blockly.Msg["VARIABLES_GET_TOOLTIP"] = "Returns the value of this variable.";
Blockly.Msg["VARIABLES_SET"] = "set %1 to %2";
Blockly.Msg["VARIABLES_SET_CREATE_GET"] = "Create 'get %1'";
Blockly.Msg["VARIABLES_SET_HELPURL"] = "https://github.com/google/blockly/wiki/Variables#set";
Blockly.Msg["VARIABLES_SET_TOOLTIP"] = "Sets this variable to be equal to the input.";
Blockly.Msg["VARIABLE_ALREADY_EXISTS"] = "A variable named '%1' already exists.";
Blockly.Msg["VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE"] = "A variable named '%1' already exists for another type: '%2'.";
Blockly.Msg["WORKSPACE_ARIA_LABEL"] = "Blockly Workspace";
Blockly.Msg["WORKSPACE_COMMENT_DEFAULT_TEXT"] = "Say something...";
Blockly.Msg["CONTROLS_FOREACH_INPUT_DO"] = Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"];
Blockly.Msg["CONTROLS_FOR_INPUT_DO"] = Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"];
Blockly.Msg["CONTROLS_IF_ELSEIF_TITLE_ELSEIF"] = Blockly.Msg["CONTROLS_IF_MSG_ELSEIF"];
Blockly.Msg["CONTROLS_IF_ELSE_TITLE_ELSE"] = Blockly.Msg["CONTROLS_IF_MSG_ELSE"];
Blockly.Msg["CONTROLS_IF_IF_TITLE_IF"] = Blockly.Msg["CONTROLS_IF_MSG_IF"];
Blockly.Msg["CONTROLS_IF_MSG_THEN"] = Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"];
Blockly.Msg["CONTROLS_WHILEUNTIL_INPUT_DO"] = Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"];
Blockly.Msg["LISTS_CREATE_WITH_ITEM_TITLE"] = Blockly.Msg["VARIABLES_DEFAULT_NAME"];
Blockly.Msg["LISTS_GET_INDEX_HELPURL"] = Blockly.Msg["LISTS_INDEX_OF_HELPURL"];
Blockly.Msg["LISTS_GET_INDEX_INPUT_IN_LIST"] = Blockly.Msg["LISTS_INLIST"];
Blockly.Msg["LISTS_GET_SUBLIST_INPUT_IN_LIST"] = Blockly.Msg["LISTS_INLIST"];
Blockly.Msg["LISTS_INDEX_OF_INPUT_IN_LIST"] = Blockly.Msg["LISTS_INLIST"];
Blockly.Msg["LISTS_SET_INDEX_INPUT_IN_LIST"] = Blockly.Msg["LISTS_INLIST"];
Blockly.Msg["MATH_CHANGE_TITLE_ITEM"] = Blockly.Msg["VARIABLES_DEFAULT_NAME"];
Blockly.Msg["PROCEDURES_DEFRETURN_COMMENT"] = Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"];
Blockly.Msg["PROCEDURES_DEFRETURN_DO"] = Blockly.Msg["PROCEDURES_DEFNORETURN_DO"];
Blockly.Msg["PROCEDURES_DEFRETURN_PROCEDURE"] = Blockly.Msg["PROCEDURES_DEFNORETURN_PROCEDURE"];
Blockly.Msg["PROCEDURES_DEFRETURN_TITLE"] = Blockly.Msg["PROCEDURES_DEFNORETURN_TITLE"];
Blockly.Msg["TEXT_APPEND_VARIABLE"] = Blockly.Msg["VARIABLES_DEFAULT_NAME"];
Blockly.Msg["TEXT_CREATE_JOIN_ITEM_TITLE_ITEM"] = Blockly.Msg["VARIABLES_DEFAULT_NAME"];

Blockly.Msg["MATH_HUE"] = "230";
Blockly.Msg["LOOPS_HUE"] = "120";
Blockly.Msg["LISTS_HUE"] = "260";
Blockly.Msg["LOGIC_HUE"] = "210";
Blockly.Msg["VARIABLES_HUE"] = "330";
Blockly.Msg["TEXTS_HUE"] = "160";
Blockly.Msg["PROCEDURES_HUE"] = "290";
Blockly.Msg["COLOUR_HUE"] = "20";
Blockly.Msg["VARIABLES_DYNAMIC_HUE"] = "310";
return Blockly.Msg;
})); 


/***/ }),

/***/ 4206:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "yq": function() { return /* binding */ WorkspaceServices; },
/* harmony export */   "O7": function() { return /* binding */ resolveWorkspaceServices; },
/* harmony export */   "pW": function() { return /* binding */ TRANSFORMED_DATA_CHANGE; },
/* harmony export */   "LL": function() { return /* binding */ BlockServices; },
/* harmony export */   "Ys": function() { return /* binding */ resolveBlockServices; },
/* harmony export */   "Cv": function() { return /* binding */ resolveBlockSvg; },
/* harmony export */   "Vm": function() { return /* binding */ setBlockDataWarning; },
/* harmony export */   "$$": function() { return /* binding */ resolveBlockWarnings; },
/* harmony export */   "W5": function() { return /* binding */ WorkspaceProvider; }
/* harmony export */ });
/* unused harmony exports DATA_WARNING_KEY, setBlockWarning, WorkspaceContext */
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3144);
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1721);
/* harmony import */ var blockly__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4948);
/* harmony import */ var blockly__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(blockly__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var _useWorkspaceEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8402);
/* harmony import */ var _dom_eventsource__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6449);
/* harmony import */ var _dom_constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(3109);
/* eslint-disable @typescript-eslint/ban-types */var WorkspaceServices=/*#__PURE__*/function(_JDEventSource){(0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(WorkspaceServices,_JDEventSource);function WorkspaceServices(){return _JDEventSource.call(this)||this;}(0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z)(WorkspaceServices,[{key:"workspaceJSON",get:function get(){return this._workspaceJSON;},set:function set(value){if(value!==this._workspaceJSON){this._workspaceJSON=value;this.emit(WorkspaceServices.WORKSPACE_CHANGE);}}},{key:"workingDirectory",get:function get(){return this._directory;},set:function set(value){if(this._directory!==value){this._directory=value;// don't notify
}}}]);return WorkspaceServices;}(_dom_eventsource__WEBPACK_IMPORTED_MODULE_5__/* .JDEventSource */ .aE);WorkspaceServices.WORKSPACE_CHANGE="workspaceChange";function resolveWorkspaceServices(workspace){var workspaceWithServices=workspace;var services=workspaceWithServices===null||workspaceWithServices===void 0?void 0:workspaceWithServices.workspaceServices;return services;}var TRANSFORMED_DATA_CHANGE="transformedDataChange";var DATA_WARNING_KEY="data";var BlockServices=/*#__PURE__*/function(_JDEventSource2){(0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(BlockServices,_JDEventSource2);function BlockServices(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_JDEventSource2.call.apply(_JDEventSource2,[this].concat(args))||this;_this.cache={};_this.initialized=false;return _this;}var _proto=BlockServices.prototype;_proto.setDataWarning=function setDataWarning(value){this.setWarning(DATA_WARNING_KEY,value);};_proto.setWarning=function setWarning(key,value){if(!value){if(this._warnings){delete this._warnings[key];if(!Object.keys(this._warnings).length)this._warnings=undefined;}}else{if(!this._warnings)this._warnings={};this._warnings[key]=value;}};_proto.clearData=function clearData(){this._data=undefined;this._transformedData=undefined;this.setWarning(DATA_WARNING_KEY,undefined);this.emit(_dom_constants__WEBPACK_IMPORTED_MODULE_6__/* .CHANGE */ .Ve);};(0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z)(BlockServices,[{key:"data",get:function get(){return this._data;},set:function set(value){if(this._data!==value){this._data=value;this._transformedData=undefined;this.emit(_dom_constants__WEBPACK_IMPORTED_MODULE_6__/* .CHANGE */ .Ve);}}},{key:"transformedData",get:function get(){return this._transformedData;},set:function set(value){if(this._transformedData!==value){this._transformedData=value;this.emit(TRANSFORMED_DATA_CHANGE);}}},{key:"warnings",get:function get(){return this._warnings;}}]);return BlockServices;}(_dom_eventsource__WEBPACK_IMPORTED_MODULE_5__/* .JDEventSource */ .aE);function resolveBlockServices(block){var blockWithServices=block;var services=blockWithServices===null||blockWithServices===void 0?void 0:blockWithServices.blockServices;return services;}function resolveBlockSvg(block){return block;}function setBlockWarning(block,key,value){var services=resolveBlockServices(block);services===null||services===void 0?void 0:services.setWarning(key,value);}function setBlockDataWarning(block,value){setBlockWarning(block,DATA_WARNING_KEY,value);}function resolveBlockWarnings(block){var services=resolveBlockServices(block);if(services){var{warnings}=services;if(warnings)return Object.values(warnings).join("\n");}return null;}var WorkspaceContext=/*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({workspace:undefined,dragging:false,sourceBlock:undefined,sourceId:undefined,services:undefined});WorkspaceContext.displayName="Workspace";/* harmony default export */ __webpack_exports__["ZP"] = (WorkspaceContext);/**
 * A blockly context for each field
 * @param props
 * @returns
 */function WorkspaceProvider(props){var{field,children}=props;var sourceBlock=field===null||field===void 0?void 0:field.getSourceBlock();var sourceId=sourceBlock===null||sourceBlock===void 0?void 0:sourceBlock.id;var workspace=sourceBlock===null||sourceBlock===void 0?void 0:sourceBlock.workspace;var services=resolveWorkspaceServices(workspace);var{0:dragging,1:setDragging}=(0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(!!(workspace!==null&&workspace!==void 0&&workspace.isDragging()));var handleWorkspaceEvent=(0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(event=>{var{workspaceId,type}=event;if(workspaceId!==(workspace===null||workspace===void 0?void 0:workspace.id))return;if(type===blockly__WEBPACK_IMPORTED_MODULE_0__.Events.BLOCK_DRAG){var drag=event;setDragging(!!(drag!==null&&drag!==void 0&&drag.isStart));}},[workspace]);(0,_useWorkspaceEvent__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(workspace,handleWorkspaceEvent);return/*#__PURE__*/ (// eslint-disable-next-line react/react-in-jsx-scope
react__WEBPACK_IMPORTED_MODULE_1__.createElement(WorkspaceContext.Provider,{value:{sourceBlock,workspace,dragging,sourceId,services}},children));}

/***/ }),

/***/ 9269:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": function() { return /* binding */ postTransformData; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5861);
/* harmony import */ var _proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9120);
function postTransformData(_x){return _postTransformData.apply(this,arguments);}function _postTransformData(){_postTransformData=(0,_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(function*(message){// check for missing data
if(!message.data)return undefined;var worker=(0,_proxy__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)("data");var res=yield worker.postMessage(message);return res===null||res===void 0?void 0:res.data;});return _postTransformData.apply(this,arguments);}

/***/ }),

/***/ 9120:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": function() { return /* binding */ workerProxy; }
});

// UNUSED EXPORTS: WorkerProxy

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
var assertThisInitialized = __webpack_require__(7326);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js + 1 modules
var inheritsLoose = __webpack_require__(1721);
// EXTERNAL MODULE: ./node_modules/assert/build/assert.js
var assert = __webpack_require__(9282);
var assert_default = /*#__PURE__*/__webpack_require__.n(assert);
// EXTERNAL MODULE: ./src/components/dom/constants.ts
var constants = __webpack_require__(3109);
// EXTERNAL MODULE: ./src/components/dom/eventsource.ts
var eventsource = __webpack_require__(6449);
;// CONCATENATED MODULE: ./src/workers/csv/workerloader.js
function createCsvWorker(){return typeof Window!=="undefined"&&new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(440), __webpack_require__.b// syntax not supported in typescript
));}
;// CONCATENATED MODULE: ./src/workers/data/workerloader.js
function createDataWorker(){return typeof Window!=="undefined"&&new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(784), __webpack_require__.b// syntax not supported in typescript
));}
;// CONCATENATED MODULE: ./src/components/blockly/dsl/workers/proxy.ts
/* eslint-disable @typescript-eslint/no-explicit-any */ /* eslint-disable @typescript-eslint/ban-types */var WorkerProxy=/*#__PURE__*/function(_JDEventSource){(0,inheritsLoose/* default */.Z)(WorkerProxy,_JDEventSource);function WorkerProxy(worker,workerid){var _this;_this=_JDEventSource.call(this)||this;_this.pendings={};_this.worker=worker;_this.workerid=workerid;_this.handleMessage=_this.handleMessage.bind((0,assertThisInitialized/* default */.Z)(_this));_this.worker.addEventListener("message",_this.handleMessage);return _this;}var _proto=WorkerProxy.prototype;_proto.unmount=function unmount(){delete _workers[this.workerid];this.worker.removeEventListener("message",this.handleMessage);this.worker.terminate();//Object.values(this.pendings).forEach(({ reject }) =>
//    reject(new Error("worker terminated"))
//)
};_proto.handleMessage=function handleMessage(event){var{data:message}=event;var{id,worker}=message;var pending=id&&this.pendings[id];if(pending){assert_default()(worker===message.worker);if(message.error)console.debug(this.workerid+": error: "+message.error,message);pending.resolve(message);}else{this.emit(constants/* MESSAGE */.$B,event.data);}};_proto.postMessage=function postMessage(message){message.id=message.id||Math.random()+"";message.worker=this.workerid;return new Promise((resolve,reject)=>{this.pendings[message.id]={resolve,reject};this.worker.postMessage(message);});};return WorkerProxy;}(eventsource/* JDEventSource */.aE);var _workers={};var loaders={data:createDataWorker,csv:createCsvWorker};function workerProxy(workerid){var worker=_workers[workerid]||(_workers[workerid]=new WorkerProxy(loaders[workerid](),workerid));return worker;}

/***/ }),

/***/ 8977:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ZT": function() { return /* binding */ declareColumns; },
/* harmony export */   "r9": function() { return /* binding */ resolveColumns; },
/* harmony export */   "ZP": function() { return /* binding */ DataColumnChooserField; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5785);
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1721);
/* harmony import */ var _WorkspaceContext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4206);
/* harmony import */ var _tidy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1523);
/* harmony import */ var blockly__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4948);
/* harmony import */ var blockly__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(blockly__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _dom_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4828);
function declareColumns(count,options){var{prefix="column",start=1,dataType}=options||{};return Array(count).fill(0).map((_,i)=>({type:DataColumnChooserField.KEY,name:""+prefix+(i+start),dataType}));}function resolveColumns(data,b,count,options){var{prefix="column",start=1,dataType}=options||{};var columns=(0,_dom_utils__WEBPACK_IMPORTED_MODULE_3__/* .unique */ .Tw)(Array(count).fill(0).map((_,column)=>(0,_tidy__WEBPACK_IMPORTED_MODULE_1__/* .tidyResolveFieldColumn */ .Fy)(data,b,""+prefix+(column+start),{type:dataType})).filter(c=>!!c));return columns;}var DataColumnChooserField=/*#__PURE__*/function(_FieldDropdown){(0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z)(DataColumnChooserField,_FieldDropdown);DataColumnChooserField.fromJson=function fromJson(options){return new DataColumnChooserField(options);}// eslint-disable-next-line @typescript-eslint/no-explicit-any
// the first argument is a dummy and never used
;function DataColumnChooserField(options){var _this;_this=_FieldDropdown.call(this,()=>[["",""]],undefined,options)||this;_this.SERIALIZABLE=true;_this.dataType=options===null||options===void 0?void 0:options.dataType;_this.parentData=options===null||options===void 0?void 0:options.parentData;return _this;}var _proto=DataColumnChooserField.prototype;_proto.fromXml=function fromXml(fieldElement){this.setValue(fieldElement.textContent);};_proto.getOptions=function getOptions(){var _sourceBlock$getSurro;var sourceBlock=this.getSourceBlock();var services=(0,_WorkspaceContext__WEBPACK_IMPORTED_MODULE_0__/* .resolveBlockServices */ .Ys)(this.parentData==2?sourceBlock===null||sourceBlock===void 0?void 0:(_sourceBlock$getSurro=sourceBlock.getSurroundParent())===null||_sourceBlock$getSurro===void 0?void 0:_sourceBlock$getSurro.getSurroundParent():this.parentData?sourceBlock===null||sourceBlock===void 0?void 0:sourceBlock.getSurroundParent():sourceBlock);var data=services===null||services===void 0?void 0:services.data;var{headers,types}=(0,_tidy__WEBPACK_IMPORTED_MODULE_1__/* .tidyHeaders */ .P2)(data);var options=headers.filter((h,i)=>!this.dataType||types[i]===this.dataType).map(h=>[(0,_dom_utils__WEBPACK_IMPORTED_MODULE_3__/* .humanify */ .lW)(h),h])||[];var value=this.getValue();var r=options.length<1?[[(0,_dom_utils__WEBPACK_IMPORTED_MODULE_3__/* .humanify */ .lW)(value||""),value||""]]:[].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z)(options),[["",""]]);return r;};_proto.doClassValidation_=function doClassValidation_(newValue){// skip super class validationervices chan
return newValue;};return DataColumnChooserField;}(blockly__WEBPACK_IMPORTED_MODULE_2__.FieldDropdown);DataColumnChooserField.KEY="ds_field_data_column_chooser";

/***/ }),

/***/ 1523:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "P2": function() { return /* binding */ tidyHeaders; },
/* harmony export */   "Z5": function() { return /* binding */ summarizeCounts; },
/* harmony export */   "gc": function() { return /* binding */ tidyResolveHeader; },
/* harmony export */   "sz": function() { return /* binding */ tidyResolveHeaderType; },
/* harmony export */   "Fy": function() { return /* binding */ tidyResolveFieldColumn; },
/* harmony export */   "QZ": function() { return /* binding */ tidyResolveFieldColumns; },
/* harmony export */   "HA": function() { return /* binding */ tidySlice; }
/* harmony export */ });
/* unused harmony export tidyFindLastValue */
/* harmony import */ var _tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7702);
/* harmony import */ var _dsl_workers_data_proxy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9269);
/* harmony import */ var _WorkspaceContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4206);
/* eslint-disable @typescript-eslint/ban-types */function tidyHeaders(data,type){var row=(data===null||data===void 0?void 0:data[0])||{};var headers=Object.keys(row);if(type)headers=headers.filter(header=>type===typeof row[header]);var types=headers.map(header=>typeof row[header]);return{headers,types};}function summarizeCounts(data,column,slice){var items={};items["name"]=(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .first */ .Ps)(column);items["count"]=(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__.n)();var res=(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .tidy */ .lu)(data,// eslint-disable-next-line @typescript-eslint/no-explicit-any
(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .groupBy */ .vM)(column,[(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .summarize */ .Iz)(items)]),(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .arrange */ .Di)([(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .desc */ .C8)("count")]),(0,_tidyjs_tidy__WEBPACK_IMPORTED_MODULE_0__/* .sliceHead */ .sy)(slice));return res;}function tidyFindLastValue(data,column){if(!(data!==null&&data!==void 0&&data.length))return undefined;return data[data.length-1][column];}function tidyResolveHeader(data,name,type){if(!data||!name)return undefined;var{headers}=tidyHeaders(data,type);return headers.indexOf(name)>-1?name:undefined;}function tidyResolveHeaderType(data,name){if(!data||!name)return undefined;var{headers,types}=tidyHeaders(data);return types[headers.indexOf(name)];}function tidyResolveFieldColumn(data,b,fieldName,options){var name=b.getFieldValue(fieldName);var{type,required}=options||{};var column=tidyResolveHeader(data,name,type);if(!column){if(required&&!name)(0,_WorkspaceContext__WEBPACK_IMPORTED_MODULE_2__/* .setBlockDataWarning */ .Vm)(b,"missing column name");else if(name)(0,_WorkspaceContext__WEBPACK_IMPORTED_MODULE_2__/* .setBlockDataWarning */ .Vm)(b,"'"+name+"' not found");/*console.debug("data column not found", {
            fieldName,
            name,
            type,
            required,
            data,
        })*/}return column;}function tidyResolveFieldColumns(data,b,fieldName,type){var _tidyHeaders;var name=b.getFieldValue(fieldName);if(!name)return(_tidyHeaders=tidyHeaders(data,type))===null||_tidyHeaders===void 0?void 0:_tidyHeaders.headers;else{var header=tidyResolveHeader(data,name,type);if(header)return[header];else return[];}}function tidySlice(data,options){if(!options||!(data!==null&&data!==void 0&&data.length))return Promise.resolve(data);var{length}=data;var{sliceMin=Infinity,sliceMax=Infinity,sliceHead=Infinity,sliceTail=Infinity,sliceSample=Infinity}=options;// shortcut
if(length<sliceMin&&length<sliceMax&&length<sliceHead&&length<sliceTail&&length<sliceSample)return Promise.resolve(data);// crunch in webworker
//console.debug(`slice data`, { data, options })
return (0,_dsl_workers_data_proxy__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(Object.assign({type:"slice",data},options));}

/***/ }),

/***/ 3461:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Uz": function() { return /* binding */ NEW_PROJET_XML; },
/* harmony export */   "FW": function() { return /* binding */ identityTransformData; },
/* harmony export */   "zC": function() { return /* binding */ DATA_TABLE_TYPE; },
/* harmony export */   "zN": function() { return /* binding */ DATA_SCIENCE_STATEMENT_TYPE; },
/* harmony export */   "xx": function() { return /* binding */ CHART_WIDTH; },
/* harmony export */   "Fh": function() { return /* binding */ CHART_HEIGHT; },
/* harmony export */   "TP": function() { return /* binding */ CHART_SVG_MAX_ITEMS; },
/* harmony export */   "kC": function() { return /* binding */ BAR_MAX_ITEMS; },
/* harmony export */   "DZ": function() { return /* binding */ PIE_MAX_ITEMS; },
/* harmony export */   "VN": function() { return /* binding */ SCATTER_MAX_ITEMS; },
/* harmony export */   "bH": function() { return /* binding */ LINE_MAX_ITEMS; },
/* harmony export */   "Fd": function() { return /* binding */ BAR_CORNER_RADIUS; },
/* harmony export */   "KH": function() { return /* binding */ TABLE_WIDTH; },
/* harmony export */   "U2": function() { return /* binding */ TABLE_HEIGHT; },
/* harmony export */   "IP": function() { return /* binding */ SMALL_TABLE_HEIGHT; },
/* harmony export */   "kS": function() { return /* binding */ FULL_TABLE_WIDTH; },
/* harmony export */   "Sw": function() { return /* binding */ TABLE_PREVIEW_MAX_ITEMS; },
/* harmony export */   "FO": function() { return /* binding */ TABLE_PREVIEW_HEIGHT; },
/* harmony export */   "FD": function() { return /* binding */ JSON_WARNINGS_CATEGORY; },
/* harmony export */   "cR": function() { return /* binding */ WORKSPACE_FILENAME; },
/* harmony export */   "fT": function() { return /* binding */ chartSettingsSchema; },
/* harmony export */   "n": function() { return /* binding */ char2DSettingsSchema; },
/* harmony export */   "p$": function() { return /* binding */ charMapSettingsSchema; },
/* harmony export */   "B8": function() { return /* binding */ calcOptions; },
/* harmony export */   "j2": function() { return /* binding */ visitToolbox; },
/* harmony export */   "Pq": function() { return /* binding */ resolveBlockDefinition; }
/* harmony export */ });
/* unused harmony exports JSON_TYPE, STRING_TYPE, BOOLEAN_TYPE, NUMBER_TYPE, CODE_STATEMENT_TYPE, toolsColour, analyzeColour, axisSchema, scaleSchema, encodingSettingsSchema, encodingNumberSettingsSchema */
/* harmony import */ var _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5861);
/* harmony import */ var blockly__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4948);
/* harmony import */ var blockly__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(blockly__WEBPACK_IMPORTED_MODULE_0__);
var NEW_PROJET_XML='<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';// eslint-disable-next-line @typescript-eslint/ban-types
var identityTransformData=/*#__PURE__*/function(){var _ref=(0,_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(function*(block,data){return data;});return function identityTransformData(_x,_x2){return _ref.apply(this,arguments);};}();var JSON_TYPE="JSON";var STRING_TYPE="String";var BOOLEAN_TYPE="Boolean";var NUMBER_TYPE="Number";var DATA_TABLE_TYPE="DataTable";var CODE_STATEMENT_TYPE="Code";var DATA_SCIENCE_STATEMENT_TYPE="DataScienceStatement";var toolsColour="#303030";var analyzeColour="#404040";var CHART_WIDTH=468;var CHART_HEIGHT=240;var CHART_SVG_MAX_ITEMS=256;var BAR_MAX_ITEMS=1<<10;var PIE_MAX_ITEMS=32;var SCATTER_MAX_ITEMS=1<<13;var LINE_MAX_ITEMS=1<<10;var BAR_CORNER_RADIUS=2;var TABLE_WIDTH=CHART_WIDTH;var TABLE_HEIGHT=480;var SMALL_TABLE_HEIGHT=136;var FULL_TABLE_WIDTH=800;var TABLE_PREVIEW_MAX_ITEMS=256;var TABLE_PREVIEW_HEIGHT=480;var JSON_WARNINGS_CATEGORY="json";var WORKSPACE_FILENAME="blocks.json";var chartSettingsSchema={type:"object",properties:{title:{type:"string",title:"Chart title"}}};var axisSchema={type:"object",properties:{title:{type:"string",title:"Title"}}};var scaleSchema={type:"object",properties:{domainMin:{type:"number",title:"minimum",description:"Sets the minimum value in the scale domain"},domainMax:{type:"number",title:"maximum",description:"Sets the maximum value in the scale domain"}}};var encodingSettingsSchema={type:"object",properties:{axis:axisSchema}};var encodingNumberSettingsSchema={type:"object",properties:{scale:scaleSchema,axis:axisSchema}};var char2DSettingsSchema={type:"object",properties:{title:{type:"string",title:"Chart title"},encoding:{type:"object",properties:{x:Object.assign({title:"X"},encodingNumberSettingsSchema),y:Object.assign({title:"Y"},encodingNumberSettingsSchema)}}}};var charMapSettingsSchema={type:"object",properties:{title:{type:"string",title:"Chart title"},encoding:{index:Object.assign({title:"Index"},encodingSettingsSchema),value:Object.assign({title:"Value"},encodingNumberSettingsSchema)}}};var calcOptions=["mean","median","min","max","sum","deviation","variance"].map(n=>[n,n]);function visitToolbox(node,visitor){var visitContents=contents=>{contents===null||contents===void 0?void 0:contents.forEach(content=>{var _visitor$visitButton;var{kind}=content;switch(kind){case"button":(_visitor$visitButton=visitor.visitButton)===null||_visitor$visitButton===void 0?void 0:_visitor$visitButton.call(visitor,content);break;case"category":{var cat=content;visitContents(cat.contents);break;}}});};visitContents(node===null||node===void 0?void 0:node.contents);}function resolveBlockDefinition(type){var b=(blockly__WEBPACK_IMPORTED_MODULE_0___default().Blocks)[type];return b===null||b===void 0?void 0:b.definition;}

/***/ }),

/***/ 8402:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": function() { return /* binding */ useWorkspaceEvent; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7294);
/**
 * A hook to register event on a blockly workspace
 */function useWorkspaceEvent(workspace,handler){// register hook
(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{workspace===null||workspace===void 0?void 0:workspace.addChangeListener(handler);return()=>workspace===null||workspace===void 0?void 0:workspace.removeChangeListener(handler);},[workspace,handler]);}

/***/ }),

/***/ 5666:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": function() { return /* binding */ useWindowEvent; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5785);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7294);
function useWindowEvent(type,listener,passive,deps){if(passive===void 0){passive=false;}(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{if(typeof self==="undefined"||!listener)return undefined;// SSR
// initiate the event handler
self.addEventListener(type,listener,passive);// this will clean up the event every time the component is re-rendered
return()=>self.removeEventListener(type,listener);},[type,listener,passive].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(deps||[])));}

/***/ })

}]);
//# sourceMappingURL=fecc7f13e9b8fccfc286c3e8f9d8a10b2a032d80-b97d11f13feeb1337a6d.js.map