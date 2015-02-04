describe('deprecate', function() {
  beforeEach(function() {
    stub(Metal.deprecate, '_warn');
    Metal.deprecate._cache = {};
  });

  describe('when calling with a message', function() {
    beforeEach(function() {
      Metal.deprecate('foo');
    });

    it('should `console.warn` the message', function() {
      expect(Metal.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: foo');
    });
  });

  describe('when calling with an object', function() {
    beforeEach(function() {
      Metal.deprecate({
        prev: 'foo',
        next: 'bar'
      });
    });

    it('should `console.warn` the message', function() {
      expect(Metal.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: foo is going to be removed in the future. Please use bar instead.');
    });
  });

  describe('when calling with a message and a falsy test', function() {
    beforeEach(function() {
      Metal.deprecate('bar', false);
    });

    it('should `console.warn` the message', function() {
      expect(Metal.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: bar');
    });
  });

  describe('when calling with a message and a truthy test', function() {
    beforeEach(function() {
      Metal.deprecate('Foo', true);
    });

    it('should not `console.warn` the message', function() {
      expect(Metal.deprecate._warn).not.to.have.been.called;
    });
  });

  describe('when calling with the same message twice', function() {
    beforeEach(function() {
      Metal.deprecate('baz');
      Metal.deprecate('baz');
    });

    it('should `console.warn` the message', function() {
      expect(Metal.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: baz');
    });
  });
});
