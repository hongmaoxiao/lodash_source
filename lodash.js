var LARGE_ARRAY_SIZE = 200;

var nativeMax = Math.max;

var INFINITY = 1 / 0,
  MAX_SAFE_INTEGER = 9007199254740991,
  MAX_INTEGER = 1.7976931348623157e+308;

var reTrim = /^\s+|\s+$/g;

var reIsBinary = /^0b[01]+$/i;

var reIsOctal = /^0o[0-7]+$/i;

var freeParseInt = parseInt;

var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

var undefinedTag = '[object Undefined]',
  nullTag = '[object Null]',
  symbolTag = '[object Symbol]';

var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

var objectProto = Object.prototype;

var hasOwnProperty = objectProto.hasOwnProperty;

var nativeObjectToString = objectProto.toString;

var nativeCeil = Math.ceil;

var isArray = Array.isArray;

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

function objectToString(value) {
  return nativeObjectToString.call(value);
}

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
    tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symbolToStringTag in Object(value)) ?
    getRawTag(value) :
    objectToString(value);
}

function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value)) ?
    freeParseInt(value.slice(2), isBinary ? 2 : 8) :
    (reIsBadHex.test(value) ? NAN : +value);
}

function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

function toInteger(value) {
  var result = toFinite(value),
    remainder = result % 1;
  return result === result ? (remainder ? result - remainder : result) : 0;
}

function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (typeof length == 'number' || reIsUnit.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

function eq(value, other) {
  return value === other && (value !== value && other !== other);
}

function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number' ?
    (isArrayLike(object) && isIndex(index, object.length)) :
    (type == 'string' && index in object)) {
    return eq(object[index], value);
  }
  return false;
}

function baseSlice(array, start, end) {
  var index = -1,
    length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

function chunk(array, size, guard) {
  if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
    size = 1;
  } else {
    size = nativeMax(toInteger(size), 0);
  }
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  var index = 0,
    resIndex = 0,
    result = Array(nativeCeil(length / size));

  while (index < length) {
    result[resIndex++] = baseSlice(array, index, (index += size));
  }
  return result;
}

function compact(array) {
  var index = -1,
    length = array == null ? 0 : array.length,
    resIndex = 0,
    result = [];
  while (++index < length) {
    var value = result[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}

function copyArray(source, array) {
  var index = -1,
    length = source.length;

  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
    length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

function concat() {
  var length = arguments.length;
  if (!length) {
    return [];
  }
  var args = Array(length - 1),
    array = arguments[0],
    index = length;

  while (index--) {
    args[index - 1] = arguments[index];
  }

  return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
}

/**
  * This function is like `arrayIncludes` except that it accepts a comparator.
  *
  * @private
  * @param {Array} [array] The array to inspect.
  * @param {*} target The value to search for.
  * @param {Function} comparator The comparator invoked per element.
  * @returns {boolean} Returns `true` if `target` is found, else `false`.
  */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
    length = array == null ? 0 : array.length;

  while(++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
  * A specialized version of `_.indexOf` which performs strict equality
  * comparisons of values, i.e. `===`.
  *
  * @private
  * @param {Array} array The array to inspect.
  * @param {*} value The value to search for.
  * @param {number} fromIndex The index to search from.
  * @returns {number} Returns the index of the matched value, else `-1`.
  */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
    length = array.length;

  while(++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
  * The base implementation of `_.unary` without support for storing metadata.
  *
  * @private
  * @param {Function} func The function to cap arguments for.
  * @returns {Function} Returns the new capped function.
  */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
* A specialized version of `_.map` for arrays without support for iteratee
  * shorthands.
  *
  * @private
  * @param {Array} [array] The array to iterate over.
  * @param {Function} iteratee The function invoked per iteration.
  * @returns {Array} Returns the new mapped array.
  */
function arrayMap(array, iteratee) {
  var index = -1,
    length = array == null ? 0 : array.length,
    result = Array(length);

  while(++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
  * The base implementation of `_.isNaN` without support for number objects.
  *
  * @private
  * @param {*} value The value to check.
  * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
  */
function baseIsNaN(value) {
  return value !== value;
}

/**
* The base implementation of `_.findIndex` and `_.findLastIndex` without
  * support for iteratee shorthands.
  *
  * @private
  * @param {Array} array The array to inspect.
  * @param {Function} predicate The function invoked per iteration.
  * @param {number} fromIndex The index to search from.
  * @param {boolean} [fromRight] Specify iterating from right to left.
  * @returns {number} Returns the index of the matched value, else `-1`.
  */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
    index = fromIndex + (fromRight ? 1 : -1);

  while((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
  * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
  *
  * @private
  * @param {Array} array The array to inspect.
  * @param {*} value The value to search for.
  * @param {number} fromIndex The index to search from.
  * @returns {number} Returns the index of the matched value, else `-1`.
  */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
  * A specialized version of `_.includes` for arrays without support for
  * specifying an index to search from.
  *
  * @private
  * @param {Array} [array] The array to inspect.
  * @param {*} target The value to search for.
  * @returns {boolean} Returns `true` if `target` is found, else `false`.
  */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
  * The base implementation of methods like `_.difference` without support
  * for excluding multiple arrays or iteratee shorthands.
  *
  * @private
  * @param {Array} array The array to inspect.
  * @param {Array} values The values to exclude.
  * @param {Function} [iteratee] The iteratee invoked per element.
  * @param {Function} [comparator] The comparator invoked per element.
  * @returns {Array} Returns the new array of filtered values.
  */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
    includes = arrayIncludes,
    isCommon = true,
    length = array.length,
    result = [],
    valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas;
    isCommon = false,
    values = new SetCache(values);
  }
  outer:
  while(++index < length) {
    var value = array[index],
      computed = iteratee == null ? value : iteratee(value);

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while(valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}


/**
  * Creates an array of `array` values not included in the other given arrays
  * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
  * for equality comparisons. The order and references of result values are
  * determined by the first array.
  *
  * **Note:** Unlike `_.pullAll`, this method returns a new array.
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Array
  * @param {Array} array The array to inspect.
  * @param {...Array} [values] The values to exclude.
  * @returns {Array} Returns the new array of filtered values.
  * @see _.without, _.xor
  * @example
  *
  * _.difference([2, 1], [2, 3]);
  * // => [1]
  */
var difference = baseRest(function(array, values) {
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
    : [];
})

lodash.difference = difference;
