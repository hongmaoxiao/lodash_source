var nativeMax = Math.max;

var MAX_SAFE_INTEGER = Number.M

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

