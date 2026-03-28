import { query } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { alerts as mockAlerts, bills as mockBills } from '$lib/data';

export const load: PageServerLoad = async ({ parent }) => {
    const { user } = await parent();
    const targetUserId = user?.id; 

    if (!targetUserId) {
        return {
            alerts: mockAlerts,
            bills: mockBills
        };
    }

    try {
        const alertsRes = await query(
            'SELECT title, description, type, icon, action_label as action FROM financial_alerts WHERE user_id = $1 ORDER BY created_at DESC',
            [targetUserId]
        );

        const billsRes = await query(
            'SELECT category, due_date as date, amount, icon, color_token as color FROM bills WHERE user_id = $1 ORDER BY due_date ASC',
            [targetUserId]
        );

        return {
            alerts: alertsRes.rows.length > 0 ? alertsRes.rows : mockAlerts,
            bills: billsRes.rows.length > 0 ? billsRes.rows.map(b => ({
                ...b,
                date: new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                amount: parseFloat(b.amount)
            })) : mockBills
        };
    } catch (e) {
        console.error('DB Fetch Error in Finance:', e);
        return {
            alerts: mockAlerts,
            bills: mockBills
        };
    }
};
