import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Emulator configuration based on environment variables
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const isDevelopment = import.meta.env.DEV;

if (isDevelopment && useEmulators) {
  // Connect to emulators only if explicitly enabled
  try {
    const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
    const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT || '9099';
    const firestorePort = import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || '8080';

    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true });
    }
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, emulatorHost, parseInt(firestorePort));
    }
    console.log('🔧 Connected to Firebase emulators for development');
  } catch (error) {
    console.log('⚠️ Firebase emulators not available, using production services');
  }
} else {
  console.log('🔥 Using production Firebase services');
}

// Enhanced error handling for auth domain issues
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ User authenticated:', user.uid);
  } else {
    console.log('🔓 User not authenticated');
  }
}, (error) => {
  console.error('🚨 Auth state change error:', error);
  if (error.code === 'auth/invalid-credential') {
    console.error('❌ Invalid Firebase credentials. Please check your Firebase configuration.');
  }
});

// Note: Using production Firebase services
console.log('🔥 Firebase initialized');
console.log('📊 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing',
  environment: isDevelopment ? 'development' : 'production'
});

export default app;
