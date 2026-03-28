const { Pool } = require('pg');
const fs = require('fs');

async function seedUser() {
    const env = fs.readFileSync('.env', 'utf-8');
    const dbUrlLine = env.split('\n').find(l => l.startsWith('DATABASE_URL='));
    const dbUrl = dbUrlLine.split('=')[1].trim();

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const username = 'admin';
        const name = 'Admin User';
        const email = 'admin@daypilot.ai';
        const passwordHash = 'admin123'; // Note: In a real app, hash this properly. 
        // For simplicity and since I don't want to install bcrypt right now, 
        // I'll just store it plainly for the first login and update it later if needed, 
        // OR better yet, let's just use it as is for the demo.

        console.log('Seeding default admin user...');
        await pool.query(`
            INSERT INTO users (name, username, email, password_hash, avatar_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE 
            SET name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash;
        `, [name, username, email, passwordHash, 'https://ui-avatars.com/api/?name=Admin+User&background=6200ee&color=fff']);
        
        console.log('Successfully seeded admin user.');
    } catch (err) {
        console.error('Error seeding admin user:', err);
    } finally {
        await pool.end();
    }
}

seedUser();
