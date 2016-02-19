'use strict';
var assert = require('yeoman-assert');
var Conflicter = require('../lib/util/conflicter');
var conflictResolutionStream = require('../lib/util/conflict-resolution-stream');
var sinon = require('sinon');
var TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;
var gutil = require('gulp-util');

describe('conflictResolutionStream()', function () {
  beforeEach(function () {
    this.conflicter = sinon.spy();
    this.conflicter.checkForCollision = sinon.stub();
    this.conflicter.resolve = sinon.spy();

    this.stream = conflictResolutionStream(this.conflicter);
  });

  it('skip config files', function (done) {
    var configFile = new gutil.File({
      path: '.yo-rc.json'
    });
    configFile.state = 'created';
    var globalConfigFile = new gutil.File({
      path: '.yo-rc-global.json'
    });
    globalConfigFile.state = 'created';

    var files = [];
    this.stream.on('data', (file) => files.push(file.path));
    this.stream.on('finish', () => {
      sinon.assert.notCalled(this.conflicter.resolve);
      sinon.assert.notCalled(this.conflicter.checkForCollision);
      assert.deepEqual(files, ['.yo-rc.json', '.yo-rc-global.json']);
      done();
    });

    this.stream.write(configFile);
    this.stream.write(globalConfigFile);
    this.stream.end();
  });

  it('can skip files', function (done) {
    this.conflicter.checkForCollision.callsArgWith(2, null, 'skip')

    var files = [];
    this.stream.on('data', (file) => files.push(file.path));
    this.stream.on('finish', () => {
      assert.equal(files.length, 0);
      sinon.assert.calledOnce(this.conflicter.resolve);
      done();
    });

    var dummyFile = new gutil.File();
    dummyFile.state = 'created';
    this.stream.write(dummyFile);
    this.stream.end();
  });

  it('can write files', function (done) {
    this.conflicter.checkForCollision.callsArgWith(2, null, 'create')

    var files = [];
    this.stream.on('data', (file) => files.push(file.path));
    this.stream.on('finish', () => {
      assert.equal(files.length, 1);
      sinon.assert.calledOnce(this.conflicter.resolve);
      done();
    });

    var dummyFile = new gutil.File();
    dummyFile.state = 'created';
    this.stream.write(dummyFile);
    this.stream.end();
  });

  it('skip files not requiring any actions', function (done) {
    var files = [];
    this.stream.on('data', (file) => files.push(file.path));
    this.stream.on('finish', () => {
      assert.equal(files.length, 0);
      sinon.assert.notCalled(this.conflicter.resolve);
      done();
    });

    var dummyFile = new gutil.File();
    dummyFile.state = null;
    this.stream.write(dummyFile);
    this.stream.end();
  });
});
