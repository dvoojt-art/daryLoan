'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


export const firebaseConfig = {
  apiKey: 'AIzaSyDW-ht6L3mHpoE3npFEtfkBkOKBwPrJDW8',
  authDomain: 'studio-547639024-dacfc.firebaseapp.com',
  projectId: 'studio-547639024-dacfc',
  storageBucket: 'studio-547639024-dacfc.firebasestorage.app',
  messagingSenderId: '978179476924',
  appId: '1:978179476924:web:3ff8c4971e36daaeff2fb9',
};

export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);