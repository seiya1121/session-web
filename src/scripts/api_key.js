const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_DEV_API_KEY,
  authDomain: process.env.FIREBASE_DEV_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DEV_DATABASE_URL,
  storageBucket: process.env.FIREBASE_DEV_STORAGE_BUCKET,
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export { FIREBASE_CONFIG, YOUTUBE_API_KEY };
