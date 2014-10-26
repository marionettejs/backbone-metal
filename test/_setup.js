global.Backbone = require('backbone');
global._ = require('underscore');

require('6to5/register');
require('../src/metal');

global.Metal = Backbone.Metal;

var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));

global.sinon  = sinon;
global.expect = chai.expect;

beforeEach(function() {
  this.sinon = sinon.sandbox.create();
  global.stub = this.sinon.stub.bind(this.sinon);
  global.spy  = this.sinon.spy.bind(this.sinon);
});

afterEach(function() {
  delete global.stub;
  delete global.spy;
  this.sinon.restore();
});
