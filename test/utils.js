describe('Utils', function() {
  describe('#triggerMethod', function() {
    beforeEach(function() {
      this.target = {};
      this.methodHandler = stub();
      this.eventHandler = stub();
      _.extend(this.target, Backbone.Events);
      spy(Backbone.Utils, 'triggerMethod');
    });

    describe('when triggering an event', function() {
      beforeEach(function() {
        this.target.onFoo = this.methodHandler;
        this.target.on('foo', this.eventHandler);
        Backbone.Utils.triggerMethod.call(this.target, 'foo');
      });

      it('should trigger the event', function() {
        expect(this.eventHandler)
          .to.have.been.calledOnce;
      });

      it('should call a method named on{Event}', function() {
        expect(this.methodHandler)
          .to.have.been.calledOnce;
      });

      it('returns the value returned by the on{Event} method', function() {
        expect(Backbone.Utils.triggerMethod)
          .to.have.been.calledOnce
          .and.returned(this.returnValue);
      });

      describe('when trigger does not exist', function() {
        it('should do nothing', function() {
          expect(function() {
            Marionette.Utils.triggerMethod.call(this.target, 'does:not:exit');
          }).not.to.throw;
        });
      });
    });

    describe('when triggering an event with arguments', function() {
      beforeEach(function() {
        this.target.onFoo = this.methodHandler;
        this.target.on('foo', this.eventHandler);
        Backbone.Utils.triggerMethod.call(this.target, 'foo', 'argOne', 'argTwo');
      });

      it('should trigger the event with the args', function() {
        expect(this.eventHandler)
          .to.have.been.calledOnce
          .and.calledWith('argOne', 'argTwo');
      });

      it('should call a method named on{Event} with the args', function() {
        expect(this.methodHandler)
          .to.have.been.calledOnce
          .and.calledWith('argOne', 'argTwo');
      });
    });

    describe('when triggering an event with : separated name', function() {
      beforeEach(function() {
        this.target.onFooBar = this.methodHandler;
        this.target.on('foo:bar', this.eventHandler);
        Backbone.Utils.triggerMethod.call(this.target, 'foo:bar', 'argOne', 'argTwo');
      });

      it('should trigger the event with the args', function() {
        expect(this.eventHandler)
          .to.have.been.calledOnce
          .and.calledWith('argOne', 'argTwo');
      });

      it('should call a method named with each segment of the event name capitalized', function() {
        expect(this.methodHandler)
          .to.have.been.calledOnce
          .and.calledWith('argOne', 'argTwo');
      });
    });

    describe('when triggering an event and no handler method exists', function() {
      beforeEach(function() {
        this.target.on('foo:bar', this.eventHandler);
        Backbone.Utils.triggerMethod.call(this.target, 'foo:bar', 'argOne', 'argTwo');
      });

      it('should trigger the event with the args', function() {
        expect(this.eventHandler)
          .to.have.been.calledOnce
          .and.calledWith('argOne', 'argTwo');
      });

      it('should not call a method named with each segment of the event name capitalized', function() {
        expect(this.methodHandler)
          .not.to.have.been.calledOnce;
      });
    });

    describe('when triggering an event and the attribute for that event is not a function', function() {
      beforeEach(function() {
        this.target.onFooBar = 'baz';
        this.target.on('foo:bar', this.eventHandler);
        Backbone.Utils.triggerMethod.call(this.target, 'foo:bar', 'argOne', 'argTwo');
      });

      it('should trigger the event with the args', function() {
        expect(this.eventHandler)
          .to.have.been.calledOnce
          .and.calledWith('argOne', 'argTwo');
      });

      it('should not call a method named with each segment of the event name capitalized', function() {
        expect(this.methodHandler)
          .not.to.have.been.calledOnce;
      });
    });
  });

  describe('#getOption', function() {
    describe('when an object only has the option set on the definition', function() {
      beforeEach(function() {
        this.target = { foo: 'bar' };
        this.value = Backbone.Utils.getOption.call(this.target, 'foo');
      });

      it('should return that definitions option', function() {
        expect(this.value)
          .to.equal(this.target.foo);
      });
    });

    describe('when an object only has the option set on the options', function() {
      beforeEach(function() {
        this.target = { options: { foo: 'bar' } };
        this.value = Backbone.Utils.getOption.call(this.target, 'foo');
      });

      it('should return value from the options', function() {
        expect(this.value)
          .to.equal(this.target.options.foo);
      });
    });

    describe('when an object has the option set on the options, and it is a "falsey" value', function() {
      beforeEach(function() {
        this.target = { options: { foo: false } };
        this.value = Backbone.Utils.getOption.call(this.target, 'foo');
      });

      it('should return value from the options', function() {
        expect(this.value)
          .to.equal(this.target.options.foo);
      });
    });

    describe('when an object has the option set on the options, and it is a "undefined" value', function() {
      beforeEach(function() {
        this.target = { foo: 'bar', options: { foo: undefined } };
        this.value = Backbone.Utils.getOption.call(this.target, 'foo');
      });

      it('should return the objects value', function() {
        expect(this.value)
          .to.equal(this.target.foo);
      });
    });

    describe('when an object has the option set on both the defininition and options', function() {
      beforeEach(function() {
        this.target = { foo: 'bar', options: { foo: 'baz' } };
        this.value = Backbone.Utils.getOption.call(this.target, 'foo');
      });

      it('should return that value from the options', function() {
        expect(this.value)
          .to.equal(this.target.options.foo);
      });
    });
  });
});
