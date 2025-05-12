import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

let app;
let auth: Auth;
let db;
let storage;

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock services for development
  auth = {
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {}; // Return a no-op function as unsubscribe
    },
    signInWithEmailAndPassword: async () => {
      throw new Error('Authentication is not available');
    },
    createUserWithEmailAndPassword: async () => {
      throw new Error('Authentication is not available');
    },
    signOut: async () => {
      throw new Error('Authentication is not available');
    },
  } as unknown as Auth;
  db = {
    collection: () => ({
      add: async () => ({ id: 'mock-id' }),
      get: async () => ({ docs: [] }),
    }),
  };
  storage = {
    ref: () => ({
      put: async () => ({ ref: { getDownloadURL: async () => 'mock-url' } }),
    }),
  };
}

export { auth, db, storage };
export default app; 