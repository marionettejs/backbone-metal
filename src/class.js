import _ from 'underscore';
import Events from './events';

/**
 * Wraps the passed method so that `this._super` will point to the superMethod
 * when the method is invoked.
 *
 * @private
 * @method wrap
 * @param {Function} method - The method to call.
 * @param {Function} superMeqthod - The super method.
 * @return {Function} - wrapped function.
 */
function _wrap(method, superMethod) {
  return function() {
    let prevSuper = this._super;
    this._super = superMethod;
    let ret = method.apply(this, arguments);
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
const CONTAINS_SUPER = (/xyz/.test(function() { xyz; })) ? /\b_super\b/ : /.*/; // eslint-disable-line

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
  let keys = _.keys(source),
      length = keys.length,
      i, name, method, superMethod, hasSuper;

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
const Class = function Class() {
  this.cid = _.uniqueId(this.cidPrefix);
  this.initialize(...arguments);
};

_.extend(Class.prototype, {

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
  initialize: function() {},

  /**
   * Destroy a Class by removing all listeners.
   *
   * @public
   * @method destroy
   */
  destroy() {
    this.stopListening();
  }
});

_.extend(Class, {

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
  extend(protoProps, staticProps) {
    let Parent = this;
    let Child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (!protoProps || !_.has(protoProps, 'constructor')) {
      Child = function() { Parent.apply(this, arguments); };
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
    let Surrogate = function() {
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
  mixin(protoProps) {
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
  include(staticProps) {
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
  isClass(value) {
    return !!value && (
      value instanceof Class ||
      value.prototype instanceof Class ||
      value === Class
    );
  }
});

/**
 * @class Class
 * @mixes Events
 */
Class.mixin(Events);

export default Class;
