'use strict';
var assert = require('yeoman-assert');
var sinon = require('sinon');
var env = require('yeoman-environment');
var TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;
var proxyquire = require('proxyquire');
var defineGenerator = require('../lib/layers/define-generator');

describe('describeGenerator()', function () {
  beforeEach(function () {
    this.env = env.createEnv([], {}, new TestAdapter({foo: 'bar'}));
  });

  it('pass down env and the props to every layers', function (done) {
    var layer1 = sinon.spy();
    var layer2 = sinon.spy();
    var Gen = defineGenerator({
      input: [
        {name: 'foo'}
      ],

      layers: [
        layer1,
        layer2
      ]
    });

    var gen = new Gen([], {env: this.env});
    gen.run(() => {
      sinon.assert.calledOnce(layer1);
      sinon.assert.calledOnce(layer2);
      sinon.assert.calledWith(layer1, this.env, {foo: 'bar'});
      sinon.assert.calledWith(layer2, this.env, {foo: 'bar'});
      done();
    });
  });

  it('schedule post processing commands', function (done) {
    var emitter = sinon.spy();
    emitter.on = sinon.stub().withArgs('close').yields();
    var crossSpawn = sinon.stub().returns(emitter);
    var defineGenerator = proxyquire('../lib/layers/define-generator', {
      'cross-spawn': crossSpawn
    });

    var Gen = defineGenerator({
      postProcess: [
        'npm install',
        'npm install', // this call will be deduped
        'bower install jquery --save'
      ]
    });

    var gen = new Gen([], {env: this.env});
    gen.run(() => {
      sinon.assert.calledTwice(crossSpawn);
      sinon.assert.calledWith(crossSpawn, 'npm', ['install'], {stdio: 'inherit'});
      sinon.assert.calledWith(crossSpawn, 'bower', ['install', 'jquery', '--save'], {stdio: 'inherit'});
      done();
    });
  });

  it('schedule post processing commands as a function', function (done) {
    var emitter = sinon.spy();
    emitter.on = sinon.stub().withArgs('close').yields();
    var crossSpawn = sinon.stub().returns(emitter);
    var defineGenerator = proxyquire('../lib/layers/define-generator', {
      'cross-spawn': crossSpawn
    });

    var Gen = defineGenerator({
      input: [
        {name: 'foo'}
      ],

      postProcess: function (props) {
        assert.deepEqual(props, {foo: 'bar'});
        return ['bower install'];
      }
    });

    var gen = new Gen([], {env: this.env});
    gen.run(() => {
      sinon.assert.calledOnce(crossSpawn);
      sinon.assert.calledWith(crossSpawn, 'bower', ['install'], {stdio: 'inherit'});
      done();
    });
  });
});
