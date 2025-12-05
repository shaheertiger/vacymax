import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * SERVERLESS FUNCTION: Create Stripe Checkout Session
 * 
 * This creates a hosted Stripe Checkout page for secure payment processing.
 * After payment, Stripe will redirect back to your success URL.
 */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            email,
            amount,
            currency = 'usd',
            planStats,
            userPrefs
        } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Get the base URL for redirects
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: 'VacyMax - Full Vacation Plan',
                            description: `Unlock your complete vacation schedule with ${planStats?.totalDays || 0} days off`,
                            images: ['https://vacymax.com/og-image.svg'], // Update with your actual image
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer_email: email,
            success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}?payment=cancelled`,

            // Store plan data in metadata for webhook processing
            metadata: {
                product: 'vacymax_full_plan',
                plan_total_days: planStats?.totalDays?.toString() || '0',
                plan_efficiency: planStats?.efficiency?.toString() || '0',
                plan_pto_used: planStats?.ptoUsed?.toString() || '0',
                user_region: userPrefs?.region || '',
                user_strategy: userPrefs?.strategy || '',
                user_pto_days: userPrefs?.ptoDays?.toString() || '0',
            },

            // Enable automatic tax calculation (optional)
            // automatic_tax: { enabled: true },
        });

        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });
    } catch (err) {
        console.error('Stripe Checkout Error:', err);
        res.status(500).json({
            error: err.message || 'Failed to create checkout session'
        });
    }
}
