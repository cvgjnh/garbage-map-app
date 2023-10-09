// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

export default ({ config }) => ({
  ...config,
  // ...
  android: {
    googleServicesFile: process.env.EXPO_PUBLIC_GOOGLE_SERVICES_JSON,
    // ...
  },
});
