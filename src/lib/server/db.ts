import pg from 'pg';
const { Pool } = pg;
import { env } from '$env/dynamic/private';

// Strip query params like ?sslmode=require that conflict with the ssl object
const connectionString = env.DATABASE_URL.split('?')[0];

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
