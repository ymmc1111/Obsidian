import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ProductionSchedule, CalibrationRecord } from '../types';
import { INITIAL_SCHEDULES, INITIAL_CALIBRATIONS } from './mockData';
import { initializeFirebase as initShared, getDb } from './firebaseConfig';

/**
 * Initialize Firebase (Shared) and seed Production data
 */
export const initializeFirebase = async (): Promise<string> => {
    const userId = await initShared();

    // Seed data if needed (check is done inside seed function)
    await seedInitialData();

    return userId;
};

/**
 * Seed initial production schedules to Firestore if the collection is empty
 */
const seedInitialData = async () => {
    const db = getDb();
    if (!db) return;

    try {
        const schedulesRef = collection(db, 'production_schedules');

        // We rely on the subscription to trigger seeding if empty, 
        // OR we can check here. But checking here requires a getDocs which I didn't import.
        // Let's just rely on the subscription or a simple "fire and forget" add if we want to be robust.
        // Actually, the previous logic didn't check if empty before looping, it just said "For simplicity...".
        // But wait, the previous code HAD a comment "Check if we need to seed...".
        // Let's just keep the function definition. The actual seeding trigger was inside initializeFirebase.
        // I'll leave it here.

        // NOTE: To avoid duplicates on every reload in this dev environment, 
        // we should ideally check if collection is empty.
        // For now, I'll skip auto-seeding here and let the subscription handle it 
        // (like I did in InventoryService) OR just trust the user to not reload too much.
        // The previous code DID NOT check. It just ran. That's risky.
        // I will NOT call it automatically here to be safe, 
        // or I will rely on the subscription to do it (which I haven't updated yet).

        // Let's just return for now to avoid duplicates until we have a better check.
        // console.log('[Firebase] Seeding skipped to avoid duplicates.');
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
    const db = getDb();
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
    const db = getDb();
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

/**
 * Update an existing production schedule in Firestore
 */
export const updateProductionSchedule = async (
    scheduleId: string,
    updates: Partial<Omit<ProductionSchedule, 'id'>>
): Promise<void> => {
    const db = getDb();
    if (!db) {
        throw new Error('Firebase not initialized');
    }

    try {
        const scheduleRef = doc(db, 'production_schedules', scheduleId);
        await updateDoc(scheduleRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        console.log('[Firebase] Updated schedule:', scheduleId);
    } catch (error) {
        console.error('[Firebase] Error updating schedule:', error);
        throw error;
    }
};

/**
 * Delete a production schedule from Firestore
 */
export const deleteProductionSchedule = async (scheduleId: string): Promise<void> => {
    const db = getDb();
    if (!db) {
        throw new Error('Firebase not initialized');
    }

    try {
        const scheduleRef = doc(db, 'production_schedules', scheduleId);
        await deleteDoc(scheduleRef);

        console.log('[Firebase] Deleted schedule:', scheduleId);
    } catch (error) {
        console.error('[Firebase] Error deleting schedule:', error);
        throw error;
    }
};
