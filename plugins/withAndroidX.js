const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidX(config) {
  return withGradleProperties(config, (config) => {
    // Remove existing entries if present
    config.modResults = config.modResults.filter(
      (p) => p.key !== 'android.useAndroidX' && p.key !== 'android.enableJetifier'
    );
    
    // Add the required properties
    config.modResults.push(
      { type: 'property', key: 'android.useAndroidX', value: 'true' },
      { type: 'property', key: 'android.enableJetifier', value: 'true' }
    );
    
    console.log('[withAndroidX] Added AndroidX properties to gradle.properties');
    
    return config;
  });
};
