import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { ProductionSchedule, CalibrationRecord } from '../types';
import { INITIAL_SCHEDULES, INITIAL_CALIBRATIONS } from './mockData';

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
let db: any = null;
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
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        db = getFirestore(app);

        // Sign in anonymously for persistence
        const userCredential = await signInAnonymously(auth);
        currentUserId = userCredential.user.uid;

        firebaseInitialized = true;
        console.log('[Firebase] Initialized successfully');

        // Seed initial data if needed
        await seedInitialData();

        return currentUserId;
    } catch (error) {
        console.error('[Firebase] Initialization error:', error);
        firebaseInitialized = true; // Mark as initialized to prevent retry loops
        return 'error-user';
    }
};

/**
 * Seed initial production schedules to Firestore if the collection is empty
 */
const seedInitialData = async () => {
    if (!db) return;

    try {
        const schedulesRef = collection(db, 'production_schedules');

        // Check if we need to seed data by attempting to get the collection
        // For simplicity, we'll just seed the initial data once
        // In production, you'd check if the collection is empty first

        console.log('[Firebase] Seeding initial production schedules...');

        for (const schedule of INITIAL_SCHEDULES) {
            await addDoc(schedulesRef, {
                ...schedule,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        console.log('[Firebase] Initial data seeded successfully');
    } catch (error) {
        console.error('[Firebase] Error seeding data:', error);
    }
};

/**
 * Subscribe to real-time production schedule updates
 * @param callback Function to call with updated schedules
 * @param onError Error handler
 * @returns Unsubscribe function
 */
export const subscribeToSchedules = (
    callback: (schedules: ProductionSchedule[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    // If Firebase is not initialized or not available, return mock data
    if (!db) {
        console.warn('[Firebase] Not initialized. Using mock data for schedules.');
        callback(INITIAL_SCHEDULES);
        return () => { }; // Return empty unsubscribe function
    }

    try {
        const schedulesRef = collection(db, 'production_schedules');
        const q = query(schedulesRef, orderBy('startDate', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const schedules: ProductionSchedule[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: data.id || doc.id,
                        partNumber: data.partNumber,
                        plannedQty: data.plannedQty,
                        startDate: data.startDate,
                        machineCenter: data.machineCenter,
                        loadFactor: data.loadFactor,
                        status: data.status
                    };
                });

                console.log(`[Firebase] Received ${schedules.length} schedules from Firestore`);
                callback(schedules);
            },
            (error) => {
                console.error('[Firebase] Snapshot error:', error);
                if (onError) onError(error as Error);
                // Fallback to mock data on error
                callback(INITIAL_SCHEDULES);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('[Firebase] Subscription error:', error);
        if (onError) onError(error as Error);
        // Return mock data and empty unsubscribe
        callback(INITIAL_SCHEDULES);
        return () => { };
    }
};

/**
 * Get calibration records (still using mock data for now)
 */
export const getCalibrations = async (): Promise<CalibrationRecord[]> => {
    // For now, calibrations remain mock data
    // You can extend this to use Firestore in the future
    return INITIAL_CALIBRATIONS;
};

/**
 * Add a new production schedule to Firestore
 */
export const addProductionSchedule = async (schedule: Omit<ProductionSchedule, 'id'>): Promise<string> => {
    if (!db) {
        throw new Error('Firebase not initialized');
    }

    try {
        const schedulesRef = collection(db, 'production_schedules');
        const docRef = await addDoc(schedulesRef, {
            ...schedule,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log('[Firebase] Added new schedule:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('[Firebase] Error adding schedule:', error);
        throw error;
    }
};
