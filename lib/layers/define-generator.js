'use strict';

var Class = require('class-extend');

module.exports = function (definition) {
  return Class.extend({
    constructor: function (args, options) {
      this.env = options.env;
    },

    run: function (cb) {
      this.env.runLoop.add('prompting', (completed) => {
        this.gatherInput()
          .then(this.queueLayers.bind(this))
          .then(completed);
      });

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
    }
  });
};
