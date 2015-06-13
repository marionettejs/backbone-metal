import Metal from '../../src/backbone-metal';
import Backbone from 'backbone';

describe('Events', function() {
  it('should be an instance of Mixin', function() {
    expect(Metal.Events)
      .to.be.instanceOf(Metal.Mixin);
  });

  it('should contain Backbone.Events', function() {
    expect(Metal.Events)
      .to.contain(Backbone.Events);
  });
});
