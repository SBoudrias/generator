'use strict';
var assert = require('yeoman-assert');
var env = require('yeoman-environment');
var generators = require('..');
var layer = require('../lib/layers');
var mockery = require('mockery');
var path = require('path');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});

describe('layers', function() {
  beforeEach(function() {
    this.env = env.createEnv([], {}, new TestAdapter({foo: 'bar'}));
    this.props = {};

    // Mock the generator
    this.stubPath = path.join(__dirname, 'fixtures/custom-generator-simple/main.js');
    this.cxtrSpy = sinon.spy();
    this.runSpy = sinon.spy();
    this.LocalDummy = generators.Base.extend({ constructor: this.cxtrSpy, run: this.runSpy });
    mockery.registerMock(this.stubPath, this.LocalDummy);
  });

  it('can create a generator layer', function() {
    var generatorLayer = layer.fromGenerator(
        require.resolve('./fixtures/custom-generator-simple/main')
    );
    generatorLayer(this.env, this.props);
    sinon.assert.calledOnce(this.runSpy);
    sinon.assert.calledOnce(this.cxtrSpy);
    sinon.assert.calledWith(this.cxtrSpy, [], {
      env: this.env,
      namespace: 'simple',
      resolved: this.stubPath,
    });
  });
});

