import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savedValue?: number; // Optional prop to show ROI
  userCountry?: string; // For dynamic pricing
  prefs?: UserPreferences;
  planStats?: {
      totalDays: number;
      efficiency: number;
      ptoUsed: number;
  };
}

// Pricing Logic Engine
export const getRegionalPrice = (countryName: string = '') => {
    const c = countryName.toLowerCase();
    
    if (c.includes('canada')) {
        return { amount: 6.99, currency: 'CAD', symbol: '$' };
    }
    if (c.includes('united kingdom') || c.includes('uk')) {
        return { amount: 3.99, currency: 'GBP', symbol: '£' };
    }
    if (c.includes('australia') || c.includes('au')) {
        return { amount: 7.99, currency: 'AUD', symbol: '$' };
    }
    // Default (US/International)
    return { amount: 4.99, currency: 'USD', symbol: '$' };
};

// Luhn Algorithm for basic card validation
const isValidLuhn = (val: string) => {
    let checksum = 0;
    let j = 1; 
    for (let i = val.length - 1; i >= 0; i--) {
      let calc = 0;
      calc = Number(val.charAt(i)) * j;
      if (calc > 9) {
        checksum = checksum + 1;
        calc = calc - 10;
      }
      checksum = checksum + calc;
      if (j === 1) {j = 2} else {j = 1};
    }
    return (checksum % 10) === 0;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess, 
    savedValue = 2400, 
    userCountry = '', 
    prefs, 
    planStats 
}) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const price = getRegionalPrice(userCountry);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Formatters
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanCard = cardNumber.replace(/\s/g, '');

    // 1. Basic Validation
    if (cleanCard.length < 16) {
      setError('Card number is incomplete.');
      setLoading(false);
      return;
    }

    // --- STRIPE DATABASE PAYLOAD PREPARATION ---
    // This object contains everything you need to save "without a database"
    // It will be attached to the Stripe Transaction itself.
    const orderMetadata = {
        plan_type: 'lifetime_access',
        user_country: userCountry || 'Global',
        estimated_roi: savedValue,
        // You can add more fields here: selected_strategy, pto_days, etc.
        selected_strategy: prefs?.strategy,
        pto_days: prefs?.ptoDays,
        stats_total_days: planStats?.totalDays,
        stats_efficiency: planStats?.efficiency
    };

    // 2. Stripe Test Card Simulation Rules
    const isTestCardSuccess = cleanCard === '4242424242424242';
    const isTestCardDecline = cleanCard === '4000056655665556' || cleanCard === '4000000000000002'; // Generic decline
    const isTestBalance = cleanCard === '4000000000000099'; // Insufficient funds

    // 3. Process
    try {
      /* 
       * PRODUCTION INTEGRATION (UNCOMMENT WHEN DEPLOYED):
       * 
       * const response = await fetch('/api/checkout', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({
       *     amount: price.amount,
       *     currency: price.currency,
       *     email: email,
       *     metadata: orderMetadata
       *   })
       * });
       * 
       * const { clientSecret } = await response.json();
       * const stripe = window.Stripe('pk_live_YOUR_KEY');
       * const { error } = await stripe.confirmCardPayment(clientSecret, {
       *   payment_method: { card: elements.getElement(CardElement) } // Requires <CardElement />
       * });
       */

      // Simulate Network Delay for Demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isTestCardDecline) {
          throw new Error("Your card was declined.");
      }
      if (isTestBalance) {
          throw new Error("Your card has insufficient funds.");
      }

      // If not a specific test failure card, run Luhn check for general validity
      if (!isTestCardSuccess && !isValidLuhn(cleanCard)) {
          throw new Error("Your card number is invalid.");
      }
      
      // Success
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Payment failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0F1014] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        
        {/* Header */}
        <div className="bg-[#18181b] p-6 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-lime-accent/50 animate-pulse"></div>
            
            {/* Social Proof Ticker */}
            <div className="absolute top-2 right-4 text-[9px] text-lime-accent/80 font-mono opacity-60">
                 Trusted by 10,000+ travelers
            </div>

            <div>
                <h3 className="text-xl font-display font-bold text-white mt-1">Unlock Full Plan</h3>
                <p className="text-xs text-slate-400 mt-1">One-time payment. Lifetime access.</p>
            </div>
            <div className="text-right z-10">
                <div className="text-2xl font-bold text-white">{price.symbol}{price.amount.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{price.currency}</div>
            </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* ROI Badge */}
            <div className="bg-lime-accent/10 border border-lime-accent/20 rounded-lg p-3 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-lime-accent flex items-center justify-center text-dark-900 font-bold text-xs">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                 </div>
                 <div>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Investment Return</p>
                     <p className="text-sm font-bold text-white">
                         You are saving <span className="text-lime-accent">${savedValue.toLocaleString()}</span> in vacation value.
                     </p>
                 </div>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-4 text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 justify-between">
                <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-lime-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span>Secure SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-lime-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Instant</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-lime-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Money-back</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#020617] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-lime-accent outline-none transition-colors placeholder-slate-600"
                    />
                </div>

                {/* Card Info */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Card Information</label>
                    <div className="bg-[#020617] border border-white/10 rounded-lg p-1 flex flex-col gap-1 focus-within:border-lime-accent transition-colors">
                        <div className="relative">
                            <input 
                                type="text"
                                required
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                placeholder="4242 4242 4242 4242"
                                className="w-full bg-transparent p-3 text-white outline-none placeholder-slate-700 font-mono"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 opacity-50">
                                <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"/></svg>
                            </div>
                        </div>
                        <div className="flex border-t border-white/10">
                            <input 
                                type="text"
                                required
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                maxLength={7}
                                placeholder="MM / YY"
                                className="w-1/2 bg-transparent p-3 text-white outline-none border-r border-white/10 placeholder-slate-700 font-mono"
                            />
                            <input 
                                type="text"
                                required
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g,''))}
                                maxLength={4}
                                placeholder="CVC"
                                className="w-1/2 bg-transparent p-3 text-white outline-none placeholder-slate-700 font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-300 text-xs text-center font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-up">
                    ⚠️ {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-lime-accent text-dark-900 font-bold text-lg rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-dark-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Processing secure payment...</span>
                    </>
                ) : (
                    <>
                       <span>Pay {price.symbol}{price.amount.toFixed(2)} & Unlock</span>
                       <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </>
                )}
            </button>
            
            <div className="flex items-center justify-center gap-2 opacity-60">
                 <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Secure Stripe Payment</div>
            </div>

        </form>
      </div>
    </div>
  );
};