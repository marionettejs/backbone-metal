describe('Mixin', function() {
  describe('#constructor', function() {
    beforeEach(function() {
      this.mixin = new Metal.Mixin({ foo: 'foo', bar: 'bar' });
    });

    it('should be an instance of Mixin', function() {
      expect(this.mixin)
        .to.be.instanceOf(Metal.Mixin);
    });

    it('should add the properties to the mixin', function() {
      expect(this.mixin)
        .to.contain({
          foo: 'foo',
          bar: 'bar'
        });
    });
  });

  describe('#isMixin', function() {
    beforeEach(function() {
      this.MyMixin = new Metal.Mixin();
      this.MyObject = {};
    });

    it('should return true for mixins', function() {
      expect(Metal.Mixin.isMixin(this.MyMixin))
        .to.be.true;
    });

    it('should return false for normal objects', function() {
      expect(Metal.Mixin.isMixin(this.MyObject))
        .to.be.false;
    });

    it('should return false for other values', function() {
      _.each([true, false, undefined, null, 0, 'hi'], function(val) {
        expect(Metal.Mixin.isMixin(val))
          .to.be.false;
      });
    });
  });
});
