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
  
  var _slice = Array.prototype.slice;

  var Metal = {};
  
  function wrap(method, superMethod) {
    return function() {
      var prevSuper = this._super;
      this._super = superMethod;
      var ret = method.apply(this, arguments);
      this._super = prevSuper;
      return ret;
    };
  }
  
  var superTest = (/xyz/.test(function(){return 'xyz';})) ? /\b_super\b/ : /.*/;
  
  function wrapAll(dest, source) {
    _.forEach(source, function(method, name) {
      var superMethod = dest[name];
      var hasSuper = superTest.test(method);
  
      if (hasSuper && _.isFunction(method) && _.isFunction(superMethod)) {
        dest[name] = wrap(method, superMethod);
      } else {
        dest[name] = method;
      }
    });
  }
  
  var Class = Metal.Class = Backbone.Class = function() {
    this.initialize.apply(this, arguments);
  };
  
  Class.prototype.initialize = _.noop;
  
  _.extend(Class, {
    extend: function(protoProps, staticProps) {
      var Parent = this;
      var Child;
  
      if (protoProps && _.has(protoProps, 'constructor')) {
        Child = wrap(protoProps.constructor, Parent.prototype.constructor);
      } else {
        Child = function() { Parent.apply(this, arguments); };
      }
  
      _.extend(Child, Parent);
      wrapAll(Child, staticProps);
  
      var Surrogate = function() { this.constructor = Child; };
      Surrogate.prototype = Parent.prototype;
      Child.prototype = new Surrogate();
  
      wrapAll(Child.prototype, protoProps);
  
      Child.superclass = Parent;
      Child.__super__ = Parent.prototype;
  
      return Child;
    },
  
    mixin: function(protoProps) {
      wrapAll(this.prototype, protoProps);
      return this;
    },
  
    include: function(staticProps) {
      wrapAll(this, staticProps);
      return this;
    }
  });
  
  var Mixin = Metal.Mixin = Backbone.Mixin = function(protoProps) {
    _.extend(this, protoProps);
  };
  
  _.mixin({
    isClass: function(value) {
      return !!value && value.prototype instanceof Class;
    },
  
    isMixin: function(value) {
      return !!value && value instanceof Mixin;
    }
  });
  
  var errorProps = [
    'description', 'fileName', 'lineNumber', 'name', 'message', 'number'
  ];
  
  var Err = Metal.Error = Backbone.Error = Class.extend.call(Error, {
    urlRoot: 'http://github.com/thejameskyle/backbone-metal',
  
    constructor: function(message, options) {
      if (options === undefined)
        options = {};

      if (_.isObject(message)) {
        options = message;
        message = options.message;
      }

      var error = Error.call(this, message);
      _.extend(this, _.pick(error, errorProps), _.pick(options, errorProps));

      this.captureStackTrace();

      if (options.url) {
        this.url = this.urlRoot + options.url;
      }
    },
  
    captureStackTrace: function() {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, Err);
      }
    },
  
    toString: function() {
      return this.name + ': ' + this.message + (
        this.url ? ' See: ' + this.url : ''
      );
    }
  });
  
  _.extend(Err, Class);
  
  var deprecate = Metal.deprecate = Backbone.deprecate = function(message, test) {
    if (test !== undefined && test) {
      return;
    }
  
    if (_.isObject(message)) {
      message = deprecate._format(message.prev, message.next, message.url);
    }
  
    message = message && message.toString();
  
    if (!deprecate._cache[message]) {
      deprecate._warn('Deprecation warning: ' + message);
      deprecate._cache[message] = true;
    }
  };
  
  deprecate._format = function(prev, next, url) {
    return (
      prev + ' is going to be removed in the future. ' +
      'Please use ' + next + ' instead.' +
      (url ? ' See: ' + url : '')
    );
  };
  
  if (typeof console !== 'undefined') {
    deprecate._warn = console.warn || console.log;
  }
  
  if (!deprecate._warn) {
    deprecate._warn = _.noop;
  }
  
  deprecate._cache = {};
  
  var Events = Metal.Events = Backbone.Events = new Mixin(Backbone.Events);
  
  Class.mixin(Events);
  
  // split the event name on the ":"
  var triggerSplitter = /(^|:)(\w)/gi;
  
  // take the event section ("section1:section2:section3")
  // and turn it in to uppercase name
  function getEventName(match, prefix, eventName) {
    return eventName.toUpperCase();
  }
  
  var Utils = Metal.Utils = Backbone.Utils = new Mixin({
    triggerMethod: function(event) {
      var args = _slice.call(arguments, 1);
      // get the method name from the event name
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
  
    getOption: function(name) {
      if (this.options && this.options[name] !== undefined) {
        return this.options[name];
      } else {
        return this[name];
      }
    }
  });
  
  Class.mixin(Utils);
  
  return Metal;
});

//# sourceMappingURL=backbone-metal.js.map