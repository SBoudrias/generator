'use strict';
var FileEditor = require('mem-fs-editor');

module.exports = (env) => ({
  fs: FileEditor.create(env.sharedFs),
  log: env.adapter.log,
});
