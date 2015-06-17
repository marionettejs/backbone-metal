import Backbone from 'backbone';
import Mixin from './mixin';

/**
 * A `Metal.Mixin` version of `Backbone.Events`.
 *
 * @mixin Events
 * @memberOf Metal
 * @memberOf Backbone
 * @extends Metal.Mixin
 * @mixes Backbone.Events
 */
const Events = new Mixin(Backbone.Events);

export default Events;
