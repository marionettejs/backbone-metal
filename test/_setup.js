global.Metal = require('../src/' + require('../package').name);

var _ = require('underscore');
var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));

global._ = _;
global.expect = chai.expect;
global.Backbone = require('backbone');

var sandbox;
beforeEach(function() {
  sandbox = sinon.sandbox.create();
  global.stub = _.bind(sandbox.stub, sandbox);
  global.spy  = _.bind(sandbox.spy, sandbox);
});

afterEach(function() {
  delete global.stub;
  delete global.spy;
  sandbox.restore();
});
