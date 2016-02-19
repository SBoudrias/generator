'use strict';
var through = require('through2');

module.exports = function (transform) {
  return function (env) {
    env.runLoop.add('conflicts', function (completed) {
      env.sharedFs.stream()
        .pipe(transform)
        .pipe(through.obj(function (file, enc, cb) {
          env.sharedFs.add(file);
          this.push(file);
          cb();
        }))
        .on('finish', completed);
    });
  };
};
