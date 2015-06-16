import _ from 'underscore';

/**
 * Allows you to create mixins, whose properties can be added to other classes.
 *
 * @public
 * @class Mixin
 * @memberOf Metal
 * @memberOf Backbone
 * @param {Object} protoProps - The properties to be added to the prototype.
 */
const Mixin = function Mixin(protoProps) {
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
Mixin.isMixin = function isMixin(value) {
  return !!value && value instanceof Mixin;
};

export default Mixin;
