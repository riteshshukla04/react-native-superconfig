const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withRnHarness } = require('react-native-harness/metro');

const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  },
};

const mergedConfig = mergeConfig(getDefaultConfig(__dirname), config);

module.exports = withRnHarness(mergedConfig);
