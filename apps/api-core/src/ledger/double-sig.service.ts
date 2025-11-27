import { Injectable } from '@nestjs/common';
import { pool } from '@pocket-ops/database';
import { log } from '@pocket-ops/logger';
import { LedgerService } from '../ledger/ledger.service';
import { v4 as uuidv4 } from 'uuid';

export interface CreatePendingActionDto {
    initiator_id: string;
    action_type: 'BATCH_CREATE' | 'STEP_SIGN' | 'DEVIATION_LOG' | 'SYSTEM_OVERRIDE' | 'DEPLOYMENT';
    payload: any;
}

@Injectable()
export class DoubleSigService {
    constructor(private ledgerService: LedgerService) { }

    async createPendingAction(dto: CreatePendingActionDto) {
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL
        const id = uuidv4();

        try {
            await pool.query(
                `INSERT INTO pending_actions 
        (id, initiator_id, action_type, payload, expires_at)
        VALUES ($1, $2, $3, $4, $5)`,
                [id, dto.initiator_id, dto.action_type, JSON.stringify(dto.payload), expiresAt]
            );

            log.info(`DoubleSig: Pending action created. ID: ${id}`);
            return { id, status: 'PENDING', expiresAt };
        } catch (e) {
            log.error('DoubleSig: Failed to create pending action', { error: e });
            throw e;
        }
    }

    async approveAction(actionId: string, approverId: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Fetch the action
            const res = await client.query('SELECT * FROM pending_actions WHERE id = $1', [actionId]);
            if (res.rows.length === 0) throw new Error('Action not found');

            const action = res.rows[0];

            if (action.status !== 'PENDING') throw new Error('Action is not pending');
            if (Date.now() > parseInt(action.expires_at)) throw new Error('Action expired');
            if (action.initiator_id === approverId) throw new Error('Initiator cannot approve their own action');

            // 2. Update status
            await client.query(
                `UPDATE pending_actions 
         SET status = 'APPROVED', current_signatures = current_signatures + 1 
         WHERE id = $1`,
                [actionId]
            );

            // 3. Execute to Ledger
            await this.ledgerService.recordEvent({
                action_type: action.action_type,
                actor_id: action.initiator_id,
                secondary_actor_id: approverId,
                payload: action.payload
            });

            await client.query('COMMIT');
            log.audit(`DoubleSig: Action approved and executed. ID: ${actionId}`, {
                actor: approverId,
                action: 'APPROVE_PENDING_ACTION',
                actionId,
                originalActionType: action.action_type
            });

            return { status: 'APPROVED', executed: true };

        } catch (e) {
            await client.query('ROLLBACK');
            log.error('DoubleSig: Approval failed', { error: e });
            throw e;
        } finally {
            client.release();
        }
    }

    async getPendingActions() {
        const res = await pool.query("SELECT * FROM pending_actions WHERE status = 'PENDING' ORDER BY created_at DESC");
        return res.rows;
    }
}
