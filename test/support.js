var update;

if (typeof exports !== 'undefined') {
  update = function(done) {
    var packageName = require('../package').name;
    delete require.cache[require.resolve('../src/' + packageName)];
    Metal = require('../src/' + packageName);
    done();
  };
} else {
  update = function(done) {
    var script = document.getElementById('lib');
    var clone = document.createElement('script');
    clone.src = script.src + '?t=' + Date.now();
    clone.id = script.id;
    clone.onload = function() { done(); };
    script.parentNode.replaceChild(clone, script);
  };
}

describe('Support', function() {
  describe('when Function.toString does not return body', function() {
    beforeEach(function(done) {
      var prevToString = Function.prototype.toString;
      Function.prototype.toString = function() { return '[hidden]'; };
      update(done);
      Function.prototype.toString = prevToString;
    });

    describe('Super', function() {
      beforeEach(function() {
        stub(Metal.Class.prototype, 'constructor');
        this.Subclass = Metal.Class.extend({
          constructor: function() { this._super('arg'); }
        });
        this.instance = new this.Subclass();
      });

      it('should function as normal', function() {
        expect(Metal.Class.prototype.constructor)
          .to.have.been.calledOn(this.instance)
          .and.calledWith('arg');
      });
    });
  });

  describe('when Error.captureStackTrace does not exist', function() {
    beforeEach(function(done) {
      this.prevCaptureStackTrace = Error.captureStackTrace;
      delete Error.captureStackTrace;
      Error.captureStackTrace = undefined;
      update(done);
    });

    afterEach(function() {
      Error.captureStackTrace = this.prevCaptureStackTrace;
    });

    describe('Error', function() {
      beforeEach(function() {
        this.error = new Metal.Error('Foo');
      });

      it('should function as normal', function() {
        expect(this.error.toString())
          .to.equal('Error: Foo');
      });
    });
  });

  describe('when console.warn does not exist', function() {
    beforeEach(function(done) {
      var prevWarn = console.warn;
      var prevLog = console.log;
      this.logStub = stub(console, 'log');
      delete console.warn;
      console.warn = undefined;
      update(done);
      console.warn = prevWarn;
      console.log = prevLog;
    });

    describe('deprecate', function() {
      beforeEach(function() {
        Metal.deprecate('foo');
      });

      it('should use console.log instead', function() {
        expect(this.logStub)
          .to.have.been.calledOnce
          .and.calledWith('Deprecation warning: foo');
      });
    });
  });

  describe('when console does not exist', function() {
    beforeEach(function(done) {
      var prevConsole = root.console;
      delete root.console;
      root.console = undefined;
      stub(_, 'noop');
      update(done);
      root.console = prevConsole;
    });

    describe('deprecate', function() {
      beforeEach(function() {
        Metal.deprecate('foo');
      });

      it('should use _.noop instead', function() {
        expect(_.noop)
          .to.have.been.calledOnce
          .and.calledWith('Deprecation warning: foo');
      });
    });
  });
});
