describe('deprecate', function() {
  beforeEach(function() {
    this.sinon.stub(Backbone.deprecate, '_warn');
    Backbone.deprecate._cache = {};
  });

  describe('when calling with a message', function() {
    beforeEach(function() {
      Backbone.deprecate('foo');
    });

    it('should `console.warn` the message', function() {
      expect(Backbone.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: foo');
    });
  });

  describe('when calling with an object', function() {
    beforeEach(function() {
      Backbone.deprecate({
        prev: 'foo',
        next: 'bar'
      });
    });

    it('should `console.warn` the message', function() {
      expect(Backbone.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: foo is going to be removed in the future. Please use bar instead.');
    });
  });

  describe('when calling with an object with a url', function() {
    beforeEach(function() {
      Backbone.deprecate({
        prev: 'foo',
        next: 'bar',
        url: 'baz'
      });
    });

    it('should `console.warn` the message', function() {
      expect(Backbone.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: foo is going to be removed in the future. Please use bar instead. See: baz');
    });
  });

  describe('when calling with a message and a falsy test', function() {
    beforeEach(function() {
      Backbone.deprecate('bar', false);
    });

    it('should `console.warn` the message', function() {
      expect(Backbone.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: bar');
    });
  });

  describe('when calling with a message and a truthy test', function() {
    beforeEach(function() {
      Backbone.deprecate('Foo', true);
    });

    it('should not `console.warn` the message', function() {
      expect(Backbone.deprecate._warn).not.to.have.been.called;
    });
  });

  describe('when calling with the same message twice', function() {
    beforeEach(function() {
      Backbone.deprecate('baz');
      Backbone.deprecate('baz');
    });

    it('should `console.warn` the message', function() {
      expect(Backbone.deprecate._warn)
        .to.have.been.calledOnce
        .and.calledWith('Deprecation warning: baz');
    });
  });
});
