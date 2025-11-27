import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - using environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let firebaseInitialized = false;
let app: any = null;
let db: any = null;
let auth: any = null;
let currentUserId: string | null = null;

/**
 * Initialize Firebase App, Auth, and Firestore
 * Returns the authenticated user ID
 */
export const initializeFirebase = async (): Promise<string> => {
    if (firebaseInitialized) {
        return currentUserId || 'anonymous';
    }

    try {
        // Check if Firebase config is available
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            console.warn('[Firebase] No configuration found. Running in mock mode.');
            firebaseInitialized = true;
            return 'mock-user';
        }

        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Sign in anonymously for persistence
        const userCredential = await signInAnonymously(auth);
        currentUserId = userCredential.user.uid;

        firebaseInitialized = true;
        console.log('[Firebase] Initialized successfully');

        return currentUserId;
    } catch (error) {
        console.error('[Firebase] Initialization error:', error);
        firebaseInitialized = true; // Mark as initialized to prevent retry loops
        return 'error-user';
    }
};

export const getDb = () => db;
export const getAuthInstance = () => auth;
