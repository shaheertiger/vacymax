import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * SERVERLESS FUNCTION: Stripe Payment Intent
 * 
 * This function acts as your "Invisible Backend".
 * It receives the order details from the frontend and creates a secure PaymentIntent.
 * It stores the user's plan details in the 'metadata' field, treating Stripe as the database.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, email, metadata } = req.body;

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents (e.g. $10.00 = 1000)
      currency: currency || 'usd',
      receipt_email: email,
      
      // THE "NO-DATABASE" MAGIC:
      // We store all essential order info right here in the transaction.
      metadata: {
        ...metadata,
        order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: 'VacationMax Lifetime Plan',
        environment: process.env.NODE_ENV || 'development'
      },
      
      // Enable modern payment methods (Apple Pay, Google Pay, Cards)
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the secret to the client so they can finish the payment
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: err.message });
  }
}