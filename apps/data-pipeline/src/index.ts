import { createClient } from '@clickhouse/client';
import { pool } from '@pocket-ops/database';
import { log } from '@pocket-ops/logger';

// Initialize ClickHouse Client
const clickhouse = createClient({
    host: 'http://localhost:8123',
    username: 'default',
    password: 'password',
    database: 'default',
});

async function initClickHouse() {
    log.info('Initializing ClickHouse...');
    await clickhouse.exec({
        query: `
      CREATE TABLE IF NOT EXISTS ledger_events_olap (
        id String,
        action_type String,
        actor_id String,
        secondary_actor_id String,
        payload String,
        prev_hash String,
        hash String,
        signature String,
        timestamp UInt64
      )
      ENGINE = MergeTree()
      ORDER BY (timestamp, action_type)
    `,
    });
    log.info('ClickHouse table ready.');
}

async function syncData() {
    try {
        // 1. Get latest timestamp from ClickHouse
        const result = await clickhouse.query({
            query: 'SELECT max(timestamp) as last_ts FROM ledger_events_olap',
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        const lastTs = rows[0]?.last_ts || 0;

        log.info(`Syncing events after timestamp: ${lastTs}`);

        // 2. Fetch new events from Postgres
        const pgRes = await pool.query(
            'SELECT * FROM ledger_events WHERE timestamp > $1 ORDER BY timestamp ASC LIMIT 1000',
            [lastTs]
        );

        if (pgRes.rows.length === 0) {
            log.info('No new events to sync.');
            return;
        }

        log.info(`Found ${pgRes.rows.length} new events.`);

        // 3. Insert into ClickHouse
        await clickhouse.insert({
            table: 'ledger_events_olap',
            values: pgRes.rows.map(row => ({
                id: row.id,
                action_type: row.action_type,
                actor_id: row.actor_id,
                secondary_actor_id: row.secondary_actor_id || '',
                payload: JSON.stringify(row.payload),
                prev_hash: row.prev_hash,
                hash: row.hash,
                signature: row.signature,
                timestamp: Number(row.timestamp), // Ensure number
            })),
            format: 'JSONEachRow',
        });

        log.info(`Successfully synced ${pgRes.rows.length} events.`);
    } catch (e) {
        log.error('Sync failed', { error: e });
    }
}

async function main() {
    await initClickHouse();

    // Run sync every 5 seconds
    setInterval(syncData, 5000);
    syncData(); // Initial run
}

main().catch(console.error);
