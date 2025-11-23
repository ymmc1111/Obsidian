import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { InventoryItem } from '../types';
import { INITIAL_INVENTORY } from './mockData';
import { initializeFirebase, getDb } from './firebaseConfig';

/**
 * Subscribe to real-time inventory updates
 */
export const subscribeToInventory = (
    callback: (items: InventoryItem[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    const db = getDb();
    if (!db) {
        console.warn('[Firebase] Not initialized. Using mock data for inventory.');
        callback(INITIAL_INVENTORY);
        return () => { };
    }

    try {
        const inventoryRef = collection(db, 'inventory');
        // Order by partNumber for now
        const q = query(inventoryRef, orderBy('partNumber', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: InventoryItem[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id, // Use Firestore ID
                        partNumber: data.partNumber,
                        nomenclature: data.nomenclature,
                        cageCode: data.cageCode,
                        serialNumber: data.serialNumber,
                        location: data.location,
                        quantity: data.quantity,
                        unitCost: data.unitCost,
                        status: data.status,
                        sensitivity: data.sensitivity,
                        batchLot: data.batchLot,
                        expirationDate: data.expirationDate
                    } as InventoryItem;
                });

                console.log(`[Firebase] Received ${items.length} inventory items`);

                // If empty, seed data
                if (items.length === 0) {
                    seedInitialInventory();
                }

                callback(items);
            },
            (error) => {
                console.error('[Firebase] Inventory snapshot error:', error);
                if (onError) onError(error as Error);
                callback(INITIAL_INVENTORY);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('[Firebase] Inventory subscription error:', error);
        if (onError) onError(error as Error);
        callback(INITIAL_INVENTORY);
        return () => { };
    }
};

/**
 * Get all inventory items (one-time fetch)
 */
export const getInventory = async (): Promise<InventoryItem[]> => {
    const db = getDb();
    if (!db) return INITIAL_INVENTORY;

    try {
        const inventoryRef = collection(db, 'inventory');
        const q = query(inventoryRef, orderBy('partNumber', 'asc'));
        const snapshot = await import('firebase/firestore').then(m => m.getDocs(q));

        if (snapshot.empty) {
            await seedInitialInventory();
            return INITIAL_INVENTORY; // Return mock data as fallback/seed result
        }

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as InventoryItem));
    } catch (error) {
        console.error('[Firebase] Error fetching inventory:', error);
        return INITIAL_INVENTORY;
    }
};

/**
 * Add a new inventory item
 */
export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<string> => {
    const db = getDb();
    if (!db) throw new Error('Firebase not initialized');

    try {
        const inventoryRef = collection(db, 'inventory');
        const docRef = await addDoc(inventoryRef, {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        console.log('[Firebase] Added inventory item:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('[Firebase] Error adding inventory item:', error);
        throw error;
    }
};

/**
 * Update an inventory item
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
    const db = getDb();
    if (!db) throw new Error('Firebase not initialized');

    try {
        const itemRef = doc(db, 'inventory', id);
        await updateDoc(itemRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        console.log('[Firebase] Updated inventory item:', id);
    } catch (error) {
        console.error('[Firebase] Error updating inventory item:', error);
        throw error;
    }
};

/**
 * Seed initial inventory data
 */
const seedInitialInventory = async () => {
    const db = getDb();
    if (!db) return;

    try {
        console.log('[Firebase] Seeding initial inventory...');
        const inventoryRef = collection(db, 'inventory');

        for (const item of INITIAL_INVENTORY) {
            // Remove the ID from the mock data so Firestore generates a new one, 
            // OR use the mock ID as the doc ID. Using mock ID is better for consistency if we want to preserve them.
            // But addDoc generates a new ID. setDoc allows specifying ID.
            // For simplicity, let's just use addDoc and let Firestore decide, 
            // but we might lose the exact IDs from mock data (INV-001 etc).
            // Actually, let's strip the ID and let Firestore assign one.
            const { id, ...itemData } = item;
            await addDoc(inventoryRef, {
                ...itemData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        console.log('[Firebase] Inventory seeded.');
    } catch (error) {
        console.error('[Firebase] Error seeding inventory:', error);
    }
};
