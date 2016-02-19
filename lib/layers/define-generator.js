'use strict';
var Class = require('class-extend');
var Conflicter = require('../util/conflicter');
var conflictResolutionStream = require('../util/conflict-resolution-stream');
var FileEditor = require('mem-fs-editor');
var yeoman = require('yeoman-environment');

module.exports = function (definition) {
  return Class.extend({
    constructor: function (args, options) {
      this.env = options.env;
      this.options = options || {};
      this.args = args || [];

      yeoman.enforceUpdate(this.env);

      this.fs = FileEditor.create(this.env.sharedFs);
      this.conflicter = new Conflicter(this.env.adapter, this.options.force);
    },

    run: function (cb) {
      this.env.runLoop.add('prompting', (completed) => {
        this.gatherInput()
          .then(this.queueLayers.bind(this))
          .then(completed);
      });

      var scheduleFileWrites = () => {
        this.env.runLoop.add('conflicts', this.commit.bind(this), {
          once: 'write memory fs to disk'
        });
      };

      this.env.sharedFs.on('change', scheduleFileWrites);
      scheduleFileWrites();

      this.env.runLoop.once('end', cb);
    },

    gatherInput: function () {
      return new Promise((resolve, reject) => {
        if (!definition.input) {
          resolve({});
          return;
        }

        this.env.adapter.prompt(definition.input, resolve);
      });
    },

    queueLayers: function (props) {
      definition.layers.forEach((layer) => {
        layer(this.env, props);
      });
    },

    commit: function (done) {
      var conflicter = this.conflicter;

      this.fs.commit([conflictResolutionStream(conflicter)], function () {
        done();
      });
    }
  });
};
