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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Please add an email so we can send your receipt.');
      }

      // Redirect to hosted Stripe Checkout
      window.open('https://buy.stripe.com/14A7sN7KUbup5yQf4Y6Zy00', '_blank', 'noopener');

      // Immediately unlock the plan experience while checkout completes in the new tab
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
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
        <form onSubmit={handleCheckout} className="p-6 space-y-6">
            
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
                    <p className="text-xs text-slate-400 mt-2">We’ll use this to send your Stripe receipt.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-white font-semibold">Secure checkout via Stripe</p>
                    <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                        <li>You’ll be redirected to a hosted Stripe checkout page.</li>
                        <li>Complete payment there, then return to continue.</li>
                        <li>If checkout doesn’t open, please disable pop-up blockers.</li>
                    </ul>
                    <p className="text-xs text-lime-accent/80">Your plan will unlock here while Stripe handles the payment in the new tab.</p>
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
                        <span>Opening secure checkout...</span>
                    </>
                ) : (
                    <>
                       <span>Go to Stripe Checkout ({price.symbol}{price.amount.toFixed(2)})</span>
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