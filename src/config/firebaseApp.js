import firebase from 'firebase';
import { FIREBASE_CONFIG } from './apiKey';
import Rebase from 're-base';

const ref = (process.env.NODE_ENV === 'production') ? 'session' : 'session-seiya';
export const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
export const firebaseAuth = firebase.auth();
export const firebaseDB = firebaseApp.database();
export const provider = new firebase.auth.GoogleAuthProvider();
export const base = Rebase.createClass(FIREBASE_CONFIG, ref);
