import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ptoUsed, totalDaysOff, monetaryValue, region, strategy, userId } = req.body;

        const { error } = await supabase
            .from('plan_generations')
            .insert({
                user_id: userId || null,
                pto_used: ptoUsed,
                total_days_off: totalDaysOff,
                monetary_value: monetaryValue,
                region,
                strategy,
            });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to log plan' });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
