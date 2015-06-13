import ImportedMetal from '../../src/backbone-metal';

let Metal = ImportedMetal;

let update;

if (typeof exports !== 'undefined') {
  update = done => {
    let packageName = require('../../package').name;
    delete require.cache[require.resolve('../../src/' + packageName)];
    Metal = require('../../src/' + packageName);
    done();
  };
} else {
  update = done => {
    let script = document.getElementById('lib');
    let clone = document.createElement('script');
    clone.src = script.src + '?t=' + Date.now();
    clone.id = script.id;
    clone.onload = () => done();
    script.parentNode.replaceChild(clone, script);
  };
}

describe('Support', function() {
  describe('when Function.toString does not return body', function() {
    beforeEach(function(done) {
      let prevToString = Function.prototype.toString;
      Function.prototype.toString = () => '[hidden]'; // eslint-disable-line no-extend-native
      update(done);
      Function.prototype.toString = prevToString; // eslint-disable-line no-extend-native
    });

    describe('Super', function() {
      beforeEach(function() {
        stub(Metal.Class.prototype, 'constructor');
        this.Subclass = Metal.Class.extend({
          constructor() {
            this._super('arg');
          }
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
      this.prevWarn = console.warn;
      this.prevLog = console.log;
      this.logStub = stub(console, 'log');
      delete console.warn;
      console.warn = undefined;
      update(done);
    });

    describe('deprecate', function() {
      beforeEach(function() {
        Metal.deprecate('foo');

        // Metal.deprecate chooses the console function during execution.
        // console.warn / console.log must be returned to normal to see
        // test results.
        console.warn = this.prevWarn;
        console.log = this.prevLog;
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
      let prevConsole = global.console;
      delete global.console;
      global.console = undefined;
      update(done);
      global.console = prevConsole;
    });

    describe('deprecate', function() {
      it('should not error', function() {
        expect(() => Metal.deprecate('foo'))
          .not.to.throw();
      });
    });
  });
});
