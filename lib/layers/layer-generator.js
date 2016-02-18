var _ = require('lodash');

module.exports = function(namespace, options) {
  return function(env, props) {
    options = options || {};
    if (_.isFunction(options)) {
      options = options(props)
    }

    assert(_.isString(namespace), 'The supplied argument `namespace` should be a path');
    var generator = env.create(namespace, {options});
    generator.run();
  }
}
