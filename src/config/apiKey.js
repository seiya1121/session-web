const isProduction = process.env.NODE_ENV === 'production';

export const FIREBASE_CONFIG = {
	apiKey: isProduction ? process.env.REACT_APP_FIREBASE_API_KEY : process.env.REACT_APP_DEV_FIREBASE_API_KEY,
	authDomain: isProduction ? process.env.REACT_APP_FIREBASE_AUTH_DOMAIN : process.env.REACT_APP_DEV_FIREBASE_AUTH_DOMAIN,
	databaseURL: isProduction ? process.env.REACT_APP_FIREBASE_DATABASE_URL : process.env.REACT_APP_DEV_FIREBASE_DATABASE_URL,
	storageBucket: isProduction ? process.env.REACT_APP_FIREBASE_STORAGE_BUCKET : process.env.REACT_APP_DEV_FIREBASE_STORAGE_BUCKET,
};

export const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
