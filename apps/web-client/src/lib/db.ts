'use client';

import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

// Add dev mode plugin in development
if (process.env.NODE_ENV === 'development') {
    addRxPlugin(RxDBDevModePlugin);
}

const inventorySchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100,
        },
        part_number: {
            type: 'string',
        },
        nomenclature: {
            type: 'string',
        },
        quantity: {
            type: 'number',
        },
        status: {
            type: 'string',
        },
        location: {
            type: 'string',
        },
        updated_at: {
            type: 'string',
        },
        _synced: {
            type: 'boolean',
            default: false,
        },
    },
    required: ['id', 'part_number', 'nomenclature', 'quantity'],
};

let dbPromise: any = null;

export async function getDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = createRxDatabase({
        name: 'pocketopsdb',
        storage: getRxStorageDexie(),
    }).then(async (db) => {
        await db.addCollections({
            inventory: {
                schema: inventorySchema,
            },
        });
        return db;
    });

    return dbPromise;
}
