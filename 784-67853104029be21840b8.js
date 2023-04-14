/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function tidy(items, ...fns) {
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

function filter(filterFn) {
  const _filter = items => items.filter(filterFn);

  return _filter;
}

function singleOrArray(d) {
  return d == null ? [] : Array.isArray(d) ? d : [d];
}

function distinct(keys) {
  const _distinct = items => {
    keys = singleOrArray(keys);

    if (!keys.length) {
      const set = new Set();

      for (const item of items) {
        set.add(item);
      }

      return Array.from(set);
    }

    const rootMap = new Map();
    const distinctItems = [];
    const lastKey = keys[keys.length - 1];

    for (const item of items) {
      let map = rootMap;
      let hasItem = false;

      for (const key of keys) {
        const mapItemKey = typeof key === "function" ? key(item) : item[key];

        if (key === lastKey) {
          hasItem = map.has(mapItemKey);

          if (!hasItem) {
            distinctItems.push(item);
            map.set(mapItemKey, true);
          }

          break;
        }

        if (!map.has(mapItemKey)) {
          map.set(mapItemKey, new Map());
        }

        map = map.get(mapItemKey);
      }
    }

    return distinctItems;
  };

  return _distinct;
}

function ascending$1 (a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function* numbers(values, valueof) {
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}

function variance$1(values, valueof) {
  let count = 0;
  let delta;
  let mean = 0;
  let sum = 0;

  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  }

  if (count > 1) return sum / (count - 1);
}

function deviation$1(values, valueof) {
  const v = variance$1(values, valueof);
  return v ? Math.sqrt(v) : v;
}

// https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }

  add(x) {
    const p = this._partials;
    let i = 0;

    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j],
            hi = x + y,
            lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo) p[i++] = lo;
      x = hi;
    }

    p[i] = x;
    this._n = i + 1;
    return this;
  }

  valueOf() {
    const p = this._partials;
    let n = this._n,
        x,
        y,
        lo,
        hi = 0;

    if (n > 0) {
      hi = p[--n];

      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo) break;
      }

      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi) hi = x;
      }
    }

    return hi;
  }

}
function fsum(values, valueof) {
  const adder = new Adder();

  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        adder.add(value);
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        adder.add(value);
      }
    }
  }

  return +adder;
}

class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, {
      _intern: {
        value: new Map()
      },
      _key: {
        value: key
      }
    });
    if (entries != null) for (const [_key2, value] of entries) this.set(_key2, value);
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

function intern_get({
  _intern,
  _key
}, value) {
  const key = _key(value);

  return _intern.has(key) ? _intern.get(key) : value;
}

function intern_set({
  _intern,
  _key
}, value) {
  const key = _key(value);

  if (_intern.has(key)) return _intern.get(key);

  _intern.set(key, value);

  return value;
}

function intern_delete({
  _intern,
  _key
}, value) {
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

function identity$2 (x) {
  return x;
}

function group(values, ...keys) {
  return nest(values, identity$2, identity$2, keys);
}

function nest(values, map, reduce, keys) {
  return function regroup(values, i) {
    if (i >= keys.length) return reduce(values);
    const groups = new InternMap();
    const keyof = keys[i++];
    let index = -1;

    for (const value of values) {
      const key = keyof(value, ++index, values);
      const group = groups.get(key);
      if (group) group.push(value);else groups.set(key, [value]);
    }

    for (const [key, _values] of groups) {
      groups.set(key, regroup(_values, i));
    }

    return map(groups);
  }(values, 0);
}

function max$1(values, valueof) {
  let max;

  if (valueof === undefined) {
    for (const value of values) {
      if (value != null && (max < value || max === undefined && value >= value)) {
        max = value;
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (max < value || max === undefined && value >= value)) {
        max = value;
      }
    }
  }

  return max;
}

function min$1(values, valueof) {
  let min;

  if (valueof === undefined) {
    for (const value of values) {
      if (value != null && (min > value || min === undefined && value >= value)) {
        min = value;
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (min > value || min === undefined && value >= value)) {
        min = value;
      }
    }
  }

  return min;
}

// ISC license, Copyright 2018 Vladimir Agafonkin.

function quickselect(array, k, left = 0, right = array.length - 1, compare = ascending$1) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
      quickselect(array, k, newLeft, newRight, compare);
    }

    const t = array[k];
    let i = left;
    let j = right;
    swap(array, left, k);
    if (compare(array[right], t) > 0) swap(array, left, right);

    while (i < j) {
      swap(array, i, j), ++i, --j;

      while (compare(array[i], t) < 0) ++i;

      while (compare(array[j], t) > 0) --j;
    }

    if (compare(array[left], t) === 0) swap(array, left, j);else ++j, swap(array, j, right);
    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }

  return array;
}

function swap(array, i, j) {
  const t = array[i];
  array[i] = array[j];
  array[j] = t;
}

function quantile(values, p, valueof) {
  values = Float64Array.from(numbers(values, valueof));
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return min$1(values);
  if (p >= 1) return max$1(values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = max$1(quickselect(values, i0).subarray(0, i0 + 1)),
      value1 = min$1(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}

function median$1 (values, valueof) {
  return quantile(values, 0.5, valueof);
}

var shuffle = shuffler(Math.random);
function shuffler(random) {
  return function shuffle(array, i0 = 0, i1 = array.length) {
    let m = i1 - (i0 = +i0);

    while (m) {
      const i = random() * m-- | 0,
            t = array[m + i0];
      array[m + i0] = array[i + i0];
      array[i + i0] = t;
    }

    return array;
  };
}

function arrange(comparators) {
  const _arrange = items => {
    const comparatorFns = singleOrArray(comparators).map(comp => typeof comp === "function" ? comp.length === 1 ? asc(comp) : comp : asc(comp));
    return items.slice().sort((a, b) => {
      for (const comparator of comparatorFns) {
        const result = comparator(a, b);
        if (result) return result;
      }

      return 0;
    });
  };

  return _arrange;
}

function asc(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return function _asc(a, b) {
    return emptyAwareComparator(keyFn(a), keyFn(b), false);
  };
}

function desc(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return function _desc(a, b) {
    return emptyAwareComparator(keyFn(a), keyFn(b), true);
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

  return ascending$1(a, b);
}

function isEmpty(value) {
  return value == null || value !== value;
}

function summarize(summarizeSpec, options) {
  const _summarize = items => {
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

function mutate(mutateSpec) {
  const _mutate = items => {
    const mutatedItems = items.map(d => _extends({}, d));
    let i = 0;

    for (const mutatedItem of mutatedItems) {
      for (const key in mutateSpec) {
        const mutateSpecValue = mutateSpec[key];
        const mutatedResult = typeof mutateSpecValue === "function" ? mutateSpecValue(mutatedItem, i, mutatedItems) : mutateSpecValue;
        mutatedItem[key] = mutatedResult;
      }

      ++i;
    }

    return mutatedItems;
  };

  return _mutate;
}

function assignGroupKeys(d, keys) {
  if (d == null || typeof d !== "object" || Array.isArray(d)) return d;
  const keysObj = Object.fromEntries(keys.filter(key => typeof key[0] !== "function" && key[0] != null));
  return Object.assign(keysObj, d);
}

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

function groupMap(grouped, groupFn, keyFn = keys => keys[keys.length - 1]) {
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

const identity$1 = d => d;

function isObject(obj) {
  const type = typeof obj;
  return obj != null && (type === "object" || type === "function");
}

function groupBy(groupKeys, fns, options) {
  if (typeof fns === "function") {
    fns = [fns];
  } else if (arguments.length === 2 && fns != null && !Array.isArray(fns)) {
    options = fns;
  }

  const _groupBy = items => {
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
          return exportLevels(results, _extends({}, options, {
            export: "levels",
            levels: ["entries-object"]
          }));

        default:
          return exportLevels(results, _extends({}, options, {
            export: "levels",
            levels: [options.export]
          }));
      }
    }

    const ungrouped = ungroup(results, options == null ? void 0 : options.addGroupKeys);
    return ungrouped;
  };

  return _groupBy;
}

groupBy.grouped = options => _extends({}, options, {
  export: "grouped"
});

groupBy.entries = options => _extends({}, options, {
  export: "entries"
});

groupBy.entriesObject = options => _extends({}, options, {
  export: "entries-object"
});

groupBy.object = options => _extends({}, options, {
  export: "object"
});

groupBy.map = options => _extends({}, options, {
  export: "map"
});

groupBy.keys = options => _extends({}, options, {
  export: "keys"
});

groupBy.values = options => _extends({}, options, {
  export: "values"
});

groupBy.levels = options => _extends({}, options, {
  export: "levels"
});

function runFlow(items, fns, addGroupKeys) {
  let result = items;
  if (!(fns == null ? void 0 : fns.length)) return result;

  for (const fn of fns) {
    if (!fn) continue;
    result = groupMap(result, (items2, keys) => {
      const context = {
        groupKeys: keys
      };
      let leafItemsMapped = fn(items2, context);

      if (addGroupKeys !== false) {
        leafItemsMapped = leafItemsMapped.map(item => assignGroupKeys(item, keys));
      }

      return leafItemsMapped;
    });
  }

  return result;
}

function makeGrouped(items, groupKeys) {
  const groupKeyFns = singleOrArray(groupKeys).map((key, i) => {
    const keyFn = typeof key === "function" ? key : d => d[key];
    const keyCache = new Map();
    return d => {
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
  groupTraversal(grouped, items, [], identity$1, (root, keys, values) => {
    let valuesToAdd = values;

    if (addGroupKeys !== false) {
      valuesToAdd = values.map(d => assignGroupKeys(d, keys));
    }

    root.push(...valuesToAdd);
  });
  return items;
}

const defaultCompositeKey = keys => keys.join("/");

function processFromGroupsOptions(options) {
  var _a;

  const {
    flat,
    single,
    mapLeaf = identity$1,
    mapLeaves = identity$1,
    addGroupKeys
  } = options;
  let compositeKey;

  if (options.flat) {
    compositeKey = (_a = options.compositeKey) != null ? _a : defaultCompositeKey;
  }

  const groupFn = (values, keys) => {
    return single ? mapLeaf(addGroupKeys === false ? values[0] : assignGroupKeys(values[0], keys)) : mapLeaves(values.map(d => mapLeaf(addGroupKeys === false ? d : assignGroupKeys(d, keys))));
  };

  const keyFn = flat ? keys => compositeKey(keys.map(d => d[1])) : keys => keys[keys.length - 1][1];
  return {
    groupFn,
    keyFn
  };
}

function exportLevels(grouped, options) {
  const {
    groupFn,
    keyFn
  } = processFromGroupsOptions(options);
  let {
    mapEntry = identity$1
  } = options;
  const {
    levels = ["entries"]
  } = options;
  const levelSpecs = [];

  for (const levelOption of levels) {
    switch (levelOption) {
      case "entries":
      case "entries-object":
      case "entries-obj":
      case "entriesObject":
        {
          const levelMapEntry = (levelOption === "entries-object" || levelOption === "entries-obj" || levelOption === "entriesObject") && options.mapEntry == null ? ([key, values]) => ({
            key,
            values
          }) : mapEntry;
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

      default:
        {
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

function n(options) {
  if (options == null ? void 0 : options.predicate) {
    const predicate = options.predicate;
    return items => items.reduce((n2, d, i) => predicate(d, i, items) ? n2 + 1 : n2, 0);
  }

  return items => items.length;
}

function sum$1(key, options) {
  let keyFn = typeof key === "function" ? key : d => d[key];

  if (options == null ? void 0 : options.predicate) {
    const originalKeyFn = keyFn;
    const predicate = options.predicate;

    keyFn = (d, index, array) => predicate(d, index, array) ? originalKeyFn(d, index, array) : 0;
  }

  return items => fsum(items, keyFn);
}

function tally(options) {
  const _tally = items => {
    const {
      name = "n",
      wt
    } = options != null ? options : {};
    const summarized = summarize({
      [name]: wt == null ? n() : sum$1(wt)
    })(items);
    return summarized;
  };

  return _tally;
}

function count$1(groupKeys, options) {
  const _count = items => {
    options = options != null ? options : {};
    const {
      name = "n",
      sort
    } = options;
    const results = tidy(items, groupBy(groupKeys, [tally(options)]), sort ? arrange(desc(name)) : identity$1);
    return results;
  };

  return _count;
}

function rename(renameSpec) {
  const _rename = items => {
    return items.map(d => {
      var _a;

      const mapped = {};
      const keys = Object.keys(d);

      for (const key of keys) {
        const newKey = (_a = renameSpec[key]) != null ? _a : key;
        mapped[newKey] = d[key];
      }

      return mapped;
    });
  };

  return _rename;
}

function slice$1(start, end) {
  const _slice = items => items.slice(start, end);

  return _slice;
}

const sliceHead = n => slice$1(0, n);

const sliceTail = n => slice$1(-n);

function sliceMin(n, orderBy) {
  const _sliceMin = items => arrange(orderBy)(items).slice(0, n);

  return _sliceMin;
}

function sliceMax(n, orderBy) {
  const _sliceMax = items => typeof orderBy === "function" ? arrange(orderBy)(items).slice(-n).reverse() : arrange(desc(orderBy))(items).slice(0, n);

  return _sliceMax;
}

function sliceSample(n, options) {
  options = options != null ? options : {};
  const {
    replace
  } = options;

  const _sliceSample = items => {
    if (!items.length) return items.slice();

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

function mutateWithSummary(mutateSpec) {
  const _mutate = items => {
    const mutatedItems = items.map(d => _extends({}, d));

    for (const key in mutateSpec) {
      const mutateSpecValue = mutateSpec[key];
      const mutatedResult = typeof mutateSpecValue === "function" ? mutateSpecValue(mutatedItems) : mutateSpecValue;
      const mutatedVector = (mutatedResult == null ? void 0 : mutatedResult[Symbol.iterator]) && typeof mutatedResult !== "string" ? mutatedResult : items.map(() => mutatedResult);
      let i = -1;

      for (const mutatedItem of mutatedItems) {
        mutatedItem[key] = mutatedVector[++i];
      }
    }

    return mutatedItems;
  };

  return _mutate;
}

function keysFromItems(items) {
  if (items.length < 1) return [];
  const keys = Object.keys(items[0]);
  return keys;
}

function everything() {
  return items => {
    const keys = keysFromItems(items);
    return keys;
  };
}

function processSelectors(items, selectKeys) {
  let processedSelectKeys = [];

  for (const keyInput of singleOrArray(selectKeys)) {
    if (typeof keyInput === "function") {
      processedSelectKeys.push(...keyInput(items));
    } else {
      processedSelectKeys.push(keyInput);
    }
  }

  if (processedSelectKeys.length && processedSelectKeys[0][0] === "-") {
    processedSelectKeys = [...everything()(items), ...processedSelectKeys];
  }

  const negationMap = {};
  const keysWithoutNegations = [];

  for (let k = processedSelectKeys.length - 1; k >= 0; k--) {
    const key = processedSelectKeys[k];

    if (key[0] === "-") {
      negationMap[key.substring(1)] = true;
      continue;
    }

    if (negationMap[key]) {
      negationMap[key] = false;
      continue;
    }

    keysWithoutNegations.unshift(key);
  }

  processedSelectKeys = Array.from(new Set(keysWithoutNegations));
  return processedSelectKeys;
}

function select(selectKeys) {
  const _select = items => {
    let processedSelectKeys = processSelectors(items, selectKeys);
    if (!processedSelectKeys.length) return items;
    return items.map(d => {
      const mapped = {};

      for (const key of processedSelectKeys) {
        mapped[key] = d[key];
      }

      return mapped;
    });
  };

  return _select;
}

function replaceNully(replaceSpec) {
  const _replaceNully = items => {
    const replacedItems = [];

    for (const d of items) {
      const obj = _extends({}, d);

      for (const key in replaceSpec) {
        if (obj[key] == null) {
          obj[key] = replaceSpec[key];
        }
      }

      replacedItems.push(obj);
    }

    return replacedItems;
  };

  return _replaceNully;
}

function fill(keys) {
  const _fill = items => {
    const keysArray = singleOrArray(keys);
    const replaceMap = {};
    return items.map(d => {
      const obj = _extends({}, d);

      for (const key of keysArray) {
        if (obj[key] != null) {
          replaceMap[key] = obj[key];
        } else if (replaceMap[key] != null) {
          obj[key] = replaceMap[key];
        }
      }

      return obj;
    });
  };

  return _fill;
}

function mean$2(items, accessor) {
  let n = 0;

  for (let i = 0; i < items.length; ++i) {
    const value = accessor(items[i], i, items);

    if (+value === value) {
      n += 1;
    }
  }

  return n ? fsum(items, accessor) / n : void 0;
}

function roll(width, rollFn, options) {
  const {
    partial = false,
    align = "right"
  } = options != null ? options : {};
  const halfWidth = Math.floor(width / 2);
  return items => {
    return items.map((_, i) => {
      const endIndex = align === "right" ? i : align === "center" ? i + halfWidth : i + width - 1;

      if (!partial && (endIndex - width + 1 < 0 || endIndex >= items.length)) {
        return void 0;
      }

      const startIndex = Math.max(0, endIndex - width + 1);
      const itemsInWindow = items.slice(startIndex, endIndex + 1);
      return rollFn(itemsInWindow, endIndex);
    });
  };
}

function min(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return items => min$1(items, keyFn);
}

function max(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return items => max$1(items, keyFn);
}

function mean$1(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return items => mean$2(items, keyFn);
}

function median(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return items => median$1(items, keyFn);
}

function deviation(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return items => deviation$1(items, keyFn);
}

function variance(key) {
  const keyFn = typeof key === "function" ? key : d => d[key];
  return items => variance$1(items, keyFn);
}

function ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

function bisector(f) {
  let compare1, compare2, delta; // If an accessor is specified, promote it to a comparator. In this case we
  // can test whether the search value is (self-) comparable. We can’t do this
  // for a comparator (except for specific, known comparators) because we can’t
  // tell if the comparator is symmetric, and an asymmetric comparator can’t be
  // used to test whether a single value is comparable.

  if (f.length !== 2) {
    compare1 = ascending;

    compare2 = (d, x) => ascending(f(d), x);

    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }

  function left(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;

      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) < 0) lo = mid + 1;else hi = mid;
      } while (lo < hi);
    }

    return lo;
  }

  function right(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;

      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) <= 0) lo = mid + 1;else hi = mid;
      } while (lo < hi);
    }

    return lo;
  }

  function center(a, x, lo = 0, hi = a.length) {
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }

  return {
    left,
    center,
    right
  };
}

function zero() {
  return 0;
}

function number(x) {
  return x === null ? NaN : +x;
}

const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
bisector(number).center;
var bisect = bisectRight;

function count(values, valueof) {
  let count = 0;

  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count;
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count;
      }
    }
  }

  return count;
}

function extent(values, valueof) {
  let min;
  let max;

  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }

  return [min, max];
}

function identity(x) {
  return x;
}

var array = Array.prototype;
var slice = array.slice;

function constant(x) {
  return () => x;
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);
function ticks(start, stop, count) {
  var reverse,
      i = -1,
      n,
      ticks,
      step;
  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    let r0 = Math.round(start / step),
        r1 = Math.round(stop / step);
    if (r0 * step < start) ++r0;
    if (r1 * step > stop) --r1;
    ticks = new Array(n = r1 - r0 + 1);

    while (++i < n) ticks[i] = (r0 + i) * step;
  } else {
    step = -step;
    let r0 = Math.round(start * step),
        r1 = Math.round(stop * step);
    if (r0 / step < start) ++r0;
    if (r1 / step > stop) --r1;
    ticks = new Array(n = r1 - r0 + 1);

    while (++i < n) ticks[i] = (r0 + i) / step;
  }

  if (reverse) ticks.reverse();
  return ticks;
}
function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
  return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function nice(start, stop, count) {
  let prestep;

  while (true) {
    const step = tickIncrement(start, stop, count);

    if (step === prestep || step === 0 || !isFinite(step)) {
      return [start, stop];
    } else if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    }

    prestep = step;
  }
}

function thresholdSturges(values) {
  return Math.ceil(Math.log(count(values)) / Math.LN2) + 1;
}

function bin() {
  var value = identity,
      domain = extent,
      threshold = thresholdSturges;

  function histogram(data) {
    if (!Array.isArray(data)) data = Array.from(data);
    var i,
        n = data.length,
        x,
        step,
        values = new Array(n);

    for (i = 0; i < n; ++i) {
      values[i] = value(data[i], i, data);
    }

    var xz = domain(values),
        x0 = xz[0],
        x1 = xz[1],
        tz = threshold(values, x0, x1); // Convert number of thresholds into uniform thresholds, and nice the
    // default domain accordingly.

    if (!Array.isArray(tz)) {
      const max = x1,
            tn = +tz;
      if (domain === extent) [x0, x1] = nice(x0, x1, tn);
      tz = ticks(x0, x1, tn); // If the domain is aligned with the first tick (which it will by
      // default), then we can use quantization rather than bisection to bin
      // values, which is substantially faster.

      if (tz[0] <= x0) step = tickIncrement(x0, x1, tn); // If the last threshold is coincident with the domain’s upper bound, the
      // last bin will be zero-width. If the default domain is used, and this
      // last threshold is coincident with the maximum input value, we can
      // extend the niced upper bound by one tick to ensure uniform bin widths;
      // otherwise, we simply remove the last threshold. Note that we don’t
      // coerce values or the domain to numbers, and thus must be careful to
      // compare order (>=) rather than strict equality (===)!

      if (tz[tz.length - 1] >= x1) {
        if (max >= x1 && domain === extent) {
          const _step = tickIncrement(x0, x1, tn);

          if (isFinite(_step)) {
            if (_step > 0) {
              x1 = (Math.floor(x1 / _step) + 1) * _step;
            } else if (_step < 0) {
              x1 = (Math.ceil(x1 * -_step) + 1) / -_step;
            }
          }
        } else {
          tz.pop();
        }
      }
    } // Remove any thresholds outside the domain.
    // Be careful not to mutate an array owned by the user!


    var m = tz.length,
        a = 0,
        b = m;

    while (tz[a] <= x0) ++a;

    while (tz[b - 1] > x1) --b;

    if (a || b < m) tz = tz.slice(a, b), m = b - a;
    var bins = new Array(m + 1),
        bin; // Initialize bins.

    for (i = 0; i <= m; ++i) {
      bin = bins[i] = [];
      bin.x0 = i > 0 ? tz[i - 1] : x0;
      bin.x1 = i < m ? tz[i] : x1;
    } // Assign data to bins by value, ignoring any outside the domain.


    if (isFinite(step)) {
      if (step > 0) {
        for (i = 0; i < n; ++i) {
          if ((x = values[i]) != null && x0 <= x && x <= x1) {
            bins[Math.min(m, Math.floor((x - x0) / step))].push(data[i]);
          }
        }
      } else if (step < 0) {
        for (i = 0; i < n; ++i) {
          if ((x = values[i]) != null && x0 <= x && x <= x1) {
            const j = Math.floor((x0 - x) * step);
            bins[Math.min(m, j + (tz[j] <= x))].push(data[i]); // handle off-by-one due to rounding
          }
        }
      }
    } else {
      for (i = 0; i < n; ++i) {
        if ((x = values[i]) != null && x0 <= x && x <= x1) {
          bins[bisect(tz, x, 0, m)].push(data[i]);
        }
      }
    }

    return bins;
  }

  histogram.value = function (_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
  };

  histogram.domain = function (_) {
    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
  };

  histogram.thresholds = function (_) {
    return arguments.length ? (threshold = typeof _ === "function" ? _ : constant(Array.isArray(_) ? slice.call(_) : _), histogram) : threshold;
  };

  return histogram;
}

/**
 * [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
 * is a simple way to find a fitted line
 * between a set of coordinates. This algorithm finds the slope and y-intercept of a regression line
 * using the least sum of squares.
 *
 * @param {Array<Array<number>>} data an array of two-element of arrays,
 * like `[[0, 1], [2, 3]]`
 * @returns {Object} object containing slope and intersect of regression line
 * @example
 * linearRegression([[0, 0], [1, 1]]); // => { m: 1, b: 0 }
 */
function linearRegression(data) {
  var m, b; // Store data length in a local variable to reduce
  // repeated object property lookups

  var dataLength = data.length; //if there's only one point, arbitrarily choose a slope of 0
  //and a y-intercept of whatever the y of the initial point is

  if (dataLength === 1) {
    m = 0;
    b = data[0][1];
  } else {
    // Initialize our sums and scope the `m` and `b`
    // variables that define the line.
    var sumX = 0,
        sumY = 0,
        sumXX = 0,
        sumXY = 0; // Use local variables to grab point values
    // with minimal object property lookups

    var point, x, y; // Gather the sum of all x values, the sum of all
    // y values, and the sum of x^2 and (x*y) for each
    // value.
    //
    // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy

    for (var i = 0; i < dataLength; i++) {
      point = data[i];
      x = point[0];
      y = point[1];
      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumXY += x * y;
    } // `m` is the slope of the regression line


    m = (dataLength * sumXY - sumX * sumY) / (dataLength * sumXX - sumX * sumX); // `b` is the y-intercept of the line.

    b = sumY / dataLength - m * sumX / dataLength;
  } // Return both values as an object.


  return {
    m: m,
    b: b
  };
}
/**
 * Our default sum is the [Kahan-Babuska algorithm](https://pdfs.semanticscholar.org/1760/7d467cda1d0277ad272deb2113533131dc09.pdf).
 * This method is an improvement over the classical
 * [Kahan summation algorithm](https://en.wikipedia.org/wiki/Kahan_summation_algorithm).
 * It aims at computing the sum of a list of numbers while correcting for
 * floating-point errors. Traditionally, sums are calculated as many
 * successive additions, each one with its own floating-point roundoff. These
 * losses in precision add up as the number of numbers increases. This alternative
 * algorithm is more accurate than the simple way of calculating sums by simple
 * addition.
 *
 * This runs in `O(n)`, linear time, with respect to the length of the array.
 *
 * @param {Array<number>} x input
 * @return {number} sum of all input numbers
 * @example
 * sum([1, 2, 3]); // => 6
 */


function sum(x) {
  // If the array is empty, we needn't bother computing its sum
  if (x.length === 0) {
    return 0;
  } // Initializing the sum as the first number in the array


  var sum = x[0]; // Keeping track of the floating-point error correction

  var correction = 0;
  var transition;

  if (typeof sum !== "number") {
    return NaN;
  }

  for (var i = 1; i < x.length; i++) {
    if (typeof x[i] !== "number") {
      return NaN;
    }

    transition = sum + x[i]; // Here we need to update the correction in a different fashion
    // if the new absolute value is greater than the absolute sum

    if (Math.abs(sum) >= Math.abs(x[i])) {
      correction += sum - transition + x[i];
    } else {
      correction += x[i] - transition + sum;
    }

    sum = transition;
  } // Returning the corrected sum


  return sum + correction;
}
/**
 * The mean, _also known as average_,
 * is the sum of all values over the number of values.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs in `O(n)`, linear time, with respect to the length of the array.
 *
 * @param {Array<number>} x sample of one or more data points
 * @throws {Error} if the length of x is less than one
 * @returns {number} mean
 * @example
 * mean([0, 10]); // => 5
 */


function mean(x) {
  if (x.length === 0) {
    throw new Error("mean requires at least one data point");
  }

  return sum(x) / x.length;
}
/**
 * The sum of deviations to the Nth power.
 * When n=2 it's the sum of squared deviations.
 * When n=3 it's the sum of cubed deviations.
 *
 * @param {Array<number>} x
 * @param {number} n power
 * @returns {number} sum of nth power deviations
 *
 * @example
 * var input = [1, 2, 3];
 * // since the variance of a set is the mean squared
 * // deviations, we can calculate that with sumNthPowerDeviations:
 * sumNthPowerDeviations(input, 2) / input.length;
 */


function sumNthPowerDeviations(x, n) {
  var meanValue = mean(x);
  var sum = 0;
  var tempValue;
  var i; // This is an optimization: when n is 2 (we're computing a number squared),
  // multiplying the number by itself is significantly faster than using
  // the Math.pow method.

  if (n === 2) {
    for (i = 0; i < x.length; i++) {
      tempValue = x[i] - meanValue;
      sum += tempValue * tempValue;
    }
  } else {
    for (i = 0; i < x.length; i++) {
      sum += Math.pow(x[i] - meanValue, n);
    }
  }

  return sum;
}
/**
 * [Sample covariance](https://en.wikipedia.org/wiki/Sample_mean_and_covariance) of two datasets:
 * how much do the two datasets move together?
 * x and y are two datasets, represented as arrays of numbers.
 *
 * @param {Array<number>} x a sample of two or more data points
 * @param {Array<number>} y a sample of two or more data points
 * @throws {Error} if x and y do not have equal lengths
 * @throws {Error} if x or y have length of one or less
 * @returns {number} sample covariance
 * @example
 * sampleCovariance([1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]); // => -3.5
 */


function sampleCovariance(x, y) {
  // The two datasets must have the same length which must be more than 1
  if (x.length !== y.length) {
    throw new Error("sampleCovariance requires samples with equal lengths");
  }

  if (x.length < 2) {
    throw new Error("sampleCovariance requires at least two data points in each sample");
  } // determine the mean of each dataset so that we can judge each
  // value of the dataset fairly as the difference from the mean. this
  // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
  // does not suffer because of the difference in absolute values


  var xmean = mean(x);
  var ymean = mean(y);
  var sum = 0; // for each pair of values, the covariance increases when their
  // difference from the mean is associated - if both are well above
  // or if both are well below
  // the mean, the covariance increases significantly.

  for (var i = 0; i < x.length; i++) {
    sum += (x[i] - xmean) * (y[i] - ymean);
  } // this is Bessels' Correction: an adjustment made to sample statistics
  // that allows for the reduced degree of freedom entailed in calculating
  // values from samples rather than complete populations.


  var besselsCorrection = x.length - 1; // the covariance is weighted by the length of the datasets.

  return sum / besselsCorrection;
}
/**
 * The [sample variance](https://en.wikipedia.org/wiki/Variance#Sample_variance)
 * is the sum of squared deviations from the mean. The sample variance
 * is distinguished from the variance by the usage of [Bessel's Correction](https://en.wikipedia.org/wiki/Bessel's_correction):
 * instead of dividing the sum of squared deviations by the length of the input,
 * it is divided by the length minus one. This corrects the bias in estimating
 * a value from a set that you don't know if full.
 *
 * References:
 * * [Wolfram MathWorld on Sample Variance](http://mathworld.wolfram.com/SampleVariance.html)
 *
 * @param {Array<number>} x a sample of two or more data points
 * @throws {Error} if the length of x is less than 2
 * @return {number} sample variance
 * @example
 * sampleVariance([1, 2, 3, 4, 5]); // => 2.5
 */


function sampleVariance(x) {
  if (x.length < 2) {
    throw new Error("sampleVariance requires at least two data points");
  }

  var sumSquaredDeviationsValue = sumNthPowerDeviations(x, 2); // this is Bessels' Correction: an adjustment made to sample statistics
  // that allows for the reduced degree of freedom entailed in calculating
  // values from samples rather than complete populations.

  var besselsCorrection = x.length - 1; // Find the mean value of that list

  return sumSquaredDeviationsValue / besselsCorrection;
}
/**
 * The [sample standard deviation](http://en.wikipedia.org/wiki/Standard_deviation#Sample_standard_deviation)
 * is the square root of the sample variance.
 *
 * @param {Array<number>} x input array
 * @returns {number} sample standard deviation
 * @example
 * sampleStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]).toFixed(2);
 * // => '2.14'
 */


function sampleStandardDeviation(x) {
  var sampleVarianceX = sampleVariance(x);
  return Math.sqrt(sampleVarianceX);
}
/**
 * The [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence) is
 * a measure of how correlated two datasets are, between -1 and 1
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample correlation
 * @example
 * sampleCorrelation([1, 2, 3, 4, 5, 6], [2, 2, 3, 4, 5, 60]).toFixed(2);
 * // => '0.69'
 */


function sampleCorrelation(x, y) {
  var cov = sampleCovariance(x, y);
  var xstd = sampleStandardDeviation(x);
  var ystd = sampleStandardDeviation(y);
  return cov / xstd / ystd;
}

const _excluded = ["id", "worker", "data", "previousData"];
const summarizers = {
  mean: mean$1,
  median,
  min,
  max,
  sum: sum$1,
  deviation,
  variance
}; // eslint-disable-next-line @typescript-eslint/no-explicit-any

const handlers = {
  arrange: props => {
    const {
      column,
      descending,
      data
    } = props;
    return tidy(data, arrange(descending ? desc(column) : column));
  },
  select: props => {
    const {
      columns,
      data
    } = props;
    if (!(columns != null && columns.length)) return data;else return tidy(data, select(columns.map(column => `${column}`)));
  },
  drop: props => {
    const {
      columns,
      data
    } = props;
    if (!(columns != null && columns.length)) return data;else return tidy(data, select(columns.map(column => `-${column}`)));
  },
  distinct: props => {
    const {
      columns,
      data
    } = props;
    const res = tidy(data, distinct(columns != null && columns.length ? columns : null));
    return res;
  },
  filter_string: props => {
    const {
      column,
      logic,
      rhs,
      data
    } = props;
    if (!column || rhs === undefined) return data;

    switch (logic) {
      case "gt":
        return tidy(data, filter(d => d[column] > rhs));

      case "lt":
        return tidy(data, filter(d => d[column] < rhs));

      case "ge":
        return tidy(data, filter(d => d[column] >= rhs));

      case "le":
        return tidy(data, filter(d => d[column] <= rhs));

      case "eq":
        return tidy(data, filter(d => d[column] == rhs));

      case "ne":
        return tidy(data, filter(d => d[column] != rhs));

      default:
        return data;
    }
  },
  filter_columns: props => {
    const {
      columns,
      logic,
      data
    } = props;
    const [left, right] = columns;
    if (!left || !right) return data;

    switch (logic) {
      case "gt":
        return tidy(data, filter(d => d[columns[0]] > d[columns[1]]));

      case "lt":
        return tidy(data, filter(d => d[columns[0]] < d[columns[1]]));

      case "ge":
        return tidy(data, filter(d => d[columns[0]] >= d[columns[1]]));

      case "le":
        return tidy(data, filter(d => d[columns[0]] <= d[columns[1]]));

      case "eq":
        return tidy(data, filter(d => d[columns[0]] === d[columns[1]]));

      case "ne":
        return tidy(data, filter(d => d[columns[0]] !== d[columns[1]]));

      default:
        return data;
    }
  },
  mutate_columns: props => {
    const {
      newcolumn,
      lhs,
      rhs,
      logic,
      data
    } = props;
    if (!newcolumn || !lhs || !rhs || !logic) return data;
    const calc = {};

    switch (logic) {
      case "plus":
        calc[newcolumn] = d => d[lhs] + d[rhs];

        return tidy(data, mutate(calc));

      case "minus":
        calc[newcolumn] = d => d[lhs] - d[rhs];

        return tidy(data, mutate(calc));

      case "mult":
        calc[newcolumn] = d => d[lhs] * d[rhs];

        return tidy(data, mutate(calc));

      case "div":
        calc[newcolumn] = d => d[lhs] / d[rhs];

        return tidy(data, mutate(calc));

      case "gt":
        calc[newcolumn] = d => d[lhs] > d[rhs];

        return tidy(data, mutate(calc));

      case "lt":
        calc[newcolumn] = d => d[lhs] < d[rhs];

        return tidy(data, mutate(calc));

      case "ge":
        calc[newcolumn] = d => d[lhs] >= d[rhs];

        return tidy(data, mutate(calc));

      case "le":
        calc[newcolumn] = d => d[lhs] <= d[rhs];

        return tidy(data, mutate(calc));

      case "eq":
        calc[newcolumn] = d => d[lhs] == d[rhs];

        return tidy(data, mutate(calc));

      case "ne":
        calc[newcolumn] = d => d[lhs] != d[rhs];

        return tidy(data, mutate(calc));

      default:
        return data;
    }
  },
  mutate_number: props => {
    const {
      newcolumn,
      lhs,
      rhs,
      logic,
      data
    } = props;
    if (newcolumn === undefined || !lhs || rhs === undefined || !logic) return data;
    const calc = {};

    switch (logic) {
      case "plus":
        calc[newcolumn] = d => d[lhs] + rhs;

        return tidy(data, mutate(calc));

      case "minus":
        calc[newcolumn] = d => d[lhs] - rhs;

        return tidy(data, mutate(calc));

      case "mult":
        calc[newcolumn] = d => d[lhs] * rhs;

        return tidy(data, mutate(calc));

      case "div":
        calc[newcolumn] = d => d[lhs] / rhs;

        return tidy(data, mutate(calc));

      case "gt":
        calc[newcolumn] = d => d[lhs] > rhs;

        return tidy(data, mutate(calc));

      case "lt":
        calc[newcolumn] = d => d[lhs] < rhs;

        return tidy(data, mutate(calc));

      case "ge":
        calc[newcolumn] = d => d[lhs] >= rhs;

        return tidy(data, mutate(calc));

      case "le":
        calc[newcolumn] = d => d[lhs] <= rhs;

        return tidy(data, mutate(calc));

      case "eq":
        calc[newcolumn] = d => d[lhs] == rhs;

        return tidy(data, mutate(calc));

      case "ne":
        calc[newcolumn] = d => d[lhs] != rhs;

        return tidy(data, mutate(calc));

      default:
        return data;
    }
  },
  summarize: props => {
    const {
      columns,
      calc,
      data
    } = props;
    if (!(columns != null && columns.length) || !calc) return data;
    const summarizer = summarizers[calc];
    if (!summarizer) return data; // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const items = {};
    columns.forEach(column => items[column] = summarizer(column));
    return tidy(data, summarize(items));
  },
  summarize_by_group: props => {
    const {
      column,
      by,
      calc,
      data
    } = props;
    if (!column || !by || !calc) return data;
    const summarizer = summarizers[calc];
    if (!summarizer) return data;
    const items = {};
    items[column] = summarizer(column);
    const res = tidy(data, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupBy(by, [summarize(items)]));
    console.debug(`summarize by group`, {
      res
    });
    return res;
  },
  count: props => {
    const {
      column,
      data
    } = props;
    if (!column) return data; // eslint-disable-next-line @typescript-eslint/no-explicit-any

    return tidy(data, count$1(column, {
      name: "count"
    }));
  },
  record_window: props => {
    var _previousData;

    const {
      data,
      previousData,
      horizon
    } = props;
    if (!(data != null && data.length)) return data;
    const now = data[data.length - 1].time;
    const previousNow = previousData == null ? void 0 : (_previousData = previousData[(previousData == null ? void 0 : previousData.length) - 1]) == null ? void 0 : _previousData.time;
    if (now === undefined || previousNow === undefined) return data.filter(r => now - r.time < horizon);
    return [...previousData.filter(r => now - r.time < horizon), ...data.filter(r => now - r.time < horizon && r.time > previousNow)];
  },
  bin: props => {
    const {
      data,
      column
    } = props;
    const binner = bin().value(d => d[column]);
    const binned = binner(data); // convert back to objects

    return binned.map(b => ({
      count: b.length,
      x0: b.x0,
      x1: b.x1
    }));
  },
  correlation: props => {
    const {
      data,
      columns
    } = props;
    columns.sort();
    const res = columns.map((row, r) => ({
      row,
      r,
      drow: data.map(obj => obj[row])
    })).map(({
      row,
      r,
      drow
    }) => columns.map((column, c) => r <= c ? {
      row,
      column,
      correlation: sampleCorrelation(drow, data.map(obj => obj[column]))
    } : undefined)).flat().filter(o => !!o);
    return res;
  },
  linear_regression: props => {
    const {
      data,
      column1,
      column2
    } = props;
    if (!column1 || !column2) return data;
    const x = data.map(obj => obj[column1]);
    const y = data.map(obj => obj[column2]);
    const linregmb = linearRegression([x, y]);
    return [{
      slope: linregmb.m.toFixed(3),
      intercept: linregmb.b.toFixed(3)
    }];
  },
  replace_nully: props => {
    const {
      data,
      replacements
    } = props;
    const res = tidy(data, replaceNully(replacements));
    return res;
  },
  fill_nully: props => {
    const {
      data,
      replacements
    } = props;
    let res = data.slice(0);
    const downs = Object.keys(replacements).filter(column => replacements[column] === "down");
    const ups = Object.keys(replacements).filter(column => replacements[column] === "up");
    if (downs.length) res = tidy(data, fill(downs));
    if (ups.length) res = tidy(res.reverse(), fill(downs)).reverse();
    return res;
  },
  rename: props => {
    const {
      data,
      names
    } = props;
    const res = tidy(data, rename(names));
    return res;
  },
  slice: props => {
    const {
      data
    } = props;
    let index = 0;
    const tidied = data ? tidy(data, props.sliceHead ? sliceHead(props.sliceHead) : undefined, props.sliceTail ? sliceTail(props.sliceTail) : undefined, props.sliceSample ? sliceSample(props.sliceSample) : undefined, props.sliceMin ? sliceMin(props.sliceMin, props.sliceColumn) : undefined, props.sliceMax ? sliceMax(props.sliceMax, props.sliceColumn) : undefined, mutate({
      index: () => index++
    })) : [];
    return tidied;
  },
  rolling_summary: props => {
    const {
      data,
      horizon,
      column,
      newcolumn,
      calc
    } = props;
    const summarizer = summarizers[calc];
    if (!calc) return null;
    const res = tidy(data, mutateWithSummary({
      [newcolumn]: roll(horizon, summarizer(column), {
        partial: true
      })
    })); // deviation/variance always generate undefined

    if (calc === "deviation" || calc === "variance") res.shift();
    return res;
  }
};

function transformData(message) {
  try {
    const handler = handlers[message.type];
    return handler == null ? void 0 : handler(message);
  } catch (e) {
    console.debug(e);
    return undefined;
  }
}

async function handleMessage(event) {
  const message = event.data; // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const {
    id,
    worker
  } = message,
        rest = _objectWithoutPropertiesLoose(message, _excluded);

  if (worker !== "data") return;

  try {
    const newData = await transformData(message);

    const resp = _extends({
      id,
      worker
    }, rest, {
      data: newData
    });

    self.postMessage(resp);
  } catch (e) {
    self.postMessage({
      id,
      worker,
      error: e + ""
    });
  }
}

self.addEventListener("message", handleMessage);
console.debug(`data: worker registered`);
//# sourceMappingURL=data-worker.js.map

/******/ })()
;
//# sourceMappingURL=784-67853104029be21840b8.js.map