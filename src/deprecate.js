import _ from 'underscore';

/**
 * Display a deprecation warning with the provided message.
 *
 * @public
 * @method deprecate
 * @param {String|Object} message - A description of the deprecation.
 * @param {String} message.prev - The deprecated item.
 * @param {String} message.next - The replacement for the deprecated item.
 * @param {Boolean} [test] - An optional boolean. If falsy, the deprecation will be displayed.
 */
const deprecate = function deprecate(message, test) {

  // Returns if test is provided and is falsy.
  if (test !== undefined && test) {
    return;
  }

  // If message is provided as an object, format the object into a string.
  if (_.isObject(message)) {
    message = deprecate._format(message.prev, message.next);
  }

  // Ensure that message is a string
  message = message && message.toString();

  // If deprecation message has not already been warned, send the warning.
  if (!deprecate._cache[message]) {
    deprecate._warn(`Deprecation warning: ${message}`);
    deprecate._cache[message] = true;
  }
};

/**
 * Format a message for deprecate.
 *
 * @private
 * @method _format
 * @memberOf deprecate
 * @param {String} prev - The deprecated item.
 * @param {String} next - The replacement for the deprecated item.
 * @return {String} - The formatted message.
 */
deprecate._format = function _format(prev, next) {
  return `${prev} is going to be removed in the future. Please use ${next} instead.`;
};

/**
 * A safe reference to the console object that will fallback to an empty
 * object.
 *
 * @private
 * @property _console
 */
const _console = typeof console !== 'undefined' ? console : {};

/**
 * A safe reference to the console.warn method that will fallback a noop.
 *
 * @private
 * @property _warnMethod
 */
const _warnMethod = _console.warn || _console.log || function() {};

/**
 * A safe reference to `console.warn`.
 *
 * @private
 * @method _warn
 * @memberOf deprecate
 * @param {*...} - The values to warn in the console.
 */
deprecate._warn = function _warn() {
  return _warnMethod.apply(_console, arguments);
};

/**
 * An internal cache to avoid sending the same deprecation warning multiple
 * times.
 *
 * @private
 * @property _cache
 * @memberOf deprecate
 */
deprecate._cache = {};

export default deprecate;
