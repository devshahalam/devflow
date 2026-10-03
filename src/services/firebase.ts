import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseApp = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
});

export const db = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
