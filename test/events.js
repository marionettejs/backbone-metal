describe('Events', function() {
  it('should be an instance of Mixin', function() {
    expect(Backbone.Events)
      .to.be.instanceOf(Backbone.Mixin);
  });
});
