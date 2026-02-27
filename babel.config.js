module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true, // Required for Zustand 4 with React 19
        },
      ],
    ],
  };
};
