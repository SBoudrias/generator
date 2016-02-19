'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var Class = require('class-extend');
var dedent = require('dedent');
var Conflicter = require('../util/conflicter');
var conflictResolutionStream = require('../util/conflict-resolution-stream');
var FileEditor = require('mem-fs-editor');
var spawn = require('cross-spawn');
var yeoman = require('yeoman-environment');

module.exports = function (definition) {
  definition = _.extend({
    layers: [],
    postProcess: []
  }, definition);

  return Class.extend({
    constructor: function (args, options) {
      this.env = options.env;
      this.options = options || {};
      this.args = args || [];

      yeoman.enforceUpdate(this.env);

      this.fs = FileEditor.create(this.env.sharedFs);
      this.conflicter = new Conflicter(this.env.adapter, this.options.force);
      this.log = this.env.adapter.log;
    },

    run: function (cb) {
      this.env.runLoop.add('prompting', (completed) => {
        this.gatherInput()
          .then(this.queueLayers.bind(this))
          .then(this.queuePostProcessing.bind(this))
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
      return new Promise((resolve) => {
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
      return props;
    },

    queuePostProcessing: function (props) {
      var commands = definition.postProcess;

      if (_.isFunction(definition.postProcess)) {
        commands = definition.postProcess(props);
      }

      commands.forEach((command) => {
        this.env.runLoop.add('install', (done) => {
          var splitCmd = command.split(' ');
          spawn(splitCmd[0], splitCmd.slice(1), {stdio: 'inherit'})
            .on('close', (err) => {
              if (err === 127) {
                this.log.error(dedent`
                  Could not find ${splitCmd[0]} on your system. Make sure it is
                  installed and available through your PATH variable.

                  You can also try running it manually:

                  $ ${chalk.cyan(command)}
                `);
              }
              done();
            });
        }, { once: command });
      });

      return props;
    },

    commit: function (done) {
      var conflicter = this.conflicter;

      this.fs.commit([conflictResolutionStream(conflicter)], function () {
        done();
      });
    }
  });
};
