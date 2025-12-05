# Supabase & Stripe Integration Guide

## Overview
This guide explains how to set up and use Supabase for analytics tracking and Stripe for payment processing in VacyMax.

## 🔐 Environment Variables

Your `.env` file has been configured with:

### Stripe (LIVE KEYS - Production)
- **Public Key**: `pk_live_51SaQdmPgKI4BZbGF...`
- **Secret Key**: `sk_live_51SaQdmPgKI4BZbGF...`

### Supabase
- **URL**: `https://zlzzbuevvivmvtggyzew.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANT**: Never commit the `.env` file to git. It's already added to `.gitignore`.

## 📊 Supabase Database Setup

### Step 1: Run the Schema
1. Go to your Supabase project: https://app.supabase.com/project/zlzzbuevvivmvtggyzew
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL script

This will create:
- **plan_generations** table - Tracks all vacation plans generated
- **payments** table - Tracks successful Stripe payments
- **sessions** table - Tracks user sessions for analytics
- **analytics_summary** view - Aggregated plan generation stats
- **payment_analytics** view - Revenue and payment analytics

### Step 2: Verify Tables
Go to **Table Editor** in Supabase and verify these tables exist:
- ✅ plan_generations
- ✅ payments
- ✅ sessions

## 🔌 Using Supabase in Your Code

### Import the Client
```typescript
import { supabase, supabaseHelpers } from './services/supabase';
```

### Track Plan Generation
Add this to your results generation logic (e.g., in `App.tsx` after plan is generated):

```typescript
// After generating a vacation plan
supabaseHelpers.logPlanGeneration({
  ptoUsed: result.totalPtoUsed,
  totalDaysOff: result.totalDaysOff,
  monetaryValue: result.totalValueRecovered,
  region: prefs.region,
  strategy: prefs.strategy,
});
```

### Track Payments
Add this to your payment success handler (e.g., in `PaymentModal.tsx`):

```typescript
// After successful Stripe payment
supabaseHelpers.logPayment({
  stripePaymentId: paymentIntent.id,
  amount: price.amount,
  currency: price.currency,
  planStats: {
    totalDays: planStats.totalDays,
    efficiency: planStats.efficiency,
    ptoUsed: planStats.ptoUsed,
  },
});
```

### Track User Sessions (Optional)
Add this to your app initialization (e.g., in `index.tsx` or `App.tsx`):

```typescript
// On app load
useEffect(() => {
  supabaseHelpers.trackSession({
    userAgent: navigator.userAgent,
    referrer: document.referrer,
  });
}, []);
```

## 💳 Stripe Integration

Your Stripe keys are already configured. The current implementation uses:
- **Frontend**: `process.env.STRIPE_PUBLIC_KEY` (already in use)
- **Backend**: Secret key should be used in your Vercel serverless functions

### Verify Stripe Configuration
Check `components/PaymentModal.tsx` - it should already be using the public key from environment variables.

## 📈 Analytics Dashboard (Future Enhancement)

You can create an admin dashboard to view analytics:

```typescript
// Get analytics data
const analytics = await supabaseHelpers.getAnalytics();

// Query custom data
const { data } = await supabase
  .from('analytics_summary')
  .select('*')
  .gte('date', '2025-01-01');
```

## 🚀 Next Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Test Locally**:
   ```bash
   npm run dev
   ```

3. **Integrate Tracking**:
   - Add `supabaseHelpers.logPlanGeneration()` to results generation
   - Add `supabaseHelpers.logPayment()` to payment success handler
   - (Optional) Add `supabaseHelpers.trackSession()` to app initialization

4. **Deploy**:
   - Ensure `.env` variables are set in Vercel
   - Deploy and test in production

## 🔒 Security Notes

- ✅ `.env` is in `.gitignore` - credentials won't be committed
- ✅ Supabase RLS (Row Level Security) is enabled
- ✅ Using Stripe's secure checkout flow
- ⚠️ **Never expose the Stripe Secret Key in frontend code**
- ⚠️ The Supabase Anon Key is safe to expose (it's public-facing)

## 📝 Database Schema Reference

### plan_generations
- `id` (UUID) - Primary key
- `user_id` (TEXT) - Optional user identifier
- `pto_used` (INTEGER) - PTO days used
- `total_days_off` (INTEGER) - Total vacation days
- `monetary_value` (DECIMAL) - Value recovered
- `region` (TEXT) - User's region
- `strategy` (TEXT) - Selected strategy
- `created_at` (TIMESTAMP) - When plan was generated

### payments
- `id` (UUID) - Primary key
- `user_id` (TEXT) - Optional user identifier
- `stripe_payment_id` (TEXT) - Stripe payment intent ID
- `amount` (DECIMAL) - Payment amount
- `currency` (TEXT) - Currency code
- `plan_stats` (JSONB) - Plan statistics
- `created_at` (TIMESTAMP) - When payment was made

### sessions
- `id` (UUID) - Primary key
- `user_id` (TEXT) - Optional user identifier
- `user_agent` (TEXT) - Browser user agent
- `referrer` (TEXT) - Referrer URL
- `created_at` (TIMESTAMP) - Session start time

## 🆘 Troubleshooting

### "Supabase credentials not found"
- Check that `.env` file exists
- Verify environment variables are loaded in `vite.config.ts`
- Restart dev server after changing `.env`

### Database connection errors
- Verify Supabase URL and Anon Key are correct
- Check Supabase project is active
- Verify RLS policies allow operations

### Stripe payment issues
- Ensure using LIVE keys for production
- Test with Stripe test cards first
- Check Stripe dashboard for error logs

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [VacyMax GitHub](https://github.com/yourusername/vacymax)
