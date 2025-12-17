import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/**
 * SERVERLESS FUNCTION: Stripe Webhook Handler
 * 
 * This endpoint receives events from Stripe (payment success, failures, etc.)
 * and processes them accordingly. It's the source of truth for payment status.
 * 
 * IMPORTANT: You must configure this webhook URL in your Stripe Dashboard:
 * https://dashboard.stripe.com/webhooks
 */

// Stripe webhook signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
    api: {
        bodyParser: false, // Disable body parsing, need raw body for signature verification
    },
};

// Helper to get raw body
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            resolve(Buffer.from(data));
        });
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method not allowed' });
    }

    let event;

    try {
        // Get raw body for signature verification
        const rawBody = await getRawBody(req);
        const sig = req.headers['stripe-signature'];

        // Verify webhook signature
        if (webhookSecret) {
            try {
                event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
            } catch (err) {
                console.error('⚠️  Webhook signature verification failed:', err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        } else {
            // If no webhook secret (development), parse body directly
            event = JSON.parse(rawBody.toString());
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log('✅ Payment successful:', session.id);

                // Extract metadata with safe parsing helper
                const metadata = session.metadata || {};
                const safeParseInt = (val) => {
                    if (val === undefined || val === null || val === '') return 0;
                    const parsed = parseInt(val, 10);
                    return isNaN(parsed) ? 0 : parsed;
                };
                const safeParseFloat = (val) => {
                    if (val === undefined || val === null || val === '') return 0;
                    const parsed = parseFloat(val);
                    return isNaN(parsed) ? 0 : parsed;
                };

                // Log to Supabase
                try {
                    await supabase.from('payments').insert({
                        stripe_payment_id: session.id,
                        stripe_customer_email: session.customer_email,
                        amount: session.amount_total / 100, // Convert from cents
                        currency: session.currency,
                        plan_stats: {
                            totalDays: safeParseInt(metadata.plan_total_days),
                            efficiency: safeParseFloat(metadata.plan_efficiency),
                            ptoUsed: safeParseInt(metadata.plan_pto_used),
                        },
                        user_metadata: {
                            region: metadata.user_region || '',
                            strategy: metadata.user_strategy || '',
                            ptoDays: safeParseInt(metadata.user_pto_days),
                        },
                        status: 'completed',
                    });

                    console.log('✅ Payment logged to Supabase');
                } catch (dbError) {
                    console.error('❌ Failed to log payment to Supabase:', dbError);
                    // Don't fail the webhook if database logging fails
                }

                // TODO: Send confirmation email (optional)
                // TODO: Grant access to user (if you have user accounts)

                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object;
                console.log('⏰ Checkout session expired:', session.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.log('❌ Payment failed:', paymentIntent.id);

                // Log failed payment attempt
                try {
                    await supabase.from('payments').insert({
                        stripe_payment_id: paymentIntent.id,
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency,
                        status: 'failed',
                        error_message: paymentIntent.last_payment_error?.message,
                    });
                } catch (dbError) {
                    console.error('Failed to log failed payment:', dbError);
                }

                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object;
                console.log('💸 Refund processed:', charge.id);

                // Update payment status in database
                try {
                    await supabase
                        .from('payments')
                        .update({ status: 'refunded' })
                        .eq('stripe_payment_id', charge.payment_intent);
                } catch (dbError) {
                    console.error('Failed to update refund status:', dbError);
                }

                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
}
