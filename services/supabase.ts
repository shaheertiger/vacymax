// Supabase helpers for client-side tracking
// These make API calls to serverless functions that handle the actual Supabase operations

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
            await fetch('/api/analytics/log-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
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
            await fetch('/api/analytics/log-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (err) {
            console.error('Failed to log payment:', err);
        }
    },

    // Get analytics data
    async getAnalytics() {
        try {
            const response = await fetch('/api/analytics/get-analytics');
            if (!response.ok) return null;
            return await response.json();
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            return null;
        }
    },

    // Track user sessions
    async trackSession(sessionData: {
        userId?: string;
        userAgent: string;
        referrer: string;
    }) {
        try {
            await fetch('/api/analytics/log-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });
        } catch (err) {
            console.error('Failed to track session:', err);
        }
    },
};
