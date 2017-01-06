// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.

const REACT_APP = /^REACT_APP_/i;

const getClientEnvironment = (publicUrl) => {
  const processEnv = Object
    .keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]);
      return env;
    },
    {
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'PUBLIC_URL': JSON.stringify(publicUrl),
    });
  return {'process.env': processEnv};
}

module.exports = getClientEnvironment;
