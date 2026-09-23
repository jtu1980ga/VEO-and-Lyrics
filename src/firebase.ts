import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth & Firestore instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Enable select account prompt
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export default app;
