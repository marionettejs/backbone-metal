describe('Mixin', function() {
  describe('#constructor', function() {
    beforeEach(function() {
      this.mixin = new Metal.Mixin({ foo: 'foo', bar: 'bar' });
    });

    it('should be an instance of Mixin', function() {
      expect(this.mixin)
        .to.be.instanceOf(Metal.Mixin)
    });

    it('should add the properties to the mixin', function() {
      expect(this.mixin)
        .to.contain({
          foo: 'foo',
          bar: 'bar'
        });
    });
  });
});
