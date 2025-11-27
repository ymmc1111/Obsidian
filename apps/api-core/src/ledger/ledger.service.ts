import { Injectable, OnModuleInit } from '@nestjs/common';
import { pool } from '@pocket-ops/database';
import { CryptoService } from '../crypto/crypto.service';
import { v4 as uuidv4 } from 'uuid';
import { log } from '@pocket-ops/logger';

export interface LedgerEventPayload {
    action_type: 'BATCH_CREATE' | 'STEP_SIGN' | 'DEVIATION_LOG' | 'SYSTEM_OVERRIDE' | 'DEPLOYMENT';
    actor_id: string;
    secondary_actor_id?: string;
    payload: any;
}

@Injectable()
export class LedgerService implements OnModuleInit {
    // Temporary key storage for demonstration. In production, this comes from KMS/HSM.
    private serverPrivateKey: string;
    private serverPublicKey: string;

    constructor(private cryptoService: CryptoService) {
        const keys = this.cryptoService.generateKeyPair();
        this.serverPrivateKey = keys.privateKey;
        this.serverPublicKey = keys.publicKey;
    }

    async onModuleInit() {
        // Ensure DB connection is healthy
        try {
            await pool.query('SELECT NOW()');
            log.info('LedgerService: Database connected.');
        } catch (error) {
            log.error('LedgerService: Database connection failed.', { error });
        }
    }

    async recordEvent(event: LedgerEventPayload) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get the latest hash
            const lastEventResult = await client.query(
                'SELECT * FROM ledger_events ORDER BY timestamp DESC LIMIT 1'
            );

            // Genesis hash if no previous events
            let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

            if (lastEventResult.rows.length > 0) {
                const row = lastEventResult.rows[0];
                // Calculate the hash of the last row to serve as prev_hash for the new row
                // We hash: prev_hash + actor_id + action_type + payload + signature + timestamp
                const dataToHash = `${row.prev_hash}${row.actor_id}${row.action_type}${JSON.stringify(row.payload)}${row.signature}${row.timestamp}`;
                prevHash = this.cryptoService.hash(dataToHash);
            }

            // 2. Prepare the new row data
            const id = uuidv4();
            const timestamp = Date.now();
            const payloadString = JSON.stringify(event.payload);

            // 3. Sign the payload (and critical metadata)
            // We sign: prevHash + actorId + actionType + payload + timestamp
            const dataToSign = `${prevHash}${event.actor_id}${event.action_type}${payloadString}${timestamp}`;
            const signature = this.cryptoService.sign(dataToSign, this.serverPrivateKey);

            // 4. Insert
            const queryText = `
        INSERT INTO ledger_events 
        (id, prev_hash, actor_id, secondary_actor_id, action_type, payload, signature, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

            await client.query(queryText, [
                id,
                prevHash,
                event.actor_id,
                event.secondary_actor_id || null,
                event.action_type,
                event.payload,
                signature,
                timestamp
            ]);

            await client.query('COMMIT');
            log.audit(`LedgerService: Event recorded. ID: ${id}`, {
                actor: event.actor_id,
                action: event.action_type,
                eventId: id
            });
            return { id, status: 'COMMITTED' };

        } catch (e) {
            await client.query('ROLLBACK');
            log.error('LedgerService: Transaction failed', { error: e });
            throw e;
        } finally {
            client.release();
        }
    }

    async getLatestEvents(limit = 10) {
        const result = await pool.query('SELECT * FROM ledger_events ORDER BY timestamp DESC LIMIT $1', [limit]);
        return result.rows;
    }
}
