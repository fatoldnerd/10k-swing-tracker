import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// Check if Firebase credentials are properly configured
const hasValidFirebaseConfig = () => {
  const values = [
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ];

  return values.every(value => {
    return value && value !== '' && !value.startsWith('PUT_YOUR_REAL_') && value !== 'your-';
  });
};

// Default/mock configuration for development when real config is not available
const defaultConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:demo',
};

const firebaseConfig = hasValidFirebaseConfig() ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} : defaultConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Track if we're using mock configuration
export const isUsingMockConfig = !hasValidFirebaseConfig();

// Connect to emulator in development or when using mock config
const shouldUseEmulator = process.env.NODE_ENV === 'development' && 
  (isUsingMockConfig || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR_DISABLED !== 'true');

if (shouldUseEmulator) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.warn('Firebase emulator connection failed:', error);
    console.warn('Continuing with offline mode...');
  }
}

if (isUsingMockConfig) {
  console.warn('⚠️  Using mock Firebase configuration. Please update your .env.local file with real Firebase credentials for full functionality.');
} else {
  console.log('✅ Connected to real Firebase project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

export default app;