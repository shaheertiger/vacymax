# 🚀 Live Stripe Deployment Guide

## Overview
This guide will help you deploy VacyMax with **real Stripe payments** in production mode.

---

## 📋 Prerequisites

✅ Stripe account with LIVE keys  
✅ Vercel account (for hosting)  
✅ Supabase project (for analytics)  
✅ Domain name (optional but recommended)

---

## 🔐 Step 1: Configure Environment Variables

### Local Development (.env)
Your `.env` file is already configured with:
```bash
STRIPE_SECRET_KEY=sk_live_51SaQdmPgKI4BZbGF...
STRIPE_PUBLIC_KEY=pk_live_51SaQdmPgKI4BZbGF...
SUPABASE_URL=https://zlzzbuevvivmvtggyzew.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NODE_ENV=production
```

### Vercel Production Environment
You need to add these same variables to Vercel:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add each variable:
   - `STRIPE_SECRET_KEY` = `sk_live_51SaQdmPgKI4BZbGF...`
   - `STRIPE_PUBLIC_KEY` = `pk_live_51SaQdmPgKI4BZbGF...`
   - `STRIPE_WEBHOOK_SECRET` = (Get this in Step 3)
   - `SUPABASE_URL` = `https://zlzzbuevvivmvtggyzew.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - `NODE_ENV` = `production`

---

## 🗄️ Step 2: Set Up Supabase Database

### Run the Updated Schema
1. Go to: https://app.supabase.com/project/zlzzbuevvivmvtggyzew/sql
2. Copy the **entire** contents of `supabase-schema.sql`
3. Paste and click **Run**

This creates:
- ✅ `plan_generations` table
- ✅ `payments` table (with status tracking)
- ✅ `sessions` table
- ✅ Analytics views

### Verify Tables
Go to **Table Editor** and confirm you see:
- `plan_generations`
- `payments`
- `sessions`

---

## 🔗 Step 3: Configure Stripe Webhooks

### Get Your Webhook URL
After deploying to Vercel, your webhook URL will be:
```
https://your-domain.vercel.app/api/stripe-webhook
```

### Add Webhook in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/stripe-webhook`
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Click **Add endpoint**

### Get Webhook Secret
1. After creating the webhook, click on it
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 📦 Step 4: Deploy to Vercel

### Option A: Deploy via Git (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add live Stripe integration"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Vite
   - Click **Deploy**

3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from Step 1
   - Redeploy

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🧪 Step 5: Test the Payment Flow

### Test in Production

1. **Visit your live site:**
   ```
   https://your-domain.vercel.app
   ```

2. **Generate a vacation plan:**
   - Fill out the wizard
   - Click "Analyze"
   - View your results

3. **Test payment:**
   - Click "Unlock Full Schedule"
   - Enter email
   - Click "Go to Stripe Checkout"
   - Use a **test card** first:
     - Card: `4242 4242 4242 4242`
     - Expiry: Any future date
     - CVC: Any 3 digits
     - ZIP: Any 5 digits

4. **Verify success:**
   - You should be redirected back with success message
   - Plan should be unlocked
   - Check Supabase `payments` table for the entry

### Test with Real Card (Small Amount)

Once test card works:
1. Use a real card with a small amount
2. Verify payment in Stripe Dashboard
3. Verify entry in Supabase
4. Request a refund to test refund flow

---

## 📊 Step 6: Monitor & Analytics

### Stripe Dashboard
Monitor payments at: https://dashboard.stripe.com/payments

### Supabase Analytics
Query your data:

```sql
-- Today's revenue
SELECT SUM(amount) as revenue, currency 
FROM payments 
WHERE created_at::date = CURRENT_DATE 
  AND status = 'completed'
GROUP BY currency;

-- Conversion rate
SELECT 
  (SELECT COUNT(*) FROM payments WHERE status = 'completed') * 100.0 / 
  (SELECT COUNT(*) FROM plan_generations) as conversion_rate;

-- Failed payments
SELECT * FROM payments 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

---

## 🔒 Security Checklist

Before going live, verify:

- ✅ `.env` is in `.gitignore` (it is)
- ✅ Using LIVE Stripe keys (not test keys)
- ✅ Webhook signature verification enabled
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Supabase RLS policies configured
- ✅ No sensitive keys in frontend code
- ✅ CORS configured correctly

---

## 🚨 Troubleshooting

### Payment Not Working

**Check:**
1. Stripe keys are correct in Vercel
2. Webhook is configured and active
3. Browser console for errors
4. Vercel function logs: `vercel logs`
5. Stripe Dashboard → Developers → Events

### Webhook Not Receiving Events

**Check:**
1. Webhook URL is correct
2. Webhook secret is in Vercel env vars
3. Events are selected in Stripe
4. Check Stripe Dashboard → Webhooks → [Your webhook] → Attempts

### Database Not Logging

**Check:**
1. Supabase credentials are correct
2. Tables exist in Supabase
3. RLS policies allow inserts
4. Check Vercel function logs for errors

---

## 📈 Going Live Checklist

Before announcing to users:

- [ ] Test payment flow end-to-end
- [ ] Test refund flow
- [ ] Verify webhook is receiving events
- [ ] Check Supabase is logging correctly
- [ ] Test on mobile devices
- [ ] Verify email receipts are sent
- [ ] Set up monitoring/alerts
- [ ] Prepare customer support email
- [ ] Review Stripe's best practices
- [ ] Test with different currencies
- [ ] Verify success/cancel redirects work

---

## 🎯 API Endpoints

Your deployed app will have these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/create-checkout-session` | POST | Creates Stripe checkout session |
| `/api/stripe-webhook` | POST | Receives Stripe events |
| `/api/checkout` | POST | Legacy payment intent (can remove) |

---

## 💰 Pricing Configuration

Current pricing (in `PaymentModal.tsx`):
- 🇺🇸 USA: $4.99 USD
- 🇨🇦 Canada: $6.99 CAD
- 🇬🇧 UK: £3.99 GBP
- 🇦🇺 Australia: $7.99 AUD

To change pricing, edit `getRegionalPrice()` in `PaymentModal.tsx`.

---

## 📧 Customer Support

### Handling Refunds
1. Go to Stripe Dashboard → Payments
2. Find the payment
3. Click "Refund"
4. Webhook will automatically update Supabase

### Viewing Customer Data
```sql
-- Find payment by email
SELECT * FROM payments 
WHERE stripe_customer_email = 'customer@example.com';

-- View customer's plan
SELECT pg.*, p.amount, p.currency 
FROM plan_generations pg
LEFT JOIN payments p ON p.created_at::date = pg.created_at::date
WHERE p.stripe_customer_email = 'customer@example.com';
```

---

## 🔄 Updating After Deployment

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main

# Vercel will auto-deploy
# Or manually: vercel --prod
```

---

## 📞 Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Support**: https://support.stripe.com

---

## ✅ Deployment Complete!

Your VacyMax app is now live with:
- ✅ Real Stripe payments
- ✅ Automatic payment tracking
- ✅ Webhook event handling
- ✅ Analytics in Supabase
- ✅ Production-ready security

**Next**: Monitor your first real payments and iterate based on user feedback! 🎉
