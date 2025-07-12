// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBDPhWlVN-JGmaoiPItj3OAx1n_pCybAd0",
  authDomain: "mahjong-ef569.firebaseapp.com",
  projectId: "mahjong-ef569",
  storageBucket: "mahjong-ef569.firebasestorage.app",
  messagingSenderId: "679499878449",
  appId: "1:679499878449:web:0e8d778d672257a2fac510"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
