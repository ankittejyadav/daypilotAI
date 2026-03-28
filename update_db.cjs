const { Pool } = require('pg');
const fs = require('fs');

async function updateDb() {
    const env = fs.readFileSync('.env', 'utf-8');
    const dbUrlLine = env.split('\n').find(l => l.startsWith('DATABASE_URL='));
    const dbUrl = dbUrlLine.split('=')[1].trim();

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding username and password_hash columns to users table...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;');
        console.log('Successfully updated database.');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await pool.end();
    }
}

updateDb();
