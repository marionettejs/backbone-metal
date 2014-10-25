describe('Error', function() {
  it('should be subclass of native Error', function() {
    expect(new Backbone.Error())
      .to.be.instanceOf(Error);
  });

  describe('when passed a message', function() {
    beforeEach(function() {
      this.error = new Backbone.Error('Foo');
    });

    it('should contain the correct properties', function() {
      expect(this.error)
        .to.contain({
          name: 'Error',
          message: 'Foo'
        });
    });

    it('should output the correct string', function() {
      expect(this.error.toString())
        .to.equal('Error: Foo');
    });
  });

  describe('when passed a message and options', function() {
    beforeEach(function() {
      this.error = new Backbone.Error('Foo', {
        name: 'Bar'
      });
    });

    it('should contain the correct properties', function() {
      expect(this.error)
        .to.contain({
          name: 'Bar',
          message: 'Foo'
        });
    });

    it('should output the correct string', function() {
      expect(this.error.toString())
        .to.equal('Bar: Foo');
    });
  });

  describe('when passed a message and options with a url', function() {
    beforeEach(function() {
      this.error = new Backbone.Error('Foo', {
        name: 'Bar',
        url: '#baz'
      });
    });

    it('should contain the correct properties', function() {
      expect(this.error)
        .to.contain({
          name: 'Bar',
          message: 'Foo',
          url: 'http://github.com/thejameskyle/backbone-metal#baz'
        });
    });

    it('should output the correct string', function() {
      expect(this.error.toString())
        .to.equal('Bar: Foo See: http://github.com/thejameskyle/backbone-metal#baz');
    });
  });

  describe('when passed options', function() {
    beforeEach(function() {
      this.error = new Backbone.Error({
        name: 'Foo',
        message: 'Bar'
      });
    });

    it('should contain the correct properties', function() {
      expect(this.error)
        .to.contain({
          name: 'Foo',
          message: 'Bar'
        });
    });

    it('should output the correct string', function() {
      expect(this.error.toString())
        .to.equal('Foo: Bar');
    });
  });

  describe('when passed options with a url', function() {
    beforeEach(function() {
      this.error = new Backbone.Error({
        name: 'Foo',
        message: 'Bar',
        url: '#baz'
      });
    });

    it('should contain the correct properties', function() {
      expect(this.error)
        .to.contain({
          name: 'Foo',
          message: 'Bar',
          url: 'http://github.com/thejameskyle/backbone-metal#baz'
        });
    });

    it('should output the correct string', function() {
      expect(this.error.toString())
        .to.equal('Foo: Bar See: http://github.com/thejameskyle/backbone-metal#baz');
    });
  });

  describe('when passed valid error properties', function() {
    beforeEach(function() {
      this.props = {
        description  : 'myDescription',
        fileName     : 'myFileName',
        lineNumber   : 'myLineNumber',
        name         : 'myName',
        message      : 'myMessage',
        number       : 'myNumber'
      };
      this.error = new Backbone.Error(this.props);
    });

    it('should contain all the valid error properties', function() {
      expect(this.error)
        .to.contain(this.props);
    });
  });

  describe('when passed invalid error properties', function() {
    beforeEach(function() {
      this.props = {
        foo : 'myFoo',
        bar : 'myBar',
        baz : 'myBaz'
      };
      this.error = new Backbone.Error(this.props);
    });

    it('should not contain invalid properties', function() {
      expect(this.error)
        .not.to.contain(this.props);
    });
  });

  describe('when extended', function() {
    beforeEach(function() {
      this.TypeError = Backbone.Error.extend();
      this.typeError = new this.TypeError('Foo');
    });

    it('should subclass the error properly', function() {
      expect(this.typeError)
        .to.be.instanceOf(Error)
        .to.be.instanceOf(Backbone.Error)
        .to.be.instanceOf(this.TypeError);
    });
  });
});
