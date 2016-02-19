'use strict';
var _ = require('lodash');
var debug = require('debug')('yeoman:generator');
var fsUtils = require('../util/layer-utils.js');
var runAsync = require('run-async');

module.exports = function (func) {
  return function (env, props) {
    env.runLoop.add('writing', function (completed) {
      runAsync(
        function () {
          var context = _.extend(fsUtils(env), {
            async: this.async.bind(this)
          });
          func.apply(context, props);
        },
        function (err) {
          if (err) {
            debug('An error occured while running ', err);
            return;
          }
          completed();
        }
      );
    });
  };
};
