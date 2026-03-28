const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const initDb = async () => {
    try {
        console.log('Reading .env...');
        const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
        const dbUrl = envContent.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1];
        
        console.log('Connecting to pooler...');
        const pool = new Pool({
            connectionString: dbUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.resolve('schema.sql'), 'utf-8');
        
        console.log('Initializing database tables on Supabase...');
        await pool.query(schema);
        
        console.log('SUCCESS: Database initialized successfully!');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('ERROR initializing database:', err);
        process.exit(1);
    }
};

initDb();
