const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withHermesEnabled(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('project.ext.hermesEnabled')) {
      config.modResults.contents = config.modResults.contents.replace(
        'apply plugin: "com.facebook.react"',
        'apply plugin: "com.facebook.react"\nproject.ext.hermesEnabled = (findProperty(\'hermesEnabled\') ?: \'true\').toBoolean()'
      );
    }
    return config;
  });
};
