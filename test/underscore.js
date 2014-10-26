describe('Underscore mixins', function() {
  describe('#isClass', function() {
    beforeEach(function() {
      this.MyClass = Metal.Class.extend().extend();
      this.MyCtor = function() {};
    });

    it('should return true for classes', function() {
      expect(_.isClass(this.MyClass))
        .to.be.true;
    });

    it('should return false for normal constructors', function() {
      expect(_.isClass(this.MyCtor))
        .to.be.false;
    });

    it('should return false for other values', function() {
      _.each([true, false, undefined, null, 0, 'hi'], function(val) {
        expect(_.isClass(val))
          .to.be.false;
      });
    });
  });

  describe('#isMixin', function() {
    beforeEach(function() {
      this.MyMixin = new Metal.Mixin();
      this.MyObject = {};
    });

    it('should return true for mixins', function() {
      expect(_.isMixin(this.MyMixin))
        .to.be.true;
    });

    it('should return false for normal objects', function() {
      expect(_.isMixin(this.MyObject))
        .to.be.false;
    });

    it('should return false for other values', function() {
      _.each([true, false, undefined, null, 0, 'hi'], function(val) {
        expect(_.isMixin(val))
          .to.be.false;
      });
    });
  });
});
