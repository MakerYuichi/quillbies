const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidX(config) {
  return withGradleProperties(config, (config) => {
    const properties = config.modResults;
    
    // Remove existing entries if present
    config.modResults = properties.filter(
      (p) => p.key !== 'android.useAndroidX' && p.key !== 'android.enableJetifier'
    );
    
    // Add the required properties
    config.modResults.push({ type: 'property', key: 'android.useAndroidX', value: 'true' });
    config.modResults.push({ type: 'property', key: 'android.enableJetifier', value: 'true' });
    
    return config;
  });
};
