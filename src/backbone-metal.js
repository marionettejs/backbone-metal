import Backbone from 'backbone';
import Class from './class';
import Mixin from './mixin';
import Err from './error';
import deprecate from './deprecate';
import Events from './events';

/**
 * @module Metal
 */
export default Backbone.Metal = {
  Class: Class,
  Mixin: Mixin,
  Error: Err,
  deprecate: deprecate,
  Events: Events
};
