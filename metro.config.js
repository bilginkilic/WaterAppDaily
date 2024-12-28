const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname)],
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')]
  },
  watcher: {
    watchman: {
      crawlSymlinks: false
    }
  },
  maxWorkers: 2
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
