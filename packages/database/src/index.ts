import { Pool } from 'pg';

export const DB_CONFIG = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'pocket_ops',
};

export const pool = new Pool(DB_CONFIG);

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const getClient = () => pool.connect();
