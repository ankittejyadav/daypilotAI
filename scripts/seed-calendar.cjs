const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const seedCalendar = async () => {
    try {
        console.log('Reading .env...');
        const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
        const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
        if (!dbUrlLine) throw new Error('DATABASE_URL not found in .env');
        const dbUrl = dbUrlLine.split('=')[1].replace(/"/g, '').trim();
        
        console.log('Connecting to database...');
        const pool = new Pool({
            connectionString: dbUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });

        // Ensure user exists (Demo User)
        console.log('Ensuring Demo User exists...');
        const userRes = await pool.query(`
            INSERT INTO users (name, email)
            VALUES ('Demo User', 'demo@daypilot.ai')
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        `);
        const userId = userRes.rows[0].id;

        console.log('Clearing existing calendar events for demo user...');
        await pool.query('DELETE FROM calendar_events WHERE user_id = $1', [userId]);

        console.log('Seeding calendar events...');
        const events = [
            {
                title: 'Q3 Product Strategy Sync',
                start_time: new Date(new Date().setHours(10, 0, 0, 0)),
                location: 'Room 402 / Zoom',
                zoom_id: '882-192-441',
                ai_context: 'Focusing on the new "Editorial" look for the dashboard. Reviewing mobile navigation patterns.',
                needs_prep: true,
                is_urgent: true
            },
            {
                title: 'Design Team Weekly',
                start_time: new Date(new Date().setHours(13, 30, 0, 0)),
                location: 'Design Studio',
                zoom_id: '',
                ai_context: 'Weekly design critique and sprint planning.',
                needs_prep: false,
                is_urgent: false
            },
            {
                title: 'Marketing Brainstorm',
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                location: 'Creative Suite',
                zoom_id: '123-456-789',
                ai_context: 'Brainstorming session for the Q4 launch campaign.',
                needs_prep: true,
                is_urgent: false
            },
            {
                title: 'Weekly Wrap-up',
                start_time: new Date(new Date().setHours(17, 0, 0, 0)),
                location: 'Common Area',
                zoom_id: '',
                ai_context: 'General project updates and social time.',
                needs_prep: false,
                is_urgent: false
            }
        ];

        for (const event of events) {
            await pool.query(`
                INSERT INTO calendar_events (user_id, title, start_time, location, zoom_id, ai_context, needs_prep, is_urgent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [userId, event.title, event.start_time, event.location, event.zoom_id, event.ai_context, event.needs_prep, event.is_urgent]);
        }

        console.log('SUCCESS: Calendar seeded successfully with demo data!');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('ERROR seeding calendar:', err);
        process.exit(1);
    }
};

seedCalendar();
