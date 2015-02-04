describe('Class', function() {
  describe('#constructor', function() {
    beforeEach(function() {
      stub(Metal.Class.prototype, 'initialize');
      this.instance = new Metal.Class('arg1', 'arg2');
    });

    it('should call initialize with the correct arguments', function() {
      expect(this.instance.initialize)
        .to.have.been.calledWith('arg1', 'arg2');
    });
  });

  describe('#extend', function() {
    beforeEach(function() {
      this.method1 = stub();
      this.method2 = stub();
      this.Subclass = Metal.Class.extend({
        property1: 'value1',
        method1: this.method1
      }, {
        property2: 'value2',
        method2: this.method2
      });
      this.instance = new this.Subclass();
    });

    it('should return a Child class', function() {
      expect(this.Subclass)
        .not.to.equal(Metal.Class);
      expect(this.instance)
        .to.be.instanceof(Metal.Class);
    });

    it('should copy over the parent class\'s prototype', function() {
      expect(this.Subclass.prototype)
        .to.deep.contain(Metal.Class.prototype);
    });

    it('should copy over the parent class\'s statics', function() {
      expect(_.pick(this.Subclass, _.keys(this.Subclass)))
        .to.contain(_.pick(Metal.Class, _.keys(Metal.Class)));
    });

    it('should set __super__ to the parent class\'s prototype', function() {
      expect(this.Subclass)
        .to.have.property('__super__', Metal.Class.prototype);
    });

    it('should set superclass to the parent class', function() {
      expect(this.Subclass)
        .to.have.property('superclass', Metal.Class);
    });

    it('should add instance properties to the subclass', function() {
      expect(this.Subclass.prototype)
        .to.have.property('property1', 'value1');
    });

    it('should add static properties to the subclass', function() {
      expect(this.Subclass)
        .to.have.property('property2', 'value2');
    });

    it('should add wrapped instance methods to the subclass', function() {
      this.Subclass.prototype.method1('arg');
      expect(this.method1)
        .to.have.been.calledOn(this.Subclass.prototype)
        .and.calledWith('arg');
    });

    it('should add wrapped static methods to the subclass', function() {
      this.Subclass.method2('arg');
      expect(this.method2)
        .to.have.been.calledOn(this.Subclass)
        .and.calledWith('arg');
    });

    describe('_super', function() {
      describe('when in the constructor', function() {
        beforeEach(function() {
          stub(Metal.Class.prototype, 'constructor');
          this.Subclass = Metal.Class.extend({
            constructor: function() { this._super('arg'); }
          });
          this.instance = new this.Subclass();
        });

        it('should call the parent class\'s constructor', function() {
          expect(Metal.Class.prototype.constructor)
            .to.have.been.calledOn(this.instance)
            .and.calledWith('arg');
        });
      });

      describe('when not in the constructor', function() {
        beforeEach(function() {
          stub(Metal.Class.prototype, 'initialize');
          this.Subclass = Metal.Class.extend({
            initialize: function() { this._super('arg'); }
          });
          this.instance = new this.Subclass();
        });

        it('should call the parent class\'s matching function', function() {
          expect(Metal.Class.prototype.initialize)
            .to.have.been.calledOn(this.instance)
            .and.calledWith('arg');
        });
      });
    });
  });

  describe('#include', function() {
    beforeEach(function() {
      this.Subclass = Metal.Class.extend();
      this.Subclass.include({
        prop1: 'value1',
        prop2: 'value2'
      });
    });

    it('should add statics to the class', function() {
      expect(_.clone(this.Subclass))
        .to.contain({
          prop1: 'value1',
          prop2: 'value2'
        });
    });

    describe('_super', function() {
      beforeEach(function() {
        this.methodStub = this.Subclass.method = stub();
        this.Subclass.include({
          method: function() { this._super('arg'); }
        });
        this.Subclass.method();
      });

      it('should call the original function', function() {
        expect(this.methodStub)
          .to.have.been.calledOn(this.Subclass)
          .and.calledWith('arg');
      });
    });
  });

  describe('#mixin', function() {
    beforeEach(function() {
      this.Subclass = Metal.Class.extend();
      this.Subclass.mixin({
        prop1: 'value1',
        prop2: 'value2'
      });
    });

    it('should add statics to the class', function() {
      expect(this.Subclass.prototype)
        .to.contain({
          prop1: 'value1',
          prop2: 'value2'
        });
    });

    describe('_super', function() {
      beforeEach(function() {
        this.methodStub = this.Subclass.prototype.method = stub();
        this.Subclass.mixin({
          method: function() { this._super('arg'); }
        });
        this.Subclass.prototype.method();
      });

      it('should call the original function', function() {
        expect(this.methodStub)
          .to.have.been.calledOn(this.Subclass.prototype)
          .and.calledWith('arg');
      });
    });
  });

  describe('#isClass', function() {
    beforeEach(function() {
      this.MyClass = Metal.Class.extend().extend();
      this.MyCtor = function() {};
    });

    it('should return true for classes', function() {
      expect(Metal.Class.isClass(this.MyClass))
        .to.be.true;
    });

    it('should return true for instances of Class', function() {
      expect(Metal.Class.isClass(new this.MyClass()))
        .to.be.true;
    });

    it('should return false for normal constructors', function() {
      expect(Metal.Class.isClass(this.MyCtor))
        .to.be.false;
    });

    it('should return false for other values', function() {
      _.each([true, false, undefined, null, 0, 'hi'], function(val) {
        expect(Metal.Class.isClass(val))
          .to.be.false;
      });
    });
  });
});
