(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('backbone'), require('underscore'));
  } else {
    factory(root.Backbone, root._);
  }
})(this, function(Backbone, _) {
  'use strict';

  // @include ./metal.js
  return Metal;
});
