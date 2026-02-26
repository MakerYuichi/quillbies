const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidX(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => item.key !== 'android.useAndroidX' && 
                item.key !== 'android.enableJetifier'
    );
    config.modResults.push(
      { type: 'property', key: 'android.useAndroidX', value: 'true' },
      { type: 'property', key: 'android.enableJetifier', value: 'true' }
    );
    return config;
  });
};
