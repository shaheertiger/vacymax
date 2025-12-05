import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// Helper functions for common operations
export const supabaseHelpers = {
    // Track user plan generation
    async logPlanGeneration(data: {
        userId?: string;
        ptoUsed: number;
        totalDaysOff: number;
        monetaryValue: number;
        region: string;
        strategy: string;
    }) {
        try {
            const { error } = await supabase
                .from('plan_generations')
                .insert({
                    user_id: data.userId || null,
                    pto_used: data.ptoUsed,
                    total_days_off: data.totalDaysOff,
                    monetary_value: data.monetaryValue,
                    region: data.region,
                    strategy: data.strategy,
                    created_at: new Date().toISOString(),
                });

            if (error) console.error('Error logging plan generation:', error);
        } catch (err) {
            console.error('Failed to log plan generation:', err);
        }
    },

    // Track successful payments
    async logPayment(data: {
        userId?: string;
        stripePaymentId: string;
        amount: number;
        currency: string;
        planStats: any;
    }) {
        try {
            const { error } = await supabase
                .from('payments')
                .insert({
                    user_id: data.userId || null,
                    stripe_payment_id: data.stripePaymentId,
                    amount: data.amount,
                    currency: data.currency,
                    plan_stats: data.planStats,
                    created_at: new Date().toISOString(),
                });

            if (error) console.error('Error logging payment:', error);
        } catch (err) {
            console.error('Failed to log payment:', err);
        }
    },

    // Get analytics data
    async getAnalytics() {
        try {
            const { data, error } = await supabase
                .from('plan_generations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Error fetching analytics:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            return null;
        }
    },

    // Track user sessions (optional)
    async trackSession(sessionData: {
        userId?: string;
        userAgent: string;
        referrer: string;
    }) {
        try {
            const { error } = await supabase
                .from('sessions')
                .insert({
                    user_id: sessionData.userId || null,
                    user_agent: sessionData.userAgent,
                    referrer: sessionData.referrer,
                    created_at: new Date().toISOString(),
                });

            if (error) console.error('Error tracking session:', error);
        } catch (err) {
            console.error('Failed to track session:', err);
        }
    },
};
