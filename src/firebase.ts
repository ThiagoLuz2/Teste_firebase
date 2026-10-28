import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function requiredFirebaseEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing Firebase configuration: ${name}. Set it in .env.local.`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requiredFirebaseEnv('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: requiredFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: requiredFirebaseEnv('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: requiredFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: requiredFirebaseEnv(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: requiredFirebaseEnv('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const authStateReady = new Promise<User | null>((resolve, reject) => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      unsubscribe();
      resolve(user);
    },
    (error) => {
      unsubscribe();
      reject(error);
    },
  );
});
