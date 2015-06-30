(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone'), require('underscore')) : typeof define === 'function' && define.amd ? define(['backbone', 'underscore'], factory) : global.Metal = factory(global.Backbone, global._);
})(this, function (Backbone, _) {
  'use strict';

  var mixin__Mixin = function Mixin(protoProps) {
    // Add prototype properties (instance properties) to the class, if supplied.
    _.extend(this, protoProps);
  };

  /**
   * Checks if `value` is a Metal Mixin.
   *
   * ```js
   * Mixin.isMixin(new Mixin());
   * // >> true
   * Mixin.isMixin({});
   * // >> false
   * Mixin.isMixin(function() {...});
   * // >> false
   * Mixin.isMixin(new Class());
   * // >> false
   * ```
   *
   * @public
   * @method isMixin
   * @memberOf _
   * @param {*} value - The value to check.
   */
  mixin__Mixin.isMixin = function isMixin(value) {
    return !!value && value instanceof mixin__Mixin;
  };

  var mixin = mixin__Mixin;

  var Events = new mixin(Backbone.Events);

  var events = Events;

  function _wrap(method, superMethod) {
    return function () {
      var prevSuper = this._super;
      this._super = superMethod;
      var ret = method.apply(this, arguments);
      this._super = prevSuper;
      return ret;
    };
  }

  /**
   * A reference to safe regex for checking if a function calls `_super`.
   *
   * @private
   * @const {RegExp}
   */
  var CONTAINS_SUPER = /xyz/.test(function () {
    xyz;
  }) ? /\b_super\b/ : /.*/; // eslint-disable-line

  /**
   * Assigns properties of source object to destination object, wrapping methods
   * that call their super method.
   *
   * @private
   * @method wrapAll
   * @param {Object} dest - The destination object.
   * @param {Object} source - The source object.
   */
  function _wrapAll(dest, source) {
    var keys = _.keys(source),
        length = keys.length,
        i = undefined,
        name = undefined,
        method = undefined,
        superMethod = undefined,
        hasSuper = undefined;

    for (i = 0; i < length; i++) {
      name = keys[i];
      method = source[name];
      superMethod = dest[name];

      // Test if new method calls `_super`
      hasSuper = CONTAINS_SUPER.test(method);

      // Only wrap the new method if the original method was a function and the
      // new method calls `_super`.
      if (hasSuper && _.isFunction(method) && _.isFunction(superMethod)) {
        dest[name] = _wrap(method, superMethod);

        // Otherwise just add the new method or property to the object.
      } else {
        dest[name] = method;
      }
    }
  }

  /**
   * Creates a new Class.
   *
   * ```js
   * const MyClass = Class.extend({
   *   initialize() {
   *     console.log('Created!');
   *   }
   * });
   *
   * new MyClass();
   * // >> Created!
   * ```
   *
   * @public
   * @class Class
   * @memberOf Metal
   * @memberOf Backbone
   */
  var _class__Class = function Class() {
    this.cid = _.uniqueId(this.cidPrefix);
    this.initialize.apply(this, arguments);
  };

  _.extend(_class__Class.prototype, {

    /**
     * Identifier prefix of the cid. It can be override.
     *
     * @public
     * @attributeOf Class {String}
     */
    cidPrefix: 'metal',

    /**
     * An overridable method called when objects are instantiated. Does not do
     * anything by default.
     *
     * @public
     * @abstract
     * @method initialize
     */
    initialize: function initialize() {},

    /**
     * Destroy a Class by removing all listeners.
     *
     * @public
     * @method destroy
     */
    destroy: function destroy() {
      this.stopListening();
    }
  });

  _.extend(_class__Class, {

    /**
     * Creates a new subclass.
     *
     * ```js
     * const MyClass = Class.extend({
     *   // ...
     * });
     *
     * const myClass = new MyClass();
     * myClass instanceof MyClass
     * // true
     * myClass instanceof Class
     * // true
     * ```
     *
     * @public
     * @static
     * @method extend
     * @param {Object} [protoProps] - The properties to be added to the prototype.
     * @param {Object} [staticProps] - The properties to be added to the constructor.
     */
    extend: function extend(protoProps, staticProps) {
      var Parent = this;
      var Child = undefined;

      // The constructor function for the new subclass is either defined by you
      // (the "constructor" property in your `extend` definition), or defaulted
      // by us to simply call the parent's constructor.
      if (!protoProps || !_.has(protoProps, 'constructor')) {
        Child = function () {
          Parent.apply(this, arguments);
        };
      } else if (CONTAINS_SUPER.test(protoProps.constructor)) {
        Child = _wrap(protoProps.constructor, Parent.prototype.constructor);
      } else {
        Child = protoProps.constructor;
      }

      // Add static properties to the constructor function, if supplied.
      _.extend(Child, Parent);
      if (staticProps) {
        _wrapAll(Child, staticProps);
      }

      // Set the prototype chain to inherit from `parent`, without calling
      // `parent`'s constructor function.
      var Surrogate = function Surrogate() {
        this.constructor = Child;
      };

      Surrogate.prototype = Parent.prototype;
      Child.prototype = new Surrogate();

      // Add prototype properties (instance properties) to the subclass,
      // if supplied.
      if (protoProps) {
        _wrapAll(Child.prototype, protoProps);
      }

      // Set a convenience property in case the parent class is needed later.
      Child.superclass = Parent;

      // Set a convenience property in case the parent's prototype is needed
      // later.
      Child.__super__ = Parent.prototype;

      return Child;
    },

    /**
     * Mixes properties onto the class's prototype.
     *
     * ```js
     * const MyMixin = new Mixin({
     *   alert() {
     *     console.log('Alert!');
     *   }
     * });
     *
     * const MyClass = Class.extend({
     *   initialize() {
     *     this.alert();
     *   }
     * });
     *
     * MyClass.mixin(MyMixin);
     *
     * new MyClass();
     * // >> Alert!
     * ```
     *
     * @public
     * @static
     * @method mixin
     * @param {Object} protoProps - The properties to be added to the prototype.
     * @return {Class} - The class.
     */
    mixin: function mixin(protoProps) {
      // Add prototype properties (instance properties) to the class, if supplied.
      _wrapAll(this.prototype, protoProps);
      return this;
    },

    /**
     * Mixes properties onto the class's constructor.
     *
     * ```js
     * const MyMixin = new Mixin({
     *   alert() {
     *     console.log('Alert!');
     *   }
     * });
     *
     * const MyClass = Class.extend(...);
     *
     * MyClass.include(MyMixin);
     *
     * MyClass.alert();
     * // >> Alert!
     * ```
     *
     * You can also simply pass a plain javascript object.
     *
     * ```js
     * const MyClass = Class.extend(...);
     *
     * MyClass.include({
     *   alert() {
     *     console.log('Alert!');
     *   }
     * });
     *
     * MyClass.alert();
     * // >> Alert!
     * ```
     *
     * @public
     * @static
     * @method mixin
     * @param {Object} staticProps - The properties to be added to the constructor.
     * @return {Class} - The class.
     */
    include: function include(staticProps) {
      // Add static properties to the constructor function, if supplied.
      _wrapAll(this, staticProps);
      return this;
    },

    /**
     * Checks if `value` is a Metal Class.
     *
     * ```js
     * Class.isClass(Class.extend(...));
     * // >> true
     * Class.isClass(new Class());
     * // >> true
     * Class.isClass(function() {...});
     * // >> false
     * Class.isClass({...});
     * // >> false
     * ```
     * @public
     * @method isClass
     * @memberOf _
     * @param {*} value - The value to check.
     */
    isClass: function isClass(value) {
      return !!value && (value instanceof _class__Class || value.prototype instanceof _class__Class || value === _class__Class);
    }
  });

  /**
   * @class Class
   * @mixes Events
   */
  _class__Class.mixin(events);

  var _class = _class__Class;

  var ERROR_PROPS = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number'];

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
  var Err = _class.extend.call(Error, {

    /**
     * @public
     * @constructs Error
     * @param {String} [message] - A description of the error.
     * @param {Object} [options] - Settings for the error.
     * @param {String} [options.message] - A description of the error.
     */
    constructor: function constructor(message) {
      var options = arguments[1] === undefined ? {} : arguments[1];

      // If options are provided in place of a message, assume message exists on
      // options.
      if (_.isObject(message)) {
        options = message;
        message = options.message;
      }

      // Create a fake error with message in order to capture a stack trace.
      var error = Error.call(this, message);

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
    toString: function toString() {
      return '' + this.name + ': ' + this.message;
    }
  }, {

    /**
     * A safe reference to V8's `Error.captureStackTrace`.
     *
     * @public
     * @method captureStackTrace
     */
    captureStackTrace: function captureStackTrace(target, method) {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(target, method);
      }
    }
  });

  /**
   * @class Error
   * @mixes Class
   */
  _.extend(Err, _class);

  var _error = Err;

  var _deprecate__deprecate = function deprecate(message, test) {

    // Returns if test is provided and is falsy.
    if (test !== undefined && test) {
      return;
    }

    // If message is provided as an object, format the object into a string.
    if (_.isObject(message)) {
      message = _deprecate__deprecate._format(message.prev, message.next);
    }

    // Ensure that message is a string
    message = message && message.toString();

    // If deprecation message has not already been warned, send the warning.
    if (!_deprecate__deprecate._cache[message]) {
      _deprecate__deprecate._warn('Deprecation warning: ' + message);
      _deprecate__deprecate._cache[message] = true;
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
  _deprecate__deprecate._format = function _format(prev, next) {
    return '' + prev + ' is going to be removed in the future. Please use ' + next + ' instead.';
  };

  /**
   * A safe reference to the console object that will fallback to an empty
   * object.
   *
   * @private
   * @property _console
   */
  var _console = typeof console !== 'undefined' ? console : {};

  /**
   * A safe reference to the console.warn method that will fallback a noop.
   *
   * @private
   * @property _warnMethod
   */
  var _warnMethod = _console.warn || _console.log || function () {};

  /**
   * A safe reference to `console.warn`.
   *
   * @private
   * @method _warn
   * @memberOf deprecate
   * @param {*...} - The values to warn in the console.
   */
  _deprecate__deprecate._warn = function _warn() {
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
  _deprecate__deprecate._cache = {};

  var _deprecate = _deprecate__deprecate;

  var backbone_metal = Backbone.Metal = {
    Class: Class,
    Mixin: Mixin,
    Error: _error,
    deprecate: deprecate,
    Events: Events
  };

  return backbone_metal;
});
//# sourceMappingURL=./backbone-metal.js.map