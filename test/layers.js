'use strict';
var assert = require('yeoman-assert');
var sinon = require('sinon');
var env = require('yeoman-environment');
var layer = require('../lib/layers');
var TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;

describe('layers', function() {
  beforeEach(function() {
    this.env = env.createEnv([], {}, new TestAdapter({foo: 'bar'}));
    this.props = {};
  });

  it('can create a fs layer', function(done) {
    var layerFn = sinon.spy();
    var fsLayer = layer(layerFn);
    fsLayer(this.env, this.props);
    this.env.runLoop.once('end', () => {
      sinon.assert.calledOnce(layerFn);
      sinon.assert.calledWith(layerFn, this.props);
      assert(layerFn.thisValues[0].async);
      assert(layerFn.thisValues[0].fs);
      assert(layerFn.thisValues[0].log);
      done();
    });
  });

  it('runs async fs layers', function(done) {
    var barging = false;
    var firstLayer = layer(function(props) {
      var asyncDone = this.async();
      setTimeout(function() {
        assert(!barging, 'The second layer barged!');
        barging = true;
        asyncDone();
      }, 0);
    });
    var secondLayer = layer(function(props) {
      barging = true;
    });
    firstLayer(this.env, this.props);
    secondLayer(this.env, this.props);
    this.env.runLoop.once('end', () => {
      done();
    });
  });
});
