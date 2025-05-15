import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { AppCheck, initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth, Auth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp | null = null;
let appCheck: AppCheck;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
  auth = getAuth(app);
  auth.languageCode = 'zh-CN';
  db = getFirestore(app);
  storage = getStorage(app);

  console.log('Firebase initialized successfully');
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
  } as unknown as Firestore;
  storage = {
    ref: () => ({
      put: async () => ({ ref: { getDownloadURL: async () => 'mock-url' } }),
    }),
  } as unknown as FirebaseStorage;
}

export { auth, db, storage };
export default app;
