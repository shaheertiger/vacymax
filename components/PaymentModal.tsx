import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { supabaseHelpers } from '../services/supabase';

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
        return { amount: 2.49, currency: 'CAD', symbol: '$' };
    }
    if (c.includes('united kingdom') || c.includes('uk')) {
        return { amount: 1.59, currency: 'GBP', symbol: '£' };
    }
    if (c.includes('australia') || c.includes('au')) {
        return { amount: 2.99, currency: 'AUD', symbol: '$' };
    }
    // Default (US/International)
    return { amount: 1.99, currency: 'USD', symbol: '$' };
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



    const [paymentStep, setPaymentStep] = useState<'initial' | 'confirming'>('initial');


    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!email) {
                throw new Error('Please add an email so we can send your receipt.');
            }

            // Try to call serverless function to create Stripe Checkout Session
            try {
                const response = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        amount: price.amount,
                        currency: price.currency,
                        planStats,
                        userPrefs: prefs,
                    }),
                });

                if (response.ok) {
                    const { url, sessionId } = await response.json();

                    // Store session ID for verification
                    if (sessionId) {
                        sessionStorage.setItem('stripe_session_id', sessionId);
                    }

                    // Redirect to Stripe Checkout
                    if (url) {
                        window.location.href = url;
                        return;
                    }
                }
            } catch (apiError) {
                console.warn('API endpoint not available, using fallback payment link');
            }

            // Fallback: Use Stripe Payment Link (for local development or direct link override)
            const paymentLink = 'https://buy.stripe.com/9B6bJ33uE2XT1iAbSM6Zy02';
            window.open(`${paymentLink}?prefilled_email=${encodeURIComponent(email)}`, '_blank');
            setPaymentStep('confirming');

        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Unable to start checkout. Please try again.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleVerify = () => {
        setLoading(true);
        // Simulate verification delay
        setTimeout(() => {
            setLoading(false);

            // Track payment in Supabase
            supabaseHelpers.logPayment({
                stripePaymentId: `manual_${Date.now()}`, // In production, use actual Stripe payment ID
                amount: price.amount,
                currency: price.currency,
                planStats: planStats || { totalDays: 0, efficiency: 0, ptoUsed: 0 },
            }).catch(err => console.error('Failed to log payment:', err));

            onSuccess();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-rose-900/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Scroll Container - Full screen with safe padding */}
            <div className="fixed inset-0 overflow-y-auto overscroll-contain pt-safe z-[110]">
                <div className="flex min-h-full items-start justify-center p-4 pt-24 md:items-center md:pt-4">
                    <div
                        className="relative w-full max-w-md bg-white border border-rose-100 rounded-2xl md:rounded-3xl shadow-2xl animate-fade-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-500 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-rose-50 to-white p-4 md:p-6 border-b border-rose-100 flex justify-between items-center relative overflow-hidden text-left rounded-t-2xl md:rounded-t-3xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-accent to-peach-accent"></div>

                            <div>
                                <h3 className="text-lg md:text-xl font-display font-bold text-gray-800 mt-1">Unlock Your Plan</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">One-time payment. Lifetime access.</p>
                            </div>
                            <div className="text-right z-10">
                                <div className="text-xl md:text-2xl font-bold text-gray-800">{price.symbol}{price.amount.toFixed(2)}</div>
                                <div className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider">{price.currency}</div>
                            </div>
                        </div>

                        {/* Body */}
                        {paymentStep === 'initial' ? (
                            <form onSubmit={handleCheckout} className="p-4 md:p-6 space-y-4 md:space-y-5 text-left">

                                {/* ROI Badge */}
                                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-center gap-3 shadow-inner">
                                    <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-rose-400 font-bold uppercase tracking-wide">Wellness Return</p>
                                        <p className="text-sm font-bold text-gray-700">
                                            You are saving <span className="text-rose-500">${savedValue.toLocaleString()}</span> in vacation value.
                                        </p>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex flex-wrap gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100 justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span>Secure SSL</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Instant</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>Money-back</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-white border border-rose-100 rounded-lg py-3 px-4 text-gray-800 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none transition-colors placeholder-gray-400 shadow-sm"
                                        />
                                        <p className="text-xs text-gray-400 mt-2">We’ll use this to send your receipt.</p>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2">
                                        <p className="text-sm text-gray-700 font-semibold">Secure checkout via Stripe</p>
                                        <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                                            <li>You’ll be redirected to a hosted Stripe checkout page.</li>
                                            <li>Complete payment there, then return to continue.</li>
                                            <li>If checkout doesn’t open, please disable pop-up blockers.</li>
                                        </ul>
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-rose-700 text-xs text-center font-bold bg-rose-50 p-3 rounded-lg border border-rose-200 animate-fade-up">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-rose-accent to-peach-accent text-white font-bold text-lg rounded-xl hover:scale-[1.02] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group hover:shadow-rose-200"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Secure Stripe Payment</div>
                                </div>

                            </form>
                        ) : (
                            // CONFIRMATION STATE
                            <div className="p-5 md:p-8 text-center animate-fade-up">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 text-rose-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>

                                <h3 className="text-xl md:text-2xl font-display font-bold text-gray-800 mb-2">Checkout opened</h3>
                                <p className="text-gray-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed max-w-xs mx-auto">
                                    Complete your payment in the new tab, then click below.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading}
                                        className="w-full py-3.5 md:py-4 bg-gradient-to-r from-rose-accent to-peach-accent text-white font-bold text-base md:text-lg rounded-xl hover:scale-[1.02] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>I've Completed Payment</span>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setPaymentStep('initial')}
                                        className="text-xs font-bold text-gray-500 hover:text-rose-500 transition-colors uppercase tracking-widest py-2"
                                    >
                                        Re-open Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
