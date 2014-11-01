/**
 * @module Metal
 */
var Metal = Backbone.Metal = {};

/**
 * Wraps the passed method so that `this._super` will point to the superMethod
 * when the method is invoked.
 *
 * @private
 * @method wrap
 * @param {Function} method - The method to call.
 * @param {Function} superMethod - The super method.
 * @return {Function} - wrapped function.
 */
function wrap(method, superMethod) {
  return function() {
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
var superTest = (/xyz/.test(function(){return 'xyz';})) ? /\b_super\b/ : /.*/;

/**
 * Assigns properties of source object to destination object, wrapping methods
 * that call their super method.
 *
 * @private
 * @method wrapAll
 * @param {Object} dest - The destination object.
 * @param {Object} source - The source object.
 */
function wrapAll(dest, source) {
  var keys = _.keys(source),
      length = keys.length,
      i, name, method, superMethod, hasSuper;

  // Return if source object is empty
  if (length === 0) {
    return;
  }

  for (i = 0; i < length; i++) {
    name = keys[i];
    method = source[name];
    superMethod = dest[name];

    // Test if new method calls `_super`
    hasSuper = superTest.test(method);

    // Only wrap the new method if the original method was a function and the
    // new method calls `_super`.
    if (hasSuper && _.isFunction(method) && _.isFunction(superMethod)) {
      dest[name] = wrap(method, superMethod);

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
 * var MyClass = Class.extend({
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
var Class = Metal.Class = function() {
  this.initialize.apply(this, arguments);
};

/**
 * An overridable method called when objects are instantiated. Does not do
 * anything by default.
 *
 * @public
 * @abstract
 * @method initialize
 */
Class.prototype.initialize = _.noop;

_.extend(Class, {

  /**
   * Creates a new subclass.
   *
   * ```js
   * var MyClass = Class.extend({
   *   // ...
   * });
   *
   * var myClass = new MyClass();
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
  extend(protoProps, staticProps) {
    var Parent = this;
    var Child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      Child = wrap(protoProps.constructor, Parent.prototype.constructor);
    } else {
      Child = function() { Parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(Child, Parent);
    wrapAll(Child, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function() { this.constructor = Child; };
    Surrogate.prototype = Parent.prototype;
    Child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    wrapAll(Child.prototype, protoProps);

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
   * var MyMixin = new Mixin({
   *   alert() {
   *     console.log('Alert!');
   *   }
   * });
   *
   * var MyClass = Class.extend({
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
  mixin(protoProps) {
    // Add prototype properties (instance properties) to the class, if supplied.
    wrapAll(this.prototype, protoProps);
    return this;
  },

  /**
   * Mixes properties onto the class's constructor.
   *
   * ```js
   * var MyMixin = new Mixin({
   *   alert() {
   *     console.log('Alert!');
   *   }
   * });
   *
   * var MyClass = Class.extend(...);
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
   * var MyClass = Class.extend(...);
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
   * @param {Object} protoProps - The properties to be added to the constructor.
   * @return {Class} - The class.
   */
  include(staticProps) {
    // Add static properties to the constructor function, if supplied.
    wrapAll(this, staticProps);
    return this;
  }
});

var classify = Metal.classify = function(Klass) {
  return Metal.Class.extend(
    _.extend({ constructor: Klass }, _.omit(Klass.prototype, _.keys(Backbone.Events))),
    _.omit(Klass, _.keys(Class))
  );
};

/**
 * Allows you to create mixins, whose properties can be added to other classes.
 *
 * @public
 * @class Mixin
 * @memberOf Metal
 * @memberOf Backbone
 * @param {Object} protoProps - The properties to be added to the prototype.
 */
var Mixin = Metal.Mixin = function(protoProps) {
  // Add prototype properties (instance properties) to the class, if supplied.
  _.extend(this, protoProps);
};

/**
 * @private
 * @const {String[]}
 */
var errorProps = [
  'description', 'fileName', 'lineNumber', 'name', 'message', 'number'
];

/**
 * A subclass of the JavaScript Error object for use in Backbone. Can also add
 * a url based on the urlRoot.
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
var Err = Metal.Error = Class.extend.call(Error, {

  /**
   * @property {String} urlRoot - The root url to be used in the error message.
   */
  urlRoot: 'http://github.com/thejameskyle/backbone-metal',

  /**
   * @public
   * @constructs Error
   * @param {String} [message] - A description of the error.
   * @param {Object} [options] - Settings for the error.
   * @param {String} [options.message] - A description of the error.
   * @param {String} [options.url] - The url to visit for more help.
   */
  constructor(message, options = {}) {
    // If options are provided in place of a message, assume message exists on
    // options.
    if (_.isObject(message)) {
      options = message;
      message = options.message;
    }

    // Create a fake error with message in order to capture a stack trace.
    var error = Error.call(this, message);

    // Copy over all the error-related properties.
    _.extend(this, _.pick(error, errorProps), _.pick(options, errorProps));

    // Adds a `stack` property to the given error object that will yield the
    // stack trace at the time captureStackTrace was called.
    // When collecting the stack trace all frames above the topmost call
    // to this function, including that call, will be left out of the
    // stack trace.
    // This is useful because we can hide Metal implementation details
    // that are not very helpful for the user.
    this.captureStackTrace();

    // Add url property to error, if provided.
    if (options.url) {
      this.url = this.urlRoot + options.url;
    }
  },

  /**
   * A safe reference to V8's `Error.captureStackTrace`.
   *
   * @public
   * @method captureStackTrace
   */
  captureStackTrace() {
    // Error.captureStackTrace does not exist in all browsers.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Err);
    }
  },

  /**
   * Formats the error message to display in the console.
   *
   * @public
   * @method toString
   * @returns {String} - Formatted error message.
   */
  toString() {
    return `${this.name}: ${this.message}` + (
      this.url ? ` See: ${this.url}` : ''
    );
  }
});

/**
 * @class Error
 * @mixes Class
 */
_.extend(Err, Class);

/**
 * Display a deprecation warning with the provided message.
 *
 * @public
 * @method deprecate
 * @param {String|Object} message - A description of the deprecation.
 * @param {String} message.prev - The deprecated item.
 * @param {String} message.next - The replacement for the deprecated item.
 * @param {String} [message.url] - The url to visit for more help.
 * @param {Boolean} [test] - An optional boolean. If falsy, the deprecation will be displayed.
 */
var deprecate = Metal.deprecate = function(message, test) {

  // Returns if test is provided and is falsy.
  if (test !== undefined && test) {
    return;
  }

  // If message is provided as an object, format the object into a string.
  if (_.isObject(message)) {
    message = deprecate._format(message.prev, message.next, message.url);
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
 * @param {String} [url] - The url to visit for more help.
 * @return {Sring} - The formatted message.
 */
deprecate._format = function(prev, next, url) {
  return (
    `${prev} is going to be removed in the future. ` +
    `Please use ${next} instead.` +
    (url ? ` See: ${url}` : '')
  );
};

/**
 * A safe reference to `console.warn` that will fallback to `console.log` or
 * `_noop` if the `console` object does not exist.
 *
 * @private
 * @method _warn
 * @memberOf deprecate
 * @param {*...} - The values to warn in the console.
 */
if (typeof console !== 'undefined') {
  deprecate._warn = console.warn || console.log;
}

// If `console.warn` and `console.log` weren't found, just noop.
if (!deprecate._warn) {
  deprecate._warn = _.noop;
}

/**
 * An internal cache to avoid sending the same deprecation warning multiple
 * times.
 *
 * @private
 * @property _cache
 * @memberOf deprecate
 */
deprecate._cache = {};

/**
 * A `Metal.Mixin` version of `Backbone.Events`.
 *
 * @mixin Events
 * @memberOf Metal
 * @memberOf Backbone
 * @extends Metal.Mixin
 * @mixes Backbone.Events
 */
var Events = Metal.Events = new Mixin(Backbone.Events);

/**
 * @class Class
 * @mixes Events
 */
Class.mixin(Events);

/**
 * Split the event name on the ":"
 *
 * @private
 * @const {RegExp}
 */
var triggerSplitter = /(^|:)(\w)/gi;

/**
 * Take the event section ("section1:section2:section3") and turn it in to
 * uppercase name.
 *
 * @private
 * @method getEventName
 * @param {String} match - The matched substring.
 * @param {Number} offset - The offset of the matched substring.
 * @param {String} eventName - The event name.
 * @return {String} - The uppercase event name.
 */
function getEventName(match, offset, eventName) {
  return eventName.toUpperCase();
}

/**
 * A set of utility functions to be mixed into any class. Already mixed into
 * `Metal.Class`.
 *
 * @mixin Utils
 * @memberOf Metal
 * @memberOf Backbone
 * @extends Metal.Mixin
 */
var Utils = Metal.Utils = new Mixin({

  /**
   * Trigger an event and/or a corresponding method name.
   *
   * `this.triggerMethod("foo")` will trigger the "foo" event and
   * call the "onFoo" method.
   *
   * `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
   * call the "onFooBar" method.
   *
   * ```js
   * var MyClass = Class.extend({
   *   initialize() {
   *     this.on('class:created', function() {
   *       console.log('Trigger Called!');
   *     });
   *
   *     this.triggerMethod('class:created');
   *   },
   *
   *   onClassCreated() {
   *     console.log('Method Called!');
   *   }
   * });
   *
   * new MyClass();
   * // >> Method Called!
   * // >> Trigger Called!
   * ```
   *
   * @public
   * @method triggerMethod
   * @param {String} event - The name of the event.
   * @param {*...} args - The arguments to pass to the method and trigger.
   * @return {*} - The result of the method.
   */
  triggerMethod(event, ...args) {

    // Get the method name from the event name
    var methodName = 'on' + event.replace(triggerSplitter, getEventName);
    var method = this[methodName];
    var result;

    // call the onMethodName if it exists
    if (_.isFunction(method)) {
      // pass all arguments, except the event name
      result = method.apply(this, args);
    }

    // trigger the event, if a trigger method exists
    if (_.isFunction(this.trigger)) {
      this.trigger.apply(this, arguments);
    }

    return result;
  },

  /**
   * Retrieve an object, function or other value from a target
   * object or its `options`, with `options` taking precedence.
   *
   * ```js
   * var Person = Class.extend({
   *   name: 'James Kyle',
   *
   *   intialize(options) {
   *     this.options = options;
   *     this.greet();
   *   },
   *
   *   greet() {
   *     var name = this.getOption('name');
   *     console.log(`Hello, my name is ${name}.`);
   *   }
   * });
   *
   * new Person();
   * // >> Hello, my name is James Kyle.
   * new Person({ name: 'Sam Saccone' });
   * // >> Hello, my name is Sam Saccone.
   * ```
   *
   * @public
   * @method getOption
   * @param {String} name - The name of the option to get.
   * @returns {*} - The value of the option.
   */
  getOption(name) {
    if (this.options && this.options[name] !== undefined) {
      return this.options[name];
    } else {
      return this[name];
    }
  }
});

/**
 * @class Class
 * @mixes Utils
 */
Class.mixin(Utils);

_.mixin({

  /**
   * Checks if `value` is a Metal Class.
   *
   * ```js
   * _.isClass(Class.extend(...));
   * // >> true
   * _.isClass(new Class());
   * // >> true
   * _.isClass(function() {...});
   * // >> false
   * _.isClass({...});
   * // >> false
   * ```
   * @public
   * @method isClass
   * @memberOf _
   * @param {*} value - The value to check.
   */
  isClass(value) {
    return !!value && (value instanceof Class || value.prototype instanceof Class);
  },

  /**
   * Checks if `value` is a Metal Mixin.
   *
   * ```js
   * _.isMixin(new Mixin());
   * // >> true
   * _.isMixin({});
   * // >> false
   * _.isMixin(function() {...});
   * // >> false
   * _.isMixin(new Class());
   * // >> false
   * ```
   *
   * @public
   * @method isMixin
   * @memberOf _
   * @param {*} value - The value to check.
   */
  isMixin(value) {
    return !!value && value instanceof Mixin;
  }
});

// Override Backbone built-ins so methods like `_.isClass` and `_.isMixin` will
// function properly.

/**
 * @mixin Events
 * @namespace Backbone
 * @type {Mixin}
 */
Backbone.Events = Events;

/**
 * @class Model
 * @namespace Backbone
 * @type {Class}
 */
Backbone.Model = classify(Backbone.Model);

/**
 * @class Collection
 * @namespace Backbone
 * @type {Class}
 */
Backbone.Collection = classify(Backbone.Collection);

/**
 * @class View
 * @namespace Backbone
 * @type {Class}
 */
Backbone.View = classify(Backbone.View);

/**
 * @class Router
 * @namespace Backbone
 * @type {Class}
 */
Backbone.Router = classify(Backbone.Router);

/**
 * @class History
 * @namespace Backbone
 * @type {Class}
 */
Backbone.History = classify(Backbone.History);
