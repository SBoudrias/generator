'use strict';
var path = require('path');
var through = require('through2');

module.exports = function (conflicter) {
  return through.obj(function (file, enc, cb) {
    // If the file has no state requiring action, move on
    if (file.state == null) {
      return cb();
    }

    // Config file should not be processed by the conflicter. Just pass through
    var filename = path.basename(file.path);

    if (filename === '.yo-rc.json' || filename === '.yo-rc-global.json') {
      this.push(file);
      return cb();
    }

    conflicter.checkForCollision(file.path, file.contents, (err, status) => {
      if (err) {
        cb(err);
        return;
      }

      if (status === 'skip') {
        delete file.state;
      } else {
        this.push(file);
      }

      cb();
    });
    conflicter.resolve();
  });
};
