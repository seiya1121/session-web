import firebase from 'firebase';
import { FIREBASE_CONFIG } from './apiKey.js';
import Rebase from 're-base';

const ref = (process.env.NODE_ENV === 'production') ? 'session' : 'session';
console.log(ref);
export const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
export const firebaseDb = firebaseApp.database();
export const sessionDb = firebaseDb.ref(ref);
export const firebaseAuth = firebaseApp.auth();
export const base = Rebase.createClass(FIREBASE_CONFIG, ref);
