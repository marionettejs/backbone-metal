var root;

if (typeof exports !== 'undefined') {
  root = global;
  root.Backbone = require('backbone');
  root._ = require('underscore');
  require('6to5/register');
  require('../src/metal');

  root.chai = require('chai');
  root.sinon = require('sinon');
  root.chai.use(require('sinon-chai'));

  setup();
} else {
  root = window;
  mocha.setup('bdd');
  root.onload = function() {
    mocha.checkLeaks();
    mocha.globals(['stub', 'spy']);
    mocha.run();
    setup();
  };
}

root.Metal = Backbone.Metal;
root.expect = chai.expect;

function setup() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    root.stub = this.sandbox.stub.bind(this.sandbox);
    root.spy  = this.sandbox.spy.bind(this.sandbox);
  });

  afterEach(function() {
    delete root.stub;
    delete root.spy;
    this.sandbox.restore();
  });
}
