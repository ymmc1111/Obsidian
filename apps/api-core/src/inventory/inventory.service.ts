import { Injectable } from '@nestjs/common';
import { pool } from '@pocket-ops/database';
import { log } from '@pocket-ops/logger';

@Injectable()
export class InventoryService {
    async getAllItems() {
        try {
            const res = await pool.query('SELECT * FROM inventory_items ORDER BY nomenclature ASC');
            return res.rows;
        } catch (e) {
            log.error('InventoryService: Failed to fetch items', { error: e });
            throw e;
        }
    }

    async updateQuantity(id: string, delta: number) {
        try {
            const res = await pool.query(
                'UPDATE inventory_items SET quantity = quantity + $1, updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT WHERE id = $2 RETURNING *',
                [delta, id]
            );

            if (res.rows.length > 0) {
                log.info(`InventoryService: Updated quantity for item ${id}. Delta: ${delta}`);
                return res.rows[0];
            }
            throw new Error('Item not found');
        } catch (e) {
            log.error('InventoryService: Failed to update quantity', { error: e });
            throw e;
        }
    }
}
