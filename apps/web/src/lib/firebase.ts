import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration for fitness-app-bupe-staging
const firebaseConfig = {
  apiKey: "AIzaSyAGhmmERHqlE_6f2jFAALXiQFrtpy5fims",
  authDomain: "fitness-app-bupe-staging.firebaseapp.com",
  projectId: "fitness-app-bupe-staging",
  storageBucket: "fitness-app-bupe-staging.firebasestorage.app",
  messagingSenderId: "717122355693",
  appId: "1:717122355693:web:7b224927c57a2cc10b67e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Development mode configuration
const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  // Connect to emulators in development
  try {
    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    console.log('🔧 Connected to Firebase emulators for development');
  } catch (error) {
    console.log('⚠️ Firebase emulators not available, using production services');
  }
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
