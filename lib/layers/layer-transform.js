var _ = require('lodash');
var debug = require('debug')('yeoman:generator');
var transformUtils = require('../util/layer-utils.js').transformUtils;
var runAsync = require('run-async');

module.exports = function(transform) {
  return function(env, props) {
    env.runLoop.add('conflicts', function(completed) {
      env.sharedFs.stream()
        .pipe(transform)
        .pipe(through.obj(function(file, enc, cb) {
          env.sharedFs.add(file);
          this.push(file);
          cb();
        })
        .on('finish', completed);
    });
  }
}
