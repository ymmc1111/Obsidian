import mqtt from 'mqtt';
import { Pool } from 'pg';
import { WebSocketServer } from 'ws';
import { log } from '@pocket-ops/logger';

// Database connection
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'pocket_ops_telemetry',
});

// Initialize TimescaleDB hypertable
async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE EXTENSION IF NOT EXISTS timescaledb;
      
      CREATE TABLE IF NOT EXISTS machine_telemetry (
        time TIMESTAMPTZ NOT NULL,
        machine_id TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        unit TEXT,
        metadata JSONB
      );
      
      SELECT create_hypertable('machine_telemetry', 'time', if_not_exists => TRUE);
      
      CREATE INDEX IF NOT EXISTS idx_machine_metric ON machine_telemetry (machine_id, metric_name, time DESC);
    `);
        log.info('TimescaleDB initialized');
    } finally {
        client.release();
    }
}

// MQTT Client
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883');

mqttClient.on('connect', () => {
    log.info('Connected to MQTT broker');
    mqttClient.subscribe('factory/+/telemetry', (err) => {
        if (err) {
            log.error('MQTT subscription failed', { error: err });
        } else {
            log.info('Subscribed to factory/+/telemetry');
        }
    });
});

// WebSocket Server for real-time streaming
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<any>();

wss.on('connection', (ws) => {
    clients.add(ws);
    log.info('WebSocket client connected', { total: clients.size });

    ws.on('close', () => {
        clients.delete(ws);
        log.info('WebSocket client disconnected', { total: clients.size });
    });
});

function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
}

// Process MQTT messages
mqttClient.on('message', async (topic, message) => {
    try {
        const parts = topic.split('/');
        const machineId = parts[1];
        const payload = JSON.parse(message.toString());

        log.debug('Telemetry received', { machineId, payload });

        // Store in TimescaleDB
        for (const [metricName, value] of Object.entries(payload.metrics || {})) {
            await pool.query(
                `INSERT INTO machine_telemetry (time, machine_id, metric_name, value, unit, metadata)
         VALUES (NOW(), $1, $2, $3, $4, $5)`,
                [machineId, metricName, value, payload.unit || null, JSON.stringify(payload.metadata || {})]
            );
        }

        // Broadcast to WebSocket clients
        broadcast({
            type: 'telemetry',
            machineId,
            timestamp: new Date().toISOString(),
            data: payload,
        });
    } catch (err) {
        log.error('Failed to process telemetry', { error: err });
    }
});

async function main() {
    await initDatabase();
    log.info('Telemetry service started', {
        mqtt: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
        ws: 'ws://localhost:8080'
    });
}

main().catch((err) => {
    log.error('Fatal error', { error: err });
    process.exit(1);
});
