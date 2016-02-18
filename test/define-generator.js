'use strict';
var sinon = require('sinon');
var env = require('yeoman-environment');
var TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;
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
});
