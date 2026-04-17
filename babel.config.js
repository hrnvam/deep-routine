module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // В Expo используем ТОЛЬКО это вместо metro-react-native...
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};