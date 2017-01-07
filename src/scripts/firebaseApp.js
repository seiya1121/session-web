import firebase from 'firebase';
import { FIREBASE_CONFIG } from './api_key.js';
import Rebase from 're-base';

export const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
export const firebaseDb = firebaseApp.database();
export const firebaseAuth = firebaseApp.auth();
// export const base = Rebase.createClass(FIREBASE_CONFIG, 'session');
export const base = Rebase.createClass(FIREBASE_CONFIG, 'session-seiya');
