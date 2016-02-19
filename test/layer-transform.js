'use strict';
var assert = require('yeoman-assert');
var sinon = require('sinon');
var env = require('yeoman-environment');
var layer = require('../lib/layers');
var TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;
var through = require('through2');

describe('layers', function() {
  beforeEach(function() {
    this.env = env.createEnv([], {}, new TestAdapter({foo: 'bar'}));
    this.props = {};
  });

  it('can create a transform layer', function(done) {
    var layerFn = sinon.spy();
    var transform = layer.transform(through.obj(function(file, enc, cb) {
      cb();
    }));
    transform(this.env, this.props);
    this.env.runLoop.once('end', () => {
      done();
    });
  });
});

