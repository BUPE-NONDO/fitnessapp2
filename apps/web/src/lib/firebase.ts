import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Note: Using production Firebase services
console.log('🔥 Firebase initialized for production');
console.log('📊 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing'
});

export default app;
