// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.

var REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  var processEnv = Object
    .keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]);
      return env;
    }, {
      // Useful for determining whether we’re running in production mode.
      // Most importantly, it switches React into the correct mode.
      'NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      // Useful for resolving the correct path to static assets in `public`.
      // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
      // This should only be used as an escape hatch. Normally you would put
      // images into the `src` and `import` them in code to get their paths.
      'PUBLIC_URL': JSON.stringify(publicUrl),
      'FIREBASE_DEV_API_KEY': JSON.stringify(process.env.FIREBASE_DEV_API_KEY),
      'FIREBASE_DEV_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_DEV_AUTH_DOMAIN),
      'FIREBASE_DEV_DATABASE_URL': JSON.stringify(process.env.FIREBASE_DEV_DATABASE_URL),
      'FIREBASE_DEV_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_DEV_STORAGE_BUCKET),
      'YOUTUBE_API_KEY': JSON.stringify(process.env.YOUTUBE_API_KEY)
    });
  return {'process.env': processEnv};
}

module.exports = getClientEnvironment;
