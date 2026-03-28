import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Handle ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

const connectionString = (process.env.DATABASE_URL || '').split('?')[0];

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    try {
        console.log('🚀 Starting Database Seeding...');

        // 1. Initialize Tables
        const schema = fs.readFileSync(path.resolve('schema.sql'), 'utf-8');
        await pool.query(schema);
        console.log('✅ Tables initialized.');

        // 2. Create Demo User
        const userRes = await pool.query(`
            INSERT INTO users (name, email)
            VALUES ('Demo User', 'demo@daypilot-ai.com')
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        `);
        const userId = userRes.rows[0].id;
        console.log(`✅ Demo User active (ID: ${userId})`);

        // 3. Import Mock Data
        // Since we can't easily import from ../src/lib/data.ts due to being a script,
        // we'll define the core demo data here for stability.
        
        // Insights
        const insights = [
            { category: "Email", title: "1 Urgent Commitment", description: "Follow up with the Design Team regarding the Q3 proposal.", icon: "mail", status: "Pending since 8:45 AM", type: "primary" },
            { category: "Calendar", title: "Next: Project Sync", description: "10:00 AM • Room 402. All prep materials are synchronized.", icon: "calendar_today", status: "Starting in 45 mins", type: "secondary" },
            { category: "Finance", title: "Upcoming Bill: $150", description: "Adobe Creative Cloud subscription due tomorrow.", icon: "payments", status: "Auto-pay enabled", type: "tertiary" },
            { category: "Tasks", title: "2 Reminders Today", description: "Call the pharmacy and update Jira sprint board.", icon: "task_alt", status: "High Priority", type: "error" }
        ];

        for (const i of insights) {
            await pool.query(`
                INSERT INTO insights (user_id, category, title, description, icon, status_text, priority_level)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [userId, i.category, i.title, i.description, i.icon, i.status, i.type]);
        }
        console.log(`✅ ${insights.length} Insights seeded.`);

        // Tasks
        const tasks = [
            { title: "Call Pharmacy", priority: "High", due: new Date(), status: "pending", category: "Personal" },
            { title: "Update Jira Sprint Board", priority: "Medium", due: new Date(), status: "pending", category: "Work" },
            { title: "Project Sync Prep", priority: "High", due: new Date(), status: "done", category: "Work" }
        ];

        for (const t of tasks) {
            await pool.query(`
                INSERT INTO tasks (user_id, title, priority, due_datetime, status, category)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, t.title, t.priority, t.due, t.status, t.category]);
        }
        console.log(`✅ ${tasks.length} Tasks seeded.`);

        // Bills
        const bills = [
            { category: "Utilities", amount: 142.10, date: '2026-03-24', icon: "bolt", color: "primary" },
            { category: "Internet", amount: 89.00, date: '2026-03-28', icon: "wifi", color: "tertiary-fixed" }
        ];

        for (const b of bills) {
            await pool.query(`
                INSERT INTO bills (user_id, category, due_date, amount, icon, color_token)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, b.category, b.date, b.amount, b.icon, b.color]);
        }
        console.log(`✅ ${bills.length} Bills seeded.`);

        // Calendar Events
        const events = [
            { title: "Project Sync", start: new Date(Date.now() + 3600000), location: "Room 402", description: "Weekly architecture review.", isUrgent: true },
            { title: "Design Review", start: new Date(Date.now() + 7200000), location: "Figma Link", description: "Reviewing the new editorial layout.", isUrgent: false }
        ];

        for (const e of events) {
            await pool.query(`
                INSERT INTO calendar_events (user_id, title, start_time, location, ai_context, is_urgent)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, e.title, e.start, e.location, e.description, e.isUrgent]);
        }
        console.log(`✅ ${events.length} Calendar Events seeded.`);

        console.log('🎉 SEEDING COMPLETE!');
        await pool.end();
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
}

seed();
