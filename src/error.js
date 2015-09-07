import Metal from './metal';
import _ from 'underscore';
import Class from './class';

/**
 * @private
 * @const {String[]}
 */
const ERROR_PROPS = [
  'description', 'fileName', 'lineNumber', 'name', 'message', 'number'
];

/**
 * A subclass of the JavaScript Error.
 *
 * ```js
 * throw new Metal.Error('Oh you\'ve really done it now...');
 * // Uncaught Metal.Error: Oh you've really done it now...
 * //   [stack trace]
 * ```
 *
 * @class Error
 * @memberOf Metal
 * @extends Error
 * @uses Metal.Class
 */
const Err = Metal.Error = Class.extend.call(Error, {

  /**
   * @public
   * @constructs Error
   * @param {String} [message] - A description of the error.
   * @param {Object} [options] - Settings for the error.
   * @param {String} [options.message] - A description of the error.
   */
  constructor(message, options = {}) {
    // If options are provided in place of a message, assume message exists on
    // options.
    if (_.isObject(message)) {
      options = message;
      message = options.message;
    }

    // Create a fake error with message in order to capture a stack trace.
    let error = Error.call(this, message);

    // Copy over all the error-related properties.
    _.extend(this, _.pick(error, ERROR_PROPS), _.pick(options, ERROR_PROPS));

    // Adds a `stack` property to the given error object that will yield the
    // stack trace at the time captureStackTrace was called.
    // When collecting the stack trace all frames above the topmost call
    // to this function, including that call, will be left out of the
    // stack trace.
    // This is useful because we can hide Metal implementation details
    // that are not very helpful for the user.
    Err.captureStackTrace(this, Err);
  },

  /**
   * Formats the error message to display in the console.
   *
   * @public
   * @method toString
   * @returns {String} - Formatted error message.
   */
  toString() {
    return `${this.name}: ${this.message}`;
  }
}, {

  /**
   * A safe reference to V8's `Error.captureStackTrace`.
   *
   * @public
   * @method captureStackTrace
   */
  captureStackTrace(target, method) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(target, method);
    }
  }
});

/**
 * @class Error
 * @mixes Class
 */
_.extend(Err, Class);

export default Err;
