const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = function override(config, env) {
  config.plugins.push(new NodePolyfillPlugin());
  let loaders = config.resolve;
  loaders.fallback = {
    fs: false,
    net: false,
    async_hooks: false,
  };
  return config;
};
