module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Move this plugin to be before Reanimated:
      ['@babel/plugin-transform-private-methods', { 'loose': true }], 
      
      // The Reanimated plugin MUST be the last one:
      'react-native-reanimated/plugin', 
    ]
  };
};